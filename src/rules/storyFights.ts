// 원작 장면을 그대로 옮긴 전투 차트. 동작 순서는 소설 본문을 따른다.
import { KEY_GRID, RHYTHM, type DodgeDir, type Note, type RhythmMode, type RhythmState } from './rhythm';

export interface StoryFight {
  id: string;
  title: string;
  /** 감염자 그림 (art.ts의 LOOKS) — 없으면 상대 없음 */
  look?: string;
  /** 여럿과 싸울 때: down 노트마다 다음 상대로 바뀐다 (첫 상대는 look) */
  looks?: string[];
  bg: 'hall' | 'stairs' | 'room' | 'wall';
  bpm: number;
  mode: RhythmMode;
  /** 세훈이 옆에 있다: 안 보이는 왼쪽을 불러 준다 */
  ally?: boolean;
  /** 끝 연출: ko = 쓰러뜨림, push = 손바닥으로 밀어냄, none */
  ending: 'ko' | 'push' | 'none';
  intro: string;
  notes: Omit<Note, 'id'>[];
  /** 박자에 맞춰 화면에 뜨는 글 (원작 문장) */
  lines?: { beat: number; text: string }[];
}

const C0 = RHYTHM.countIn;
type Extra = Partial<Omit<Note, 'id' | 'beat' | 'kind'>>;
const P = (beat: number, key: string, label: string, extra: Extra = {}): Omit<Note, 'id'> => {
  const [row, col] = KEY_GRID[key];
  return { beat: C0 + beat, kind: 'punch', row, col, label, ...extra };
};
const D = (beat: number, dodge: DodgeDir[], label: string, extra: Extra = {}): Omit<Note, 'id'> =>
  ({ beat: C0 + beat, kind: 'dodge', attack: 'bite', dodge, label, ...extra });

