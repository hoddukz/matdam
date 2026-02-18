<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/tech/implementation-plan.md -->

# 맛담 구현 계획

> 최종 업데이트: 2026-02-17
> 기준: matdam-master-plan_v1.0.0 + tech-stack.md 확정 내용

---

## 페이즈별 킬러 기능 + 서비스 최소 기능 시점

### 킬러 기능 요약

| 단계 | 킬러 기능 | 왜 킬러인가 |
|------|----------|------------|
| **MVP-α** | **Universal Ingredient ID** (Step 2) | 플랫폼의 "두뇌". 단위 변환, Glossary, 쇼핑 리스트, 식단 필터, affiliate — 이후 모든 기능의 기반. 잘못 잡으면 전체 데이터 마이그레이션 필요 |
| **MVP-α** | **리믹스 버튼** (Step 4) | 맛담의 존재 이유. 이 버튼을 누르느냐 안 누르느냐가 GO/PIVOT 판단 근거 |
| **MVP-α** | **슬라이드 입력** (Step 3) | 작성 화면 = 소비 화면(쿠킹 모드). 데이터 구조가 여기서 확정되어야 V1 쿠킹 모드와 1:1 매칭 |
| **MVP-β** | **"I made this!" 사진 리뷰** (Step 6) | AI 레시피와의 핵심 차별점. "실제로 만들어본 사람의 검증된 결과물" 포지셔닝의 근거 |
| **MVP-β** | **Ingredient Glossary** (Step 7) | 외국인 진입 장벽 해소. "고추장이 뭔데?" → 사진+설명+대체재. 이게 없으면 타겟 유저가 레시피 앞에서 멈춤 |
| **V1** | **쿠킹 모드** (Step 8) | 플랫폼 최대 차별화 기능. 만개의레시피, 해먹남녀에도 없음. "읽는 레시피"가 아닌 "요리하면서 보는 레시피" |
| **V1** | **연쇄 자동완성 풀 스펙** (Step 9) | 재료 입력 UX의 완성. 키보드에서 손 안 떼고 3~4초에 재료 하나 완료 |
| **V2** | **레시피 트리 시각화** | "한식이 전 세계에서 어떻게 변형되는가"를 보여주는 맛담만의 데이터 자산 |

### 서비스 시점 구분

```
MVP-α Step 5 완료 ← 검증용 프로토타입
                     Reddit 소프트 런칭으로 가설 테스트
                     "서비스"가 아닌 "실험"

MVP-β Step 7 완료 ← 검증 완료 + 피드백 반영
                     리뷰, Glossary, 식단 필터까지 붙었지만
                     킬러 기능(쿠킹 모드) 없이는 경쟁 플랫폼과 차별점 부족
                     아직 "서비스"라기보다 "베타"

V1 완성           ← 서비스 가능 시점  ★
                     쿠킹 모드 + 쇼핑 리스트 + 연쇄 추천 + Recipe Linter
                     "다른 곳에 없는 것"이 갖춰진 상태
                     이 시점부터 Vercel Pro + Supabase Pro + Meilisearch 전환
                     2명 기준 ~18주 / 3명 기준 ~14주
```

> 요약: MVP-α/β는 **검증 단계**, **V1 완성이 서비스 런칭 시점**. 3명이면 서비스 시작을 약 1개월 앞당길 수 있음.

---

## 0. 현재 프로젝트 상태

### 완료된 항목

| 항목 | 상태 | 위치 |
|------|------|------|
| 모노레포 스캐폴딩 | ✅ | `pnpm-workspace.yaml`, `turbo.json` |
| Next.js 15 App Router 기본 세팅 | ✅ | `apps/web/` |
| next-intl v4 라우팅 (`en`, `ko`) | ✅ | `apps/web/src/i18n/`, `middleware.ts` |
| Tailwind CSS v4 설정 | ✅ | `apps/web/tailwind.config.ts` |
| 공유 타입 정의 (Recipe, Ingredient, User) | ✅ | `packages/types/src/` |
| 단위 변환 유틸리티 | ✅ | `packages/utils/src/unit-conversion.ts` |
| Supabase 클라이언트 스켈레톤 | ✅ | `packages/supabase/src/client.ts` |
| 브랜드 컬러/폰트 설정 | ✅ | `tailwind.config.ts` |
| 랜딩 페이지 프로토타입 | ✅ | `docs/design/landing-prototype.html` |

### 아직 안 된 항목

- Supabase 프로젝트 생성 및 실제 연동
- DB 테이블/RLS 정책 생성
- shadcn/ui 초기화
- ESLint/Prettier/husky 설정
- Sentry 연동
- Analytics 연동 (Vercel Analytics + PostHog)
- Vercel 배포 연결
- 소셜 로그인 (Google Auth)
- 실제 페이지 구현 (전부)

---

## 1. Phase 0 + MVP-α Step 1 — 검증과 개발 동시 시작 (2~4주)

