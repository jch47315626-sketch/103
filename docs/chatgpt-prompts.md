# 103동 — ChatGPT 이미지 프롬프트

> `python tools/chatgpt/build.py`로 만든 파일 (프롬프트 212개). 고칠 땐 `tools/chatgpt/build.py`를 고친다.

## 쓰는 법

1. ChatGPT에서 **새 대화**를 열고, 아래 `대화 시작용 문장`을 먼저 보낸다. 같은 대화에서 계속 뽑아야 화풍이 이어진다.
2. 인물이 나오는 프롬프트를 보낼 때는 **만들어 둔 캐릭터 시트**를 같이 올리며 "첨부한 인물과 같은 사람으로"를 앞에 붙인다.
3. 각 블록은 그대로 복사해 보낸다. 화풍 문장이 블록 끝에 이미 들어 있다.
4. 저장 이름은 제목의 `영문 이름.png`로, 레포의 `public/img/`에 넣는다.

**대화 시작용 문장**

```
I am making illustrations for a story-driven game based on my own novel, a quiet survival drama set in a Korean apartment complex during a mysterious illness outbreak. Please keep a consistent style across every image in this conversation. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

**검열에 걸렸을 때**

- 이 문서의 프롬프트는 피·상처·시체·물어뜯기·좀비 같은 단어를 쓰지 않는다. 감염자는 "원인 모를 병을 앓는 사람(ashen skin, reddened eyes)"으로, 피는 "dark rust-brown stains"로 바꿔 두었다.
- 그래도 거절되면 문제가 될 만한 묘사 하나(얼룩, 손을 뻗는 동작 등)를 빼고 다시 보낸다.
- 태리는 교복을 입지만 27세 성인이다. 교복 장면에는 "adult"를 빼지 않는다. 학생이 위험에 처한 장면은 만들지 않는다.
- 실존 작가·작품·브랜드 이름을 넣지 않는다.

**크기**

| 종류 | ChatGPT에 요청 | 게임에서 |
| --- | --- | --- |
| bg | 1536x1024 가로 | 가운데 띠를 1920×760으로 잘라 쓴다 |
| fight | 1536x1024 가로 | 1920×1080으로 잘라 쓴다 |
| cg | 1536x1024 가로 | 이벤트 그림. 1920×1080으로 잘라 쓴다 |
| portrait | 1024x1536 세로 | 대화창 옆 서 있는 그림 |
| enemy | 1024x1536 세로 | 1인칭 싸움 상대 |
| item | 1024x1024 정사각 | 아이템 아이콘 |
| hud | 1024x1024 정사각 | 1인칭 화면 아래 주먹 |
| ui | 주제별 | UI |

## 목차

- [1. 대화용 서 있는 그림 (투명 배경)](#1-대화용-서-있는-그림-투명-배경) — 21개
- [2-1. 배경 — 한마음 아파트 단지 바깥](#2-1-배경--한마음-아파트-단지-바깥) — 21개
- [2-2. 배경 — 103동 안 (공용 공간)](#2-2-배경--103동-안-공용-공간) — 16개
- [2-3. 배경 — 세대 안](#2-3-배경--세대-안) — 24개
- [2-4. 배경 — 동구시](#2-4-배경--동구시) — 14개
- [2-5. 배경 — 백합여자고등학교](#2-5-배경--백합여자고등학교) — 9개
- [2-6. 배경 — 회상](#2-6-배경--회상) — 6개
- [3. 싸움 배경 (1인칭)](#3-싸움-배경-1인칭) — 12개
- [4. 싸움 상대 (투명 배경)](#4-싸움-상대-투명-배경) — 13개
- [5. 이벤트 그림 (1화~4화 결정적 장면)](#5-이벤트-그림-1화4화-결정적-장면) — 22개
- [6. 태리의 주먹 (1인칭, 투명 배경)](#6-태리의-주먹-1인칭-투명-배경) — 5개
- [7. 아이템 아이콘 (투명 배경)](#7-아이템-아이콘-투명-배경) — 37개
- [8. UI · 타이틀](#8-ui--타이틀) — 12개

## 1. 대화용 서 있는 그림 (투명 배경)

대사 장면에서 글상자 옆에 세운다. 만들어 둔 캐릭터 시트를 같이 올리고 뽑는다.

### `pt_taeri_track_neutral` — 태리(트레이닝복) — 무표정

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, neutral calm expression. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_track_sad` — 태리(트레이닝복) — 슬픔

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, eyes lowered, holding back tears. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_track_angry` — 태리(트레이닝복) — 분노

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, jaw clenched, fierce glare. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_track_determined` — 태리(트레이닝복) — 결의

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, steady determined look. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_track_tired` — 태리(트레이닝복) — 지침

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, exhausted, slightly slumped. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_track_smile` — 태리(트레이닝복) — 옅은 웃음

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, a small faint smile. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_uni_neutral` — 태리(교복) — 무표정

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), neutral calm expression. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_uni_sad` — 태리(교복) — 슬픔

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), eyes lowered, holding back tears. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_taeri_uni_startled` — 태리(교복) — 놀람

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), startled, eye wide. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_sehun_neutral` — 세훈 — 무표정

