// Spot the Difference — Harbor Lights: game state, input, timer and HUD.
// The two panels are painted by the same scene function from scenes.js: the
// left panel with no differences applied, the right panel with all of them.
// A click on either panel at a difference's spot circles it on both panels.
import { LEVELS, PANEL_W, PANEL_H } from './scenes.js';
import { playFound, playMiss, playWin, playHint, setMuted, isMuted } from './audio.js';

const leftCanvas = document.getElementById('panel-left');
const rightCanvas = document.getElementById('panel-right');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

const $ = (id) => document.getElementById(id);
const levelNameEl = $('level-name');
const foundCountEl = $('found-count');
const totalCountEl = $('total-count');
const remainCountEl = $('remain-count');
const timerBarEl = $('timer-bar');
const timerTextEl = $('timer-text');
const scoreEl = $('score');
const hintBtn = $('hint-btn');
const hintCountEl = $('hint-count');
const soundBtn = $('sound-btn');
const restartBtn = $('restart-btn');
const overlayEl = $('overlay');
const overlayTitle = $('overlay-title');
const overlayText = $('overlay-text');
const overlayStars = $('overlay-stars');
const overlayBtn = $('overlay-btn');
const tabs = [...document.querySelectorAll('.level-tab')];

// Screenshot staging: ?shot=play&level=1&found=0,2,5 freezes the timer and
// pre-circles the listed differences, so a screenshot shows a real mid-game
// frame. ?shot=win shows the level-clear card. ?hint=3 rings one difference.
const params = new URLSearchParams(location.search);
const shotMode = params.get('shot'); // null | 'play' | 'win'
const stagedLevel = Math.min(LEVELS.length - 1, Math.max(0, Number(params.get('level') ?? 0) || 0));
const stagedFound = (params.get('found') || '').split(',').filter(Boolean).map(Number);
const stagedHint = params.get('hint') === null ? -1 : Number(params.get('hint'));

const state = {
  levelIndex: 0,
  found: new Set(),       // difference ids already circled
  foundAt: new Map(),     // id -> performance.now() of the find, for the pop-in
  misses: [],             // {x, y, at} red-X flashes
  hint: null,             // {id, until} active hint ring
  hintsLeft: 3,
  score: 0,
  timeLeft: 150,
  timeLimit: 150,
  running: false,         // timer ticking
  over: false,            // level finished (win or time out)
  frozen: shotMode !== null, // screenshot staging: timer never ticks
};

function level() { return LEVELS[state.levelIndex]; }

function changedSet() {
  return new Set(level().differences.map((d) => d.id));
}

function startLevel(index, keepScore) {
  state.levelIndex = index;
  state.found = new Set();
  state.foundAt = new Map();
  state.misses = [];
  state.hint = null;
  state.hintsLeft = level().hints;
  state.timeLimit = level().timeLimit;
  state.timeLeft = level().timeLimit;
  state.over = false;
  state.running = !state.frozen;
  if (!keepScore) state.score = 0;
  hideOverlay();
  updateHud();
  drawPanels();
}

function updateHud() {
  const total = level().differences.length;
  levelNameEl.textContent = `Level ${state.levelIndex + 1} — ${level().name}`;
  foundCountEl.textContent = String(state.found.size);
  totalCountEl.textContent = String(total);
  remainCountEl.textContent = String(total - state.found.size);
  scoreEl.textContent = String(state.score);
  hintCountEl.textContent = `(${state.hintsLeft})`;
  hintBtn.disabled = state.hintsLeft <= 0 || state.over || state.found.size >= total;
  tabs.forEach((t, i) => t.classList.toggle('active', i === state.levelIndex));
  const frac = Math.max(0, state.timeLeft / state.timeLimit);
  timerBarEl.style.width = `${frac * 100}%`;
  timerTextEl.textContent = `${Math.ceil(state.timeLeft)}s`;
  timerBarEl.style.background = frac < 0.25
    ? 'linear-gradient(90deg,#ff7a59,#ff9d6b)'
    : 'linear-gradient(90deg,#37c978,#ffd76a 70%,#ff7a59)';
}

