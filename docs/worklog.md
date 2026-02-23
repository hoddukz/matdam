<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/worklog.md -->

# 맛담 워크로그

---

## 긴급 오류/수정사항

(없음)

---

## 오류/수정사항/해야할 작업

### 확인 필요 항목

- [x] Supabase에 마이그레이션 007 + 008 적용 완료
- [x] Pantry 페이지 실제 동작 확인 (`/glossary/pantry/korean`) — 정상
- [ ] Glossary cuisine 필터 동작 확인 (`/glossary?cuisine=korean`)

### 코드리뷰 잔여 Suggestion 항목 (나중에)

- [x] `edit/page.tsx`, `profile/page.tsx`에서 `<title>` → `generateMetadata` 패턴 통일 — 이미 구현 확인 완료
- [ ] temp step 이미지 (`temp-{timestamp}/`) — 레시피 생성 후 실제 recipeId 경로로 이동 또는 정리 로직 추가

### 장기 로드맵 — 셰프 채널 + 커뮤니티

유튜브 채널 모델 참고: 각 셰프/고티어 유저가 자기만의 공간을 갖는 구조

- [ ] **셰프 채널 (개인 페이지)** — 내 레시피 관리(기존) + 추천 식재료 큐레이션 + 추천 구매처 링크 + 팔로우/팔로워
- [ ] **권한 티어 시스템** — 일반(레시피+리믹스) / 고티어(재료 데이터 편집+큐레이션) / 셰프(인증 배지+전용 채널)
- [ ] **커뮤니티 기능** — 레시피 댓글/리뷰, 셰프에게 질문, 리믹스 체인 활용
- [ ] **재료 데이터 웹 편집** — 고티어/셰프가 웹에서 직접 식재료 정보(cuisines, importance 등) 편집

### 홈 페이지 코드리뷰 잔여 항목 (나중에)

- [ ] `page.tsx` — Supabase `users` 조인 배열 반환 `as unknown as` 이중 캐스트 → 공유 타입 정의로 개선
- [ ] `explore` 페이지에 리믹스 전용 필터 추가 후, 리믹스 섹션 "View all" 링크를 필터 적용된 URL로 변경
- [ ] 대기 컴포넌트 활성화 시: `chef-of-the-week-section.tsx` — "View Profile" 링크를 해당 셰프 프로필로 연결
- [ ] 대기 컴포넌트 활성화 시: `essential-ingredients-section.tsx` — glossary 페이지 구현 후 링크 연결
- [ ] 대기 컴포넌트 활성화 시: `kdrama-cravings-section.tsx` — KDramaItem type에 `id` 필드 추가 (React key 안정성)

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
