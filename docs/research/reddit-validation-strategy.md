<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/research/reddit-validation-strategy.md -->

# Reddit 수요 검증 전략

> 작성일: 2026-02-17
> 목적: MVP 개발 전 "한식 리믹스 레시피 공유 수요"가 실재하는지 Reddit에서 직접 검증

---

## 1. 검증 목표

코드 한 줄 짜기 전에 확인해야 할 핵심 가설 2가지:

| # | 가설 | 아니면? |
|---|------|---------|
| 1 | 외국인이 한식 변형/리믹스에 **관심을 보인다** | "리믹스" 대신 정통 레시피 큐레이션으로 피봇 |
| 2 | 외국인이 본인의 변형 경험을 **직접 공유하고 싶어한다** | 커뮤니티 기능 축소, 쿠킹모드 중심으로 재설계 |

---

## 2. 글 게시 전략

### 2.1 기본 원칙

- 맛담(MatDam) 플랫폼 언급 **절대 금지** — 순수 콘텐츠만
- 개인 계정으로 활동 (새 계정이면 최소 1주일 먼저 댓글 활동으로 karma 쌓기)
- 사진 필수 (위에서 내려다보는 각도, 자연광, 단면 컷)
- 글 끝에 반드시 **열린 질문** 포함 → 댓글 유도

### 2.2 게시 서브레딧

| 서브레딧 | 구독자 | 용도 |
|----------|--------|------|
| r/KoreanFood | ~322K | 한식 관심층 직접 타겟 |
| r/cooking | ~4M | 범용 요리 커뮤니티, 더 넓은 반응 관찰 |
| r/MealPrepSunday | ~3M+ | 계란김밥 = meal prep 각도 가능 |
| r/ketorecipes | ~2M+ | 계란김밥 keto 각도 (1차 글 한정) |

- 같은 글을 동시에 여러 곳에 올리지 말 것 — 크로스포스팅 반감 있음
- 1차: r/KoreanFood + r/cooking (1~2일 간격)
- 2차: r/KoreanFood + r/cooking

---

## 3. 1차 글: 계란김밥 (에그김밥)

### 3.1 검증 목표

> **"한식 변형/리믹스 자체에 대한 관심이 있는가?"**

### 3.2 왜 계란김밥인가

| 기준 | 평가 |
|------|------|
| 조리 난이도 | 낮음 (계란 부치기 + 말기) |
| 호불호 | 거의 없음 |
| 사진빨 | 매우 좋음 (노란 래핑 + 단면 컬러풀) |
| 리믹스 각도 | 글 자체가 리믹스 (밥 → 계란 대체) |
| 서양 트렌드 연결 | keto / low-carb / high-protein 직격 |

### 3.3 레시피 요약

**재료:**
- 계란 3~4개
- 김 (구운 김)
- 속재료: 당근, 시금치(or 아보카도), 햄(or 닭가슴살), 단무지, 오이 등 자유

**조리:**
1. 계란 풀어서 얇게 부치기 (래핑용)
2. 김 위에 계란 래핑 올리기
3. 속재료 나열 후 말기
4. 잘라서 단면 사진 촬영

### 3.4 Reddit 글 예시

**제목:**
> Egg-wrapped kimbap — same fillings, no rice, half the carbs

**본문:**
> I've been making this egg-wrap version of kimbap for a few weeks now. Same idea as regular kimbap but the rice is replaced with a thin egg omelette.
>
> Filling: [사용한 속재료 나열]
>
> It's faster than regular kimbap (no rice cooking), holds together surprisingly well, and honestly tastes just as good.
>
> [사진]
>
> **Has anyone else tried swapping out parts of Korean recipes to fit your diet or what's available in your kitchen?**

### 3.5 성공 기준

| 지표 | 긍정 | 경고 |
|------|------|------|
| Upvotes | 50+ | 10 미만 |
| 댓글 수 | 20+ | 5 미만 |
| "나도 이렇게 바꿨다" 류 댓글 | 5+ | 0 |
| 저장/공유 | 있음 | 없음 |

---

## 4. 2차 글: 김치볶음밥

