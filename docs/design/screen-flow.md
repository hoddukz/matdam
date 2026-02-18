<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/design/screen-flow.md -->

# 맛담 화면 흐름도 + 메뉴 구성

> 최종 업데이트: 2026-02-17
> 목적: Stitch로 화면 생성 전, 전체 구조를 먼저 잡기 위한 설계 문서
> 기준: implementation-plan.md 확정 내용

---

## 1. 메뉴 구성

### 설계 원칙

- 유저의 4가지 핵심 행동을 메뉴로 매핑:
  1. **레시피를 찾는다** → Explore
  2. **재료를 알아본다** → Glossary
  3. **내 레시피를 올린다** → Create
  4. **내 것을 관리한다** → Profile
- MVP-α에서 V1까지 **메뉴 구조가 바뀌지 않도록** 설계 (Glossary 메뉴는 MVP-α에도 있되, 클릭 시 "Coming soon" 또는 간단한 재료 목록만 표시)

### Desktop GNB

```
┌─────────────────────────────────────────────────────────────────┐
│ [M] MatDam     Explore   Glossary     [🔍 Search...]   [+ Create]   [👤] │
└─────────────────────────────────────────────────────────────────┘
```

| 위치 | 요소 | 동작 |
|------|------|------|
| 좌측 | 로고 (MatDam) | → Home (`/`) |
| 중앙 | Explore | → 레시피 탐색 (`/explore`) |
| 중앙 | Glossary | → 재료 사전 (`/glossary`) |
| 우측 | 검색바 | 2글자 이상 입력 시 자동완성, Enter → `/explore?q=...` |
| 우측 | + Create (버튼, 강조색) | → 레시피 작성 (`/recipes/new`). 비로그인 시 로그인 모달 |
| 우측 | 유저 아바타 / Sign in | 로그인: 드롭다운 (My Recipes, Bookmarks, Shopping List, Settings, Logout). 비로그인: Sign in 버튼 → Google OAuth |

### Mobile Bottom Nav

```
┌────────────────────────────────┐
│                                │
│         (페이지 콘텐츠)          │
│                                │
├──────┬──────┬──────┬──────┬────┤
│ 🏠   │ 🔍   │  ＋  │ 📖   │ 👤 │
│ Home │Explore│Create│Gloss.│ Me │
└──────┴──────┴──────┴──────┴────┘
```

| 아이콘 | 라벨 | 동작 |
|--------|------|------|
| 🏠 Home | Home | → 홈/랜딩 (`/`) |
| 🔍 Explore | Explore | → 레시피 탐색 (`/explore`), 상단에 검색바 |
| ＋ Create | Create | → 레시피 작성. 중앙 배치 + 강조 (다른 아이콘보다 크게). 비로그인 시 로그인 모달 |
| 📖 Glossary | Glossary | → 재료 사전 (`/glossary`) |
| 👤 Me | Me | → 프로필/마이페이지 (`/profile`) |

### 단계별 메뉴 변화

메뉴 구조 자체는 바뀌지 않음. **메뉴 안의 내용**이 단계별로 채워짐:

| 메뉴 | MVP-α | MVP-β | V1 |
|------|-------|-------|-----|
| Home | 랜딩 페이지 (히어로 + 시드 레시피) | + 트렌딩 리믹스 | + 개인화 추천 |
| Explore | 카드 그리드 + 검색 + 난이도 필터 | + Dietary Filter | + 정렬 옵션 고도화 |
| Create | 단일 페이지 폼 + 재료 자동완성 | (동일) | + 드래그 재정렬, 비정형 수량 |
| Glossary | "Coming soon" 또는 재료 시드 30개 기본 목록 | 풀 Glossary (사진+설명+대체재) | (동일) |
| Profile > My Recipes | 내가 만든 레시피 목록 | (동일) | (동일) |
| Profile > Bookmarks | — | 저장한 레시피 | (동일) |
| Profile > Shopping List | — | — | 쇼핑 리스트 |
| Profile > Settings | 언어, 단위 토글 | + Dietary 기본 설정 | + 온보딩 재설정 |

