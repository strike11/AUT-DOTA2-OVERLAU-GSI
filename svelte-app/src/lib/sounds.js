let ctx = null;
let master = null;
let muted = false;

function getAudio() {
  if (!ctx) ctx = new AudioContext();
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0.55;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2800;
    master.connect(filter);
    filter.connect(ctx.destination);
  }
  return ctx;
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
}

export function unlockAudio() {
  const audio = getAudio();
  const pending = audio.state === "suspended" ? audio.resume() : Promise.resolve();
  return pending.then(() => audio.state === "running");
}

function canPlay() {
  return !muted && ctx && ctx.state === "running";
}

function tone(freq, start, duration, type, peak, slideTo) {
  const audio = getAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function noise(start, duration, peak, highpass) {
  const audio = getAudio();
  const length = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = highpass;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(start);
  source.stop(start + duration);
}

export function playPick() {
  if (!canPlay()) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
    tone(freq, t + index * 0.07, 0.16, "square", 0.07);
  });
  noise(t, 0.07, 0.045, 1800);
}

export function playBan() {
  if (!canPlay()) return;
  const t = ctx.currentTime;
  tone(246.94, t, 0.2, "square", 0.08, 82);
  tone(164.81, t + 0.05, 0.22, "sawtooth", 0.035, 55);
  noise(t, 0.14, 0.09, 900);
}

export function playTurn(team) {
  if (!canPlay()) return;
  const t = ctx.currentTime;
  const root = team === "dire" ? 349.23 : 587.33;
  tone(root, t, 0.08, "square", 0.05);
  tone(root * 1.5, t + 0.07, 0.12, "square", 0.05);
}

export function playTick(secondsLeft) {
  if (!canPlay()) return;
  const urgent = secondsLeft <= 3;
  tone(urgent ? 987.77 : 659.25, ctx.currentTime, urgent ? 0.07 : 0.045, "square", urgent ? 0.06 : 0.032);
}

export function playExpire() {
  if (!canPlay()) return;
  const t = ctx.currentTime;
  tone(196, t, 0.28, "square", 0.07, 70);
  noise(t, 0.18, 0.06, 400);
}

export function playLock() {
  if (!canPlay()) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, index) => {
    tone(freq, t + index * 0.08, 0.2, "square", 0.06);
  });
}
