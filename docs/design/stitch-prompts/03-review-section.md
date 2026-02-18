<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/design/stitch-prompts/03-review-section.md -->

# Stitch Prompt: Review Section (within Recipe Detail)

> 소스: screen-flow.md §4.9 + implementation-plan.md Step 6 + master-plan §5

---

## 컴포넌트 정보

- **위치:** 레시피 상세 페이지(`/recipes/[slug]`) 하단 섹션
- **별도 페이지 아님** — 레시피 상세 안에 포함되는 섹션
- **용도:** 리뷰 열람 + 작성. "I made this!" 인증 사진이 핵심

---

## 브랜드 가이드

(01-recipe-detail.md와 동일)

---

## 섹션 구성

### 1. 리뷰 요약 헤더
```
Reviews
⭐ 4.5 average · 12 reviews · 8 photos
```
- 평균 별점 + 리뷰 수 + 사진 포함 리뷰 수

### 2. 리뷰 필터/정렬
- 정렬: [Most Recent] [Highest Rated] [With Photos]
- "With Photos" 필터가 중요 — 실제 만든 사진을 보고 싶은 유저가 많음

### 3. 리뷰 카드 목록

각 리뷰 카드 구성:

```
┌────────────────────────────────────────┐
│ [아바타] @sarah_cooks · ⭐⭐⭐⭐⭐        │
│ Feb 10, 2026                           │
│                                        │
│ 📷 "I made this!"                      │
│ ┌──────┐ ┌──────┐                      │
│ │ 사진1 │ │ 사진2 │ (최대 3장, 가로 스크롤)│
│ └──────┘ └──────┘                      │
│                                        │
│ "Used avocado instead of spam and it   │
│ turned out amazing! The egg wrap was    │
│ tricky at first but worth the effort." │
│                                        │
│ [Helpful (3)] [Reply]                  │
└────────────────────────────────────────┘
```

- **"I made this!" 뱃지** — 사진 포함 리뷰에 눈에 띄는 뱃지/라벨
- 사진은 클릭하면 확대 (라이트박스)
- 텍스트 리뷰
- Helpful 카운트 + Reply 버튼

### 4. 리뷰 작성 영역

리뷰 작성은 **인라인 섹션** (모달 아님):

```
┌────────────────────────────────────────┐
│ Write a Review                         │
│                                        │
│ Your Rating: ☆ ☆ ☆ ☆ ☆               │
│ (별 클릭으로 선택)                       │
│                                        │
│ [텍스트 입력 영역                       │
│  "Share your experience..."]           │
│                                        │
│ 📷 I made this! [Add Photos]           │
│ (최대 3장, 드래그 앤 드롭 또는 클릭)      │
│                                        │
│ [Submit Review]                        │
└────────────────────────────────────────┘
```

- 비로그인 상태에서 "Write a Review" 클릭 → "Sign in to write a review" 모달
- "I made this!" 사진 업로드가 별점/텍스트와 동등하게 강조

---

## 예시 데이터

리뷰 3~4개를 실제처럼 보여줄 것:

1. **@sarah_cooks** ⭐⭐⭐⭐⭐ — 사진 2장 포함, "I made this!" 뱃지
2. **@tokyo_foodie** ⭐⭐⭐⭐ — 사진 없음, 텍스트만
3. **@vegan_kim** ⭐⭐⭐⭐⭐ — 사진 1장, "Substituted tofu for spam"

---

## 핵심 포인트

1. **"I made this!" 사진이 가장 눈에 띄어야 함** — AI 레시피와의 핵심 차별점
2. **사진 포함 리뷰를 상단에** — 실제 결과물 사진이 레시피 신뢰도를 만듦
3. **작성 UI가 간단해야 함** — 별점 + 사진 + 텍스트, 3가지만
