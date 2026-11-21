// Full-screen moments around the hunt: the title with its scene cards, the scene intro ribbon,
// the pause cover, the scene-clear card with its stars, the time's-up card and the journey's end.
import { LEVELS, PALETTE, STAGE } from './config.js';
import { formatClock } from './hud.js';

const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

function text(c, value, x, y, size, color, align = 'center', weight = 800) {
  c.font = `${weight} ${size}px ${FONT}`;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.fillStyle = color;
  c.fillText(value, x, y);
}

function outlinedText(c, value, x, y, size, color, outline = '#2a1430') {
  c.font = `900 ${size}px ${FONT}`;
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  c.lineJoin = 'round';
  c.lineWidth = size / 6;
  c.strokeStyle = outline;
  c.strokeText(value, x, y);
  c.fillStyle = color;
  c.fillText(value, x, y);
}

function roundRect(c, x, y, w, h, r, fill, stroke) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 3; c.stroke(); }
}

export function drawStar(c, x, y, r, filled) {
  c.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
  c.fillStyle = filled ? PALETTE.gold : 'rgba(255,255,255,0.14)';
  c.fill();
  c.lineWidth = Math.max(2, r / 8);
  c.strokeStyle = filled ? '#8a4b1c' : 'rgba(255,255,255,0.25)';
  c.stroke();
}

/** Where each scene card sits on the title screen (also used to hit-test clicks). */
export function titleCards() {
  const w = 224;
  const gap = 14;
  const x0 = (STAGE.width - (w * LEVELS.length + gap * (LEVELS.length - 1))) / 2;
  return LEVELS.map((level, i) => ({ index: i, x: x0 + i * (w + gap), y: 340, w, h: 238 }));
}

export function titleCardAt(x, y) {
  return titleCards().find((card) => x >= card.x && x <= card.x + card.w && y >= card.y && y <= card.y + card.h) || null;
}

/** Title: a wide view of the harbour behind the name, then one card per scene. */
export function drawTitle(c, state, backdrop, thumbs) {
  const cropHeight = (backdrop.width * STAGE.height) / STAGE.width;
  c.drawImage(backdrop, 0, backdrop.height - cropHeight, backdrop.width, cropHeight, 0, 0, STAGE.width, STAGE.height);
  const shade = c.createLinearGradient(0, 0, 0, STAGE.height);
  shade.addColorStop(0, 'rgba(28,16,44,0.2)');
  shade.addColorStop(0.45, 'rgba(28,16,44,0.55)');
  shade.addColorStop(1, 'rgba(20,10,30,0.92)');
  c.fillStyle = shade;
  c.fillRect(0, 0, STAGE.width, STAGE.height);
  const bob = Math.sin(state.clock * 1.5) * 4;
  outlinedText(c, 'TWICE UPON A DUSK', STAGE.width / 2, 132 + bob, 92, PALETTE.gold);
  text(c, 'Two pictures of one evening. Spot every difference before the light fades.', STAGE.width / 2, 186, 26, PALETTE.paper, 'center', 700);
  text(c, '5 hand-drawn scenes  ·  35 differences, reshuffled every visit  ·  hints, streaks, loupe & stars', STAGE.width / 2, 226, 19,
    'rgba(255,226,184,0.85)', 'center', 700);
  const progress = state.progress;
  const totalStars = progress.stars.reduce((a, b) => a + b, 0);
  text(c, `★ ${totalStars} / ${LEVELS.length * 3}`, STAGE.width / 2, 300, 24, PALETTE.gold);
  for (const card of titleCards()) {
    const level = LEVELS[card.index];
    const locked = card.index > progress.unlocked;
    const chosen = card.index === state.selected;
    const lift = chosen ? -8 + Math.sin(state.clock * 4) * 2 : 0;
    const y = card.y + lift;
    roundRect(c, card.x, y, card.w, card.h, 16, chosen ? 'rgba(255,209,102,0.22)' : 'rgba(20,10,30,0.7)', chosen ? PALETTE.gold : 'rgba(255,226,184,0.35)');
    c.save();
    c.beginPath();
    c.rect(card.x + 12, y + 12, card.w - 24, 150);
    c.clip();
    c.drawImage(thumbs[card.index], card.x + 12, y + 12, card.w - 24, 150);
    if (locked) {
      c.fillStyle = 'rgba(20,10,30,0.72)';
      c.fillRect(card.x + 12, y + 12, card.w - 24, 150);
      text(c, '🔒', card.x + card.w / 2, y + 100, 40, PALETTE.paper, 'center', 400);
    }
    c.restore();
    text(c, `${card.index + 1}. ${level.name}`, card.x + card.w / 2, y + 188, 18, PALETTE.paper);
    text(c, `${level.count} differences · ${formatClock(level.seconds)}`, card.x + card.w / 2, y + 208, 14, 'rgba(255,244,227,0.7)', 'center', 700);
    for (let s = 0; s < 3; s += 1) drawStar(c, card.x + card.w / 2 - 26 + s * 26, y + 226, 9, s < progress.stars[card.index]);
  }
  const blink = 0.6 + 0.4 * Math.sin(state.clock * 3);
  c.globalAlpha = blink;
  text(c, 'CLICK A SCENE  or  PRESS ENTER TO BEGIN   ·   ← → or 1–5 to choose', STAGE.width / 2, 640, 22, PALETTE.gold);
  c.globalAlpha = 1;
  text(c, 'Mouse or keyboard: click / Enter marks, arrows move the cursor, H hint, Z loupe, P pause, M mute', STAGE.width / 2, 684, 17,
    'rgba(255,244,227,0.7)', 'center', 600);
}

