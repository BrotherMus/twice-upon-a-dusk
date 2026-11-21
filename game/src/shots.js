// The screenshot scenes behind ?shot=cover|title|pressure|clear. Each one starts a real scene with
// a fixed seed and plays the real rules (game.tap on true differences, a real miss, a real hint)
// up to a moment worth showing, then the frame is held still for the camera.
import { SCREEN } from './game.js';

/** Taps `count` unfound differences, `spacing` seconds apart, in the picture each one hides in. */
function findSome(game, count, spacing) {
  const state = game.state;
  const targets = state.diffs.filter((d) => !d.found).slice(0, count);
  for (const d of targets) {
    state.elapsed += spacing;
    game.tap(d.side === 'right' ? 1 : 0, d.x, d.y);
  }
}

function settle(effects, seconds) {
  for (let t = 0; t < seconds; t += 1 / 60) effects.update(1 / 60);
}

export function setupShot(name, game, effects, sceneIndex = 2) {
  const state = game.state;
  switch (name) {
    case 'title':
      state.progress = { unlocked: 4, stars: [3, 3, 2, 1, 0], best: [1400, 1650, 1200, 900, 0] };
      state.selected = 3;
      state.clock = 0.4;
      return;
    case 'pressure': {
      game.startScene(4);
      state.screen = SCREEN.PLAY;
      state.journeyScore = 6120;
      findSome(game, 6, 14);
      effects.clear();
      state.elapsed = 112;
      game.tap(0, 520, 150);
      settle(effects, 0.3);
      state.timeLeft = 6.4;
      state.clock = 3.1;
      Object.assign(state.cursor, { panel: 0, x: 300, y: 330, visible: true });
      state.loupe = true;
      return;
    }
    case 'clear': {
      game.startScene(3);
      state.screen = SCREEN.PLAY;
      state.journeyScore = 3900;
      state.timeLeft = 61;
      findSome(game, state.diffs.length - 1, 5);
      state.timeLeft = 58.2;
      findSome(game, 1, 3);
      state.screenAge = 3;
      effects.clear();
      return;
    }
    case 'cover':
    default: {
      game.startScene(sceneIndex);
      state.screen = SCREEN.PLAY;
      state.journeyScore = 2850;
      findSome(game, 3, 9);
      effects.clear();
      findSome(game, 1, 2.5);
      settle(effects, 0.22);
      state.timeLeft = 47.6;
      game.useHint();
      state.hint.age = 1.6;
      state.hintCooldown = 0;
      state.clock = 2.2;
      const unfound = state.diffs.filter((d) => !d.found);
      const spot = unfound[unfound.length - 1];
      Object.assign(state.cursor, { panel: 0, x: Math.min(560, spot.x + 70), y: Math.min(420, spot.y + 40), visible: true });
      return;
    }
  }
}
