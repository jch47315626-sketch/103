import { describe, expect, it } from 'vitest';
import { advance, buildChart, hit, msPerBeat, noiseNow, RHYTHM, RHYTHM_ENEMIES, startRhythm, takeEvents, type Note, type RhythmState } from './rhythm';

const keyOf = (n: Note) =>
  n.kind === 'dodge'
    ? ({ swingL: 'ArrowRight', swingR: 'ArrowLeft', bite: 'ArrowRight', grab: 'ArrowDown' } as const)[n.attack!]
    : [['q', 'w', 'e'], ['a', 's', 'd'], ['z', 'x', 'c']][n.row!][n.col!];

/** 모든 노트를 정확히 치는 연주 */
function playPerfect(s: RhythmState, offsetMs = 0) {
  for (const n of [...s.notes]) {
    if (s.outcome !== 'ongoing') break;
    const beat = n.beat + offsetMs / msPerBeat(s.bpm);
    advance(s, beat);
    hit(s, keyOf(n), beat);
  }
  advance(s, s.totalBeats + 1);
}

describe('리듬 전투 규칙', () => {
  it('같은 시드면 같은 차트', () => {
    const e = RHYTHM_ENEMIES.normal;
    expect(buildChart(e, 5)).toEqual(buildChart(e, 5));
  });

  it('박자에 정확히 치면 PERFECT, 조금 어긋나면 GOOD, 많이 어긋나면 놓침', () => {
    const s = startRhythm('normal', 1);
    const [a, b, c] = s.notes;
    hit(s, keyOf(a), a.beat);
    expect(a.judge).toBe('perfect');
    hit(s, keyOf(b), b.beat + 140 / msPerBeat(s.bpm));
    expect(b.judge).toBe('good');
    hit(s, keyOf(c), c.beat - 400 / msPerBeat(s.bpm));
    expect(c.judge).toBeUndefined();
    advance(s, c.beat + 1);
    expect(c.judge).toBe('miss');
  });

  it('틀린 칸을 누르면 맞지 않고 콤보가 끊긴다', () => {
    const s = startRhythm('normal', 1);
    const n = s.notes[0];
    hit(s, keyOf(n), n.beat);
    expect(s.combo).toBe(1);
    const wrong = n.col === 0 ? 'e' : 'q';
    hit(s, wrong, s.notes[1].beat);
    expect(s.combo).toBe(0);
  });

  it('모두 정확히 치면 맞지 않고 KO, 소음 0', () => {
    for (const id of ['normal', 'crawler', 'horyong']) {
      const s = startRhythm(id, 3);
      playPerfect(s);
      expect(s.outcome, id).toBe('ko');
      expect(noiseNow(s), id).toBe(0);
      expect(s.hitsTaken, id).toBe(0);
    }
  });

  it('피하기 노트를 놓치면 맞는다 (물기 → 감염 타이머)', () => {
    const s = startRhythm('normal', 1);
    s.notes = [{ id: 0, beat: 4, kind: 'dodge', attack: 'bite' }];
    advance(s, 5);
    expect(s.bites).toBe(1);
    expect(takeEvents(s).some((e) => e.t === 'struck')).toBe(true);
  });

  it('잡히면 다음 어퍼가 탈출 — 놓치면 물린다', () => {
    const s = startRhythm('normal', 1);
    s.notes = [
      { id: 0, beat: 4, kind: 'dodge', attack: 'grab' },
      { id: 1, beat: 5, kind: 'punch', row: 2, col: 1, follow: 0 },
    ];
    advance(s, 4.5);
    expect(s.grabbed).toBe(true);
    advance(s, 6);
    expect(s.bites).toBe(1);
    expect(s.grabbed).toBe(false);
  });

  it('피한 뒤의 어퍼는 카운터로 2배', () => {
    const s = startRhythm('normal', 1);
    s.notes = [
      { id: 0, beat: 4, kind: 'dodge', attack: 'bite' },
      { id: 1, beat: 5, kind: 'punch', row: 2, col: 1, follow: 0 },
    ];
    hit(s, 'ArrowLeft', 4);
    hit(s, 'x', 5);
    expect(s.headHp).toBe(s.enemy.headHp - 4);
  });

  it('몸통으로 자세를 무너뜨리면 4박 동안 피해 2배', () => {
    const s = startRhythm('normal', 1);
    s.notes = [0, 1, 2, 3].map((i) => ({ id: i, beat: 4 + i, kind: 'punch' as const, row: 1 as const, col: 1 as const }));
    s.notes.push({ id: 4, beat: 8, kind: 'punch', row: 0, col: 1 });
    for (const n of s.notes) hit(s, n.row === 1 ? 's' : 'w', n.beat);
    expect(s.headHp).toBe(s.enemy.headHp - 2);
  });

  it('놓침 3번마다 소음 +1, 차트가 끝나도 못 쓰러뜨리면 +3', () => {
    const s = startRhythm('normal', 1);
    advance(s, s.totalBeats + 1);
    expect(s.outcome).toBe('timeout');
    expect(noiseNow(s)).toBeGreaterThanOrEqual(Math.floor(s.misses / RHYTHM.missesPerNoise) + RHYTHM.noise.timeout);
  });

  it('입력이 늘 조금 늦어도(50ms) 전부 PERFECT 안에 든다', () => {
    const s = startRhythm('normal', 9);
    playPerfect(s, 50);
    expect(s.misses).toBe(0);
    expect(s.goods).toBe(0);
  });
});
