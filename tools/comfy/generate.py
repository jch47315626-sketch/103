#!/usr/bin/env python3
"""103동 게임 그림을 ComfyUI로 한꺼번에 뽑는다.

ComfyUI를 켜 둔 상태에서(기본 http://127.0.0.1:8188) 실행한다.

    python tools/comfy/generate.py --ckpt 모델이름.safetensors
    python tools/comfy/generate.py --ckpt ... --only "bg_*"         # 배경만
    python tools/comfy/generate.py --ckpt ... --only enemy_doyun --candidates 4
    python tools/comfy/generate.py --ckpt ... --set ch1-4 --skip-existing   # 게임 제1~4화에 필요한 71장

prompts.json 의 그림마다 workflow_api.json 을 채워 /prompt 로 보내고,
결과를 public/img/<이름>.png 로 저장한다. 표준 라이브러리만으로 돈다.
Pillow가 있으면 게임 크기로 맞춰 자르고, rembg가 있으면 적·주먹·아이템 배경을 지운다.
"""
from __future__ import annotations

import argparse
import fnmatch
import re
import hashlib
import io
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

# workflow_api.json 의 노드 번호
N_CKPT, N_POS, N_NEG, N_LATENT, N_SAMPLER, N_SAVE = '1', '2', '3', '4', '5', '7'


def load_jobs(cfg: dict, with_variants: bool) -> list[dict]:
    """prompts.json → 그림 한 장씩의 작업 목록 (변형 포함)."""
    jobs = []
    for img in cfg['images']:
        kind = cfg['kinds'][img['kind']]
        base = dict(img, kindcfg=kind)
        jobs.append(base)
        if with_variants:
            for vname, vtext in cfg.get('variants', {}).get(img['kind'], {}).items():
                jobs.append(dict(base, name=f"{img['name']}_{vname}", prompt=f"{img['prompt']}, {vtext}"))
    return jobs


def kind_of(name: str) -> str:
    """ChatGPT 문서 이름의 앞머리로 종류를 정한다."""
    for prefix, kind in (('bg_', 'bg'), ('fight_', 'fight'), ('enemy_', 'enemy'), ('cg_', 'cg'),
                         ('pt_', 'portrait'), ('hud_', 'hud'), ('item_', 'item'), ('title', 'title')):
        if name.startswith(prefix):
            return kind
    return 'ui'


def chatgpt_prompt(md: str, name: str) -> str | None:
    """docs/chatgpt-prompts.md 의 프롬프트에서 장면 설명만 꺼낸다 (화풍·크기 문장은 prompts.json 쪽을 쓴다)."""
    i = md.find('### `' + name + '`')
    if i < 0:
        return None
    a = md.find('```', i) + 3
    text = md[a:md.find('```', a)].strip()
    text = text.split(' Style:')[0]
    sentences = re.split(r'(?<=\.)\s+', text)
    drop = ('image (', 'transparent', 'cropped', 'no people unless', 'aspect')
    return ' '.join(x for x in sentences if not any(d in x.lower() for d in drop)).rstrip('.')


def load_ch14_jobs(cfg: dict) -> list[dict]:
    """게임 제1~4화의 그림 자리(src/game/imageSlots.json)마다 한 장씩.
    prompts.json 에 같은 그림이 있으면 그 SDXL 프롬프트를, 없으면 ChatGPT 문서의 장면 설명을 쓴다.
    저장 이름은 게임이 알아보는 이름 중 하나다."""
    slots = json.loads((ROOT / 'src' / 'game' / 'imageSlots.json').read_text(encoding='utf-8'))
    md = (ROOT / 'docs' / 'chatgpt-prompts.md').read_text(encoding='utf-8')
    known = {img['name']: img for img in cfg['images']}
    jobs = []
    for g in slots['groups']:
        for slot in g['slots']:
            names = slot['files']
            hit = next((n for n in names if n in known), None)
            if hit and known[hit]['kind'] in cfg['kinds'] and not (hit.startswith('title') and len(names) > 1 and hit != names[0]):
                img = known[hit]
                jobs.append(dict(img, slot=slot['slot'], kindcfg=cfg['kinds'][img['kind']]))
                continue
            name = names[0]
            prompt = chatgpt_prompt(md, name)
            if not prompt:
                print(f'  ! {name}: 프롬프트를 찾지 못해 건너뜀')
                continue
            kind = kind_of(name)
            jobs.append({'name': name, 'kind': kind, 'prompt': prompt, 'slot': slot['slot'],
                         'people': kind in ('cg', 'bg'), 'kindcfg': cfg['kinds'][kind]})
    return jobs


