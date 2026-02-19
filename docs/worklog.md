<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/worklog.md -->

# 맛담 워크로그

---

## 긴급 오류/수정사항

- [ ] 레시피 수정 시 재료 추가 후 저장 — 실제 반영 여부 재확인 필요 (DELETE→INSERT 에러 체크 + 캐시 우회 적용했으나 실서비스 테스트 필요)
- [ ] recipe_steps / recipe_ingredients 테이블 RLS 정책에 DELETE/INSERT 권한이 작성자에게 열려있는지 Supabase 대시보드에서 확인

---

## 오류/수정사항/해야할 작업

### 확인 필요 항목

- [ ] 레시피 수정 기능 E2E 테스트: 기존 레시피 → 재료 추가/삭제 → 저장 → 상세 페이지에서 반영 확인
- [ ] 레시피 삭제 기능 테스트: 삭제 → 프로필 이동 → 목록에서 사라짐 확인
- [ ] 프로필 페이지: 공개/임시저장 탭 전환 + 드래프트 카드 클릭 시 edit 페이지로 이동하는지 확인
- [ ] 권한 체크: 타인 레시피 상세에서 수정/삭제 버튼 안 보이는지, `/recipe/[slug]/edit` 직접 접근 시 404 확인
- [ ] 재료 자동완성 숫자키(1~9)/화살표(←→) 페이지 이동이 실제 동작하는지 확인

### 코드리뷰 잔여 Suggestion 항목 (나중에)

- [ ] `edit/page.tsx`, `profile/page.tsx`에서 `<title>` → `generateMetadata` 패턴 통일
- [ ] `step-editor.tsx` — `key={index}` → stable ID로 변경 (step 삭제 시 React reconciliation 이슈)
- [ ] temp step 이미지 (`temp-{timestamp}/`) — 레시피 생성 후 실제 recipeId 경로로 이동 또는 정리 로직 추가
- [ ] `handleUpdate` — DELETE→INSERT 비원자적 작업에 대한 롤백/복구 전략 (현재는 에러만 표시)

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

- [x] 2026-02-19 — 재료 자동완성 UX 개선 (숫자키 선택 + 페이지네이션)
- [x] 2026-02-19 — 코드리뷰 5건 반영 (DELETE 에러/삭제순서/JSONB병합/드래프트링크/캐시우회)
- [x] 2026-02-19 — 레시피 제목/설명 로케일 폴백 수정
- [x] 2026-02-19 — Step 3 구현: 레시피 수정 페이지
- [x] 2026-02-19 — Step 3 구현: 레시피 삭제 기능 (AlertDialog)
- [x] 2026-02-19 — Step 3 구현: 프로필/내 레시피 페이지 (공개/임시저장 탭)
- [x] 2026-02-19 — 번역 키 추가 (recipe.edit*, recipeDetail.delete*, profile.\*)
- [x] 2026-02-19 — shadcn AlertDialog 설치
- [x] 2026-02-19 — 디자인 파일 v1/v2 정리 + V2 시안 추가