```
Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants, mask on, neutral clinical look. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_sehun_serious` — 세훈 — 단호

```
Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants, mask on, stern serious look. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_sehun_unmasked` — 세훈 — 마스크 내림

```
Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants, mask pulled down to the chin, tired face. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_sehun_soft` — 세훈 — 누그러짐

```
Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants, mask on, eyes softened. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_horyong_grin` — 호룡 — 호탕

```
Ma Horyong, a loud Korean gym owner in his 40s, huge muscular build, buzz cut, sleeveless tank top, gym towel around the neck, big confident grin. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_horyong_shout` — 호룡 — 외침

```
Ma Horyong, a loud Korean gym owner in his 40s, huge muscular build, buzz cut, sleeveless tank top, gym towel around the neck, shouting with fists raised. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_horyong_serious` — 호룡 — 진지

```
Ma Horyong, a loud Korean gym owner in his 40s, huge muscular build, buzz cut, sleeveless tank top, gym towel around the neck, serious, catching his breath. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_doyun_smile` — 도윤 — 웃음 (회상)

```
Han Doyun, a gentle Korean man in his early 30s, eyes that curve into half-moons when he smiles, white dress shirt, blue lanyard, warm half-moon smile, soft warm light. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_doyun_shy` — 도윤 — 머쓱함 (회상)

```
Han Doyun, a gentle Korean man in his early 30s, eyes that curve into half-moons when he smiles, white dress shirt, scratching the back of his head, awkward smile, holding a parcel. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_dad_stern` — 아빠 — 엄함 (회상)

```
Taeri's father, a Korean boxing coach in his late 50s, weathered stern face, grey crew cut, faded windbreaker, stern look, arms crossed, muted sepia tint. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_dad_smile` — 아빠 — 웃음 (회상)

```
Taeri's father, a Korean boxing coach in his late 50s, weathered stern face, grey crew cut, faded windbreaker, rare gentle smile at a harbor, muted sepia tint. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `pt_rider` — 배달 라이더

```
A cheerful young Korean delivery rider with dyed yellow hair, helmet under arm, handing over a food bag with a grin. Portrait image (2:3), waist-up, facing slightly toward the viewer, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 2-1. 배경 — 한마음 아파트 단지 바깥

### `bg_complex_dawn` — 단지 전경 — 새벽 해무

```
A Korean high-rise apartment complex at dawn before sunrise, dense sea fog rolling low between the towers, a few warm windows lit, distant red emergency light glow at the main gate, dark sea on the horizon. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_complex_day` — 단지 전경 — 낮 (발병 이후)

```
A Korean high-rise apartment complex on an overcast afternoon, abandoned cars parked at odd angles, laundry left on balconies, eerily quiet. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_complex_night` — 단지 전경 — 정전된 밤

```
A Korean high-rise apartment complex at night during a blackout, almost every window dark, only a few candle-lit windows, moonlight on the towers. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_complex_rain` — 단지 전경 — 비

```
A Korean apartment complex in heavy rain, puddles reflecting grey towers, rain streaks, gloomy. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_103_exterior` — 103동 외관

```
A single tall Korean apartment tower seen from the ground, 15 floors, rows of balconies, a building number plate area left blank, grey sky. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_gate` — 단지 정문

```
The main gate of a Korean apartment complex, raised barrier arm, empty guard booth, a fallen bicycle, scattered leaflets. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_guardbooth` — 103동 경비실

```
A small apartment security guard booth at dawn, light on inside, empty chair, a thermos and logbook on the desk, a dark stain on the flowerbed curb outside. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_walkpath` — 단지 둘레길

```
A jogging path circling an apartment complex, lined with trees and benches, morning fog. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_playground` — 단지 놀이터

```
An empty apartment complex playground at dusk, a still swing, a slide, scattered toys, long shadows. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_parking_ground` — 지상 주차장 (고양이 밥 주던 곳)

```
An outdoor apartment parking lot corner, small bowls of cat food by a wall, two stray cats, parked cars. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_parking_under` — 지하 주차장

```
A dim underground apartment parking garage, flickering fluorescent tubes, concrete pillars with painted numbers left blank, parked cars, deep shadows. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_mgmt_office` — 관리사무소

