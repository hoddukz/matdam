<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/design/stitch-prompts/02-glossary-detail.md -->

# Stitch Prompt: Glossary Detail Page

> 소스: screen-flow.md §4.7 + implementation-plan.md Step 7 + master-plan §3.3, §3.4

---

## 페이지 정보

- **URL:** `/glossary/[slug]` (예: `/glossary/gochujang`)
- **용도:** 한식 재료 상세 정보. 외국인이 "이 재료가 뭔지" 알 수 있는 페이지.
- **접근:** 비로그인도 열람 가능
- **진입 경로:** 레시피 상세의 재료 클릭 or Glossary 인덱스에서 카드 클릭

---

## 브랜드 가이드

| 항목        | 값            |
| ----------- | ------------- |
| 배경색      | `#FAF6EF`     |
| 텍스트      | `#2C2417`     |
| 포인트      | `#D4A035`     |
| 보조 텍스트 | `#6B5B3E`     |
| 카드 배경   | `#FFFFFF`     |
| 보더        | `#E6DCCD`     |
| 제목 폰트   | Noto Serif KR |
| 본문 폰트   | DM Sans       |

---

## GNB

일반 GNB 사용 (MatDam 로고 + Explore + Glossary + Search + Create + Avatar)

---

## 페이지 구성

### 1. 뒤로가기

- [← Back to Glossary] 링크

### 2. 재료 히어로 이미지

- 재료 사진 크게 (넓은 히어로, 실제 재료 사진)
- 예시: 고추장 병/항아리 사진

### 3. 재료 이름

- **영어명:** Gochujang (크게, Noto Serif KR)
- **한국어명:** 고추장 (영어명 옆에 작게)
- **설명:** Korean Chili Paste (보조 텍스트)
- **카테고리 뱃지:** [SAUCES] (칩 스타일)

### 4. What is it? (설명 섹션)

- "A thick, fermented chili paste made from red chili, glutinous rice, and soybeans. It's the backbone of many Korean dishes, providing a sweet-spicy depth of flavor."
- 2~3문단 정도의 설명

### 5. Substitutes (대체재)

- 이 재료를 못 구할 때 쓸 수 있는 대안
- 리스트 형태:
  - • **Sriracha + miso** (closest match) — Mix 1:1 for similar heat and fermented flavor
  - • **Sambal oelek + honey** — For the sweet-spicy balance
  - • **Tomato paste + cayenne + soy sauce** — Emergency substitute
- 각 대체재에 간단한 비율/설명 포함

### 6. Where to buy (구매 안내)

- **In-store:**
  - H-Mart (US, Canada)
  - Any Asian grocery store — look in the sauce/condiment aisle
- **Online:**
  - Amazon (링크 아이콘)
  - Weee! (링크 아이콘)
- 텍스트 기반 안내 (MVP에서는 실제 링크 없이 텍스트만)

### 7. Recipes using this ingredient

- 이 재료를 사용한 레시피 카드 가로 스크롤
- 레시피 카드 3~4개 (사진, 제목, 난이도, 시간)
- [View all →] 링크

### 8. Reviews mentioning this ingredient (MVP-β 라벨)

- "12 reviews mention this ingredient"
- 리뷰 카드 1~2개 미리보기
- 예: "@sarah_cooks: The gochujang really made this dish. Don't skip it!"

### 9. Footer

---

## 반응형

| 디바이스 | 레이아웃                                             |
| -------- | ---------------------------------------------------- |
| 데스크톱 | 2컬럼 — 좌: 사진+이름+설명, 우: 대체재+구매 사이드바 |
| 모바일   | 단일 컬럼, 위에서 아래로 스크롤                      |

---

## 핵심 포인트

1. **외국인 관점으로 설명** — "Gochujang is like..." 비교 형태가 이해하기 쉬움
2. **대체재가 핵심** — 외국인이 이 페이지에 오는 가장 큰 이유는 "못 구하면 뭘 쓰지?"
3. **레시피 연결** — 이 재료를 쓰는 레시피로 자연스럽게 이동
4. **사진이 중요** — 재료 사진이 있어야 마트에서 찾을 수 있음
