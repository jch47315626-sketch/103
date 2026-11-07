// 시드 고정 난수 (mulberry32). 상태를 숫자 하나로 들고 다녀서 판을 그대로 재현할 수 있다.
export function nextRandom(state: number): [value: number, next: number] {
  const next = (state + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

export function pickWeighted<T extends string>(
  weights: Partial<Record<T, number>>,
  state: number,
): [T, number] {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  const [r, next] = nextRandom(state);
  let roll = r * total;
  for (const [key, w] of entries) {
    roll -= w;
    if (roll < 0) return [key, next];
  }
  return [entries[entries.length - 1][0], next];
}