/** The ribbon that names a scene as it opens. */
export function drawIntro(c, state) {
  const t = state.screenAge;
  const fade = Math.min(1, t * 4) * Math.min(1, (1.6 - t) * 3);
  c.globalAlpha = Math.max(0, fade);
  c.fillStyle = 'rgba(25,12,32,0.78)';
  c.fillRect(0, 250, STAGE.width, 150);
  outlinedText(c, `SCENE ${state.levelIndex + 1}  ·  ${state.level.name.toUpperCase()}`, STAGE.width / 2, 322, 54, PALETTE.gold);
  text(c, `${state.diffs.length} differences hidden  ·  ${formatClock(state.level.seconds)} on the clock  ·  3 hints`, STAGE.width / 2, 368, 24, PALETTE.paper);
  c.globalAlpha = 1;
}

export function drawPause(c) {
  c.fillStyle = 'rgba(25,12,32,0.94)';
  c.fillRect(20, 88, STAGE.width - 40, 470);
  outlinedText(c, 'PAUSED', STAGE.width / 2, 300, 80, PALETTE.gold);
  text(c, 'The pictures hide while you rest.   P or Enter to resume  ·  Esc for the scene menu', STAGE.width / 2, 360, 22, PALETTE.paper);
}

function statRow(c, label, value, y, color = PALETTE.paper) {
  text(c, label, STAGE.width / 2 - 190, y, 22, 'rgba(255,244,227,0.75)', 'left', 700);
  text(c, value, STAGE.width / 2 + 190, y, 24, color, 'right');
}

