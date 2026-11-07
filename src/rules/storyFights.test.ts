import { describe, expect, it } from 'vitest';
import { advance, hit, release, takeEvents, type Note } from './rhythm';
import { STORY_FIGHTS, startStoryFight } from './storyFights';

const keyOf = (n: Note) =>
  n.kind === 'dodge' ? ({ left: 'ArrowLeft', right: 'ArrowRight', duck: 'ArrowDown' } as const)[n.dodge![0]]
    : [['q', 'w', 'e'], ['a', 's', 'd'], ['z', 'x', 'c']][n.row!][n.col!];

function play(id: string, skip: (n: Note) => boolean = () => false) {
  const s = startStoryFight(id);
  for (const n of [...s.notes]) {
    if (s.outcome !== 'ongoing') break;
    advance(s, n.beat);
    if (n.kind === 'stop' || skip(n)) continue;
    hit(s, keyOf(n), n.beat);
    if (n.hold) { advance(s, n.beat + n.hold / 2); release(s, keyOf(n), n.beat + n.hold); }
  }
  advance(s, s.totalBeats + 1);
  return s;
}

describe('원작 전투', () => {
  it('모든 장면은 정확히 치면 넘어간다', () => {
    for (const id of Object.keys(STORY_FIGHTS)) expect(play(id).outcome, id).toBe('clear');
  });

  it('원작 장면에서 하나라도 놓치면 다시', () => {
    const s = play('m1501', (n) => n.kind === 'dodge');
    expect(s.outcome).toBe('fail');
  });

  it('섀도복싱은 연습이라 놓쳐도 끝까지 간다', () => {
    const s = play('shadow', (n) => n.row === 0);
    expect(s.outcome).toBe('clear');
    expect(s.misses).toBeGreaterThan(0);
  });

  it('도윤: 스트레이트는 저절로 멈추고, 클린치를 일찍 놓으면 다시', () => {
    const s = startStoryFight('doyun');
    const [weave, stop, clinch] = s.notes;
    hit(s, 'ArrowDown', weave.beat);
    advance(s, stop.beat + 0.01);
    expect(stop.judge).toBe('perfect');
    expect(takeEvents(s).some((e) => e.t === 'stopped')).toBe(true);
    hit(s, 's', clinch.beat);
    advance(s, clinch.beat + 3);
    release(s, 's', clinch.beat + 3);
    expect(s.outcome).toBe('fail');
  });

  it('14층: 간을 쳐도 접히지 않는다 — 어퍼로 끝낸다', () => {
    const s = startStoryFight('apron');
    const [dodge, body] = s.notes;
    hit(s, 'ArrowLeft', dodge.beat);
    hit(s, 'd', body.beat);
    expect(takeEvents(s).some((e) => e.t === 'noEffect')).toBe(true);
    expect(s.outcome).toBe('ongoing');
  });
});
