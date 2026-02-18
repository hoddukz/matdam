<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/design/stitch-prompts/01-recipe-detail.md -->

# Stitch Prompt: Recipe Detail Page

> 이 파일을 Stitch에 단독으로 넣어서 1개 화면을 생성하기 위한 프롬프트.
> 소스: screen-flow.md §4.3 + implementation-plan.md Step 3~4 + master-plan §4, §6, §8.2

---

## 페이지 정보

- **URL:** `/recipes/[slug]` (예: `/recipes/egg-wrapped-kimbap`)
- **용도:** 레시피 상세 보기. 플랫폼에서 가장 핵심이 되는 페이지.
- **접근:** 비로그인도 열람 가능 (SEO 유입 페이지)

---

## 브랜드 가이드

| 항목 | 값 |
|------|-----|
| 배경색 | `#FAF6EF` (따뜻한 베이지) |
| 텍스트 | `#2C2417` (다크 브라운) |
| 포인트 | `#D4A035` (골드) |
| 보조 텍스트 | `#6B5B3E` (미디엄 브라운) |
| 카드 배경 | `#FFFFFF` |
| 보더 | `#E6DCCD` |
| 제목 폰트 | Noto Serif KR (serif) |
| 본문 폰트 | DM Sans (sans-serif) |
| 카드 모서리 | 16px (rounded-2xl) |
| 톤 | 따뜻하고 고급스러운 한식 느낌. 미니멀하지만 차갑지 않게 |

---

## GNB (Global Navigation Bar)

```
┌─────────────────────────────────────────────────────────────────┐
│ [M] MatDam     Explore   Glossary     [🔍 Search...]   [+ Create]   [👤] │
└─────────────────────────────────────────────────────────────────┘
```

- 좌측: 로고 (MatDam) → Home
- 중앙: Explore, Glossary 링크
- 우측: 검색바, + Create 버튼 (골드 강조), 유저 아바타

---

## 페이지 구성 (위에서 아래 순서)

### 1. 대표 이미지 (Hero)
- 넓은 히어로 이미지 (가로 전폭, 높이 300~400px)
- 예시 데이터: 계란 김밥 완성 사진

### 2. 레시피 메타 정보
- **제목:** "Egg-Wrapped Kimbap" (Noto Serif KR, 크게)
- **작성자:** @username · Feb 12, 2026
- **난이도:** Easy (뱃지 스타일)
- **조리 시간:** 20 min
- **태그:** [LOW-CARB] [GLUTEN-FREE] (칩/뱃지)
- **리믹스 표시 (조건부):** "Remixed from: [Classic Kimbap →]" 링크
  - 이 레시피가 리믹스인 경우에만 표시
  - 원본 레시피로 이동하는 링크

### 3. 액션 버튼 (가로 나열)
- **[🍳 Start Cooking]** — 쿠킹 모드 진입 (V1, 비활성 상태로 표시 가능)
- **[🔀 Remix this recipe]** — 리믹스 작성 폼으로 이동
- **[♡ Bookmark]** — 저장
- **[📤 Share]** — 공유 링크 복사

> Start Cooking과 Remix가 가장 눈에 띄어야 함. Remix 버튼은 플랫폼의 핵심 기능.

### 4. 재료 목록 (Ingredients)
- **단위 토글:** [Metric] / [Imperial] 탭 전환
- 재료 리스트:
  - • Eggs ............ 3 large
  - • Seaweed (Gim) ... 2 sheets
  - • Carrot ........... 1/2, julienned
  - • Spam ............. 100g, sliced
  - • Pickled Radish ... 4 strips
  - • Sesame Oil ....... 1 tbsp
- 각 재료명은 클릭 가능 (Glossary 페이지로 이동)
- 클릭 가능하다는 것을 시각적으로 표시 (밑줄 or 색상)

### 5. 조리법 (Cooking Steps)
- 스텝 카드 형태로 나열 (스크롤)
- 각 카드 구성:

```
┌─────────────────────────────────┐
│ Step 1 of 5                     │
│                                 │
│ Beat the eggs with a pinch      │
│ of salt. Cook thin omelette     │
│ on medium heat.                 │
│                                 │
│ Ingredients: Eggs, Salt         │
│ ⏱ Timer: 3 min                 │
│ [스텝 사진]                      │
└─────────────────────────────────┘
```

- 사용 재료: 해당 스텝에서 쓰는 재료만 표시
- 타이머: 설정된 경우만 표시
- 사진: 있는 경우만 표시
- 5개 스텝 중 최소 2~3개를 실제 데이터로 보여줄 것

### 6. Remixes of this recipe
- 이 레시피에서 파생된 리믹스 목록
- 레시피 카드 가로 스크롤 (2~3개)
- 각 카드: 사진, 제목, 작성자, "Remixed from this recipe"
- 리믹스가 없으면: "Be the first to remix this recipe!" + Remix 버튼

### 7. Reviews (MVP-β 라벨 표시)
- ⭐ 4.5 (12 reviews)
- 리뷰 카드:
  - @user · ⭐⭐⭐⭐⭐
  - "I made this!" [📷 사진 썸네일]
  - "Used avocado instead of spam, turned out great!"
- [Write a Review] 버튼

### 8. Footer
- 로고, Privacy Policy, Terms of Service 링크

---

## 반응형 참고

| 디바이스 | 레이아웃 |
|---------|---------|
| 데스크톱 | 최대 너비 제한 (max-w-4xl), 중앙 정렬 |
| 태블릿 | 좌우 패딩 축소 |
| 모바일 | 풀 너비, 히어로 이미지 전폭, 액션 버튼 세로 스택 |

---

## 핵심 포인트

1. **Remix 버튼이 눈에 띄어야 함** — 이 플랫폼의 존재 이유
2. **재료 클릭 → Glossary 연결** — 외국인이 모르는 재료를 바로 알 수 있게
3. **단위 토글** — Metric/Imperial 전환은 재료 섹션 상단에 항상 보이게
4. **"I made this!" 리뷰** — AI 레시피와의 핵심 차별점. 실제 만든 사진이 강조되어야 함
5. **Remixed from 링크** — 리믹스인 경우 원본과의 연결이 자연스럽게 보여야 함