> Phase 0(수요 검증)과 MVP-α Step 1(개발 환경 구축)은 **동시에 진행**한다.
> 검증 결과를 기다리며 손 놓고 있지 않고, 인프라/인증 기반을 먼저 깔아놓는 구조.
> GO 판정 시 Step 2로 바로 이어지고, PIVOT 판정 시 방향만 틀면 된다.

### 콘텐츠 트랙 (Phase 0: 수요 검증)

| # | 작업 | 산출물 |
|---|------|--------|
| 0-1 | Reddit 계정 활동 시작 (댓글/답변으로 karma 쌓기) | - |
| 0-2 | **1차 글 게시: 계란김밥** (r/KoreanFood → r/cooking) | 반응 데이터 |
| 0-3 | 1차 결과 분석 + 댓글 소통 | - |
| 0-4 | **2차 글 게시: 김치볶음밥** (r/KoreanFood → r/cooking) | 반응 데이터 |
| 0-5 | 최종 판단 (GO / PIVOT) | 판단 문서 |
| 0-6 | 시드 레시피 10개 목록 확정 + 재료 시드 30개 정리 | 스프레드시트 |

**GO/PIVOT 판단 기준:** `docs/research/reddit-validation-strategy.md` 참고

**Phase 0 결과에 따른 분기:**

| 판정 | Step 2~5 변경 범위 |
|------|-------------------|
| **GO** | 현재 플랜대로 Step 2→3→4→5 진행 |
| **PIVOT-A** (쿠킹 모드 중심) | Step 2 범위 축소, Step 3~4에서 쿠킹 모드 프로토타입을 당김. 리믹스 삭제 |
| **PIVOT-B** (재료 가이드 중심) | Step 2~3에서 Glossary를 MVP-α로 당김. 레시피 CRUD는 부가 기능으로 축소 |
| **PIVOT-C** (큐레이션 중심) | 계정/작성 기능 축소, 탐색/SEO/콘텐츠 파이프라인 강화. 커뮤니티 기능 제거 |

> 상세 시나리오: `docs/research/reddit-validation-strategy.md` § PIVOT 시 대안 방향

### Dev 트랙 (MVP-α Step 1: 개발 환경 + 인증 기반)

> Phase 0와 **동시 진행**. 의존 없이 바로 시작 가능.

| # | 작업 | 상세 |
|---|------|------|
| 1-1 | shadcn/ui 초기화 | `npx shadcn@latest init`, 기본 컴포넌트 설치 (Button, Dialog, DropdownMenu, Input, Card 등) |
| 1-2 | ESLint + Prettier + husky 설정 | `@typescript-eslint/no-explicit-any: "error"`, lint-staged, 커밋 가드 |
| 1-2a | GitHub Actions CI 파이프라인 | PR마다 자동 실행: `pnpm lint` → `pnpm type-check` → `pnpm test` (Vitest). E2E(Playwright)는 V1부터 |
| 1-3 | Supabase 프로젝트 생성 | 대시보드에서 프로젝트 생성, 환경 변수(.env.local) 설정 |
| 1-4 | DB 테이블 생성 + RLS 정책 | `users`, `recipes`, `ingredients`, `units` 테이블. RLS 기본 템플릿 적용 (아래 참고) |
| 1-5 | Supabase Auth 연동 | Google 소셜 로그인 + 기본 UserProfile 자동 생성 트리거 |
| 1-6 | Vercel 배포 연결 | GitHub 연동, 프리뷰 배포 확인 |
| 1-7 | Sentry 연동 | `@sentry/nextjs` 설치, 클라이언트+서버 에러 수집 |
| 1-8 | 기본 레이아웃 | GNB (Explore, Glossary, Create, Profile), 푸터, 언어 토글 |
| 1-9 | Analytics 연동 | Vercel Analytics (트래픽) + PostHog (행동 분석). PostHog: `autocapture: false`, EU 서버, `persistence: 'memory'` (cookieless). GA4는 MVP에서 제외 |

**MVP-α 핵심 이벤트 스키마 (PostHog 수동 capture만):**

| 이벤트 | 시점 | 용도 |
|--------|------|------|
| `signup_completed` | 가입 완료 | 전환 기준: 가입 유저 수 |
| `recipe_created` | 레시피 등록 완료 | 전환 기준: 유저 등록 레시피 수 |
| `remix_button_clicked` | 리믹스 버튼 클릭 | 전환 기준: 리믹스 시도 여부 (GO/PIVOT 핵심) |
| `recipe_viewed` | 레시피 상세 진입 | 보조: 조회 → 작성 전환율 계산 |
| `search_performed` | 검색 실행 | 보조: 검색 → 조회 전환율 계산 |

**RLS 정책 기본 템플릿:**

