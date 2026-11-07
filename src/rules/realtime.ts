// 실시간 1인칭 복싱 규칙. 화면과 분리되어 있어 테스트로 시간을 흘려 볼 수 있다.
//
// 공격 키 3×3 = 방향(열) × 공격 방법(행)
//   Q W E   머리: 왼 훅 / 잽 / 오른 훅      — 감염자 머리가 있는 열을 쳐야 맞는다
//   A S D   몸통: 왼 바디 / 명치 / 오른 바디 — 자세를 깎는다. 자세 0 = 비틀거림(머리 고정, 피해 2배)
//   Z X C   어퍼: 왼 / 턱 / 오른           — 느리고 세다. 공격 준비 중인 머리를 맞히면 공격을 끊는다
// 피하기 ← ↓ →. 감염자의 예비 동작을 보고 맞는 방향으로 피하면 '빈틈'(피해 2배)이 열린다.
// 감염자는 머리·목만 유효하다 — 머리 체력이 0이 되어야 KO.

import { nextRandom } from './rng';

export type Col = 0 | 1 | 2;
export type Row = 0 | 1 | 2; // 0 머리, 1 몸통, 2 어퍼
export type DodgeDir = 'left' | 'duck' | 'right';
export type ZAttack = 'swingL' | 'swingR' | 'bite' | 'grab';

export const KEY_GRID: Record<string, [Row, Col]> = {
  q: [0, 0], w: [0, 1], e: [0, 2],
  a: [1, 0], s: [1, 1], d: [1, 2],
  z: [2, 0], x: [2, 1], c: [2, 2],
};

export const MOVE_NAMES: string[][] = [
  ['왼 훅', '잽', '오른 훅'],
  ['왼 바디', '명치', '오른 바디'],
  ['왼 어퍼', '턱 어퍼', '오른 어퍼'],
];

export const ATTACK_INFO: Record<ZAttack, { name: string; dodge: DodgeDir[]; hint: string }> = {
  swingL: { name: '왼쪽 할퀴기', dodge: ['right', 'duck'], hint: '→ 또는 ↓' },
  swingR: { name: '오른쪽 할퀴기', dodge: ['left', 'duck'], hint: '← 또는 ↓' },
  bite: { name: '물기', dodge: ['left', 'right'], hint: '← 또는 →' },
  grab: { name: '잡기', dodge: ['duck'], hint: '↓' },
};

export interface RtEnemy {
  id: string;
  name: string;
  desc: string;
  headHp: number;
  poise: number;
  /** 예비 동작 시간(ms). 짧을수록 빠르다 */
  windup: Record<ZAttack, number>;
  attacks: Partial<Record<ZAttack, number>>;
  idle: [number, number];
  sway: [number, number];
  timeLimit: number;
  /** 낮게 기어 온다: 머리가 몸통 높이(A S D)에 있고, Q W E는 머리 위로 빗나간다 */
  low?: boolean;
  /** 외눈: 왼쪽(←)으로 피하면 사각으로 들어가 빈틈이 길다 */
  blindLeft?: boolean;
  boss?: boolean;
}

export const RT_ENEMIES: Record<string, RtEnemy> = {
  normal: {
    id: 'normal', name: '일반 감염자', desc: '머리를 좌우로 흔든다. 머리가 있는 열을 쳐라.',
    headHp: 8, poise: 4,
    windup: { swingL: 750, swingR: 750, bite: 800, grab: 900 },
    attacks: { swingL: 3, swingR: 3, bite: 4, grab: 2 },
    idle: [900, 1700], sway: [700, 1300], timeLimit: 18000,
  },
  crawler: {
    id: 'crawler', name: '기어 오는 감염자', desc: '바닥을 긴다. 머리는 몸통 높이(A S D), 어퍼(Z X C)가 잘 들어간다. Q W E는 빗나간다.',
    headHp: 6, poise: 99,
    windup: { swingL: 700, swingR: 700, bite: 700, grab: 650 },
    attacks: { grab: 4, bite: 3, swingL: 1, swingR: 1 },
    idle: [800, 1500], sway: [600, 1100], timeLimit: 15000, low: true,
  },
  horyong: {
    id: 'horyong', name: '감염된 호룡', desc: '보스. 외눈 — 왼쪽(←)으로 피하면 사각으로 들어가 빈틈이 길다.',
    headHp: 18, poise: 5,
    windup: { swingL: 620, swingR: 620, bite: 680, grab: 760 },
    attacks: { swingL: 3, swingR: 3, bite: 3, grab: 2 },
    idle: [650, 1300], sway: [500, 1000], timeLimit: 32000, blindLeft: true, boss: true,
  },
};