# 이미지 모델은 글자를 제대로 못 쓴다(특히 한글). 글씨가 생길 만한 물건은 비워 두게 하고, 글자는 게임이 얹는다.
TEXTY = ('sign', 'label', 'masking tape', 'handwrit', 'letter', 'envelope', 'name tag', 'nameplate', 'plate',
         'note', 'id card', 'card', 'sticker', 'poster', 'calendar', 'newspaper', 'screen', 'number')
NO_TEXT = 'every sign, label, note, card and paper is blank or shows only faint unreadable marks, no readable writing'


def full_prompt(cfg: dict, job: dict) -> str:
    kind = job['kindcfg']
    if any(t in job['prompt'].lower() for t in TEXTY):
        job = dict(job, prompt=f"{job['prompt']}, {NO_TEXT}")
    suffix = kind.get('suffixPeople', kind.get('suffix', '')) if job.get('people') else kind.get('suffix', '')
    parts = [cfg['style'], job['prompt'], suffix]
    return ', '.join(p for p in parts if p)


def seed_for(name: str, base: int, i: int) -> int:
    """이름에서 고정 시드를 만든다. 다시 돌려도 같은 그림이 나온다."""
    h = int(hashlib.sha256(name.encode()).hexdigest()[:12], 16)
    return (h + base + i * 7919) % (2**48)


def build_workflow(template: dict, cfg: dict, job: dict, seed: int, args) -> dict:
    wf = json.loads(json.dumps(template))
    wf[N_CKPT]['inputs']['ckpt_name'] = args.ckpt
    wf[N_POS]['inputs']['text'] = full_prompt(cfg, job)
    wf[N_NEG]['inputs']['text'] = cfg['negative']
    w, h = job['kindcfg']['gen']
    wf[N_LATENT]['inputs'].update(width=w, height=h, batch_size=1)
    wf[N_SAMPLER]['inputs'].update(seed=seed, steps=args.steps, cfg=args.cfg,
                                   sampler_name=args.sampler, scheduler=args.scheduler)
    wf[N_SAVE]['inputs']['filename_prefix'] = f"dong103/{job['name']}"

    # LoRA 를 체크포인트와 그 소비자들 사이에 끼운다.
    model_src, clip_src = [N_CKPT, 0], [N_CKPT, 1]
    for i, spec in enumerate(args.lora or []):
        name, _, strength = spec.partition(':')
        s = float(strength or 0.8)
        nid = str(100 + i)
        wf[nid] = {'class_type': 'LoraLoader', 'inputs': {
            'lora_name': name, 'strength_model': s, 'strength_clip': s,
            'model': model_src, 'clip': clip_src}}
        model_src, clip_src = [nid, 0], [nid, 1]
    wf[N_SAMPLER]['inputs']['model'] = model_src
    wf[N_POS]['inputs']['clip'] = clip_src
    wf[N_NEG]['inputs']['clip'] = clip_src
    return wf


