<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/worklog.md -->

# 맛담 워크로그

---

## 긴급 오류/수정사항

(없음)

---

## 오류/수정사항/해야할 작업

### 코드리뷰 미완료

- [x] 2026-02-26 번역 기능 코드리뷰 완료 (15건 발견, 전부 수정)

### 향후 번역 방향성 변경 예정

- [ ] **locale 기반 단일 언어 번역으로 변경** — 현재는 `SUPPORTED_LOCALES`에 빠진 모든 언어로 번역하는 방식. 추후 접속 locale 기반으로 해당 언어만 번역하도록 변경 예정.
  - 방향: URL의 locale (`/ja/recipe/...`) 감지 → 현재 접속 locale이 빠져있을 때만 source → 해당 locale 번역
  - 예: 일본 유저가 `/ja/recipe/dongpo-pork` 접속 → `{"ko": "동파육"}` → 한→일만 번역 (영어 등 다른 언어는 번역 안 함)
  - 수동 트리거 버튼: `recipeId` + `targetLocale` 파라미터로 전달
  - 크론잡: 접속 로그 기반으로 수요 있는 locale만 번역하거나, 인기 locale 우선 처리

### 확인 필요 항목

- [ ] Supabase에 마이그레이션 009 적용 (`009_user_ranking.sql`) + activity_score 컬럼 확인
- [ ] 레시피 공개 시 activity_score 증가 확인
- [ ] 프로필/레시피 상세/댓글에서 등급 뱃지 정상 표시 확인
- [ ] `/news` 페이지 접근 + 등급 설명 내용 확인

### 평가 스케일 방향 — 결정 완료 (2026-02-24)

- [x] "난이도 체감" 스케일 역전 완료: 매우 어려움=1, 어려움=2, 보통=3, 쉬움=4, 매우 쉬움=5. 슬라이더→텍스트 버튼 그룹으로 UI 변경. 높을수록 긍정(쉬움)으로 다른 항목(맛/재도전)과 방향 통일 → 3개 평균 = 종합 레시피 점수로 활용 가능

### 작업 우선순위 (2026-02-24 기준)

전체 미구현 항목을 우선순위별로 정리. ★ = 런칭 전 필수.

**P0 — 런칭 차단 항목**

- [x] ★ Sentry 에러 수집 연동 — 이미 구현 확인 (instrumentation.ts + instrumentation-client.ts + global-error.tsx + next.config.ts)
- [x] ★ GitHub Actions CI — 이미 구현 확인 (.github/workflows/ci.yml: lint + type-check + test)

**P1 — V1 핵심 기능 (사용자 경험 직결)**

- [x] Dietary Filter (Vegan/Halal/Gluten-free 라벨 + 탐색 필터) — 레시피 폼 태그 선택 + 탐색 필터 + 상세 뱃지
- [x] Shopping List (다중 레시피 재료 합산) — 북마크 기반 재료 합산 체크리스트 + GNB 링크
- [x] 레시피 내 재료 클릭 → Glossary 연결 — ingredient_id 있으면 /glossary/{id} 링크
- [x] PWA manifest + 홈 화면 추가 — manifest.json + SVG 아이콘 + 메타 태그
- [x] Wake Lock API (쿠킹 모드 화면 안 꺼지게) — visibilitychange 재획득 포함

**P2 — UX 고도화**

- [x] 드래그 앤 드롭 스텝 순서 변경 — `@dnd-kit/core` + `@dnd-kit/sortable`로 구현 완료 (step-editor.tsx)
- [x] 스와이프 네비게이션 (쿠킹 모드) — 좌우 터치 스와이프로 스텝 이동
- [x] 탐색 페이지 페이지네이션 — URL 기반 page 파라미터 + 이전/다음 버튼
- [x] 냉장고 털이 — 재료 검색/선택 → 매칭 레시피 추천 페이지
- [x] 홈 페이지 "더보기" 버튼 — 하단에 탐색 페이지 이동 CTA
- [x] 모바일 메뉴 그룹핑 — 탐색/내 활동 아코디언 구조로 정리
- [x] Recipe Linter — 미사용 재료/빈 단계(error) + 재료 미지정/타이머 미설정(warning)
- [x] DB 복합 인덱스 추가 (정렬 성능) — 019_composite_indexes.sql 13개 인덱스

**P3 — 안전장치 + 품질**

- [x] 유저 신고 시스템 UI + 자동 비공개
- [ ] pHash 중복 사진 검사
- [ ] EXIF 메타데이터 추출 (has_exif, device_category)
- [ ] Vitest 단위 테스트
- [ ] Playwright E2E 테스트

**P4 — 장기 로드맵**

- [ ] 사용자 리뷰 기반 추천 강화
- [ ] 난이도 이모지 → 커스텀 아이콘 교체
- [ ] 데스크톱 좌우 분할 입력 레이아웃
- [ ] 모바일 inputmode 최적화
- [ ] Vercel Analytics 연동
- [ ] 셰프 채널 / 권한 티어 / 커뮤니티 확장

### 맛 프로필 — 난이도 커스텀 아이콘

- [ ] **난이도 이모지 → 커스텀 아이콘 교체** — 현재 유니코드 이모지(🥵😓😐😊😎) 사용 중. Figma 등으로 요리사 표정 아이콘 5종(매우 어려움~매우 쉬움) 제작 후 SVG 컴포넌트로 교체. `taste-profile-display.tsx`의 `DIFFICULTY_EMOJI` 배열을 커스텀 SVG 컴포넌트로 대체

### 추천 시스템 개선 제안

- [ ] **사용자 리뷰 기반 추천 강화** — 현재 추천은 온보딩/설정에서 입력한 `taste_preferences`만 사용. 사용자가 실제로 높은 점수를 매긴 레시피들의 taste_profile 평균을 구해서 매칭하면 더 정확한 개인화 추천 가능. 예: 사용자가 taste_overall 4~5점 준 레시피들의 taste_sweet/salty/spicy/sour 평균 → 이 값을 preferences 대신 (또는 가중 합산) 추천 기준으로 사용

### 시드데이터/i18n 확장

- [x] 재료 시드데이터 확장 — `011_expanded_ingredient_seeds.sql`로 41개 재료 추가 완료 (Western 18 + Japanese 7 + Baking 10 + Common 6)

### 코드리뷰 잔여 Suggestion 항목 (나중에)

- [x] `edit/page.tsx`, `profile/page.tsx`에서 `<title>` → `generateMetadata` 패턴 통일 — 이미 구현 확인 완료
- [x] temp step 이미지 — `relocateTempStepImages` 구현 완료 (생성 시 자동 relocation + 삭제 시 temp 경로 포함 정리)

### 장기 로드맵 — 유저 등급 + 셰프 인증 + 커뮤니티

**유저 등급 시스템 (활동 점수 기반)**

구현 방식: `users.activity_score` 컬럼 + 각 테이블 INSERT/DELETE 트리거 자동 가감 (B 방식)

점수 공식:

| 활동               | 포인트 |
| ------------------ | ------ |
| 레시피 공개        | +10    |
| 리믹스 공개        | +5     |
| 추천 받음 (1건당)  | +2     |
| 리뷰 작성          | +3     |
| 댓글 작성          | +1     |
| 만들어봤어요       | +1     |
| 내 레시피 북마크됨 | +1     |

등급 체계 (7단계, 간격 확대):

| 등급 | 이름        | 필요 점수 |
| ---- | ----------- | --------- |
| 1    | 견습생      | 0         |
| 2    | 초보 요리사 | 30        |
| 3    | 가정 요리사 | 100       |
| 4    | 숙련 요리사 | 300       |
| 5    | 요리 장인   | 700       |
| 6    | 요리 달인   | 1500      |
| 7    | 요리 대가   | 3000      |

**셰프 인증 (등급과 별도)**

- `users.is_verified_chef` 플래그 (등급 무관)
- 전문 요리사 / 푸드 크리에이터 인증용 별도 뱃지
- 신청 → 관리자 승인 방식
- 프로필에 인증 배지 표시

구현 항목:

- [x] DB 마이그레이션: `activity_score INT DEFAULT 0` + `verified_type TEXT` 컬럼 추가
- [x] 6개 트리거 (recipes/recipe_votes/cook_reviews/comments/cook_logs/bookmarks INSERT/DELETE 시 점수 가감)
- [x] 기존 데이터 백필 SQL
- [x] 프로필 페이지에 등급 뱃지 표시
- [x] 셰프/파트너 인증 뱃지 UI

**커뮤니티 기능**

- [ ] **셰프 채널 (개인 페이지)** — 내 레시피 관리(기존) + 추천 식재료 큐레이션 + 추천 구매처 링크 + 팔로우/팔로워
- [ ] **커뮤니티 기능** — 셰프에게 질문, 리믹스 체인 활용 (댓글/리뷰는 소셜 기능 Phase 1~4에서 구현 완료)
- [ ] **재료 데이터 웹 편집** — 고티어/셰프가 웹에서 직접 식재료 정보(cuisines, importance 등) 편집

