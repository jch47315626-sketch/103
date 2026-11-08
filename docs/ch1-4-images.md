# 제1화~제4화 그림 목록

> `npm run img`로 다시 만든다 (손으로 고치지 않는다). ✅ = `public/img/`에 들어 있음.
> 프롬프트 원본은 `docs/chatgpt-prompts.md`, 게임의 그림 자리는 `src/game/imageSlots.json`.

| 묶음 | 들어 있음 | 크기 |
| --- | --- | --- |
| 1. 이야기 배경 | 0 / 21 | 1536x1024 가로 → 가운데 띠를 잘라 쓴다 |
| 2. 싸움 배경 (1인칭) | 0 / 4 | 1536x1024 가로 |
| 3. 싸움 상대 (투명 배경) | 0 / 7 | 1024x1536 세로, 투명 배경 |
| 4. 이벤트 그림 | 0 / 22 | 1536x1024 가로 |
| 5. 대화용 서 있는 그림 (투명 배경) | 0 / 10 | 1024x1536 세로, 투명 배경 |
| 6. 태리의 주먹 (1인칭, 투명 배경) | 0 / 4 | 1024x1024, 투명 배경 |
| 7. 아이템 아이콘 (투명 배경) | 0 / 4 | 1024x1024, 투명 배경 |
| 8. 타이틀 | 0 / 2 | 1536x1024 가로 |
| **합계** | **0 / 74** | |

## 쓰는 법

1. ChatGPT에서 새 대화를 열고 아래 **대화 시작용 문장**을 먼저 보낸다. 같은 대화에서 계속 뽑아야 화풍이 이어진다.
2. 인물이 나오는 그림(싸움 상대, 서 있는 그림, 이벤트 그림)은 만들어 둔 **캐릭터 시트를 같이 올리고** “첨부한 인물과 같은 사람으로”를 앞에 붙인다.
3. 투명 배경이 필요한 것(싸움 상대·서 있는 그림·주먹·아이콘)은 “transparent background PNG”로 요청한다. 배경이 남으면 지운 뒤 넣는다.
4. 받은 그림을 **제목의 영문 이름 그대로** `public/img/`에 넣는다 (png·jpg·webp). 게임은 다시 빌드하면 바로 그 그림을 쓴다.
5. 위에서부터 순서대로 뽑으면 된다. 1·2번만 있어도 게임 화면이 거의 다 바뀐다.

**대화 시작용 문장**

