// 리듬 복싱 규칙. 박자(비트) 단위로 노트가 오고, 맞는 키를 박자에 맞춰 누른다.
//
// 공격 키 3×3 = 감염자 위에 겹친 칸
//   Q W E   머리 (왼·정면·오른)  — 머리 피해 1
//   A S D   몸통                 — 자세를 깎는다. 자세 0 = 비틀거림: 4박 동안 피해 2배
//   Z X C   어퍼                 — 머리 피해 2
// 피하기 노트 ← ↓ → — 감염자 공격. 놓치면 맞는다.
// 피한 직후의 어퍼는 카운터(피해 2배). 잡기에 걸리면 그 어퍼가 '탈출' — 놓치면 물린다.
// 소음은 박자를 놓친 만큼 난다: 놓침 3번마다 +1, 맞으면 추가. 차트가 끝날 때까지 못 쓰러뜨리면 +3.

import { nextRandom } from './rng';

export type Col = 0 | 1 | 2;
export type Row = 0 | 1 | 2;
export type DodgeDir = 'left' | 'duck' | 'right';
export type ZAttack = 'swingL' | 'swingR' | 'bite' | 'grab';
export type Judge = 'perfect' | 'good' | 'miss';

export const KEY_GRID: Record<string, [Row, Col]> = {
  q: [0, 0], w: [0, 1], e: [0, 2],
  a: [1, 0], s: [1, 1], d: [1, 2],
  z: [2, 0], x: [2, 1], c: [2, 2],
};
export const GRID_KEYS = [['Q', 'W', 'E'], ['A', 'S', 'D'], ['Z', 'X', 'C']];
export const DODGE_KEYS: Record<string, DodgeDir> = { arrowleft: 'left', arrowdown: 'duck', ' ': 'duck', arrowright: 'right' };

export const ATTACK_INFO: Record<ZAttack, { name: string; dodge: DodgeDir[]; hint: string }> = {
  swingL: { name: '왼쪽 할퀴기', dodge: ['right', 'duck'], hint: '→ 또는 ↓' },
  swingR: { name: '오른쪽 할퀴기', dodge: ['left', 'duck'], hint: '← 또는 ↓' },
  bite: { name: '물기', dodge: ['left', 'right'], hint: '← 또는 →' },
  grab: { name: '잡기', dodge: ['duck'], hint: '↓' },
};

export interface Note {
  id: number;
  beat: number;
  /** stop = 원작에서 주먹이 멈추는 순간. 저절로 판정되고 키는 듣지 않는다 */
  kind: 'punch' | 'dodge' | 'stop';
  row?: Row;
  col?: Col;
  attack?: ZAttack;
  /** 피하기 바로 다음 어퍼: 피했으면 카운터, 잡혔으면 탈출 */
  follow?: number;
  judge?: Judge;
  /** 외눈 보스의 사각(←)으로 피했다 */
  blind?: boolean;
  /** 이야기 전투: 노트 위에 보이는 이름 (위빙, 라이트 스트레이트…) */
  label?: string;
  /** 받아 주는 피하기 방향 (없으면 공격 종류로 정한다) */
  dodge?: DodgeDir[];
  /** 누르고 버티는 박 수 (클린치) */
  hold?: number;
  holding?: boolean;
  holdJudge?: Judge;
  /** 맞혀도 피해가 없다 (아프지 않은 몸 — 간을 쳐도 접히지 않는다) */
  noEffect?: string;
  /** 이 노트를 맞히면 끝 (원펀치) */
  finisher?: boolean;
}

type Phrase = 'jabs' | 'combo' | 'body' | 'attack' | 'rest' | 'rush';

export interface RhythmEnemy {
  id: string;
  name: string;
  desc: string;
  bpm: number;
  headHp: number;
  poise: number;
  measures: number;
  phrases: Partial<Record<Phrase, number>>;
  attacks: Partial<Record<ZAttack, number>>;
  /** 기어 온다: 머리가 몸통 높이 — 머리 노트가 A S D 줄에 온다 */
  low?: boolean;
  /** 외눈: ← 로 피하면 사각 — 카운터가 3배 */
  blindLeft?: boolean;
  boss?: boolean;
}

