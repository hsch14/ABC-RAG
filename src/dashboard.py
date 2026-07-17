"""Yes24 IT 모바일 베스트셀러 탐색적 데이터 분석 대시보드.

Streamlit을 사용하여 Yes24에서 수집한 IT 모바일 분야 베스트셀러 데이터를
시각적으로 분석하고, 키워드 기반 도서 검색 기능을 제공하는 대시보드입니다.
"""

import json
import re
import sys
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st
from collections import Counter
from groq import Groq

sys.path.insert(0, str(Path(__file__).resolve().parent))
from vector_search import (
    vector_search as _vs_search,
    filter_books_by_price,
    filter_books_by_rank,
    format_books_for_context,
)

# ── 경로 설정 ──────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
CSV_PATH = DATA_DIR / "yes24_it_mobile_bestsellers.csv"

# ── 페이지 설정 ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Yes24 IT 베스트셀러 대시보드",
    page_icon="📚",
    layout="wide",
)


# ── 데이터 로딩 ────────────────────────────────────────────────────────────
@st.cache_data
def load_data() -> pd.DataFrame:
    """CSV 파일을 읽어 DataFrame을 반환한다."""
    df = pd.read_csv(CSV_PATH, encoding="utf-8-sig")

    # 가격에서 숫자만 추출
    df["가격_숫자"] = (
        df["가격"]
        .astype(str)
        .str.replace(r"[^\d]", "", regex=True)
        .str.strip()
    )
    df["가격_숫자"] = pd.to_numeric(df["가격_숫자"], errors="coerce")

    # 출판일에서 연도 추출
    df["출판연도"] = (
        df["출판일"]
        .astype(str)
        .str.extract(r"(\d{4})", expand=False)
    )
    df["출판연도"] = pd.to_numeric(df["출판연도"], errors="coerce")

    # 출판월 추출
    df["출판월"] = (
        df["출판일"]
        .astype(str)
        .str.extract(r"(\d{2})월", expand=False)
    )
    df["출판월"] = pd.to_numeric(df["출판월"], errors="coerce")

    return df


df = load_data()


# ── 사이드바 ────────────────────────────────────────────────────────────────
st.sidebar.title("📚 Yes24 IT 베스트셀러")
page = st.sidebar.radio(
    "메뉴 선택",
    ["📊 탐색적 데이터 분석 (EDA)", "🔍 도서 검색", "🤖 도서 추천 챗봇"],
)

st.sidebar.markdown("---")
groq_api_key = st.sidebar.text_input(
    "Groq API Key",
    type="password",
    placeholder="gsk_...",
    help="https://console.groq.com 에서 발급받을 수 있습니다.",
)


