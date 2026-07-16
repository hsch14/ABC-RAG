"""Yes24 IT 모바일 분야 베스트셀러 도서 목록을 수집하는 스크립트.

이 모듈은 Scrapling 라이브러리를 사용하여 예스24의 IT 모바일 분야 베스트셀러 목록을
전체 페이지에 걸쳐 실제 브라우저처럼 요청하여 수집하고, 결과를 CSV 파일로 저장합니다.
"""

import time
import pandas as pd
from typing import List, Dict, Any
from scrapling import Fetcher


def fetch_bestsellers() -> List[Dict[str, Any]]:
    """Yes24 IT 모바일 분야 베스트셀러 도서 목록을 전체 페이지에 걸쳐 수집한다.

    Returns:
        수집된 도서 정보 딕셔너리 리스트. 각 딕셔너리는 다음 키를 포함한다:
        - 순위: 도서 순위 (int)
        - 도서명: 도서명 (str)
        - 저자: 저자명 (str)
        - 출판사: 출판사 (str)
        - 출판일: 출판일 (str)
        - 가격: 판매가 (str)
        - 링크: 상세 페이지 URL (str)
    """
    fetcher = Fetcher()
    all_books: List[Dict[str, Any]] = []
    page_number = 1
    base_url = "https://www.yes24.com"

    print("Yes24 IT 모바일 베스트셀러 데이터 수집을 시작합니다...")

    while True:
        url = f"{base_url}/product/category/bestseller?categoryNumber=001001003&pageNumber={page_number}&pageSize=24"
        print(f"페이지 수집 중: {page_number} 페이지 ({url})")

        try:
            # 페이지 데이터 요청
            response = fetcher.get(url)
            
            # 도서 목록 추출
            books = response.css("ul#yesBestList > li")
            if not books:
                print(f"더 이상 도서 데이터가 없습니다. 수집을 종료합니다. (마지막 수집 완료 페이지: {page_number - 1})")
                break

            print(f"{page_number} 페이지에서 {len(books)}개의 도서를 찾았습니다.")

            for book in books:
                # 순위 추출
                rank_raw = book.css("em.ico.rank::text").get()
                rank = int(rank_raw) if rank_raw and rank_raw.isdigit() else None

                # 도서명 추출
                title = book.css("a.gd_name::text").get()
                if title:
                    title = title.strip()

                # 상세 링크 추출
                relative_link = book.css("a.gd_name::attr(href)").get()
                link = f"{base_url}{relative_link}" if relative_link else None

                # 저자 추출 (여러 명일 수 있으므로 결합)
                authors_list = [a.get().strip() for a in book.css("span.info_auth a::text") if a.get()]
                authors = ", ".join(authors_list)

                # 출판사 추출
                publisher = book.css("span.info_pub a::text").get()
                if publisher:
                    publisher = publisher.strip()

                # 출판일 추출
                pub_date = book.css("span.info_date::text").get()
                if pub_date:
                    pub_date = pub_date.strip()

                # 가격 추출
                price = book.css("strong.yes_b::text").get() or book.css(".yes_b::text").get()
                if price:
                    price = price.strip()

                # 유의미한 데이터가 있는 경우만 추가
                if title:
                    all_books.append({
                        "순위": rank,
                        "도서명": title,
                        "저자": authors,
                        "출판사": publisher,
                        "출판일": pub_date,
                        "가격": price,
                        "링크": link
                    })

            # 예스24 서버 부하 방지 및 차단 방지를 위한 딜레이 추가
            time.sleep(1.5)
            page_number += 1

        except Exception as e:
            print(f"{page_number} 페이지 수집 중 오류 발생: {e}")
            break

    return all_books


def main() -> None:
    """메인 실행 함수. 데이터를 수집하고 CSV 파일로 저장한다."""
    start_time = time.time()
    
    # 데이터 수집
    bestsellers = fetch_bestsellers()
    
    if not bestsellers:
        print("수집된 데이터가 없습니다.")
        return
        
    # Pandas DataFrame 변환
    df = pd.DataFrame(bestsellers)
    
    # 순위 기준 정렬 (결측치 처리 포함)
    df = df.sort_values(by="순위").reset_index(drop=True)
    
    # CSV 파일로 저장
    output_filename = "yes24_it_mobile_bestsellers.csv"
    try:
        # Excel에서의 한글 깨짐 방지를 위해 utf-8-sig 인코딩 적용
        df.to_csv(output_filename, index=False, encoding="utf-8-sig")
        elapsed_time = time.time() - start_time
        print(f"\n성공적으로 저장되었습니다: {output_filename}")
        print(f"총 수집 도서 수: {len(df)}권")
        print(f"소요 시간: {elapsed_time:.2f}초")
    except Exception as e:
        print(f"CSV 저장 중 오류 발생: {e}")


if __name__ == "__main__":
    main()