```
An apartment management office, desks with papers, a wall of CCTV monitors mostly dark, key cabinet, notice board. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_broadcast_room` — 관리사무소 방송실

```
A small broadcasting booth inside an apartment management office, a microphone on a stand, an old amplifier panel, a chair knocked over. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_recycling` — 분리수거장

```
An apartment recycling collection area with bins and stacked cardboard, overflowing bags, a stray cat. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_mall` — 단지 상가 거리

```
A small strip of shops in an apartment complex: convenience store, laundry, small mart, all shutters half down, empty street. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_conv_store` — 상가 편의점 안

```
Inside a small Korean convenience store, shelves partly emptied, fallen snack bags, refrigerator doors glowing, counter abandoned. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_senior_center` — 경로당

```
Inside a Korean apartment senior community room, floor cushions, a TV, a tea table, a calendar on the wall. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_community_gym` — 단지 커뮤니티 헬스장

```
An apartment complex fitness room with treadmills and weight machines, mirrors on the wall, lights off, morning light through blinds. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_rooftop` — 103동 옥상

```
The rooftop of an apartment tower, water tank, railings, antennas, a wide view of the city and the sea, wind. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_rooftop_night` — 103동 옥상 — 밤

```
The rooftop of an apartment tower at night, the dark city below with a few fires glowing far away, stars, wind. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_water_tank` — 옥상 물탱크실

```
A rooftop water tank room, large blue tanks, pipes and valves, a single bulb. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 2-2. 배경 — 103동 안 (공용 공간)

### `bg_lobby` — 1층 로비

```
The ground floor lobby of a Korean apartment tower, glass entrance door with a keypad, mailboxes on the wall, elevator doors, scattered flyers. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_mailboxes` — 1층 우편함

```
A wall of apartment mailboxes, some stuffed with uncollected mail, a delivery parcel on the floor. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_elevator_in` — 엘리베이터 안

```
Inside a small apartment elevator, mirror wall, floor buttons panel, harsh light, a mirror crack. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_elevator_hall` — 엘리베이터 홀

```
An apartment floor elevator landing, two elevator doors, floor indicator, a potted plant. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_hall15` — 15층 복도

```
A 15th floor apartment hallway: elevator, three steel unit doors, a fire door with a small wire-glass window, a fire hose cabinet, flickering fluorescent light, a dark stain near the elevator. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_hall15_night` — 15층 복도 — 정전

```
The same apartment hallway in a blackout, only a green emergency exit sign glowing, deep shadows. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_hall_generic` — 다른 층 복도

```
An apartment hallway with steel doors, some doors left ajar, a shoe left on the floor, notices taped to a door. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_hall_barricade` — 바리케이드 친 복도

```
An apartment hallway blocked with stacked furniture, a shoe cabinet and mattresses as a barricade, tied with rope. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_stair_landing` — 계단참

```
A narrow apartment emergency stairwell landing, concrete steps, metal handrail, green emergency light, deep shadows. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_stair_down` — 난간 틈으로 내려다본 나선 계단

```
Top-down view through the gap of a tall spiral stairwell, floors descending into darkness, many pale hands gripping the railings far below. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_stair_up` — 올려다본 계단

```
Looking up a tall apartment stairwell from below, spiral railings rising into dim light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_firedoor` — 넥타이로 묶은 방화문

```
Close view of a steel fire door with a small wire-mesh glass window, a grey necktie tied tight between the door handle and the fire hose cabinet handle, blue pre-dawn light, a faint masked silhouette behind the glass. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_firedoor_closed` — 방화문 — 계단 쪽

```
A steel fire door seen from the stairwell side, a push bar, scuff marks, green emergency light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_floor11` — 11층 계단 입구

```
An apartment stairwell entrance on the 11th floor, the fire door wide open, a gym bag on the floor, fluorescent light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_machine_room` — 지하 기계실

```
An apartment basement machine room with an electrical panel, generators, pipes, warning lights, a flashlight beam. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_rooftop_door` — 옥상 출입문

```
The top of an apartment stairwell with a metal rooftop door, daylight leaking around the edges, a padlock hanging open. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 2-3. 배경 — 세대 안

### `bg_1502_door` — 1502호 현관 안쪽

```
Inside view of a Korean apartment front door: heavy grey steel door, digital lock with lever handle, small peephole, shoe rack, a pink backpack by the door. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1502_living` — 1502호 거실

```
A bare bachelor apartment living room, almost no furniture, a sofa, stacked delivery containers, a single championship belt case on a shelf, curtains half drawn. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1502_living_night` — 1502호 거실 — 밤

```
The same bare living room at night with lights off, city glow through the balcony windows, a half-empty water bottle on the floor. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1502_kitchen` — 1502호 빈 냉장고