---

## 2. URL 구조 + 전체 페이지 목록

### URL 설계

```
/                              → 홈/랜딩
/explore                       → 레시피 탐색 (검색+필터)
/explore?q=kimchi&diet=vegan   → 검색 결과
/recipes/[slug]                → 레시피 상세
/recipes/[slug]/cook           → 쿠킹 모드 (V1)
/recipes/new                   → 레시피 작성
/recipes/[slug]/edit           → 레시피 수정
/recipes/[slug]/remix          → 리믹스 (원본 데이터 복사된 작성 폼)
/glossary                      → 재료 사전 인덱스
/glossary/[slug]               → 재료 상세
/profile                       → 마이페이지
/profile/bookmarks             → 북마크 (MVP-β)
/profile/shopping-list         → 쇼핑 리스트 (V1)
/profile/settings              → 설정
/onboarding                    → 최초 가입 온보딩 (V1)
/privacy                       → Privacy Policy
/terms                         → Terms of Service
```

> slug 사용 이유: SEO. `/recipes/egg-wrapped-kimbap`이 `/recipes/abc123`보다 검색에 유리.

### 단계별 페이지 목록

#### MVP-α (Step 1~5)

| # | 페이지 | URL | 비고 |
|---|--------|-----|------|
| 1 | 홈/랜딩 | `/` | 히어로 + 시드 레시피 카드 + CTA |
| 2 | 레시피 탐색 | `/explore` | 카드 그리드, 검색, 난이도 필터 |
| 3 | 레시피 상세 | `/recipes/[slug]` | 재료 목록, 스텝 카드, 리믹스 버튼, Inspired by |
| 4 | 레시피 작성 | `/recipes/new` | 단일 페이지 연속 폼, 재료 자동완성 |
| 5 | 레시피 수정 | `/recipes/[slug]/edit` | 작성 폼과 동일 구조 |
| 6 | 리믹스 | `/recipes/[slug]/remix` | 원본 데이터 프리필, "Remixed from" 자동 표시 |
| 7 | 프로필 | `/profile` | 내 레시피 목록, 기본 정보 |
| 8 | 설정 | `/profile/settings` | 언어, 단위 토글 |
| 9 | Privacy Policy | `/privacy` | 정적 페이지 |
| 10 | Terms of Service | `/terms` | 정적 페이지 |
| — | 로그인 모달 | (오버레이) | Google OAuth, 비로그인 액션 시 표시 |

#### MVP-β 추가 (Step 6~7)

| # | 페이지 | URL | 비고 |
|---|--------|-----|------|
| 11 | Glossary 인덱스 | `/glossary` | 재료 카드 그리드, 검색, 카테고리 필터 |
| 12 | Glossary 상세 | `/glossary/[slug]` | 사진, 다국어 설명, 대체재, "Where to buy", 관련 레시피 |
| 13 | 북마크 | `/profile/bookmarks` | 저장한 레시피 카드 목록 |
| — | 리뷰 작성 | (레시피 상세 내 섹션) | 별점 + 텍스트 + 사진 업로드 |
| — | 로그인 유도 모달 | (오버레이) | "Sign in to save this recipe" |

#### V1 추가 (Step 8~12)

| # | 페이지 | URL | 비고 |
|---|--------|-----|------|
| 14 | 쿠킹 모드 | `/recipes/[slug]/cook` | 풀스크린, 스텝별 카드, 타이머, 재료 하이라이트 |
| 15 | 쇼핑 리스트 | `/profile/shopping-list` | 선택한 레시피들의 재료 합산 목록 |
| 16 | 냉장고 털이 | `/explore?mode=fridge` | 보유 재료 입력 → 매칭 레시피 |
| 17 | 온보딩 | `/onboarding` | 식단 제한 + 난이도 선택 |
| — | 신고 모달 | (오버레이) | 사유 선택 |

---

## 3. 화면 흐름도

### 전체 맵