### 마스터플랜 대비 현황 (2026-02-24 기준)

**Step 1~4 (MVP-α): ✅ 완료**

- [x] Step 1: 환경+인증 (Supabase, Auth, Vercel, ESLint, PostHog)
- [x] Step 2: 재료 엔진 (시드 71개, 자동완성 RPC, 단위 변환)
- [x] Step 3: 레시피 CRUD (등록/수정/삭제, 슬라이드 입력, 이미지, 탐색, SEO)
- [x] Step 4: 리믹스 (리믹스 버튼, 부모 연결, Inspired by 표시)

**Step 5 (시드+런칭 준비): ⚠️ 부분 완료**

- [x] Privacy Policy + ToS
- [x] 랜딩 페이지
- [ ] 시드 레시피 10개 (콘텐츠 제작 필요)
- [ ] Reddit 소프트 런칭

**Step 6 (리뷰+북마크): ✅ 완료** (마스터플랜보다 앞서 구현)

- [x] 리뷰 시스템 (cook_reviews + taste profile)
- [x] "만들어봤어요" (cook_logs)
- [x] 북마크
- [x] 코멘트 시스템 + 대댓글 + 투표
- [ ] EXIF 메타데이터 추출 (has_exif, device_category)

**Step 7 (Glossary+필터): ⚠️ 부분 완료**

- [x] Glossary 페이지
- [x] Cuisine Pantry
- [x] 레시피 내 재료 클릭 → Glossary 연결
- [x] Dietary Filter (Vegan/Halal/Gluten-free 라벨)
- [ ] Vitest 단위 테스트

**Step 8 (쿠킹 모드+PWA): ⚠️ 부분 완료** (마스터플랜보다 앞서 구현)

- [x] 쿠킹 모드 풀스크린 UI
- [x] 스텝별 네비게이션 + 프로그레스바
- [x] 복수 타이머 동시 실행
- [x] 태블릿/모바일 반응형
- [x] Wake Lock API (화면 안 꺼지게)
- [x] 스와이프 네비게이션
- [x] PWA manifest + 홈 화면 추가
- [ ] Playwright E2E 테스트

**Step 9 (입력 UX 고도화): ⚠️ 부분 완료**

- [x] 재료 자동완성 숫자키 선택 + 페이지네이션
- [x] 드래그 앤 드롭 스텝 순서 변경 — `@dnd-kit` 구현 완료
- [ ] 데스크톱 좌우 분할 입력 레이아웃
- [ ] 모바일 inputmode 최적화

**Step 10 (리뷰 고도화+신고): ⚠️ 부분 완료**

- [x] 구조화 리뷰 (taste_overall, felt_difficulty, would_make_again + 디테일 6개)
- [ ] pHash 중복 사진 검사
- [x] 유저 신고 시스템 UI
- [x] 신고 N건 누적 → 자동 비공개

**Step 11 (쇼핑 리스트+추천): ⚠️ 부분 완료**

- [x] 추천 시스템 (맛 프로필 기반)
- [x] 인기 레시피 정렬
- [x] Shopping List (다중 레시피 재료 합산)
- [x] 남은 재료 연쇄 추천
- [x] 냉장고 털이

**Step 12 (온보딩+Linter): ⚠️ 부분 완료**

- [x] 온보딩 4단계 멀티스텝
- [x] Dietary Filter UX 고도화 (Soft/Hard 토글)
- [x] Recipe Linter — 미사용 재료/빈 단계(error) + 재료 미지정/타이머 미설정(warning)

**인프라 미구현:**

- [x] Sentry 에러 수집
- [x] GitHub Actions CI (lint + type-check 자동 실행)
- [ ] Vercel Analytics 연동
- [x] DB 복합 인덱스 추가 (정렬 성능) — 019_composite_indexes.sql

### 홈 페이지 코드리뷰 잔여 항목 (나중에)

- [ ] `page.tsx` — Supabase `users` 조인 배열 반환 `as unknown as` 이중 캐스트 → 공유 타입 정의로 개선
- [ ] `explore` 페이지에 리믹스 전용 필터 추가 후, 리믹스 섹션 "View all" 링크를 필터 적용된 URL로 변경
- [ ] 대기 컴포넌트 활성화 시: `chef-of-the-week-section.tsx` — "View Profile" 링크를 해당 셰프 프로필로 연결
- [ ] 대기 컴포넌트 활성화 시: `essential-ingredients-section.tsx` — glossary 페이지 구현 후 링크 연결
- [ ] 대기 컴포넌트 활성화 시: `kdrama-cravings-section.tsx` — KDramaItem type에 `id` 필드 추가 (React key 안정성)

---

## 2026-03-03 (월)

### 레시피 입력 언어 자동 감지 (detectLocale)

**문제:** 레시피 폼에서 JSONB 키를 URL의 locale(`/en/`, `/ko/`)로 결정하고 있어서, 영어 페이지에서 한국어를 입력하면 `{"en": "한국어텍스트"}`로 잘못 저장됨. 번역 시에도 en 키에 한국어가 들어있어 번역 불필요로 판단되는 문제 발생.

**해결:**

- `apps/web/src/lib/recipe/localized-text.ts` — `detectLocale(text)` 함수 추가
  - 한글 포함 → `"ko"`, 히라가나/가타카나 → `"ja"`, 한자 → `"zh"`, 그 외 → `"en"`
  - 유니코드 정규식 기반, 외부 라이브러리 불필요
- `apps/web/src/components/recipe/recipe-form.tsx` — 14곳의 `[locale]` → `[detectLocale(text)]`로 교체
  - `handleCreate`: title, description, step description/tip, ingredient custom_name/qualifier/note
  - `handleUpdate`: 동일 범위
  - `insertStepsAndIngredients`: 동일 범위

**향후 언어 확장 시:**

- 한/중/일/영 → 유니코드 정규식으로 충분 (현재 구현으로 커버)
- 라틴 문자 계열 다국어 (프/독/스페인어 등) 구분 필요 시 → `franc` 라이브러리 도입

### 재료 note/qualifier 영문 번역 누락 수정 (DB)

- `recipe_ingredients`의 note/qualifier JSONB에서 `en` 키에 한국어가 그대로 복사된 항목 47개 수동 수정
  - note 40개 + qualifier 7개 (전부 garlic "다진")
- 화유(花油) 재료 영문명 `Lard` → `Hwayou (Fire Oil)`, note `Sichuan peppercorn oil` → `Smoky flavored oil`로 수정

### 레시피 설명 보강 + 작성자 통합

- 31개 레시피 description을 1문장 → 2~3문장으로 보강 (ko + en 동시)
- 전체 레시피 author를 `matdam` 계정으로 통합, `matdam` role을 `admin`으로 변경

### 언어 설정 기능 구현

- `packages/types/src/user.ts` — `UserPreferences`에 `preferred_locale?: "ko" | "en"` 추가
- `apps/web/messages/ko.json` / `en.json` — settings 네임스페이스에 `languageLabel`, `languageKo`, `languageEn` i18n 키 추가
- `apps/web/src/components/layout/gnb.tsx` — GNB에 언어 드롭다운 셀렉터 추가 (데스크톱 + 모바일)
  - 🇰🇷 한국어 / 🇺🇸 English 국기+자국어 표시, 클릭 시 드롭다운
  - `NEXT_LOCALE` 쿠키 설정 (1년 유효) + 경로 locale 전환 + 로그인 시 DB fire-and-forget 업데이트
  - `LOCALE_OPTIONS` 배열로 관리 — 언어 추가 시 한 줄만 추가하면 됨
- `apps/web/src/app/[locale]/settings/_components/settings-form.tsx` — Display Name 아래 언어 선택 섹션 추가
  - 한국어 / English 버튼 (기존 Skill Level UI 패턴)
  - 저장 시 DB `preferred_locale` + `NEXT_LOCALE` 쿠키 반영, locale 변경 시 새 URL로 redirect

**동작 우선순위:** NEXT_LOCALE 쿠키 (1순위) → Accept-Language 헤더 (2순위) → defaultLocale "en" (3순위)

---

## 2026-02-28 (금)

### 유저 등급 시스템 + 새소식 페이지 구현

**1. DB 마이그레이션 (`009_user_ranking.sql`)**

- `users` 테이블에 `activity_score INTEGER DEFAULT 0` + `verified_type TEXT` 컬럼 추가
- `sync_activity_score()` 트리거 함수: 6개 테이블 (recipes/recipe_votes/cook_reviews/comments/cook_logs/bookmarks)에서 INSERT/DELETE/UPDATE 이벤트 감지하여 점수 자동 가감
- 기존 데이터 백필 SQL (모든 유저의 activity_score 일괄 계산)
- 등급은 DB 컬럼 없이 앱에서 계산 (7단계: 견습생~요리 대가)

