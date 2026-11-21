// Mouse and keyboard. The mouse points and clicks; the keyboard drives the same cursor (arrows or
// WASD, faster the longer they are held), marks with Enter or Space, and has a key for every action.
import { SCENE } from './config.js';
import { LEVELS } from './config.js';
import { SCREEN } from './game.js';
import { pickPanel } from './panels.js';
import { titleCardAt } from './screens.js';

const MOVE_KEYS = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
  KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1],
};

export function attachInput({ canvas, game, audio, renderer }) {
  const held = new Set();
  let holdTime = 0;
  const state = game.state;

  function pointerAt(event) {
    const point = renderer.toStage(event.clientX, event.clientY);
    const hit = pickPanel(point.x, point.y);
    if (hit) {
      Object.assign(state.cursor, { panel: hit.panel, x: hit.x, y: hit.y, visible: true });
    } else {
      state.cursor.visible = false;
    }
    return { point, hit };
  }

  canvas.addEventListener('pointermove', (event) => {
    pointerAt(event);
  });
  canvas.addEventListener('pointerleave', () => {
    state.cursor.visible = false;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('pointerdown', (event) => {
    audio.unlock();
    const { point, hit } = pointerAt(event);
    if (event.button === 2) {
      state.loupe = true;
      return;
    }
    if (state.screen === SCREEN.TITLE) {
      const card = titleCardAt(point.x, point.y);
      if (card) {
        if (card.index <= state.progress.unlocked) {
          audio.click();
          game.selectLevel(card.index);
          game.advance();
        }
      } else {
        game.advance();
      }
      return;
    }
    if (state.screen === SCREEN.PLAY) {
      if (hit) game.tap(hit.panel, hit.x, hit.y);
      else if (point.x >= 430 && point.x <= 660 && point.y >= 600 && point.y <= 654) game.useHint();
      return;
    }
    game.advance();
  });
  canvas.addEventListener('pointerup', (event) => {
    if (event.button === 2) state.loupe = false;
  });

  window.addEventListener('keydown', (event) => {
    audio.unlock();
    const code = event.code;
    if (MOVE_KEYS[code] || code === 'Space') event.preventDefault();
    if (state.screen === SCREEN.TITLE) {
      if (code === 'ArrowLeft' || code === 'KeyA') game.selectLevel(state.selected - 1);
      else if (code === 'ArrowRight' || code === 'KeyD') game.selectLevel(state.selected + 1);
      else if (/^Digit[1-9]$/.test(code)) {
        const index = Number(code.slice(5)) - 1;
        if (index < LEVELS.length && index <= state.progress.unlocked) {
          game.selectLevel(index);
          game.advance();
        }
      } else if (code === 'Enter' || code === 'Space') game.advance();
      if (code === 'KeyM') audio.toggleMute();
      return;
    }
    if (MOVE_KEYS[code]) {
      held.add(code);
      state.cursor.visible = true;
    }
    switch (code) {
      case 'Enter':
      case 'Space':
        if (state.screen === SCREEN.PLAY) {
          state.cursor.visible = true;
          game.tap(state.cursor.panel, state.cursor.x, state.cursor.y);
        } else {
          game.advance();
        }
        break;
      case 'Tab':
        event.preventDefault();
        state.cursor.panel = 1 - state.cursor.panel;
        break;
      case 'KeyH':
        game.useHint();
        break;
      case 'KeyP':
        game.togglePause();
        break;
      case 'KeyM':
        audio.toggleMute();
        break;
      case 'KeyZ':
        state.loupe = true;
        break;
      case 'Escape':
        if (state.screen === SCREEN.PLAY) game.togglePause();
        else game.toTitle();
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
    if (event.code === 'KeyZ') state.loupe = false;
  });
  window.addEventListener('blur', () => {
    held.clear();
    state.loupe = false;
    if (state.screen === SCREEN.PLAY) game.togglePause();
  });

  return {
    /** Moves the keyboard cursor while movement keys are held, speeding up over half a second. */
    update(dt) {
      if (held.size === 0) {
        holdTime = 0;
        return;
      }
      holdTime += dt;
      const speed = 160 + Math.min(holdTime, 0.6) * 500;
      let dx = 0;
      let dy = 0;
      for (const code of held) {
        dx += MOVE_KEYS[code][0];
        dy += MOVE_KEYS[code][1];
      }
      const cursor = state.cursor;
      cursor.x = Math.min(SCENE.width, Math.max(0, cursor.x + dx * speed * dt));
      cursor.y = Math.min(SCENE.height, Math.max(0, cursor.y + dy * speed * dt));
    },
  };
}
