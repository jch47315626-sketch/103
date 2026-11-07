// 카드형 3라운드 복싱 전투 규칙.
//
// 흐름: 감염자가 행동을 예고 → 태리가 스태미나 안에서 카드를 순서대로 낸다 →
// 카드가 차례로 처리되고, 그 사이에 KO가 나면 감염자의 행동은 취소된다 →
// 아니면 라운드 끝에 감염자가 예고한 행동을 한다.
//
// 감염자에게는 HP가 없고 '자세'만 있다. 몸통 공격으로 자세를 무너뜨려 머리를 열고,
// 머리로만 KO를 낸다. 코크스크류는 확실하지만 느려서 예고된 공격을 먼저 맞는다.
// 모든 함수는 입력을 바꾸지 않고 새 상태를 돌려준다.

import { CARDS, INTENTS } from './data';
import { pickWeighted } from './rng';
import type { CardId, CombatState, EnemyDef, Intent, RoundEvent, Tuning } from './types';

export function startCombat(enemy: EnemyDef, tuning: Tuning, seed: number): CombatState {
  const [intent, rng] = pickWeighted<Intent>(enemy.intents, seed);
  return {
    enemy,
    maxRounds: enemy.maxRounds ?? tuning.maxRounds,
    poise: enemy.poise,
    round: 1,
    intent,
    grabbed: false,
    lostTrack: false,
    noise: 0,
    hitsTaken: 0,
    bites: 0,
    outcome: 'ongoing',
    rng,
    log: [],
  };
}

export function planCost(plan: CardId[], tuning: Tuning): number {
  return plan.reduce((sum, c) => sum + tuning.costs[c], 0);
}

/** 계획이 규칙상 가능한지. 불가능하면 이유를, 가능하면 null을 돌려준다. */
export function validatePlan(state: CombatState, plan: CardId[], tuning: Tuning): string | null {
  if (state.outcome !== 'ongoing') return '전투가 끝났다';
  if (planCost(plan, tuning) > tuning.stamina) return '스태미나 부족';
  let clinched = false;
  for (const card of plan) {
    if (clinched && CARDS[card].attack) return '클린치 뒤에는 공격할 수 없다';
    if (state.grabbed && (card === 'step' || card === 'weave')) return '붙잡혀서 피할 수 없다 — 클린치로 풀어야 한다';
    if (card === 'clinch') clinched = true;
  }
  return null;
}

/** 다음에 낼 수 있는 카드인지 (손패 버튼 활성화용) */
export function canAppend(state: CombatState, plan: CardId[], card: CardId, tuning: Tuning): boolean {
  return validatePlan(state, [...plan, card], tuning) === null;
}

export interface RoundResult {
  state: CombatState;
  events: RoundEvent[];
}