**2. 타입 + 상수**

- `packages/types/src/user.ts` — `UserRankKey`, `VerifiedType` 타입 추가, `UserProfile`에 `activity_score`, `verified_type` 추가
- `packages/types/src/index.ts` — 새 타입 export
- `apps/web/src/lib/user/rank-constants.ts` — `RANK_DEFINITIONS` 7단계 정의 + `getRankFromScore()` 유틸

**3. RankBadge 컴포넌트**

- `apps/web/src/components/user/rank-badge.tsx` — 등급별 색상 배지 + 인증 셰프/파트너 BadgeCheck 아이콘

**4. 뱃지 통합 (5개 파일)**

- `recipe/[slug]/page.tsx` — 작성자 이름 옆 RankBadge
- `profile/page.tsx` — 닉네임 옆 RankBadge + 활동 점수
- `user/[userId]/page.tsx` — 닉네임 옆 RankBadge + 활동 점수
- `comment-section.tsx` — 쿼리에 activity_score, verified_type 추가
- `comment-card.tsx` — 작성자 옆 RankBadge

**5. 새소식 페이지**

- `apps/web/src/app/[locale]/news/page.tsx` — 등급 시스템 소개 아티클 (7단계 테이블 + 점수 획득 방법)
- `footer.tsx` — Navigation에 새소식 링크 추가

**6. i18n**

- `ko.json` / `en.json` — `rank` (7등급 + 인증 타입), `news` (제목/소개/등급표/점수가이드), `footer.news`, `profile.activityScore`, `userProfile.activityScore` 키 추가

**tsc --noEmit 통과 확인**

---

### 마이그레이션 파일 통합 정리

21개 → 8개 파일로 통합. 원본 백업: `/Users/hodduk/Documents/git/mat_dam/supabase/migrations_backup_20260228.tar.gz` (`tar xzf`로 복원 가능)

| 병합 파일                  | 원본                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `001_schema.sql`           | 001, 005, 007, 010, 012, 014, 016, 017 (ALTER TABLE 7건 → CREATE TABLE 최종 상태로 folding) |
| `002_seed_ingredients.sql` | 002, 007(UPDATE), 009, 011 (재료 107개 + 단위 15개 통합)                                    |
| `003_storage_bucket.sql`   | 004                                                                                         |
| `004_rpc_functions.sql`    | 003, 008, 012, 018, 020 (superseded RPC 제거, 최종 버전만 유지)                             |
| `005_social_tables.sql`    | 006, 010, 012 (parent_comment_id CREATE TABLE에 포함)                                       |
| `006_reports.sql`          | 015                                                                                         |
| `007_indexes.sql`          | 019                                                                                         |
| `008_seed_recipes.sql`     | 013, 021 (레시피 12개 통합, TEXT→JSONB 시드 반영)                                           |

### 레시피 3개 시드 추가 (021 → 008에 통합)

- 고추장찌개 (`gochujang-jjigae`) — 4인분, 6단계, 재료 12개
- 마라(로제) 떡볶이 (`mara-rose-tteokbokki`) — 평생 떡볶이 리믹스, 3인분, 6단계, 재료 15개
- 꽈리고추 목살조림 (`kkwarigochu-moksal-jorim`) — 3인분, 7단계, 재료 14개

### 슬러그 transliteration 적용

- `transliteration` 패키지 설치, `recipe-form.tsx`의 `generateSlug`에 `slugify()` 적용
- 한글/일본어/중국어 등 비라틴 문자 → 로마자 변환 (예: 매운 떡볶이 → `maeun-tteokbokki-a1b2c3d4`)

### 재료 note 괄호 표시 수정

- `recipe-detail-client.tsx` — JSX 괄호 공백 제거 (`{"("}`, `{")"}`)
- `editable-translation.tsx` — 연필 아이콘 `inline-flex gap-1` → `relative inline` + `absolute` 위치 (레이아웃 영향 제거)

### Step 11 & 12 미완료 항목 구현

**1. 남은 재료 연쇄 추천 (Step 11)**

- `fridge/page.tsx` — `searchParams` 수신, `from` 파라미터 추출 → `FridgeClient`에 전달
- `fridge-client.tsx` — `fromRecipeId` prop 추가, useEffect로 레시피 재료 자동 로드 + 자동 검색 (ref flag 1회), 안내 배너 UI + "모두 지우기" 버튼
- `recipe-social-client.tsx` — cook_log 존재 시 "남은 재료로 뭐 해먹지?" 링크 버튼 추가 (`Utensils` 아이콘, `/{locale}/fridge?from={recipeId}`)
- i18n: `fridge.leftoverBanner`, `fridge.clearAll`, `recipeDetail.leftoverRecommend` (ko/en)

**2. Dietary Filter Soft/Hard 토글 (Step 12)**

- `packages/types/src/user.ts` — `DietaryPreferenceMode`, `DietaryPreference` 타입 추가, `UserPreferences.dietary_preferences` 필드 추가
- `packages/types/src/index.ts` — 새 타입 export
- `preference-constants.ts` — `DIETARY_MODE_I18N` 상수 추가
- `020_search_recipes_v2.sql` — `search_recipes` RPC v2: `dietary_hard_filter` (ALL 포함 필수, `@>`), `dietary_soft_filter` (매칭 수 기반 정렬 부스트). 기존 6파라미터 default 값으로 하위 호환.
- `search-params.ts` — `dietary_hard`, `dietary_soft` Zod 스키마 필드 추가
- `dietary-filter-popover.tsx` — 3-state UI: 미선택 → Checkbox 선택 → hard(기본) ↔ soft 토글. URL: `?dietary_hard=..&dietary_soft=..`. 배지: hard 빨강, soft 노랑. `userPreferences` prop으로 유저 설정 자동 적용.
- `explore/page.tsx` — `searchParams` 타입 확장, 로그인 유저 `preferences` 조회 → `DietaryPreference[]` 변환 → popover에 전달, RPC에 hard/soft 전달. URL 파라미터 없으면 유저 설정 자동 적용.
- `onboarding-form.tsx` — `DietaryPreference[]` 상태로 변경, 첫 선택 hard 기본, 선택 항목 옆 선호/필수 토글. `dietary_preferences` + `dietary_restrictions` 동시 저장 (하위 호환).
- `settings-form.tsx` — 동일 soft/hard 토글 적용
- `page.tsx` (홈) — 로그인 유저 hard 태그 조회 → 최신/리믹스 쿼리 `.contains()` 필터, 인기/추천 RPC over-fetch 후 클라이언트 필터
- i18n: `explore.filterModeSoft/Hard`, `onboarding.modeSoft/Hard`, `settings.modeSoft/Hard` (ko/en)

**tsc --noEmit 통과 확인**

---

## 2026-02-27 (목)

### P2 완료: 드래그 앤 드롭 확인 + DB 복합 인덱스 추가

1. **드래그 앤 드롭 스텝 순서 변경** — 이미 `@dnd-kit/core` + `@dnd-kit/sortable`로 `step-editor.tsx`에 구현 완료 확인. 워크로그 체크 처리.
2. **DB 복합 인덱스 13개 추가** — `019_composite_indexes.sql` 신규 생성
   - TIER 1 (핵심 5개): recipes published+created, published+upvote, author+created / cook_logs user+recipe / recipe_ingredients ingredient+recipe
   - TIER 2 (고빈도 4개): recipes published+remix / comments recipe+created / recipe_votes user+recipe / bookmarks user+recipe
   - TIER 3 (보조 3개): reports reporter+target / recipe_steps recipe+order / recipe_ingredients recipe+order
   - Partial index (`WHERE published = true`) + DESC 정렬 + `IF NOT EXISTS` 멱등성

### 보안 스캔 (OWASP ZAP) 수정

OWASP ZAP 2.17.0 자동 스캔 결과 기반 보안 취약점 수정. 보고서: `docs/matdam_security_audit_report_260226.html`

**수정 완료 항목:**

1. **SQL Injection (HIGH→해결)** — `explore/page.tsx`, `glossary/page.tsx`
   - `.or()` 문자열 보간에서 블랙리스트 이스케이프 → 화이트리스트 방식 전환
   - 영문/한글/숫자/공백/하이픈만 허용, PostgREST 특수문자 원천 차단
   - glossary `category`/`cuisine`은 이미 화이트리스트 검증 (false positive)

2. **Security Headers (MEDIUM→해결)** — `next.config.ts`
   - CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
   - Referrer-Policy, Permissions-Policy, object-src/base-uri/form-action/frame-src 추가
   - PostHog 스크립트/API + Sentry worker blob: 허용
   - `unsafe-eval`은 dev 모드에서만 허용, prod 제거

