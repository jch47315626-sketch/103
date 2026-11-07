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