| 테이블 분류 | SELECT | INSERT | UPDATE | DELETE |
|------------|--------|--------|--------|--------|
| 공개 읽기 (`recipes`, `ingredients`, `units`) | `true` (누구나) | `auth.uid() IS NOT NULL` | `auth.uid() = author_id` | `auth.uid() = author_id` |
| 본인 전용 (`bookmarks`, `shopping_lists`) | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| 관리용 (마이그레이션, 시드) | `service_role` 전용 — 클라이언트 절대 노출 금지 | | | |

**완료 기준:**
- [x] `pnpm dev`로 로컬 실행 시 랜딩 페이지 표시
- [ ] Google 로그인 후 DB에 유저 레코드 생성 확인
- [ ] Vercel에 배포 후 접속 가능
- [ ] Sentry에 테스트 에러 수신 확인
- [ ] `any` 사용 시 lint 에러 발생 확인
- [ ] GitHub PR 생성 시 CI(lint + type-check) 자동 실행 확인
- [ ] PostHog 대시보드에서 테스트 이벤트 수신 확인
- [ ] Vercel Analytics 대시보드에서 페이지뷰 확인

---

## 2. MVP-α — "사람이 써볼 수 있는 상태" (Step 2~5, 3~4주)

> 검증 목표: **"외국인이 한식 리믹스 레시피를 올리고 싶어하는가?"**
> Step 1은 위 Phase 0에서 이미 완료. 여기서는 Step 2부터 시작.

### Step 2: 재료 엔진 기초 (1주) — KILLER: Universal Ingredient ID

**의존:** Step 1 (DB 테이블 필요)

| # | 작업 | 상세 |
|---|------|------|
| 2-1 | Ingredient 시드 데이터 삽입 | 핵심 30개, 풀 데이터 (다국어 이름, category, common_units, default_unit, dietary_flags, substitutes) |
| 2-2 | Unit 시드 데이터 삽입 | 주요 단위 (tbsp, tsp, cup, g, ml 등) 다국어 라벨 포함 |
| 2-3 | 재료 자동완성 API | Supabase RPC 또는 client query — 2~3글자 입력 시 후보 반환 |
| 2-4 | 재료 입력 3단 폼 (기본 버전) | 재료 검색 드롭다운 → 수량 입력 → 단위 선택. React Hook Form + Zod |
| 2-5 | 단위 변환 토글 UI | Metric ↔ Imperial 원클릭 전환. Zustand로 전역 설정 유지 |

**완료 기준:**
- [ ] 재료 검색 시 2글자부터 자동완성 동작
- [ ] 재료 선택 → 수량 → 단위 3단계 입력 완료 시 칩으로 표시
- [ ] 단위 토글 클릭 시 변환 가능한 항목의 수량이 변환 (qualifier가 "약간"/"적당히" 등인 비정형은 그대로 유지. 전면 변환은 V1에서 확장)

### Step 3: 레시피 CRUD + 슬라이드 입력 기본 (2주) — KILLER: 슬라이드 입력 (작성=소비)

**의존:** Step 2 (재료 입력 폼 필요)

> **MVP 범위 컷라인:** 슬라이드 입력은 "카드 분리 + 기본 입력"까지만. 드래그 순서 변경, 타이머 고도화는 Step 9에서. shadcn/ui 기본 컴포넌트만 사용, 커스텀 최소화.

| # | 작업 | 상세 |
|---|------|------|
| 3-1 | 레시피 DB 스키마 | `recipes`, `recipe_steps` 테이블 + RLS 정책 |
| 3-2 | 레시피 등록 폼 | 제목 → 재료 입력(Step 2 폼) → 슬라이드 방식 조리법 입력 |
| 3-3 | 슬라이드 입력 기본 버전 | 카드 한 장 = 한 스텝. Enter 2번 = 다음 스텝. 카드별 타이머(선택)/사진(선택). **드래그 재정렬은 Step 9으로 미룸** |
| 3-4 | 이미지 업로드 | `browser-image-compression`으로 클라이언트 압축 → Supabase Storage 업로드 |
| 3-5 | 레시피 상세 페이지 | 재료 목록(단위 토글), 스텝 카드, 작성자 정보 |
| 3-6 | 레시피 목록/탐색 페이지 | 카드 그리드, 난이도 필터, 기본 검색 (PGroonga) |
| 3-7 | PGroonga 활성화 + 검색 | Supabase 대시보드에서 PGroonga 확장 활성화, 검색 인덱스 생성, `extensions` 스키마 경로 확인. **MVP 검색 범위: title + ingredients만. steps 전문 검색은 V1에서 확장** |
| 3-8 | SEO: SSR 렌더 | 레시피 상세 SSR, `og:image`, `<title>`, JSON-LD 구조화 데이터 (Recipe schema) |
| 3-9 | SEO: 크롤링 인프라 | `sitemap.xml` 자동 생성 (Next.js `app/sitemap.ts`), `robots.txt`, 레시피 페이지 `<link rel="canonical">` 설정 |

