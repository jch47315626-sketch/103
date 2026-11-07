import { describe, expect, it } from 'vitest';
import { act, afterCombat, answeringDoors, createNight, doorAt, move, WAKE_NOISE } from './night';

describe('밤 탐사 규칙', () => {
  it('같은 시드면 같은 층이 나온다', () => {
    expect(createNight(7).doors.map((d) => d.kind)).toEqual(createNight(7).doors.map((d) => d.kind));
    expect(doorAt(createNight(7), 2)!.kind).toBe('home');
  });

  it('이동은 시간이 들지 않고, 문 행동은 30분', () => {
    let s = createNight(1);
    s = move(s, 1).state;
    expect(s.taeriX).toBe(3);
    expect(s.tick).toBe(0);
    s = act(s, 'note').state;
    expect(s.tick).toBe(1);
  });

  it('1503호를 열면 미역국과 식량', () => {
    let s = move(createNight(1), 1).state;
    s = act(s, 'open').state;
    expect(s.food).toBe(3);
    expect(s.specials).toContain('1503호 미역국');
    expect(s.noise).toBe(1);
  });

  it('쪽지 두 번이면 숨은 주민이 새벽에 대답한다', () => {
    let s = createNight(3);
    const hidden = s.doors.find((d) => d.kind === 'hidden')!;
    s = { ...s, taeriX: hidden.x };
    s = act(s, 'note').state;
    expect(answeringDoors(s)).toHaveLength(0);
    s = act(s, 'note').state;
    expect(answeringDoors(s).map((d) => d.no)).toContain(hidden.no);
  });

  it('소음이 쌓이면 가까운 계단실 감염자가 깨어나 다가온다', () => {
    let s = { ...createNight(1), noise: WAKE_NOISE };
    const r = act(s, 'rest');
    expect(r.woke).toHaveLength(1);
    s = act(r.state, 'rest').state;
    expect(s.walkers.find((w) => w.active)!.x).toBe(1);
  });

  it('감염자 문을 열면 전투, 이기면 그 집은 정리된다', () => {
    let s = createNight(5);
    const inf = s.doors.find((d) => d.kind === 'infected')!;
    s = { ...s, taeriX: inf.x };
    const r = act(s, 'open');
    expect(r.combat?.enemy).toBe(inf.enemy);
    s = afterCombat(r.state, r.combat!, { outcome: 'ko', noise: 0, bites: 0 }).state;
    expect(doorAt(s, inf.x)!.kind).toBe('cleared');
  });

  it('12번 행동하면 새벽', () => {
    let s = createNight(1);
    for (let i = 0; i < 12; i++) s = act(s, 'rest').state;
    expect(s.over).toBe('dawn');
  });
});
