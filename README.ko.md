<!-- Tag: docs -->
<!-- Path: README.ko.md -->

# 맛담 (MatDam)

> 한식 레시피를 발견하고, 리믹스하고, 세상과 공유하는 플랫폼.

**[English README](./README.md)**

맛담은 전통 한식부터 모던 퓨전까지, 레시피를 탐색하고 자신만의 버전으로 리믹스하며 글로벌 커뮤니티와 요리 경험을 나누는 소셜 레시피 플랫폼입니다.

---

## 기술 스택

| 영역         | 기술                                         |
| ------------ | -------------------------------------------- |
| 프레임워크   | Next.js 15 (App Router) + React 19           |
| 언어         | TypeScript 5                                 |
| 스타일링     | Tailwind CSS 4 + Radix UI 프리미티브         |
| 데이터베이스 | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 다국어       | next-intl (한국어 / English)                 |
| 상태 관리    | Zustand                                      |
| 폼           | React Hook Form + Zod 유효성 검증            |
| AI           | Anthropic Claude SDK (레시피 번역)           |
| 모니터링     | Sentry (에러 추적)                           |
| 분석         | PostHog                                      |
| 모노레포     | pnpm Workspaces + Turborepo                  |
| CI/CD        | GitHub Actions                               |
| 코드 품질    | ESLint + Prettier + Husky (lint-staged)      |

---

## 모노레포 구조

```
mat_dam/
├── apps/
│   └── web/                        # Next.js 웹 애플리케이션
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/       # 로케일 기반 페이지 라우트
│       │   │   │   ├── explore/    # 레시피 탐색 & 검색
│       │   │   │   ├── recipe/     # 레시피 상세 & 조리 모드
│       │   │   │   ├── create/     # 레시피 에디터
│       │   │   │   ├── glossary/   # 식재료 사전
│       │   │   │   ├── fridge/     # 냉장고 기반 추천
│       │   │   │   ├── community/  # 커뮤니티 게시판 (준비중)
│       │   │   │   └── ...
│       │   │   └── api/            # API 라우트
│       │   │       ├── recipe-translation/
│       │   │       ├── translate-announcement/
│       │   │       └── cron/
│       │   ├── components/
│       │   │   ├── ui/             # 디자인 시스템 프리미티브 (button, card, dialog...)
│       │   │   ├── home/           # 홈페이지 섹션 (히어로, 인기, 추천 등)
│       │   │   ├── recipe/         # 레시피 컴포넌트 (18개 이상)
│       │   │   ├── comment/        # 공용 댓글 시스템
│       │   │   ├── discussion/     # 커뮤니티 토론 (비활성화)
│       │   │   ├── glossary/       # 재료사전 컴포넌트
│       │   │   ├── explore/        # 탐색 페이지 컴포넌트
│       │   │   ├── fridge/         # 냉장고 컴포넌트
│       │   │   ├── shopping/       # 쇼핑 리스트 컴포넌트
│       │   │   ├── report/         # 콘텐츠 신고
│       │   │   ├── user/           # 유저 프로필 & 랭크 배지
│       │   │   └── layout/         # GNB, 푸터, 레이아웃 래퍼
│       │   └── lib/
│       │       ├── supabase/       # Supabase 클라이언트 (서버 + 클라이언트)
│       │       ├── recipe/         # 레시피 유틸리티 & 상수
│       │       ├── user/           # 유저 헬퍼
│       │       └── validation/     # 유효성 스키마
│       └── messages/               # i18n 번역 파일
│           ├── en.json
│           └── ko.json
├── packages/
│   ├── types/                      # 공유 TypeScript 인터페이스
│   ├── utils/                      # 공유 유틸리티 함수
│   └── supabase/                   # Supabase 클라이언트 설정
├── supabase/
│   └── migrations/                 # PostgreSQL 마이그레이션 (001–012)
└── docs/
    ├── design/                     # 디자인 시스템 문서
    ├── tech/                       # 기술 아키텍처
    ├── work_order/                 # 작업 명세서
    └── research/                   # 시장 & 기능 리서치
```