**완료 기준:**
- [ ] 레시피 등록 → 상세 페이지 → 목록에 표시되는 전체 흐름 동작
- [ ] 슬라이드 입력에서 Enter 2번으로 스텝 분리 동작
- [ ] 이미지 업로드 후 상세 페이지에서 표시
- [ ] 한국어/영어 검색 모두 결과 반환
- [ ] Google에서 레시피 페이지 크롤링 가능 (SSR 확인)

### Step 4: 리믹스 기본 (0.5주) — KILLER: 리믹스 (가설 검증 핵심)

**의존:** Step 3 (레시피 CRUD 필요)

| # | 작업 | 상세 |
|---|------|------|
| 4-1 | 리믹스 버튼 | "Remix this recipe" → 원본 데이터 복사 후 수정 가능한 새 폼 |
| 4-2 | 부모/루트 연결 | `parent_recipe_id`, `root_recipe_id` 자동 설정 |
| 4-3 | Inspired by 표시 | 레시피 상세에서 "Remixed from [원본 제목]" 링크 자동 표시 |
| 4-4 | 리믹스 목록 | 원본 레시피 하단에 "Remixes of this recipe" 카드 리스트 |

**완료 기준:**
- [ ] 리믹스 버튼 클릭 → 원본 데이터가 채워진 수정 폼 표시
- [ ] 저장 후 원본 레시피와 양방향 연결 확인

### Step 5: 시드 콘텐츠 + 런칭 준비 (1주)

**의존:** Step 4, Phase 0 콘텐츠 준비

| # | 작업 | 상세 |
|---|------|------|
| 5-1 | 시드 레시피 10개 등록 | 영어 우선, 직접 요리한 사진 필수. **콘텐츠 품질 기준:** 사진 최소 3장(완성 + 조리 과정 + 단면/디테일), 자연광 촬영, 영어 톤 가이드(casual but clear, 2인칭 "you" 사용, 약어 지양) |
| 5-2 | 리믹스 본보기 1~2개 | 정통 → 현지화 예시 (예: 정통 된장찌개 → 비건 된장찌개) |
| 5-3 | Privacy Policy + ToS | 푸터 링크, DMCA 이메일 접수 안내 |
| 5-4 | 랜딩 페이지 마무리 | 프로토타입 기반으로 실제 Next.js 페이지 구현 |
| 5-5 | 최종 QA | 전체 플로우 수동 테스트, Sentry 에러 확인 |
| 5-6 | **Reddit 소프트 런칭** | r/KoreanFood에 "한식 리믹스 레시피를 공유하는 사이트를 만들었다" 글 게시 |

**완료 기준:**
- [ ] 10개 이상의 레시피가 등록되어 있고, 최소 1개의 리믹스 본보기 존재
- [ ] 비로그인 상태에서 레시피 탐색/검색/상세 보기 가능
- [ ] 로그인 후 레시피 등록/리믹스 전체 플로우 동작
- [ ] Privacy Policy, ToS 페이지 존재

### MVP-α 전환 기준 (→ MVP-β)

| 지표 | 목표 | 비고 |
|------|------|------|
| 가입 유저 | 10명+ | Reddit/지인 유입 |
| 유저 등록 레시피 | 1개+ | 시드 외 유저가 직접 등록한 레시피 |
| 리믹스 시도 | 1회+ | 유저가 리믹스 버튼을 눌러본 적 있는지 |
| 치명적 버그 | 0 | Sentry 기준 |

---

## 3. MVP-β — "반응 보고 붙이기" (3~4주)

> α에서 유저 피드백을 받은 후 우선순위 조정 가능.

### Step 6: 리뷰 + 북마크 (2주) — KILLER: "I made this!" (AI 차별화)

**의존:** MVP-α 완성

| # | 작업 | 상세 |
|---|------|------|
| 6-1 | 리뷰 DB 스키마 | `reviews` 테이블 + RLS 정책 |
| 6-2 | 별점(5점) + 텍스트 리뷰 UI | 레시피 상세 하단 리뷰 섹션 |
| 6-3 | "I made this!" 사진 업로드 | 리뷰 작성 시 사진 첨부 (최대 3장, 클라이언트 압축) |
| 6-4 | EXIF 메타데이터 추출 | `has_exif` + `device_category` 저장 (차단 아닌 신뢰 점수 반영). **원칙: EXIF 원본 저장 금지** — GPS, 촬영자 정보 등 개인정보 포함. 필요한 필드(`has_exif`, `device_category`)만 추출 후 원본 EXIF strip |
| 6-5 | 북마크 기능 | `bookmarks` 테이블, 마이페이지에서 저장한 레시피 목록 |
| 6-6 | 비로그인 참여 시 로그인 유도 모달 | 북마크/리뷰 클릭 시 "Sign in to save this recipe" |

**완료 기준:**
- [ ] 리뷰 작성 → 레시피 상세에서 표시
- [ ] 사진 포함 리뷰 업로드 동작
- [ ] 북마크 추가/제거 + 마이페이지 목록 표시

