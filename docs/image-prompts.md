# 103동 — 이미지 생성 프롬프트

지금 도형으로 그리고 있는 그림(`src/story/backgrounds.ts`, `src/game/art.ts`)을 웹툰 그림으로 바꾸기 위한 프롬프트 모음.
프롬프트는 이미지 모델이 가장 잘 알아듣는 **영어**로 쓰고, 위에 한국어로 무엇을 그리는지 적었다.
각 항목의 `파일명`은 코드에서 바꿔 끼울 때 쓸 이름이다(`Bg` 키, 적 `look` 키와 같다).

> **배경만 붙여넣기용으로**: `docs/background-prompts.md`
>
> **ComfyUI로 한꺼번에 뽑기**: `tools/comfy/` 참고. 같은 프롬프트가 `tools/comfy/prompts.json`에 들어 있다(프롬프트를 고칠 땐 두 곳 다).

---

## 0. 공통 스타일 (모든 프롬프트 앞에 붙인다)

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading,
cold desaturated palette (concrete grey, night navy, sickly green emergency light),
small accents of warm orange and blood red, cinematic lighting, quiet dread,
Korean apartment complex survival drama, no text, no watermark, no logo
```

**네거티브(지원되는 모델만)**
```
text, letters, watermark, signature, logo, extra fingers, deformed hands, cartoonish chibi,
bright saturated colors, gore close-up, exposed organs, anime moe style, two eyepatches
```

**크기 규칙**

| 용도 | 비율 | 권장 해상도 | 비고 |
| --- | --- | --- | --- |
| 이야기 배경 (`Bg`) | 약 5:2 | 1920×760 | 아래 160px은 글상자에 가려진다. 중요한 건 위쪽 ⅔에 |
| 싸움 상대 (1인칭) | 3:4 | 1024×1365 | 투명 배경 PNG, 허리 위, 정면 |
| 캐릭터 시트 | 3:2 | 1536×1024 | 정면·측면·뒷모습 3면 |
| 아이템 아이콘 | 1:1 | 512×512 | 투명 배경 |
| 타이틀 키 아트 | 16:9 | 1920×1080 | 왼쪽 ⅓은 제목 글자 자리로 비운다 |

> 같은 캐릭터를 여러 장 뽑을 때는 **캐릭터 시트를 먼저 만들고** 그 이미지를 레퍼런스(이미지 프롬프트 / IP-Adapter / `--cref`)로 넣는다.

---

## 1. 캐릭터 시트

### 1-1. 강태리 (주인공) — `char_taeri`
27세 전 통합 챔피언, 왼쪽 눈 실명, 검은 가죽 안대. 교복(1~3화)과 검은 트레이닝복(4화) 두 벌.

```
character reference sheet, front view, side view, back view, full body, plain light grey background,
Kang Taeri, 27-year-old Korean woman, former undefeated boxing champion, lean athletic boxer build,
broad shoulders, sharp jaw, short black hair tied in a low ponytail,
black leather eyepatch over her LEFT eye (appears on the viewer's right in front view), thin strap around the head,
calm tired right eye, faint scar near the left eyebrow,
outfit A: navy Korean girls' high school winter uniform, sailor collar with white trim, red ribbon,
pleated navy skirt, pink backpack,
outfit B: black training tracksuit zipped up, tiny "TAERI" embroidered in red thread on the back,
both fists wrapped in white compression bandages up to the wrists,
boxer's stance in one pose: left shoulder slightly forward, chin tucked
```

### 1-2. 한도윤 (1503호, 감염 전 / 후) — `char_doyun`
```
character reference sheet, two versions side by side, plain light grey background,
LEFT: Han Doyun, early 30s Korean man, gentle face, eyes that curve into half-moons when he smiles,
neat short hair, white dress shirt, navy slacks, blue lanyard with a school staff ID card,
holding a stack of delivery parcels, warm and slightly awkward,
RIGHT: the same man infected, left side of the neck torn, white shirt soaked dark red from collar to chest,
whites of the eyes completely blood red, pinpoint pupils, broken blue lanyard hanging from the neck,
only one leather work shoe, the other foot in a grey sock worn thin at the heel, head tilted upward
```

### 1-3. 정세훈 (1208호, 응급실 간호사) — `char_sehun`
```
character reference sheet, front view and side view, plain light grey background,
Jung Sehun, around 30, tall thin Korean man, gaunt face, white surgical mask,
tired observant eyes with clear white sclera, navy padded jacket over hospital scrub pants,
holding a red fire extinguisher, calm clinical posture
```

### 1-4. 마호룡 (1114호, 헬스장 관장) — `char_horyong`
```
character reference sheet, front view, plain light grey background,
Ma Horyong, 40s Korean man, huge bodybuilder physique, buzz cut, loud grinning face,
sleeveless gym tank top, track pants, gym towel around the neck, scar across one closed eye,
fists raised, reckless confidence
```

### 1-5. 아빠 (회상) — `char_dad`
```
character reference sheet, front view, plain light grey background, muted sepia tint for flashback,
Taeri's father, late 50s Korean man, old boxing trainer, weathered stern face, grey crew cut,
faded windbreaker, focus mitts tucked under one arm, rough hands, rarely smiles
```

---

## 2. 이야기 배경 (`src/story/backgrounds.ts`의 `Bg`)

인물이 없는 배경으로 뽑는다(인물은 대사 장면에 따로 얹는다). 공통 스타일 + 아래 문장.

| 파일명 | 장면 | 프롬프트 |
| --- | --- | --- |
| `bg_dawn` | 1화 새벽 5시 반, 해무 덮인 단지 | `wide establishing shot, Korean high-rise apartment complex at 5:30 am before sunrise, dense sea fog rolling low between the buildings, building number "103" plate, a few warm lit windows, empty guard booth with its light on, distant red ambulance siren glow at the main gate, dark sea on the horizon` |
| `bg_black` | 암전 | 이미지 불필요 (검은 화면) |
| `bg_mirror` | 1502호 욕실 거울 | `small Korean apartment bathroom, fogged mirror with one palm-wiped clear streak, black leather eyepatch and a red ribbon on the sink edge, cold white light, steam` |
| `bg_door` | 1502호 현관 안쪽 | `inside view of a Korean apartment front door, heavy grey steel door, digital door lock with lever handle, small peephole, shoe rack, pink backpack by the door, dim morning light, tension` |
| `bg_peep` | 외시경 너머 (도윤) | `fisheye peephole view of an apartment hallway, circular vignette, black outside the circle, a man in a blood-soaked white shirt standing very close to the door, behind him a figure crawling on all fours near the elevator` |
| `bg_peep1501` | 외시경 너머 (1501호 남자) | `fisheye peephole view of an apartment hallway, circular vignette, a man in a business suit crouched on all fours near the elevator, licking a pool of blood on the floor, a staff ID card with a broken blue lanyard lying beside him` |
| `bg_hall` | 15층 복도 | `15th floor apartment hallway in Korea, elevator doors, steel unit doors 1501 1502 1503, emergency stairwell fire door with wire-glass window, fire hydrant cabinet, smeared blood near the elevator, flickering fluorescent light` |
| `bg_stairs` | 계단참 (싸움) | `narrow apartment emergency stairwell landing, concrete steps, metal handrail, green emergency exit sign light, floor number "12" painted on the wall, deep shadows, claustrophobic` |
| `bg_stairsDown` | 난간 틈으로 내려다본 나선 계단 | `top-down view through the gap of a spiral apartment stairwell, dozens of floors descending into darkness, many pale hands gripping the railings on lower floors climbing upward, green emergency light` |
| `bg_kitchen` | 1502호 빈 냉장고 | `small bachelor apartment kitchen, open refrigerator glowing white, almost empty shelves: six bottles of water, one shriveled lemon, two packets of pickled radish, a salt tub, stack of delivery food containers on the counter` |
| `bg_night` | 불 끈 밤의 거실 | `dark Korean apartment living room at night, lights off, city faintly glowing through balcony windows, half-drunk water bottle and torn pickled radish packet on the floor, a bathtub-filled-with-water glimpse through an open door` |
| `bg_firedoor` | 철망 유리창 너머 얼굴 | `close view of a steel fire door with a small wire-mesh glass window, a necktie tied tightly between the door handle and a fire hydrant cabinet handle, blue pre-dawn light, a silhouette of a masked face behind the glass` |
| `bg_r1208` | 세훈의 1208호 | `sparse tidy apartment dining room, medical textbooks on the table, an unfinished seascape jigsaw puzzle with the horizon section missing, two instant cup noodles steaming, first aid kit open` |
| `bg_balcony` | 1502호 베란다 칸막이 | `apartment balcony, laundry drying rack pushed aside revealing a thin gypsum board partition wall to the next unit, grey morning, view of other apartment towers` |
| `bg_b1503` | 부서진 칸막이 너머 1503호 베란다 | `broken gypsum board wall with a fist-sized hole, through it a lush balcony full of green potted plants like a small forest, soft daylight, dust in the air` |
| `bg_r1503` | 1503호 거실 (살펴보기) | `warm lived-in Korean apartment living room, wide view left to right: seven monstera pots with white name stakes and a watering can and a cat food bag (left), cork board with photos and handwritten sticky notes (center-left), refrigerator with masking-tape labeled side dish containers (center), kitchen cupboard (center-right), doorway to a small study with a desk (right)` |
| `bg_desk` | 서재 책상 | `small study room, bookshelf of worn civil service exam books, desk with a white envelope addressed in neat rounded handwriting, a small name tag on top, desk lamp, quiet afternoon light` |
| `bg_closet` | 옷장 | `open wardrobe, at the very back a black tracksuit in a plastic cover, a folded navy school uniform being sealed in a plastic bag, dim light` |
| `bg_dining` | 장조림 식탁 | `small dining table, two bowls of rice, one container of soy-braised beef with five quail eggs, masking tape label on the lid, chopsticks, dim warm light, quiet moment between two survivors` |

**싸움 전용 배경** (`storyFights.ts`의 `bg`)

| 파일명 | 프롬프트 |
| --- | --- |
| `fight_hall` | `first-person view down a narrow apartment hallway toward the elevator, steel doors on both sides, fluorescent light, the LEFT third of the image falls into deep darkness` |
| `fight_stairs` | `first-person view on a stairwell landing looking down the steps, metal railing on the right, concrete wall on the left in darkness, green emergency light` |
| `fight_room` | `first-person view of an empty dark living room at 4 am, furniture pushed to the walls, faint blue window light` |
| `fight_wall` | `first-person view facing a thin gypsum board balcony partition wall at close range, laundry rack beside it` |

> 태리의 왼쪽 눈은 보이지 않으므로 1인칭 배경은 **왼쪽 ⅓을 어둡게** 뽑는다. 코드의 어둠 효과와 겹쳐도 자연스럽다.

---

## 3. 싸움 상대 (1인칭, 투명 배경)

공통 덧붙임: `front-facing, waist-up, looking straight at the viewer, isolated on transparent background, PNG cutout, rim light from the right`

| 파일명 | 대상 | 프롬프트 |
| --- | --- | --- |
| `enemy_suit1501` | 1501호 남자 | `infected Korean office worker in a grey business suit, grey necktie, chin and mouth soaked red, whites of the eyes completely blood red with pinpoint pupils, hunched lunging posture, hands reaching forward` |
| `enemy_suitStairs` | 계단참 정장 남자 | `infected man in a navy suit, necktie twisted around to his back, one leather shoe missing, crouched about to pounce on all fours, blood red eyes` |
| `enemy_apron` | 14층 앞치마 여자 | `infected middle-aged woman in a kitchen apron, a single yellow rubber glove on her left hand, house clothes, wet hair, grabbing forward with both arms, blood red eyes` |
| `enemy_doyun` | 12층 계단참의 도윤 | `infected Han Doyun, white dress shirt soaked dark red from the torn left side of the neck, broken blue lanyard on the neck, blood red eyes searching, face still recognizably gentle, tragic not monstrous` |
| `enemy_normal` | 연습: 일반 감염자 | `generic infected Korean apartment resident in pajamas and cardigan, blood red eyes, open mouth, arms raised` |
| `enemy_crawler` | 연습: 기어 오는 감염자 | `infected person crawling low on all fours toward the viewer, head at chest height, long messy hair, torn clothes, blood red eyes` |
| `enemy_horyong` | 연습 보스: 감염된 호룡 | `infected Ma Horyong, massive bodybuilder in a torn gym tank top, one eye scarred shut, the other blood red, veins bulging, towel around the neck, terrifying bulk` |

**피격·예비 동작 변형** (같은 시드/레퍼런스로 추가)
- `_windupL` / `_windupR`: `pulling the arm back for a wide clawing swipe from the left/right`
- `_bite`: `lunging head first with jaws wide open`
- `_grab`: `both hands thrust forward to grab`
- `_hit`: `head snapped back from a punch, motion blur`
- `_down`: `collapsing backward, knocked out`

---

## 4. 태리의 주먹 (1인칭 화면 아래)

`hud_fist_left`, `hud_fist_right` — 투명 배경 PNG, 화면 하단 모서리에서 올라오는 구도.

```
first-person view of a woman's fist and forearm rising from the bottom edge of the frame,
wrapped in white compression bandage over the knuckles and wrist, sleeve of a navy school uniform
(variant: black tracksuit sleeve), boxing guard position, isolated on transparent background
```
변형: `_jab`(앞으로 뻗음, 모션 블러), `_upper`(아래에서 위로), `_body`(낮게 뻗음).

---

## 5. 아이템 아이콘 (`item`)

공통 덧붙임: `single object, centered, soft shadow, isolated on transparent background, webtoon item icon`

| 파일명 | 아이템 | 프롬프트 |
| --- | --- | --- |
| `item_idcard` | 도윤의 사원증 | `school staff ID card with an awkwardly smiling man's photo, broken blue lanyard, a smear of blood on the corner` |
| `item_food1503` | 1503호의 식량 | `small pile of instant ramen packets, canned tuna, canned ham, microwave rice bowls and a container of soy-braised beef` |
| `item_nametag` | 명찰 ‘1-3 강태리’ | `small rectangular school name tag pin, blank white plate (no text), navy border` |
| `item_letter` | 도윤의 편지 | `opened white envelope with a handwritten letter folded half out, neat rounded handwriting (illegible)` |
| `item_bandage` | 압박 붕대 | `roll of white compression bandage, end partially unrolled` |

> 명찰·편지 글자는 이미지 모델이 한글을 잘못 그리므로 비워 두고, 게임에서 글자를 얹는다.

---

## 6. 타이틀 키 아트 — `title_key`

```
Korean webtoon key art, 16:9, Kang Taeri standing in a dark apartment emergency stairwell,
seen from slightly below, black tracksuit, black leather eyepatch over her left eye,
white-bandaged fists, staff ID card with a blue lanyard tucked in her chest pocket,
green emergency light from above, below her the spiral stairwell full of reaching infected hands,
fog of dust, determined still expression, composition weighted to the right,
empty dark space on the left third for the title text
```

변형 — 1화 분위기용: `same composition but she wears the navy sailor-collar school uniform with a red ribbon, a few blood drops on the sleeve cuff`.

---

## 7. 쓰는 순서 추천

1. 캐릭터 시트(태리 → 도윤 → 세훈) — 이후 모든 그림의 레퍼런스.
2. 이야기 배경 19장 — 인물이 없어 일관성 맞추기 쉽다.
3. 싸움 상대 + 변형 — 같은 캐릭터 레퍼런스로.
4. 아이콘, 타이틀.

뽑은 그림은 `public/img/<파일명>.png`에 두면 `drawBg` / `drawZombieFront`에서 `scene.load.image`로 바꿔 끼울 수 있다.
