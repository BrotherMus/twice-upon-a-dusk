// The heads-up display around the pictures: scene name and score along the top, the shrinking
// timer bar between, and along the bottom the big "N LEFT" counter with one pip per difference,
// the hint lamp with its cooldown, the streak meter and the controls legend. It also paints the
// red pulse that closes in on the frame when the clock runs low.
import { HUD, LEVELS, PALETTE, STAGE, STREAK_MAX } from './config.js';

const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

function text(c, value, x, y, size, color, align = 'left', weight = 800) {
  c.font = `${weight} ${size}px ${FONT}`;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.fillStyle = color;
  c.fillText(value, x, y);
}

function pill(c, x, y, w, h, fill) {
  const r = h / 2;
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
  c.fill();
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawTopBar(c, state) {
  const level = state.level;
  text(c, 'TWICE UPON A DUSK', 30, 34, 26, PALETTE.gold);
  text(c, `SCENE ${state.levelIndex + 1}/${LEVELS.length}  ·  ${level.name.toUpperCase()}`, 30, 64, 18, PALETTE.paper, 'left', 700);
  // Clock in the middle.
  const low = state.timeLeft <= 15;
  const pulse = low ? 1 + Math.sin(state.clock * 10) * 0.06 : 1;
  c.save();
  c.translate(STAGE.width / 2, 48);
  c.scale(pulse, pulse);
  pill(c, -92, -36, 184, 58, low ? 'rgba(255,77,94,0.28)' : 'rgba(255,255,255,0.08)');
  text(c, '⏱', -62, 12, 30, low ? PALETTE.bad : PALETTE.paper, 'center', 400);
  text(c, formatClock(state.timeLeft), 18, 13, 44, low ? '#ff8a8a' : PALETTE.paper, 'center');
  c.restore();
  // Score and streak on the right.
  text(c, `SCORE ${state.score.toLocaleString('en-US')}`, STAGE.width - 30, 36, 26, PALETTE.paper, 'right');
  const streakLive = state.elapsed - state.lastFindAt <= 4.5 && state.streak > 1;
  text(c, streakLive ? `STREAK ×${state.streak}!` : `JOURNEY ${state.journeyScore.toLocaleString('en-US')}`, STAGE.width - 30, 64, 18,
    streakLive ? PALETTE.gold : 'rgba(255,244,227,0.7)', 'right', 700);
}

function drawTimerBar(c, state) {
  const x = 28;
  const w = STAGE.width - 56;
  const y = HUD.timerY;
  const share = Math.max(0, state.timeLeft / state.level.seconds);
  pill(c, x, y, w, HUD.timerHeight, 'rgba(0,0,0,0.35)');
  const g = c.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, '#ff4d5e');
  g.addColorStop(0.3, '#ff9f43');
  g.addColorStop(1, '#ffd166');
  if (share > 0) pill(c, x, y, Math.max(HUD.timerHeight, w * share), HUD.timerHeight, share < 0.17 ? '#ff4d5e' : g);
}

function drawCounter(c, state) {
  const left = state.diffs.filter((d) => !d.found).length;
  const total = state.diffs.length;
  const pop = 1 + state.findPulse * 0.25;
  c.save();
  c.translate(30, 664);
  c.scale(pop, pop);
  text(c, String(left), 0, 0, 76, left === 0 ? PALETTE.good : PALETTE.gold);
  const numberWidth = c.measureText(String(left)).width + 2;
  c.restore();
  text(c, 'LEFT', 40 + numberWidth, 640, 30, PALETTE.paper);
  text(c, `${total - left} of ${total} differences found`, 40 + numberWidth, 666, 17, 'rgba(255,244,227,0.75)', 'left', 700);
  // One pip per difference.
  for (let i = 0; i < total; i += 1) {
    const d = state.diffs[i];
    const px = 44 + i * 30;
    const py = 698;
    c.beginPath();
    c.arc(px, py, 10, 0, Math.PI * 2);
    if (d.found) {
      c.fillStyle = PALETTE.gold;
      c.fill();
      c.strokeStyle = '#3a2233';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(px - 4.5, py);
      c.lineTo(px - 1, py + 4);
      c.lineTo(px + 5, py - 4);
      c.stroke();
    } else {
      c.strokeStyle = 'rgba(255,226,184,0.7)';
      c.lineWidth = 2.5;
      c.stroke();
    }
  }
}