### Step 7: Glossary + Dietary Filter (1~2주) — KILLER: Glossary (외국인 진입 장벽 해소)

**의존:** Step 2 (Ingredient ID 데이터가 Glossary의 기반) + Step 3 (레시피 내 재료 클릭 연결)

> Glossary의 핵심은 재료 데이터(Step 2)이지, 리뷰 시스템(Step 6)이 아니다.
> 리뷰 기반 신뢰도 위젯("이 재료를 사용한 리뷰 N건")은 Step 6 완료 후 별도 추가.

| # | 작업 | 상세 |
|---|------|------|
| 7-1 | Ingredient Glossary 페이지 | 재료별 사진 + 다국어 설명 + 대체재 정보 + "Where to buy" 텍스트 |
| 7-2 | 레시피 내 재료 클릭 → Glossary 연결 | 재료명 클릭 시 Glossary 해당 항목으로 이동 |
| 7-3 | Dietary Filter (Soft Filter) | 검색/탐색에서 Vegan/Halal/Gluten-free 라벨 표시. 부적합 레시피 흐리게 처리 |
| 7-4 | 리뷰 기반 신뢰도 위젯 | Glossary 재료 페이지에 "이 재료를 사용한 리뷰 N건" 표시 (Step 6 완료 후 연결) |
| 7-5 | 시드 레시피 +10개 | 총 20개 + 리믹스 본보기 +2~3개 |
| 7-6 | Vitest 단위 테스트 추가 | 단위 변환, Zod 스키마, 검색 쿼리 등 핵심 유틸 테스트 |

**완료 기준:**
- [ ] Glossary 페이지에서 재료 검색/열람 가능
- [ ] 레시피 상세에서 재료 클릭 → Glossary 이동
- [ ] Dietary Filter 적용 시 라벨 표시 + 부적합 레시피 시각적 구분

### MVP-β 완료 시점 체크리스트

- [ ] 초기 유저 10~20명 인터뷰 실시:
  - "리믹스를 해본 적 있나요?"
  - "레시피 변형 과정을 기록하고 싶나요?"
  - "쿠킹 모드가 있으면 쓸 것 같나요?"
- [ ] 인터뷰 결과에 따라 V1 우선순위 조정

### MVP-β 전환 기준 (→ V1)

| 지표 | 목표 | 비고 |
|------|------|------|
| 가입 유저 | 30명+ | |
| 유저 등록 레시피 | 5개+ | 시드 외 |
| 리믹스 | 3개+ | 유저가 직접 만든 리믹스 |
| 리뷰 | 10개+ | |
| 주간 재방문율 | 20%+ | 한 번 오고 안 돌아오면 핵심 가치 미전달 |

**비용 전환:** MVP-β 완료 시점에 Vercel Pro + Supabase Pro 전환 ($45~/월)

---

## 4. V1 — "진짜 쓸 수 있는 제품" (+2~3개월)

> MVP-β에서 검증된 방향으로 핵심 기능 고도화.

### Step 8: 쿠킹 모드 + PWA (3~4주) — KILLER: 쿠킹 모드 (플랫폼 최대 차별화)

**의존:** MVP-β 완성

| # | 작업 | 상세 |
|---|------|------|
| 8-1 | 쿠킹 모드 풀스크린 UI | 스텝별 카드 한 장씩, 해당 재료 하이라이트 |
| 8-2 | 디바이스별 반응형 레이아웃 | 폰(풀카드+peek) / 태블릿(PPT 발표자 보기) / 데스크톱(좌우 분할) |
| 8-3 | Wake Lock API | `navigator.wakeLock` — 화면 안 꺼지게. **미지원 브라우저 폴백:** 화면 상단에 "Keep your screen on manually" 안내 배너 표시 (Firefox 등) |
| 8-4 | 복수 타이머 관리 | 카드 넘겨도 이전 타이머 유지, 플로팅 타이머 표시 |
| 8-5 | 스와이프 네비게이션 + 큰 터치 타겟 | 손 젖었을 때 대응 |
| 8-6 | PWA manifest + 홈 화면 추가 | 앱처럼 실행 가능. 오프라인 캐싱은 V2 |
| 8-7 | Playwright E2E 테스트 | 레시피 CRUD + 쿠킹 모드 진입/스텝 이동 핵심 플로우 |

### Step 9: 입력 UX 고도화 (2주) — KILLER: 연쇄 자동완성 풀 스펙

**의존:** Step 8 (쿠킹 모드와 입력 화면이 1:1 매칭)

| # | 작업 | 상세 |
|---|------|------|
| 9-1 | 연쇄 자동완성 풀 스펙 | 키보드 탭 연쇄, 스마트 단위 추천(재료별 common_units 우선), 비정형 수량 버튼 |
| 9-2 | 슬라이드 입력 고도화 | 데스크톱: 좌측 재료 + 우측 슬라이드 병렬, 재료 드래그로 스텝에 연결 |
| 9-3 | 모바일 입력 최적화 | `inputmode="decimal"` 숫자 키패드, 단위 버튼 나열 |
| 9-4 | 드래그 앤 드롭 스텝 순서 변경 | 스텝 카드 재정렬 |