export const RT = {
  staminaMax: 6,
  staminaRegen: 1.8, // 초당
  cost: [1, 1.5, 2] as const, // 행별: 머리, 몸통, 어퍼
  dodgeCost: 1,
  impact: [80, 100, 230] as const, // 주먹이 닿기까지 ms
  recover: [200, 260, 520] as const, // 다음 행동까지 ms (impact 포함)
  dodgeActive: 380,
  dodgeTotal: 480,
  damage: [1, 0, 2] as const, // 머리 피해 (몸통은 자세)
  poiseRegenMs: 1200, // 자세가 이 간격마다 1씩 회복
  counterMs: 950,
  blindCounterMs: 1700,
  staggerMs: 1300,
  interruptMs: 900,
  recoverMs: 650,
  stunMs: 500,
  noisePerSegment: 6000, // 6초마다 소음 +1
  noise: { swingHit: 2, biteHit: 1, grabHit: 1, upperWhiff: 1, timeout: 3 },
};

export type RtEvent =
  | { t: 'punch'; row: Row; col: Col; name: string }
  | { t: 'hit'; row: Row; col: Col; dmg: number; counter: boolean; poise?: number }
  | { t: 'whiff'; row: Row; col: Col; noise: number }
  | { t: 'tired' }
  | { t: 'dodge'; dir: DodgeDir }
  | { t: 'windup'; attack: ZAttack; ms: number }
  | { t: 'evaded'; attack: ZAttack; blind: boolean }
  | { t: 'struck'; attack: ZAttack; noise: number }
  | { t: 'stagger' }
  | { t: 'interrupt' }
  | { t: 'sway'; col: Col }
  | { t: 'ko' }
  | { t: 'timeout' };

export interface RtState {
  enemy: RtEnemy;
  t: number;
  headHp: number;
  poise: number;
  headCol: Col;
  nextSway: number;
  nextPoiseRegen: number;
  z: { phase: 'idle' | 'windup' | 'recover' | 'stagger' | 'down'; until: number; attack?: ZAttack };
  p: {
    phase: 'ready' | 'punch' | 'dodge' | 'stun';
    until: number;
    row?: Row; col?: Col; impactAt?: number; resolved?: boolean;
    dodge?: DodgeDir; dodgeEnd?: number;
  };
  stamina: number;
  counterUntil: number;
  grabbed: boolean;
  extraNoise: number;
  bites: number;
  hitsTaken: number;
  outcome: 'ongoing' | 'ko' | 'timeout';
  rng: number;
  /** 연출 속도 배율 (튜토리얼은 감염자가 느리다) */
  slow: number;
  events: RtEvent[];
}

function rand(s: RtState): number {
  const [v, n] = nextRandom(s.rng);
  s.rng = n;
  return v;
}

function between(s: RtState, [a, b]: [number, number]) {
  return a + rand(s) * (b - a);
}

export function startRt(enemyId: string, seed: number, opts: { slow?: number } = {}): RtState {
  const enemy = RT_ENEMIES[enemyId];
  const s: RtState = {
    enemy, t: 0, headHp: enemy.headHp, poise: enemy.poise, headCol: 1, nextSway: 0, nextPoiseRegen: 0,
    z: { phase: 'idle', until: 0 }, p: { phase: 'ready', until: 0 },
    stamina: RT.staminaMax, counterUntil: 0, grabbed: false, extraNoise: 0, bites: 0, hitsTaken: 0,
    outcome: 'ongoing', rng: seed | 0, slow: opts.slow ?? 1, events: [],
  };
  s.z.until = between(s, enemy.idle) * s.slow + 600;
  s.nextSway = between(s, enemy.sway) * s.slow;
  return s;
}

/** 머리를 맞히려면 눌러야 하는 행 (기어 오는 감염자는 몸통 높이) */
export function headRow(e: RtEnemy): Row { return e.low ? 1 : 0; }

export function isOpen(s: RtState) {
  return s.z.phase === 'stagger' || s.t < s.counterUntil;
}