---

## 주요 기능

### 레시피 관리

| 기능                   | 설명                                                           |
| ---------------------- | -------------------------------------------------------------- |
| **레시피 작성 & 수정** | 드래그 앤 드롭 단계 정렬, 단계별 사진/타이머/팁 지원 풀 에디터 |
| **재료 입력**          | 재료사전 연동 자동완성 검색 + 단위 변환 (미터법/야드파운드법)  |
| **리믹스**             | 공개된 레시피를 포크하여 나만의 버전 생성, 원본 출처 자동 표시 |
| **임시 저장**          | 게시 전 드래프트 저장                                          |
| **식이 라벨**          | 10개 식이 라벨 태깅 (비건, 글루텐 프리, 할랄 등)               |
| **자동 번역**          | Claude AI 기반 한↔영 레시피 번역 (제목, 설명, 조리 단계, 팁)   |
| **레시피 린트**        | 게시 전 검증 — 미사용 재료, 빈 단계, 누락 타이머 경고          |

### 조리 경험

| 기능             | 설명                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| **조리 모드**    | 집중 모드 단계별 가이드, 큰 텍스트, 단계별 재료 하이라이트           |
| **내장 타이머**  | 여러 타이머 동시 실행 + 완료 알림                                    |
| **맛 프로필**    | 커뮤니티 집계 맛 평가 (단맛, 짠맛, 매운맛, 신맛, 난이도 등 9개 항목) |
| **만들어봤어요** | 요리 기록 버튼으로 히스토리 추적                                     |
| **조리 리뷰**    | 전체 맛/난이도/"다시 만들 의향" 기본 평가 + 6개 세부 맛 차원         |

### 탐색 & 개인화

| 기능                  | 설명                                                           |
| --------------------- | -------------------------------------------------------------- |
| **레시피 탐색**       | 검색, 난이도 필터, 식이 필터, 정렬 (최신순/인기순)             |
| **가상 냉장고**       | 집에 있는 재료 선택 → 만들 수 있는 레시피 추천                 |
| **쇼핑 리스트**       | 북마크 레시피 재료 자동 통합, 카테고리별 그룹핑                |
| **식재료 사전**       | 대체 재료, 설명, 이미지, 커뮤니티 댓글이 포함된 종합 재료 사전 |
| **팬트리 가이드**     | 문화권별 필수 재료 (한식, 일식, 중식, 태국, 양식 등)           |
| **맞춤 추천**         | 온보딩 선호도 기반 레시피 추천 (실력, 문화권, 식이, 맛 프로필) |
| **K-드라마 크레이빙** | 한국 드라마에 등장한 레시피 큐레이션                           |

### 소셜 & 커뮤니티

| 기능                | 설명                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **댓글**            | 레시피 댓글 ("만들어봤어요" 필수) + 식재료 댓글 (로그인만), 2단계 대댓글                                  |
| **투표**            | 레시피/댓글 추천 & 비추천, 낙관적 UI 업데이트                                                             |
| **유저 랭킹**       | 활동 점수 기반 등급: 견습생 → 초보 요리사 → 가정 요리사 → 숙련 요리사 → 요리 장인 → 요리 달인 → 요리 대가 |
| **인증 배지**       | 인증 셰프, 파트너 셰프 특별 배지                                                                          |
| **신고 시스템**     | 부적절 콘텐츠 신고 + 3건 누적 시 자동 비공개 처리                                                         |
| **북마크**          | 레시피 저장                                                                                               |
| **유저 프로필**     | 공개 프로필 — 게시 레시피, 활동 점수, 랭크 배지                                                           |
| **커뮤니티 게시판** | 토론 포럼 (준비중)                                                                                        |

### 다국어 지원

