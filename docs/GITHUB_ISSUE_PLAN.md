# Issue: 배포 환경(Streamlit Cloud)에서 RAG 추천 챗봇 정상 동작을 위한 모델 상대경로화 및 데이터 로딩 최적화

## 📋 개요 및 필요성

현재 프로젝트를 Streamlit Cloud와 같은 외부 서버 환경에 배포했을 때 **🤖 도서 추천 챗봇**이 에러로 인해 정상 작동하지 않습니다. 이 문제의 주요 원인은 다음과 같습니다:
1. **임베딩 모델 로딩의 로컬 경로 종속성**: `vector_search.py` 내부에서 ONNX 임베딩 모델과 토크나이저를 읽어올 때 `Path.home() / ".cache" / "chroma" / ...` 와 같이 개발자 로컬 환경의 홈 디렉토리 경로를 사용합니다. 배포 서버에는 이 모델 파일이 존재하지 않아 로딩이 실패합니다.
2. **실시간 전체 임베딩 연산 딜레이**: 대시보드가 구동될 때 1,000권 전체 도서 목록을 임베딩 모델에 넣어 매번 실시간으로 연산하여 캐싱합니다. 이로 인해 최초 서버 로딩 시 극심한 자원 소모와 실행 지연(Timeout)이 발생합니다.

---

## 🛠️ 해결 및 개선 방안

1. **임베딩 캐시 파일(`embeddings.tsv`) 재사용**:
   * 로컬에서 크롤링 완료 후 미리 연산해 둔 `data/embeddings.tsv` 파일을 직접 로딩하도록 개선합니다.
   * 이렇게 함으로써 1,000권 도서의 인코딩 연산 과정을 생략하고 즉각 유사도 검색 연산을 수행할 수 있어 서버 리소스 사용을 최소화하고 챗봇 로딩 속도를 향상시킵니다.
2. **ONNX 모델 파일의 상대경로화**:
   * 사용자의 질의(Query)에 대한 실시간 1회성 임베딩 추출을 위해 온디바이스 ONNX 임베딩 모델은 여전히 필요합니다.
   * `all-MiniLM-L6-v2` 모델 파일 6종을 프로젝트 내 상대 경로(`models/all-MiniLM-L6-v2/onnx/`)로 패키징하여 깃에 커밋 푸시합니다.
   * `vector_search.py`가 배포 시에도 이 상대 경로를 통해 모델과 토크나이저를 문제없이 로드하도록 경로 구성을 고칩니다.

---

## ⚙️ 작업 범위 및 변경 이력

* **`docs/GITHUB_ISSUE_PLAN.md`** [NEW]: 이 개선 작업을 상세 기술한 기획 문서 작성
* **`models/all-MiniLM-L6-v2/onnx/`** [NEW]: 6개의 임베딩 모델 관련 파일 복사 및 Git 추가
  * `config.json`, `model.onnx`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`
* **`src/vector_search.py`** [MODIFY]: 
  * `Path.home()` 기반 모델 로딩을 `PROJECT_ROOT / "models" / ...` 로 변경
  * `_compute_embeddings()` 함수 내에서 모델 인코딩 대신 `data/embeddings.tsv` 데이터를 파싱하고 numpy matrix로 즉각 로드하도록 리팩토링