export const RHYTHM_ENEMIES: Record<string, RhythmEnemy> = {
  normal: {
    id: 'normal', name: '일반 감염자', desc: '느린 박자. 머리가 있는 칸을 박자에 맞춰 쳐라.',
    bpm: 100, headHp: 26, poise: 4, measures: 12,
    phrases: { jabs: 3, combo: 2, body: 2, attack: 3, rest: 1 },
    attacks: { swingL: 3, swingR: 3, bite: 4, grab: 2 },
  },
  crawler: {
    id: 'crawler', name: '기어 오는 감염자', desc: '바닥을 긴다. 머리가 몸통 높이라 A S D 줄로 온다. 잡기가 많다.',
    bpm: 108, headHp: 19, poise: 99, measures: 10, low: true,
    phrases: { jabs: 3, combo: 2, attack: 3, rest: 1 },
    attacks: { grab: 4, bite: 3, swingL: 1, swingR: 1 },
  },
  horyong: {
    id: 'horyong', name: '감염된 호룡', desc: '보스. 빠른 박자, 8분음표 연타. 외눈 — ←로 피하면 사각, 카운터 3배.',
    bpm: 116, headHp: 50, poise: 5, measures: 16, blindLeft: true, boss: true,
    phrases: { jabs: 2, combo: 3, body: 2, attack: 4, rush: 2 },
    attacks: { swingL: 3, swingR: 3, bite: 3, grab: 2 },
  },
};

export const RHYTHM = {
  countIn: 4, // 노트 전에 4박 카운트
  perfectMs: 60,
  goodMs: 120,
  missesPerNoise: 3,
  staggerBeats: 4,
  noise: { swingHit: 2, biteHit: 1, grabHit: 1, timeout: 3 },
};

/** battle = 일반 전투, story = 원작 장면(하나라도 놓치면 다시), practice = 연습(놓쳐도 끝까지) */
export type RhythmMode = 'battle' | 'story' | 'practice';

export interface RhythmState {
  mode: RhythmMode;
  enemy: RhythmEnemy;
  bpm: number;
  notes: Note[];
  totalBeats: number;
  headHp: number;
  poise: number;
  staggerUntil: number;
  combo: number;
  maxCombo: number;
  perfects: number;
  goods: number;
  misses: number;
  hitsTaken: number;
  bites: number;
  extraNoise: number;
  grabbed: boolean;
  outcome: 'ongoing' | 'ko' | 'timeout' | 'clear' | 'fail';
  events: RhythmEvent[];
}

export type RhythmEvent =
  | { t: 'judge'; note: Note; judge: Judge; dmg: number; counter: boolean }
  | { t: 'stray'; key: string }
  | { t: 'struck'; attack: ZAttack; noise: number }
  | { t: 'evaded'; attack: ZAttack; blind: boolean }
  | { t: 'stagger' }
  | { t: 'escape' }
  | { t: 'ko' }
  | { t: 'timeout' }
  | { t: 'stopped'; note: Note }
  | { t: 'holdStart'; note: Note }
  | { t: 'holdDone'; note: Note }
  | { t: 'noEffect'; note: Note; text: string }
  | { t: 'clear' }
  | { t: 'fail'; note: Note };

export const msPerBeat = (bpm: number) => 60000 / bpm;

function pick<T extends string>(w: Partial<Record<T, number>>, r: number): T {
  const e = Object.entries(w) as [T, number][];
  let x = r * e.reduce((a, [, v]) => a + v, 0);
  for (const [k, v] of e) { x -= v; if (x < 0) return k; }
  return e[e.length - 1][0];
}