```
A small kitchen with the refrigerator open and glowing, nearly empty shelves: six water bottles, one shriveled lemon, two snack packets, a salt tub. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1502_bath` — 1502호 욕실

```
A small apartment bathroom, fogged mirror with one palm-wiped clear streak, a black leather eyepatch and a red ribbon on the sink. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1502_bath_water` — 물 받은 욕조

```
A bathtub filled to the brim with water, eleven plastic food containers filled with water lined up on the floor. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1502_bedroom` — 1502호 침실

```
A plain bedroom, a single bed, a boxing poster rolled up in the corner, a folded school uniform on a chair. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1502_balcony` — 1502호 베란다 칸막이

```
An apartment balcony, laundry rack pushed aside revealing a thin gypsum partition wall to the next unit, grey morning. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_peephole_1` — 외시경 — 문 앞의 도윤

```
Fisheye peephole view of an apartment hallway in a circular frame, black outside the circle, a man in a stained white shirt standing very close to the door with his head lowered. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_peephole_2` — 외시경 — 1501호 남자

```
Fisheye peephole view of an apartment hallway in a circular frame, black outside the circle, a man in a suit crouched near the elevator, a staff ID card with a broken blue lanyard on the floor. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1503_balcony` — 1503호 베란다 숲

```
A broken gypsum wall with a hole, through it a balcony full of potted green plants like a small forest, soft daylight, dust in the air. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1503_living` — 1503호 거실 (살펴보기)

```
A warm lived-in apartment living room, left to right: seven monstera pots with white name stakes, a watering can and a cat food bag; a cork board with photos and sticky notes; a refrigerator; a kitchen cupboard; a doorway to a small study. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1503_fridge` — 1503호 냉장고 안

```
Inside a refrigerator full of neatly stacked side-dish containers, each lid labeled with masking tape, a bowl of soaked seaweed. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1503_study` — 1503호 서재

```
A small study, a bookshelf of worn exam books, a desk with a white envelope and a small name tag, desk lamp, afternoon light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1503_closet` — 옷장

```
An open wardrobe, a black tracksuit in a plastic cover at the very back, a school uniform being sealed in a plastic bag. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1503_dining` — 장조림 식탁

```
A small dining table, two bowls of rice, one container of soy-braised beef with five quail eggs, chopsticks, dim warm light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1208` — 세훈의 1208호

```
A sparse tidy dining room, medical textbooks on the table, an unfinished seascape jigsaw puzzle with the horizon section missing, two cup noodles steaming, an open first aid kit. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1208_night` — 1208호 — 밤

```
The same tidy room at night, a single desk lamp, the unfinished seascape puzzle, a nurse jacket on the chair. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1114` — 호룡의 1114호

```
A messy apartment turned into a home gym: barbell rack, dumbbells, protein tubs, trophies, a punching bag hanging from the ceiling. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_1501` — 1501호 (이웃집)

```
A neat apartment entryway of an office worker, a briefcase by the door, a coat rack with a grey tie, family photo on the shoe cabinet. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_unit_messy` — 버려진 세대

```
An abandoned apartment living room in disarray, overturned chairs, open drawers, curtains blowing from an open balcony door. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_unit_elder` — 할머니 세대

```
An elderly woman's apartment living room, floor cushions, framed family photos, a small altar, potted chili plants on the balcony. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_unit_family` — 아이 있는 세대

```
A family apartment living room with a child's drawings on the fridge, a small tent made of blankets, toys neatly put away, quiet. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_shelter_room` — 주민 임시 대피 세대