# ══════════════════════════════════════════════════════════════════════════
#  탐색적 데이터 분석 (EDA)
# ══════════════════════════════════════════════════════════════════════════
if page == "📊 탐색적 데이터 분석 (EDA)":
    st.title("📊 탐색적 데이터 분석 (EDA)")
    st.markdown("---")

    # ── 요약 통계 ──────────────────────────────────────────────────────────
    st.subheader("📋 데이터 개요")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("총 도서 수", f"{len(df):,}권")
    col2.metric("평균 가격", f"₩{df['가격_숫자'].mean():,.0f}")
    col3.metric("출판사 수", f"{df['출판사'].nunique():,}개")
    col4.metric("저자 수", f"{df['저자'].nunique():,}명")

    st.markdown("---")

    # ── 1행: 가격 분포 + 출판사별 도서 수 ──────────────────────────────────
    c1, c2 = st.columns(2)

    with c1:
        st.subheader("💰 가격 분포")
        fig_price = px.histogram(
            df.dropna(subset=["가격_숫자"]),
            x="가격_숫자",
            nbins=30,
            labels={"가격_숫자": "가격 (원)"},
            color_discrete_sequence=["#636EFA"],
        )
        fig_price.update_layout(
            xaxis_title="가격 (원)",
            yaxis_title="도서 수",
            bargap=0.05,
            height=350,
        )
        st.plotly_chart(fig_price, use_container_width=True)

    with c2:
        st.subheader("🏢 출판사별 도서 수 (Top 15)")
        pub_counts = (
            df["출판사"]
            .value_counts()
            .head(15)
            .reset_index()
        )
        pub_counts.columns = ["출판사", "도서 수"]
        fig_pub = px.bar(
            pub_counts,
            x="도서 수",
            y="출판사",
            orientation="h",
            color="도서 수",
            color_continuous_scale="Blues",
        )
        fig_pub.update_layout(
            yaxis=dict(autorange="reversed"),
            height=350,
            showlegend=False,
        )
        st.plotly_chart(fig_pub, use_container_width=True)

    # ── 2행: 출판연도별 추이 + 출판사별 평균 가격 ──────────────────────────
    c3, c4 = st.columns(2)

    with c3:
        st.subheader("📅 출판연도별 도서 수")
        year_counts = (
            df["출판연도"]
            .dropna()
            .astype(int)
            .value_counts()
            .sort_index()
            .reset_index()
        )
        year_counts.columns = ["출판연도", "도서 수"]
        fig_year = px.bar(
            year_counts,
            x="출판연도",
            y="도서 수",
            color="도서 수",
            color_continuous_scale="Greens",
        )
        fig_year.update_layout(height=350, showlegend=False)
        st.plotly_chart(fig_year, use_container_width=True)

    with c4:
        st.subheader("💎 출판사별 평균 가격 (Top 10)")
        pub_price = (
            df.groupby("출판사")["가격_숫자"]
            .mean()
            .dropna()
            .sort_values(ascending=False)
            .head(10)
            .reset_index()
        )
        pub_price.columns = ["출판사", "평균 가격"]
        fig_pp = px.bar(
            pub_price,
            x="평균 가격",
            y="출판사",
            orientation="h",
            color="평균 가격",
            color_continuous_scale="Oranges",
        )
        fig_pp.update_layout(
            yaxis=dict(autorange="reversed"),
            height=350,
            showlegend=False,
            xaxis_tickformat=",.0f",
        )
        st.plotly_chart(fig_pp, use_container_width=True)

    # ── 3행: 가격 box plot + 월별 출판 추이 ─────────────────────────────────
    c5, c6 = st.columns(2)

    with c5:
        st.subheader("📦 출판사별 가격 분포 (Top 5 출판사)")
        top5_pubs = df["출판사"].value_counts().head(5).index.tolist()
        df_top5 = df[df["출판사"].isin(top5_pubs)].dropna(subset=["가격_숫자"])
        fig_box = px.box(
            df_top5,
            x="출판사",
            y="가격_숫자",
            color="출판사",
            points="outliers",
        )
        fig_box.update_layout(
            height=350,
            yaxis_tickformat=",.0f",
            showlegend=False,
        )
        st.plotly_chart(fig_box, use_container_width=True)

    with c6:
        st.subheader("📆 월별 출판 추이")
        month_data = (
            df.dropna(subset=["출판월"])
            .groupby("출판월")
            .size()
            .reset_index(name="도서 수")
        )
        month_data = month_data.sort_values("출판월")
        fig_month = px.line(
            month_data,
            x="출판월",
            y="도서 수",
            markers=True,
            color_discrete_sequence=["#EF553B"],
        )
        fig_month.update_layout(
            height=350,
            xaxis=dict(dtick=1),
        )
        st.plotly_chart(fig_month, use_container_width=True)

    # ── 4행: 도서명 키워드 빈도 ────────────────────────────────────────────
    st.subheader("🔤 도서명 주요 키워드 (Top 30)")
    all_words: list[str] = []
    for title in df["도서명"].dropna():
        tokens = re.findall(r"[가-힣]{2,}|[A-Za-z]+", str(title))
        all_words.extend(tokens)

    # 불용어 필터링
    stopwords = {
        "하는", "위한", "그리고", "으로", "에서", "부터", "까지", "만의",
        "바로", "되는", "되는", "있는", "없는", "좋은", "나쁜",
        "with", "the", "for", "and", "of", "to", "in", "a", "an",
        "Do", "it", "Doit",
    }
    filtered_words = [w for w in all_words if w not in stopwords and len(w) > 1]
    word_freq = Counter(filtered_words).most_common(30)

    if word_freq:
        wf_df = pd.DataFrame(word_freq, columns=["키워드", "빈도"])
        fig_wc = px.treemap(
            wf_df,
            path=["키워드"],
            values="빈도",
            color="빈도",
            color_continuous_scale="Viridis",
        )
        fig_wc.update_layout(height=450)
        st.plotly_chart(fig_wc, use_container_width=True)

    # ── 5행: 가격 vs 순위 산점도 ──────────────────────────────────────────
    st.subheader("🎯 가격 vs 순위 관계")
    fig_scatter = px.scatter(
        df.dropna(subset=["가격_숫자", "순위"]),
        x="가격_숫자",
        y="순위",
        hover_data=["도서명", "저자", "출판사"],
        color="출판사",
        size="가격_숫자",
        opacity=0.7,
    )
    fig_scatter.update_layout(
        height=450,
        yaxis=dict(autorange="reversed"),
        xaxis_tickformat=",.0f",
    )
    st.plotly_chart(fig_scatter, use_container_width=True)

    # ── 원본 데이터 테이블 ────────────────────────────────────────────────
    with st.expander("📋 원본 데이터 보기"):
        st.dataframe(
            df[["순위", "도서명", "저자", "출판사", "출판일", "가격", "링크"]],
            use_container_width=True,
            height=400,
        )


