// The rules of the hunt: which screen is up, the clock, finds and misses, the streak multiplier,
// hints and their cooldown, stars and saved progress. Drawing lives in render.js; this file only
// changes state and asks for sounds and effects.
import {
  FIND_POINTS, HINT_COOLDOWN, HINT_COST, HINTS_PER_SCENE, LEVELS, MISS_PENALTY, PANELS, STREAK_MAX, STREAK_WINDOW,
  TIME_BONUS_PER_SECOND, starsFor,
} from './config.js';
import { buildScene } from './scenes.js';
import { hideDifferences } from './differences.js';
import { makeRandom, seedFor } from './random.js';
import { loadProgress, saveProgress } from './storage.js';

export const SCREEN = {
  TITLE: 'title',
  INTRO: 'intro',
  PLAY: 'play',
  PAUSED: 'paused',
  CLEAR: 'clear',
  TIMEOUT: 'timeout',
  JOURNEY: 'journey',
};

const INTRO_SECONDS = 1.6;

export function createGame({ audio, effects, seed }) {
  const progress = loadProgress(LEVELS.length);
  const state = {
    screen: SCREEN.TITLE,
    runSeed: seed,
    visit: 0,
    levelIndex: 0,
    level: LEVELS[0],
    paint: null,
    left: [],
    right: [],
    diffs: [],
    sceneVersion: 0,
    timeLeft: 0,
    elapsed: 0,
    clock: 0,
    score: 0,
    journeyScore: 0,
    misses: 0,
    hintsLeft: HINTS_PER_SCENE,
    hintsUsed: 0,
    hintCooldown: 0,
    hint: null,
    streak: 0,
    lastFindAt: -99,
    lastTick: 99,
    screenAge: 0,
    result: null,
    progress,
    selected: Math.min(progress.unlocked, LEVELS.length - 1),
    cursor: { panel: 1, x: 300, y: 225, visible: false },
    loupe: false,
    findPulse: 0,
  };

  function setScreen(screen) {
    state.screen = screen;
    state.screenAge = 0;
  }

  /** Builds a scene with a fresh set of differences and starts its intro banner. */
  function startScene(index) {
    const level = LEVELS[index];
    state.visit += 1;
    const random = makeRandom(seedFor(level.id, state.runSeed + state.visit * 7919));
    const scene = buildScene(level.id);
    const hidden = hideDifferences(scene.props, level, random);
    Object.assign(state, {
      levelIndex: index,
      level,
      paint: scene.paint,
      left: hidden.left,
      right: hidden.right,
      diffs: hidden.diffs,
      sceneVersion: state.sceneVersion + 1,
      timeLeft: level.seconds,
      elapsed: 0,
      score: 0,
      misses: 0,
      hintsLeft: HINTS_PER_SCENE,
      hintsUsed: 0,
      hintCooldown: 0,
      hint: null,
      streak: 0,
      lastFindAt: -99,
      lastTick: 99,
      result: null,
    });
    if (index === 0) state.journeyScore = 0;
    effects.clear();
    audio.startMusic();
    setScreen(SCREEN.INTRO);
  }

  const remaining = () => state.diffs.filter((d) => !d.found).length;

  function finishScene(cleared) {
    const timeLeft = Math.max(0, Math.ceil(state.timeLeft));
    const bonus = cleared ? timeLeft * TIME_BONUS_PER_SECOND : 0;
    state.score += bonus;
    const result = {
      cleared, timeLeft, bonus, seconds: state.level.seconds, misses: state.misses,
      hintsUsed: state.hintsUsed, found: state.diffs.length - remaining(), total: state.diffs.length,
      score: state.score,
    };
    result.stars = starsFor(result);
    state.result = result;
    state.hint = null;
    if (cleared) {
      state.journeyScore += state.score;
      const p = state.progress;
      p.stars[state.levelIndex] = Math.max(p.stars[state.levelIndex] || 0, result.stars);
      p.best[state.levelIndex] = Math.max(p.best[state.levelIndex] || 0, state.score);
      p.unlocked = Math.max(p.unlocked, Math.min(state.levelIndex + 1, LEVELS.length - 1));
      saveProgress(p);
      audio.clear();
      setScreen(SCREEN.CLEAR);
    } else {
      audio.fail();
      setScreen(SCREEN.TIMEOUT);
    }
    audio.stopMusic();
  }

  /** A tap on picture `panel` (0 left, 1 right) at scene point (x, y). */
  function tap(panel, x, y) {
    if (state.screen !== SCREEN.PLAY) return;
    let hit = null;
    let bestDistance = Infinity;
    for (const d of state.diffs) {
      if (d.found) continue;
      const distance = Math.hypot(d.x - x, d.y - y);
      if (distance <= d.r + 4 && distance < bestDistance) {
        hit = d;
        bestDistance = distance;
      }
    }
    if (hit) {
      hit.found = true;
      hit.foundAt = state.elapsed;
      state.streak = state.elapsed - state.lastFindAt <= STREAK_WINDOW ? Math.min(state.streak + 1, STREAK_MAX) : 1;
      state.lastFindAt = state.elapsed;
      const points = FIND_POINTS * state.streak;
      state.score += points;
      state.findPulse = 1;
      if (state.hint && state.hint.id === hit.id) state.hint = null;
      audio.find(state.streak);
      effects.burst(hit.x, hit.y, '#ffd166');
      effects.burst(hit.x, hit.y, '#fff4e3', 12);
      const label = state.streak > 1 ? `+${points}  STREAK x${state.streak}` : `+${points}`;
      effects.float(label, PANELS[panel].x + hit.x, PANELS[panel].y + hit.y - hit.r, '#ffd166', 28);
      if (remaining() === 0) finishScene(true);
    } else {
      state.misses += 1;
      state.streak = 0;
      state.timeLeft = Math.max(0, state.timeLeft - MISS_PENALTY.seconds);
      state.score = Math.max(0, state.score - MISS_PENALTY.points);
      audio.miss();
      effects.cross(panel, x, y);
      effects.float(`-${MISS_PENALTY.seconds}s`, PANELS[panel].x + x, PANELS[panel].y + y - 20, '#ff6b6b', 26);
    }
  }

  function useHint() {
    if (state.screen !== SCREEN.PLAY || state.hintsLeft <= 0 || state.hintCooldown > 0) return false;
    const unfound = state.diffs.filter((d) => !d.found);
    if (unfound.length === 0) return false;
    // Point at the difference that has gone unfound the longest: the first unfound in hiding order.
    const target = unfound[0];
    state.hint = { id: target.id, age: 0 };
    state.hintsLeft -= 1;
    state.hintsUsed += 1;
    state.hintCooldown = HINT_COOLDOWN;
    state.score = Math.max(0, state.score - HINT_COST);
    audio.hint();
    return true;
  }

  function togglePause() {
    if (state.screen === SCREEN.PLAY) setScreen(SCREEN.PAUSED);
    else if (state.screen === SCREEN.PAUSED) setScreen(SCREEN.PLAY);
  }

  /** Enter / the big button: moves on from whatever screen is up. */
  function advance() {
    switch (state.screen) {
      case SCREEN.TITLE:
        startScene(state.selected);
        break;
      case SCREEN.INTRO:
        setScreen(SCREEN.PLAY);
        break;
      case SCREEN.CLEAR:
        if (state.levelIndex + 1 < LEVELS.length) startScene(state.levelIndex + 1);
        else setScreen(SCREEN.JOURNEY);
        break;
      case SCREEN.TIMEOUT:
        startScene(state.levelIndex);
        break;
      case SCREEN.JOURNEY:
        state.selected = 0;
        setScreen(SCREEN.TITLE);
        break;
      case SCREEN.PAUSED:
        setScreen(SCREEN.PLAY);
        break;
      default:
        break;
    }
  }

  function toTitle() {
    audio.stopMusic();
    state.selected = state.levelIndex;
    setScreen(SCREEN.TITLE);
  }

  function selectLevel(index) {
    if (index < 0 || index >= LEVELS.length) return;
    if (index > state.progress.unlocked) return;
    state.selected = index;
  }

  function update(dt) {
    state.clock += dt;
    state.screenAge += dt;
    state.findPulse = Math.max(0, state.findPulse - dt * 2.5);
    if (state.screen === SCREEN.INTRO && state.screenAge >= INTRO_SECONDS) setScreen(SCREEN.PLAY);
    if (state.screen !== SCREEN.PLAY) return;
    state.elapsed += dt;
    state.timeLeft -= dt;
    state.hintCooldown = Math.max(0, state.hintCooldown - dt);
    if (state.hint) state.hint.age += dt;
    if (state.timeLeft <= 10 && Math.ceil(state.timeLeft) !== state.lastTick) {
      state.lastTick = Math.ceil(state.timeLeft);
      if (state.timeLeft > 0) audio.tick(state.timeLeft <= 5);
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      finishScene(false);
    }
  }

  return { state, startScene, tap, useHint, togglePause, advance, toTitle, selectLevel, update, remaining };
}