```
An apartment living room converted into a shared shelter, sleeping mats lined up, a table with water bottles and canned food sorted, a whiteboard with blank lines. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 2-4. 배경 — 동구시

대본에 이름이 나온 장소와, 바깥으로 나가면 필요할 곳.

### `bg_coast_road` — 동구시 해안도로

```
A coastal road in a Korean port city, sea on one side, apartment towers on the other, abandoned cars, overcast. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_city_street` — 동구시 시내 거리

```
A Korean downtown street after an evacuation, cars abandoned with doors open, shop shutters down, a fallen traffic cone, empty. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_city_night` — 동구시 시내 — 밤

```
A Korean downtown street at night during a blackout, only a few neon signs flickering, wet asphalt. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_bus_stop` — 버스 정류장

```
A Korean bus stop shelter, an empty bench, a route map panel left blank, a forgotten umbrella. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_police_line` — 경찰 통제선

```
A street blocked by police barricades and orange cones, an empty police car with its lights off, scattered flyers. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_mart` — 동네 마트

```
Inside a neighborhood supermarket, half-empty shelves, an overturned cart, flickering lights. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_pharmacy` — 약국

```
Inside a small Korean pharmacy, medicine shelves behind a counter, some boxes fallen, a closed sign on the door. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_harbor` — 동구항 부두

```
A Korean fishing harbor pier, moored boats, coiled ropes and bollards, gulls, grey sea. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_harbor_flash` — 동구항 부두 — 회상

```
A Korean fishing harbor pier on a warm sunny day, ropes and bollards, soft nostalgic sepia light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_fish_market` — 수협 공판장 (보호시설)

```
A large fish auction hall converted into an emergency shelter, rows of cots and blankets, plastic crates, relief supply boxes. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_civic_gym` — 동구시민체육관 (보호시설)

```
A city sports arena floor used as an emergency shelter, rows of cots, partition tents, supply tables, high ceiling lights. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_hospital_er` — 한마음대학병원 응급실

```
A hospital emergency room in chaos, empty stretchers in the hallway, curtains drawn, monitors off, scattered gloves. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_hospital_hall` — 병원 복도

```
A long hospital corridor at night, flickering lights, wheelchairs left against the wall, an exit sign glowing. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_bridge` — 동구시 다리

```
A long bridge out of a Korean port city, cars jammed and abandoned, a military checkpoint at the far end, overcast. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 2-5. 배경 — 백합여자고등학교

학생이 위험에 처한 모습은 검열에 걸리기 쉬우니, 학교 배경은 사람 없이 뽑는다.

### `bg_school_gate` — 정문

```
The front gate of a Korean high school, a banner frame left blank, cherry trees, empty. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_yard` — 운동장

```
A Korean high school sports field with the main building behind, empty, overcast. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_gym_ready` — 체육관 — 입학식 준비

```
A school gymnasium set up for an entrance ceremony, rows of folding chairs, a stage with flowers, empty. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_gym_shelter` — 체육관 — 보호시설

```
A school gymnasium converted into an emergency shelter, folding chairs pushed aside, mats and blankets on the floor, supply boxes. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_class` — 1학년 3반 교실

```
A Korean high school classroom, rows of desks, a chalkboard left blank, spring light through windows. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_hall` — 학교 복도

```
A Korean high school corridor with lockers and classroom doors, empty, late afternoon light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_office` — 행정실

```
A school administration office, desks with files and a window facing the gymnasium, a staff ID lanyard hook on the wall. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_store` — 매점

```
A small school snack shop counter with snacks and stationery, name tags on a display stand, shutter half down. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_school_roof` — 학교 옥상

```
The rooftop of a school building, railings, a view of the port city and the sea. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 2-6. 배경 — 회상

### `bg_flash_boxing_gym` — 아빠의 복싱 체육관

```
An old Korean boxing gym, a worn ring, heavy bags, faded posters left blank, sunlight through dusty windows, sepia tone. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_flash_ring` — 챔피언전 링

```
A professional boxing ring under bright spotlights, a cheering crowd blurred in the dark, ropes glowing, dramatic. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_flash_locker` — 시합 대기실

```
A boxing locker room before a fight, a bench with gloves and tape, a tracksuit folded in a bag, fluorescent light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_flash_eye_clinic` — 안과 진찰실

```
An eye clinic examination room, a slit lamp machine, an eye chart on the wall left blank, cold light. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_flash_school15` — 열다섯 살의 학교 복도

```
A middle school corridor in spring, sepia nostalgic tone, an empty hallway and a teacher’s office door. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `bg_flash_rejection` — 불합격 문자를 받던 방

```
A dim apartment room, a phone lying face up on the floor with a glowing blank screen, crumpled resumes, night. Wide landscape image (3:2). An empty location with no people unless described. Keep the important content in the middle horizontal band, since the top and bottom will be cropped. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 3. 싸움 배경 (1인칭)

태리의 왼쪽 눈은 보이지 않아서 왼쪽 ⅓을 어둡게 뽑는다.

### `fight_hall` — 15층 복도

```
An apartment hallway toward the elevator, steel doors on both sides, fluorescent light. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_stairs` — 계단참

```
A stairwell landing looking down the steps, metal railing on the right, concrete wall on the left, green emergency light. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_room` — 새벽 거실 (섀도복싱)

```
An empty dark living room at 4 am, furniture pushed to the walls, faint blue window light. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_wall` — 베란다 칸막이

```
Facing a thin gypsum balcony partition wall up close, a laundry rack beside it. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_elevator` — 엘리베이터 홀

```
An elevator landing, elevator doors half open with darkness inside. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_lobby` — 1층 로비

```
An apartment ground floor lobby, glass doors, mailboxes, scattered flyers. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_parking` — 지하 주차장

```
An underground parking garage between concrete pillars, flickering lights. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_rooftop` — 옥상

```
An apartment rooftop with railings and a water tank, windy grey sky. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_gym` — 1114호 홈짐

```
An apartment home gym, weight racks and a hanging punching bag. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_school_gym` — 학교 체육관

```
A school gymnasium floor with folding chairs scattered. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_street` — 거리

```
A city street between abandoned cars, overcast. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fight_harbor` — 부두

```
A harbor pier with ropes and bollards, grey sea. Wide landscape image (3:2). First-person eye-level view as if standing there. No people. The left third of the image fades into deep shadow. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 4. 싸움 상대 (투명 배경)

