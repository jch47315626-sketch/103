// 밤 탐사 규칙: 15층 복도 한 층, 문 15개, 소음, 계단실 감염자.
// 이동은 시간이 들지 않고, 문 앞 행동(쪽지·문 열기)이 30분씩 쓴다.
// 행동이 끝날 때마다 소음에 따라 계단실 감염자가 깨어나 태리 쪽으로 한 칸씩 온다.

import { nextRandom } from './rng';

export type DoorKind = 'home' | 'empty' | 'survivor' | 'hidden' | 'infected' | 'blood' | 'cleared';

/** 채아의 공책 표시: 빨강 동그라미 = 사람, 파랑 세모 = 소리만, X = 피 */
export type Mark = 'none' | 'person' | 'sound' | 'blood' | 'looted' | 'home';

export interface Loot { water: number; food: number; meds: number; special?: string }

export interface Door {
  no: string;
  x: number;
  kind: DoorKind;
  mark: Mark;
  trust: number;
  opened: boolean;
  loot?: Loot;
  enemy?: string;
  label?: string;
}

export interface Walker { id: number; x: number; active: boolean; enemy: string }

export interface NightState {
  seed: number;
  taeriX: number;
  doors: Door[];
  walkers: Walker[];
  tick: number;
  maxTick: number;
  noise: number;
  water: number;
  food: number;
  meds: number;
  bites: number;
  specials: string[];
  over: 'no' | 'dawn' | 'horde';
}

export const EAST_STAIRS = 0;
export const WEST_STAIRS = 16;
export const WAKE_NOISE = 3;
export const ALL_WAKE_NOISE = 6;
export const HORDE_NOISE = 9;

const NAMES: Partial<Record<DoorKind, string[]>> = {
  survivor: ['노부부', '고3 수험생', '야간 근무 간호사'],
  hidden: ['숨죽인 가족', '어린아이 둘', '대답 없는 할머니', '혼자 사는 청년'],
};

function shuffle<T>(arr: T[], seed: number): [T[], number] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    const [r, n] = nextRandom(s);
    s = n;
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return [a, s];
}

export function createNight(seed: number): NightState {
  type Spec = Omit<Door, 'no' | 'x' | 'mark' | 'trust' | 'opened'>;
  const pool: Spec[] = [
    { kind: 'hidden' }, { kind: 'hidden' }, { kind: 'hidden' }, { kind: 'hidden' },
    { kind: 'survivor' }, { kind: 'survivor' },
    { kind: 'empty', loot: { water: 2, food: 0, meds: 0 } },
    { kind: 'empty', loot: { water: 0, food: 1, meds: 1 } },
    { kind: 'empty', loot: { water: 1, food: 1, meds: 0 } },
    { kind: 'infected', enemy: 'normal' },
    { kind: 'infected', enemy: 'crawler' },
    { kind: 'blood' },
  ];
  let [order, s] = shuffle(pool, seed);
  const names = { survivor: [...NAMES.survivor!], hidden: [...NAMES.hidden!] };
  const doors: Door[] = [];
  for (let x = 1; x <= 15; x++) {
    const no = `15${String(x).padStart(2, '0')}`;
    let spec: Spec;
    if (x === 1) spec = { kind: 'cleared' }; // 프롤로그에서 원펀치로 끝낸 1501호
    else if (x === 2) spec = { kind: 'home' };
    else if (x === 3) spec = { kind: 'empty', loot: { water: 0, food: 2, meds: 0, special: '1503호 미역국' } };
    else spec = order.shift()!;
    const label =
      spec.kind === 'survivor' ? names.survivor.shift() : spec.kind === 'hidden' ? names.hidden.shift() : undefined;
    doors.push({
      ...spec, no, x, label,
      mark: x === 2 ? 'home' : x === 1 ? 'blood' : 'none',
      trust: 0, opened: x <= 2,
    });
  }
  void s;
  return {
    seed,
    taeriX: 2,
    doors,
    walkers: [
      { id: 1, x: EAST_STAIRS, active: false, enemy: 'normal' },
      { id: 2, x: WEST_STAIRS, active: false, enemy: 'crawler' },
      { id: 3, x: WEST_STAIRS, active: false, enemy: 'normal' },
    ],
    tick: 0,
    maxTick: 12,
    noise: 0,
    water: 1,
    food: 1,
    meds: 0,
    bites: 0,
    specials: [],
    over: 'no',
  };
}