# ══════════════════════════════════════════════════════════════════════════
#  도서 검색
# ══════════════════════════════════════════════════════════════════════════
elif page == "🔍 도서 검색":
    st.title("🔍 도서 검색")
    st.markdown("키워드를 입력하여 도서 제목, 저자, 출판사를 검색할 수 있습니다.")
    st.markdown("---")

    # 검색 필터
    col_search, col_filter = st.columns([3, 1])
    with col_search:
        keyword = st.text_input(
            "검색어 입력",
            placeholder="예: AI, 클로드, 바이브 코딩 ...",
        )
    with col_filter:
        search_field = st.selectbox(
            "검색 대상",
            ["전체", "도서명", "저자", "출판사"],
        )

    # 정렬 옵션
    sort_option = st.radio(
        "정렬 기준",
        ["순위순", "가격 낮은순", "가격 높은순", "최신순"],
        horizontal=True,
    )

    st.markdown("---")

    # ── 검색 수행 ──────────────────────────────────────────────────────────
    if keyword.strip():
        kw = keyword.strip().lower()

        def _match_mask(series: pd.Series) -> pd.Series:
            return series.astype(str).str.lower().str.contains(kw, na=False)

        if search_field == "도서명":
            mask = _match_mask(df["도서명"])
        elif search_field == "저자":
            mask = _match_mask(df["저자"])
        elif search_field == "출판사":
            mask = _match_mask(df["출판사"])
        else:
            mask = (
                _match_mask(df["도서명"])
                | _match_mask(df["저자"])
                | _match_mask(df["출판사"])
            )

        result = df[mask].copy()
    else:
        result = df.copy()

    # ── 정렬 ───────────────────────────────────────────────────────────────
    if sort_option == "순위순":
        result = result.sort_values("순위")
    elif sort_option == "가격 낮은순":
        result = result.sort_values("가격_숫자", ascending=True)
    elif sort_option == "가격 높은순":
        result = result.sort_values("가격_숫자", ascending=False)
    elif sort_option == "최신순":
        result = result.sort_values("출판연도", ascending=False)

    # ── 결과 요약 ──────────────────────────────────────────────────────────
    st.info(f"🔍 **{len(result)}권** 의 도서가 검색되었습니다.")

    if not result.empty:
        avg_price = result["가격_숫자"]
        c1, c2, c3 = st.columns(3)
        c1.metric("검색 결과 수", f"{len(result):,}권")
        c2.metric("평균 가격", f"₩{avg_price.mean():,.0f}")
        c3.metric("가격 범위", f"₩{avg_price.min():,.0f} ~ ₩{avg_price.max():,.0f}")

    st.markdown("---")

    # ── 결과 카드 출력 ──────────────────────────────────────────────────────
    if result.empty:
        st.warning("검색 결과가 없습니다. 다른 키워드로 다시 검색해 보세요.")
    else:
        for _, row in result.iterrows():
            with st.container():
                st.markdown(
                    f"""
<div style="border:1px solid #ddd; border-radius:8px; padding:16px; margin-bottom:12px;">
  <h4 style="margin:0 0 6px 0;">🏅 #{int(row['순위'])} &nbsp; {row['도서명']}</h4>
  <p style="margin:2px 0; color:#555;">✍️ <b>저자:</b> {row['저자']} &nbsp;|&nbsp;
     🏢 <b>출판사:</b> {row['출판사']} &nbsp;|&nbsp;
     📅 <b>출판일:</b> {row['출판일']}</p>
  <p style="margin:2px 0;">💰 <b>가격:</b> {row['가격']}원</p>
  <p style="margin:2px 0;"><a href="{row['링크']}" target="_blank">🔗 Yes24 상세보기</a></p>
</div>
""",
                    unsafe_allow_html=True,
                )

    # ── 검색 결과 시각화 (검색 결과가 있을 때) ──────────────────────────────
    if not result.empty and len(result) > 1:
        st.subheader("📈 검색 결과 분석")
        vc1, vc2 = st.columns(2)

        with vc1:
            st.markdown("**출판사별 도서 수**")
            pub_fig = px.pie(
                result,
                names="출판사",
                hole=0.4,
            )
            pub_fig.update_layout(height=300)
            st.plotly_chart(pub_fig, use_container_width=True)

        with vc2:
            st.markdown("**가격 분포**")
            price_fig = px.histogram(
                result.dropna(subset=["가격_숫자"]),
                x="가격_숫자",
                nbins=15,
                color_discrete_sequence=["#AB63FA"],
            )
            price_fig.update_layout(
                height=300,
                xaxis_tickformat=",.0f",
                xaxis_title="가격 (원)",
            )
            st.plotly_chart(price_fig, use_container_width=True)