### Step 10: 리뷰 고도화 + 신고 UI (2주)

**의존:** Step 6 (기본 리뷰 시스템)

| # | 작업 | 상세 |
|---|------|------|
| 10-1 | 구조화된 리뷰 확장 | Taste / Difficulty / Authenticity / Kid-friendly 축별 평가 |
| 10-2 | pHash 중복 검사 | 업로드 사진의 플랫폼 내 중복 여부 검사 |
| 10-3 | 유저 신고 시스템 UI | 사유 선택 (저작권 침해, 부적절 콘텐츠, 스팸 등) |
| 10-4 | 신고 N건 누적 → 자동 비공개 | 운영자 알림 (이메일 또는 Supabase 대시보드) |

### Step 11: 쇼핑 리스트 + 연쇄 추천 (2주)

**의존:** Step 2 (Ingredient ID 시스템)

| # | 작업 | 상세 |
|---|------|------|
| 11-1 | Shopping List | 다중 레시피 선택 → 재료 합산 리스트 생성. 겹치는 재료 수량 합산 (Ingredient ID 기반) |
| 11-2 | 식재료 연쇄 추천 | 레시피 하단 + 쿠킹 모드 완료 화면에 "남은 재료로 만들 수 있는 레시피" 추천 카드 |
| 11-3 | 냉장고 털이 | 보유 재료 입력(자동완성) → 매칭 레시피 검색 |

### Step 12: 온보딩 + Recipe Linter (1~2주)

**의존:** Step 7 (Dietary Filter), Step 3 (레시피 등록 폼)

| # | 작업 | 상세 |
|---|------|------|
| 12-1 | 가입 직후 온보딩 | "맞춤 한식을 찾아드릴까요?" → 식단 제한 + 난이도 선택 (선택적) |
| 12-2 | Dietary Filter UX 고도화 | Soft(라벨)/Hard(숨김) 토글. 프로필에서 기본 설정 |
| 12-3 | Recipe Linter | 재료-스텝 정합성 검사, 단위 누락 감지, 모호한 표현 경고. 차단 아닌 경고만 |

### V1 전환 기준 (→ V2)

| 지표 | 목표 | 비고 |
|------|------|------|
| MAU | 500+ | Meilisearch 전환 트리거 |
| 유저 등록 레시피 | 50개+ | 시드 외 |
| 리믹스 | 20개+ | |
| 쿠킹 모드 사용률 | 레시피 상세 진입 대비 30%+ | 핵심 기능 검증 |
| 주간 재방문율 | 30%+ | |

**비용 전환:** MAU 500+ 시점에 Meilisearch Cloud 추가 ($75~80+/월)

---

## 5. V2 — 커뮤니티 성장 후

> 데이터가 충분히 쌓인 후 순차 도입. 우선순위는 유저 피드백에 따라 조정.

| 순서 | 기능 | 설명 |
|------|------|------|
| V2-1 | 레시피 트리 시각화 | 리믹스 계보 그래프, 깊이 5~7단계 soft cap |
| V2-2 | Recipe Versions 스냅샷 | 레시피 수정 이력 완전 보존 (`recipe_versions` 테이블). 힌트: V1에서 `recipes.published_version` 컬럼을 nullable로 미리 추가해두면 V2 마이그레이션이 수월 |
| V2-3 | 공식 인증 시스템 | 직계 부모 승인권, Master's Choice 배지 |
| V2-4 | 사용자 등급 고도화 | Beginner → Intermediate → Master 자동 승급 + 분석 대시보드 |
| V2-5 | Glossary Edit Proposal | Master 등급 유저의 편집 요청 → diff 기반 승인 + rollback |
| V2-6 | 다국어 translation 테이블 분리 | jsonb → `ingredient_translations` 테이블 마이그레이션 |
| V2-7 | PWA 오프라인 캐싱 | Service Worker, 최근 본 레시피 로컬 저장 |
| V2-8 | 글로벌 히트맵 | MAU 1,000+ 후 도입. 국가별 레시피 현황 지도 |
| V2-9 | AI 레시피 자동 파싱 | URL → 구조화 JSON + Auto-Tagging |
| V2-10 | 음성 제어 | Web Speech API — 쿠킹 모드에서 "다음" |
| V2-11 | Kitchen Crew | 그룹 리믹스/멘토십 |
| V2-12 | 포트폴리오 페이지 | 프로필을 개인 포트폴리오로 활용, 전용 URL |
| V2-13 | 국가별 퀴진 확장 | 일식 → 중식 → 동남아 → 유럽 |
| V2-14 | Shop 페이지 | 재료 전체 큐레이션 + 국가별 affiliate 자동 리다이렉트 |

---

## 6. 의존 관계 맵