export function clockText(tick: number): string {
  const min = tick * 30;
  const h = Math.floor(min / 60);
  return `${String(h).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

export function doorAt(s: NightState, x: number): Door | undefined {
  return s.doors.find((d) => d.x === x);
}

export function walkerAt(s: NightState, x: number): Walker | undefined {
  return s.walkers.find((w) => w.active && w.x === x);
}

export interface StepResult {
  state: NightState;
  messages: string[];
  /** 전투가 시작되면 적 id와 상대(문 or 복도 감염자) */
  combat?: { enemy: string; walkerId?: number; doorX?: number };
  moved: number[];
  woke: number[];
}

function clone(s: NightState): NightState {
  return {
    ...s,
    doors: s.doors.map((d) => ({ ...d, loot: d.loot ? { ...d.loot } : undefined })),
    walkers: s.walkers.map((w) => ({ ...w })),
    specials: [...s.specials],
  };
}

/** 시간이 30분 흐른다: 소음에 따라 감염자가 깨고 움직인다 */
function passTime(s: NightState, r: StepResult) {
  s.tick += 1;
  const dormant = s.walkers.filter((w) => !w.active);
  if (s.noise >= ALL_WAKE_NOISE) {
    for (const w of dormant) { w.active = true; r.woke.push(w.id); }
  } else if (s.noise >= WAKE_NOISE && dormant.length) {
    const nearest = [...dormant].sort((a, b) => Math.abs(a.x - s.taeriX) - Math.abs(b.x - s.taeriX))[0];
    nearest.active = true;
    r.woke.push(nearest.id);
  }
  if (r.woke.length) r.messages.push(r.woke.length > 1 ? '계단실 여러 곳에서 무언가 깨어났다.' : '계단실에서 무언가 깨어났다.');
  for (const w of s.walkers) {
    if (!w.active || r.woke.includes(w.id)) continue;
    if (w.x !== s.taeriX) {
      w.x += Math.sign(s.taeriX - w.x);
      r.moved.push(w.id);
    }
  }
  if (s.noise >= HORDE_NOISE) {
    s.over = 'horde';
    r.messages.push('소리가 아래층까지 내려갔다. 계단을 타고 무리가 올라온다.');
    return;
  }
  const hit = s.walkers.find((w) => w.active && w.x === s.taeriX);
  if (hit && !r.combat) {
    r.combat = { enemy: hit.enemy, walkerId: hit.id };
    r.messages.push('복도 감염자가 태리를 찾아냈다!');
  }
  if (s.tick >= s.maxTick && !r.combat) {
    s.over = 'dawn';
  }
}

export function move(prev: NightState, dx: -1 | 1): StepResult {
  const s = clone(prev);
  const r: StepResult = { state: s, messages: [], moved: [], woke: [] };
  const nx = s.taeriX + dx;
  if (s.over !== 'no' || nx < 1 || nx > 15) return r;
  s.taeriX = nx;
  const w = walkerAt(s, nx);
  if (w) r.combat = { enemy: w.enemy, walkerId: w.id };
  return r;
}

export type DoorAction = 'note' | 'open' | 'rest';

export function act(prev: NightState, action: DoorAction): StepResult {
  const s = clone(prev);
  const r: StepResult = { state: s, messages: [], moved: [], woke: [] };
  if (s.over !== 'no') return r;
  const d = doorAt(s, s.taeriX)!;

  if (action === 'rest') {
    r.messages.push('숨을 죽이고 30분을 기다린다.');
  } else if (action === 'note') {
    if (d.kind === 'survivor' || d.kind === 'hidden') {
      if (d.trust < 3) d.trust += 1;
      if (d.mark === 'none') d.mark = 'sound';
      r.messages.push(
        d.trust >= 2
          ? `${d.no}호 — 문 아래로 쪽지가 되돌아왔다. "새벽에 불 켤게요."`
          : `${d.no}호 — 쪽지를 밀어 넣었다. 안에서 숨죽이는 소리가 난다.`,
      );
    } else if (d.kind === 'infected') {
      d.mark = 'sound';
      r.messages.push(`${d.no}호 — 쪽지가 안으로 빨려 들어갔다. 문 너머에서 긁는 소리.`);
    } else {
      r.messages.push(`${d.no}호 — 쪽지를 넣었다. 아무 반응이 없다.`);
    }
  } else {
    s.noise += 1;
    if (d.kind === 'infected') {
      d.opened = true;
      r.combat = { enemy: d.enemy!, doorX: d.x };
      r.messages.push(`${d.no}호 — 문이 열리자마자 무언가 튀어나온다!`);
    } else if (d.kind === 'hidden') {
      d.mark = 'sound';
      r.messages.push(`${d.no}호 — 잠겨 있다. 안에서 누군가 숨을 멈췄다. (쪽지가 낫겠다)`);
    } else if (d.kind === 'survivor') {
      d.opened = true;
      d.mark = 'person';
      d.trust = Math.min(3, d.trust + 1);
      r.messages.push(`${d.no}호 — 체인 너머로 ${d.label}이(가) 얼굴을 내민다. 경계하고 있다.`);
    } else if (d.kind === 'empty') {
      d.opened = true;
      d.mark = 'looted';
      const l = d.loot!;
      s.water += l.water; s.food += l.food; s.meds += l.meds;
      if (l.special) s.specials.push(l.special);
      const got = [l.water && `물 ${l.water}`, l.food && `식량 ${l.food}`, l.meds && `약 ${l.meds}`].filter(Boolean).join(', ');
      r.messages.push(`${d.no}호 — 빈집. ${got || '쓸 만한 게 없다'}${l.special ? ` · 「${l.special}」 발견` : ''}`);
      d.loot = { water: 0, food: 0, meds: 0 };
    } else if (d.kind === 'blood') {
      d.opened = true;
      d.mark = 'blood';
      r.messages.push(`${d.no}호 — 창문까지 피가 번져 있다. 문을 닫는다.`);
    } else {
      r.messages.push(`${d.no}호 — 이미 확인한 집이다.`);
    }
  }
  passTime(s, r);
  return r;
}

export interface CombatSummary { outcome: 'ko' | 'timeout'; noise: number; bites: number }

export function afterCombat(
  prev: NightState,
  combat: NonNullable<StepResult['combat']>,
  res: CombatSummary,
): StepResult {
  const s = clone(prev);
  const r: StepResult = { state: s, messages: [], moved: [], woke: [] };
  s.noise += res.noise;
  s.bites += res.bites;
  if (res.outcome === 'ko') {
    if (combat.walkerId) s.walkers = s.walkers.filter((w) => w.id !== combat.walkerId);
    if (combat.doorX) {
      const d = doorAt(s, combat.doorX)!;
      d.kind = 'cleared';
      d.mark = 'blood';
    }
    r.messages.push(res.noise === 0 ? '소리 없이 끝냈다.' : `끝냈다. 하지만 소음 +${res.noise}.`);
  } else {
    r.messages.push(`떼어 내고 물러섰다. 소음 +${res.noise}.`);
    // 못 끝낸 감염자는 한 칸 밀려나 복도에 남는다
    if (combat.walkerId) {
      const w = s.walkers.find((x) => x.id === combat.walkerId)!;
      w.x = s.taeriX + (w.x <= s.taeriX ? -1 : 1);
    }
    if (combat.doorX) {
      const d = doorAt(s, combat.doorX)!;
      d.kind = 'cleared';
      s.walkers.push({ id: 100 + combat.doorX, x: Math.min(15, d.x + 1), active: true, enemy: d.enemy! });
    }
  }
  passTime(s, r);
  return r;
}

/** 새벽 6시 신호에 대답하는 집 */
export function answeringDoors(s: NightState): Door[] {
  return s.doors.filter((d) => (d.kind === 'survivor' || d.kind === 'hidden') && d.trust >= 2);
}
