// Spot the Difference — Harbor Lights: tiny WebAudio sound effects.
// No audio files: every sound is synthesized with oscillators, so the game
// loads nothing over the network and ships no sound assets.
let audioCtx = null;
let muted = false;

export function setMuted(value) { muted = value; }
export function isMuted() { return muted; }

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function tone(freq, startAt, duration, type, volume) {
  const ac = ctx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, ac.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(880, 0, 0.18, 'sine', 0.22);
  tone(1318.5, 0.09, 0.28, 'sine', 0.2);
}

// A soft low buzz for a wrong click.
export function playMiss() {
  tone(160, 0, 0.16, 'square', 0.08);
  tone(120, 0.08, 0.2, 'square', 0.07);
}

// A rising arpeggio when a level is cleared.
export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.32, 'triangle', 0.2));
}

// A gentle pluck when a hint is spent.
export function playHint() {
  tone(1046.5, 0, 0.12, 'sine', 0.14);
  tone(784, 0.08, 0.18, 'sine', 0.12);
}