```
Phase 0 (Reddit 수요 검증)  ──┐
                               ├── 동시 진행 (2~4주)
Step 1 (환경+인증)            ──┘
  └── Step 2 (재료 엔진)
        ├── Step 3 (레시피 CRUD)
        │     ├── Step 4 (리믹스)
        │     │     └── Step 5 (시드+런칭) ── MVP-α 완성
        │     └──────────────────────────────────┐
        │                                         │
        │   Step 6 (리뷰+북마크) ◄────────────────┘
        │     ├── Step 10 (리뷰 고도화+신고)
        │     └── Step 7-4 (리뷰 기반 신뢰도 위젯)
        │
        └── Step 7 (Glossary+필터) ── MVP-β 완성
              │   ↑ Glossary core = Step 2 의존
              │   ↑ 신뢰도 위젯(7-4)만 Step 6 의존
              │
              ├── Step 8 (쿠킹 모드+PWA)
              │     └── Step 9 (입력 UX 고도화)
              │
              ├── Step 11 (쇼핑 리스트+추천)
              │
              └── Step 12 (온보딩+Linter) ── V1 완성
```

- **Phase 0 + Step 1**은 동시 진행. 검증 끝나기 전에 인프라가 준비된 상태.
- Step 8~12는 MVP-β 이후 **병렬 가능**한 영역이 많음. 2인 이상이면 동시 진행 가능.

---

## 7. 타임라인 (2명 기준)

| 주차 | 마일스톤 | Dev | 콘텐츠 |
|------|---------|-----|--------|
| 1~2 | **Phase 0 + Step 1** (동시 진행) | Supabase, Auth, Vercel, ESLint, shadcn/ui, Sentry, PostHog | Reddit 계정 활동, 1차 글(계란김밥), 시드 레시피 기획, 재료 시드 30개 정리 |
| 3 | Step 2: 재료 엔진 | 자동완성, 단위 변환 UI | 2차 글(김치볶음밥), GO/PIVOT 판단, 시드 레시피 촬영 시작 |
| 4~5 | Step 3: 레시피 CRUD | 등록/상세/목록, PGroonga 검색, SEO | 시드 레시피 제작 (요리+촬영+영어) |
| 5.5 | Step 4: 리믹스 | 리믹스 버튼, 부모 연결 | 리믹스 본보기 제작 |
| 6 | Step 5: **MVP-α 런칭** | QA, 랜딩, Privacy Policy | 시드 10개 등록, Reddit 소프트 런칭 |
| 7~8 | Step 6: 리뷰+북마크 | 리뷰 UI, 사진 업로드, EXIF, 북마크 | 피드백 수집, 댓글 소통 |
| 9~10 | Step 7: Glossary+필터 | Glossary 페이지, Dietary Filter | 시드 +10개, 리믹스 +3개 |
| — | **MVP-β 완성** | 유저 인터뷰 | 유저 인터뷰 |
| 11~14 | Step 8~9: 쿠킹 모드 | 풀스크린 카드, 타이머, PWA, 입력 고도화 | 유저 피드백 수집, 콘텐츠 루틴화 |
| 15~16 | Step 10: 리뷰+신고 | 구조화 리뷰, pHash, 신고 UI | 커뮤니티 관리 |
| 17~18 | Step 11~12: 추천+온보딩 | 쇼핑 리스트, 연쇄 추천, 냉장고 털이, Recipe Linter | 인플루언서 접촉 |
| — | **V1 완성** | | |

**1명이면:** 위 타임라인의 1.5~2배.

---

## 8. 타임라인 (3명 기준: Backend + Frontend/UX + 콘텐츠)

> 3명의 핵심 이점: **쿠킹 모드(Step 8)를 MVP-β와 병렬로 당겨올 수 있음**.
> 2명일 때는 V1에서야 시작하는 쿠킹 모드를, 3명이면 ~12주차에 시작 가능.