/** 시드로 차트를 만든다. 같은 시드 = 같은 차트 */
export function buildChart(enemy: RhythmEnemy, seed: number, opts: { easy?: boolean } = {}): Note[] {
  let rng = seed | 0;
  const r = () => { const [v, n] = nextRandom(rng); rng = n; return v; };
  const notes: Note[] = [];
  let id = 0;
  const headRow: Row = enemy.low ? 1 : 0;
  let head: Col = 1;
  const move = (): Col => { const o = ([0, 1, 2] as Col[]).filter((c) => c !== head); head = o[Math.floor(r() * o.length)]; return head; };
  const add = (n: Omit<Note, 'id'>) => { notes.push({ ...n, id: id++ }); return id - 1; };
  let last: Phrase | null = null;

  for (let m = 0; m < enemy.measures; m++) {
    const b = RHYTHM.countIn + m * 4;
    let ph: Phrase;
    if (opts.easy && m < 2) ph = 'jabs';
    else if (m === 0) ph = 'jabs';
    else {
      do ph = pick(enemy.phrases, r()); while (ph === last && (ph === 'attack' || ph === 'rush'));
    }
    last = ph;
    switch (ph) {
      case 'jabs': {
        const c = move();
        add({ beat: b, kind: 'punch', row: headRow, col: c });
        add({ beat: b + 1, kind: 'punch', row: headRow, col: c });
        add({ beat: b + 2, kind: 'punch', row: headRow, col: opts.easy ? c : move() });
        break;
      }
      case 'combo': {
        const c1 = move();
        add({ beat: b, kind: 'punch', row: headRow, col: c1 });
        const c2 = move();
        add({ beat: b + 1, kind: 'punch', row: headRow, col: c2 });
        if (!opts.easy) add({ beat: b + 1.5, kind: 'punch', row: headRow, col: c2 });
        add({ beat: b + 2, kind: 'punch', row: 2, col: c2 });
        break;
      }
      case 'body': {
        const cols: Col[] = r() < 0.5 ? [0, 1, 2] : [2, 1, 0];
        add({ beat: b, kind: 'punch', row: 1, col: cols[0] });
        add({ beat: b + 1, kind: 'punch', row: 1, col: cols[1] });
        add({ beat: b + 2, kind: 'punch', row: 1, col: cols[2] });
        add({ beat: b + 3, kind: 'punch', row: 2, col: move() });
        break;
      }
      case 'rush': {
        const c = move();
        for (let i = 0; i < 6; i++) add({ beat: b + i * 0.5, kind: 'punch', row: i === 5 ? 2 : headRow, col: i < 3 ? c : head });
        if (r() < 0.6) move();
        break;
      }
      case 'attack': {
        // 1~2박: 예비 동작(머리 노트 하나), 3박: 피하기, 4박: 카운터/탈출 어퍼
        const atk = pick(enemy.attacks, r());
        add({ beat: b, kind: 'punch', row: headRow, col: move() });
        const dodge = add({ beat: b + 2, kind: 'dodge', attack: atk });
        add({ beat: b + 3, kind: 'punch', row: 2, col: head, follow: dodge });
        break;
      }
      case 'rest':
        add({ beat: b, kind: 'punch', row: headRow, col: move() });
        break;
    }
  }
  return notes;
}

export function startRhythm(enemyId: string, seed: number, opts: { easy?: boolean } = {}): RhythmState {
  const enemy = RHYTHM_ENEMIES[enemyId];
  const bpm = opts.easy ? 84 : enemy.bpm;
  return {
    mode: 'battle', enemy, bpm,
    notes: buildChart(enemy, seed, opts),
    totalBeats: RHYTHM.countIn + enemy.measures * 4 + 1,
    headHp: enemy.headHp, poise: enemy.poise, staggerUntil: -1,
    combo: 0, maxCombo: 0, perfects: 0, goods: 0, misses: 0,
    hitsTaken: 0, bites: 0, extraNoise: 0, grabbed: false,
    outcome: 'ongoing', events: [],
  };
}

export function noiseNow(s: RhythmState) {
  return Math.floor(s.misses / RHYTHM.missesPerNoise) + s.extraNoise + (s.outcome === 'timeout' ? RHYTHM.noise.timeout : 0);
}