```
I am making illustrations for a story-driven game based on my own novel, a quiet survival drama set in a Korean apartment complex during a mysterious illness outbreak. Please keep a consistent style across every image in this conversation. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 1. 이야기 배경 — 없으면 장면이 도형 그림으로 나온다

크기: 1536x1024 가로 → 가운데 띠를 잘라 쓴다 · 0/21장 들어 있음

### ⬜ `bg_complex_dawn` — 1화 첫 장면, 새벽 해무

```
A Korean high-rise apartment complex at dawn before sunrise, dense sea fog rolling low between the towers, a few warm windows lit, distant red emergency light glow at the main gate, dark sea on the horizon. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1502_bath` — 1화 안대를 묶는 거울

```
A small apartment bathroom, fogged mirror with one palm-wiped clear streak, a black leather eyepatch and a red ribbon on the sink. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1502_door` — 1화 열지 못한 문 · 2·3화 현관

```
Inside view of a Korean apartment front door: heavy grey steel door, digital lock with lever handle, small peephole, shoe rack, a pink backpack by the door. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_peephole_1` — 1화 외시경 너머 도윤

```
Fisheye peephole view of an apartment hallway in a circular frame, black outside the circle, a man in a stained white shirt standing very close to the door with his head lowered. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_peephole_2` — 1화 외시경 너머 1501호 남자

```
Fisheye peephole view of an apartment hallway in a circular frame, black outside the circle, a man in a suit crouched near the elevator, a staff ID card with a broken blue lanyard on the floor. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_hall15` — 1·2·3화 15층 복도

```
A 15th floor apartment hallway: elevator, three steel unit doors, a fire door with a small wire-glass window, a fire hose cabinet, flickering fluorescent light, a dark stain near the elevator. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_stair_down` — 2화 난간 틈으로 본 나선 계단

```
Top-down view through the gap of a tall spiral stairwell, floors descending into darkness, many pale hands gripping the railings far below. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_stair_landing` — 3화 계단참

```
A narrow apartment emergency stairwell landing, concrete steps, metal handrail, green emergency light, deep shadows. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1502_kitchen` — 2화 생수 여섯 병

```
A small kitchen with the refrigerator open and glowing, nearly empty shelves: six water bottles, one shriveled lemon, two snack packets, a salt tub. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1502_living_night` — 2화 불 끈 밤

```
The same bare living room at night with lights off, city glow through the balcony windows, a half-empty water bottle on the floor. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_firedoor` — 2·3화 철망 유리창 너머 세훈

```
Close view of a steel fire door with a small wire-mesh glass window, a grey necktie tied tight between the door handle and the fire hose cabinet handle, blue pre-dawn light, a faint masked silhouette behind the glass. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1208` — 3화 세훈의 1208호

```
A sparse tidy dining room, medical textbooks on the table, an unfinished seascape jigsaw puzzle with the horizon section missing, two cup noodles steaming, an open first aid kit. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1502_balcony` — 3화 베란다 칸막이

```
An apartment balcony, laundry rack pushed aside revealing a thin gypsum partition wall to the next unit, grey morning. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1503_balcony` — 4화 숲 같은 베란다

```
A broken gypsum wall with a hole, through it a balcony full of potted green plants like a small forest, soft daylight, dust in the air. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1503_living` — 4화 1503호 살펴보기 (왼쪽부터 화분 · 코르크 보드 · 냉장고 · 찬장 · 서재 문)

```
A warm lived-in apartment living room, left to right: seven monstera pots with white name stakes, a watering can and a cat food bag; a cork board with photos and sticky notes; a refrigerator; a kitchen cupboard; a doorway to a small study. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1503_study` — 4화 서재 책상의 편지

```
A small study, a bookshelf of worn exam books, a desk with a white envelope and a small name tag, desk lamp, afternoon light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1503_closet` — 4화 트레이닝복 옷장

```
An open wardrobe, a black tracksuit in a plastic cover at the very back, a school uniform being sealed in a plastic bag. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1503_dining` — 4화 장조림 식탁

```
A small dining table, two bowls of rice, one container of soy-braised beef with five quail eggs, chopsticks, dim warm light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_floor11` — 5화 11층 복도 — 원판으로 괸 방화문, 호룡

```
An apartment stairwell entrance on the 11th floor, the fire door wide open, a gym bag on the floor, fluorescent light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1114` — 5화 1114호 홈짐, 1113호 할머니

```
A messy apartment turned into a home gym: barbell rack, dumbbells, protein tubs, trophies, a punching bag hanging from the ceiling. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `bg_1114` — 5화 새벽 세 시 1114호 (어둡게 덮는다)

```
A messy apartment turned into a home gym: barbell rack, dumbbells, protein tubs, trophies, a punching bag hanging from the ceiling. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 2. 싸움 배경 (1인칭) — 왼쪽 ⅓은 어둡게

크기: 1536x1024 가로 · 0/4장 들어 있음

### ⬜ `fight_hall` — 1화 1501호 남자

```
An apartment hallway toward the elevator, steel doors on both sides, fluorescent light. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `fight_stairs` — 2화 계단참 · 14층 · 3화 도윤

```
A stairwell landing looking down the steps, metal railing on the right, concrete wall on the left, green emergency light. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `fight_room` — 2화 새벽 네 시 섀도복싱

```
An empty dark living room at 4 am, furniture pushed to the walls, faint blue window light. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `fight_wall` — 3화 베란다 칸막이

```
Facing a thin gypsum balcony partition wall up close, a laundry rack beside it. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 3. 싸움 상대 (투명 배경)

크기: 1024x1536 세로, 투명 배경 · 0/7장 들어 있음

### ⬜ `enemy_suit1501` — 1화 1501호 남자

```
A person afflicted by a mysterious illness: a Korean office worker in a grey suit and grey tie, hunched and reaching forward, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `enemy_suit_stairs` — 2화 계단참 정장 남자