3. **X-Powered-By 제거 (LOW→해결)** — `next.config.ts`
   - `poweredByHeader: false` 설정

4. **Cookie HttpOnly (LOW→해결)** — `middleware.ts`, `supabase/middleware.ts`
   - 모든 쿠키(Supabase + NEXT_LOCALE)에 httpOnly/secure/sameSite 강제 적용

**ZAP false positive (오탐) 항목:**

- SQL Injection: glossary `category`/`cuisine`, explore `sort` — 전부 화이트리스트 검증 완료, 시간 기반 탐지 오탐
- CSP unsafe-inline (script/style) — Next.js/Tailwind 필수, nonce 기반 전환 시 제거 가능 (별도 작업)
- Timestamp Disclosure, Suspicious Comments, Content-Type Missing — informational

### 번역 기능 버그 수정

1. **번역 "forbidden" 에러** — `translate-recipe/route.ts`
   - 원인: 레시피 소유자만 번역 가능하도록 제한되어 있었음
   - 수정: 소유권 체크 제거, service role 클라이언트로 RLS 우회, 모든 인증 사용자 번역 가능

2. **번역 후 페이지 갱신 안 됨** — `recipe-language-switcher.tsx`
   - 원인: ISR 캐시 (revalidate=3600)로 `router.refresh()`가 캐시된 페이지 반환
   - 수정: `window.location.reload()`로 하드 리로드

3. **번역 버튼 사라짐** — `recipe-language-switcher.tsx`
   - 원인: translated_locales 업데이트 후 isStale=false가 되어 버튼 숨김
   - 수정: `isAuthenticated && !isOriginal` 조건으로 비원본 locale에서 항상 표시

---

## 2026-02-26 (수) — 오후

### 공개 유저 프로필 페이지 + 유저 신고 기능

**1. 공개 유저 프로필 페이지 신규 생성**

- `apps/web/src/app/[locale]/user/[userId]/page.tsx` — 신규 생성
  - URL: `/{locale}/user/{userId}` (읽기 전용 공개 프로필)
  - avatar, display_name, 가입일, 공개 레시피 수 표시
  - 공개 레시피 그리드 (published=true만, profile 페이지 `renderBookmarkGrid` 스타일 재활용)
  - 본인 프로필: 설정 페이지 링크 (Settings 아이콘)
  - 타인 프로필: ReportDialog (유저 신고) 버튼
  - `generateMetadata` — locale 대응 메타데이터 (`getTranslations` 사용)
  - UUID 형식 검증 — 잘못된 userId 시 500이 아닌 `notFound()` 반환

**2. 작성자 이름 클릭 가능 Link 변경**

- `recipe/[slug]/page.tsx` — 작성자 이름 `<span>` → `<Link href=/{locale}/user/{author_id}>` 변경
- `comment-card.tsx` — 댓글 작성자 이름 `<span>` → `<Link href=/{locale}/user/{user_id}>` 변경

**3. 유저 신고 기능**

- `015_reports.sql` — CHECK 제약조건에 `'user'` 추가, 트리거 함수에 user 케이스 추가 (`trust_score = -1`)
- `report-dialog.tsx` — `targetType` 타입에 `"user"` 추가
- 트리거 threshold `>= 3` → `= 3` 변경 (정확히 3건째에만 1회 실행, 반복 실행 방지)

**4. i18n**

- `en.json` / `ko.json` — `userProfile` 네임스페이스 추가 (title, recipes, noRecipes, memberSince, recipeCount, settings, minutes, servings)

**코드리뷰 4건 수정:**

- Critical: UUID 형식 검증 추가 (500→404 정상 처리)
- Critical: generateMetadata 한국어 하드코딩 → getTranslations locale 대응
- Warning: 트리거 threshold `>= 3` → `= 3` (멱등성)
- Suggestion: 미사용 `userProfile.reportUser` i18n 키 삭제

**tsc 통과 확인 완료**

---

## 2026-02-26 (수) — 오전

### CI/CD 수정 + Vercel 배포 복구

- CI pnpm 버전 충돌 수정 (action-setup `version: 9` 제거 → package.json `packageManager` 사용)
- `@matdam/supabase` 패키지 `@types/node` 추가 (CI type-check `process` 에러)
- CI test 단계 제거 (테스트 스크립트 미존재)
- **Vercel 배포 차단 원인 발견**: `vercel.json` 크론잡 `0 * * * *` (매시간) → Hobby 플랜 제한 초과로 배포 자체 거부
- 크론 스케줄 `0 0 * * *` (하루 1회)로 변경 → 배포 정상 복구

### 코드 리뷰 37건 수정 (이전 세션 커밋)

BUG 9 / SECURITY 4 / PERF 5 / WARN 12 / SUGGESTION 7 — 19개 파일 수정

### 번역 기능 코드리뷰 15건 수정

- translate-recipe: DB fetch 에러 체크, API 키 조기 검증, `response.content[]` 빈 배열 가드
- cron: `CRON_SECRET` 미설정 시 500 + 로그, content 가드
- owner-menu: API 에러 메시지 파싱, setTimeout 언마운트 누수 수정
- `TranslationItem` 타입 공유 파일 추출 (`translation-types.ts`)
- `vercel.json`: cron 함수 `maxDuration: 60` 설정

### 탐색 페이지 페이지네이션

- URL 기반 `page` 파라미터 + 페이지당 20개
- count 쿼리로 총 페이지 수 계산
- 이전/다음 버튼 + "Page 1 of N" 표시
- 기존 필터/정렬/검색어 파라미터 보존

### Recipe Linter 구현

- `recipe-linter.ts` 유틸 신규 생성 (4가지 규칙)
  - 미사용 재료 (error), 빈 단계 (error)
  - 재료 미지정 단계 (warning), 타이머 미설정 (warning)
- `recipe-form.tsx`에 통합: 저장 시 자동 검증, error 시 제출 차단
- 경고 배너 UI (빨강/노랑 severity 분리)

### 수동 번역 트리거 + 크론잡 자동 번역 구현

**1. RecipeOwnerMenu 번역 버튼 추가**

- `recipe-owner-menu.tsx` — 수정/삭제 옆에 Languages 아이콘 번역 버튼 추가
- Desktop: 독립 버튼, Mobile: 드롭다운 메뉴 항목
- 클릭 시 `/api/translate-recipe` POST 호출 (현재 레시피만 번역)
- 로딩 상태 (Loader2 spinner) + 성공 메시지 (3초 후 사라짐) + 에러 메시지
- 성공 시 `router.refresh()`로 번역된 콘텐츠 반영

**2. translate-recipe API 확장 (title/description 번역)**

- `translate-recipe/route.ts` — 기존 steps/tips/custom_name에 더해 recipe `title`, `description` JSONB도 번역 대상에 추가
- `TranslationItem` 타입 확장: `"recipes"` 테이블 + `"title"` 필드 지원
- DB 업데이트 시 `recipes` 테이블은 `recipe_id`, 나머지는 `id` 컬럼으로 분기

**3. 크론잡 자동 번역 엔드포인트**

- `api/cron/translate-missing/route.ts` — 신규 생성
- `Authorization: Bearer ${CRON_SECRET}` 헤더 검증 (Vercel Cron 표준)
- `SUPABASE_SERVICE_ROLE_KEY`로 service role 클라이언트 생성 (RLS 우회)
- recipe_steps + recipes 테이블에서 locale 키가 불완전한 레시피 탐색
- 매시간 최대 5개 레시피 자동 번역 (title/description/steps/tips/custom_name)

**4. 기타**

- `vercel.json` — 매시간 크론 스케줄 (`0 * * * *`)
- `.env.example` — `CRON_SECRET` 추가
- `en.json` / `ko.json` — translate/translating/translateSuccess/translateError 키 추가

**tsc 통과 확인 완료**

---

## 2026-02-25 (화)

### P1 핵심 기능 5개 일괄 구현

**P1-1: Dietary Filter (식이 라벨 + 탐색 필터)**

- `recipe-form.tsx` — 식이 태그 7개 (vegan/vegetarian/pescatarian/gluten_free/dairy_free/nut_free/halal) 토글 배지 UI 추가
- `explore/page.tsx` — dietary 필터 배지 행 추가 + `overlaps()` 배열 필터
- `recipe/[slug]/page.tsx` — Meta badges 영역에 dietary 뱃지 표시
- `edit/page.tsx` — initialData에 dietaryTags 전달
- `types.ts` — RecipeCardData에 dietary_tags 추가
- en.json / ko.json — recipe/explore/recipeDetail 네임스페이스에 번역 키 추가

**P1-2: Shopping List (다중 레시피 재료 합산)**

