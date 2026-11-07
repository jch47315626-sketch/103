import { describe, expect, it } from 'vitest';
import { resolveRound, startCombat, validatePlan } from './combat';
import { DEFAULT_TUNING, ENEMIES } from './data';
import type { CombatState, Intent } from './types';

const T = DEFAULT_TUNING;
const normal = ENEMIES.find((e) => e.id === 'normal')!;
const crawler = ENEMIES.find((e) => e.id === 'crawler')!;
const horyong = ENEMIES.find((e) => e.id === 'horyong')!;

function fight(enemy = normal, intent: Intent = 'bite'): CombatState {
  return { ...startCombat(enemy, T, 1), intent };
}

describe('전투 규칙', () => {
  it('위빙으로 물기를 피하면 카운터 어퍼로 1라운드 KO, 소음 0', () => {
    const { state } = resolveRound(fight(normal, 'bite'), ['weave', 'upper'], T);
    expect(state.outcome).toBe('ko');
    expect(state.noise).toBe(0);
    expect(state.bites).toBe(0);
  });

  it('KO가 나면 감염자의 행동은 취소된다', () => {
    const { state } = resolveRound(fight(normal, 'stagger'), ['cork'], T);
    expect(state.outcome).toBe('ko');
    expect(state.hitsTaken).toBe(0);
  });

  it('머리가 닫혀 있으면 어퍼는 KO가 아니다', () => {
    const { state } = resolveRound(fight(normal, 'grab'), ['upper'], T);
    expect(state.outcome).toBe('ongoing');
    expect(state.poise).toBe(2);
  });

  it('코크스크류가 빗나가면 소음이 난다', () => {
    const { state } = resolveRound(fight(normal, 'push'), ['cork'], T);
    expect(state.outcome).toBe('ongoing');
    expect(state.noise).toBe(T.noise.corkMiss + T.noise.pushHit);
  });

  it('잡히면 다음 라운드는 물기 확정, 스텝·위빙은 쓸 수 없다', () => {
    const { state } = resolveRound(fight(normal, 'grab'), ['jab'], T);
    expect(state.grabbed).toBe(true);
    expect(state.intent).toBe('bite');
    expect(validatePlan(state, ['step'], T)).not.toBeNull();
    const after = resolveRound(state, ['clinch'], T).state;
    expect(after.bites).toBe(0);
    expect(after.grabbed).toBe(false);
  });

  it('물리면 감염 타이머가 시작되지만 전투는 이어진다', () => {
    const { state } = resolveRound(fight(normal, 'bite'), ['jab'], T);
    expect(state.bites).toBe(1);
    expect(state.outcome).toBe('ongoing');
  });

  it('2라운드 KO는 소음 1', () => {
    let s = resolveRound(fight(normal, 'push'), ['step', 'body'], T).state;
    s = { ...s, intent: 'grab' };
    s = resolveRound(s, ['jab', 'upper'], T).state;
    expect(s.outcome).toBe('ko');
    expect(s.noise).toBe(1);
  });

  it('3라운드 안에 못 끝내면 타임아웃 소음', () => {
    let s = fight(normal, 'stagger');
    s = { ...s, enemy: { ...normal, intents: { stagger: 1 } }, poise: 99 };
    for (let i = 0; i < 3; i++) s = resolveRound(s, [], T).state;
    expect(s.outcome).toBe('timeout');
    expect(s.noise).toBe(T.noise.timeout);
  });

  it('기어 오는 감염자에게 코크스크류는 빗나간다', () => {
    const { state } = resolveRound(fight(crawler, 'stagger'), ['cork'], T);
    expect(state.outcome).toBe('ongoing');
  });

  it('호룡: 위빙으로 물기를 피하면 다음 라운드는 비틀거림', () => {
    const { state } = resolveRound(fight(horyong, 'bite'), ['weave', 'body'], T);
    expect(state.intent).toBe('stagger');
    expect(state.poise).toBe(2);
  });

  it('코크스크류는 느리다: 물기 예고면 먼저 물리고 KO', () => {
    const { state } = resolveRound({ ...fight(normal, 'bite'), poise: 2 }, ['cork'], T);
    expect(state.outcome).toBe('ko');
    expect(state.bites).toBe(1);
  });

  it('코크스크류: 잡기 예고면 잡혀도 KO라 손해가 없다', () => {
    const { state } = resolveRound({ ...fight(normal, 'grab'), poise: 2 }, ['cork'], T);
    expect(state.outcome).toBe('ko');
    expect(state.bites).toBe(0);
    expect(state.noise).toBe(0);
  });

  it('입력 상태를 바꾸지 않는다', () => {
    const s = fight(normal, 'bite');
    resolveRound(s, ['jab', 'body'], T);
    expect(s.poise).toBe(normal.poise);
    expect(s.log).toHaveLength(0);
  });
});
