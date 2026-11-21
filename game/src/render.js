// Frame drawing: fits the 1280x720 stage to the window (letterboxed, sharp on high-DPI screens),
// keeps the painted pictures and title thumbnails cached, and draws whichever screen is up.
import { LEVELS, STAGE } from './config.js';
import { buildScene } from './scenes.js';
import { drawPanels, paintPicture } from './panels.js';
import { drawHud, drawPressureVignette } from './hud.js';
import { drawClear, drawIntro, drawJourney, drawPause, drawTimeout, drawTitle } from './screens.js';
import { createMotes } from './effects.js';
import { SCREEN } from './game.js';

export function createRenderer(canvas) {
  const c = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0, dpr: 1 };
  let pictures = null;
  let picturesKey = '';
  let thumbs = null;
  let backdrop = null;
  const motes = createMotes(11);

  function resize() {
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * view.dpr);
    canvas.height = Math.round(h * view.dpr);
    view.scale = Math.min(w / STAGE.width, h / STAGE.height);
    view.x = (w - STAGE.width * view.scale) / 2;
    view.y = (h - STAGE.height * view.scale) / 2;
    picturesKey = '';
  }

  /** Client (mouse) coordinates -> stage coordinates. */
  function toStage(clientX, clientY) {
    return { x: (clientX - view.x) / view.scale, y: (clientY - view.y) / view.scale };
  }

  function ensurePictures(state) {
    const pixelScale = Math.max(1, view.scale * view.dpr);
    const key = `${state.sceneVersion}:${pixelScale.toFixed(2)}`;
    if (key === picturesKey) return;
    picturesKey = key;
    pictures = [paintPicture(state.paint, state.left, pixelScale), paintPicture(state.paint, state.right, pixelScale)];
  }

  function ensureThumbs() {
    if (thumbs) return;
    thumbs = LEVELS.map((level) => {
      const scene = buildScene(level.id);
      return paintPicture(scene.paint, scene.props, 0.75);
    });
    const harbor = buildScene('harbor');
    backdrop = paintPicture(harbor.paint, harbor.props, 2.2);
  }

  function drawStageBackground() {
    const g = c.createLinearGradient(0, 0, 0, STAGE.height);
    g.addColorStop(0, '#3a1d3f');
    g.addColorStop(0.55, '#2a1636');
    g.addColorStop(1, '#1b1028');
    c.fillStyle = g;
    c.fillRect(0, 0, STAGE.width, STAGE.height);
    const sun = c.createRadialGradient(STAGE.width / 2, -120, 40, STAGE.width / 2, -120, 620);
    sun.addColorStop(0, 'rgba(255,140,90,0.35)');
    sun.addColorStop(1, 'rgba(255,140,90,0)');
    c.fillStyle = sun;
    c.fillRect(0, 0, STAGE.width, STAGE.height);
  }

  function draw(state, effects) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#140b1c';
    c.fillRect(0, 0, canvas.width, canvas.height);
    const k = view.scale * view.dpr;
    c.setTransform(k, 0, 0, k, view.x * view.dpr, view.y * view.dpr);
    c.save();
    c.beginPath();
    c.rect(0, 0, STAGE.width, STAGE.height);
    c.clip();
    ensureThumbs();
    if (state.screen === SCREEN.TITLE) {
      drawTitle(c, state, backdrop, thumbs);
    } else if (state.screen === SCREEN.JOURNEY) {
      drawJourney(c, state, thumbs);
    } else {
      ensurePictures(state);
      drawStageBackground();
      const [sx, sy] = effects.shakeOffset();
      c.save();
      c.translate(sx, sy);
      drawPanels(c, state, pictures, {
        showCursor: state.screen === SCREEN.PLAY,
        reveal: state.screen === SCREEN.TIMEOUT,
        motes,
        overlay: (ctx, index) => {
          effects.drawSparks(ctx);
          effects.drawCrosses(ctx, index);
        },
      });
      c.restore();
      drawHud(c, state);
      effects.drawFloaters(c);
      drawPressureVignette(c, state);
      if (state.screen === SCREEN.INTRO) drawIntro(c, state);
      if (state.screen === SCREEN.PAUSED) drawPause(c);
      if (state.screen === SCREEN.CLEAR) drawClear(c, state);
      if (state.screen === SCREEN.TIMEOUT) drawTimeout(c, state);
    }
    c.restore();
  }

  return { resize, toStage, draw };
}