```
                        ┌─────────┐
                        │   홈    │ (/)
                        │ 랜딩    │
                        └────┬────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Explore  │  │ Glossary │  │  Create  │
        │ 레시피탐색│  │ 재료사전  │  │ 레시피작성│
        └────┬─────┘  └────┬─────┘  └──────────┘
             │              │              ▲
             ▼              ▼              │
        ┌──────────┐  ┌──────────┐         │
        │  레시피   │  │  재료    │         │
        │  상세    │──│  상세    │         │
        └────┬─────┘  └──────────┘         │
             │                              │
     ┌───────┼────────┬──────────┐         │
     ▼       ▼        ▼          ▼         │
┌────────┐┌──────┐┌───────┐┌─────────┐    │
│쿠킹모드││리믹스 ││리뷰   ││북마크    │    │
│(V1)   ││  폼  ││작성   ││추가     │    │
└────────┘└──┬───┘└───────┘└─────────┘    │
             │                             │
             └─────────────────────────────┘
                   (리믹스 = 프리필된 Create)
```

### Journey 1: 탐색 → 요리 (핵심 루프)

```
홈(/) ──→ Explore(/explore) ──→ 레시피 상세(/recipes/[slug])
  │           │                      │
  │      검색/필터                    ├──→ 쿠킹 모드 진입 (/recipes/[slug]/cook) [V1]
  │                                  │         │
  └── 트렌딩 카드 클릭 ──────────────┘         ├── 스텝별 카드 넘기기
                                               ├── 타이머 시작/관리
                                               └── 완료 → "남은 재료로 만들 수 있는 레시피" [V1]
```

### Journey 2: 리믹스

```
레시피 상세 ──→ [Remix this recipe] 클릭
                    │
                    ▼ (비로그인 → 로그인 모달)
              리믹스 폼 (/recipes/[slug]/remix)
                    │
                    │ 원본 데이터 프리필 상태
                    │ 수정 후 저장
                    │
                    ▼
              내 리믹스 상세 (/recipes/[my-slug])
                    │
                    └── "Remixed from [원본 제목]" 자동 표시
                        원본 레시피에도 "Remixes" 목록에 추가
```

### Journey 3: 리뷰 + "I made this!" (MVP-β)

```
레시피 상세 ──→ 하단 스크롤 ──→ 리뷰 섹션
                                   │
                                   ├── 기존 리뷰 열람
                                   │
                                   └── [Write a Review] 클릭
                                          │
                                          ▼ (비로그인 → 로그인 모달)
                                     리뷰 작성 영역
                                          │
                                          ├── ⭐ 별점 (1~5)
                                          ├── 텍스트 입력
                                          └── [I made this!] 사진 업로드 (최대 3장)
                                                │
                                                ▼
                                          레시피 상세에 리뷰 표시
```

### Journey 4: 재료 학습 (MVP-β)

```
레시피 상세 ──→ 재료 목록에서 [고추장] 클릭
                    │
                    ▼
              Glossary 상세 (/glossary/gochujang)
                    │
                    ├── 사진 + 영어/한국어 이름
                    ├── 설명 ("Fermented chili paste...")
                    ├── 대체재 ("Similar to sriracha but thicker")
                    ├── Where to buy ("H-Mart, Amazon...")
                    ├── 이 재료를 사용한 레시피 목록
                    └── [V1] 이 재료를 사용한 리뷰 N건
```

### Journey 5: 쇼핑 리스트 (V1)

```
레시피 상세 ──→ [Add to Shopping List] 클릭
                    │
                    ▼ (여러 레시피 반복)

Profile > Shopping List (/profile/shopping-list)
                    │
                    ├── 선택한 레시피 목록
                    ├── 재료 합산 리스트 (겹치는 재료 수량 합산)
                    ├── 단위 토글 (Metric/Imperial)
                    └── 체크박스로 장본 항목 표시
```

### Journey 6: 레시피 작성 (상세)

