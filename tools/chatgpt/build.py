#!/usr/bin/env python3
"""ChatGPT(이미지 생성)용 프롬프트 모음을 만든다 → docs/chatgpt-prompts.md

    python tools/chatgpt/build.py

프롬프트는 이 파일의 목록에서 고친다. 만들 때 검열에 걸리기 쉬운 단어가 있으면 멈춘다.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / 'docs' / 'chatgpt-prompts.md'

STYLE = ('Style: Korean webtoon (manhwa) illustration, semi-realistic, clean ink lines, soft cel shading, '
         'muted cold palette of concrete grey and night navy with small warm orange and deep red accents, '
         'cinematic lighting, quiet tense mood. No text, no letters, no logos, no watermark.')

# 종류별: (ChatGPT에 요청할 크기, 프롬프트 끝에 붙일 지시, 게임에 넣을 때)
KINDS = {
    'bg':       ('1536x1024 가로', 'Wide landscape image (3:2). An empty location with no people unless described. '
                 'Keep the important content in the middle horizontal band, since the top and bottom will be cropped.',
                 '가운데 띠를 1920×760으로 잘라 쓴다'),
    'fight':    ('1536x1024 가로', 'Wide landscape image (3:2). First-person eye-level view as if standing there. '
                 'No people. The left third of the image fades into deep shadow.',
                 '1920×1080으로 잘라 쓴다'),
    'cg':       ('1536x1024 가로', 'Wide landscape image (3:2), a single dramatic story illustration panel.',
                 '이벤트 그림. 1920×1080으로 잘라 쓴다'),
    'sheet':    ('1536x1024 가로', 'Character reference sheet on a plain light grey background, full body, '
                 'consistent proportions across views.', '다른 그림을 뽑을 때 레퍼런스로 올린다'),
    'portrait': ('1024x1536 세로', 'Portrait image (2:3), waist-up, facing slightly toward the viewer, '
                 'transparent background.', '대화창 옆 서 있는 그림'),
    'enemy':    ('1024x1536 세로', 'Portrait image (2:3), waist-up, facing the viewer straight on, '
                 'transparent background, light from the right.', '1인칭 싸움 상대'),
    'item':     ('1024x1024 정사각', 'Square image, a single object centered with a soft shadow, '
                 'transparent background, game item icon.', '아이템 아이콘'),
    'hud':      ('1024x1024 정사각', 'Square image, transparent background, the arm enters from the frame edge as described.',
                 '1인칭 화면 아래 주먹'),
    'ui':       ('주제별', '', 'UI'),
}

TAERI = ('Kang Taeri, a 27-year-old adult Korean woman and retired boxing champion, lean athletic build, '
         'short black hair in a low ponytail, black leather eyepatch over her left eye, calm tired right eye')
TAERI_UNI = TAERI + (', wearing a navy sailor-collar school uniform with a red ribbon '
                     '(she is an adult who enrolled in high school late)')
TAERI_TRACK = TAERI + ', wearing a black zip-up tracksuit'
HANDS = 'both hands wrapped in white athletic tape'
SEHUN = 'Jung Sehun, a tall thin Korean man around 30, ER nurse, white face mask, navy padded jacket, scrub pants'
HORYONG = 'Ma Horyong, a loud Korean gym owner in his 40s, huge muscular build, buzz cut, sleeveless tank top'
DOYUN = 'Han Doyun, a gentle Korean man in his early 30s, eyes that curve into half-moons when he smiles, white dress shirt'
DAD = "Taeri's father, a Korean boxing coach in his late 50s, weathered stern face, grey crew cut, faded windbreaker"
ILL = ('ashen grey skin, deeply reddened eyes with tiny pupils, vacant expression, dark rust-brown stains on the clothes, '
       'unsteady posture')

# (id, 한국어 설명, 종류, 프롬프트)
SECTIONS: list[tuple[str, str, list[tuple[str, str, str, str]]]] = []


def sec(title: str, note: str, items):
    SECTIONS.append((title, note, items))


# ───────────────────────── 1. 캐릭터 기준 시트
sec('1. 캐릭터 기준 시트', '가장 먼저 뽑는다. 마음에 드는 그림을 이후 대화에 올리고 "이 인물과 같게"라고 붙인다.', [
    ('char_taeri_uniform', '태리 — 교복', 'sheet', f'Front, side and back views of {TAERI_UNI}, pleated navy skirt, pink backpack, {HANDS}.'),
    ('char_taeri_track', '태리 — 검은 트레이닝복', 'sheet', f'Front, side and back views of {TAERI_TRACK}, small red embroidered stitching on the back, {HANDS}, relaxed boxer stance with chin tucked.'),
    ('char_taeri_young', '태리 — 현역 시절 (회상)', 'sheet', 'Front and side views of a 23-year-old Korean woman boxer at her peak, both eyes uncovered, short black ponytail, red boxing shorts and black top, red gloves, confident.'),
    ('char_doyun', '도윤 — 평소', 'sheet', f'Front and side views of {DOYUN}, navy slacks, blue lanyard with a staff ID card, holding a stack of parcels, shy smile.'),
    ('char_doyun_ill', '도윤 — 발병 후', 'sheet', f'Front and side views of the same man as before, now ill: {ILL}, shirt collar stained, broken blue lanyard, one shoe missing and a worn grey sock.'),
    ('char_sehun', '세훈', 'sheet', f'Front and side views of {SEHUN}, holding a red fire extinguisher, calm clinical posture.'),
    ('char_horyong', '호룡 — 평소', 'sheet', f'Front and side views of {HORYONG}, track pants, gym towel around the neck, a scar over one closed eye, big grin.'),
    ('char_horyong_ill', '호룡 — 발병 후', 'sheet', f'Front view of the same muscular gym owner, now ill: {ILL}, torn tank top, towel still around the neck.'),
    ('char_dad', '아빠', 'sheet', f'Front and side views of {DAD}, focus mitts under one arm.'),
    ('char_dad_young', '아빠 — 젊은 시절 (회상)', 'sheet', 'Front view of a Korean boxing coach in his 40s, firm build, black hair, windbreaker, holding focus mitts, slight smile, harbor background hint.'),
    ('char_rider', '노란 머리 배달 라이더', 'sheet', 'Front and side views of a cheerful young Korean delivery rider with dyed yellow hair, helmet under arm, insulated delivery backpack, rain jacket.'),
    ('char_canteen', '매점 아주머니', 'sheet', 'Front view of a warm Korean woman in her 50s who runs a school snack shop, apron, cardigan, permed hair.'),
    ('char_guard', '경비 아저씨', 'sheet', 'Front view of an elderly Korean apartment security guard in a navy uniform and cap, kind face.'),
    ('char_neighbors', '103동 주민들 (단역 모음)', 'sheet', 'A lineup of six ordinary Korean apartment residents of different ages: an elderly woman with a cane, a middle-aged man in a cardigan, a young mother, a college student in a hoodie, an office worker in a suit, a retired man in a fishing vest. Plain grey background.'),
])

# ───────────────────────── 2. 대화용 서 있는 그림
P = []
for k, ko, d in [('neutral', '무표정', 'neutral calm expression'), ('sad', '슬픔', 'eyes lowered, holding back tears'),
                 ('angry', '분노', 'jaw clenched, fierce glare'), ('determined', '결의', 'steady determined look'),
                 ('tired', '지침', 'exhausted, slightly slumped'), ('smile', '옅은 웃음', 'a small faint smile')]:
    P.append((f'pt_taeri_track_{k}', f'태리(트레이닝복) — {ko}', 'portrait', f'{TAERI_TRACK}, {HANDS}, {d}.'))
for k, ko, d in [('neutral', '무표정', 'neutral calm expression'), ('sad', '슬픔', 'eyes lowered, holding back tears'),
                 ('startled', '놀람', 'startled, eye wide')]:
    P.append((f'pt_taeri_uni_{k}', f'태리(교복) — {ko}', 'portrait', f'{TAERI_UNI}, {d}.'))
for k, ko, d in [('neutral', '무표정', 'mask on, neutral clinical look'), ('serious', '단호', 'mask on, stern serious look'),
                 ('unmasked', '마스크 내림', 'mask pulled down to the chin, tired face'), ('soft', '누그러짐', 'mask on, eyes softened')]:
    P.append((f'pt_sehun_{k}', f'세훈 — {ko}', 'portrait', f'{SEHUN}, {d}.'))
for k, ko, d in [('grin', '호탕', 'big confident grin'), ('shout', '외침', 'shouting with fists raised'), ('serious', '진지', 'serious, catching his breath')]:
    P.append((f'pt_horyong_{k}', f'호룡 — {ko}', 'portrait', f'{HORYONG}, gym towel around the neck, {d}.'))
P += [('pt_doyun_smile', '도윤 — 웃음 (회상)', 'portrait', f'{DOYUN}, blue lanyard, warm half-moon smile, soft warm light.'),
      ('pt_doyun_shy', '도윤 — 머쓱함 (회상)', 'portrait', f'{DOYUN}, scratching the back of his head, awkward smile, holding a parcel.'),
      ('pt_dad_stern', '아빠 — 엄함 (회상)', 'portrait', f'{DAD}, stern look, arms crossed, muted sepia tint.'),
      ('pt_dad_smile', '아빠 — 웃음 (회상)', 'portrait', f'{DAD}, rare gentle smile at a harbor, muted sepia tint.'),
      ('pt_rider', '배달 라이더', 'portrait', 'A cheerful young Korean delivery rider with dyed yellow hair, helmet under arm, handing over a food bag with a grin.')]
sec('2. 대화용 서 있는 그림 (투명 배경)', '대사 장면에서 글상자 옆에 세운다. 캐릭터 시트를 같이 올리고 뽑는다.', P)

# ───────────────────────── 3. 배경
B = lambda i, ko, p: (i, ko, 'bg', p)  # noqa: E731
sec('3-1. 배경 — 한마음 아파트 단지 바깥', '', [
    B('bg_complex_dawn', '단지 전경 — 새벽 해무', 'A Korean high-rise apartment complex at dawn before sunrise, dense sea fog rolling low between the towers, a few warm windows lit, distant red emergency light glow at the main gate, dark sea on the horizon.'),
    B('bg_complex_day', '단지 전경 — 낮 (발병 이후)', 'A Korean high-rise apartment complex on an overcast afternoon, abandoned cars parked at odd angles, laundry left on balconies, eerily quiet.'),
    B('bg_complex_night', '단지 전경 — 정전된 밤', 'A Korean high-rise apartment complex at night during a blackout, almost every window dark, only a few candle-lit windows, moonlight on the towers.'),
    B('bg_complex_rain', '단지 전경 — 비', 'A Korean apartment complex in heavy rain, puddles reflecting grey towers, rain streaks, gloomy.'),
    B('bg_103_exterior', '103동 외관', 'A single tall Korean apartment tower seen from the ground, 15 floors, rows of balconies, a building number plate area left blank, grey sky.'),
    B('bg_gate', '단지 정문', 'The main gate of a Korean apartment complex, raised barrier arm, empty guard booth, a fallen bicycle, scattered leaflets.'),
    B('bg_guardbooth', '103동 경비실', 'A small apartment security guard booth at dawn, light on inside, empty chair, a thermos and logbook on the desk, a dark stain on the flowerbed curb outside.'),
    B('bg_walkpath', '단지 둘레길', 'A jogging path circling an apartment complex, lined with trees and benches, morning fog.'),
    B('bg_playground', '단지 놀이터', 'An empty apartment complex playground at dusk, a still swing, a slide, scattered toys, long shadows.'),
    B('bg_parking_ground', '지상 주차장 (고양이 밥 주던 곳)', 'An outdoor apartment parking lot corner, small bowls of cat food by a wall, two stray cats, parked cars.'),
    B('bg_parking_under', '지하 주차장', 'A dim underground apartment parking garage, flickering fluorescent tubes, concrete pillars with painted numbers left blank, parked cars, deep shadows.'),
    B('bg_mgmt_office', '관리사무소', 'An apartment management office, desks with papers, a wall of CCTV monitors mostly dark, key cabinet, notice board.'),
    B('bg_broadcast_room', '관리사무소 방송실', 'A small broadcasting booth inside an apartment management office, a microphone on a stand, an old amplifier panel, a chair knocked over.'),
    B('bg_recycling', '분리수거장', 'An apartment recycling collection area with bins and stacked cardboard, overflowing bags, a stray cat.'),
    B('bg_mall', '단지 상가 거리', 'A small strip of shops in an apartment complex: convenience store, laundry, small mart, all shutters half down, empty street.'),
    B('bg_conv_store', '상가 편의점 안', 'Inside a small Korean convenience store, shelves partly emptied, fallen snack bags, refrigerator doors glowing, counter abandoned.'),
    B('bg_senior_center', '경로당', 'Inside a Korean apartment senior community room, floor cushions, a TV, a tea table, a calendar on the wall.'),
    B('bg_community_gym', '단지 커뮤니티 헬스장', 'An apartment complex fitness room with treadmills and weight machines, mirrors on the wall, lights off, morning light through blinds.'),
    B('bg_rooftop', '103동 옥상', 'The rooftop of an apartment tower, water tank, railings, antennas, a wide view of the city and the sea, wind.'),
    B('bg_rooftop_night', '103동 옥상 — 밤', 'The rooftop of an apartment tower at night, the dark city below with a few fires glowing far away, stars, wind.'),
    B('bg_water_tank', '옥상 물탱크실', 'A rooftop water tank room, large blue tanks, pipes and valves, a single bulb.'),
])
sec('3-2. 배경 — 103동 안 (공용 공간)', '', [
    B('bg_lobby', '1층 로비', 'The ground floor lobby of a Korean apartment tower, glass entrance door with a keypad, mailboxes on the wall, elevator doors, scattered flyers.'),
    B('bg_mailboxes', '1층 우편함', 'A wall of apartment mailboxes, some stuffed with uncollected mail, a delivery parcel on the floor.'),
    B('bg_elevator_in', '엘리베이터 안', 'Inside a small apartment elevator, mirror wall, floor buttons panel, harsh light, a mirror crack.'),
    B('bg_elevator_hall', '엘리베이터 홀', 'An apartment floor elevator landing, two elevator doors, floor indicator, a potted plant.'),
    B('bg_hall15', '15층 복도', 'A 15th floor apartment hallway: elevator, three steel unit doors, a fire door with a small wire-glass window, a fire hose cabinet, flickering fluorescent light, a dark stain near the elevator.'),
    B('bg_hall15_night', '15층 복도 — 정전', 'The same apartment hallway in a blackout, only a green emergency exit sign glowing, deep shadows.'),
    B('bg_hall_generic', '다른 층 복도', 'An apartment hallway with steel doors, some doors left ajar, a shoe left on the floor, notices taped to a door.'),
    B('bg_hall_barricade', '바리케이드 친 복도', 'An apartment hallway blocked with stacked furniture, a shoe cabinet and mattresses as a barricade, tied with rope.'),
    B('bg_stair_landing', '계단참', 'A narrow apartment emergency stairwell landing, concrete steps, metal handrail, green emergency light, deep shadows.'),
    B('bg_stair_down', '난간 틈으로 내려다본 나선 계단', 'Top-down view through the gap of a tall spiral stairwell, floors descending into darkness, many pale hands gripping the railings far below.'),
    B('bg_stair_up', '올려다본 계단', 'Looking up a tall apartment stairwell from below, spiral railings rising into dim light.'),
    B('bg_firedoor', '넥타이로 묶은 방화문', 'Close view of a steel fire door with a small wire-mesh glass window, a grey necktie tied tight between the door handle and the fire hose cabinet handle, blue pre-dawn light, a faint masked silhouette behind the glass.'),
    B('bg_firedoor_closed', '방화문 — 계단 쪽', 'A steel fire door seen from the stairwell side, a push bar, scuff marks, green emergency light.'),
    B('bg_floor11', '11층 계단 입구', 'An apartment stairwell entrance on the 11th floor, the fire door wide open, a gym bag on the floor, fluorescent light.'),
    B('bg_machine_room', '지하 기계실', 'An apartment basement machine room with an electrical panel, generators, pipes, warning lights, a flashlight beam.'),
    B('bg_rooftop_door', '옥상 출입문', 'The top of an apartment stairwell with a metal rooftop door, daylight leaking around the edges, a padlock hanging open.'),
])
sec('3-3. 배경 — 세대 안', '', [
    B('bg_1502_door', '1502호 현관 안쪽', 'Inside view of a Korean apartment front door: heavy grey steel door, digital lock with lever handle, small peephole, shoe rack, a pink backpack by the door.'),
    B('bg_1502_living', '1502호 거실', 'A bare bachelor apartment living room, almost no furniture, a sofa, stacked delivery containers, a single championship belt case on a shelf, curtains half drawn.'),
    B('bg_1502_living_night', '1502호 거실 — 밤', 'The same bare living room at night with lights off, city glow through the balcony windows, a half-empty water bottle on the floor.'),
    B('bg_1502_kitchen', '1502호 빈 냉장고', 'A small kitchen with the refrigerator open and glowing, nearly empty shelves: six water bottles, one shriveled lemon, two snack packets, a salt tub.'),
    B('bg_1502_bath', '1502호 욕실', 'A small apartment bathroom, fogged mirror with one palm-wiped clear streak, a black leather eyepatch and a red ribbon on the sink.'),
    B('bg_1502_bath_water', '물 받은 욕조', 'A bathtub filled to the brim with water, eleven plastic food containers filled with water lined up on the floor.'),
    B('bg_1502_bedroom', '1502호 침실', 'A plain bedroom, a single bed, a boxing poster rolled up in the corner, a folded school uniform on a chair.'),
    B('bg_1502_balcony', '1502호 베란다 칸막이', 'An apartment balcony, laundry rack pushed aside revealing a thin gypsum partition wall to the next unit, grey morning.'),
    B('bg_peephole_1', '외시경 — 문 앞의 도윤', 'Fisheye peephole view of an apartment hallway in a circular frame, black outside the circle, a man in a stained white shirt standing very close to the door with his head lowered.'),
    B('bg_peephole_2', '외시경 — 1501호 남자', 'Fisheye peephole view of an apartment hallway in a circular frame, black outside the circle, a man in a suit crouched near the elevator, a staff ID card with a broken blue lanyard on the floor.'),
    B('bg_1503_balcony', '1503호 베란다 숲', 'A broken gypsum wall with a hole, through it a balcony full of potted green plants like a small forest, soft daylight, dust in the air.'),
    B('bg_1503_living', '1503호 거실 (살펴보기)', 'A warm lived-in apartment living room, left to right: seven monstera pots with white name stakes, a watering can and a cat food bag; a cork board with photos and sticky notes; a refrigerator; a kitchen cupboard; a doorway to a small study.'),
    B('bg_1503_fridge', '1503호 냉장고 안', 'Inside a refrigerator full of neatly stacked side-dish containers, each lid labeled with masking tape, a bowl of soaked seaweed.'),
    B('bg_1503_study', '1503호 서재', 'A small study, a bookshelf of worn exam books, a desk with a white envelope and a small name tag, desk lamp, afternoon light.'),
    B('bg_1503_closet', '옷장', 'An open wardrobe, a black tracksuit in a plastic cover at the very back, a school uniform being sealed in a plastic bag.'),
    B('bg_1503_dining', '장조림 식탁', 'A small dining table, two bowls of rice, one container of soy-braised beef with five quail eggs, chopsticks, dim warm light.'),
    B('bg_1208', '세훈의 1208호', 'A sparse tidy dining room, medical textbooks on the table, an unfinished seascape jigsaw puzzle with the horizon section missing, two cup noodles steaming, an open first aid kit.'),
    B('bg_1208_night', '1208호 — 밤', 'The same tidy room at night, a single desk lamp, the unfinished seascape puzzle, a nurse jacket on the chair.'),
    B('bg_1114', '호룡의 1114호', 'A messy apartment turned into a home gym: barbell rack, dumbbells, protein tubs, trophies, a punching bag hanging from the ceiling.'),
    B('bg_1501', '1501호 (이웃집)', 'A neat apartment entryway of an office worker, a briefcase by the door, a coat rack with a grey tie, family photo on the shoe cabinet.'),
    B('bg_unit_messy', '버려진 세대', 'An abandoned apartment living room in disarray, overturned chairs, open drawers, curtains blowing from an open balcony door.'),
    B('bg_unit_elder', '할머니 세대', "An elderly woman's apartment living room, floor cushions, framed family photos, a small altar, potted chili plants on the balcony."),
    B('bg_unit_family', '아이 있는 세대', "A family apartment living room with a child's drawings on the fridge, a small tent made of blankets, toys neatly put away, quiet."),
    B('bg_shelter_room', '주민 임시 대피 세대', 'An apartment living room converted into a shared shelter, sleeping mats lined up, a table with water bottles and canned food sorted, a whiteboard with blank lines.'),
])
sec('3-4. 배경 — 동구시', '대본에 이름이 나온 장소와, 바깥으로 나가면 필요할 곳.', [
    B('bg_coast_road', '동구시 해안도로', 'A coastal road in a Korean port city, sea on one side, apartment towers on the other, abandoned cars, overcast.'),
    B('bg_city_street', '동구시 시내 거리', 'A Korean downtown street after an evacuation, cars abandoned with doors open, shop shutters down, a fallen traffic cone, empty.'),
    B('bg_city_night', '동구시 시내 — 밤', 'A Korean downtown street at night during a blackout, only a few neon signs flickering, wet asphalt.'),
    B('bg_bus_stop', '버스 정류장', 'A Korean bus stop shelter, an empty bench, a route map panel left blank, a forgotten umbrella.'),
    B('bg_police_line', '경찰 통제선', 'A street blocked by police barricades and orange cones, an empty police car with its lights off, scattered flyers.'),
    B('bg_mart', '동네 마트', 'Inside a neighborhood supermarket, half-empty shelves, an overturned cart, flickering lights.'),
    B('bg_pharmacy', '약국', 'Inside a small Korean pharmacy, medicine shelves behind a counter, some boxes fallen, a closed sign on the door.'),
    B('bg_harbor', '동구항 부두', 'A Korean fishing harbor pier, moored boats, coiled ropes and bollards, gulls, grey sea.'),
    B('bg_harbor_flash', '동구항 부두 — 회상', 'A Korean fishing harbor pier on a warm sunny day, ropes and bollards, soft nostalgic sepia light.'),
    B('bg_fish_market', '수협 공판장 (보호시설)', 'A large fish auction hall converted into an emergency shelter, rows of cots and blankets, plastic crates, relief supply boxes.'),
    B('bg_civic_gym', '동구시민체육관 (보호시설)', 'A city sports arena floor used as an emergency shelter, rows of cots, partition tents, supply tables, high ceiling lights.'),
    B('bg_hospital_er', '한마음대학병원 응급실', 'A hospital emergency room in chaos, empty stretchers in the hallway, curtains drawn, monitors off, scattered gloves.'),
    B('bg_hospital_hall', '병원 복도', 'A long hospital corridor at night, flickering lights, wheelchairs left against the wall, an exit sign glowing.'),
    B('bg_bridge', '동구시 다리', 'A long bridge out of a Korean port city, cars jammed and abandoned, a military checkpoint at the far end, overcast.'),
])
sec('3-5. 배경 — 백합여자고등학교', '학생이 위험에 처한 모습은 검열에 걸리기 쉬우니, 학교 배경은 사람 없이 뽑는다.', [
    B('bg_school_gate', '정문', 'The front gate of a Korean high school, a banner frame left blank, cherry trees, empty.'),
    B('bg_school_yard', '운동장', 'A Korean high school sports field with the main building behind, empty, overcast.'),
    B('bg_school_gym_ready', '체육관 — 입학식 준비', 'A school gymnasium set up for an entrance ceremony, rows of folding chairs, a stage with flowers, empty.'),
    B('bg_school_gym_shelter', '체육관 — 보호시설', 'A school gymnasium converted into an emergency shelter, folding chairs pushed aside, mats and blankets on the floor, supply boxes.'),
    B('bg_school_class', '1학년 3반 교실', 'A Korean high school classroom, rows of desks, a chalkboard left blank, spring light through windows.'),
    B('bg_school_hall', '학교 복도', 'A Korean high school corridor with lockers and classroom doors, empty, late afternoon light.'),
    B('bg_school_office', '행정실', 'A school administration office, desks with files and a window facing the gymnasium, a staff ID lanyard hook on the wall.'),
    B('bg_school_store', '매점', 'A small school snack shop counter with snacks and stationery, name tags on a display stand, shutter half down.'),
    B('bg_school_roof', '학교 옥상', 'The rooftop of a school building, railings, a view of the port city and the sea.'),
])
sec('3-6. 배경 — 회상', '', [
    B('bg_flash_boxing_gym', '아빠의 복싱 체육관', 'An old Korean boxing gym, a worn ring, heavy bags, faded posters left blank, sunlight through dusty windows, sepia tone.'),
    B('bg_flash_ring', '챔피언전 링', 'A professional boxing ring under bright spotlights, a cheering crowd blurred in the dark, ropes glowing, dramatic.'),
    B('bg_flash_locker', '시합 대기실', 'A boxing locker room before a fight, a bench with gloves and tape, a tracksuit folded in a bag, fluorescent light.'),
    B('bg_flash_eye_clinic', '안과 진찰실', 'An eye clinic examination room, a slit lamp machine, an eye chart on the wall left blank, cold light.'),
    B('bg_flash_school15', '열다섯 살의 학교 복도', 'A middle school corridor in spring, sepia nostalgic tone, an empty hallway and a teacher’s office door.'),
    B('bg_flash_rejection', '불합격 문자를 받던 방', 'A dim apartment room, a phone lying face up on the floor with a glowing blank screen, crumpled resumes, night.'),
])

# ───────────────────────── 4. 싸움 배경 (1인칭)
F = lambda i, ko, p: (i, ko, 'fight', p)  # noqa: E731
sec('4. 싸움 배경 (1인칭)', '태리의 왼쪽 눈은 보이지 않아서 왼쪽 ⅓을 어둡게 뽑는다.', [
    F('fight_hall', '15층 복도', 'An apartment hallway toward the elevator, steel doors on both sides, fluorescent light.'),
    F('fight_stairs', '계단참', 'A stairwell landing looking down the steps, metal railing on the right, concrete wall on the left, green emergency light.'),
    F('fight_room', '새벽 거실 (섀도복싱)', 'An empty dark living room at 4 am, furniture pushed to the walls, faint blue window light.'),
    F('fight_wall', '베란다 칸막이', 'Facing a thin gypsum balcony partition wall up close, a laundry rack beside it.'),
    F('fight_elevator', '엘리베이터 홀', 'An elevator landing, elevator doors half open with darkness inside.'),
    F('fight_lobby', '1층 로비', 'An apartment ground floor lobby, glass doors, mailboxes, scattered flyers.'),
    F('fight_parking', '지하 주차장', 'An underground parking garage between concrete pillars, flickering lights.'),
    F('fight_rooftop', '옥상', 'An apartment rooftop with railings and a water tank, windy grey sky.'),
    F('fight_gym', '1114호 홈짐', 'An apartment home gym, weight racks and a hanging punching bag.'),
    F('fight_school_gym', '학교 체육관', 'A school gymnasium floor with folding chairs scattered.'),
    F('fight_street', '거리', 'A city street between abandoned cars, overcast.'),
    F('fight_harbor', '부두', 'A harbor pier with ropes and bollards, grey sea.'),
])

# ───────────────────────── 5. 싸움 상대
E = []
for i, ko, d in [
    ('enemy_suit1501', '1501호 남자', 'a Korean office worker in a grey suit and grey tie, hunched and reaching forward'),
    ('enemy_suit_stairs', '계단참 정장 남자', 'a man in a navy suit with his tie twisted to his back, crouched low'),
    ('enemy_apron', '14층 앞치마 여자', 'a middle-aged Korean woman in a kitchen apron with one yellow rubber glove, arms reaching forward'),
    ('enemy_doyun', '도윤', 'a gentle-faced Korean man in his early 30s in a white dress shirt with a broken blue lanyard, face still recognizably kind, tragic rather than frightening'),
    ('enemy_resident', '주민 (일반)', 'a Korean apartment resident in pajamas and a cardigan, arms raised'),
    ('enemy_crawler', '기어 오는 주민', 'a person low on all fours moving toward the viewer, long messy hair, torn clothes'),
    ('enemy_elder', '노인', 'an elderly Korean man in a fishing vest, slow and stooped'),
    ('enemy_student', '대학생', 'a college student in a hoodie and headphones around the neck'),
    ('enemy_guard', '경비원', 'an apartment security guard in a navy uniform and cap'),
    ('enemy_rider', '배달 라이더', 'a delivery rider in a rain jacket with a helmet still on'),
    ('enemy_nurse', '간호사', 'a hospital worker in scrubs and a face mask hanging from one ear'),
    ('enemy_horyong', '호룡 (보스)', 'a massive Korean bodybuilder in a torn tank top, gym towel around the neck, one eye scarred shut, imposing bulk'),
]:
    E.append((i, ko, 'enemy', f'A person afflicted by a mysterious illness: {d}, {ILL}.'))
E.append(('enemy_pose_guide', '(참고) 동작 변형 붙이는 법', 'enemy',
          'Same character as the previous image, now: pulling one arm back for a wide swipe / lunging forward with mouth open / both hands thrust forward to grab / head snapped back from a punch / falling backward.'))
sec('5. 싸움 상대 (투명 배경)', '같은 대화에서 원본을 뽑은 뒤, 마지막 항목처럼 "같은 인물, 이번엔 ~" 으로 동작 변형을 뽑는다.', E)

# ───────────────────────── 6. 이벤트 그림
C = lambda i, ko, p: (i, ko, 'cg', p)  # noqa: E731
sec('6. 이벤트 그림 (1화~4화 결정적 장면)', '', [
    C('cg_dawn_run', '1화 — 새벽 달리기', f'{TAERI}, in a black training outfit, jogging alone on a foggy apartment path at dawn, breath visible.'),
    C('cg_eyepatch', '1화 — 안대를 묶는 아침', f'{TAERI_UNI}, tying the strap of her eyepatch in front of a fogged bathroom mirror, seen in the mirror reflection.'),
    C('cg_door_handle', '1화 — 열지 못한 문', f'{TAERI_UNI}, her hand frozen on the lever handle of a steel front door, forehead against the door, eyes shut with tears.'),
    C('cg_id_card', '1화 — 사원증', f'{TAERI_UNI}, kneeling in an apartment hallway, holding a staff ID card with a broken blue lanyard in both hands, head bowed.'),
    C('cg_taping', '1화 — 붕대 감기', f'Close-up of a woman’s hands wrapping white athletic tape around her knuckles, navy uniform sleeve, determined.'),
    C('cg_wall_shoulder', '1화 — 왼쪽은 벽에', f'{TAERI_UNI}, {HANDS}, left shoulder pressed against a hallway wall, facing a steel fire door, ready.'),
    C('cg_necktie', '2화 — 넥타이 매듭', 'Close-up of hands tying a grey necktie in a tight sailor’s knot between a fire door handle and a fire hose cabinet handle.'),
    C('cg_six_bottles', '2화 — 생수 여섯 병', f'{TAERI_UNI}, standing before an open, nearly empty refrigerator glowing in a dark kitchen, six water bottles inside.'),
    C('cg_shadowbox', '2화 — 새벽 네 시 섀도복싱', f'{TAERI}, in a T-shirt, shadowboxing alone in a dark empty living room at 4 am, blue window light, motion lines.'),
    C('cg_firedoor_face', '2화 — 철망 유리창 너머', f'View from inside a hallway: a masked man’s eyes visible through the small wire-glass window of a fire door, blue pre-dawn light.'),
    C('cg_stairs_back', '3화 — 계단참의 그 사람', f'{TAERI_UNI}, seen from behind at the top of a stairwell, looking down at a man in a white shirt standing on the landing below, looking up. {SEHUN} behind her.'),
    C('cg_clinch', '3화 — 클린치', f'{TAERI_UNI}, holding a man in a white shirt in a boxing clinch on a stairwell landing, her face hidden against his shoulder, grief.'),
    C('cg_cup_noodle', '3화 — 컵라면', f'{TAERI_UNI}, {HANDS}, eating cup noodles at a table with teary eyes, {SEHUN} across the table rolling a puzzle piece.'),
    C('cg_wall_punch', '3화 — 베란다 칸막이', f'{TAERI_UNI}, throwing a straight punch into a thin balcony partition wall, white dust bursting.'),
    C('cg_forest_balcony', '4화 — 숲 같은 베란다', f'{TAERI_UNI}, stepping through a broken wall into a balcony full of green plants, sunlight, awe.'),
    C('cg_letter', '4화 — 편지', f'{TAERI_UNI}, sitting at a small study desk holding a handwritten letter with her fingertips, a small name tag on the desk, quiet afternoon light.'),
    C('cg_track_zip', '4화 — 트레이닝복', f'{TAERI_TRACK}, {HANDS}, zipping up the jacket in front of an open wardrobe, staff ID card and name tag in her chest pocket.'),
    C('cg_dinner', '4화 — 장조림', f'{TAERI_TRACK} and {SEHUN} with his mask down, eating rice and soy-braised beef together at a small table, quiet warmth.'),
    C('cg_horyong_call', '4화 — 아래층의 목소리', f'{TAERI_TRACK}, pulling the end of her hand tape tight with her teeth, standing at a stairwell railing looking down, determined.'),
    C('cg_flash_belt', '회상 — 챔피언 벨트', 'A 23-year-old Korean woman boxer raising a championship belt in a ring under spotlights, both eyes uncovered, her coach father in the corner not smiling.'),
    C('cg_flash_harbor', '회상 — 부두의 매듭', 'A 13-year-old Korean girl learning to tie a rope knot from her smiling father on a sunny harbor pier, warm sepia.'),
    C('cg_flash_rider', '회상 — "맛있게 드세요, 챔피언"', f'{TAERI}, at her apartment door receiving a food delivery from a grinning yellow-haired rider, warm evening light.'),
])

# ───────────────────────── 7. 주먹 (1인칭 HUD)
sec('7. 태리의 주먹 (1인칭, 투명 배경)', '', [
    ('hud_fist_left', '왼 주먹 — 교복', 'hud', "A woman's left fist and forearm rising from the bottom left corner in a boxing guard, wrapped in white athletic tape, navy uniform sleeve, first-person view."),
    ('hud_fist_right', '오른 주먹 — 교복', 'hud', "A woman's right fist and forearm rising from the bottom right corner in a boxing guard, wrapped in white athletic tape, navy uniform sleeve, first-person view."),
    ('hud_fist_left_track', '왼 주먹 — 트레이닝복', 'hud', "A woman's left fist and forearm rising from the bottom left corner in a boxing guard, wrapped in white athletic tape, black tracksuit sleeve, first-person view."),
    ('hud_fist_right_track', '오른 주먹 — 트레이닝복', 'hud', "A woman's right fist and forearm rising from the bottom right corner in a boxing guard, wrapped in white athletic tape, black tracksuit sleeve, first-person view."),
    ('hud_fist_jab', '뻗은 주먹 (잽)', 'hud', "A woman's taped fist punching straight forward away from the viewer, motion blur, first-person view."),
])

# ───────────────────────── 8. 아이템
I = lambda i, ko, p: (i, ko, 'item', p)  # noqa: E731
sec('8. 아이템 아이콘 (투명 배경)', '글자가 들어가는 물건은 비워 두고 게임에서 글자를 얹는다.', [
    I('item_idcard', '도윤의 사원증', 'A staff ID card with a small photo of a shy smiling man, broken blue lanyard, a dark smudge on one corner.'),
    I('item_letter', '도윤의 편지', 'An opened white envelope with a handwritten letter folded half out, illegible neat handwriting.'),
    I('item_nametag', "명찰 '1-3 강태리'", 'A small rectangular school name tag pin with a blank white plate and navy border.'),
    I('item_tape', '압박 붕대', 'A roll of white athletic tape with the end unrolled.'),
    I('item_eyepatch', '검은 안대', 'A black leather eyepatch with a thin strap.'),
    I('item_backpack', '분홍 백팩', 'A pink school backpack.'),
    I('item_shoebag', '분홍 실내화 주머니', 'A pink drawstring shoe bag.'),
    I('item_phone', '휴대폰', 'A smartphone lying face down with a cracked case.'),
    I('item_water', '생수 한 병', 'A plastic bottle of water, half full.'),
    I('item_water6', '생수 여섯 병', 'Six plastic water bottles in a row.'),
    I('item_cupnoodle', '컵라면', 'A cup of instant noodles with the lid peeled back and steam rising.'),
    I('item_ramen', '라면 봉지', 'A bundle of five instant ramen packets with plain red wrappers.'),
    I('item_tuna', '참치캔', 'Three small cans of tuna stacked.'),
    I('item_ham', '햄 통조림', 'Two cans of luncheon meat.'),
    I('item_rice', '즉석밥', 'A stack of microwavable rice bowls.'),
    I('item_jangjorim', '장조림 한 통', 'A food container of soy-braised beef with quail eggs, masking tape label on the lid left blank.'),
    I('item_seaweed', '불린 미역', 'A bowl of soaked seaweed with masking tape label on the side left blank.'),
    I('item_rice_bag', '쌀 반 포대', 'A half-used sack of rice.'),
    I('item_extinguisher', '소화기', 'A red fire extinguisher.'),
    I('item_necktie', '회색 넥타이', 'A grey necktie neatly folded.'),
    I('item_firstaid', '구급상자', 'An open first aid kit with bandages, gauze and scissors.'),
    I('item_painkiller', '진통제', 'A small blister pack of pills.'),
    I('item_thermometer', '체온계', 'A digital thermometer.'),
    I('item_flashlight', '손전등', 'A black flashlight switched on.'),
    I('item_battery', '건전지', 'A handful of AA batteries.'),
    I('item_radio', '휴대용 라디오', 'A small portable battery radio with an antenna.'),
    I('item_keys', '열쇠 꾸러미', 'A ring of building master keys with plastic tags left blank.'),
    I('item_rope', '밧줄', 'A coil of rope.'),
    I('item_puzzle', '수평선 퍼즐 조각', 'A single jigsaw puzzle piece showing part of a blue sea horizon.'),
    I('item_catfood', '고양이 사료', 'A small bag of cat food and a metal bowl.'),
    I('item_watering_can', '물뿌리개', 'A green watering can half full of water.'),
    I('item_photo', '단체 사진', 'A printed group photo of office coworkers pinned with a thumbtack, faces small and smiling.'),
    I('item_belt', '챔피언 벨트', 'A boxing championship belt with a plain gold center plate, no lettering.'),
    I('item_gloves', '낡은 글러브', 'A pair of worn red boxing gloves tied together by the laces.'),
    I('item_mitts', '아빠의 미트', 'A pair of worn black focus mitts.'),
    I('item_tracksuit', '검은 트레이닝복', 'A black zip-up tracksuit jacket folded, small red stitching on the back.'),
    I('item_uniform_bag', '비닐에 넣은 교복', 'A navy sailor-collar school uniform sealed in a clear plastic bag, tied twice.'),
])

# ───────────────────────── 9. UI
U = lambda i, ko, p: (i, ko, 'ui', p)  # noqa: E731
sec('9. UI · 타이틀', '', [
    U('title_key', '타이틀 키 아트', f'Wide 16:9 key art. {TAERI_TRACK}, {HANDS}, standing in a dark apartment emergency stairwell seen from slightly below, a staff ID card with a blue lanyard in her chest pocket, green emergency light from above, many pale reaching hands far below in the spiral stairwell, dust haze. Composition weighted to the right, empty dark space on the left third for a title.'),
    U('title_key_ch1', '타이틀 키 아트 — 교복', f'Wide 16:9 key art. {TAERI_UNI}, {HANDS}, standing in a dark apartment stairwell seen from slightly below, green emergency light from above, pale reaching hands far below. Composition weighted to the right, empty dark space on the left third.'),
    U('title_bg_loop', '타이틀 배경 (인물 없음)', 'Wide 16:9 image. A Korean apartment tower at night in sea fog, a single lit window on the 15th floor, empty sky on the left half.'),
    U('chapter_card_bg', '화 제목 카드 배경', 'Wide 16:9 image. A dark concrete wall texture with a faint green emergency light glow from below, empty center for a chapter title.'),
    U('textbox_frame', '글상자 테두리', 'Wide 5:1 image. A dark semi-transparent dialogue box frame for a game UI, thin worn steel edge with a subtle red accent line at the top, empty interior, transparent background.'),
    U('phone_frame', '휴대폰 화면 틀', 'Portrait 9:16 image. A smartphone held in a hand, the screen area plain dark grey and empty, transparent background around the hand.'),
    U('map_complex', '단지 지도', 'Square image. A top-down illustrated map of a Korean apartment complex beside the sea: eight apartment towers, a main gate, a guard booth, a playground, a parking lot, a strip of shops, a management office, a walking path. Building labels left blank.'),
    U('map_103_section', '103동 단면도', 'Portrait 2:3 image. A cutaway cross-section illustration of a 15-floor Korean apartment tower showing each floor, the central stairwell and elevator shaft, rooftop and basement, floor numbers left blank.'),
    U('icon_set_menu', '메뉴 아이콘', 'Square image. A set of six flat game UI icons in a 3x2 grid on a transparent background: a door, a fist, a bandage roll, a backpack, a map, a gear. Thin white line style with a red accent.'),
    U('fx_hit', '타격 이펙트', 'Square image. A comic-style impact burst effect, white and orange, transparent background.'),
    U('fx_dodge', '회피 이펙트', 'Square image. A comic-style swoosh motion effect, pale blue streaks, transparent background.'),
    U('fx_dark_left', '왼쪽 시야 어둠', 'Wide 16:9 image. A soft black vignette covering the left third of the frame and fading out to fully transparent on the right, transparent background.'),
])

# ───────────────────────── 검열 검사
BANNED = [r'\bblood', r'\bgor[ey]', r'corpse', r'\bdead\b', r'\bbit(e|ing|ten)\b', r'\bkill', r'zombie', r'\bwound',
          r'\binjur', r'\bguts\b', r'sever', r'\bgun\b', r'\bknife', r'\bscream', r'horror', r'infected', r'\bteen',
          r'violent', r'\bcorpse', r'\bmutilat', r'\bdeath']


def lint():
    bad = []
    for title, _, items in SECTIONS:
        for i, ko, kind, p in items:
            for pat in BANNED:
                if re.search(pat, p, re.I):
                    bad.append(f'{i}: {pat}')
    if bad:
        sys.exit('검열에 걸리기 쉬운 단어:\n' + '\n'.join(bad))


def build():
    lint()
    total = sum(len(s[2]) for s in SECTIONS)
    L = ['# 103동 — ChatGPT 이미지 프롬프트', '',
         f'> `python tools/chatgpt/build.py`로 만든 파일 (프롬프트 {total}개). 고칠 땐 `tools/chatgpt/build.py`를 고친다.', '',
         '## 쓰는 법', '',
         '1. ChatGPT에서 **새 대화**를 열고, 아래 `대화 시작용 문장`을 먼저 보낸다. 같은 대화에서 계속 뽑아야 화풍이 이어진다.',
         '2. **캐릭터 시트부터** 뽑는다. 마음에 든 그림을 저장해 두고, 인물이 나오는 프롬프트를 보낼 때 그 그림을 같이 올리며 '
         '"첨부한 인물과 같은 사람으로"를 앞에 붙인다.',
         '3. 각 블록은 그대로 복사해 보낸다. 화풍 문장이 블록 끝에 이미 들어 있다.',
         '4. 저장 이름은 제목의 `영문 이름.png`로, 레포의 `public/img/`에 넣는다.', '',
         '**대화 시작용 문장**', '', '```',
         'I am making illustrations for a story-driven game based on my own novel, a quiet survival drama set in a Korean '
         'apartment complex during a mysterious illness outbreak. Please keep a consistent style across every image '
         'in this conversation. ' + STYLE, '```', '',
         '**검열에 걸렸을 때**', '',
         '- 이 문서의 프롬프트는 피·상처·시체·물어뜯기·좀비 같은 단어를 쓰지 않는다. 감염자는 "원인 모를 병을 앓는 사람(ashen skin, reddened eyes)"으로, '
         '피는 "dark rust-brown stains"로 바꿔 두었다.',
         '- 그래도 거절되면 문제가 될 만한 묘사 하나(얼룩, 손을 뻗는 동작 등)를 빼고 다시 보낸다.',
         '- 태리는 교복을 입지만 27세 성인이다. 교복 장면에는 "adult"를 빼지 않는다. 학생이 위험에 처한 장면은 만들지 않는다.',
         '- 실존 작가·작품·브랜드 이름을 넣지 않는다.', '',
         '**크기**', '', '| 종류 | ChatGPT에 요청 | 게임에서 |', '| --- | --- | --- |']
    for k, (size, _, use) in KINDS.items():
        L.append(f'| {k} | {size} | {use} |')
    L += ['', '## 목차', '']
    for title, _, items in SECTIONS:
        anchor = re.sub(r'[^\w\- ]', '', title).strip().lower().replace(' ', '-')
        L.append(f'- [{title}](#{anchor}) — {len(items)}개')
    L.append('')
    for title, note, items in SECTIONS:
        L += [f'## {title}', '']
        if note:
            L += [note, '']
        for i, ko, kind, p in items:
            tail = KINDS[kind][1]
            body = ' '.join(x for x in [p, tail, STYLE] if x)
            L += [f'### `{i}` — {ko}', '', '```', body, '```', '']
    OUT.write_text('\n'.join(L), encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)} — 프롬프트 {total}개')


if __name__ == '__main__':
    build()
