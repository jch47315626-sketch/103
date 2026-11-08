# 103동 — 배경 프롬프트 (ComfyUI 붙여넣기용)

> `tools/comfy/prompts.json`에서 `python tools/comfy/export_backgrounds.py`로 만든 파일. 프롬프트는 JSON 쪽을 고친다.

각 블록을 ComfyUI의 **긍정 프롬프트(CLIP Text Encode)** 칸에 그대로 붙여 넣는다. 공통 화풍 문장이 이미 앞에 들어 있다.

## 공통 설정

**부정 프롬프트** (모든 배경 공통)

```
text, letters, watermark, signature, logo, extra fingers, deformed hands, bad anatomy, cartoonish chibi, bright saturated colors, gore close-up, exposed organs, anime moe style, two eyepatches, lowres, blurry, jpeg artifacts
```

| 종류 | Empty Latent 크기 | 게임에 넣을 크기 |
| --- | --- | --- |
| 이야기 배경 `bg_*` | 1600 × 640 | 1920 × 760 (아래 160px은 글상자에 가려짐) |
| 싸움 배경 `fight_*` | 1344 × 768 | 1920 × 1080 |

권장: steps 30, CFG 6, sampler dpmpp_2m, scheduler karras. 파일명은 각 제목의 이름 그대로 `public/img/`에 저장.

## 이야기 배경 (18장)

### `bg_dawn` — 1화 새벽 5시 반, 해무 덮인 단지

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, wide establishing shot, Korean high-rise apartment complex at 5:30 am before sunrise, dense sea fog rolling low between the buildings, a few warm lit windows, empty guard booth with its light on, distant red ambulance siren glow at the main gate, dark sea on the horizon, no people, empty scene, important details in the upper two thirds
```

### `bg_mirror` — 1502호 욕실 거울

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, small Korean apartment bathroom, fogged mirror with one palm-wiped clear streak, black leather eyepatch and a red ribbon on the sink edge, cold white light, steam, no people, empty scene, important details in the upper two thirds
```

### `bg_door` — 1502호 현관 안쪽

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, inside view of a Korean apartment front door, heavy grey steel door, digital door lock with lever handle, small peephole, shoe rack, pink backpack by the door, dim morning light, tension, no people, empty scene, important details in the upper two thirds
```

### `bg_peep` — 외시경 너머 — 도윤

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, fisheye peephole view of an apartment hallway, circular vignette, pure black outside the circle, a man in a blood-soaked white shirt standing very close to the door, behind him a figure crawling on all fours near the elevator, important details in the upper two thirds
```

### `bg_peep1501` — 외시경 너머 — 1501호 남자

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, fisheye peephole view of an apartment hallway, circular vignette, pure black outside the circle, a man in a business suit crouched on all fours near the elevator, licking a pool of blood on the floor, a staff ID card with a broken blue lanyard lying beside him, important details in the upper two thirds
```

### `bg_hall` — 15층 복도

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, 15th floor apartment hallway in Korea, elevator doors, three steel unit doors, emergency stairwell fire door with wire-glass window, fire hydrant cabinet, smeared blood near the elevator, flickering fluorescent light, no people, empty scene, important details in the upper two thirds
```

### `bg_stairs` — 계단참

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, narrow apartment emergency stairwell landing, concrete steps, metal handrail, green emergency exit sign light, deep shadows, claustrophobic, no people, empty scene, important details in the upper two thirds
```

### `bg_stairsDown` — 난간 틈으로 내려다본 나선 계단

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, top-down view through the gap of a spiral apartment stairwell, many floors descending into darkness, pale hands gripping the railings on lower floors climbing upward, green emergency light, important details in the upper two thirds
```

### `bg_kitchen` — 1502호 빈 냉장고

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, small bachelor apartment kitchen, open refrigerator glowing white, almost empty shelves with six bottles of water, one shriveled lemon, two packets of pickled radish, a salt tub, stack of delivery food containers on the counter, no people, empty scene, important details in the upper two thirds
```

### `bg_night` — 불 끈 밤의 거실

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, dark Korean apartment living room at night, lights off, city faintly glowing through balcony windows, half-drunk water bottle and a torn snack packet on the floor, no people, empty scene, important details in the upper two thirds
```

### `bg_firedoor` — 넥타이로 묶은 방화문, 철망 유리창

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, close view of a steel fire door with a small wire-mesh glass window, a grey necktie tied tightly between the door handle and a fire hydrant cabinet handle, blue pre-dawn light, a blurred silhouette of a masked face behind the glass, important details in the upper two thirds
```

### `bg_r1208` — 세훈의 1208호

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, sparse tidy apartment dining room, medical textbooks on the table, an unfinished seascape jigsaw puzzle with the horizon section missing, two instant cup noodles steaming, open first aid kit, no people, empty scene, important details in the upper two thirds
```

### `bg_balcony` — 1502호 베란다 칸막이

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, apartment balcony, laundry drying rack pushed aside revealing a thin gypsum board partition wall to the next unit, grey morning, view of other apartment towers, no people, empty scene, important details in the upper two thirds
```

### `bg_b1503` — 부서진 칸막이 너머 1503호 베란다

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, broken gypsum board wall with a fist-sized hole, through it a lush balcony full of green potted plants like a small forest, soft daylight, dust in the air, no people, empty scene, important details in the upper two thirds
```

### `bg_r1503` — 1503호 거실 (살펴보기)

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, warm lived-in Korean apartment living room, wide view left to right: seven monstera pots with white name stakes, a watering can and a cat food bag on the left, cork board with photos and sticky notes center-left, refrigerator in the center, kitchen cupboard center-right, doorway to a small study with a desk on the right, no people, empty scene, important details in the upper two thirds
```

### `bg_desk` — 1503호 서재 책상

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, small study room, bookshelf of worn exam books, desk with a white envelope and a small name tag on top, desk lamp, quiet afternoon light, no people, empty scene, important details in the upper two thirds
```

### `bg_closet` — 옷장

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, open wardrobe, at the very back a black tracksuit in a plastic cover, a folded navy school uniform being sealed in a plastic bag, dim light, no people, empty scene, important details in the upper two thirds
```

### `bg_dining` — 장조림 식탁

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, small dining table, two bowls of rice, one container of soy-braised beef with five quail eggs, masking tape label on the lid, chopsticks, dim warm light, quiet moment, no people, empty scene, important details in the upper two thirds
```

## 싸움 배경 (4장, 1인칭 — 왼쪽 ⅓ 어둡게)

### `fight_hall` — 싸움 — 15층 복도

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, view down a narrow apartment hallway toward the elevator, steel doors on both sides, fluorescent light, no people, first-person point of view, the left third of the image falls into deep darkness
```

### `fight_stairs` — 싸움 — 계단참

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, on a stairwell landing looking down the steps, metal railing on the right, concrete wall on the left, green emergency light, no people, first-person point of view, the left third of the image falls into deep darkness
```

### `fight_room` — 싸움 — 새벽 거실 (섀도복싱)

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, empty dark living room at 4 am, furniture pushed to the walls, faint blue window light, no people, first-person point of view, the left third of the image falls into deep darkness
```

### `fight_wall` — 싸움 — 베란다 칸막이

```
Korean webtoon illustration, semi-realistic, clean ink lines with soft cel shading, cold desaturated palette (concrete grey, night navy, sickly green emergency light), small accents of warm orange and blood red, cinematic lighting, quiet dread, Korean apartment complex survival drama, no text, no watermark, no logo, facing a thin gypsum board balcony partition wall at close range, laundry rack beside it, no people, first-person point of view, the left third of the image falls into deep darkness
```