function drawMarkers(ctx, now) {
  // Gold circles on every found difference, with a quick pop-in.
  for (const diff of level().differences) {
    if (!state.found.has(diff.id)) continue;
    const age = Math.min(1, (now - (state.foundAt.get(diff.id) ?? now)) / 220);
    const r = diff.r + 6 + (1 - age) * 10;
    ctx.save();
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ffd76a';
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.55 + 0.45 * age;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#fff6d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, r - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Hint ring: a dashed amber circle that breathes for a few seconds.
  if (state.hint) {
    const diff = level().differences.find((d) => d.id === state.hint.id);
    if (diff) {
      const pulse = 1 + 0.12 * Math.sin(now / 160);
      ctx.save();
      ctx.strokeStyle = '#ff9d3c';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -now / 40;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, (diff.r + 12) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  // Miss flashes: red X marks that fade out.
  state.misses = state.misses.filter((m) => now - m.at < 700);
  for (const m of state.misses) {
    const alpha = 1 - (now - m.at) / 700;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ff5a4d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(m.x - 10, m.y - 10); ctx.lineTo(m.x + 10, m.y + 10);
    ctx.moveTo(m.x + 10, m.y - 10); ctx.lineTo(m.x - 10, m.y + 10);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPanels(now = performance.now()) {
  leftCtx.clearRect(0, 0, PANEL_W, PANEL_H);
  rightCtx.clearRect(0, 0, PANEL_W, PANEL_H);
  level().draw(leftCtx, new Set());
  level().draw(rightCtx, changedSet());
  drawMarkers(leftCtx, now);
  drawMarkers(rightCtx, now);
}

function toSceneCoords(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (PANEL_W / rect.width),
    y: (event.clientY - rect.top) * (PANEL_H / rect.height),
  };
}

function handlePick(x, y) {
  if (state.over) return;
  const now = performance.now();
  let best = null;
  let bestDist = Infinity;
  for (const diff of level().differences) {
    if (state.found.has(diff.id)) continue;
    const d = Math.hypot(x - diff.x, y - diff.y);
    if (d < diff.r + 10 && d < bestDist) { best = diff; bestDist = d; }
  }
  if (best) {
    state.found.add(best.id);
    state.foundAt.set(best.id, now);
    state.score += 100;
    playFound();
    if (state.found.size >= level().differences.length) winLevel();
  } else {
    state.misses.push({ x, y, at: now });
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    playMiss();
  }
  updateHud();
  drawPanels();
}

function useHint() {
  if (state.over || state.hintsLeft <= 0) return;
  const remaining = level().differences.filter((d) => !state.found.has(d.id));
  if (!remaining.length) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hint = { id: pick.id, until: performance.now() + 2500 };
  playHint();
  updateHud();
  drawPanels();
}

function winLevel() {
  state.over = true;
  state.running = false;
  const bonus = Math.ceil(state.timeLeft) * 5;
  state.score += bonus;
  playWin();
  updateHud();
  const stars = state.timeLeft > state.timeLimit * 0.5 ? '★★★'
    : state.timeLeft > state.timeLimit * 0.25 ? '★★☆' : '★☆☆';
  const last = state.levelIndex >= LEVELS.length - 1;
  showOverlay(
    last ? 'You found them all!' : `Level ${state.levelIndex + 1} clear!`,
    `Every difference in “${level().name}” is circled — ${level().differences.length} found, ` +
    `time bonus +${bonus}. Total score ${state.score}.` +
    (last ? ' That was the last scene — play again or pick any level to hunt again.' : ''),
    stars,
    last ? 'Play again' : 'Next level →',
    () => {
      if (last) startLevel(0, false);
      else startLevel(state.levelIndex + 1, true);
    },
  );
}

function timeOut() {
  state.over = true;
  state.running = false;
  playMiss();
  showOverlay(
    'Out of time!',
    `The clock ran out with ${level().differences.length - state.found.size} ` +
    `difference${level().differences.length - state.found.size === 1 ? '' : 's'} still hiding in ` +
    `“${level().name}”. Take another look — they are all fair.`,
    '☆☆☆',
    'Try again',
    () => startLevel(state.levelIndex, false),
  );
}

function showOverlay(title, text, stars, btnLabel, onClick) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlayStars.textContent = stars;
  overlayBtn.textContent = btnLabel;
  overlayBtn.onclick = onClick;
  overlayEl.classList.remove('hidden');
}

function hideOverlay() {
  overlayEl.classList.add('hidden');
}

// --- Input ---------------------------------------------------------------
leftCanvas.addEventListener('click', (e) => handlePick(...Object.values(toSceneCoords(e, leftCanvas))));
rightCanvas.addEventListener('click', (e) => handlePick(...Object.values(toSceneCoords(e, rightCanvas))));
hintBtn.addEventListener('click', useHint);
restartBtn.addEventListener('click', () => startLevel(state.levelIndex, false));
soundBtn.addEventListener('click', () => {
  setMuted(!isMuted());
  soundBtn.textContent = isMuted() ? '🔇 Muted' : '🔊 Sound';
});
tabs.forEach((tab) => tab.addEventListener('click', () => startLevel(Number(tab.dataset.level), false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') useHint();
  else if (e.key === 'r' || e.key === 'R') startLevel(state.levelIndex, false);
  else if (e.key === 'm' || e.key === 'M') soundBtn.click();
  else if (e.key === 'n' || e.key === 'N') {
    if (state.over) overlayBtn.click();
  } else if (e.key >= '1' && e.key <= '3') startLevel(Number(e.key) - 1, false);
});

// --- Main loop: timer ticks and marker animation --------------------------
let lastTick = performance.now();
function loop(now) {
  if (state.running && !state.over && !state.frozen) {
    const dt = (now - lastTick) / 1000;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      drawPanels(now);
      timeOut();
    } else {
      updateHud();
    }
  }
  if (state.hint && now > state.hint.until) state.hint = null;
  if (state.found.size > 0 || state.hint || state.misses.length > 0) drawPanels(now);
  lastTick = now;
  requestAnimationFrame(loop);
}

// --- Boot ------------------------------------------------------------------
startLevel(stagedLevel, false);
if (shotMode === 'play' || shotMode === 'win') {
  // Stage a real mid-game / cleared frame for screenshots: mark the listed
  // differences as found, freeze the clock, and (for 'win') show the card.
  const diffs = level().differences;
  const pick = shotMode === 'win' ? diffs.map((_, i) => i) : stagedFound;
  for (const i of pick) {
    const d = diffs[i];
    if (!d) continue;
    state.found.add(d.id);
    state.foundAt.set(d.id, performance.now() - 1000);
  }
  state.score = state.found.size * 100;
  state.timeLeft = Math.round(state.timeLimit * 0.6);
  if (stagedHint >= 0 && stagedHint < diffs.length && !state.found.has(diffs[stagedHint].id)) {
    state.hint = { id: diffs[stagedHint].id, until: performance.now() + 60000 };
  }
  if (shotMode === 'win') {
    state.over = true;
    state.running = false;
    const bonus = Math.ceil(state.timeLeft) * 5;
    state.score += bonus;
    showOverlay(
      'Level 1 clear!',
      `Every difference in “${level().name}” is circled — ${diffs.length} found, time bonus +${bonus}. Total score ${state.score}.`,
      '★★★',
      'Next level →',
      () => startLevel(1, true),
    );
  }
  updateHud();
  drawPanels();
}
requestAnimationFrame(loop);