```
[+ Create] 클릭
     │
     ▼ (비로그인 → 로그인 모달)

레시피 작성 (/recipes/new) — 단일 페이지, 스크롤하며 입력
     │
     │  ┌── 기본 정보 (섹션 1)
     │  │     ├── 제목 (영어)
     │  │     ├── 설명 (한 줄)
     │  │     ├── 대표 이미지 업로드
     │  │     ├── 난이도 선택 (Easy / Intermediate / Advanced)
     │  │     ├── 조리 시간
     │  │     └── Dietary Tags (Vegan, Halal, Gluten-free...) 선택
     │  │
     │  ├── 재료 입력 (섹션 2)
     │  │     ├── 텍스트 입력 → 하단에 자동완성 제안 (탭/클릭으로 선택)
     │  │     │     예: "gochu" 입력 → Gochujang, Gochugaru 제안
     │  │     ├── 선택 후 수량 + 단위 입력 → 칩으로 추가
     │  │     ├── 추가된 재료 칩 목록 (✕로 삭제)
     │  │     └── [V1] 비정형 수량 버튼 ("약간", "적당히")
     │  │
     │  ├── 조리법 입력 (섹션 3)
     │  │     ├── 카드 1장 = 스텝 1개
     │  │     ├── 텍스트 입력 + Enter 2번 = 다음 카드 자동 생성
     │  │     ├── 카드별 사진 업로드 (선택)
     │  │     ├── 카드별 타이머 설정 (선택)
     │  │     ├── 카드별 사용 재료 연결 (섹션 2에서 추가한 재료 중 선택)
     │  │     └── [V1] 드래그로 순서 변경
     │  │
     │  └── 하단 액션
     │        ├── [Save Draft] — 언제든 저장
     │        ├── [Preview] — 레시피 상세와 동일 레이아웃으로 미리보기
     │        │     └── [V1] Recipe Linter 경고 표시
     │        └── [Publish] — 발행 → 레시피 상세로 이동
     │
     └── 페이지 전환 없이 스크롤로 모든 섹션 접근
```

---

## 4. 페이지별 구성 요소

> Stitch에 넣을 때 이 목록을 참고. 각 페이지에 뭐가 있어야 하는지.

### 4.1 홈/랜딩 (/)

```
┌─────────────────────────────────────┐
│ [GNB]                               │
├─────────────────────────────────────┤
│                                     │
│  히어로 섹션                         │
│  - 배경: 한식 사진 2분할             │
│  - 카피: "The Soul of Korean        │
│          Taste, Your Way."          │
│  - CTA: [Start Cooking]             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Trending Remixes                   │
│  - 레시피 카드 3개 (가로 그리드)      │
│  - 카드: 사진, 제목, "Remixed from", │
│    작성자, 난이도, 시간, 태그         │
│  - [View all remixes →]             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Essential Ingredients              │
│  - 재료 카드 가로 스크롤              │
│  - 카드: 재료 사진, 영어명, 한줄설명   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [MVP-β] Cook of the Week           │
│  - 유저 프로필 하이라이트             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [MVP-β] K-Drama Cravings           │
│  - 드라마별 레시피 카드 2개           │
│                                     │
├─────────────────────────────────────┤
│ [Footer]                            │
│  - 로고, 링크(Discover/Community),   │
│    단위토글, 언어선택,                │
│    Privacy/Terms                    │
└─────────────────────────────────────┘
```

### 4.2 레시피 탐색 (/explore)

```
┌─────────────────────────────────────┐
│ [GNB]                               │
├─────────────────────────────────────┤
│                                     │
│  검색바 (크게, 페이지 상단)           │
│  [🔍 Search Korean recipes...]      │
│                                     │
│  필터 칩 (가로 스크롤)               │
│  [All] [Easy] [Intermediate]        │
│  [Advanced] [Vegan] [Halal]         │
│  [Gluten-free]                      │
│                                     │
│  정렬: Newest / Popular /            │
│        Most Remixed                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  레시피 카드 그리드                   │
│  (3열 데스크톱 / 2열 태블릿 / 1열 모바일) │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │  사진    │ │  사진    │ │  사진   ││
│  │ 제목     │ │ 제목     │ │ 제목    ││
│  │ Remixed  │ │ 작성자   │ │ 작성자  ││
│  │ from ... │ │ 난이도   │ │ 태그    ││
│  │ ♡ 🕐    │ │ ♡ 🕐    │ │ ♡ 🕐   ││
│  └─────────┘ └─────────┘ └────────┘│
│                                     │
│  [Load more] 또는 무한 스크롤        │
│                                     │
└─────────────────────────────────────┘
```