같은 대화에서 원본을 뽑은 뒤, 마지막 항목처럼 "같은 인물, 이번엔 ~" 으로 동작 변형을 뽑는다.

### `enemy_suit1501` — 1501호 남자

```
A person afflicted by a mysterious illness: a Korean office worker in a grey suit and grey tie, hunched and reaching forward, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_suit_stairs` — 계단참 정장 남자

```
A person afflicted by a mysterious illness: a man in a navy suit with his tie twisted to his back, crouched low, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_apron` — 14층 앞치마 여자

```
A person afflicted by a mysterious illness: a middle-aged Korean woman in a kitchen apron with one yellow rubber glove, arms reaching forward, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_doyun` — 도윤

```
A person afflicted by a mysterious illness: a gentle-faced Korean man in his early 30s in a white dress shirt with a broken blue lanyard, face still recognizably kind, tragic rather than frightening, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_resident` — 주민 (일반)

```
A person afflicted by a mysterious illness: a Korean apartment resident in pajamas and a cardigan, arms raised, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_crawler` — 기어 오는 주민

```
A person afflicted by a mysterious illness: a person low on all fours moving toward the viewer, long messy hair, torn clothes, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_elder` — 노인

```
A person afflicted by a mysterious illness: an elderly Korean man in a fishing vest, slow and stooped, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_student` — 대학생

```
A person afflicted by a mysterious illness: a college student in a hoodie and headphones around the neck, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_guard` — 경비원

```
A person afflicted by a mysterious illness: an apartment security guard in a navy uniform and cap, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_rider` — 배달 라이더

```
A person afflicted by a mysterious illness: a delivery rider in a rain jacket with a helmet still on, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_nurse` — 간호사

```
A person afflicted by a mysterious illness: a hospital worker in scrubs and a face mask hanging from one ear, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_horyong` — 호룡 (보스)

```
A person afflicted by a mysterious illness: a massive Korean bodybuilder in a torn tank top, gym towel around the neck, one eye scarred shut, imposing bulk, ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, unsteady posture. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `enemy_pose_guide` — (참고) 동작 변형 붙이는 법

```
Same character as the previous image, now: pulling one arm back for a wide swipe / lunging forward with mouth open / both hands thrust forward to grab / head snapped back from a punch / falling backward. Portrait image (2:3), waist-up, facing the viewer straight on, transparent background, light from the right. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 5. 이벤트 그림 (1화~4화 결정적 장면)

### `cg_dawn_run` — 1화 — 새벽 달리기

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, in a black training outfit, jogging alone on a foggy apartment path at dawn, breath visible. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_eyepatch` — 1화 — 안대를 묶는 아침

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), tying the strap of her eyepatch in front of a fogged bathroom mirror, seen in the mirror reflection. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_door_handle` — 1화 — 열지 못한 문

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), her hand frozen on the lever handle of a steel front door, forehead against the door, eyes shut with tears. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_id_card` — 1화 — 사원증

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), kneeling in an apartment hallway, holding a staff ID card with a broken blue lanyard in both hands, head bowed. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_taping` — 1화 — 붕대 감기

