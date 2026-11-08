#!/usr/bin/env python3
"""prompts.json 의 배경 프롬프트를 docs/background-prompts.md 로 뽑는다 (ComfyUI 붙여넣기용)."""
import json
from pathlib import Path
import sys
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from generate import full_prompt  # noqa: E402

KO = {'bg_dawn': '1화 새벽 5시 반, 해무 덮인 단지', 'bg_mirror': '1502호 욕실 거울', 'bg_door': '1502호 현관 안쪽',
      'bg_peep': '외시경 너머 — 도윤', 'bg_peep1501': '외시경 너머 — 1501호 남자', 'bg_hall': '15층 복도',
      'bg_stairs': '계단참', 'bg_stairsDown': '난간 틈으로 내려다본 나선 계단', 'bg_kitchen': '1502호 빈 냉장고',
      'bg_night': '불 끈 밤의 거실', 'bg_firedoor': '넥타이로 묶은 방화문, 철망 유리창', 'bg_r1208': '세훈의 1208호',
      'bg_balcony': '1502호 베란다 칸막이', 'bg_b1503': '부서진 칸막이 너머 1503호 베란다', 'bg_r1503': '1503호 거실 (살펴보기)',
      'bg_desk': '1503호 서재 책상', 'bg_closet': '옷장', 'bg_dining': '장조림 식탁',
      'fight_hall': '싸움 — 15층 복도', 'fight_stairs': '싸움 — 계단참', 'fight_room': '싸움 — 새벽 거실 (섀도복싱)',
      'fight_wall': '싸움 — 베란다 칸막이'}

c = json.loads((HERE / 'prompts.json').read_text(encoding='utf-8'))
L = ['# 103동 — 배경 프롬프트 (ComfyUI 붙여넣기용)', '',
     '> `tools/comfy/prompts.json`에서 `python tools/comfy/export_backgrounds.py`로 만든 파일. 프롬프트는 JSON 쪽을 고친다.', '',
     '각 블록을 ComfyUI의 **긍정 프롬프트(CLIP Text Encode)** 칸에 그대로 붙여 넣는다. 공통 화풍 문장이 이미 앞에 들어 있다.', '',
     '## 공통 설정', '', '**부정 프롬프트** (모든 배경 공통)', '', '```', c['negative'], '```', '',
     '| 종류 | Empty Latent 크기 | 게임에 넣을 크기 |', '| --- | --- | --- |',
     '| 이야기 배경 `bg_*` | 1600 × 640 | 1920 × 760 (아래 160px은 글상자에 가려짐) |',
     '| 싸움 배경 `fight_*` | 1344 × 768 | 1920 × 1080 |', '',
     '권장: steps 30, CFG 6, sampler dpmpp_2m, scheduler karras. 파일명은 각 제목의 이름 그대로 `public/img/`에 저장.', '']
sec = None
for im in c['images']:
    if im['kind'] not in ('bg', 'fight'):
        continue
    if im['kind'] != sec:
        sec = im['kind']
        n = sum(1 for i in c['images'] if i['kind'] == sec)
        L += [f'## 이야기 배경 ({n}장)' if sec == 'bg' else f'## 싸움 배경 ({n}장, 1인칭 — 왼쪽 ⅓ 어둡게)', '']
    p = full_prompt(c, dict(im, kindcfg=c['kinds'][sec]))
    L += [f"### `{im['name']}` — {KO.get(im['name'], '')}", '', '```', p, '```', '']
(HERE.parent.parent / 'docs' / 'background-prompts.md').write_text('\n'.join(L), encoding='utf-8')
print('docs/background-prompts.md 갱신')