# ══════════════════════════════════════════════════════════════════════════
#  도서 추천 챗봇 (ONNX 벡터 검색 + Groq Function Calling)
# ══════════════════════════════════════════════════════════════════════════
elif page == "🤖 도서 추천 챗봇":
    st.title("🤖 도서 추천 챗봇")
    st.markdown("관심 있는 주제나 키워드를 입력하면 벡터 유사도 기반으로 맞춤형 도서를 추천해 드립니다.")
    st.markdown("---")

    if not groq_api_key:
        st.warning("사이드바에서 Groq API Key를 입력해 주세요.")
        st.stop()

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    # ── Groq Function Calling 도구 정의 ────────────────────────────────────
    TOOLS = [
        {
            "type": "function",
            "function": {
                "name": "filter_books_by_price",
                "description": "가격 범위로 IT 모바일 베스트셀러 도서를 필터링합니다. 가격 질문 시 사용합니다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "min_price": {
                            "type": "integer",
                            "description": "최소 가격 (원). 예: 10000",
                        },
                        "max_price": {
                            "type": "integer",
                            "description": "최대 가격 (원). 예: 30000",
                        },
                    },
                    "required": ["min_price", "max_price"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "filter_books_by_rank",
                "description": "순위(판매지수) 범위로 IT 모바일 베스트셀러 도서를 필터링합니다. 순위/판매지수 질문 시 사용합니다.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "min_rank": {
                            "type": "integer",
                            "description": "최소 순위 (이상). 예: 1",
                        },
                        "max_rank": {
                            "type": "integer",
                            "description": "최대 순위 (이하). 예: 10",
                        },
                    },
                    "required": ["min_rank", "max_rank"],
                },
            },
        },
    ]

    SYSTEM_PROMPT = (
        "당신은 Yes24 IT 모바일 베스트셀러 도서 추천 챗봇입니다.\n"
        "사용자의 질문에 맞춰 친절하게 추천해 주세요.\n\n"
        "## 함수 호출 규칙\n"
        "- 사용자가 '가격', '원', '₩' 등 가격 관련 질문을 하면 filter_books_by_price를 호출하세요.\n"
        "- 사용자가 '순위', '판매지수', '상위', '1위~10위' 등 순위 관련 질문을 하면 filter_books_by_rank를 호출하세요.\n"
        "- 가격이나 순위 질문 시 반드시 함수를 호출하여 정확한 데이터를 반환하세요.\n"
        "- 함수 호출 결과를 마크다운 표로 정리하여 보여주세요.\n\n"
        "## 일반 추천 규칙\n"
        "- 벡터 검색 결과의 유사도 점수가 높을수록 질문에 더 잘 맞는 도서입니다.\n"
        "- 추천할 도서가 없다면 없다고 솔직하게 답변하세요.\n"
        "- 각 도서에 대해 간단한 소개와 추천 이유를 포함하세요.\n"
        "- 마크다운 형식으로 응답하세요.\n"
        "- 각 도서에는 Yes24 상세보기 링크가 있으니, 응답에 반드시 포함하세요."
    )

    def _chat_with_groq(user_message: str, api_key: str) -> str:
        """Groq API + Function Calling으로 챗봇 응답을 생성한다."""
        client = Groq(api_key=api_key)

        # 벡터 검색으로 초기 컨텍스트 확보
        books = _vs_search(user_message, top_n=5)
        context = format_books_for_context(books)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"사용자 질문: {user_message}\n\n"
                    f"검색된 도서 목록:\n{context}"
                ),
            },
        ]

        # 첫 번째 호출: tools 포함
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.7,
            max_tokens=2048,
        )

        assistant_msg = response.choices[0].message

        # tool_calls가 있으면 실행 후 결과를 LLM에 전달
        if assistant_msg.tool_calls:
            messages.append({
                "role": "assistant",
                "content": assistant_msg.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in assistant_msg.tool_calls
                ],
            })

            for tc in assistant_msg.tool_calls:
                func_name = tc.function.name
                args = json.loads(tc.function.arguments)

                if func_name == "filter_books_by_price":
                    result = filter_books_by_price(
                        min_price=args["min_price"],
                        max_price=args["max_price"],
                    )
                elif func_name == "filter_books_by_rank":
                    result = filter_books_by_rank(
                        min_rank=args["min_rank"],
                        max_rank=args["max_rank"],
                    )
                else:
                    result = []

                result_text = format_books_for_context(result[:20])
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": (
                        f"함수: {func_name}\n"
                        f"조건: {args}\n"
                        f"검색 결과: {len(result)}권\n\n"
                        f"{result_text}"
                    ),
                })

            # 두 번째 호출: 도구 결과를 바탕으로 최종 응답
            final = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=2048,
            )
            return final.choices[0].message.content

        return assistant_msg.content or "응답을 생성할 수 없습니다."

    # ── 대화 표시 ──────────────────────────────────────────────────────────
    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if user_input := st.chat_input("어떤 도서를 찾고 계신가요?"):
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        with st.chat_message("assistant"):
            with st.spinner("검색 및 분석 중..."):
                try:
                    bot_response = _chat_with_groq(user_input, groq_api_key)
                except Exception as e:
                    bot_response = f"API 호출 중 오류가 발생했습니다: {e}"
            st.markdown(bot_response)

        st.session_state.chat_history.append(
            {"role": "assistant", "content": bot_response}
        )

    if st.session_state.chat_history:
        if st.button("대화 초기화"):
            st.session_state.chat_history = []
            st.rerun()


# ── 푸터 ───────────────────────────────────────────────────────────────────
st.sidebar.markdown("---")
st.sidebar.caption("데이터: Yes24 IT 모바일 베스트셀러")
st.sidebar.caption(f"총 {len(df):,}권 수록")