```
Close-up of a woman’s hands wrapping white athletic tape around her knuckles, navy uniform sleeve, determined. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_wall_shoulder` — 1화 — 왼쪽은 벽에

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), both hands wrapped in white athletic tape, left shoulder pressed against a hallway wall, facing a steel fire door, ready. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_necktie` — 2화 — 넥타이 매듭

```
Close-up of hands tying a grey necktie in a tight sailor’s knot between a fire door handle and a fire hose cabinet handle. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_six_bottles` — 2화 — 생수 여섯 병

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), standing before an open, nearly empty refrigerator glowing in a dark kitchen, six water bottles inside. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_shadowbox` — 2화 — 새벽 네 시 섀도복싱

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, in a T-shirt, shadowboxing alone in a dark empty living room at 4 am, blue window light, motion lines. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_firedoor_face` — 2화 — 철망 유리창 너머

```
View from inside a hallway: a masked man’s eyes visible through the small wire-glass window of a fire door, blue pre-dawn light. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_stairs_back` — 3화 — 계단참의 그 사람

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), seen from behind at the top of a stairwell, looking down at a man in a white shirt standing on the landing below, looking up. Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants behind her. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_clinch` — 3화 — 클린치

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), holding a man in a white shirt in a boxing clinch on a stairwell landing, her face hidden against his shoulder, grief. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_cup_noodle` — 3화 — 컵라면

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), both hands wrapped in white athletic tape, eating cup noodles at a table with teary eyes, Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants across the table rolling a puzzle piece. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_wall_punch` — 3화 — 베란다 칸막이

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), throwing a straight punch into a thin balcony partition wall, white dust bursting. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_forest_balcony` — 4화 — 숲 같은 베란다

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), stepping through a broken wall into a balcony full of green plants, sunlight, awe. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_letter` — 4화 — 편지

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), sitting at a small study desk holding a handwritten letter with her fingertips, a small name tag on the desk, quiet afternoon light. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_track_zip` — 4화 — 트레이닝복

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, zipping up the jacket in front of an open wardrobe, staff ID card and name tag in her chest pocket. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_dinner` — 4화 — 장조림

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit and Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants with his mask down, eating rice and soy-braised beef together at a small table, quiet warmth. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_horyong_call` — 4화 — 아래층의 목소리

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, pulling the end of her hand tape tight with her teeth, standing at a stairwell railing looking down, determined. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_flash_belt` — 회상 — 챔피언 벨트

```
A 23-year-old Korean woman boxer raising a championship belt in a ring under spotlights, both eyes uncovered, her coach father in the corner not smiling. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_flash_harbor` — 회상 — 부두의 매듭

```
A 13-year-old Korean girl learning to tie a rope knot from her smiling father on a sunny harbor pier, warm sepia. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `cg_flash_rider` — 회상 — "맛있게 드세요, 챔피언"

```
Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, at her apartment door receiving a food delivery from a grinning yellow-haired rider, warm evening light. Wide landscape image (3:2), a single dramatic story illustration panel. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 6. 태리의 주먹 (1인칭, 투명 배경)

### `hud_fist_left` — 왼 주먹 — 교복

```
A woman's left fist and forearm rising from the bottom left corner in a boxing guard, wrapped in white athletic tape, navy uniform sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `hud_fist_right` — 오른 주먹 — 교복

```
A woman's right fist and forearm rising from the bottom right corner in a boxing guard, wrapped in white athletic tape, navy uniform sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `hud_fist_left_track` — 왼 주먹 — 트레이닝복

```
A woman's left fist and forearm rising from the bottom left corner in a boxing guard, wrapped in white athletic tape, black tracksuit sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `hud_fist_right_track` — 오른 주먹 — 트레이닝복

```
A woman's right fist and forearm rising from the bottom right corner in a boxing guard, wrapped in white athletic tape, black tracksuit sleeve, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `hud_fist_jab` — 뻗은 주먹 (잽)

```
A woman's taped fist punching straight forward away from the viewer, motion blur, first-person view. Square image, transparent background, the arm enters from the frame edge as described. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 7. 아이템 아이콘 (투명 배경)

글자가 들어가는 물건은 비워 두고 게임에서 글자를 얹는다.

### `item_idcard` — 도윤의 사원증

```
A staff ID card with a small photo of a shy smiling man, broken blue lanyard, a dark smudge on one corner. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_letter` — 도윤의 편지

```
An opened white envelope with a handwritten letter folded half out, illegible neat handwriting. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_nametag` — 명찰 '1-3 강태리'

```
A small rectangular school name tag pin with a blank white plate and navy border. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_tape` — 압박 붕대

```
A roll of white athletic tape with the end unrolled. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_eyepatch` — 검은 안대

```
A black leather eyepatch with a thin strap. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_backpack` — 분홍 백팩

```
A pink school backpack. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_shoebag` — 분홍 실내화 주머니

```
A pink drawstring shoe bag. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_phone` — 휴대폰

```
A smartphone lying face down with a cracked case. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_water` — 생수 한 병

```
A plastic bottle of water, half full. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_water6` — 생수 여섯 병

```
Six plastic water bottles in a row. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_cupnoodle` — 컵라면

```
A cup of instant noodles with the lid peeled back and steam rising. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_ramen` — 라면 봉지

```
A bundle of five instant ramen packets with plain red wrappers. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_tuna` — 참치캔

```
Three small cans of tuna stacked. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_ham` — 햄 통조림

```
Two cans of luncheon meat. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_rice` — 즉석밥

```
A stack of microwavable rice bowls. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_jangjorim` — 장조림 한 통

```
A food container of soy-braised beef with quail eggs, masking tape label on the lid left blank. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_seaweed` — 불린 미역

```
A bowl of soaked seaweed with masking tape label on the side left blank. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_rice_bag` — 쌀 반 포대

```
A half-used sack of rice. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_extinguisher` — 소화기

```
A red fire extinguisher. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_necktie` — 회색 넥타이

```
A grey necktie neatly folded. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_firstaid` — 구급상자

```
An open first aid kit with bandages, gauze and scissors. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_painkiller` — 진통제

```
A small blister pack of pills. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_thermometer` — 체온계

```
A digital thermometer. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_flashlight` — 손전등

```
A black flashlight switched on. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_battery` — 건전지

```
A handful of AA batteries. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_radio` — 휴대용 라디오

```
A small portable battery radio with an antenna. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_keys` — 열쇠 꾸러미

```
A ring of building master keys with plastic tags left blank. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_rope` — 밧줄

```
A coil of rope. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_puzzle` — 수평선 퍼즐 조각

```
A single jigsaw puzzle piece showing part of a blue sea horizon. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_catfood` — 고양이 사료

```
A small bag of cat food and a metal bowl. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_watering_can` — 물뿌리개

```
A green watering can half full of water. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_photo` — 단체 사진

```
A printed group photo of office coworkers pinned with a thumbtack, faces small and smiling. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_belt` — 챔피언 벨트

```
A boxing championship belt with a plain gold center plate, no lettering. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_gloves` — 낡은 글러브

```
A pair of worn red boxing gloves tied together by the laces. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_mitts` — 아빠의 미트

```
A pair of worn black focus mitts. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_tracksuit` — 검은 트레이닝복

```
A black zip-up tracksuit jacket folded, small red stitching on the back. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `item_uniform_bag` — 비닐에 넣은 교복

