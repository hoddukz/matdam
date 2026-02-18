<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/tech/tech-stack.md -->

# 맛담 기술 스택 확정 문서

> 최종 업데이트: 2026-02-17
> 기준: matdam-master-plan_v1.0.0 + 타당성 검토 결과 반영

---

## 1. 확정 스택 요약

| 영역 | 기술 | 버전 | 판정 |
|------|------|------|------|
| Frontend | Next.js (App Router) | ^15 | 유지 |
| UI 라이브러리 | React 19 (Next.js 15 기본) | ^19 | 유지 |
| 스타일링 | Tailwind CSS | ^4 | 유지 |
| 컴포넌트 | shadcn/ui | 고정 커밋 기준 ¹ | **추가** |
| 다국어 | next-intl | ^4 | 유지 |
| Backend/DB | Supabase (PostgreSQL) | - | 유지 (주의사항 있음) |
| 인증 | Supabase Auth | - | 유지 |
| 검색 | Supabase PGroonga → Meilisearch | - | **변경** |
| 인프라 | Vercel | - | 유지 (주의사항 있음) |
| 폼 관리 | React Hook Form + Zod | ^7 | **추가** |
| 클라이언트 상태 | Zustand | ^5 ¹ | **추가** |
| 이미지 압축 | browser-image-compression | ^2 ¹ | **추가** |
| Analytics | Vercel Analytics + PostHog | - | **추가** |
| 에러 모니터링 | Sentry | 최신 | **추가** |
| 테스트 | Vitest + Playwright | - | **추가** |
| 린트/포맷 | ESLint + Prettier + husky | - | **추가** |
| 모노레포 | pnpm + Turborepo | ^9 / ^2 | 유지 |
| 언어 | TypeScript (strict) | ^5 | 유지 |

> ¹ shadcn/ui, Zustand, browser-image-compression 등 "최신"으로 관리하던 항목은 CI 재현성/안정성을 위해 lockfile 기준 고정 버전으로 운영. 표기 버전은 2026-02 기준 최신 메이저.

---

## 2. 항목별 상세

### 2.1 Next.js 15 (App Router)

**선정 이유:** 글로벌 SEO(SSR/SSG), 다국어 라우팅, 이미지 최적화

**현황:**
- App Router는 Next.js 15 기준 프로덕션 안정
- 초기(13.x) 캐싱 이슈는 15에서 해결됨 (`fetch()` 기본값 `no-store`로 변경)
- next-intl v4와 호환성 공식 확인

**주의사항:**
- Next.js 15부터 `params`가 Promise 타입 — `async/await` 패턴 필수
- Turbopack은 MVP에서 사용하지 않음 (일부 플러그인 호환 이슈)

**params Promise 패턴 예시:**

```tsx
// Next.js 15 — params는 Promise이므로 반드시 await
export default async function RecipePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  // ...
}
```

### 2.2 next-intl v4

**선정 이유:** App Router 네이티브 i18n 지원, Server Components 호환

**대안 비교:**

| 라이브러리 | App Router 지원 | 설정 복잡도 |
|---|---|---|
| next-intl v4 (선택) | 네이티브 | 낮음 |
| react-i18next | 추가 래퍼 필요 | 높음 |
| Lingui | 좋음 | 중간 |

**현재 설정:**
- `defaultLocale: "en"` (영어 기본 — 기획서 원칙 준수)
- 지원 언어: `en`, `ko`
- `createNextIntlPlugin()` 방식 적용 완료

### 2.3 Tailwind CSS v4

**선정 이유:** 반응형 UI 빠른 구현, 쿠킹 모드 등 기기별 레이아웃 대응

**v4 변경사항 (v3 대비):**
- 설정 파일 대신 CSS `@theme` 블록으로 커스텀 테마 설정
- `@tailwind base/components/utilities` → `@import "tailwindcss"` 통합
- PostCSS 플러그인이 `@tailwindcss/postcss`로 변경
- 빌드 속도 v3 대비 크게 향상

### 2.4 shadcn/ui (추가)

**추가 이유:**
- Tailwind + Radix UI 기반 복사-붙여넣기 컴포넌트
- 접근성(WAI-ARIA) 기본 내장 — 글로벌 서비스 필수
- 버튼, 다이얼로그, 드롭다운, 폼 등 직접 구현 시간 절약
- SI 출신 개발자 온보딩 가속 (컴포넌트 패턴 학습 용이)

