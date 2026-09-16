let ctx = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const beep = (frequency = 880, duration = 0.15, volume = 0.25, when = 0) => {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  const t = c.currentTime + when;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
};

export const sound = {
  tick: () => beep(880, 0.06, 0.15),
  start: () => beep(660, 0.12, 0.2),
  phase: () => beep(880, 0.18, 0.25),
  go: () => beep(1200, 0.2, 0.3),
  finish: () => {
    beep(880, 0.15, 0.3);
    beep(660, 0.15, 0.3, 0.15);
    beep(440, 0.3, 0.3, 0.3);
  },
};