```
A navy sailor-collar school uniform sealed in a clear plastic bag, tied twice. Square image, a single object centered with a soft shadow, transparent background, game item icon. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

## 8. UI · 타이틀

### `title_key` — 타이틀 키 아트

```
Wide 16:9 key art. Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a black zip-up tracksuit, both hands wrapped in white athletic tape, standing in a dark apartment emergency stairwell seen from slightly below, a staff ID card with a blue lanyard in her chest pocket, green emergency light from above, many pale reaching hands far below in the spiral stairwell, dust haze. Composition weighted to the right, empty dark space on the left third for a title. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `title_key_ch1` — 타이틀 키 아트 — 교복

```
Wide 16:9 key art. Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye, wearing a navy sailor-collar school uniform with a red ribbon (she is an adult who enrolled in high school late), both hands wrapped in white athletic tape, standing in a dark apartment stairwell seen from slightly below, green emergency light from above, pale reaching hands far below. Composition weighted to the right, empty dark space on the left third. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `title_bg_loop` — 타이틀 배경 (인물 없음)

```
Wide 16:9 image. A Korean apartment tower at night in sea fog, a single lit window on the 15th floor, empty sky on the left half. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `chapter_card_bg` — 화 제목 카드 배경

```
Wide 16:9 image. A dark concrete wall texture with a faint green emergency light glow from below, empty center for a chapter title. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `textbox_frame` — 글상자 테두리

```
Wide 5:1 image. A dark semi-transparent dialogue box frame for a game UI, thin worn steel edge with a subtle red accent line at the top, empty interior, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `phone_frame` — 휴대폰 화면 틀

```
Portrait 9:16 image. A smartphone held in a hand, the screen area plain dark grey and empty, transparent background around the hand. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `map_complex` — 단지 지도

```
Square image. A top-down illustrated map of a Korean apartment complex beside the sea: eight apartment towers, a main gate, a guard booth, a playground, a parking lot, a strip of shops, a management office, a walking path. Building labels left blank. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `map_103_section` — 103동 단면도

```
Portrait 2:3 image. A cutaway cross-section illustration of a 15-floor Korean apartment tower showing each floor, the central stairwell and elevator shaft, rooftop and basement, floor numbers left blank. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `icon_set_menu` — 메뉴 아이콘

```
Square image. A set of six flat game UI icons in a 3x2 grid on a transparent background: a door, a fist, a bandage roll, a backpack, a map, a gear. Thin white line style with a red accent. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fx_hit` — 타격 이펙트

```
Square image. A comic-style impact burst effect, white and orange, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fx_dodge` — 회피 이펙트

```
Square image. A comic-style swoosh motion effect, pale blue streaks, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```

### `fx_dark_left` — 왼쪽 시야 어둠

```
Wide 16:9 image. A soft black vignette covering the left third of the frame and fading out to fully transparent on the right, transparent background. Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, muted cold palette of concrete grey and night navy with small warm orange and deep red accents, cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.
```
