// npm run sim — 봇으로 적마다 1000판씩 돌려 밸런스 표를 출력한다.
import { describe, expect, it } from 'vitest';
import { DEFAULT_TUNING, ENEMIES } from '../rules/data';
import { simulate } from './bot';

const pct = (x: number) => `${Math.round(x * 100)}%`;

describe('밸런스 시뮬레이션', () => {
  it('적별 통계', () => {
    const rows = ENEMIES.flatMap((e) =>
      (['greedy', 'random'] as const).map((bot) => {
        const s = simulate(e, DEFAULT_TUNING, bot, 1000);
        return {
          적: s.enemy, 봇: bot === 'greedy' ? '잘 읽는 봇' : '아무렇게나',
          '1R KO': pct(s.koRound1), KO: pct(s.koTotal), '물림': pct(s.bitten),
          '평균 소음': s.avgNoise.toFixed(2), '평균 라운드': s.avgRounds.toFixed(2),
        };
      }),
    );
    console.table(rows);
    // 잘 읽으면 일반 감염자는 거의 다 잡혀야 한다
    expect(simulate(ENEMIES[0], DEFAULT_TUNING, 'greedy', 300).koTotal).toBeGreaterThan(0.9);
  });
});