/** Scene clear: the stars land one by one over the finished pictures. */
export function drawClear(c, state) {
  const r = state.result;
  const t = state.screenAge;
  c.fillStyle = `rgba(25,12,32,${Math.min(0.72, t * 2)})`;
  c.fillRect(0, 0, STAGE.width, STAGE.height);
  roundRect(c, STAGE.width / 2 - 260, 120, 520, 470, 24, 'rgba(40,20,48,0.96)', PALETTE.gold);
  outlinedText(c, 'SCENE CLEAR!', STAGE.width / 2, 196, 60, PALETTE.gold);
  text(c, state.level.name, STAGE.width / 2, 232, 22, PALETTE.paper, 'center', 700);
  for (let s = 0; s < 3; s += 1) {
    const appear = Math.min(1, Math.max(0, (t - 0.3 - s * 0.3) * 4));
    const size = 34 * (appear < 1 ? 1.6 - appear * 0.6 : 1);
    if (appear > 0) drawStar(c, STAGE.width / 2 - 80 + s * 80, 292, size, s < r.stars);
  }
  statRow(c, 'Differences found', `${r.found} / ${r.total}`, 366, PALETTE.good);
  statRow(c, `Time bonus (${r.timeLeft}s left)`, `+${r.bonus}`, 402, PALETTE.gold);
  statRow(c, 'Misses  ·  hints used', `${r.misses}  ·  ${r.hintsUsed}`, 438);
  statRow(c, 'Scene score', r.score.toLocaleString('en-US'), 480, PALETTE.gold);
  const last = state.levelIndex + 1 >= LEVELS.length;
  const next = last ? 'ENTER — see your journey' : `ENTER — next: ${LEVELS[state.levelIndex + 1].name}`;
  text(c, next, STAGE.width / 2, 548, 22, PALETTE.gold);
  text(c, '3★ = no hints, ≤1 miss, 40% of the clock left', STAGE.width / 2, 574, 15, 'rgba(255,244,227,0.6)', 'center', 600);
}

/** Time's up: the missed differences stay circled in red on the pictures behind this card. */
export function drawTimeout(c, state) {
  const r = state.result;
  c.fillStyle = 'rgba(25,12,32,0.55)';
  c.fillRect(0, 0, STAGE.width, 88);
  roundRect(c, STAGE.width / 2 - 330, 586, 660, 124, 20, 'rgba(40,20,48,0.95)', PALETTE.bad);
  outlinedText(c, "TIME'S UP — THE LIGHT FADED", STAGE.width / 2, 636, 36, '#ff8a8a');
  text(c, `You found ${r.found} of ${r.total}. The ${r.total - r.found} you missed are circled in red.`, STAGE.width / 2, 668, 19, PALETTE.paper, 'center', 700);
  text(c, 'ENTER — try again with new differences  ·  Esc — scenes', STAGE.width / 2, 696, 18, PALETTE.gold);
}

/** The end of the journey: every scene's stars and the total. */
export function drawJourney(c, state, thumbs) {
  c.fillStyle = '#1c1530';
  c.fillRect(0, 0, STAGE.width, STAGE.height);
  const glow = c.createRadialGradient(STAGE.width / 2, 260, 40, STAGE.width / 2, 260, 700);
  glow.addColorStop(0, 'rgba(255,138,92,0.45)');
  glow.addColorStop(1, 'rgba(28,21,48,0)');
  c.fillStyle = glow;
  c.fillRect(0, 0, STAGE.width, STAGE.height);
  outlinedText(c, 'JOURNEY COMPLETE', STAGE.width / 2, 130, 80, PALETTE.gold);
  text(c, `Final score ${state.journeyScore.toLocaleString('en-US')}`, STAGE.width / 2, 186, 34, PALETTE.paper);
  const stars = state.progress.stars;
  thumbs.forEach((thumb, i) => {
    const x = 70 + i * 232;
    roundRect(c, x - 6, 240, 212, 250, 14, 'rgba(255,255,255,0.06)', 'rgba(255,226,184,0.4)');
    c.drawImage(thumb, x + 6, 252, 188, 141);
    text(c, LEVELS[i].name, x + 100, 424, 17, PALETTE.paper);
    for (let s = 0; s < 3; s += 1) drawStar(c, x + 74 + s * 26, 458, 10, s < stars[i]);
  });
  const total = stars.reduce((a, b) => a + b, 0);
  text(c, `★ ${total} of ${LEVELS.length * 3} stars  ·  every replay hides a new set of differences`, STAGE.width / 2, 560, 24, PALETTE.gold);
  text(c, 'ENTER — back to the scenes', STAGE.width / 2, 620, 22, PALETTE.paper);
}