- `shopping-list/page.tsx` — 신규 서버 컴포넌트 (북마크 레시피 재료 조회 + ingredient_id/unit 기준 합산)
- `shopping-list-client.tsx` — 신규 클라이언트 컴포넌트 (레시피 토글 선택 + 체크리스트 + 카테고리 그룹핑)
- `checkbox.tsx` — 신규 UI 컴포넌트
- `gnb.tsx` — 데스크톱/모바일 메뉴에 Shopping List 링크 추가

**P1-3: 재료 → Glossary 연결**

- `recipe-detail-client.tsx` — ingredient_id 있는 재료를 `/glossary/{id}` 링크로 변환 (matdam-gold 색상)

**P1-4: PWA manifest + 홈 화면 추가**

- `public/manifest.json` — PWA manifest (standalone, SVG 아이콘)
- `public/icons/icon.svg` — 금색 원 + 맛 글자 SVG 아이콘
- `layout.tsx` — Next.js Metadata API로 manifest/themeColor/appleWebApp 메타 태그 추가

**P1-5: Wake Lock API**

- `cooking-mode.tsx` — useEffect로 Wake Lock 요청/해제 (visibilitychange 재획득 포함)

**tsc 통과 확인 완료**

### P2 UX 고도화

**P2-1: 냉장고 털이 (재료 기반 레시피 추천)**

- `fridge/page.tsx` — 신규 서버 컴포넌트 (인증 불요)
- `fridge-client.tsx` — 재료 자동완성 검색 (search_ingredients RPC, 300ms 디바운스) + 선택 재료 뱃지 + 매칭 레시피 검색/정렬 (매칭률 높은 순)
- `gnb.tsx` — 데스크톱/모바일 메뉴에 냉장고 링크 추가

**P2-2: 스와이프 네비게이션 (쿠킹 모드)**

- `cooking-mode.tsx` — useRef로 터치 좌표 추적 + onTouchStart/onTouchEnd 핸들러
- 좌→우 스와이프 = 이전 단계, 우→좌 = 다음 단계
- 수직 스크롤 구분 (|dy| > |dx| 무시) + 최소 임계값 50px

**P2-3: 홈 페이지 "더보기" 버튼**

- `page.tsx` (홈) — 모든 섹션 하단에 탐색 페이지 이동 CTA 버튼 추가
- en.json/ko.json — `home.exploreMore` 번역 키

**P2-4: 모바일 메뉴 그룹핑**

- `gnb.tsx` — 모바일 메뉴를 탐색 그룹 (Explore/Glossary/Fridge) + "내 활동" 아코디언 (Create/Profile/Bookmarks/Shopping List/Settings) + Sign Out으로 구조화
- en.json/ko.json — `nav.myActivity` 번역 키

---

## 2026-02-24 (월)

### 코드 검토 일괄 수정 (26건)

전반 코드 검토 후 보안/크래시/로직/코드 품질 일괄 수정.

**Critical 7건:**

- RPC `upsert_recipe_details`에 `auth.uid()` 소유자 권한 체크 추가 (보안 취약점)
- `publishRef` 기본값 `initialData?.published ?? true`로 변경 (드래프트 의도치 않은 공개 방지)
- `parentRecipe.users?.display_name` optional chain 추가 (SSR 500 방지)
- `comment-card` author null 가드 (삭제된 유저 크래시 방지)
- `CookReviewForm` remount key 제거 (stale prop 문제)
- 모든 redirect에 locale prefix 추가 (4개 파일)
- storage 파일 확장자 MIME 기반으로 변경

**Warn 12건:**

- dummy UUID cook_reviews 쿼리 제거, vote double-click race condition 수정
- 에러 피드백 UI 추가 (cook-log/comment-form/cook-review-form 3건)
- AudioContext 미닫힘 수정, GNB getUser 중복 호출 제거
- GNB 모바일에 북마크 링크 추가, 한글 slug 하이픈 prefix 수정, 검색 이스케이핑 강화

**Suggestion 7건:**

- `RecipeCardData` 공유 타입 추출 (5개 파일 중복 제거)
- `DifficultyBadge` 공유 컴포넌트 추출 (5개 파일 중복 제거)
- `UserTier` 중복 타입 통합, `RecipeStep.tip` 타입 추가
- JSON-LD `recipeCuisine` 하드코딩 제거, 별점 float 반올림

### 성능 최적화

**HIGH IMPACT:**

- `loading.tsx` 스켈레톤 4개 추가 (홈/탐색/레시피상세/프로필) — 데이터 로딩 중 스트리밍
- `<img>` → `next/image` 전환 (8개 파일, 13개 이미지) — WebP 자동 변환, lazy loading
- 히어로 이미지 `priority={true}` — LCP 최적화
- `recommendedRecipes` RPC를 `Promise.all`로 병렬화

**MEDIUM IMPACT:**

- ISR `revalidate=3600` 레시피 상세 페이지에 추가 (CDN 캐시)
- `DifficultyBadge` 서버 컴포넌트화 (클라이언트 번들 감소)

### 난이도 이모지 + 라벨 개선

- `taste-profile-display.tsx` — 난이도를 이모지(🥵😓😐😊😎) + 텍스트 2줄 레이아웃으로 변경
- 필드 순서: 맛 종합 → 또 만들래요 → 난이도
- 라벨: "난이도 체감" → "난이도", "다시 만들 의향" → "또 만들래요"

### 재료 시드데이터 확장 + Temp 이미지 경로 정리

**Task A — 재료 시드데이터 확장**

- `supabase/migrations/011_expanded_ingredient_seeds.sql` 신규 생성 (41개 재료)
  - Western 18개: cheddar, cream_cheese, milk, bacon, ground_beef, chicken_breast, shrimp, salmon, mushroom, bell_pepper, tomato, broccoli, lettuce, cucumber, garlic_powder, paprika, sour_cream, celery
  - Japanese 7개: tofu_silken, shiitake, enoki, edamame, pickled_ginger, tempura_flour, sushi_vinegar
  - Baking 10개: baking_powder, baking_soda, vanilla_extract, cocoa_powder, brown_sugar, honey, powdered_sugar, yeast, bread_flour, cornstarch
  - Common 6개: vegetable_oil, soy_milk, cinnamon, mayonnaise, ketchup, red_pepper_flakes
- 009 패턴 동일, ON CONFLICT DO NOTHING 멱등성 보장
- 기존 002/009 시드와 ID 충돌 없음 확인

**Task B — Temp Step 이미지 경로 정리**

- `storage.ts` — `relocateTempStepImages()` 함수 추가 (temp→{recipeId}/ 경로 copy→delete) + `extractStoragePath()` 유틸 추가
- `recipe-form.tsx` — StepEditor에 `recipeId` prop 전달 (edit 모드에서 실제 UUID 사용) + handleCreate에 relocation 호출
- `delete-recipe-button.tsx` — DB 삭제 전 step image_url에서 temp 경로 수집 → {recipeId}/ + temp 경로 합쳐서 storage.remove()

**코드리뷰 반영 (9건)**

- W1: `storage.ts` copyError 시 `console.warn` 추가
- W2: `storage.ts` temp 파일 remove 실패 시 `console.warn` 추가
- W3: `recipe-form.tsx` 비트랜잭션 윈도우 주석 추가
- W4: `delete-recipe-button.tsx` race condition 주석 추가 + `let` → `const`
- W5: `delete-recipe-button.tsx` AlertDialogCancel에 `disabled={isDeleting}` 추가
- S1: `011_*.sql` `rice_wine_vinegar` → `sushi_vinegar` ID 변경 (en name과 일치)
- S2: `storage.ts` `extractStoragePath` JSDoc 추가
- S3: `delete-recipe-button.tsx` deleteError를 Header → Footer로 이동
- S4: `vegetable_oil` 카테고리 `sauce_paste` 유지 (기존 패턴 일관성)

**tsc 통과 확인 완료**

---

## 2026-02-23 (일) — 심야

### 요리모드 (Cooking Mode) 구현

작업명세서 `docs/work_order/cooking-mode.md` 기반.

레시피 상세 페이지에서 실제 요리 시 사용하는 스텝별 풀스크린 뷰. 태블릿(가로) 우선 설계, 모바일 세로 대응.

**신규 파일 생성 (3개):**

- `apps/web/src/app/[locale]/recipe/[slug]/cook/page.tsx` — 서버 컴포넌트, 레시피+스텝+재료 조회 후 CookingMode 전달, step_number로 재료 그룹핑
- `apps/web/src/components/recipe/cooking-mode.tsx` — 메인 클라이언트 컴포넌트, 스텝 네비게이션 + 프로그레스 바 + 좌우 분할(md+)/단일 컬럼(모바일) 레이아웃
- `apps/web/src/components/recipe/cooking-timer.tsx` — 다중 타이머 컴포넌트, 시작/일시정지/리셋 + 카운트다운 + 완료 시 시각적 알림