function keyMatches(n: Note, key: string): boolean {
  if (n.kind === 'punch') {
    const g = KEY_GRID[key];
    return !!g && g[0] === n.row && g[1] === n.col;
  }
  if (n.kind !== 'dodge') return false;
  const d = DODGE_KEYS[key];
  return !!d && (n.dodge ?? ATTACK_INFO[n.attack!].dodge).includes(d);
}

function isDodgeKey(key: string) { return key in DODGE_KEYS; }

function applyMiss(s: RhythmState, n: Note) {
  n.judge = 'miss';
  s.misses += 1;
  s.combo = 0;
  if (s.mode !== 'battle') {
    s.events.push({ t: 'judge', note: n, judge: 'miss', dmg: 0, counter: false });
    if (s.mode === 'story') {
      s.outcome = 'fail';
      s.events.push({ t: 'fail', note: n });
    }
    return;
  }
  if (n.kind === 'dodge') {
    const atk = n.attack!;
    s.hitsTaken += 1;
    let noise: number = RHYTHM.noise.swingHit;
    if (atk === 'bite') { s.bites += 1; noise = RHYTHM.noise.biteHit; }
    else if (atk === 'grab') { s.grabbed = true; noise = RHYTHM.noise.grabHit; }
    s.extraNoise += noise;
    s.events.push({ t: 'struck', attack: atk, noise });
  } else if (n.follow !== undefined && s.grabbed) {
    // 탈출 어퍼를 놓쳤다 → 물린다
    s.grabbed = false;
    s.bites += 1;
    s.hitsTaken += 1;
    s.extraNoise += RHYTHM.noise.biteHit;
    s.events.push({ t: 'struck', attack: 'bite', noise: RHYTHM.noise.biteHit });
  }
  s.events.push({ t: 'judge', note: n, judge: 'miss', dmg: 0, counter: false });
}

function applyHit(s: RhythmState, n: Note, judge: Judge, beat: number) {
  n.judge = judge;
  s.combo += 1;
  s.maxCombo = Math.max(s.maxCombo, s.combo);
  if (judge === 'perfect') s.perfects += 1; else s.goods += 1;
  if (n.kind === 'dodge') {
    s.events.push({ t: 'evaded', attack: n.attack!, blind: !!n.blind });
    s.events.push({ t: 'judge', note: n, judge, dmg: 0, counter: false });
    return;
  }
  if (s.mode !== 'battle') {
    s.events.push({ t: 'judge', note: n, judge, dmg: 0, counter: false });
    if (n.noEffect) s.events.push({ t: 'noEffect', note: n, text: n.noEffect });
    if (n.finisher) {
      s.events.push({ t: 'ko' });
      for (const x of s.notes) if (!x.judge) x.judge = 'perfect';
      s.outcome = 'clear';
      s.events.push({ t: 'clear' });
    }
    return;
  }
  const headRow = s.enemy.low ? 1 : 0;
  const stagger = beat <= s.staggerUntil;
  let counter = false;
  let mult = stagger ? 2 : 1;
  if (n.follow !== undefined) {
    const d = s.notes[n.follow];
    if (s.grabbed) {
      s.grabbed = false;
      s.events.push({ t: 'escape' });
    } else if (d.judge && d.judge !== 'miss') {
      counter = true;
      mult *= d.blind ? 3 : 2;
    }
  }
  let dmg = 0;
  if (n.row === 2) dmg = 2 * mult;
  else if (n.row === headRow) dmg = 1 * mult;
  else {
    // 몸통: 자세
    if (!stagger) {
      s.poise = Math.max(0, s.poise - 1);
      if (s.poise === 0) {
        s.staggerUntil = beat + RHYTHM.staggerBeats;
        s.poise = s.enemy.poise;
        s.events.push({ t: 'stagger' });
      }
    }
  }
  s.headHp = Math.max(0, s.headHp - dmg);
  s.events.push({ t: 'judge', note: n, judge, dmg, counter });
  if (s.headHp === 0) {
    s.outcome = 'ko';
    s.events.push({ t: 'ko' });
  }
}

