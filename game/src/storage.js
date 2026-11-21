// Saved progress (stars, best scores, the furthest scene unlocked) in localStorage. Every read and
// write is guarded: a private window or blocked storage simply starts a fresh journey.

const KEY = 'twice-upon-a-dusk/progress/v1';

export function loadProgress(levelCount) {
  const empty = { unlocked: 0, stars: Array(levelCount).fill(0), best: Array(levelCount).fill(0) };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!saved || !Array.isArray(saved.stars)) return empty;
    return {
      unlocked: Math.min(Math.max(0, saved.unlocked | 0), levelCount - 1),
      stars: empty.stars.map((_, i) => saved.stars[i] | 0),
      best: empty.best.map((_, i) => (saved.best && saved.best[i]) | 0),
    };
  } catch {
    return empty;
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage is a convenience: the game plays on without it.
  }
}