```
A person afflicted by a mysterious illness: a man in a navy suit with his tie twisted to his back, crouched low, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `enemy_apron` — 2화 14층 앞치마 여자

```
A person afflicted by a mysterious illness: a middle-aged Korean woman in a kitchen apron with one yellow rubber glove, arms reaching forward, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `enemy_doyun` — 3화 12층 계단참의 도윤

```
A person afflicted by a mysterious illness: a gentle-faced Korean man in his early 30s in a white dress shirt with a broken blue lanyard, face still recognizably kind, tragic rather than frightening, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `enemy_resident` — 연습 전투: 일반

```
A person afflicted by a mysterious illness: a Korean apartment resident in pajamas and a cardigan, arms raised, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `enemy_crawler` — 연습 전투: 기어 오는

```
A person afflicted by a mysterious illness: a person low on all fours moving toward the viewer, long messy hair, torn clothes, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `enemy_horyong` — 연습 전투: 호룡

```
A person afflicted by a mysterious illness: a massive Korean bodybuilder in a torn tank top, gym towel around the neck, one eye scarred shut, imposing bulk, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 4. 이벤트 그림 — 결정적 장면에 화면 가득 뜬다

크기: 1536x1024 가로 · 0/22장 들어 있음

### ⬜ `cg_dawn_run` — 1화 새벽 달리기

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, in a black training outfit, jogging alone on a foggy apartment path at dawn, breath visible. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_eyepatch` — 1화 안대를 묶는 아침

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), tying the strap of her eyepatch in front of a fogged bathroom mirror, seen in the mirror reflection. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_flash_belt` — 1화 회상: 챔피언 벨트

```
A 23-year-old Korean woman boxer raising a championship belt in a ring under spotlights, both eyes uncovered, her coach father in the corner not smiling. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_door_handle` — 1화 열지 못한 문

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), her hand frozen on the lever handle of a steel front door, forehead against the door, eyes shut with tears. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_id_card` — 1화 사원증

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), kneeling in an apartment hallway, holding a staff ID card with a broken blue lanyard in both hands, head bowed. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_taping` — 1화 붕대 감기

```
Close-up of a woman’s hands wrapping white athletic tape around her knuckles, navy uniform sleeve, determined. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_wall_shoulder` — 1화 끝, 왼쪽은 벽에

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), both hands wrapped in white athletic tape, left shoulder pressed against a hallway wall, facing a steel fire door, ready. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_necktie` — 2화 넥타이 매듭

```
Close-up of hands tying a grey necktie in a tight sailor’s knot between a fire door handle and a fire hose cabinet handle. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_flash_harbor` — 2화 회상: 부두의 매듭

```
A 13-year-old Korean girl learning to tie a rope knot from her smiling father on a sunny harbor pier, warm sepia. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_six_bottles` — 2화 생수 여섯 병

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), standing before an open, nearly empty refrigerator glowing in a dark kitchen, six water bottles inside. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_flash_rider` — 2화 회상: 맛있게 드세요, 챔피언

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, at her apartment door receiving a food delivery from a grinning yellow-haired rider, warm evening light. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_shadowbox` — 2화 새벽 네 시

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, in a T-shirt, shadowboxing alone in a dark empty living room at 4 am, blue window light, motion lines. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_firedoor_face` — 2화 철망 유리창 너머

