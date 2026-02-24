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
- [x] Glossary cuisine 필터 동작 확인 (`/glossary?cuisine=korean`) — 정상
- [x] Supabase에 마이그레이션 010 적용 (`010_recipe_social.sql`)
- [x] 레시피 상세 페이지 소셜 기능 동작 확인 (투표/만들어봤어요/리뷰 DB 저장 확인 완료, 코멘트 UI 확인 완료)
- [x] Supabase에 마이그레이션 011 적용 (`011_expanded_ingredient_seeds.sql`) + 검색에서 새 재료 노출 확인

### 평가 스케일 방향 — 결정 완료 (2026-02-24)

- [x] "난이도 체감" 스케일 역전 완료: 매우 어려움=1, 어려움=2, 보통=3, 쉬움=4, 매우 쉬움=5. 슬라이더→텍스트 버튼 그룹으로 UI 변경. 높을수록 긍정(쉬움)으로 다른 항목(맛/재도전)과 방향 통일 → 3개 평균 = 종합 레시피 점수로 활용 가능

### 추천 시스템 개선 제안

- [ ] **사용자 리뷰 기반 추천 강화** — 현재 추천은 온보딩/설정에서 입력한 `taste_preferences`만 사용. 사용자가 실제로 높은 점수를 매긴 레시피들의 taste_profile 평균을 구해서 매칭하면 더 정확한 개인화 추천 가능. 예: 사용자가 taste_overall 4~5점 준 레시피들의 taste_sweet/salty/spicy/sour 평균 → 이 값을 preferences 대신 (또는 가중 합산) 추천 기준으로 사용

### 시드데이터/i18n 확장

- [x] 재료 시드데이터 확장 — `011_expanded_ingredient_seeds.sql`로 41개 재료 추가 완료 (Western 18 + Japanese 7 + Baking 10 + Common 6)

### 코드리뷰 잔여 Suggestion 항목 (나중에)

- [x] `edit/page.tsx`, `profile/page.tsx`에서 `<title>` → `generateMetadata` 패턴 통일 — 이미 구현 확인 완료
- [x] temp step 이미지 — `relocateTempStepImages` 구현 완료 (생성 시 자동 relocation + 삭제 시 temp 경로 포함 정리)

### 장기 로드맵 — 셰프 채널 + 커뮤니티

유튜브 채널 모델 참고: 각 셰프/고티어 유저가 자기만의 공간을 갖는 구조

- [ ] **셰프 채널 (개인 페이지)** — 내 레시피 관리(기존) + 추천 식재료 큐레이션 + 추천 구매처 링크 + 팔로우/팔로워
- [ ] **권한 티어 시스템** — 일반(레시피+리믹스) / 고티어(재료 데이터 편집+큐레이션) / 셰프(인증 배지+전용 채널)
- [ ] **커뮤니티 기능** — 셰프에게 질문, 리믹스 체인 활용 (댓글/리뷰는 소셜 기능 Phase 1~4에서 구현 완료)
- [ ] **재료 데이터 웹 편집** — 고티어/셰프가 웹에서 직접 식재료 정보(cuisines, importance 등) 편집

### 홈 페이지 코드리뷰 잔여 항목 (나중에)

- [ ] `page.tsx` — Supabase `users` 조인 배열 반환 `as unknown as` 이중 캐스트 → 공유 타입 정의로 개선
- [ ] `explore` 페이지에 리믹스 전용 필터 추가 후, 리믹스 섹션 "View all" 링크를 필터 적용된 URL로 변경
- [ ] 대기 컴포넌트 활성화 시: `chef-of-the-week-section.tsx` — "View Profile" 링크를 해당 셰프 프로필로 연결
- [ ] 대기 컴포넌트 활성화 시: `essential-ingredients-section.tsx` — glossary 페이지 구현 후 링크 연결
- [ ] 대기 컴포넌트 활성화 시: `kdrama-cravings-section.tsx` — KDramaItem type에 `id` 필드 추가 (React key 안정성)

---

## 2026-02-24 (월)

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
