<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/work_order/step1-manual-setup-guide.md -->

# 사용자 작업 가이드

> 지금 해야 할 일이 맨 위에 있습니다. 완료되면 체크하세요.

---

## 지금 해야 할 일

### 1. DB 마이그레이션 실행 (5분)

Supabase에 테이블을 만들어야 로그인/레시피 기능이 동작합니다.

- [ ] Supabase 대시보드 접속
- [ ] 왼쪽 메뉴 `SQL Editor` 클릭
- [ ] `New query` 클릭
- [ ] `supabase/migrations/001_mvp_alpha.sql` 파일 내용 전체 복사 → 붙여넣기
- [ ] `Run` 클릭
- [ ] "Success. No rows returned" 메시지 확인
- [ ] 왼쪽 `Table Editor`에서 테이블 6개 생성 확인:
  - `users`, `ingredients`, `units`, `recipes`, `recipe_steps`, `recipe_ingredients`

### 2. Vercel 환경변수 추가 + 재배포 (3분)

Vercel이 이미 배포되어 있지만 환경변수가 없으면 Supabase 연동이 안 됩니다.

- [ ] Vercel 대시보드 > `matdam` 프로젝트 > `Settings` > `Environment Variables`
- [ ] 아래 값 추가:

| Key                             | Value                                      |
| ------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xwrzetiskhgibsproctd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local`에 있는 anon key               |
| `SUPABASE_SERVICE_ROLE_KEY`     | `.env.local`에 있는 service role key       |
| `NEXT_PUBLIC_SENTRY_DSN`        | `.env.local`에 있는 Sentry DSN             |
| `NEXT_PUBLIC_POSTHOG_KEY`       | `.env.local`에 있는 PostHog key            |
| `NEXT_PUBLIC_POSTHOG_HOST`      | `https://us.posthog.com`                   |

- [ ] `Deployments` 탭 > 최신 배포 > `...` 메뉴 > `Redeploy` 클릭

### 3. Google 로그인 테스트 (2분)

- [ ] 배포된 사이트 접속 (또는 `pnpm dev`로 로컬)
- [ ] `/login` 페이지 이동
- [ ] "Sign in with Google" 클릭
- [ ] Google 계정 선택 → 로그인 완료
- [ ] Supabase `Table Editor > users` 에서 본인 레코드 생성 확인

### 4. Sentry 테스트 에러 수신 확인 (1분)

- [ ] 사이트 접속 후 브라우저 콘솔에서:
  ```js
  throw new Error("Sentry test error from MatDam");
  ```
- [ ] Sentry 대시보드 > `Issues`에 에러 표시 확인

### 5. PostHog 수신 확인 (1분)

- [ ] 사이트 아무 페이지 접속
- [ ] PostHog 대시보드 > `Activity` 또는 `Events`에서 이벤트 수신 확인
  - `autocapture: false` 설정이라 `$pageview`만 있을 수 있음

---

## 완료된 항목

### Step 1 초기 설정 (2026-02-19 완료)

| #   | 항목                               | 상태    |
| --- | ---------------------------------- | ------- |
| 1   | Supabase 프로젝트 생성             | ✅ 완료 |
| 2   | Google OAuth 설정 (GCP + Supabase) | ✅ 완료 |
| 3   | Sentry 프로젝트 생성               | ✅ 완료 |
| 4   | PostHog 프로젝트 생성              | ✅ 완료 |
| 5   | Vercel 프로젝트 연결               | ✅ 완료 |
| 6   | `.env.local` 키 값 설정            | ✅ 완료 |

---

## 참고: 서비스 대시보드 링크

| 서비스       | URL                              |
| ------------ | -------------------------------- |
| Supabase     | https://supabase.com/dashboard   |
| Google Cloud | https://console.cloud.google.com |
| Vercel       | https://vercel.com/dashboard     |
| Sentry       | https://sentry.io                |
| PostHog      | https://us.posthog.com           |
