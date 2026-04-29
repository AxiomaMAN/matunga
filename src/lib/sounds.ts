// Lightweight WebAudio sound effects (no asset downloads required)
let ctx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
};

export const playPlock = () => {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(420, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.12);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.4, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.2);
};

export const playInvalid = () => {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(180, c.currentTime);
  o.frequency.linearRampToValueAtTime(120, c.currentTime + 0.15);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.18, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.2);
};

export const playApplause = () => {
  const c = getCtx();
  if (!c) return;
  // Synthetic "applause" — bursts of filtered noise
  const duration = 1.8;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / c.sampleRate;
    const env = Math.exp(-((t - 0.2) ** 2) * 4) + Math.exp(-((t - 0.8) ** 2) * 6) + 0.4;
    data[i] = (Math.random() * 2 - 1) * env * 0.35;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 0.7;
  const g = c.createGain();
  g.gain.value = 0.6;
  src.connect(filter).connect(g).connect(c.destination);
  src.start();
};