### 4.3 레시피 상세 (/recipes/[slug])

```
┌─────────────────────────────────────┐
│ [GNB]                               │
├─────────────────────────────────────┤
│                                     │
│  대표 이미지 (히어로, 넓게)           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  제목: "Egg-Wrapped Kimbap"         │
│  작성자: @username · 날짜            │
│  난이도: Easy · 시간: 20min          │
│  태그: [LOW-CARB] [GLUTEN-FREE]     │
│                                     │
│  [Remixed from: Original Kimbap →]  │
│  (리믹스인 경우에만 표시)             │
│                                     │
│  액션 버튼:                          │
│  [🍳 Start Cooking] [🔀 Remix]     │
│  [♡ Bookmark] [📤 Share]           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  재료 목록                           │
│  ┌─────────────────────────────┐    │
│  │ 단위 토글: [Metric] [Imperial]│   │
│  ├─────────────────────────────┤    │
│  │ • Eggs ............ 3 large │    │
│  │ • Seaweed ......... 2 sheets│    │
│  │ • Carrot .......... 1/2, 채썰기│  │
│  │ • Spam ............ 100g    │    │
│  │   (재료 클릭 → Glossary 이동) │   │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  조리법 (스텝 카드)                  │
│  ┌─────────────────────────────┐    │
│  │ Step 1 of 5                 │    │
│  │                             │    │
│  │ Beat the eggs with a pinch  │    │
│  │ of salt. Cook thin omelette │    │
│  │ on medium heat.             │    │
│  │                             │    │
│  │ 사용 재료: Eggs, Salt        │    │
│  │ ⏱ 타이머: 3분               │    │
│  │ [사진]                       │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Step 2 of 5                 │    │
│  │ ...                         │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Remixes of this recipe (N개)       │
│  레시피 카드 가로 스크롤              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [MVP-β] Reviews                    │
│  ⭐ 4.5 (12 reviews)               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ @user · ⭐⭐⭐⭐⭐            │    │
│  │ "I made this!" [📷 사진]    │    │
│  │ "Used avocado instead of..."│    │
│  └─────────────────────────────┘    │
│                                     │
│  [Write a Review]                   │
│                                     │
├─────────────────────────────────────┤
│ [Footer]                            │
└─────────────────────────────────────┘
```

### 4.4 레시피 작성 (/recipes/new)

단일 페이지 연속 폼. 스크롤하면서 위에서 아래로 작성.

```
┌─────────────────────────────────────┐
│ [간소화된 GNB: 로고 + Save Draft + Publish] │
├─────────────────────────────────────┤
│                                     │
│  ── 섹션 1: 기본 정보 ──            │
│                                     │
│  제목: [                      ]     │
│  설명: [                      ]     │
│  대표 이미지: [📷 업로드]            │
│  난이도: (Easy)(Intermediate)(Adv)  │
│  조리 시간: [  ]분                  │
│  태그: □Vegan □Halal □Gluten-free  │
│                                     │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                     │
│  ── 섹션 2: 재료 ──                 │
│                                     │
│  [gochu___                    ]     │
│  ┌─────────────────────────┐        │
│  │ Gochujang  고추장         │ ← 탭  │
│  │ Gochugaru  고춧가루       │       │
│  │ Green Onion  파           │       │
│  └─────────────────────────┘        │
│  (선택 후)  수량: [2] 단위: [tbsp ▼] │
│            [+ 추가]                  │
│                                     │
│  추가된 재료:                        │
│  [Gochujang 2 tbsp ✕]              │
│  [Eggs 3 large ✕]                  │
│  [Seaweed 2 sheets ✕]              │
│                                     │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                     │
│  ── 섹션 3: 조리법 ──               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Step 1                      │    │
│  │ [텍스트 입력 영역]           │    │
│  │ [📷 사진] [⏱ 타이머]        │    │
│  │ 사용 재료: [Eggs ▼]         │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Step 2                      │    │
│  │ [텍스트 입력 영역]           │    │
│  │ Enter 2번 → Step 3 자동 생성 │    │
│  └─────────────────────────────┘    │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │ + Add step                   │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [Save Draft]  [Preview]  [Publish] │
│                                     │
└─────────────────────────────────────┘
```

