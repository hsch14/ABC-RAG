"""ChromaDB 벡터 데이터베이스 구축 스크립트.

CSV 데이터를 읽어 ChromaDB에 저장합니다.
ChromaDB 기본 임베딩 함수를 사용합니다.
"""

from pathlib import Path

import chromadb
import pandas as pd

# ── 경로 설정 ──────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
CSV_PATH = DATA_DIR / "yes24_it_mobile_bestsellers.csv"
CHROMA_DIR = DATA_DIR / "chroma_db"
COLLECTION_NAME = "yes24_books"


def build_database():
    """ChromaDB에 벡터 데이터베이스를 구축한다."""
    # 데이터 로드
    df = pd.read_csv(CSV_PATH, encoding="utf-8-sig")
    print(f"데이터 로드 완료: {len(df)}권")

    # ChromaDB 클라이언트 생성
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    # 기존 컬렉션이 있으면 삭제
    try:
        client.delete_collection(COLLECTION_NAME)
        print("기존 컬렉션 삭제 완료.")
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
    )

    # 배치 처리
    batch_size = 100
    total = len(df)

    for start in range(0, total, batch_size):
        end = min(start + batch_size, total)
        batch = df.iloc[start:end]

        ids = []
        documents = []
        metadatas = []

        for _, row in batch.iterrows():
            book_id = str(row["순위"])

            # 도서 텍스트 생성 (제목 + 저자 + 출판사 + 가격)
            doc_text = (
                f"{row['도서명']} | 저자: {row['저자']} | "
                f"출판사: {row['출판사']} | 가격: {row['가격']}원"
            )

            ids.append(book_id)
            documents.append(doc_text)
            metadatas.append(
                {
                    "title": str(row["도서명"]),
                    "author": str(row["저자"]),
                    "publisher": str(row["출판사"]),
                    "price": str(row["가격"]),
                    "rank": int(row["순위"]),
                    "link": str(row["링크"]),
                }
            )

        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
        )
        print(f"  {start + 1}~{end} / {total} 완료")

    print(f"\n벡터 DB 구축 완료! ({total}권)")
    print(f"  저장 위치: {CHROMA_DIR}")


if __name__ == "__main__":
    build_database()
