// 어디까지 읽었는지 이 브라우저에만 기억한다 (없어도 처음부터 하면 된다).
const KEY = 'dong103.progress';

export interface Progress { chapter: number; done: boolean }

export function loadProgress(): Progress {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v.chapter === 'number') return { chapter: v.chapter, done: !!v.done };
  } catch { /* 저장소를 쓸 수 없는 환경 */ }
  return { chapter: 0, done: false };
}

export function saveProgress(chapter: number, done = false) {
  try {
    const cur = loadProgress();
    localStorage.setItem(KEY, JSON.stringify({ chapter: Math.max(cur.chapter, chapter), done: cur.done || done }));
  } catch { /* 무시 */ }
}