**기존 파일 수정 (3개):**

- `recipe/[slug]/page.tsx` — Steps 섹션 헤더에 "요리 시작" 버튼 추가 (`CookingPot` 아이콘)
- `messages/en.json` — `cookingMode` 네임스페이스 13개 키 + `recipeDetail.startCooking` 추가
- `messages/ko.json` — 동일 한국어 번역 추가

**핵심 기능:**

- 스텝 이전/다음 네비게이션 (큰 터치 타겟 h-12)
- 프로그레스 바 (matdam-gold)
- 스텝별 재료 필터 (step_number 기반)
- 다중 타이머 동시 실행 (스텝 이동 시에도 유지)
- 태블릿 좌우 분할 / 모바일 단일 컬럼 반응형
- 비로그인 사용 가능 (읽기 전용)
- 마지막 스텝에서 "완료" 버튼 → 레시피 상세로 복귀

**tsc 통과 확인 완료**

---

## 2026-02-23 (일) — 밤

### 레시피 소셜 기능 Phase 1~4 구현

작업명세서 `docs/work_order/recipe-social-and-recommendation.md` 기반.

**Phase 1 — DB 마이그레이션 (`010_recipe_social.sql`)**

- `recipe_votes` (추천/비추천) + 카운트 동기화 트리거
- `cook_logs` (만들어봤어요)
- `cook_reviews` (심플 3 + 디테일 6 평가항목)
- `comments` (만들어본 사람만 작성) + `comment_votes`
- `recipes` 테이블에 `taste_profile`, `upvote_count`, `downvote_count` 추가
- 맛 프로필 자동 갱신 트리거 + 코멘트 투표 카운트 트리거
- 모든 테이블 RLS 정책 설정

**Phase 2 — 레시피 추천/비추천**

- `recipe-vote-button.tsx` — 👍/👎 낙관적 UI, UPSERT/DELETE 전환
- 레시피 상세 페이지 Author 행에 투표 버튼 배치

**Phase 3 — 만들어봤어요 + 맛 평가**

- `cook-log-button.tsx` — "만들어봤어요" 버튼, cook_log 생성
- `cook-review-form.tsx` — 2단계 평가 (심플 3개 기본 + 디테일 6개 토글)
- `taste-profile-display.tsx` — 평균 점수 바 차트 시각화
- `recipe-social-client.tsx` — cook_log/리뷰/코멘트 상태 연동 래퍼

**Phase 4 — 코멘트 시스템**

- `comment-section.tsx` — 목록 (추천순 Top 3 고정 + 나머지 최신순, 정렬 전환)
- `comment-form.tsx` — 작성 (cook_log 필수)
- `comment-card.tsx` — 표시 + 추천/비추천 투표 + 삭제

**TypeScript 타입**

- `packages/types/src/social.ts` — RecipeVote, CookLog, CookReview, TasteProfile, Comment, CommentVote

**번역키**

- en.json / ko.json `recipeDetail` 네임스페이스에 40+ 키 추가

**레시피 상세 페이지 통합**

- 서버 사이드에서 투표/cook_log/리뷰 데이터 병렬 조회
- 투표 버튼을 헤더에, 맛 프로필 + 소셜 섹션을 Steps 아래에 배치

**tsc 통과 확인 완료**

**버그 수정 — PostgREST FK 모호성 해소**

- 마이그레이션 010 적용 후 `recipe_votes` 테이블이 `recipes↔users` 간 다중 FK 경로를 생성하여 PostgREST PGRST201 에러 발생
- 홈/탐색/레시피 상세 페이지에서 레시피가 전혀 표시되지 않는 문제 (레시피 상세 404)
- 수정: `users!inner(...)` → `users!recipes_author_id_fkey(...)` 명시적 FK 지정 (7곳)
  - `recipe/[slug]/page.tsx` (3곳), `page.tsx` 홈 (2곳), `explore/page.tsx` (1곳), `comment-section.tsx` (1곳 `users!comments_user_id_fkey`)

✅ DB 마이그레이션 (`010_recipe_social.sql`) Supabase 적용 완료

---

## 2026-02-23 (일) — 저녁

### 온보딩 플로우 확장 — 멀티스텝 사용자 프로필 수집

기존 닉네임만 수집하던 온보딩을 4단계 멀티스텝 폼으로 확장. 사용자 취향 데이터를 수집하여 향후 레시피 추천/필터링에 활용 가능하도록 구현.

**4단계 온보딩 구성:**

1. 닉네임 + 요리 실력 (beginner/intermediate/master)
2. 관심 요리 문화권 (8개 옵션, 다중 선택)
3. 식이 성향 (식이 유형 단일 선택 + 선호 단백질 다중 + 식이 제한 다중)
4. 맛 선호도 스케일 (sweet/salty/spicy/sour/umami 각 1~5 Slider)

**신규 파일 생성 (1개):**

- `apps/web/src/components/ui/slider.tsx` — shadcn/ui Slider 컴포넌트

**기존 파일 수정 (9개):**

- `packages/types/src/user.ts` — UserPreferences 타입 확장 (DietType, ProteinPreference, DietaryRestriction, CuisinePreference, TasteKey, TastePreferences 추가)
- `packages/types/src/index.ts` — 신규 타입 export 추가
- `glossary-constants.ts` — CUISINE_LABEL_KEYS에 chinese, thai, southeast_asian, indian, mexican 추가
- `onboarding-form.tsx` — 4단계 멀티스텝 폼으로 전면 개편 (스텝 인디케이터, 뒤로가기, 건너뛰기, 카드 선택 UI, Slider)
- `onboarding/page.tsx` — 기존 preferences를 OnboardingForm에 전달, max-w-sm → max-w-md
- `settings/page.tsx` — preferences 데이터도 조회하여 SettingsForm에 전달
- `settings-form.tsx` — 온보딩에서 수집한 모든 항목(실력/문화권/식이/맛) 편집 가능하도록 확장
- `messages/en.json` — onboarding 50+키, settings 40+키, glossary 3키 추가
- `messages/ko.json` — 동일 한국어 번역 추가

**데이터 저장:**

- `users.preferences` JSONB 컬럼에 단일 update (DB 마이그레이션 불필요)
- onboarding_complete, skill_level, cuisines, diet_type, protein_preferences, dietary_restrictions, taste_preferences

### 코드리뷰 일괄 수정 (7건)

**BUG 수정 (3건):**

- 닉네임 유효성 에러 메시지 한국어 하드코딩 → i18n `displayNameError` 키 사용 (onboarding-form, settings-form)
- GNB 아바타 fallback `??` → `||` (빈 문자열 처리)
- Profile 아바타 fallback `??` → `||` (동일)

**LEAK 수정 (1건):**

- `recipe-form.tsx` — blob URL unmount 시 `revokeObjectURL` useEffect cleanup 추가

**DRY 리팩터 (1건):**

- 온보딩/설정 공유 상수 파일 추출 (`lib/user/preference-constants.ts`)
  - 옵션 배열 7개, i18n 맵 7개, emoji 맵, SELECTED_STYLE, toggleItem, DEFAULT_TASTES
  - onboarding-form.tsx / settings-form.tsx에서 중복 ~100줄 제거

**STYLE 수정 (2건):**

- 문화권 이모지 8단계 중첩 삼항 → `CUISINE_EMOJI_MAP` Record로 교체
- 스텝 인디케이터 className 중복 `w-8` 외부 추출

**RESOLVED 확인 (1건):**

- `edit/page.tsx`, `profile/page.tsx` — generateMetadata 이미 구현 완료 확인 → 워크로그 체크

---

## 2026-02-23 (일) — 오후

### 런칭 필수 3개 구현: Settings + Privacy/Terms + PostHog

**Phase 1: Settings 페이지**

신규 파일 생성 (2개):

- `apps/web/src/app/[locale]/settings/page.tsx` — 설정 페이지 (Server Component, auth guard, generateMetadata)
- `apps/web/src/app/[locale]/settings/_components/settings-form.tsx` — Display Name 수정 폼 (Client Component, 2~30자 유효성, 성공 시 토스트)

기존 파일 수정 (1개):

- `gnb.tsx` — 모바일 메뉴에 settings 링크 추가

**Phase 2: Privacy Policy + Terms of Service**

신규 파일 생성 (2개):

- `apps/web/src/app/[locale]/privacy/page.tsx` — 개인정보처리방침 (Google OAuth 요건: 수집 정보, 사용 목적, 제3자 제공, 보관/삭제, 연락처)
- `apps/web/src/app/[locale]/terms/page.tsx` — 이용약관 (서비스 설명, 계정, 콘텐츠 저작권, 금지 행위, 면책 조항)

**Phase 3: PostHog 이벤트 캡처**

신규 파일 생성 (1개):