function drawHintLamp(c, state) {
  const x = 430;
  const y = 600;
  const ready = state.hintsLeft > 0 && state.hintCooldown <= 0;
  pill(c, x, y, 230, 54, ready ? 'rgba(255,209,102,0.2)' : 'rgba(255,255,255,0.06)');
  text(c, '💡', x + 30, y + 37, 26, PALETTE.paper, 'center', 400);
  text(c, 'HINT  [H]', x + 56, y + 25, 20, ready ? PALETTE.gold : 'rgba(255,244,227,0.5)');
  for (let i = 0; i < 3; i += 1) {
    c.beginPath();
    c.arc(x + 64 + i * 20, y + 40, 6, 0, Math.PI * 2);
    c.fillStyle = i < state.hintsLeft ? PALETTE.gold : 'rgba(255,255,255,0.15)';
    c.fill();
  }
  if (state.hintCooldown > 0 && state.hintsLeft > 0) {
    text(c, `${Math.ceil(state.hintCooldown)}s`, x + 196, y + 42, 18, 'rgba(255,244,227,0.6)', 'center', 700);
  } else {
    text(c, '−75 pts', x + 196, y + 42, 14, 'rgba(255,244,227,0.55)', 'center', 700);
  }
  // Misses and the streak meter under the lamp.
  text(c, `MISSES ${state.misses}  (−4s each)`, x + 4, y + 84, 16, state.misses ? '#ff9a9a' : 'rgba(255,244,227,0.6)', 'left', 700);
  text(c, 'STREAK', x + 4, y + 108, 16, 'rgba(255,244,227,0.6)', 'left', 700);
  const live = state.elapsed - state.lastFindAt <= 4.5 ? state.streak : 0;
  for (let i = 0; i < STREAK_MAX; i += 1) {
    pill(c, x + 72 + i * 38, y + 96, 32, 13, i < live ? PALETTE.ember : 'rgba(255,255,255,0.12)');
  }
}

function drawLegend(c) {
  const x = 720;
  const y = 596;
  pill(c, x, y, 532, 112, 'rgba(0,0,0,0.25)');
  const rows = [
    ['CLICK / ENTER', 'mark a difference in either picture'],
    ['ARROWS / WASD', 'move the cursor   ·   Z hold: loupe'],
    ['H  hint   P  pause', 'M  mute   ·   Esc  scene menu'],
  ];
  rows.forEach(([key, what], i) => {
    text(c, key, x + 20, y + 32 + i * 30, 17, PALETTE.gold);
    text(c, what, x + 200, y + 32 + i * 30, 17, PALETTE.paper, 'left', 600);
  });
}

/** Red pulse around the frame as the clock runs out. */
export function drawPressureVignette(c, state) {
  if (state.timeLeft > 15 || state.screen !== 'play') return;
  const strength = (1 - state.timeLeft / 15) * (0.55 + 0.45 * Math.sin(state.clock * (state.timeLeft < 6 ? 12 : 6)) ** 2);
  const g = c.createRadialGradient(STAGE.width / 2, STAGE.height / 2, 300, STAGE.width / 2, STAGE.height / 2, 760);
  g.addColorStop(0, 'rgba(255,40,60,0)');
  g.addColorStop(1, `rgba(255,40,60,${0.45 * strength})`);
  c.fillStyle = g;
  c.fillRect(0, 0, STAGE.width, STAGE.height);
}

export function drawHud(c, state) {
  drawTopBar(c, state);
  drawTimerBar(c, state);
  drawCounter(c, state);
  drawHintLamp(c, state);
  drawLegend(c);
}
