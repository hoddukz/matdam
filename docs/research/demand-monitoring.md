<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/research/demand-monitoring.md -->

# 맛담 수요 모니터링 체크리스트

> 사용자가 "확인해봐"라고 요청 시 아래 항목을 웹서치로 확인하고 결과를 기록한다.

---

## 1. 확인 항목

### A. Reddit 커뮤니티 동향

**r/KoreanFood (구독자 ~322K)**

- 검색 쿼리: `reddit r/KoreanFood top posts this week`
- 검색 쿼리: `reddit r/KoreanFood "I made" OR "my version" OR "adapted"`
- 관찰 포인트:
  - "I made", "my version", "adapted", "substitute" 키워드 포함 글의 upvote/댓글 수
  - 사진 포함 후기 글의 반응 수준
  - 재료 대체 질문 빈도

**r/cooking (구독자 ~4M)**

- 검색 쿼리: `reddit r/cooking korean recipe this month`
- 관찰 포인트:
  - 한식 관련 글이 올라오는 빈도
  - 한식 변형/퓨전 글의 upvote 및 댓글 수

**r/asiancooking**

- 검색 쿼리: `reddit r/asiancooking korean recipe`
- 관찰 포인트:
  - 한식 비중, 대체재/현지화 논의 여부

### B. 대체재/현지화 수요

- 검색 쿼리: `reddit korean ingredient substitute hard to find 2026`
- 검색 쿼리: `korean cooking ingredient alternative where to buy`
- 관찰 포인트:
  - 가장 많이 언급되는 구하기 힘든 재료 목록
  - 사용되는 대체재 종류
  - 지역별(미국, 유럽, 동남아) 차이

### C. TikTok / Instagram 트렌드

- 검색 쿼리: `TikTok #koreanfood trend 2026 views statistics`
- 검색 쿼리: `Instagram #koreanfood posts count 2026`
- 검색 쿼리: `korean food viral recipe TikTok 2026`
- 관찰 포인트:
  - #koreanfood 총 게시물/뷰 수 변화 (기준: 120만 게시물, 월 23억뷰)
  - 새로운 바이럴 한식 트렌드 등장 여부
  - 퓨전/리믹스 성격의 콘텐츠 비중

### D. 경쟁사 동향

- Maangchi 커뮤니티/기능 변화
  - 검색 쿼리: `maangchi new feature community update 2026`
- 만개의레시피 글로벌 진출 여부
  - 검색 쿼리: `만개의레시피 global english international 2026`
- 새로운 한식 레시피 플랫폼 등장 여부
  - 검색 쿼리: `korean recipe platform community launch new 2026`
  - 검색 쿼리: `korean food app startup 2026`

### E. K-Food 시장 데이터

- 검색 쿼리: `korean food export growth 2026 statistics`
- 검색 쿼리: `K-food global market trend 2026`
- 검색 쿼리: `korean food popularity survey 2026`
- 관찰 포인트:
  - 수출 성장률 변화
  - 신규 진출 시장
  - 소비자 인식 변화

---

## 2. 판단 기준

| 신호                       | 긍정                 | 경고                        |
| -------------------------- | -------------------- | --------------------------- |
| Reddit 변형 레시피 글 반응 | upvote 50+, 댓글 20+ | upvote 10 미만, 댓글 3 미만 |
| 대체재 질문 빈도           | 주 3회 이상 새 글    | 거의 없음                   |
| TikTok #koreanfood 뷰      | 월 23억+ (유지/증가) | 뚜렷한 감소 추세            |
| 경쟁 플랫폼 등장           | 없음 (기회 유지)     | 유사 컨셉 런칭 (위협)       |
| K-Food 수출                | 전년 대비 증가       | 정체/감소                   |

---

## 3. 핵심 검증 가설 (MVP 전 확인 필수)

| #   | 가설                                        | 검증 방법                               | 상태      |
| --- | ------------------------------------------- | --------------------------------------- | --------- |
| H1  | 외국인이 한식 변형 경험을 공유하고 싶어한다 | Reddit 직접 글 게시 → 반응 관찰         | ⬜ 미검증 |
| H2  | 기존 Reddit/블로그로는 부족하다고 느낀다    | Reddit 댓글/DM 인터뷰                   | ⬜ 미검증 |
| H3  | "리믹스" 개념이 일반 유저에게 직관적이다    | Reddit 글에서 "remix" 표현 사용 시 반응 | ⬜ 미검증 |

---

## 4. 확인 기록

| 날짜       | 확인자 | 주요 발견                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 판단                                  |
| ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 2026-02-17 | Claude | r/KoreanFood 32만 구독, 일일 활동 낮음(글 1/일, 댓글 7/일). TikTok 월 23억뷰. Maangchi 포럼 쇠퇴(Reader Recipes 140토픽/292답글). 대체재 수요 확인됨(gochujang/gochugaru 관련 블로그 다수). "리믹스" 개념은 웹에서 미발견. 레시피앱 시장 CAGR 13.5%.                                                                                                                                                                                                                                    | 시장 존재, 리믹스 수요 직접 검증 필요 |
| 2026-02-19 | Claude | **Reddit:** r/KoreanFood 활발, 변형 레시피("my version", "adapted") 글에 높은 반응. r/cooking 한식 관련 글 꾸준. **대체재:** gochujang/doenjang이 가장 검색량 높음, 주 3회+ 질문 확인. **TikTok:** #koreanfood 120만+ 게시물, Instagram 4,700만+ 게시물. Bulgogi 검색 1,700% 급증. 퓨전/리믹스 콘텐츠 증가 추세. **경쟁사:** Maangchi 일시적 둔화(기회), 만개의레시피 글로벌 진출 없음. 유사 컨셉 플랫폼 미발견. **K-Food:** 2025 수출 $136.2억 역대 최고, 라면 +22%, 유럽 +13.6% 성장. | 긍정 (적극 추진 권장)                 |
|            |        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                                       |
