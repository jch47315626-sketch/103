import { describe, expect, it } from 'vitest';
import { noiseNow, press, RT, startRt, takeEvents, tick, type RtState, type ZAttack } from './realtime';

/** 감염자가 곧바로 해당 공격을 준비하는 상태로 만든다 */
function windup(s: RtState, attack: ZAttack, ms = 600) {
  s.z = { phase: 'windup', until: s.t + ms, attack };
}
function calm(s: RtState) {
  s.z = { phase: 'idle', until: s.t + 99999 };
  s.nextSway = s.t + 99999;
}

describe('실시간 전투 규칙', () => {
  it('머리가 있는 열을 쳐야 맞는다', () => {
    const s = startRt('normal', 1);
    calm(s);
    s.headCol = 2;
    press(s, 'q');
    tick(s, 300);
    expect(takeEvents(s).some((e) => e.t === 'whiff')).toBe(true);
    press(s, 'e');
    tick(s, 300);
    expect(s.headHp).toBe(7);
  });

  it('몸통으로 자세를 0으로 만들면 비틀거리고, 그때 머리 피해 2배', () => {
    const s = startRt('normal', 1);
    calm(s);
    for (let i = 0; i < 4; i++) { press(s, 's'); tick(s, 300); }
    expect(s.z.phase).toBe('stagger');
    expect(s.headCol).toBe(1);
    press(s, 'x');
    tick(s, 600);
    expect(s.headHp).toBe(s.enemy.headHp - RT.damage[2] * 2);
  });

  it('맞는 방향으로 피하면 빈틈이 열리고, 틀린 방향이면 맞는다', () => {
    const a = startRt('normal', 1);
    windup(a, 'swingL', 200);
    press(a, 'ArrowRight');
    tick(a, 250);
    expect(a.hitsTaken).toBe(0);
    expect(a.counterUntil).toBeGreaterThan(a.t);

    const b = startRt('normal', 1);
    windup(b, 'swingL', 200);
    press(b, 'ArrowLeft');
    tick(b, 250);
    expect(b.hitsTaken).toBe(1);
    expect(b.extraNoise).toBe(RT.noise.swingHit);
  });

  it('너무 일찍 피하면 피하는 동작이 끝나 맞는다', () => {
    const s = startRt('normal', 1);
    windup(s, 'bite', 600);
    press(s, 'ArrowLeft');
    tick(s, 700);
    expect(s.bites).toBe(1);
  });

  it('잡히면 피할 수 없고, 어퍼로 끊어야 한다', () => {
    const s = startRt('normal', 1);
    windup(s, 'grab', 50);
    tick(s, 100);
    expect(s.grabbed).toBe(true);
    tick(s, RT.stunMs);
    press(s, 'ArrowLeft');
    expect(s.p.phase).toBe('ready');
    s.headCol = 1;
    press(s, 'x');
    tick(s, 300);
    expect(s.grabbed).toBe(false);
    expect(s.bites).toBe(0);
  });

  it('머리 체력이 0이면 KO. 6초 안에 맞지 않고 끝내면 소음 0', () => {
    const s = startRt('crawler', 1);
    calm(s);
    s.headCol = 0;
    press(s, 'z'); tick(s, 600);
    press(s, 'z'); tick(s, 600);
    press(s, 'a'); tick(s, 300);
    press(s, 'a'); tick(s, 300);
    expect(s.outcome).toBe('ko');
    expect(noiseNow(s)).toBe(0);
  });

  it('기어 오는 감염자에게 Q W E는 머리 위로 빗나간다', () => {
    const s = startRt('crawler', 1);
    calm(s);
    s.headCol = 1;
    press(s, 'w'); tick(s, 300);
    expect(s.headHp).toBe(6);
  });

  it('몸통만 천천히 치면 자세가 회복되어 무너지지 않는다', () => {
    const s = startRt('normal', 1);
    calm(s);
    for (let i = 0; i < 6; i++) { press(s, 's'); tick(s, 1400); }
    expect(s.z.phase).not.toBe('stagger');
  });

  it('스태미나가 없으면 칠 수 없다', () => {
    const s = startRt('normal', 1);
    calm(s);
    s.stamina = 0.5;
    press(s, 'w');
    expect(takeEvents(s).some((e) => e.t === 'tired')).toBe(true);
  });

  it('시간 안에 끝내지 못하면 타임아웃', () => {
    const s = startRt('normal', 1);
    s.stamina = 0;
    for (let i = 0; i < 200 && s.outcome === 'ongoing'; i++) tick(s, 100);
    expect(s.outcome).toBe('timeout');
    expect(noiseNow(s)).toBeGreaterThanOrEqual(RT.noise.timeout);
  });

  it('호룡: 왼쪽으로 피하면 사각으로 들어가 빈틈이 길다', () => {
    const s = startRt('horyong', 1);
    windup(s, 'bite', 100);
    press(s, 'ArrowLeft');
    tick(s, 150);
    expect(s.counterUntil - s.t).toBeGreaterThan(RT.counterMs);
  });
});