### 2.5 Supabase (PostgreSQL)

**선정 이유:** Recursive Query(레시피 트리), jsonb(다국어), Auth/Storage 통합, 1인 DevOps 최소화

**무료 티어 한도 (2026-02 기준, 출처: [Supabase Pricing](https://supabase.com/pricing)):**

| 항목 | 한도 | 비고 |
|------|------|------|
| DB 스토리지 | 500 MB | |
| 파일 스토리지 | 1 GB | |
| 월간 활성 사용자 | 50,000 MAU | |
| Edge Function 호출 | 500,000회/월 | |
| 이그레스 | 5 GB/월 (총합) | DB egress와 Storage egress 합산 기준. 문서에 따라 DB egress만 2GB로 분리 표기되는 경우 있음 — 최신 pricing 페이지 재확인 권장 |

> ⚠️ Supabase 무료 티어 수치는 수시로 변경될 수 있음. 프로젝트 시작 시 반드시 공식 pricing 페이지 재확인.

**주의사항:**
- **7일 무활동 시 자동 정지** — MVP 초기 유저 없는 기간에 DB 꺼질 수 있음. 대응 방법:
  - **(권장)** 런칭 시점에 Pro($25/월) 전환
  - **(대안)** 개발 중에는 주기적 헬스체크 호출(cron/GitHub Actions 등)로 활성 상태 유지 가능. 단, 프로덕션에서는 Pro 전환이 안전
- **이미지 트랜스포메이션(리사이즈/WebP)은 Pro 전용** — 무료 티어에서는 클라이언트 사이드 압축으로 대응

**RLS(Row Level Security) 정책:**
- Supabase는 기본적으로 RLS가 꺼져 있으므로, **모든 테이블에 RLS 활성화 필수**
- 레시피/리믹스/리뷰/북마크 등 사용자 데이터 테이블은 RLS 설계가 곧 서비스 설계
- 기본 정책 템플릿:
  - `SELECT`: 공개 레시피는 누구나 읽기 가능 (`true`)
  - `INSERT`: 인증된 사용자만 (`auth.uid() = author_id`)
  - `UPDATE/DELETE`: 본인 소유만 (`auth.uid() = author_id`)
- `service_role` 키는 서버 사이드(Edge Function, 마이그레이션)에서만 사용 — 클라이언트에 절대 노출 금지
- MVP 초기부터 RLS 정책을 잡아놓고 시작해야 나중에 마이그레이션 지옥 방지

**Recursive CTE 성능:**
- `parent_recipe_id`, `root_recipe_id`에 인덱스 필수
- 기본 패턴: 직계 자식만 조회 (depth=1)
- 전체 트리 시각화(V2)는 별도 캐싱 레이어 검토

### 2.6 검색: PGroonga → Meilisearch (변경)

**기존 계획:** Typesense 또는 Meilisearch
**변경:** MVP는 Supabase PGroonga, V1 이후 Meilisearch Cloud

**변경 이유:**
- Supabase 기본 FTS(`to_tsvector`)는 **한국어 검색 불가** (영어만 지원)
- PGroonga 확장을 활성화하면 한국어+영어 동시 검색 가능 (Supabase 대시보드에서 바로 활성화, 추가 비용 없음)
- Typesense는 한국어 형태소 처리에서 Meilisearch보다 약함 → 배제

**단계별 전략:**

| 단계 | 검색 엔진 | 비용 | 기능 |
|------|----------|------|------|
| MVP | Supabase PGroonga | $0 | 한국어+영어 기본 검색 |
| V1 (MAU 500+) | Meilisearch Cloud | $30/월 | 오타 교정, 패싯 필터, 한국어 토크나이저 |

**PGroonga 운영 주의사항:**
- Supabase에서 PGroonga는 `extensions` 스키마에 설치되는 경우가 있음
- `search_path`에 `extensions`가 포함되어 있지 않으면 인덱스 참조/쿼리 작성 시 스키마 명시 필요
- 인덱스 생성 시 `CREATE INDEX ... USING pgroonga` 구문이 정상 동작하는지 대시보드에서 먼저 테스트 권장

**전환 전략:** 검색 API를 `packages/supabase`에 추상화해두면 전환 비용 최소화

### 2.7 Vercel

**선정 이유:** 글로벌 엣지 네트워크, Next.js 네이티브 지원

**주의사항:**
- **Hobby 플랜은 비상업적 개인 사용만 허용** — 상업적 목적(affiliate links, 광고, 유료 서비스 등) 발생 즉시 Pro 또는 Enterprise 필수. Vercel 공식 정의에 affiliate linking이 상업적 사용에 포함됨
- **Hobby 이미지 최적화 1,000개 소스 이미지/월** — 유저 100명만 되어도 초과 가능
- **Pro 플랜은 고정 요금($20/월)이 아닌 플랫폼 fee + 사용량(크레딧) 구조** — 이미지 최적화, 빌드 시간, 대역폭 등이 기본 포함량을 초과하면 추가 과금 발생. 예산 시 여유분 확보 필요
- `next/image` Vercel 의존도를 줄이는 전략 필요 (Supabase Storage 직접 서빙 또는 V1에서 Cloudflare R2 검토)

### 2.8 React Hook Form + Zod (추가)

**추가 이유:**
- 레시피 작성 폼이 복잡: 연쇄 자동완성 3-Step Chain + 동적 스텝 추가/삭제 + 드래그 순서 변경
- 비제어 컴포넌트 기반이라 대형 동적 폼에서 리렌더링 최소화
- Zod 스키마를 `packages/types`에 정의 → 프론트엔드/API 유효성 규칙 공유
- SI 출신 개발자 진입 장벽 낮음

### 2.9 Zustand (추가)

**추가 이유:**
- 쿠킹 모드 진행 상태, 단위 변환 토글(Metric/Imperial), 식단 필터 설정 등 클라이언트 전용 상태 관리
- App Router에서 서버 컴포넌트가 대부분의 데이터 페칭을 처리하므로 전역 상태는 최소한만 필요
- API가 단순하고 학습 비용 낮음

**Jotai 대비 선택 이유:** 원자 단위 상태 관리는 이 프로젝트 규모에서 오버스펙. Zustand의 단순함이 소규모 팀에 유리.

### 2.10 이미지 처리 전략 (추가)

**MVP 전략: 클라이언트 사이드 압축**
- `browser-image-compression` 라이브러리로 업로드 전 압축 (최대 1MB 이하)
- Supabase Storage에 원본 저장
- `next/image`로 서빙 시 Vercel이 최적화 처리

**V1 이후:** Cloudflare R2 (이그레스 무료) + Cloudflare Images ($5/월) 검토

**용량 제한:**

| 항목 | 제한 |
|------|------|
| 레시피당 사진 | 최대 10장 |
| 리뷰 사진 | 최대 3장 |
| 업로드 파일 크기 | 10MB 이하 (압축 전) |
| 압축 후 목표 | 사진 1장당 100~200KB |

### 2.11 Analytics: Vercel Analytics + PostHog (추가)

**선정 이유:** MVP-α는 트래픽 실험이 아닌 행동 실험. 퍼널/리텐션 분석이 핵심.

**구성:**
- **Vercel Analytics**: 트래픽/페이지뷰 기본 모니터링. Vercel 배포에 내장, 설정 불필요
- **PostHog** (Cloud, EU 서버): 커스텀 이벤트 + 퍼널 + 리텐션 분석
  - `autocapture: false` — 핵심 이벤트만 수동 capture (노이즈 방지)
  - `persistence: 'memory'` — cookieless 모드 (GDPR 쿠키 동의 불필요)
  - 무료 한도: 1M 이벤트/월 (MVP~V1 구간 충분)

**GA4 제외 사유:**
- 퍼널 분석 설정이 복잡 (Explorations 수동 구성)
- 글로벌 타겟 → GDPR 쿠키 동의 배너 구현 필요 → MVP 범위 초과
- MVP → V1 도구 교체 시 데이터 연속성 유실

### 2.12 에러 모니터링: Sentry (추가)

**추가 이유:**
- 쿠킹 모드, 레시피 작성 플로우 등 UX 복잡도가 높은 기능에서 클라이언트 에러 관측이 필수
- 런칭 후 유저가 마주치는 에러를 실시간으로 파악하지 못하면 이탈 원인을 알 수 없음
- Sentry Free 티어: 5K 이벤트/월 — MVP~V1까지 충분

**적용 범위:**
- Next.js 클라이언트 + 서버 에러 자동 수집
- Supabase Edge Function 에러 (V1 이후)

### 2.13 테스트: Vitest + Playwright (추가)

**추가 이유:**
- 단위 테스트 없이 리팩토링/기능 추가 시 회귀 버그 발생 위험
- 레시피 작성 → 업로드 → 검색 → 쿠킹 모드 등 핵심 플로우는 E2E 테스트로 보호 필요

**레이어 구분:**

| 레이어 | 도구 | 대상 |
|--------|------|------|
| 단위 테스트 | Vitest | 단위 변환 유틸, Zod 스키마 검증, 헬퍼 함수 |
| E2E 테스트 | Playwright | 레시피 CRUD, 검색, 쿠킹 모드 핵심 플로우 |

**원칙:** 전수 테스트가 아닌 핵심 플로우만 우선 커버. MVP-α에서는 단위 테스트만, MVP-β부터 E2E 추가.

### 2.14 린트/포맷/커밋 가드 (추가)

**구성:**
- **ESLint**: Next.js 기본 ESLint 설정 + strict TypeScript 규칙
- **Prettier**: 코드 포맷 통일 (탭/스페이스, 따옴표 등)
- **husky + lint-staged**: 커밋 시 자동으로 lint + format 실행

**팀 규칙과 연동:**
- `any` 사용 금지 → ESLint `@typescript-eslint/no-explicit-any: "error"`
- CI에서 `type-check` 필수 실행 (`tsc --noEmit`)
- 커밋 전 lint-staged로 변경 파일만 검사 → 커밋 속도 유지

---

## 3. 비용 로드맵

| 단계 | Vercel | Supabase | 검색 | 이미지 | 합계 |
|------|--------|----------|------|--------|------|
| MVP 개발 중 | $0 (Hobby) | $0 (Free) | $0 | $0 | **$0** |
| 런칭 시점 | Pro $20/월 + 사용량 ² | Pro $25/월 | $0 (PGroonga) | $0 | **$45~/월** |
| V1 | Pro $20/월 + 사용량 ² | Pro $25/월 | Meilisearch $30/월 | $0~5/월 | **$75~80+/월** |

> ² Vercel Pro는 플랫폼 fee($20/월) + 사용량(크레딧) 구조. 이미지 최적화, 빌드 시간, 대역폭이 기본 포함량을 초과하면 추가 과금 발생. 초기에는 기본 포함량 내에서 운영 가능하나, 트래픽 증가 시 $20 이상 될 수 있음.

---

## 4. SI 출신 개발자 온보딩 참고

**SI 환경 → 맛담 스택 대응:**

| SI | 맛담 | 핵심 차이 |
|----|------|----------|
| Java/C# | TypeScript | 타입 시스템 유사, 문법 차이 |
| Spring MVC / ASP.NET | Next.js App Router | 서버/클라이언트 컴포넌트 경계 개념 |
| JSP/Thymeleaf | React + Tailwind | 컴포넌트 사고방식 전환 필요 |
| Oracle/MSSQL | PostgreSQL (Supabase) | SQL 유사, Supabase 클라이언트 학습 |
| WAS/온프레미스 | Vercel (서버리스) | 배포 개념 차이 |

**팀 규칙:**
- TypeScript strict 모드 유지 — `any` 사용 금지
- Server Component / Client Component 구분 기준 문서화 필요
- shadcn/ui 컴포넌트 패턴을 기본으로 사용

---

## 5. 모노레포 구조

```
mat_dam/
├── apps/
│   └── web/                    # Next.js 15 App
├── packages/
│   ├── types/                  # 공유 타입 + Zod 스키마
│   ├── utils/                  # 단위 변환 등 유틸
│   └── supabase/               # Supabase 클라이언트, 마이그레이션, 시드
├── docs/                       # 문서
└── turbo.json                  # Turborepo 설정
```

**향후 확장:**
- `apps/admin` — 관리자 대시보드 (V2)
- `packages/` 하위에 검색 추상화 레이어 추가 (Meilisearch 전환 시)