export const STORY_FIGHTS: Record<string, StoryFight> = {
  // 제1화 — 1501호 남자. 위빙, 라이트 스트레이트. 한 방.
  m1501: {
    id: 'm1501', title: '1501호 남자', look: 'suit1501', bg: 'hall', bpm: 84, mode: 'story', ending: 'ko',
    intro: '그것이 네 발로 바닥을 박찼다. — 몸이 먼저 움직인다. 빨간 원이 줄어들면 ↓(위빙), 그다음 W(라이트 스트레이트).',
    notes: [
      D(0, ['duck'], '위빙 ↓'),
      P(1, 'w', '라이트 스트레이트', { finisher: true }),
    ],
  },

  // 제2화 — 4시. 소리 없이 섀도복싱. "잽. 잽. 원투. 위빙. 다시 원투."
  shadow: {
    id: 'shadow', title: '새벽 네 시, 섀도복싱', bg: 'room', bpm: 92, mode: 'practice', ending: 'none',
    intro: '발소리가 나지 않도록 발끝으로만. 잽. 잽. 원투. 위빙. 다시 원투. (놓쳐도 계속된다 — 키를 익히는 라운드)',
    notes: [
      P(0, 'w', '잽'), P(1, 'w', '잽'), P(2, 'w', '원'), P(2.5, 'e', '투'),
      D(3, ['duck'], '위빙 ↓'),
      P(4, 'w', '원'), P(4.5, 'e', '투'),
      P(6, 'a', '바디'), P(6.5, 'd', '바디'), P(7, 'x', '어퍼'),
      P(8, 'q', '왼 훅'), P(9, 'e', '오른 훅'),
      D(10, ['left'], '← 빠지기'), D(11, ['right'], '→ 빠지기'),
      P(12, 'w', '원'), P(12.5, 'e', '투'), P(13, 'x', '어퍼'),
    ],
    lines: [
      { beat: C0 + 5.5, text: '아래 줄은 몸통(A S D), 맨 아래는 어퍼(Z X C).' },
      { beat: C0 + 7.5, text: '왼쪽 칸(Q A Z)은 안대 쪽이다. 잘 보이지 않는다. 왼쪽 귀로 들어라.' },
      { beat: C0 + 9.6, text: '피하기: ← ↓ →' },
    ],
  },

  // 제2화 — 14·15층 사이 계단참. 기어오르는 것의 머리는 허리 높이에 있다.
  stairsSuit: {
    id: 'stairsSuit', title: '계단참의 정장 남자', look: 'suitStairs', bg: 'stairs', bpm: 92, mode: 'story', ending: 'ko',
    intro: '계단을 기어오르는 것의 머리는, 위에 선 사람의 허리 높이에 있었다. — 머리가 가운데 줄에 있다. S(내려꽂는 오른손).',
    notes: [P(1, 's', '내려꽂는 오른손', { finisher: true })],
  },

  // 제2화 — 14층 방화문. 안 보이는 왼쪽. 앞치마를 두른 여자.
  apron: {
    id: 'apron', title: '14층 방화문 — 왼쪽', look: 'apron', bg: 'stairs', bpm: 92, mode: 'story', ending: 'ko',
    intro: '끼이― 경첩 소리. 왼쪽 귀에. 보이지 않는 쪽. — 벽이 없으면 네가 벽 쪽으로 가. 끌려가는 방향(←)으로 몸을 던진다.',
    notes: [
      D(1, ['left'], '← 끌려가는 쪽으로'),
      P(2, 'd', '간 (보디블로)', { noEffect: '접히지 않았다 — 아프지 않은 몸' }),
      P(3, 'x', '어퍼컷', { finisher: true }),
    ],
  },

  // 제3화 — 12층 계단참. 한도윤.
  doyun: {
    id: 'doyun', title: '12층 계단참', look: 'doyun', bg: 'stairs', bpm: 80, mode: 'story', ally: true, ending: 'push',
    intro: '“오빠.” — 그가 벽에서 등을 뗐다.',
    notes: [
      D(0, ['duck'], '위빙 ↓'),
      { beat: C0 + 1, kind: 'stop', row: 0, col: 1, label: '라이트 스트레이트' },
      P(2, 's', '클린치 — S를 누르고 버텨라', { hold: 10 }),
      P(13, 'w', '손바닥으로 민다', { finisher: true }),
    ],
    lines: [
      { beat: C0 + 1.05, text: '주먹이 멈췄다. 그의 턱 끝, 한 뼘 앞에서.' },
      { beat: C0 + 1.6, text: '면도 자국이 보였다. 어제 아침, 1503호 욕실에서.' },
      { beat: C0 + 2.6, text: '두 팔로 그의 두 팔을 감아 눌렀다. 이마를 그의 어깨에. 이빨이 닿지 않는 각도.' },
      { beat: C0 + 4.4, text: '섬유유연제 냄새. 복도에서 스칠 때마다 나던.' },
      { beat: C0 + 6, text: '― 생일 축하해. 택배 송장에 생년월일 있더라. 미안. 국은 데워 먹어. 1503.' },
      { beat: C0 + 7.8, text: '“오빠, 나야. 입학식 하는 거 보러 온다며.”' },
      { beat: C0 + 9.4, text: '세훈: “놔요. 그렇게 오래 못 버팁니다.”' },
      { beat: C0 + 10.8, text: '“……놓으면 당신이 칠 거잖아요.”' },
      { beat: C0 + 12, text: '발이 미끄러졌다. 팔을 풀었다. 주먹이 아니라, 손바닥으로—' },
    ],
  },

  // 제5화 — 11층 복도. 바벨 봉으로 버티는 호룡, 치고 빠지는 태리. "들어갔다. 쳤다. 빠졌다."
  floor11: {
    id: 'floor11', title: '11층 복도 — 깔짝대기', look: 'hiker', looks: ['pajama', 'worker', 'hiker', 'pajama', 'worker', 'suitStairs'],
    bg: 'hall', bpm: 96, mode: 'story', ending: 'ko',
    intro: '덩어리 맨 뒤에 있던 것 하나가 고개를 돌렸다. 등산복 차림. — 태리는 먼저 들어갔다. 언제나 왼쪽은 벽.',
    notes: [
      D(0, ['duck'], '위빙 ↓'),
      P(1, 'w', '오른손 — 턱 끝', { down: true }),
      P(2.5, 'e', '훅 — 관자놀이', { down: true }),
      P(3.5, 'x', '어퍼컷 — 턱 밑', { down: true }),
      D(5, ['right'], '→ 들어갔다'), P(6, 'w', '쳤다', { down: true }), D(7, ['left'], '← 빠졌다'),
      D(8, ['right'], '→ 들어갔다'), P(9, 'q', '쳤다', { down: true }), D(10, ['left'], '← 빠졌다'),
      D(11, ['duck'], '위빙 ↓'), P(11.5, 'x', '어퍼', { down: true }),
      P(13, 's', '문턱 아래 — 내려꽂는 오른손', { finisher: true }),
    ],
    lines: [
      { beat: C0 + 1.2, text: '세 번 주먹을 내는 동안, 그녀의 몸에 닿은 것은 하나도 없었다.' },
      { beat: C0 + 3.8, text: '호룡: “어? 뭐야. 누구야?”' },
      { beat: C0 + 5.2, text: '돌아서는 순간, 목이 꺾이는 순간, 중심이 한쪽 발에 실리는 순간.' },
      { beat: C0 + 7.2, text: '호룡: “……강태리? 외눈의 폭격기? 와, 씨, 진짜네!”' },
      { beat: C0 + 9.2, text: '태리: “소리 좀 줄여요. 계단으로 계속 올라와요.”' },
      { beat: C0 + 10.4, text: '호룡: “올라오라 그래! 다 와서 줄 서라 그래! ……야, 강태리, 너 몇 개 했어?”' },
      { beat: C0 + 12, text: '계단실에서 올라온 첫 번째 것이 방화문 문턱에 손을 짚었다. 턱이 문턱보다 아래 있는 순간.' },
    ],
  },

  // 제3화 끝 — 1502호 베란다 칸막이. "……들어갈게, 오빠."
  wall: {
    id: 'wall', title: '베란다 칸막이', bg: 'wall', bpm: 70, mode: 'story', ending: 'none',
    intro: '— 비상시 이 벽을 깨고 옆 세대로 대피하십시오. — 주먹을 뒤로 당겼다.',
    notes: [P(1, 'w', '퍽', { finisher: true })],
  },
};

export function startStoryFight(id: string): RhythmState {
  const f = STORY_FIGHTS[id];
  const notes = f.notes.map((n, i) => ({ ...n, id: i })) as Note[];
  const last = notes.reduce((m, n) => Math.max(m, n.beat + (n.hold ?? 0)), 0);
  return {
    mode: f.mode,
    enemy: {
      id: f.id, name: f.title, desc: f.intro, bpm: f.bpm, headHp: 1, poise: 99, measures: 0,
      phrases: {}, attacks: {}, low: f.look === 'suitStairs',
    },
    bpm: f.bpm, notes, totalBeats: last + 2,
    headHp: 1, poise: 99, staggerUntil: -1,
    combo: 0, maxCombo: 0, perfects: 0, goods: 0, misses: 0,
    hitsTaken: 0, bites: 0, extraNoise: 0, grabbed: false,
    outcome: 'ongoing', lives: RHYTHM.storyLives, events: [],
  };
}