| 기능               | 설명                                                        |
| ------------------ | ----------------------------------------------------------- |
| **이중 언어**      | 전체 UI 한국어/영어 지원                                    |
| **로케일 라우팅**  | URL 기반 로케일 프리픽스 (`/ko/...`, `/en/...`) + 쿠키 유지 |
| **레시피 번역**    | AI 기반 레시피 제목/설명/단계/팁 번역                       |
| **언어 전환**      | GNB 드롭다운 + 설정 페이지 언어 선택                        |
| **입력 자동 감지** | 레시피 입력 시 언어 자동 감지하여 JSONB 키 결정             |

---

## 로컬 개발 환경

### 사전 요구사항

- **Node.js** 20.x (`>=20.0.0 <21.0.0`)
- **pnpm** 9.x
- **Supabase** 프로젝트 (클라우드 또는 로컬 Supabase CLI)

### 설치

```bash
# 저장소 클론
git clone https://github.com/hoddukz/matdam.git
cd matdam

# 의존성 설치
pnpm install

# 환경 변수 설정
cp apps/web/.env.local.example apps/web/.env.local
```

### 환경 변수

`apps/web/.env.local` 파일에 아래 변수를 설정합니다:

| 변수                            | 필수 | 설명                              |
| ------------------------------- | ---- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | O    | Supabase 프로젝트 URL             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O    | Supabase 익명 키                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | O    | Supabase 서비스 롤 키 (서버 전용) |
| `ANTHROPIC_API_KEY`             | O    | Anthropic API 키 (레시피 번역용)  |
| `NEXT_PUBLIC_SENTRY_DSN`        | X    | Sentry DSN (에러 추적)            |
| `NEXT_PUBLIC_POSTHOG_KEY`       | X    | PostHog API 키 (분석)             |
| `NEXT_PUBLIC_POSTHOG_HOST`      | X    | PostHog 호스트 URL                |

### 개발 명령어

```bash
# 개발 서버 실행 (전체 워크스페이스)
pnpm dev

# 웹 앱만 실행
pnpm --filter @matdam/web dev

# 타입 체크
pnpm turbo type-check

# 린트
pnpm turbo lint

# 프로덕션 빌드
pnpm turbo build

# 빌드 결과물 삭제
pnpm turbo clean
```

---

## 데이터베이스

### 아키텍처

Supabase (PostgreSQL) 기반이며, Row Level Security (RLS)로 데이터 접근을 제어합니다. 모든 테이블에 RLS 정책이 적용되어 있어 사용자는 자신의 데이터만 수정할 수 있고, 공개 콘텐츠는 누구나 읽을 수 있습니다.

### 주요 테이블

| 테이블               | 설명                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `users`              | 유저 프로필 (Supabase Auth 확장) — display_name, avatar, preferences, activity_score, tier |
| `recipes`            | 레시피 — JSONB title/description/steps, taste_profile, dietary_tags, 리믹스 체인           |
| `ingredients`        | 식재료 마스터 — 다국어 이름, 카테고리, 식이 플래그, 대체재                                 |
| `recipe_ingredients` | 레시피-재료 다대다 조인 — 수량, 단위, 메모                                                 |
| `cook_logs`          | "만들어봤어요" 기록                                                                        |
| `cook_reviews`       | 맛/난이도 평가 (cook_log 기반, 9개 차원)                                                   |
| `comments`           | 댓글 — 레시피 (cook_log 필수) + 식재료 (로그인만)                                          |
| `comment_votes`      | 댓글 추천/비추천                                                                           |
| `recipe_votes`       | 레시피 추천/비추천                                                                         |
| `bookmarks`          | 유저 북마크                                                                                |
| `reports`            | 콘텐츠 신고 + 자동 임계 트리거                                                             |
| `announcements`      | 관리자 공지사항                                                                            |
| `discussions`        | 커뮤니티 토론 스레드 (미활성)                                                              |

### 마이그레이션

마이그레이션 파일은 `supabase/migrations/`에 번호순으로 관리됩니다:

