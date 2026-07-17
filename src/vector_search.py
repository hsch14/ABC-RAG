"""벡터 검색 모듈.

onnxruntime + tokenizers로 all-MiniLM-L6-v2 모델을 직접 로드하여
HNSW 없이 코사인 유사도 기반 벡터 검색을 수행합니다.
가격/순위 필터 함수도 포함합니다.
"""

from pathlib import Path

import numpy as np
import onnxruntime as ort
import pandas as pd
from tokenizers import Tokenizer

# ── 프로젝트 및 데이터 경로 ────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
CSV_PATH = DATA_DIR / "yes24_it_mobile_bestsellers.csv"

# ── 모델 경로 ──────────────────────────────────────────────────────────────
MODEL_DIR = PROJECT_ROOT / "models" / "all-MiniLM-L6-v2" / "onnx"
TOKENIZER_PATH = MODEL_DIR / "tokenizer.json"
MODEL_PATH = MODEL_DIR / "model.onnx"

# ── 전역 캐시 ──────────────────────────────────────────────────────────────
_tokenizer: Tokenizer | None = None
_session: ort.InferenceSession | None = None
_books_df: pd.DataFrame | None = None
_book_embeddings: np.ndarray | None = None


def _load_model():
    """ONNX 모델과 토크나이저를 로드한다 (싱글톤)."""
    global _tokenizer, _session
    if _tokenizer is None:
        _tokenizer = Tokenizer.from_file(str(TOKENIZER_PATH))
        _tokenizer.enable_padding(length=128, pad_id=0)
        _tokenizer.enable_truncation(max_length=128)
    if _session is None:
        _session = ort.InferenceSession(str(MODEL_PATH))
    return _tokenizer, _session


def _embed(texts: list[str]) -> np.ndarray:
    """텍스트 목록의 임베딩을 계산한다. (평균 풀링 적용)"""
    tokenizer, session = _load_model()

    encodings = tokenizer.encode_batch(texts)
    input_ids = np.array([e.ids for e in encodings], dtype=np.int64)
    attention_mask = np.array([e.attention_mask for e in encodings], dtype=np.int64)
    token_type_ids = np.array([e.type_ids for e in encodings], dtype=np.int64)

    outputs = session.run(None, {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "token_type_ids": token_type_ids,
    })

    last_hidden_state = outputs[0]
    mask_expanded = attention_mask[:, :, np.newaxis].astype(np.float32)
    sum_embeddings = np.sum(last_hidden_state * mask_expanded, axis=1)
    sum_mask = np.clip(mask_expanded.sum(axis=1), a_min=1e-9, a_max=None)
    return (sum_embeddings / sum_mask).astype(np.float32)


def _load_books() -> pd.DataFrame:
    """CSV에서 도서 데이터를 로드한다."""
    global _books_df
    if _books_df is None:
        _books_df = pd.read_csv(CSV_PATH, encoding="utf-8-sig")
        _books_df["가격_숫자"] = (
            _books_df["가격"].astype(str).str.replace(",", "").astype(int)
        )
    return _books_df


def _compute_embeddings() -> np.ndarray:
    """모든 도서의 임베딩을 tsv 파일에서 로드하여 numpy 배열로 반환한다 (캐싱).

    Returns:
        도서 임베딩 행렬.
    """
    global _book_embeddings
    if _book_embeddings is not None:
        return _book_embeddings

    tsv_path = DATA_DIR / "embeddings.tsv"
    print(f"임베딩 로드 중: {tsv_path}")
    
    # pandas read_csv를 사용해 대용량 tsv를 신속하게 로드
    df_emb = pd.read_csv(tsv_path, sep="\t", header=None, dtype=np.float32)
    _book_embeddings = df_emb.values
    print(f"임베딩 로드 완료: {_book_embeddings.shape}")
    return _book_embeddings


def vector_search(query: str, top_n: int = 5) -> list[dict]:
    """코사인 유사도 기반 벡터 검색을 수행한다."""
    df = _load_books()
    embeddings = _compute_embeddings()
    query_embedding = _embed([query])

    norm = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norm = np.where(norm == 0, 1, norm)
    normalized = embeddings / norm

    q_norm = np.linalg.norm(query_embedding, axis=1, keepdims=True)
    q_norm = np.where(q_norm == 0, 1, q_norm)
    query_normalized = query_embedding / q_norm

    similarities = (normalized @ query_normalized.T).flatten()
    top_indices = similarities.argsort()[::-1][:top_n]

    results = []
    for idx in top_indices:
        sim = float(similarities[idx])
        if sim <= 0.0:
            continue
        row = df.iloc[idx]
        results.append(
            {
                "title": str(row["도서명"]),
                "author": str(row["저자"]),
                "publisher": str(row["출판사"]),
                "price": str(row["가격"]),
                "price_num": int(row["가격_숫자"]),
                "rank": int(row["순위"]),
                "link": str(row["링크"]),
                "similarity": round(sim, 3),
            }
        )
    return results


def filter_books_by_price(min_price: int = 0, max_price: int = 999999) -> list[dict]:
    """가격 범위로 도서를 필터링하고 가격 오름차순으로 정렬한다."""
    df = _load_books()
    mask = (df["가격_숫자"] >= min_price) & (df["가격_숫자"] <= max_price)
    filtered = df[mask].sort_values("가격_숫자", ascending=True)

    results = []
    for _, row in filtered.iterrows():
        results.append(
            {
                "title": str(row["도서명"]),
                "author": str(row["저자"]),
                "publisher": str(row["출판사"]),
                "price": str(row["가격"]),
                "price_num": int(row["가격_숫자"]),
                "rank": int(row["순위"]),
                "link": str(row["링크"]),
            }
        )
    return results


def filter_books_by_rank(min_rank: int = 1, max_rank: int = 1000) -> list[dict]:
    """순위(판매지수) 범위로 도서를 필터링하고 순위 오름차순으로 정렬한다."""
    df = _load_books()
    mask = (df["순위"] >= min_rank) & (df["순위"] <= max_rank)
    filtered = df[mask].sort_values("순위", ascending=True)

    results = []
    for _, row in filtered.iterrows():
        results.append(
            {
                "title": str(row["도서명"]),
                "author": str(row["저자"]),
                "publisher": str(row["출판사"]),
                "price": str(row["가격"]),
                "price_num": int(row["가격_숫자"]),
                "rank": int(row["순위"]),
                "link": str(row["링크"]),
            }
        )
    return results


def format_books_for_context(books: list[dict]) -> str:
    """도서 목록을 LLM 컨텍스트 문자열로 포맷팅한다."""
    if not books:
        return "검색된 도서가 없습니다."
    lines = []
    for book in books:
        sim_part = f", 유사도: {book['similarity']}" if "similarity" in book else ""
        lines.append(
            f"- [{book['title']}] (저자: {book['author']}, 출판사: {book['publisher']}, "
            f"가격: {book['price']}원, 순위: {book['rank']}{sim_part}) "
            f"링크: {book['link']}"
        )
    return "\n".join(lines)