class Comfy:
    def __init__(self, server: str):
        self.server = server.rstrip('/')
        self.client_id = str(uuid.uuid4())

    def _get(self, path: str) -> bytes:
        with urllib.request.urlopen(self.server + path, timeout=60) as r:
            return r.read()

    def checkpoints(self) -> list[str]:
        info = json.loads(self._get('/object_info/CheckpointLoaderSimple'))
        return info['CheckpointLoaderSimple']['input']['required']['ckpt_name'][0]

    def loras(self) -> list[str]:
        info = json.loads(self._get('/object_info/LoraLoader'))
        return info['LoraLoader']['input']['required']['lora_name'][0]

    def queue(self, wf: dict) -> str:
        body = json.dumps({'prompt': wf, 'client_id': self.client_id}).encode()
        req = urllib.request.Request(self.server + '/prompt', data=body,
                                     headers={'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())['prompt_id']
        except urllib.error.HTTPError as e:
            raise SystemExit(f'ComfyUI가 워크플로를 거부했다:\n{e.read().decode(errors="replace")}')

    def wait(self, prompt_id: str, timeout: float) -> list[bytes]:
        end = time.time() + timeout
        while time.time() < end:
            hist = json.loads(self._get(f'/history/{prompt_id}'))
            if prompt_id in hist:
                entry = hist[prompt_id]
                status = entry.get('status', {})
                if status.get('status_str') == 'error':
                    raise RuntimeError(json.dumps(status.get('messages', []), ensure_ascii=False)[:2000])
                images = []
                for out in entry.get('outputs', {}).values():
                    for im in out.get('images', []):
                        q = urllib.parse.urlencode({'filename': im['filename'],
                                                    'subfolder': im.get('subfolder', ''),
                                                    'type': im.get('type', 'output')})
                        images.append(self._get(f'/view?{q}'))
                if images:
                    return images
            time.sleep(1.0)
        raise TimeoutError(f'{timeout:.0f}초 안에 끝나지 않았다')


def finish(png: bytes, job: dict, do_cutout: bool, fmt: str = 'png') -> bytes:
    """게임 크기로 맞추고, 필요하면 배경을 지운다. 라이브러리가 없으면 그대로 둔다."""
    kind = job['kindcfg']
    if do_cutout and kind.get('cutout'):
        try:
            from rembg import remove  # type: ignore
            png = remove(png)
        except ImportError:
            warn_once('rembg 가 없어 배경을 지우지 않았다 (pip install "rembg[cpu]")')
    if kind.get('out'):
        try:
            from PIL import Image, ImageOps  # type: ignore
            im = Image.open(io.BytesIO(png))
            im = ImageOps.fit(im, tuple(kind['out']), Image.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, 'PNG')
            png = buf.getvalue()
        except ImportError:
            warn_once('Pillow 가 없어 게임 크기로 자르지 않았다 (pip install pillow)')
    if fmt == 'webp':
        try:
            from PIL import Image  # type: ignore
            buf = io.BytesIO()
            Image.open(io.BytesIO(png)).save(buf, 'WEBP', quality=86, method=6)  # 투명도는 그대로
            png = buf.getvalue()
        except ImportError:
            raise SystemExit('--format webp 에는 Pillow 가 필요하다 (pip install pillow)')
    return png


_warned: set[str] = set()


def warn_once(msg: str):
    if msg not in _warned:
        _warned.add(msg)
        print('  ! ' + msg)


def main():
    ap = argparse.ArgumentParser(description='103동 그림을 ComfyUI로 뽑는다')
    ap.add_argument('--server', default='http://127.0.0.1:8188')
    ap.add_argument('--ckpt', help='체크포인트 파일 이름 (모르면 비워 두면 목록을 보여 준다)')
    ap.add_argument('--lora', action='append', metavar='이름[:세기]', help='LoRA, 여러 번 줄 수 있다')
    ap.add_argument('--only', action='append', metavar='패턴', help='이름 패턴 (예: "bg_*"), 여러 번 가능')
    ap.add_argument('--kind', action='append', help='sheet bg fight enemy hud item title cg portrait 중에서')
    ap.add_argument('--set', choices=['ch1-4'], help='ch1-4: 게임 제1~4화에 필요한 그림만 (docs/ch1-4-images.md 순서)')
    ap.add_argument('--no-variants', action='store_true', help='적·주먹 동작 변형은 건너뛴다')
    ap.add_argument('--candidates', type=int, default=1, help='그림마다 시드를 바꿔 몇 장 뽑을지')
    ap.add_argument('--seed', type=int, default=103, help='시드 기준값')
    ap.add_argument('--steps', type=int, default=30)
    ap.add_argument('--cfg', type=float, default=6.0)
    ap.add_argument('--sampler', default='dpmpp_2m')
    ap.add_argument('--scheduler', default='karras')
    ap.add_argument('--out', default=str(ROOT / 'public' / 'img'))
    ap.add_argument('--skip-existing', action='store_true', help='이미 있는 파일은 건너뛴다 (확장자가 달라도)')
    ap.add_argument('--format', choices=['png', 'webp'], default='png', help='webp 는 용량이 png 의 1/5 정도 (게임은 둘 다 읽는다)')
    ap.add_argument('--no-cutout', action='store_true', help='배경 지우기를 하지 않는다')
    ap.add_argument('--timeout', type=float, default=600)
    ap.add_argument('--dry-run', action='store_true', help='보내지 않고 작업 목록과 프롬프트만 보여 준다')
    args = ap.parse_args()

    cfg = json.loads((HERE / 'prompts.json').read_text(encoding='utf-8'))
    template = json.loads((HERE / 'workflow_api.json').read_text(encoding='utf-8'))

    jobs = load_ch14_jobs(cfg) if args.set == 'ch1-4' else load_jobs(cfg, not args.no_variants)
    if args.kind:
        jobs = [j for j in jobs if j['kind'] in args.kind]
    if args.only:
        jobs = [j for j in jobs if any(fnmatch.fnmatch(j['name'], p) for p in args.only)]
    if not jobs:
        raise SystemExit('뽑을 그림이 없다. --only / --kind 를 확인하라.')

    out_dir = Path(args.out)
    if args.dry_run:
        for j in jobs:
            w, h = j['kindcfg']['gen']
            print(f"{j['name']:28} {j['kind']:6} {w}x{h}  seed={seed_for(j['name'], args.seed, 0)}")
            print('    ' + full_prompt(cfg, j)[:200] + '…')
        print(f'\n{len(jobs)}장 × 후보 {args.candidates} → {out_dir}')
        return

    comfy = Comfy(args.server)
    try:
        ckpts = comfy.checkpoints()
    except (urllib.error.URLError, OSError) as e:
        raise SystemExit(f'ComfyUI({args.server})에 연결하지 못했다. 켜져 있는지 확인하라. ({e})')
    if not args.ckpt or args.ckpt not in ckpts:
        print('사용할 수 있는 체크포인트:')
        for c in ckpts:
            print('  ' + c)
        raise SystemExit('--ckpt 에 위 이름 중 하나를 적어라.' if not args.ckpt else f'"{args.ckpt}" 는 없다.')
    if args.lora:
        have = comfy.loras()
        for spec in args.lora:
            if spec.partition(':')[0] not in have:
                raise SystemExit(f'LoRA "{spec}" 가 없다. 있는 것: {", ".join(have) or "(없음)"}')

    out_dir.mkdir(parents=True, exist_ok=True)
    cand_dir = out_dir / '_candidates'
    total = len(jobs) * args.candidates
    done = 0
    failed = []
    for job in jobs:
        for i in range(args.candidates):
            done += 1
            seed = seed_for(job['name'], args.seed, i)
            ext = args.format
            if args.candidates == 1:
                path = out_dir / f"{job['name']}.{ext}"
            else:
                cand_dir.mkdir(exist_ok=True)
                path = cand_dir / f"{job['name']}__{seed}.{ext}"
            # 같은 그림 자리의 다른 이름·확장자로 이미 있으면 그것도 '있음'으로 친다
            same = [job['name']]
            exists = any((path.parent / f'{n}.{e}').exists() for n in same for e in ('png', 'webp', 'jpg', 'jpeg'))
            if args.skip_existing and (path.exists() or (args.candidates == 1 and exists)):
                print(f'[{done}/{total}] {path.name} 있음, 건너뜀')
                continue
            print(f'[{done}/{total}] {path.name} …', flush=True)
            t0 = time.time()
            try:
                pid = comfy.queue(build_workflow(template, cfg, job, seed, args))
                png = comfy.wait(pid, args.timeout)[0]
                path.write_bytes(finish(png, job, not args.no_cutout, args.format))
                print(f'    저장 {path.relative_to(ROOT) if path.is_relative_to(ROOT) else path} ({time.time() - t0:.0f}초)')
            except (RuntimeError, TimeoutError) as e:
                print(f'    실패: {e}')
                failed.append(path.name)

    if failed:
        print(f'\n실패 {len(failed)}장: {", ".join(failed)}')
        sys.exit(1)
    print(f'\n끝. {total}장 → {out_dir}')


if __name__ == '__main__':
    main()
