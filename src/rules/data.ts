import type { CardId, EnemyDef, Intent, Tuning } from './types';

export const CARD_ORDER: CardId[] = ['jab', 'step', 'weave', 'clinch', 'body', 'upper', 'cork'];

export const CARDS: Record<CardId, { name: string; text: string; attack: boolean }> = {
  jab: { name: '잽', text: '자세 −1', attack: true },
  step: { name: '스텝', text: '물기·잡기·밀기 회피. 카운터는 사라짐', attack: false },
  weave: { name: '위빙', text: '물기 회피 → 카운터 (다음 공격 2배)', attack: false },
  clinch: { name: '클린치', text: '잡기를 무력화. 이후 공격 불가', attack: false },
  body: { name: '바디', text: '자세 −2', attack: true },
  upper: { name: '어퍼', text: '머리가 열렸으면 KO, 아니면 자세 −1', attack: true },
  cork: { name: '코크스크류', text: '자세 2 이하면 KO, 아니면 빗나감(소음 +1)', attack: true },
};

export const INTENTS: Record<Intent, { icon: string; name: string; text: string }> = {
  bite: { icon: '🦷', name: '물기', text: '맞으면 감염 타이머 시작 · 스텝/위빙으로 회피' },
  grab: { icon: '✋', name: '잡기', text: '맞으면 붙잡힘 → 다음 라운드 물기 확정 · 클린치/스텝' },
  push: { icon: '↔', name: '밀기', text: '맞으면 벽에 부딪혀 소음 · 스텝으로 회피' },
  stagger: { icon: '😶', name: '비틀거림', text: '빈틈! 라운드 시작에 자세 −1' },
};

export const DEFAULT_TUNING: Tuning = {
  stamina: 3,
  maxRounds: 3,
  costs: { jab: 1, step: 1, weave: 1, clinch: 1, body: 2, upper: 2, cork: 3 },
  upperKoPoise: 0,
  corkKoPoise: 2,
  counterKoBonus: 3,
  noise: { perExtraRound: 1, corkMiss: 1, pushHit: 2, biteHit: 1, timeout: 3 },
};

export const ENEMIES: EnemyDef[] = [
  {
    id: 'normal',
    name: '일반 감염자',
    desc: '복도에서 가장 흔한 감염자. 예고를 읽고 한 번에 끝내자.',
    poise: 3,
    intents: { bite: 4, grab: 3, push: 2, stagger: 1 },
  },
  {
    id: 'crawler',
    name: '기어 오는 감염자',
    desc: '낮게 기어 온다. 바디는 반만 들어가고 코크스크류는 빗나간다. 어퍼로 올려 쳐라.',
    poise: 2,
    intents: { grab: 5, bite: 3, stagger: 2 },
    lowTarget: true,
  },
  {
    id: 'horyong',
    name: '감염된 호룡',
    desc: '보스. 외눈이다 — 물기를 위빙으로 피하면 안 보이는 쪽으로 들어가 한 라운드 동안 놓친다.',
    poise: 6,
    maxRounds: 5,
    intents: { bite: 3, grab: 2, push: 3 },
    blindSide: true,
    boss: true,
  },
];

export function cloneTuning(t: Tuning): Tuning {
  return { ...t, costs: { ...t.costs }, noise: { ...t.noise } };
}

export function cloneEnemy(e: EnemyDef): EnemyDef {
  return { ...e, intents: { ...e.intents } };
}