**재료 자동완성 동작 상세:**
- 텍스트 입력 시 2글자 이상이면 하단에 추천 목록 표시 (Glossary DB 기반)
- 탭 또는 클릭으로 선택 → 수량/단위 입력 필드 활성화
- 추가 버튼 클릭 → 칩으로 재료 목록에 추가
- Glossary에 없는 재료는 직접 입력 가능 (자유 텍스트)

### 4.5 쿠킹 모드 (/recipes/[slug]/cook) — V1

```
┌─────────────────────────────────────┐
│  [✕ 닫기]     Step 3 / 7     [⏱ 2] │
│              ████████░░░░           │
├─────────────────────────────────────┤
│                                     │
│                                     │
│     [스텝 사진]                      │
│                                     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Place the seaweed on a cutting     │
│  board. Lay the egg omelette on     │
│  top, then arrange fillings in      │
│  a line along the center.           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  이 스텝 재료:                       │
│  ● Seaweed 2 sheets                │
│  ● Egg omelette (from Step 1)       │
│  ● Carrot, Spam, Pickled radish     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [⏱ 타이머 시작: 3분]               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ◀ 스와이프 또는 큰 버튼 ▶          │
│    [← Prev]           [Next →]      │
│                                     │
└─────────────────────────────────────┘

플로팅 타이머 (카드 넘겨도 유지):
┌─────────────────┐
│ Step 1 ⏱ 2:34  │
│ Step 3 ⏱ 0:45  │
└─────────────────┘
```

**디바이스별 변형:**

| 디바이스 | 레이아웃 |
|---------|---------|
| 모바일 (세로) | 풀카드 1장 + 하단에 다음 카드 peek (10%) |
| 태블릿 (가로) | 좌: 현재 스텝 / 우: 재료+타이머 (PPT 발표자 보기) |
| 데스크톱 | 좌: 재료 목록 고정 / 우: 스텝 카드 (좌우 분할) |

### 4.6 Glossary 인덱스 (/glossary) — MVP-β

