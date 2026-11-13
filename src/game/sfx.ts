// 효과음은 파일 없이 Web Audio로 합성한다. (나중에 녹음한 소리로 바꾸면 된다)

let ctx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted = false;

export function unlockAudio() {
  if (!ctx) {
    try {
      ctx = new AudioContext();
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch {
      ctx = null;
    }
  }
  void ctx?.resume();
}

export function toggleMute() { muted = !muted; return muted; }
export function isMuted() { return muted; }

function out(gain: number, at: number) {
  const g = ctx!.createGain();
  g.gain.setValueAtTime(gain, at);
  g.connect(ctx!.destination);
  return g;
}

function noise(dur: number, freq: number, q: number, gain: number, type: BiquadFilterType = 'lowpass', sweepTo?: number) {
  if (!ctx || !noiseBuf || muted) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  f.Q.value = q;
  const g = out(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g);
  src.start(t, Math.random() * 0.5, dur + 0.05);
}

function tone(freq: number, dur: number, gain: number, type: OscillatorType = 'sine', slideTo?: number, delay = 0) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  punch() { noise(0.12, 900, 1, 0.9); tone(110, 0.12, 0.6, 'sine', 50); },
  heavy() { noise(0.25, 600, 1, 1); tone(80, 0.3, 0.9, 'sine', 35); },
  whoosh() { noise(0.22, 400, 2, 0.35, 'bandpass', 2400); },
  bite() { noise(0.18, 1800, 4, 0.6, 'bandpass'); tone(220, 0.2, 0.25, 'sawtooth', 90); },
  bell() { tone(1318, 1.6, 0.25); tone(1976, 1.2, 0.1); tone(659, 1.8, 0.12); },
  step() { noise(0.05, 300, 1, 0.12); },
  door() { tone(140, 0.35, 0.15, 'square', 95); noise(0.3, 500, 3, 0.2); },
  paper() { noise(0.25, 3000, 0.7, 0.15, 'highpass'); },
  groan() { tone(95, 1.1, 0.22, 'sawtooth', 70); tone(101, 1.1, 0.12, 'sawtooth', 66); },
  chime(i = 0) { tone(523 * Math.pow(2, (i % 5) * 0.2), 1.1, 0.16, 'triangle'); },
  heartbeat() { tone(55, 0.12, 0.5, 'sine', 40); tone(55, 0.12, 0.35, 'sine', 40, 0.18); },
  click() { tone(900, 0.04, 0.08, 'square'); },
  buzz() { tone(110, 0.15, 0.1, 'square'); },
};

// ---------- 리듬 전투용: 오디오 시계와 예약 재생 ----------

/** 예약 재생은 ctx.currentTime 기준 (지연 보정 전) */
export function audioRawNow(): number { return ctx ? ctx.currentTime : performance.now() / 1000; }
export function audioLatency(): number {
  if (!ctx) return 0;
  return (ctx as AudioContext & { outputLatency?: number }).outputLatency || ctx.baseLatency || 0;
}

function toneAt(when: number, freq: number, dur: number, gain: number, type: OscillatorType = 'sine', slideTo?: number) {
  if (!ctx || muted) return;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, when);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, when + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(gain, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(g).connect(ctx.destination);
  o.start(when);
  o.stop(when + dur + 0.05);
}

function noiseAt(when: number, dur: number, freq: number, q: number, gain: number, type: BiquadFilterType) {
  if (!ctx || !noiseBuf || muted) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(when, Math.random() * 0.5, dur + 0.05);
}

export const beat = {
  /** 심장 박동 킥: 쿵 */
  kick(when: number, soft = false) { toneAt(when, soft ? 70 : 90, soft ? 0.12 : 0.18, soft ? 0.35 : 0.8, 'sine', 38); },
  hat(when: number) { noiseAt(when, 0.04, 8000, 0.8, 0.12, 'highpass'); },
  snare(when: number) { noiseAt(when, 0.14, 1800, 0.9, 0.35, 'bandpass'); toneAt(when, 190, 0.08, 0.15, 'triangle', 120); },
  stick(when: number) { toneAt(when, 1700, 0.05, 0.2, 'square'); },
  bass(when: number, freq: number, dur: number) { toneAt(when, freq, dur, 0.22, 'sawtooth'); toneAt(when, freq / 2, dur, 0.25, 'sine'); },
  bell(when: number) { toneAt(when, 1318, 1.2, 0.2); toneAt(when, 659, 1.4, 0.1); },
};

/** 왼쪽 귀에만 들리는 소리 — 안대 쪽에서 오는 것을 알린다 */
export function cueLeft(when: number) {
  if (!ctx || muted || !noiseBuf) return;
  const pan = ctx.createStereoPanner();
  pan.pan.value = -1;
  pan.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = 'square';
  o.frequency.setValueAtTime(140, when);
  o.frequency.exponentialRampToValueAtTime(95, when + 0.35);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.18, when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.4);
  o.connect(g).connect(pan);
  o.start(when);
  o.stop(when + 0.45);
}

// ---------- 호러 분위기 ----------

let drone: { stop: () => void } | null = null;

/** 낮게 깔리는 웅웅거림. 사태가 시작된 뒤 계속 깔린다 */
export function startDrone() {
  if (!ctx || drone) return;
  const g = ctx.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(muted ? 0 : 0.06, ctx.currentTime + 3);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 170;
  const oscs = [55, 58.2, 82.6].map((hz) => {
    const o = ctx!.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = hz;
    o.connect(f);
    o.start();
    return o;
  });
  // 천천히 숨 쉬듯 커졌다 작아진다
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  lfo.frequency.value = 0.13;
  lg.gain.value = 0.025;
  lfo.connect(lg).connect(g.gain);
  lfo.start();
  f.connect(g).connect(ctx.destination);
  drone = {
    stop: () => {
      const t = ctx!.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 1);
      setTimeout(() => { [...oscs, lfo].forEach((o) => o.stop()); }, 1200);
    },
  };
}

export function stopDrone() {
  drone?.stop();
  drone = null;
}

export const horror = {
  /** 손톱이 철문을 긁는 소리 */
  scratch() {
    for (let i = 0; i < 3; i++) setTimeout(() => noise(0.5, 2600 + i * 300, 9, 0.16, 'bandpass', 1500), i * 620);
  },
  /** 멀리, 아래층 어딘가에서 */
  distant() { tone(52, 0.5, 0.3, 'sine', 34); noise(0.4, 220, 1, 0.12); },
  /** 어딘가의 짧은 비명 */
  cry() { tone(720, 0.5, 0.05, 'sawtooth', 380); },
  /** 문 너머의 그르렁거림 */
  growl() { tone(72, 1.4, 0.2, 'sawtooth', 58); tone(77, 1.4, 0.12, 'sawtooth', 61); },
};