/** 키를 누른 순간(박 단위 시각)에 판정한다 */
export function hit(s: RhythmState, rawKey: string, beat: number) {
  if (s.outcome !== 'ongoing') return;
  const key = rawKey.toLowerCase();
  const mpb = msPerBeat(s.bpm);
  const window = RHYTHM.goodMs / mpb;
  // 판정 창 안에서 이 키에 맞는 가장 가까운 노트
  let best: Note | null = null;
  for (const n of s.notes) {
    if (n.judge || n.holding || n.kind === 'stop') continue;
    if (n.beat - beat > window) break;
    if (Math.abs(n.beat - beat) <= window && keyMatches(n, key)) {
      if (!best || Math.abs(n.beat - beat) < Math.abs(best.beat - beat)) best = n;
    }
  }
  if (!best) {
    // 아무 노트에도 맞지 않는 헛손질: 콤보만 끊긴다 (피하기 키는 봐준다)
    if (!isDodgeKey(key) && key in KEY_GRID) { s.combo = 0; s.events.push({ t: 'stray', key }); }
    return;
  }
  const ms = Math.abs(best.beat - beat) * mpb;
  // 외눈 보스: 왼쪽으로 피하면 사각
  if (best.kind === 'dodge') best.blind = !!s.enemy.blindLeft && DODGE_KEYS[key] === 'left';
  const j: Judge = ms <= RHYTHM.perfectMs ? 'perfect' : 'good';
  if (best.hold) {
    best.holding = true;
    best.holdJudge = j;
    s.events.push({ t: 'holdStart', note: best });
    return;
  }
  applyHit(s, best, j, beat);
}

/** 키를 뗐다: 버티는 노트(클린치)를 너무 일찍 놓으면 놓침 */
export function release(s: RhythmState, rawKey: string, beat: number) {
  if (s.outcome !== 'ongoing') return;
  const key = rawKey.toLowerCase();
  for (const n of s.notes) {
    if (!n.holding || n.judge || !keyMatches(n, key)) continue;
    n.holding = false;
    if (beat < n.beat + n.hold! - 0.25) applyMiss(s, n);
    else { applyHit(s, n, n.holdJudge ?? 'good', beat); s.events.push({ t: 'holdDone', note: n }); }
  }
}

function finishIfDone(s: RhythmState) {
  if (s.mode === 'battle' || s.outcome !== 'ongoing') return;
  if (s.notes.every((n) => n.judge)) {
    s.outcome = 'clear';
    s.events.push({ t: 'clear' });
  }
}

/** 시간이 흐른다: 판정 창을 지난 노트는 놓침 */
export function advance(s: RhythmState, beat: number) {
  if (s.outcome !== 'ongoing') return;
  const window = RHYTHM.goodMs / msPerBeat(s.bpm);
  for (const n of s.notes) {
    if (n.judge) continue;
    if (n.holding) {
      if (beat >= n.beat + n.hold!) {
        n.holding = false;
        applyHit(s, n, n.holdJudge ?? 'good', beat);
        s.events.push({ t: 'holdDone', note: n });
        if (s.outcome !== 'ongoing') return;
      }
      continue;
    }
    if (n.kind === 'stop') {
      if (beat >= n.beat) {
        n.judge = 'perfect';
        s.events.push({ t: 'stopped', note: n });
      } else break;
      continue;
    }
    if (n.beat + window < beat) {
      applyMiss(s, n);
      if (s.outcome !== 'ongoing') return;
    } else break;
  }
  finishIfDone(s);
  if (s.mode === 'battle' && beat >= s.totalBeats && s.outcome === 'ongoing') {
    s.outcome = 'timeout';
    s.events.push({ t: 'timeout' });
  }
}

export function takeEvents(s: RhythmState) {
  const e = s.events;
  s.events = [];
  return e;
}