/** 지금까지의 소음 (KO 시점 기준) */
export function noiseNow(s: RtState) {
  if (s.outcome === 'timeout') return RT.noise.timeout + s.extraNoise;
  return Math.floor(s.t / RT.noisePerSegment) + s.extraNoise;
}

export function press(s: RtState, key: string) {
  if (s.outcome !== 'ongoing') return;
  const k = key.toLowerCase();
  if (s.p.phase !== 'ready') return;
  if (k in KEY_GRID) {
    const [row, col] = KEY_GRID[k];
    if (s.stamina < RT.cost[row]) { s.events.push({ t: 'tired' }); return; }
    s.stamina -= RT.cost[row];
    s.p = { phase: 'punch', until: s.t + RT.recover[row], row, col, impactAt: s.t + RT.impact[row], resolved: false };
    s.events.push({ t: 'punch', row, col, name: MOVE_NAMES[row][col] });
    return;
  }
  const dir: DodgeDir | null =
    k === 'arrowleft' ? 'left' : k === 'arrowright' ? 'right' : k === 'arrowdown' || k === ' ' ? 'duck' : null;
  if (!dir) return;
  if (s.grabbed) return; // 붙잡히면 피할 수 없다 — 어퍼로 끊어야 한다
  if (s.stamina < RT.dodgeCost) { s.events.push({ t: 'tired' }); return; }
  s.stamina -= RT.dodgeCost;
  s.p = { phase: 'dodge', until: s.t + RT.dodgeTotal, dodge: dir, dodgeEnd: s.t + RT.dodgeActive };
  s.events.push({ t: 'dodge', dir });
}

function resolvePunch(s: RtState) {
  const row = s.p.row!, col = s.p.col!;
  const e = s.enemy;
  const open = isOpen(s);
  const mult = open ? 2 : 1;
  const hr = headRow(e);

  // 머리를 노린 공격: 머리 행(또는 어퍼)이 머리가 있는 열에 맞아야 한다
  if (row === hr || row === 2) {
    if (col !== s.headCol || (e.low && row === 0)) {
      const noise = row === 2 ? RT.noise.upperWhiff : 0;
      s.extraNoise += noise;
      s.events.push({ t: 'whiff', row, col, noise });
      return;
    }
    const dmg = (row === 2 ? RT.damage[2] : RT.damage[0]) * mult;
    s.headHp = Math.max(0, s.headHp - dmg);
    s.events.push({ t: 'hit', row, col, dmg, counter: open });
    if (row === 2 && s.z.phase === 'windup') {
      // 턱을 올려쳐 공격을 끊는다
      s.z = { phase: 'recover', until: s.t + RT.interruptMs * s.slow };
      s.grabbed = false;
      s.counterUntil = Math.max(s.counterUntil, s.t + RT.interruptMs);
      s.events.push({ t: 'interrupt' });
    }
    if (s.headHp <= 0) {
      s.outcome = 'ko';
      s.z = { phase: 'down', until: Infinity };
      s.events.push({ t: 'ko' });
    }
    return;
  }

  if (e.low && row === 0) {
    s.events.push({ t: 'whiff', row, col, noise: 0 });
    return;
  }

  // 몸통: 자세를 깎는다 (어느 열이든 맞는다)
  if (s.z.phase === 'stagger') {
    s.events.push({ t: 'hit', row, col, dmg: 0, counter: true, poise: 0 });
    return;
  }
  s.poise = Math.max(0, s.poise - (open ? 2 : 1));
  s.nextPoiseRegen = s.t + RT.poiseRegenMs;
  s.events.push({ t: 'hit', row, col, dmg: 0, counter: open, poise: s.poise });
  if (s.poise === 0) {
    s.z = { phase: 'stagger', until: s.t + RT.staggerMs };
    s.grabbed = false;
    s.headCol = 1;
    s.events.push({ t: 'stagger' });
  }
}

