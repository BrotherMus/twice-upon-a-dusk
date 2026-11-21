// The two pictures: painting each scene once into an offscreen canvas, then drawing it framed on
// the stage with the find markers, the hint ring, missed-tap crosses, the twin cursor (a ghost of
// your pointer in the other picture) and the magnifying loupe.
import { PANELS, SCENE } from './config.js';
import { drawProp } from './props.js';

/** Paints a scene backdrop and its props into a fresh canvas `pixelScale` times scene size. */
export function paintPicture(paint, props, pixelScale) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(SCENE.width * pixelScale);
  canvas.height = Math.round(SCENE.height * pixelScale);
  const c = canvas.getContext('2d');
  c.scale(pixelScale, pixelScale);
  paint(c);
  for (const p of props) if (!p.hidden) drawProp(c, p);
  return canvas;
}

function roundedPath(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** Ring drawn on over 0.35 s when a difference is found, with a small tick badge. */
function drawFoundMarker(c, d, now) {
  const age = now - (d.foundAt ?? -10);
  const sweep = Math.min(1, age / 0.35);
  const pop = age < 0.5 ? 1 + Math.sin((age / 0.5) * Math.PI) * 0.25 : 1;
  const r = d.r * pop;
  c.lineCap = 'round';
  c.strokeStyle = 'rgba(30,12,30,0.7)';
  c.lineWidth = 8;
  c.beginPath();
  c.arc(d.x, d.y, r, -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2);
  c.stroke();
  c.strokeStyle = '#ffd166';
  c.lineWidth = 4.5;
  c.stroke();
  if (sweep >= 1) {
    const bx = d.x + r * 0.72;
    const by = d.y - r * 0.72;
    c.fillStyle = '#6ee7a8';
    c.beginPath();
    c.arc(bx, by, 9, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#1c3a2a';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(bx - 4, by);
    c.lineTo(bx - 1, by + 3.5);
    c.lineTo(bx + 4.5, by - 3.5);
    c.stroke();
  }
}

/** The hint: a golden ring that closes in on the difference, then breathes until it is found. */
function drawHintRing(c, d, age) {
  const close = Math.min(1, age / 0.8);
  const r = d.r * (1.6 + (1 - close) * 3) + Math.sin(age * 6) * 3 * close;
  c.save();
  c.setLineDash([10, 8]);
  c.lineDashOffset = -age * 40;
  c.strokeStyle = `rgba(255, 220, 120, ${0.5 + 0.4 * Math.sin(age * 5) ** 2})`;
  c.lineWidth = 4;
  c.beginPath();
  c.arc(d.x, d.y, r, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}

function drawMissedReveal(c, d, age) {
  c.save();
  c.setLineDash([7, 6]);
  c.strokeStyle = '#ff6b6b';
  c.lineWidth = 4;
  c.globalAlpha = Math.min(1, age * 2);
  c.beginPath();
  c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}

function drawTwinCursor(c, x, y, time) {
  c.save();
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 2;
  c.setLineDash([4, 4]);
  c.lineDashOffset = time * 20;
  c.beginPath();
  c.arc(x, y, 16, 0, Math.PI * 2);
  c.stroke();
  c.setLineDash([]);
  c.beginPath();
  c.moveTo(x - 24, y); c.lineTo(x - 10, y);
  c.moveTo(x + 10, y); c.lineTo(x + 24, y);
  c.moveTo(x, y - 24); c.lineTo(x, y - 10);
  c.moveTo(x, y + 10); c.lineTo(x, y + 24);
  c.stroke();
  c.restore();
}

/** The cursor in the picture it is over: a small gold reticle (the keyboard moves it too). */
function drawOwnCursor(c, x, y) {
  c.strokeStyle = 'rgba(30,12,30,0.8)';
  c.lineWidth = 5;
  c.beginPath();
  c.arc(x, y, 11, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = '#ffd166';
  c.lineWidth = 2.5;
  c.stroke();
  c.fillStyle = '#ffd166';
  c.beginPath();
  c.arc(x, y, 2.5, 0, Math.PI * 2);
  c.fill();
}

/** Twice-size view of the picture around the cursor, in a round lens. */
function drawLoupe(c, picture, x, y) {
  const radius = 64;
  const zoom = 2;
  const k = picture.width / SCENE.width;
  c.save();
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2);
  c.clip();
  const span = radius / zoom;
  c.drawImage(picture, (x - span) * k, (y - span) * k, span * 2 * k, span * 2 * k, x - radius, y - radius, radius * 2, radius * 2);
  c.restore();
  c.strokeStyle = '#3a2233';
  c.lineWidth = 7;
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = '#ffe2b8';
  c.lineWidth = 3;
  c.stroke();
}

/**
 * Draws both framed pictures and everything over them. `pictures` is [left, right] canvases;
 * `overlay(c, panelIndex)` lets the caller add effects drawn in scene space.
 */
export function drawPanels(c, state, pictures, { showCursor, reveal, motes, overlay }) {
  const now = state.elapsed;
  PANELS.forEach((panel, index) => {
    c.save();
    c.translate(panel.x, panel.y);
    c.fillStyle = 'rgba(0,0,0,0.35)';
    roundedPath(c, 4, 8, SCENE.width, SCENE.height, 16);
    c.fill();
    c.save();
    roundedPath(c, 0, 0, SCENE.width, SCENE.height, 16);
    c.clip();
    c.drawImage(pictures[index], 0, 0, SCENE.width, SCENE.height);
    if (motes) motes.draw(c, state.clock);
    for (const d of state.diffs) {
      if (d.found) drawFoundMarker(c, d, now);
      else if (reveal) drawMissedReveal(c, d, state.screenAge);
    }
    if (state.hint) {
      const target = state.diffs.find((d) => d.id === state.hint.id);
      if (target && !target.found) drawHintRing(c, target, state.hint.age);
    }
    if (overlay) overlay(c, index);
    const cursor = state.cursor;
    if (showCursor && cursor.visible) {
      if (state.loupe) drawLoupe(c, pictures[index], cursor.x, cursor.y);
      if (cursor.panel !== index) drawTwinCursor(c, cursor.x, cursor.y, state.clock);
      else drawOwnCursor(c, cursor.x, cursor.y);
    }
    c.restore();
    c.strokeStyle = '#ffe2b8';
    c.lineWidth = 4;
    roundedPath(c, 0, 0, SCENE.width, SCENE.height, 16);
    c.stroke();
    // Label pill.
    c.font = '800 13px "Trebuchet MS", system-ui, sans-serif';
    const w = c.measureText(panel.label).width + 22;
    c.fillStyle = '#3a2233';
    roundedPath(c, 14, -11, w, 22, 11);
    c.fill();
    c.fillStyle = '#ffe2b8';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText(panel.label, 25, 0);
    c.restore();
  });
}

/** Stage point -> { panel, x, y } in scene space, or null when it is on neither picture. */
export function pickPanel(stageX, stageY) {
  for (let index = 0; index < PANELS.length; index += 1) {
    const panel = PANELS[index];
    const x = stageX - panel.x;
    const y = stageY - panel.y;
    if (x >= 0 && y >= 0 && x <= SCENE.width && y <= SCENE.height) return { panel: index, x, y };
  }
  return null;
}
