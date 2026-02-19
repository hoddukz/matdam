<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/design/stitch-prompts/05-shopping-list.md -->

# Stitch Prompt: Shopping List Page

> 소스: implementation-plan.md Step 11 + master-plan §6.4
> screen-flow.md에는 와이어프레임 없음 (신규 작성)

---

## 페이지 정보

- **URL:** `/profile/shopping-list`
- **용도:** 여러 레시피에서 필요한 재료를 합산한 장보기 목록
- **접근:** 로그인 필수 (본인 전용)
- **진입 경로:** 레시피 상세 "Add to Shopping List" 버튼 or 프로필 메뉴

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

일반 GNB 사용

---

## 페이지 구성

### 1. 페이지 헤더

- 제목: "Shopping List" (Noto Serif KR)
- 부제: "Ingredients from your selected recipes, combined and ready to shop."
- 단위 토글: [Metric] / [Imperial]

### 2. 선택한 레시피 목록

선택된 레시피들이 작은 카드로 가로 나열:

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ [썸네일]  │ │ [썸네일]  │ │ [+ Add   │
│ Kimchi   │ │ Egg      │ │  Recipe] │
│ Jjigae   │ │ Kimbap   │ │          │
│     [✕]  │ │     [✕]  │ │          │
└──────────┘ └──────────┘ └──────────┘
```

- 각 카드에 ✕ 버튼으로 제거 가능
- [+ Add Recipe] 카드 — 레시피 탐색으로 이동

### 3. 합산된 재료 리스트

재료가 카테고리별로 그룹:

```
🥫 SAUCES & SEASONINGS
☐ Gochujang .............. 3 tbsp
   (Kimchi Jjigae 2 tbsp + Egg Kimbap 1 tbsp)
☐ Soy Sauce .............. 2 tbsp
☐ Sesame Oil ............. 2 tbsp

🥬 VEGETABLES
☐ Aged Kimchi ............. 1 cup
☐ Green Onion ............. 3 stalks
   (Kimchi Jjigae 2 + Egg Kimbap 1)
☐ Carrot .................. 1/2

🥩 PROTEINS
☐ Pork Belly .............. 200g
☐ Eggs .................... 5
   (Kimchi Jjigae 2 + Egg Kimbap 3)
```

- **체크박스** — 장을 볼 때 구매한 항목 체크
- **합산 표시** — 같은 재료가 여러 레시피에 걸쳐 있으면 합산 + 출처 표시
- **카테고리 그룹** — Sauces, Vegetables, Proteins, Grains 등
- 체크한 항목은 취소선 + 흐리게

### 4. 하단 액션

- [Clear Checked] — 체크한 항목 일괄 제거
- [Share List] — 목록 텍스트 복사 (카톡/메시지로 공유)

---

## 반응형

| 디바이스 | 레이아웃                                                     |
| -------- | ------------------------------------------------------------ |
| 데스크톱 | 좌: 선택 레시피 사이드바 / 우: 재료 리스트                   |
| 모바일   | 상단: 레시피 가로 스크롤 / 하단: 재료 리스트 (체크박스 크게) |

---

## 핵심 포인트

1. **합산이 핵심** — "Eggs 5 (Jjigae 2 + Kimbap 3)" 처럼 겹치는 재료는 합산하되 출처 표시
2. **체크박스 UX** — 마트에서 하나씩 체크하면서 사용. 모바일에서 터치 쉽게
3. **단위 토글** — 미국인은 Imperial, 유럽인은 Metric으로 볼 수 있게
4. **카테고리 그룹** — 마트 동선에 맞게 (양념 → 채소 → 단백질)