function zombieStrike(s: RtState) {
  const atk = s.z.attack!;
  const info = ATTACK_INFO[atk];
  const p = s.p;
  const dodging = p.phase === 'dodge' && p.dodgeEnd !== undefined && s.t <= p.dodgeEnd;
  if (!s.grabbed && dodging && info.dodge.includes(p.dodge!)) {
    const blind = !!s.enemy.blindLeft && p.dodge === 'left';
    s.counterUntil = s.t + (blind ? RT.blindCounterMs : RT.counterMs);
    s.z = { phase: 'recover', until: s.t + (blind ? RT.blindCounterMs : RT.recoverMs + 250) * Math.min(1, s.slow) };
    s.events.push({ t: 'evaded', attack: atk, blind });
    return;
  }
  s.hitsTaken += 1;
  let noise = 0;
  if (atk === 'bite') {
    s.bites += 1;
    s.grabbed = false;
    noise = RT.noise.biteHit;
  } else if (atk === 'grab') {
    s.grabbed = true;
    noise = RT.noise.grabHit;
  } else noise = RT.noise.swingHit;
  s.extraNoise += noise;
  s.p = { phase: 'stun', until: s.t + RT.stunMs };
  s.events.push({ t: 'struck', attack: atk, noise });
  if (s.grabbed) {
    // 붙잡혔다: 곧바로 물려 한다. 어퍼로 끊어야 한다
    const ms = 1000 * s.slow; // 경직(500) + 어퍼(230)보다 길어야 빠져나갈 수 있다
    s.z = { phase: 'windup', until: s.t + ms, attack: 'bite' };
    s.events.push({ t: 'windup', attack: 'bite', ms });
  } else {
    s.z = { phase: 'recover', until: s.t + RT.recoverMs * s.slow };
  }
}

export function tick(s: RtState, dt: number) {
  if (s.outcome !== 'ongoing') return;
  const end = s.t + dt;
  // 작은 단계로 나눠 순서를 지킨다
  while (s.t < end && s.outcome === 'ongoing') {
    s.t = Math.min(end, s.t + 10);
    s.stamina = Math.min(RT.staminaMax, s.stamina + (RT.staminaRegen * 10) / 1000);

    // 태리
    if (s.p.phase === 'punch' && !s.p.resolved && s.t >= s.p.impactAt!) {
      s.p.resolved = true;
      resolvePunch(s);
      if (s.outcome !== 'ongoing') break;
    }
    if (s.p.phase !== 'ready' && s.t >= s.p.until) s.p = { phase: 'ready', until: s.t };

    // 감염자: 자세는 시간이 지나면 돌아온다 (몸통만 연타해서는 무너지지 않는다)
    if (s.z.phase !== 'stagger' && s.poise < s.enemy.poise && s.t >= s.nextPoiseRegen) {
      s.poise += 1;
      s.nextPoiseRegen = s.t + RT.poiseRegenMs;
    }
    const z = s.z;
    if (z.phase === 'idle' || z.phase === 'recover') {
      // 주먹이 날아가는 동안에는 머리를 옮기지 않는다 (누른 순간 맞던 곳이 맞아야 공정하다)
      if (z.phase === 'idle' && s.t >= s.nextSway && !isOpen(s) && s.p.phase !== 'punch') {
        const options = ([0, 1, 2] as Col[]).filter((c) => c !== s.headCol);
        s.headCol = options[Math.floor(rand(s) * options.length)];
        s.nextSway = s.t + between(s, s.enemy.sway) * s.slow;
        s.events.push({ t: 'sway', col: s.headCol });
      }
      if (s.t >= z.until) {
        if (z.phase === 'recover') {
          s.z = { phase: 'idle', until: s.t + between(s, s.enemy.idle) * s.slow };
        } else {
          const entries = Object.entries(s.enemy.attacks) as [ZAttack, number][];
          const total = entries.reduce((a, [, w]) => a + w, 0);
          let r = rand(s) * total;
          let atk = entries[0][0];
          for (const [k, w] of entries) { r -= w; if (r < 0) { atk = k; break; } }
          const ms = s.enemy.windup[atk] * s.slow;
          s.z = { phase: 'windup', until: s.t + ms, attack: atk };
          s.events.push({ t: 'windup', attack: atk, ms });
        }
      }
    } else if (z.phase === 'windup' && s.t >= z.until) {
      zombieStrike(s);
    } else if (z.phase === 'stagger' && s.t >= z.until) {
      s.poise = s.enemy.poise;
      s.z = { phase: 'idle', until: s.t + 500 };
    }

    if (s.t >= s.enemy.timeLimit * Math.max(1, s.slow) && s.outcome === 'ongoing') {
      s.outcome = 'timeout';
      s.events.push({ t: 'timeout' });
    }
  }
}

export function takeEvents(s: RtState): RtEvent[] {
  const e = s.events;
  s.events = [];
  return e;
}