```
┌─────────────────────────────────────┐
│ [GNB]                               │
├─────────────────────────────────────┤
│                                     │
│  Korean Ingredients Glossary        │
│  "Your guide to Korean pantry       │
│   essentials"                       │
│                                     │
│  [🔍 Search ingredients...]         │
│                                     │
│  카테고리 탭:                        │
│  [All] [Sauces] [Vegetables]        │
│  [Proteins] [Grains] [Spices]       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  재료 카드 그리드                     │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ [사진]  │ │ [사진]  │ │ [사진]  │  │
│  │ Gochu- │ │ Doen-  │ │ Gochu- │  │
│  │ jang   │ │ jang   │ │ garu   │  │
│  │ 고추장  │ │ 된장   │ │ 고춧가루│  │
│  │ Chili  │ │ Soybean│ │ Chili  │  │
│  │ Paste  │ │ Paste  │ │ Flakes │  │
│  └────────┘ └────────┘ └────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 4.7 Glossary 상세 (/glossary/[slug]) — MVP-β

```
┌─────────────────────────────────────┐
│ [GNB]                               │
├─────────────────────────────────────┤
│                                     │
│  [← Back to Glossary]               │
│                                     │
│  [재료 사진 (크게)]                   │
│                                     │
│  Gochujang  고추장                   │
│  Korean Chili Paste                 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  What is it?                        │
│  A thick, fermented chili paste     │
│  made from red chili, glutinous     │
│  rice, and soybeans...              │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Substitutes                        │
│  • Sriracha + miso (closest)        │
│  • Sambal oelek + honey             │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Where to buy                       │
│  • H-Mart (US/Canada)               │
│  • Amazon: [link]                   │
│  • Any Asian grocery store           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Recipes using this ingredient       │
│  [레시피 카드 가로 스크롤]            │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [MVP-β] Reviews mentioning         │
│  this ingredient (N건)              │
│                                     │
└─────────────────────────────────────┘
```

### 4.8 프로필/마이페이지 (/profile)

```
┌─────────────────────────────────────┐
│ [GNB]                               │
├─────────────────────────────────────┤
│                                     │
│  [아바타]  @username                 │
│           Joined Feb 2026           │
│           12 recipes · 3 remixes    │
│                                     │
│  [Edit Profile]                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  탭: [My Recipes] [My Remixes]      │
│       [Bookmarks (MVP-β)]           │
│                                     │
│  레시피 카드 그리드                   │
│  (본인 레시피만 표시)                 │
│                                     │
└─────────────────────────────────────┘
```

### 4.9 모달/오버레이 상태

| 모달 | 트리거 | 내용 |
|------|--------|------|
| 로그인 모달 | 비로그인 상태에서 Create/Remix/Bookmark/Review 클릭 | "Sign in to continue" + Google 로그인 버튼 + 한 줄 설명 |
| 로그인 유도 모달 | 비로그인 상태에서 Bookmark 클릭 | "Sign in to save this recipe" + Google 버튼 |
| 리뷰 작성 (MVP-β) | 레시피 상세에서 "Write a Review" | 별점 선택 + 텍스트 + 사진 업로드 (인라인 섹션, 모달 아님) |
| 신고 (V1) | 레시피/리뷰의 ⋯ 메뉴 → Report | 사유 선택 라디오 + 추가 설명 텍스트 |
| 삭제 확인 | 내 레시피/리뷰 삭제 | "Are you sure?" + Cancel/Delete |

---

## 5. Stitch 작업 순서 권장

Stitch로 화면을 만들 때, 이 순서로 진행하면 효율적:

### Phase 1: 핵심 화면 (MVP-α 필수)

| 순서 | 화면 | 의존 | Stitch 프롬프트 핵심 키워드 |
|------|------|------|--------------------------|
| 1 | 레시피 상세 | — | recipe detail, ingredient list with unit toggle, step cards, remix button, warm beige tone |
| 2 | 레시피 탐색 | 1 (카드 디자인 재사용) | recipe card grid, search bar, filter chips, Korean food |
| 3 | 레시피 작성 | — | single page recipe form, ingredient text input with autocomplete dropdown, step cards, save/preview/publish |
| 4 | 홈/랜딩 리디자인 | 1, 2 | 기존 프로토타입 기반 개선 |
| 5 | 프로필 | 1 (카드 재사용) | user profile, my recipes grid |

### Phase 2: MVP-β 화면

| 순서 | 화면 | Stitch 프롬프트 핵심 키워드 |
|------|------|--------------------------|
| 6 | Glossary 인덱스 | ingredient glossary, card grid, category tabs, Korean pantry |
| 7 | Glossary 상세 | ingredient detail, photo, substitutes, where to buy |
| 8 | 리뷰 섹션 (상세 페이지 내) | review section, star rating, photo review, "I made this" |

### Phase 3: V1 화면

| 순서 | 화면 | Stitch 프롬프트 핵심 키워드 |
|------|------|--------------------------|
| 9 | 쿠킹 모드 (모바일) | cooking mode, fullscreen step card, timer, swipe navigation |
| 10 | 쿠킹 모드 (태블릿) | split view, ingredients left, steps right |
| 11 | 쿠킹 모드 (데스크톱) | split layout, fixed ingredients sidebar |
| 12 | 쇼핑 리스트 | shopping list, ingredient merge, checkbox |
| 13 | 온보딩 | onboarding wizard, dietary preferences, difficulty selection |

---

## 6. 브랜드 가이드 (Stitch 입력용)

Stitch에 넣을 때 일관성을 위한 참고:

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
