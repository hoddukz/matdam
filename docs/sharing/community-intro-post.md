<!-- Tag: docs -->
<!-- Path: docs/sharing/community-intro-post.md -->

# Community Introduction Posts

용도: Reddit, 커뮤니티 등 소개글 템플릿

---

## English — Base Version (Reddit)

---

**Title:** I built a Korean recipe site where you can "remix" recipes like forking code on GitHub

---

Hey everyone — I'm building **MatDam** (맛담).

**One-liner:** It's a Korean recipe site where you can remix (fork) someone's recipe, publish your version, and the original is automatically credited — so you can see how recipes evolve over time.

Here's a quick look: `[SCREENSHOT / 15s GIF]`
Try it out: `[LINK]`

**Why:** I love Korean food, but outside Korea I kept hitting the same wall:

- Good Korean recipes are often Korean-only, and English ones can be shallow
- "Substitute" advice online is usually generic and unverified
- Recipes feel "locked" — you follow them exactly or you're on your own
- Comment sections are full of people who didn't actually cook the dish

**What's different (3 things):**

1. **Remix + credit** — Fork a recipe (e.g., veganize 김치찌개) and publish your version with proper attribution. You can see the full remix chain — how the recipe evolved from the original.

2. **Real substitute notes** — Every ingredient has its own page where people share substitutes they've _actually tried_. When you're in Berlin wondering what to use instead of 고추장, there's real advice from real cooks — not just a blog guessing "try sriracha."

3. **"I made this" feedback only** — You can only leave cooking notes after marking that you actually cooked it. No armchair critics. Just people sharing what worked and what didn't.

Also: virtual fridge (pick what you have → get matching recipes), step-by-step cooking mode with built-in timers, and machine-assisted translation with community edits so recipes cross the language barrier.

It's early and I'm actively building — I'd love feedback:

- **What's the #1 feature that would make you use this?**
- **Which Korean ingredients do you struggle to find (and where are you)?**

Thanks!

---

### r/KoreanFood Variant

제목 동일. 본문에서 아래 부분을 강조:

- "substitute" pain을 더 앞으로 — "Every time I see a recipe calling for 고추장 and I'm nowhere near an H-Mart..."
- "I made this" 피드백 신뢰성 — "Tired of recipe comments from people who clearly never turned on their stove"
- Remix 설명은 짧게 축소
- 마지막 질문을 "What Korean ingredients are hardest to find where you live?" 로 변경 (커뮤니티 참여 유도)

### r/cooking Variant

제목 동일. 본문에서 아래 부분을 강조:

- Remix = recipe evolution — "like seeing a dish travel from Seoul to São Paulo"
- Substitute notes + technique-level feedback
- "I made this" → "verified cook feedback"
- 마지막 질문을 "Have you ever adapted a Korean recipe to local ingredients? How did it go?" 로 변경

### r/sideproject Variant

제목을 약간 변경: "I built a Korean recipe platform with recipe remixing, ingredient substitutes, and 'I made this' comments [Next.js + Supabase]"

본문 말미에 추가:

```
**Tech stack if you're curious:**
Next.js 15 (App Router), React 19, Supabase (Postgres + Auth + Storage),
Tailwind CSS 4, next-intl for i18n, Claude API for translation,
Turborepo monorepo, deployed on Vercel.

Happy to answer any technical questions too!
```

---

## 한국어 — 베이스 버전 (에브리타임, 클리앙, 블로그 등)

---

**제목:** 레시피를 깃허브처럼 포크해서 리믹스하는 한식 플랫폼 만들었습니다

---

안녕하세요, **맛담(MatDam)** 이라는 사이드 프로젝트를 소개드려봅니다.

**한 줄 요약:** 한식 레시피를 리믹스(포크)해서 나만의 버전을 만들고, 원본 출처가 자동으로 표시되는 레시피 플랫폼입니다.

스크린샷: `[이미지]`
링크: `[LINK]`

**만들게 된 이유:**

요리 좋아하는데 항상 이런 게 불편했거든요.

- 레시피 따라 하다가 "나는 이거 빼고 저거 넣었는데 더 맛있었어" — 근데 그걸 공유할 데가 없음
- 해외 사는 친구가 "고추장 없는데 뭘로 대체해?" 물어보면 매번 설명해야 됨. 인터넷 검색해봐도 "스리라차 쓰세요~" 이런 검증 안 된 답만 나옴
- 레시피 댓글에 만들어보지도 않고 "이건 이렇게 해야 됩니다" 하는 사람들...

**뭐가 다르냐면 (핵심 3가지):**

1. **레시피 리믹스 + 출처 표시** — 다른 사람 레시피를 가져와서 내 스타일로 바꿔서 게시. 원본 출처는 자동 표시. "할머니 김치찌개 → 비건 김치찌개 → 치즈 김치찌개" 이런 식으로 레시피가 진화하는 과정 자체가 보여요.

2. **검증된 대체재 정보** — 식재료마다 페이지가 있고, 대체재를 **직접 써본 사람들** 댓글이 달려요. "고추장 대신 스리라차 + 된장 1:1로 섞으면 비슷해요" — 이런 실전 팁이 쌓이는 구조.

3. **만들어본 사람만 댓글** — "만들어봤어요" 버튼 눌러야 레시피에 댓글 달 수 있어요. 직접 해본 사람 후기만 모이니까 댓글 퀄리티가 다릅니다.

그 외에 냉장고 재료로 레시피 추천, 단계별 조리 모드(타이머 내장), 한/영 번역 지원도 있어요.

아직 개발 중이라 부족한 점이 많은데, 피드백이나 "이런 기능 있으면 좋겠다" 같은 의견 주시면 정말 감사하겠습니다!

---

## Posting Checklist

- [ ] 스크린샷 2~3장 준비 (홈 화면, 레시피 상세 + 리믹스 체인, 재료사전 대체재 댓글)
- [ ] 15초 GIF 또는 짧은 데모 영상 (선택)
- [ ] 실제 링크 삽입
- [ ] Reddit은 self-promotion 규칙 확인 후 게시 (서브레딧별 상이)
- [ ] Reddit에서는 본문에 링크 직접 넣기보다 **첫 댓글에 링크** 넣는 게 더 자연스러움
- [ ] 게시 후 댓글에 적극 응답 — 특히 대체재 관련 질문에 빠르게 답변