```
View from inside a hallway: a masked man’s eyes visible through the small wire-glass window of a fire door, blue pre-dawn light. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_stairs_back` — 3화 계단참의 그 사람

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), seen from behind at the top of a stairwell, looking down at a man in a white shirt standing on the landing below, looking up. Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants behind her. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_clinch` — 3화 클린치 직후

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), holding a man in a white shirt in a boxing clinch on a stairwell landing, her face hidden against his shoulder, grief. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_cup_noodle` — 3화 컵라면

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), both hands wrapped in white athletic tape, eating cup noodles at a table with teary eyes, Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants across the table rolling a puzzle piece. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_wall_punch` — 3화 끝, 베란다 칸막이

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), throwing a straight punch into a thin balcony partition wall, white dust bursting. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_forest_balcony` — 4화 숲 같은 베란다

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), stepping through a broken wall into a balcony full of green plants, sunlight, awe. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_letter` — 4화 편지

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), sitting at a small study desk holding a handwritten letter with her fingertips, a small name tag on the desk, quiet afternoon light. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_track_zip` — 4화 트레이닝복

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, zipping up the jacket in front of an open wardrobe, staff ID card and name tag in her chest pocket. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_dinner` — 4화 장조림

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit and Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants with his mask down, eating rice and soy-braised beef together at a small table, quiet warmth. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `cg_horyong_call` — 4화 아래층의 목소리

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, pulling the end of her hand tape tight with her teeth, standing at a stairwell railing looking down, determined. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 5. 대화용 서 있는 그림 (투명 배경)

크기: 1024x1536 세로, 투명 배경 · 0/10장 들어 있음

### ⬜ `pt_taeri_uni_neutral` — 1~3화 태리 (교복)

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), neutral calm expression. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_taeri_uni_sad` — 1화 미안해, 3화 오빠

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), eyes lowered, holding back tears. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_taeri_track_neutral` — 4화 태리 (트레이닝복)

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, neutral calm expression. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_taeri_track_determined` — 4화 끝, 빼 와야죠

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, steady determined look. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_sehun_neutral` — 2~4화 세훈

```
Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants, mask on, neutral clinical look. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_sehun_serious` — 3화 감정으로 판단하면

```
Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants, mask on, stern serious look. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_sehun_soft` — 4화 맛있네요

```
Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants, mask on, eyes softened. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_doyun_smile` — 1화 회상: 서류는 같이 보자

```
Han Doyun, a gentle Korean man in his early 30s, eyes that curve into half-moons when he smiles, white dress shirt, blue lanyard, warm half-moon smile, soft warm light. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_dad_stern` — 2화 아빠의 목소리

```
Taeri's father, a Korean boxing coach in his late 50s, weathered stern face, grey crew cut, faded windbreaker, stern look, arms crossed, muted sepia tint. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `pt_horyong_shout` — 4화 아래층의 호룡

```
Ma Horyong, a loud Korean gym owner in his 40s, huge muscular build, buzz cut, sleeveless tank top, gym towel around the neck, shouting with fists raised. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 6. 태리의 주먹 (1인칭, 투명 배경)

크기: 1024x1024, 투명 배경 · 0/4장 들어 있음

### ⬜ `hud_fist_left` — 싸움 화면 왼 주먹 (교복)

```
A woman's left fist and forearm rising from the bottom left corner in a boxing guard, wrapped in white athletic tape, navy uniform sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `hud_fist_right` — 싸움 화면 오른 주먹 (교복)

```
A woman's right fist and forearm rising from the bottom right corner in a boxing guard, wrapped in white athletic tape, navy uniform sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `hud_fist_left_track` — 연습 전투 왼 주먹 (트레이닝복)

```
A woman's left fist and forearm rising from the bottom left corner in a boxing guard, wrapped in white athletic tape, black tracksuit sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `hud_fist_right_track` — 연습 전투 오른 주먹 (트레이닝복)

```
A woman's right fist and forearm rising from the bottom right corner in a boxing guard, wrapped in white athletic tape, black tracksuit sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 7. 아이템 아이콘 (투명 배경)

크기: 1024x1024, 투명 배경 · 0/4장 들어 있음

### ⬜ `item_idcard` — 도윤의 사원증

```
A staff ID card with a small photo of a shy smiling man, broken blue lanyard, a dark smudge on one corner. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `item_ramen` — 1503호의 식량

```
A bundle of five instant ramen packets with plain red wrappers. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `item_nametag` — 명찰 1-3 강태리

```
A small rectangular school name tag pin with a blank white plate and navy border. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `item_letter` — 도윤의 편지

```
An opened white envelope with a handwritten letter folded half out, illegible neat handwriting. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 8. 타이틀

크기: 1536x1024 가로 · 0/2장 들어 있음

### ⬜ `title_key_ch1` — 처음 화면 (왼쪽 ⅓은 제목 자리)

```
Wide 16:9 key art. Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), both hands wrapped in white athletic tape, standing in a dark apartment stairwell seen from slightly below, green emergency light from above, pale reaching hands far below. Composition weighted to the right, empty dark space on the left third. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### ⬜ `chapter_card_bg` — 화 제목 카드 배경

```
Wide 16:9 image. A dark concrete wall texture with a faint green emergency light glow from below, empty center for a chapter title. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```
