// 밸런스 확인용 봇. 브라우저의 조정 패널과 테스트(npm run sim)가 같이 쓴다.

import { CARD_ORDER } from '../rules/data';
import { allPlans, resolveRound, startCombat } from '../rules/combat';
import type { CardId, CombatState, EnemyDef, Tuning } from '../rules/types';
import { nextRandom } from '../rules/rng';

export type BotKind = 'greedy' | 'random';

/** 이번 라운드만 내다보고 가장 좋아 보이는 순서를 고른다 (사람이 '잘 읽었을 때'의 근사치). */
export function greedyPlan(state: CombatState, tuning: Tuning): CardId[] {
  let best: CardId[] = [];
  let bestScore = -Infinity;
  for (const plan of allPlans(state, tuning, CARD_ORDER)) {
    const { state: s } = resolveRound(state, plan, tuning);
    let score: number;
    if (s.outcome === 'ko') score = 1000 - s.noise * 10;
    else {
      score =
        -(s.bites - state.bites) * 500 -
        (s.grabbed ? 200 : 0) -
        (s.noise - state.noise) * 40 +
        (state.poise - s.poise) * 25 +
        (s.poise === 0 ? 60 : 0) +
        (s.intent === 'stagger' ? 30 : 0) -
        (s.outcome === 'timeout' ? 300 : 0);
    }
    if (score > bestScore) {
      bestScore = score;
      best = plan;
    }
  }
  return best;
}

function randomPlan(state: CombatState, tuning: Tuning, seed: number): CardId[] {
  const plans = allPlans(state, tuning, CARD_ORDER);
  const [r] = nextRandom(seed);
  return plans[Math.floor(r * plans.length)];
}

export interface SimStats {
  enemy: string;
  bot: BotKind;
  fights: number;
  koRound1: number;
  koTotal: number;
  timeout: number;
  bitten: number;
  avgNoise: number;
  avgRounds: number;
  /** KO를 낸 기술 비율 */
  finishers: Record<string, number>;
}

export function simulate(enemy: EnemyDef, tuning: Tuning, bot: BotKind, fights = 1000, seed = 103): SimStats {
  let koRound1 = 0, koTotal = 0, timeout = 0, bitten = 0, noise = 0, rounds = 0;
  const fin: Record<string, number> = {};
  for (let i = 0; i < fights; i++) {
    let s = startCombat(enemy, tuning, seed * 7919 + i);
    let guard = 0;
    while (s.outcome === 'ongoing' && guard++ < 20) {
      const plan = bot === 'greedy' ? greedyPlan(s, tuning) : randomPlan(s, tuning, seed + i * 31 + s.round);
      const r = resolveRound(s, plan, tuning);
      const ko = r.events.find((e) => e.kind === 'ko');
      if (ko) { const name = ko.text.split(' ')[0]; fin[name] = (fin[name] ?? 0) + 1; }
      s = r.state;
    }
    if (s.outcome === 'ko') {
      koTotal++;
      if (s.round === 1) koRound1++;
      rounds += s.round;
    } else {
      timeout++;
      rounds += s.maxRounds;
    }
    if (s.bites > 0) bitten++;
    noise += s.noise;
  }
  return {
    enemy: enemy.name,
    bot,
    fights,
    koRound1: koRound1 / fights,
    koTotal: koTotal / fights,
    timeout: timeout / fights,
    bitten: bitten / fights,
    avgNoise: noise / fights,
    avgRounds: rounds / fights,
    finishers: Object.fromEntries(Object.entries(fin).map(([k, v]) => [k, v / Math.max(1, koTotal)])),
  };
}