- `apps/web/src/lib/posthog/page-view.tsx` — usePathname/useSearchParams 변경 감지 자동 페이지뷰 추적

기존 파일 수정 (3개):

- `layout.tsx` — `<PostHogPageView />` 추가 (Suspense 래핑)
- `recipe-form.tsx` — `recipe_created` / `recipe_remixed` 이벤트 캡처 (handleCreate 성공 후)
- `onboarding-form.tsx` — `signup_completed` 이벤트 캡처 (온보딩 완료 후)

**번역키 추가:**

- `messages/en.json` + `messages/ko.json` — settings(6개), privacyPolicy(13개), termsOfService(17개) 네임스페이스 추가

---

## 2026-02-23 (일) — 오전

### handleUpdate 비원자적 트랜잭션 수정

레시피 수정 시 steps/ingredients DELETE→INSERT가 3개 별도 쿼리로 실행되어 중간 실패 시 데이터 유실 위험이 있던 문제를 PostgreSQL RPC 함수로 단일 트랜잭션 처리하도록 수정.

**신규 파일 생성 (1개):**

- `supabase/migrations/008_upsert_recipe_details.sql` — `upsert_recipe_details` RPC 함수 (DELETE+INSERT 단일 트랜잭션)

**기존 파일 수정 (1개):**

- `recipe-form.tsx` — `handleUpdate` 내 3개 별도 쿼리(DELETE×2 + insertStepsAndIngredients)를 `supabase.rpc("upsert_recipe_details")` 단일 호출로 교체

---

## 2026-02-22 (토)

### Cuisine Pantry — 문화권별 필수 재료 가이드 기능 추가

**신규 파일 생성 (2개):**

- `supabase/migrations/007_cuisine_pantry.sql` — cuisines(TEXT[]) + importance(TEXT) 컬럼, GIN 인덱스, 기존 30개 재료 한식 시드 업데이트 (must_have 10 / recommended 10 / advanced 10)
- `apps/web/src/app/[locale]/glossary/pantry/[cuisine]/page.tsx` — Pantry 가이드 페이지 (중요도별 3섹션 그룹핑 + 카테고리별 소그룹)

**기존 파일 수정 (5개):**

- `glossary-constants.ts` — CUISINE_LABEL_KEYS, IMPORTANCE_LABEL_KEYS, IMPORTANCE_ORDER 상수 추가
- `glossary/page.tsx` — cuisine 필터 Badge 행 추가, 쿼리 필터 적용, "Guide →" 링크
- `glossary-search.tsx` — cuisine 파라미터 보존 로직 추가
- `messages/en.json` + `messages/ko.json` — glossary 네임스페이스에 cuisine/pantry i18n 키 12개 추가

**코드리뷰 반영 (3건):**

1. RPC `search_ingredients`가 cuisines 미반환 → id 목록 2차 쿼리 필터 방식으로 수정
2. Pantry 페이지 미사용 `IMPORTANCE_ORDER` import 제거
3. Pantry 페이지 불필요한 삼항 연산자 단순화

### GNB 국자 로고 추가

- v2 디자인 기반 국자 로고 아이콘 GNB에 적용
- Material Symbols `soup_kitchen` SVG 아이콘 사용
- matdam-gold 배경 둥근 사각형 + 어두운 아이콘

### Git 커밋 이력

```
e201b9d GNB 로고 SVG를 Material Symbols soup_kitchen 아이콘으로 교체
70fe2f6 문화권별 필수 재료 가이드(Cuisine Pantry) 기능 추가 + GNB 국자 로고
```

---

## 2026-02-20 (목)

### 홈/랜딩 페이지 개선

**신규 파일 생성 (6개):**

- `components/home/hero-section.tsx` — 어두운 그라디언트 히어로 + CTA 버튼 2개
- `components/home/latest-recipes-section.tsx` — 최신 published 레시피 6개, 3열 카드 그리드
- `components/home/recent-remixes-section.tsx` — 최신 리믹스 6개, GitFork + 원본 표시 (없으면 미표시)
- `components/home/chef-of-the-week-section.tsx` — 대기 컴포넌트 (props 기반)
- `components/home/kdrama-cravings-section.tsx` — 대기 컴포넌트 (props 기반)
- `components/home/essential-ingredients-section.tsx` — 대기 컴포넌트 (props 기반)

**기존 파일 수정:**

- `app/[locale]/page.tsx` — Server Component 전환, Supabase 병렬 쿼리, 3개 활성 섹션 배치
- `messages/en.json` + `messages/ko.json` — home 네임스페이스 21개 번역 키 추가

**코드리뷰 반영 (4건):**

1. `remixOf` 번역 보간 깨짐 → 함수 방식 `(title) => t("remixOf", { title })` 으로 변경
2. 난이도 라벨 영어 하드코딩 → `difficultyBeginner/Intermediate/Master` 번역 키 추가
3. Supabase 쿼리 순차 실행 → `Promise.all` 병렬화
4. Path 주석 상대경로 → 절대경로 6개 파일 수정

### Git 커밋 이력

```
f0cdfcc 홈/랜딩 페이지 개선 — 히어로 + 최신 레시피 + 리믹스 3개 활성 섹션 + 대기 컴포넌트 3개
```

### 단위 표시 개선

- 변환 계수 요리용 반올림: fl_oz 29.5735→**30**, oz 28.3495→**28**, lb 453.592→**454**
- 단위 표시 매핑: `l`→`L`, `ml`→`mL`, `fl_oz`→`fl oz`
- 소수점 정리: 1 미만 → 소수점 2자리, 1 이상 → 소수점 1자리
- 재료 카테고리 뱃지(seasoning, sauce_paste 등) 제거
- 미사용 `ConversionMap` 타입 제거

### 검증 완료

- 레시피 수정/삭제 E2E 정상 동작 확인
- 프로필 공개/임시저장 탭 + 드래프트 → edit 이동 확인
- 권한 체크: 타인 레시피에서 수정/삭제 버튼 미노출 확인
- RLS 정책 확인: recipe_steps / recipe_ingredients 모두 SELECT/INSERT/UPDATE/DELETE 정책 존재

### Git 커밋 이력

```
953cacc 단위 표시 개선: 요리용 변환 계수 + 카테고리 뱃지 제거 + 소수점 정리
```

---

## 2026-02-19 (수)

### Step 3 완성: 레시피 수정/삭제 + 프로필 페이지

**새 파일 생성:**

- `apps/web/src/app/[locale]/recipe/[slug]/edit/page.tsx` — 레시피 수정 페이지
  - Server Component, auth guard, 작성자 확인 (author_id !== user.id → 404)
  - recipe + steps + ingredients 조회 → RecipeForm에 initialData로 전달
- `apps/web/src/components/recipe/delete-recipe-button.tsx` — 삭제 버튼 컴포넌트
  - AlertDialog 확인 다이얼로그
  - DB 삭제 먼저 → storage 이미지 후처리 (순서 수정됨)
  - 에러 피드백 UI 추가
- `apps/web/src/app/[locale]/profile/page.tsx` — 프로필/내 레시피 페이지
  - 유저 아바타 + 이름 + 가입일 + 레시피 수
  - 공개/임시저장 탭 (Tabs 컴포넌트)
  - 카드 그리드 + hover 시 수정/삭제 아이콘 오버레이
  - 드래프트 카드 → edit 페이지로 링크 (404 방지)
- `apps/web/src/components/ui/alert-dialog.tsx` — shadcn AlertDialog 설치

**기존 파일 수정:**

- `recipe-form.tsx` — edit 모드 지원
  - `initialData` prop 추가 (RecipeFormInitialData 인터페이스)
  - edit 모드: UPDATE + delete→reinsert 전략
  - title/description JSONB 병합 (기존 로케일 데이터 보존)
  - DELETE 에러 체크 추가
  - `window.location.href`로 캐시 우회 하드 네비게이션
- `recipe/[slug]/page.tsx` — 작성자에게만 수정/삭제 버튼 표시
  - `supabase.auth.getUser()` 병렬 호출로 isAuthor 판단
  - Pencil + DeleteRecipeButton 렌더
- `messages/ko.json` + `messages/en.json` — 번역 키 추가
  - recipe: editTitle, update, updating
  - recipeDetail: edit, delete, deleteConfirm, deleteDescription, deleteCancel, deleting
  - profile: title, publishedTab, draftsTab, noRecipes, memberSince, recipeCount, servings, minutes

### 버그 수정

- 레시피 제목/설명 로케일 폴백: `title[locale] → title["en"] → Object.values(title)[0]`
  - explore, profile, recipe detail, edit 페이지 4곳 + description 3곳 모두 수정

### 코드리뷰 반영 (5건)

