<!-- Tag: docs -->
<!-- Path: /Users/hodduk/Documents/git/mat_dam/docs/design/stitch-prompts/04-cooking-mode-tablet.md -->

# Stitch Prompt: Cooking Mode — Tablet Layout

> 소스: screen-flow.md §4.5 + implementation-plan.md Step 8 + master-plan §6.1
> 참고: 데스크톱 쿠킹 모드는 이미 생성됨 (stitch-output/cooking-mode). 이 프롬프트는 태블릿(가로) 전용.

---

## 페이지 정보

- **URL:** `/recipes/[slug]/cook`
- **용도:** 실제 요리할 때 사용하는 화면. 풀스크린, 스텝별 카드.
- **접근:** 비로그인도 사용 가능
- **특징:** 다크 테마 (주방 환경에서 눈부심 방지)

---

## 브랜드 가이드 (쿠킹 모드 전용 — 다크 테마)

| 항목        | 값                              |
| ----------- | ------------------------------- |
| 배경색      | `#1A1A1A` (다크)                |
| 텍스트      | `#F5F0E8` (밝은 베이지)         |
| 포인트      | `#D4A035` (골드 — 타이머, 버튼) |
| 보조 텍스트 | `#9A8E7A`                       |
| 카드 배경   | `#2C2417`                       |
| 보더        | `#3D3528`                       |

---

## 태블릿 레이아웃 (가로 모드, 768~1024px)

PPT 발표자 보기 스타일 — 좌: 현재 스텝 / 우: 재료+타이머

```
┌──────────────────────────┬─────────────────────┐
│ [✕]  Step 3 of 7  ██████░░                     │
├──────────────────────────┼─────────────────────┤
│                          │                     │
│  [스텝 사진]              │ INGREDIENTS NEEDED  │
│  (넓게, 좌측 영역 전체)    │                     │
│                          │ • 200g Pork belly   │
│──────────────────────────│ • 1 cup Aged Kimchi │
│                          │ • 1 tbsp Sesame Oil │
│  STEP 3                  │ • 2 tbsp Gochugaru  │
│  Add pork & kimchi       │                     │
│                          │─────────────────────│
│  Add the sliced pork     │                     │
│  and kimchi into the     │ 💡 TIP              │
│  pot. Sauté over         │ Rendering the fat   │
│  medium-high heat until  │ from the pork belly │
│  the pork is no longer   │ adds a rich flavor  │
│  pink and the kimchi     │ base for the stew.  │
│  softens.                │                     │
│                          │─────────────────────│
│  [⏱ Start 5m Timer]      │                     │
│                          │ ACTIVE TIMERS       │
│                          │ Step 1  ⏱ 2:34     │
│                          │ Step 3  ⏱ 5:00 ▶   │
│                          │                     │
├──────────────────────────┴─────────────────────┤
│ [← Previous]    [View Full Recipe]   [Next →]  │
└────────────────────────────────────────────────┘
```

### 좌측 영역 (약 60~65%)

- 현재 스텝 사진 (있는 경우)
- 스텝 번호 + 제목
- 조리법 텍스트
- 타이머 시작 버튼 (타이머가 설정된 스텝만)

### 우측 영역 (약 35~40%)

- **INGREDIENTS NEEDED** — 이 스텝에서 사용하는 재료만 표시 (전체 재료 아님)
- **TIP** — 해당 스텝 관련 팁 (있는 경우)
- **ACTIVE TIMERS** — 현재 실행 중인 모든 타이머 목록 (다른 스텝 타이머 포함)

### 상단 바

- [✕] 닫기 버튼 (레시피 상세로 돌아감)
- "Step 3 of 7" 현재 위치
- 프로그레스 바 (골드 색상)
- 레시피 제목 (우측 끝)

### 하단 네비게이션

- [← Previous] — 이전 스텝
- [View Full Recipe] — 전체 레시피 보기 (쿠킹 모드 나가지 않고)
- [Next Step →] — 다음 스텝 (골드 강조, 가장 큰 버튼)
- 버튼이 크게 — 손이 젖어도 누를 수 있게

---

## 예시 데이터

레시피: Classic Kimchi Jjigae (김치찌개), 7 steps

- Step 3: Add pork & kimchi
- 사진: 냄비에 돼지고기와 김치가 볶아지는 장면
- 재료: Pork belly 200g, Aged Kimchi 1 cup, Sesame Oil 1 tbsp
- 타이머: 5분
- 이전 스텝(Step 1) 타이머가 아직 실행 중 (2:34 남음)

---

## 핵심 포인트

1. **좌우 분할이 핵심** — 좌: 현재 스텝 집중 / 우: 참조 정보 (재료, 타이머)
2. **재료는 현재 스텝 것만** — 전체 재료가 아니라 이 스텝에서 필요한 것만 하이라이트
3. **타이머는 플로팅** — 카드 넘겨도 이전 타이머가 우측에 계속 표시
4. **큰 터치 타겟** — 손 젖었을 때 대응. 버튼 최소 48px
5. **다크 테마** — 주방 환경, 눈부심 방지
