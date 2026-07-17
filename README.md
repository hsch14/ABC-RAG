# ABC-RAG (Yes24 IT 모바일 베스트셀러 분석 & 추천 챗봇)

예스24 IT 모바일 분야 베스트셀러 도서 데이터를 크롤링하고, 데이터 시각화 분석(EDA) 대시보드와 RAG(Retrieval-Augmented Generation) 기법 기반 AI 도서 추천 챗봇을 제공하는 프로젝트입니다.

---

## 🚀 주요 기능

### 1. 데이터 스크래핑 (`scraper.py`)
* `scrapling` 라이브러리를 활용하여 실제 브라우저와 유사하게 예스24 서버에 요청을 전송합니다.
* IT 모바일 분야 베스트셀러 도서 목록의 전체 페이지를 돌며 순위, 도서명, 저자, 출판사, 출판일, 가격, 상세 페이지 링크를 수집합니다.
* 수집 완료된 데이터는 `data/yes24_it_mobile_bestsellers.csv`로 저장됩니다.

### 2. 엑셀 분석 대시보드 생성 (`src/excel_dashboard.py`)
* 수집된 CSV 데이터를 읽어 `openpyxl` 라이브러리로 차트와 요약 통계 테이블을 구성한 세련된 엑셀 보고서(`data/yes24_dashboard.xlsx`)를 생성합니다.
* 출판사별 도서 수, 가격대별 도서 수, 도서명 내 주요 키워드(Top 15), 연도별 출판 추이 등의 차트 시각화가 자동으로 반영됩니다.

### 3. Streamlit EDA 대시보드 (`src/dashboard.py`)
* Streamlit과 Plotly Express를 기반으로 한 탐색적 데이터 분석(EDA) 인터페이스를 제공합니다.
* 웹 상에서 도서 통계를 한눈에 확인하고 키워드 기반으로 원하는 도서를 빠르게 필터링할 수 있습니다.

### 4. RAG 기반 AI 도서 추천 챗봇 (`src/dashboard.py`, `src/vector_search.py`)
* 미리 구축된 임베딩 데이터셋(`data/embeddings.tsv`, `data/metadata.tsv`)을 사용하여 벡터 검색을 수행합니다.
* 사용자의 도서 추천 질문이 입력되면 관련도 높은 책 데이터를 검색하여 컨텍스트로 확보한 뒤, **Groq API**를 통해 똑똑하고 맞춤화된 AI 도서 추천 답변을 제공합니다.

---

## 📂 프로젝트 구조

```text
├── data/
│   ├── yes24_it_mobile_bestsellers.csv  # 예스24 IT 모바일 베스트셀러 데이터 (1,000권)
│   ├── embeddings.tsv                   # RAG 검색용 도서 벡터 데이터
│   └── metadata.tsv                     # RAG 검색용 도서 메타데이터
├── src/
│   ├── dashboard.py                     # Streamlit EDA 대시보드 및 AI 챗봇
│   ├── excel_dashboard.py               # openpyxl 기반 엑셀 대시보드 생성기
│   ├── vector_search.py                 # RAG 벡터 유사도 검색 라이브러리
│   └── build_vectordb.py                # 벡터 DB 구성용 빌드 스크립트
├── scraper.py                           # scrapling 기반 데이터 스크래퍼
├── .gitignore                           # Git 커밋 제외 필터링 설정
└── README.md                            # 프로젝트 설명 문서
```

---

## 🛠️ 시작하기

### 1. 개발 환경 구성 (uv 사용)
프로젝트에 맞는 파이썬 가상환경을 구축하고 의존성 패키지를 설치합니다:
```bash
# 가상환경 생성
uv venv

# 가상환경 활성화 (Windows)
.venv\Scripts\activate

# 필수 패키지 설치
uv pip install scrapling pandas openpyxl streamlit plotly groq
```

### 2. 크롤러 실행
예스24에서 실시간 베스트셀러 데이터를 갱신하여 CSV로 수집하고 싶을 때 실행합니다:
```bash
python scraper.py
```

### 3. 엑셀 대시보드 파일 생성
수집된 데이터를 기반으로 시각화 보고서 엑셀 파일을 생성합니다:
```bash
python src/excel_dashboard.py
```

### 4. Streamlit EDA 및 챗봇 실행
웹 대시보드 앱을 실행하여 데이터를 탐색하고 AI 추천 서비스를 이용합니다:
```bash
streamlit run src/dashboard.py
```
> 💡 챗봇 기능을 활용하려면 Streamlit 사이드바 메뉴에서 발급받으신 **Groq API Key**를 입력하셔야 합니다.