1. `handleUpdate` DELETE 에러 체크 + `window.location.href` 캐시 우회
2. `delete-recipe-button` DB 삭제 먼저 → storage 후처리 + 에러 피드백 UI
3. `recipe-form` title/description JSONB 병합 (기존 로케일 보존, 다른 언어 데이터 유실 방지)
4. `profile` 드래프트 카드 → edit 페이지로 이동 (published=false 상세 페이지 404 방지)
5. `delete-recipe-button` 미사용 router import 제거

### 재료 자동완성 UX 개선

- 검색 최소 글자 2 → 1 (trimmed)
- result_limit 8 → 36 (충분히 가져와서 클라이언트 페이지네이션)
- 드롭다운 → 번호 붙은 9개씩 페이지 그리드
- 숫자키 1~9: 해당 번호 재료 선택
- 숫자키 0: 커스텀 직접 추가
- ← → 화살표: 이전/다음 페이지 이동
- 페이지 표시 (1/4) + ChevronLeft/Right 버튼

### 디자인 파일 정리

- 기존 디자인 → `docs/design/v1/` 이동
- V2 브랜드 시안 추가 → `docs/design/v2/`
  - 새 로고 (금색 둥근 사각형 + 그릇 아이콘, BRAND IDENTITY V2.0)
  - 홈 페이지 시안
  - 레시피 상세 시안

### Git 커밋 이력

```
bb01e8c 코드리뷰 5건 수정 + 재료 자동완성 UX 개선
dd66738 레시피 설명(description) 로케일 폴백 수정
ac1045a 레시피 제목 로케일 폴백 수정 — 다른 언어로 저장된 제목도 표시
ca7dfd7 Step 3 완성: 레시피 수정/삭제 + 프로필 페이지 + V2 디자인 시안 추가
```

---

## 완료 항목

- [x] 2026-03-03 — 레시피 입력 언어 자동 감지 (detectLocale) — URL locale 대신 입력 텍스트 기반으로 JSONB 키 결정
- [x] 2026-03-03 — 재료 note/qualifier 영문 번역 누락 47개 수정 + 화유 영문명 수정
- [x] 2026-03-03 — 레시피 설명 31개 보강 + 작성자 matdam 통합 + admin 권한
- [x] 2026-03-03 — 언어 설정 기능 (GNB 드롭다운 + 설정 페이지 + NEXT_LOCALE 쿠키 + DB preferred_locale)
- [x] 2026-02-28 — 유저 등급 시스템 구현 (activity_score + verified_type + 트리거 6개 + 백필 + RankBadge 컴포넌트 + 5개 페이지 통합)
- [x] 2026-02-28 — 새소식 페이지 구현 (/news + 등급 시스템 소개 + 푸터 링크)
- [x] 2026-02-28 — 재료 note/qualifier DB 데이터 잘림 해결 (016 마이그레이션 적용)
- [x] 2026-02-27 — P2 완료: 드래그 앤 드롭 확인 (이미 구현) + DB 복합 인덱스 13개 추가 (019_composite_indexes.sql)
- [x] 2026-02-27 — OWASP ZAP 보안 스캔 수정 (SQL Injection 화이트리스트 + Security Headers + Cookie HttpOnly + X-Powered-By 제거)
- [x] 2026-02-27 — 번역 기능 버그 수정 3건 (forbidden 에러 + ISR 캐시 + 버튼 사라짐)
- [x] 2026-02-27 — note/qualifier 데이터 잘림 해결 (016 마이그레이션 적용)
- [x] 2026-02-26 — 공개 유저 프로필 페이지 + 유저 신고 기능 (프로필 페이지 신규 + 작성자 Link 변경 + 신고 user 타입 + 코드리뷰 4건 수정)
- [x] 2026-02-26 — Recipe Linter 구현 (4가지 규칙 + 제출 차단 + 경고 배너)
- [x] 2026-02-26 — 탐색 페이지 페이지네이션 (URL 기반 page + count 쿼리 + 이전/다음 버튼)
- [x] 2026-02-26 — 번역 기능 코드리뷰 15건 수정 (DB 에러 처리 + content 가드 + 타입 공유 + maxDuration)
- [x] 2026-02-26 — 코드 리뷰 37건 수정 (BUG 9 + SECURITY 4 + PERF 5 + WARN 12 + SUGGESTION 7)
- [x] 2026-02-26 — CI/CD 수정 + Vercel 배포 복구 (pnpm 충돌 + @types/node + 크론 스케줄)
- [x] 2026-02-25 — P1 핵심 기능 5개 (Dietary Filter + Shopping List + 재료→Glossary 링크 + PWA manifest + Wake Lock API)
- [x] 2026-02-24 — 성능 최적화 (loading.tsx 4개, next/image 전환 13곳, ISR, Promise.all 병렬화, DifficultyBadge 서버 컴포넌트화)
- [x] 2026-02-24 — 코드 검토 26건 수정 (Critical 7 + Warn 12 + Suggestion 7)
- [x] 2026-02-24 — 난이도 이모지 + 라벨 개선 (2줄 레이아웃, 필드 순서/라벨 변경)
- [x] 2026-02-24 — 난이도 스케일 역전 (슬라이더→텍스트 버튼, 5=매우 쉬움)
- [x] 2026-02-24 — 소셜 기능 Phase 5 (추천 시스템 + 대댓글)
- [x] 2026-02-24 — 재료 시드데이터 확장 41개 (Western 18 + Japanese 7 + Baking 10 + Common 6) + 코드리뷰 반영
- [x] 2026-02-24 — Temp step 이미지 경로 정리 (relocateTempStepImages + 삭제 시 temp 경로 수집/정리)
- [x] 2026-02-23 — 요리모드 (Cooking Mode) 구현 — 스텝별 풀스크린 뷰 + 다중 타이머 + 반응형 레이아웃
- [x] 2026-02-23 — 레시피 소셜 기능 Phase 1~4 구현 + 마이그레이션 010 적용 + PostgREST FK 모호성 버그 수정
- [x] 2026-02-23 — 코드리뷰 일괄 수정 7건 (BUG 3 + LEAK 1 + DRY 1 + STYLE 2) + generateMetadata 확인
- [x] 2026-02-23 — 온보딩 4단계 멀티스텝 폼 구현 (닉네임+실력 / 문화권 / 식이 성향 / 맛 선호도) + Settings 페이지 확장
- [x] 2026-02-23 — PostHog 이벤트 캡처 3개 (recipe_created, recipe_remixed, signup_completed) + 자동 페이지뷰 추적
- [x] 2026-02-23 — Privacy Policy + Terms of Service 페이지 신규 생성 (한/영 번역)
- [x] 2026-02-23 — Settings 페이지 신규 생성 (Display Name 수정 + GNB 모바일 메뉴 링크 추가)
- [x] 2026-02-23 — `handleUpdate` 비원자적 DELETE→INSERT를 RPC 단일 트랜잭션으로 수정
- [x] 2026-02-23 — `step-editor.tsx` key={index} → key={step.\_id} + crypto.randomUUID() 이미 해결 확인
- [x] 2026-02-22 — Cuisine Pantry 기능 추가 (DB 마이그레이션 + Glossary cuisine 필터 + Pantry 가이드 페이지 + i18n)
- [x] 2026-02-22 — GNB 국자 로고 아이콘 추가 (Material Symbols soup_kitchen)
- [x] 2026-02-20 — 홈/랜딩 페이지 개선 (히어로 + 최신 레시피 + 리믹스 + 대기 컴포넌트 3개) + 코드리뷰 4건 반영
- [x] 2026-02-20 — 단위 표시 개선 (요리용 변환 계수 + L/mL 표기 + 소수점 정리)
- [x] 2026-02-20 — 카테고리 뱃지 제거
- [x] 2026-02-20 — RLS 정책 확인 완료 (recipe_steps + recipe_ingredients)
- [x] 2026-02-20 — Step 3 E2E 검증 완료 (수정/삭제/프로필/권한)
- [x] 2026-02-19 — 재료 자동완성 UX 개선 (숫자키 선택 + 페이지네이션)
- [x] 2026-02-19 — 코드리뷰 5건 반영 (DELETE 에러/삭제순서/JSONB병합/드래프트링크/캐시우회)
- [x] 2026-02-19 — 레시피 제목/설명 로케일 폴백 수정
- [x] 2026-02-19 — Step 3 구현: 레시피 수정 페이지
- [x] 2026-02-19 — Step 3 구현: 레시피 삭제 기능 (AlertDialog)
- [x] 2026-02-19 — Step 3 구현: 프로필/내 레시피 페이지 (공개/임시저장 탭)
- [x] 2026-02-19 — 번역 키 추가 (recipe.edit*, recipeDetail.delete*, profile.\*)
- [x] 2026-02-19 — shadcn AlertDialog 설치
- [x] 2026-02-19 — 디자인 파일 v1/v2 정리 + V2 시안 추가
