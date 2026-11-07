# ComfyUI로 그림 뽑기

`docs/image-prompts.md`의 프롬프트를 ComfyUI에 한꺼번에 보내 `public/img/<이름>.png`로 받는다.
ComfyUI는 자기 PC(GPU)에서 켜 두고, 이 스크립트는 그 서버의 API(`/prompt`)로 일을 보낸다.

| 파일 | 내용 |
| --- | --- |
| `prompts.json` | 공통 스타일·네거티브, 종류별 크기, 그림 44장 + 동작 변형 48장의 프롬프트 |
| `workflow_api.json` | 기본 SDXL 텍스트→이미지 워크플로 (API 형식) |
| `generate.py` | 위 둘을 합쳐 ComfyUI에 보내고 결과를 저장 (표준 라이브러리만 사용) |

## 준비

1. ComfyUI를 켠다 (기본 주소 `http://127.0.0.1:8188`).
2. `models/checkpoints/`에 **SDXL 계열 체크포인트**를 둔다. 웹툰·애니 화풍 SDXL 모델이 잘 맞는다.
   웹툰 선화 LoRA가 있으면 `models/loras/`에.
3. (선택) 게임 크기로 자르기·배경 지우기:

```bash
pip install pillow "rembg[cpu]"
```

## 실행

레포 맨 위에서 실행한다. 체크포인트 이름을 모르면 `--ckpt` 없이 돌리면 목록을 보여 준다.

```bash
python tools/comfy/generate.py --dry-run
```

```bash
python tools/comfy/generate.py --ckpt 모델이름.safetensors --kind sheet --candidates 4
```

```bash
python tools/comfy/generate.py --ckpt 모델이름.safetensors --lora 웹툰LoRA.safetensors:0.7 --skip-existing
```

자주 쓰는 옵션:

| 옵션 | 뜻 |
| --- | --- |
| `--only "bg_*"` | 이름 패턴으로 고르기 (여러 번 가능) |
| `--kind enemy` | `sheet bg fight enemy hud item title` 중에서 고르기 |
| `--candidates 4` | 시드를 바꿔 4장씩 → `public/img/_candidates/`에 저장. 마음에 드는 걸 골라 `public/img/<이름>.png`로 옮긴다 |
| `--no-variants` | 적·주먹 동작 변형(할퀴기·물기·잡기·피격·KO, 잽·어퍼·바디) 건너뛰기 |
| `--skip-existing` | 이미 있는 파일은 다시 뽑지 않기 |
| `--steps 30 --cfg 6 --sampler dpmpp_2m --scheduler karras` | 샘플러 설정 (기본값) |
| `--server http://다른PC:8188` | ComfyUI가 다른 컴퓨터에 있을 때 |

시드는 그림 이름에서 정해진다. 같은 설정으로 다시 돌리면 같은 그림이 나오고,
`--seed` 값을 바꾸면 전체가 새로 나온다.

## 종류별 크기

| 종류 | 생성 크기 | 저장 크기 | 배경 지우기 |
| --- | --- | --- | --- |
| `sheet` 캐릭터 시트 | 1216×832 | 그대로 | |
| `bg` 이야기 배경 | 1600×640 | 1920×760 | |
| `fight` 싸움 배경 | 1344×768 | 1920×1080 | |
| `enemy` 싸움 상대 | 896×1152 | 그대로 | ✓ |
| `hud` 태리의 주먹 | 1024×1024 | 그대로 | ✓ |
| `item` 아이템 | 1024×1024 | 그대로 | ✓ |
| `title` 타이틀 | 1344×768 | 1920×1080 | |

생성 크기는 SDXL이 잘 그리는 비율에 맞춘 것이다. 저장할 때 Pillow로 게임 크기에 맞춰 자른다.

## 워크플로를 고치고 싶을 때

`workflow_api.json`을 ComfyUI에서 열어 고친 뒤 **Export (API)** 로 같은 이름에 덮어쓴다.
스크립트가 채우는 노드 번호는 `1` 체크포인트, `2` 긍정 프롬프트, `3` 부정 프롬프트,
`4` 빈 latent, `5` KSampler, `7` 저장이다. 노드를 추가해도 이 번호들만 유지하면 된다.

**캐릭터 일관성**: 기본 워크플로는 프롬프트만으로 그린다. 태리·도윤이 장마다 조금씩 달라지면
캐릭터 시트를 먼저 뽑아 고른 뒤, IPAdapter 같은 레퍼런스 노드를 워크플로에 붙이는 게 다음 단계다.