| #   | 파일                                    | 설명                                                         |
| --- | --------------------------------------- | ------------------------------------------------------------ |
| 001 | `schema.sql`                            | 기본 스키마 (users, recipes, ingredients, units)             |
| 002 | `seed_ingredients.sql`                  | 식재료 시드 데이터                                           |
| 003 | `storage_bucket.sql`                    | Supabase Storage 버킷 설정                                   |
| 004 | `rpc_functions.sql`                     | PostgreSQL RPC 함수                                          |
| 005 | `social_tables.sql`                     | 소셜 테이블 (cook_logs, reviews, comments, votes, bookmarks) |
| 006 | `reports.sql`                           | 신고 테이블 + 자동 비공개 트리거                             |
| 007 | `indexes.sql`                           | 성능 인덱스                                                  |
| 008 | `seed_recipes.sql`                      | 레시피 시드 데이터                                           |
| 009 | `user_ranking.sql`                      | 유저 랭킹 시스템 (activity_score 트리거)                     |
| 010 | `announcements.sql`                     | 공지사항 테이블                                              |
| 011 | `seed_recipes_2.sql`                    | 추가 레시피 시드 데이터                                      |
| 012 | `glossary_comments_and_discussions.sql` | 식재료 댓글 + 커뮤니티 토론 테이블                           |

```bash
# 전체 초기화 + 마이그레이션 재적용
supabase db reset

# 신규 마이그레이션만 적용
supabase migration up
```

---

## 페이지 라우트

모든 라우트는 `[locale]` 프리픽스가 적용됩니다 (예: `/ko/explore`, `/en/explore`).

| 라우트           | 페이지                                               | 인증 필요            |
| ---------------- | ---------------------------------------------------- | -------------------- |
| `/`              | 홈 — 인기 레시피, 맞춤 추천, K-드라마 크레이빙       | X                    |
| `/explore`       | 레시피 탐색 — 검색, 필터 (난이도, 식이), 정렬        | X                    |
| `/recipe/[slug]` | 레시피 상세 — 재료, 조리 단계, 조리 모드, 댓글, 리뷰 | X (액션은 인증 필요) |
| `/create`        | 레시피 작성 에디터                                   | O                    |
| `/glossary`      | 식재료 사전 — 카테고리/문화권별 브라우징, 검색       | X                    |
| `/glossary/[id]` | 식재료 상세 — 설명, 대체재, 관련 레시피, 댓글        | X (댓글은 인증 필요) |
| `/fridge`        | 가상 냉장고 — 보유 재료 선택, 매칭 레시피 추천       | X                    |
| `/shopping-list` | 쇼핑 리스트 — 북마크 레시피 재료 통합                | O                    |
| `/profile`       | 내 프로필 — 게시/임시저장/북마크 레시피              | O                    |
| `/user/[id]`     | 유저 프로필 — 공개 레시피 목록, 랭크 배지            | X                    |
| `/news`          | 새소식 — 관리자 공지, 업데이트                       | X                    |
| `/community`     | 커뮤니티 게시판 (준비중)                             | —                    |
| `/settings`      | 설정 — 프로필, 선호도, 언어                          | O                    |
| `/login`         | OAuth 로그인 (Google, Apple, Facebook)               | X                    |
| `/onboarding`    | 신규 유저 설정 — 실력, 문화권, 식이, 맛 선호도       | O                    |

### API 라우트

| 엔드포인트                    | 메서드 | 설명                              |
| ----------------------------- | ------ | --------------------------------- |
| `/api/recipe-translation`     | POST   | Claude AI 기반 레시피 콘텐츠 번역 |
| `/api/translate-announcement` | POST   | 공지사항 콘텐츠 번역              |
| `/api/cron`                   | GET    | 정기 유지보수 태스크              |

---

## CI/CD

### GitHub Actions

`main` 푸쉬 및 풀 리퀘스트마다 자동 실행:

1. 코드 체크아웃
2. Node.js 20 + pnpm 설정
3. 의존성 설치 (frozen lockfile)
4. `pnpm turbo lint` 실행
5. `pnpm turbo type-check` 실행

### Pre-commit 훅

Husky + lint-staged:

- `*.{ts,tsx}` → ESLint 자동 수정
- `*.{ts,tsx,json,css,md}` → Prettier 포맷팅

---

## 라이선스

비공개 저장소. All rights reserved.