export function resolveRound(prev: CombatState, plan: CardId[], tuning: Tuning): RoundResult {
  const err = validatePlan(prev, plan, tuning);
  if (err) throw new Error(err);

  const s: CombatState = { ...prev, log: [...prev.log] };
  const e = s.enemy;
  const events: RoundEvent[] = [];
  const say = (text: string, kind: RoundEvent['kind']) => events.push({ text, kind });

  const headOpen = () => s.poise <= 0;
  const damage = (n: number, counter: boolean) => {
    const dealt = counter ? n * 2 : n;
    s.poise = Math.max(0, s.poise - dealt);
    return dealt;
  };

  if (s.intent === 'stagger') {
    s.poise = Math.max(0, s.poise - 1);
    say(`${e.name}이(가) 비틀거린다 — 자세 −1`, 'info');
  }

  let counter = false;
  let evaded = false;
  let ko = false;
  let enemyActed = false;

  const enemyAct = () => {
    enemyActed = true;
    if (s.intent === 'stagger') return;
    if (evaded) {
      say(`${INTENTS[s.intent].name} — 허공을 가른다`, 'evade');
      return;
    }
    s.hitsTaken += 1;
    if (s.intent === 'bite') {
      s.bites += 1;
      s.grabbed = false;
      s.noise += tuning.noise.biteHit;
      say(`물렸다! 감염 타이머 시작 · 소음 +${tuning.noise.biteHit}`, 'hurt');
    } else if (s.intent === 'grab') {
      s.grabbed = true;
      say('붙잡혔다! 다음 라운드에 반드시 문다', 'hurt');
    } else if (s.intent === 'push') {
      s.noise += tuning.noise.pushHit;
      say(`밀려서 철문에 부딪혔다 · 소음 +${tuning.noise.pushHit}`, 'hurt');
    }
  };

  for (const card of plan) {
    const name = CARDS[card].name;
    const ctr = counter ? ' (카운터!)' : '';
    switch (card) {
      case 'jab': {
        const d = damage(1, counter);
        counter = false;
        say(`${name}${ctr} — 자세 −${d}`, 'hit');
        break;
      }
      case 'body': {
        const d = damage(e.lowTarget ? 1 : 2, counter);
        counter = false;
        say(`${name}${ctr} — 자세 −${d}${e.lowTarget ? ' (낮아서 반만 들어감)' : ''}`, 'hit');
        break;
      }
      case 'upper': {
        const limit = tuning.upperKoPoise + (counter ? tuning.counterKoBonus : 0);
        if (headOpen() || s.poise <= limit) {
          ko = true;
          say(`${name}${ctr} — 턱이 들린다. KO!`, 'ko');
        } else {
          const d = damage(e.lowTarget ? 2 : 1, counter);
          say(`${name}${ctr} — 머리가 닫혀 있다. 자세 −${d}`, 'hit');
        }
        counter = false;
        break;
      }
      case 'cork': {
        // 큰 펀치라 느리다: 피하지 못한 예고 공격이 먼저 들어온다
        if (!enemyActed && !evaded && s.intent !== 'stagger') {
          say(`${name} — 크게 감아 치는 사이에…`, 'info');
          enemyAct();
        }
        const limit = tuning.corkKoPoise + (counter ? tuning.counterKoBonus : 0);
        if (!e.lowTarget && s.poise <= limit) {
          ko = true;
          say(`${name}${ctr} — 관자놀이에 꽂힌다. KO!`, 'ko');
        } else {
          s.poise = Math.max(0, s.poise - 1);
          s.noise += tuning.noise.corkMiss;
          say(
            `${name} — ${e.lowTarget ? '너무 낮아서 ' : ''}빗나갔다! 자세 −1, 소음 +${tuning.noise.corkMiss}`,
            'miss',
          );
        }
        counter = false;
        break;
      }
      case 'step': {
        counter = false;
        if (s.intent !== 'stagger') {
          evaded = true;
          say(`${name} — ${INTENTS[s.intent].name}을(를) 피할 자리로 빠진다`, 'evade');
        } else say(`${name} — 피할 공격이 없다`, 'info');
        break;
      }
      case 'weave': {
        if (s.intent === 'bite') {
          evaded = true;
          counter = true;
          say(`${name} — 물기 아래로 빠져나간다. 카운터 준비`, 'evade');
          if (e.blindSide) {
            s.lostTrack = true;
            say('안 보이는 쪽으로 들어갔다 — 다음 라운드에 태리를 놓친다', 'info');
          }
        } else say(`${name} — ${INTENTS[s.intent].name}에는 소용없다`, 'info');
        break;
      }
      case 'clinch': {
        counter = false;
        if (s.intent === 'grab' || s.grabbed) {
          evaded = true;
          s.grabbed = false;
          say(`${name} — 팔을 묶어 잡기를 무력화`, 'evade');
        } else say(`${name} — 붙었지만 얻은 게 없다`, 'info');
        break;
      }
    }
    if (ko) break;
  }

  if (ko) {
    s.outcome = 'ko';
    s.poise = 0;
    s.noise += tuning.noise.perExtraRound * (s.round - 1);
    s.log.push(...events.map((x) => x.text));
    return { state: s, events };
  }

  // 감염자 행동 (코크스크류 선딜레이 때 이미 처리됐으면 건너뜀)
  if (!enemyActed) enemyAct();

  s.round += 1;
  if (s.round > s.maxRounds) {
    s.outcome = 'timeout';
    s.noise += tuning.noise.timeout;
    say(`끝내지 못했다 · 소음 +${tuning.noise.timeout} — 복도 끝에서 무언가 움직인다`, 'hurt');
  } else if (s.grabbed) {
    s.intent = 'bite';
  } else if (s.lostTrack) {
    s.intent = 'stagger';
    s.lostTrack = false;
  } else {
    const [intent, rng] = pickWeighted<Intent>(e.intents, s.rng);
    s.intent = intent;
    s.rng = rng;
  }

  s.log.push(...events.map((x) => x.text));
  return { state: s, events };
}

/** 가능한 모든 카드 순서 (봇·미리보기용). 빈 계획도 포함. */
export function allPlans(state: CombatState, tuning: Tuning, cards: CardId[]): CardId[][] {
  const out: CardId[][] = [[]];
  const grow = (plan: CardId[]) => {
    for (const c of cards) {
      const next = [...plan, c];
      if (validatePlan(state, next, tuning) === null) {
        out.push(next);
        grow(next);
      }
    }
  };
  grow([]);
  return out;
}