| 주차 | 마일스톤 | Backend | Frontend/UX | 콘텐츠 |
|------|---------|---------|-------------|--------|
| 1~2 | **Phase 0 + Step 1** | Supabase, Auth, DB+RLS, Vercel, Sentry, PostHog | shadcn/ui 초기화, ESLint/Prettier, 기본 레이아웃(GNB/푸터) | Reddit 활동, 1차 글(계란김밥), 재료 시드 30개 정리 |
| 3 | Step 2: 재료 엔진 | 자동완성 API, 시드 데이터 삽입 | 재료 입력 3단 폼 UI, 단위 변환 토글 UI | 2차 글(김치볶음밥), GO/PIVOT 판단 |
| 4~5 | Step 3: 레시피 CRUD | DB 스키마, PGroonga 검색, SEO | 슬라이드 입력 UI, 레시피 상세/목록 페이지 | 시드 레시피 제작 (요리+촬영+영어) |
| 5.5 | Step 4: 리믹스 | 부모/루트 연결 로직 | 리믹스 버튼 UI, Inspired by 표시 | 리믹스 본보기 제작 |
| 6 | Step 5: **MVP-α 런칭** | QA, Privacy Policy | 랜딩 페이지 마무리 | 시드 10개 등록, Reddit 소프트 런칭 |
| 7~8 | Step 6: 리뷰+북마크 | 리뷰 DB, EXIF 추출, 북마크 | 리뷰 UI, 사진 업로드 UI | 피드백 수집, 댓글 소통 |
| 9~10 | Step 7 + **Step 8 시작** | Glossary API, Dietary Filter 로직 | Glossary 페이지 **+ 쿠킹 모드 UI 착수** | 시드 +10개, 리믹스 +3개 |
| — | **MVP-β 완성** | | | 유저 인터뷰 |
| 11~12 | **Step 8~9 집중** | 쿠킹 모드 API, Wake Lock, 타이머 로직 | 쿠킹 모드 풀스크린, 반응형, 스와이프, 입력 고도화 | 유저 피드백 수집, 콘텐츠 루틴화 |
| 13~14 | Step 10~12 | pHash, 신고 자동비공개, 쇼핑리스트/추천 API | 신고 UI, 온보딩 UI, Recipe Linter UI | 커뮤니티 관리, 인플루언서 접촉 |
| — | **V1 완성** | | | |

**2명 vs 3명 비교:**

| 항목 | 2명 | 3명 |
|------|-----|-----|
| MVP-α 런칭 | ~6주 | ~6주 (동일 — 병렬화 한계) |
| MVP-β 완성 | ~10주 | ~10주 (동일) |
| 쿠킹 모드 착수 | 11주차 (MVP-β 후) | **9주차 (MVP-β와 병렬)** |
| V1 완성 | ~18주 | **~14주** |
| 핵심 차이 | Step 8~12 순차 진행 | Step 8~12 병렬 진행, 쿠킹 모드 **4주 앞당김** |

> 3명의 진짜 가치는 MVP-α/β를 빨리 끝내는 게 아니라, **V1 킬러 기능(쿠킹 모드)을 일찍 시작할 수 있다**는 점.

---

## 9. DB 테이블 생성 순서

MVP-α에서 필요한 테이블만 먼저 생성하고, 단계별로 확장.

### MVP-α

```
1. users (Supabase Auth 연동, 프로필 확장)
2. ingredients (시드 30개)
3. units (단위 다국어 라벨)
4. recipes (title, author_id, difficulty, dietary_tags 등)
5. recipe_steps (order, description, timer_seconds, image_url)
6. recipe_ingredients (recipe_id, ingredient_id, amount, unit, qualifier, note, step_number)
```

> **`ingredients_used` 설계 결정:** `recipe_steps.ingredients_used` (JSON 배열)를 쓰지 않고, `recipe_ingredients`에 `step_number` 컬럼을 추가하여 정규화. 쇼핑 리스트 합산/단위 변환은 `recipe_ingredients` 테이블 단독으로 처리 가능. 스텝별 재료 하이라이트는 `step_number`로 필터.

### MVP-β 추가

```
7. reviews (recipe_id, user_id, rating, text, photos, has_exif, device_category)
8. bookmarks (user_id, recipe_id)
```

### V1 추가

```
9. shopping_lists (user_id, recipe_ids)
10. reports (reporter_id, target_type, target_id, reason)
```

### V2 추가

```
11. recipe_versions (recipe_id, version_number, snapshot)
12. ingredient_translations (ingredient_id, locale, name, description)
13. glossary_edit_proposals (ingredient_id, editor_id, diff, status)
```

---

## 10. 핵심 원칙 요약

1. **MVP 범위 과다 경계** — 기획서가 탄탄한 만큼 "다 넣고 싶은" 유혹이 강함. MVP-α에서 검증할 건 딱 하나: "외국인이 한식 리믹스 레시피를 올리고 싶어하는가?"
2. **데이터 구조는 처음부터 확정** — 타입/스키마는 V2까지 고려해서 설계. 나중에 마이그레이션 지옥 방지. 이미 `packages/types`에 정의한 구조 활용.
3. **RLS 초기부터** — 모든 테이블에 RLS 활성화 + 정책 설정을 Step 1에서 완료.
4. **영어 UX 1순위** — 모든 UI 텍스트, 시드 콘텐츠, 에러 메시지를 영어 기준으로 먼저 작성.
5. **시드 콘텐츠 수보다 질** — 30개 재료 풀 데이터, 10~20개 레시피 고퀄리티가 어설픈 100개보다 나음.
6. **비용 전환 시점 명확** — 개발 중 $0 → 런칭 시 $45~/월 → MAU 500+ 시 $75~80+/월.
7. **환경 분리는 V1 직전에** — MVP-α/β는 Supabase 1개 프로젝트 + seed/DDL 스크립트 엄격 관리. V1 런칭 1~2주 전 dev/prod 분리 (트리거: 유료 전환 또는 외부 유저 유입 시작).