### 4.1 검증 목표

> **"본인의 변형 경험을 공유하고 싶어하는가?"**

### 4.2 왜 김치볶음밥인가

| 기준 | 평가 |
|------|------|
| 조리 난이도 | 매우 낮음 (5~10분) |
| 호불호 | 거의 없음 (fried rice = 만국 공통) |
| 사진빨 | 좋음 (계란 올리면 끝) |
| 리믹스 대화 유도 | 매우 자연스러움 (누구나 자기만의 버전이 있음) |

### 4.3 레시피 요약

**재료:**
- 찬밥
- 김치 (잘게 썰기)
- 계란
- 참기름
- (선택) 본인만의 추가 재료 1가지 — 이게 포인트

### 4.4 Reddit 글 예시

**제목:**
> My weekly kimchi fried rice — I add cream cheese and it changed everything

**본문:**
> Kimchi fried rice is my go-to weeknight meal. Takes 5 minutes, uses leftover rice and kimchi.
>
> But a few months ago I started adding a tablespoon of cream cheese right at the end, and it completely changed the dish. The tanginess of kimchi + creaminess is incredible.
>
> [사진]
>
> **What's your secret addition to kimchi fried rice? I feel like everyone has their own version.**

### 4.5 성공 기준

| 지표 | 긍정 | 경고 |
|------|------|------|
| Upvotes | 50+ | 10 미만 |
| 댓글 수 | 20+ | 5 미만 |
| "나는 이거 넣어" 류 댓글 | 10+ | 3 미만 |
| 레시피 공유 댓글 | 3+ | 0 |

---

## 5. 타임라인

| 주차 | 활동 | 비고 |
|------|------|------|
| 0주차 | Reddit 계정 활동 시작 (댓글, 답변) | 새 계정이면 필수. 기존 계정이면 스킵 |
| 1주차 | **1차 글 게시** (계란김밥) | r/KoreanFood → 1~2일 후 r/cooking |
| 2주차 | 1차 결과 분석 + 댓글 적극 소통 | 모든 댓글에 답변, 대화 유지 |
| 3주차 | **2차 글 게시** (김치볶음밥) | r/KoreanFood → 1~2일 후 r/cooking |
| 4주차 | 2차 결과 분석 + 최종 판단 | 아래 판단 기준 참고 |

---

## 6. 최종 판단 기준

### GO — MVP 개발 시작

아래 중 **2개 이상** 충족 시:
- [ ] 두 글 모두 upvote 50+ 달성
- [ ] "나도 이렇게 바꿨다" 류 댓글 합산 10개 이상
- [ ] "이런 사이트/앱 있으면 좋겠다" 류 자발적 언급 1건 이상
- [ ] 댓글에서 레시피 변형 과정을 상세히 공유하는 유저 3명 이상

### PIVOT — 방향 재검토

아래 중 **2개 이상** 해당 시:
- [ ] 두 글 모두 upvote 20 미만
- [ ] 댓글에서 변형/리믹스 관련 반응 거의 없음
- [ ] "그냥 정통 레시피가 좋다" 반응이 다수
- [ ] 관심은 있지만 "공유"보다 "소비"에만 관심

### PIVOT 시 대안 방향

| 방향 | 설명 |
|------|------|
| A. 쿠킹모드 중심 | 리믹스 기능 축소, "요리하면서 보기 편한 레시피 뷰어"로 재포지셔닝 |
| B. 재료 가이드 중심 | 대체재 매핑 + Glossary를 핵심으로, 레시피는 부가 기능 |
| C. 큐레이션 중심 | 커뮤니티 포기, 엄선된 정통 한식 레시피 사이트로 운영 |

---

## 7. 참고: 추가 글 후보 (3차 이후)

검증이 긍정적이어서 추가 글이 필요한 경우:

| 메뉴 | 각도 | 난이도 |
|------|------|--------|
| 불고기 타코 | 한식 × 멕시칸 퓨전 | 중 |
| 된장찌개 (비건 버전) | 멸치육수 → 채수 대체 | 중 |
| 라볶이 | 떡볶이 + 라면 매시업 | 하 |
