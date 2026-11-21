// Entry point: wires the game rules, renderer, sound and input together and runs the frame loop.
// ?seed=N fixes the hidden differences; ?shot=name holds a screenshot scene still (see shots.js).
import { createGame } from './game.js';
import { createRenderer } from './render.js';
import { createAudio } from './audio.js';
import { createEffects } from './effects.js';
import { attachInput } from './input.js';
import { setupShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed')) || ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const audio = createAudio();
const effects = createEffects();
const game = createGame({ audio, effects, seed });
const renderer = createRenderer(canvas);
const input = attachInput({ canvas, game, audio, renderer });

renderer.resize();
window.addEventListener('resize', () => renderer.resize());

if (shot) setupShot(shot, game, effects, Number(params.get('scene') ?? 2));

let lastAnnounced = '';
/** Keeps the screen-reader line in step with the hunt. */
function announce() {
  const s = game.state;
  const line = s.screen === 'play' ? `${game.remaining()} differences left, ${Math.ceil(s.timeLeft)} seconds` : s.screen;
  if (line !== lastAnnounced && (s.screen !== 'play' || Math.ceil(s.timeLeft) % 10 === 0)) {
    lastAnnounced = line;
    status.textContent = line;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) {
    input.update(dt);
    game.update(dt);
    effects.update(dt);
    audio.update(dt);
    announce();
  }
  renderer.draw(game.state, effects);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
