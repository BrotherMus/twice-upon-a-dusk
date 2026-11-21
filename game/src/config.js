// Layout and difficulty tables for Twice Upon a Dusk. Everything is laid out on a fixed 1280x720
// stage that the canvas scales to the window; each picture panel is a 600x450 scene space.

export const STAGE = { width: 1280, height: 720 };

/** Scene space: every prop, hit circle and marker is measured in these units. */
export const SCENE = { width: 600, height: 450 };

/** Where the two pictures sit on the stage (left is the original, right the copy). */
export const PANELS = [
  { x: 28, y: 96, label: 'ORIGINAL' },
  { x: 652, y: 96, label: 'COPY' },
];

export const HUD = {
  topHeight: 82,
  timerY: 556,
  timerHeight: 14,
  bottomY: 582,
};

/** Seconds taken off the clock, and points lost, for a click on no difference. */
export const MISS_PENALTY = { seconds: 4, points: 50 };
export const FIND_POINTS = 100;
/** A find within this many seconds of the last one grows the streak multiplier. */
export const STREAK_WINDOW = 4.5;
export const STREAK_MAX = 4;
export const HINTS_PER_SCENE = 3;
export const HINT_COST = 75;
export const HINT_COOLDOWN = 8;
export const TIME_BONUS_PER_SECOND = 10;

/**
 * The five scenes of the journey, easiest first. `count` differences are hidden in each; `hue` is how
 * far a recoloured prop turns round the colour wheel (smaller is subtler); `grow` the size change;
 * `nudge` how far a moved prop slides; `kinds` the sorts of change allowed; `minSize` the smallest
 * prop (in scene units) a difference may hide in.
 */
export const LEVELS = [
  { id: 'harbor', name: 'Harbor at Dusk', count: 5, seconds: 90, hue: 150, grow: 1.4, nudge: 22, minSize: 26,
    kinds: ['remove', 'color', 'detail', 'grow'] },
  { id: 'market', name: 'Lantern Market', count: 6, seconds: 95, hue: 120, grow: 1.32, nudge: 20, minSize: 22,
    kinds: ['remove', 'color', 'detail', 'grow', 'flip'] },
  { id: 'teahouse', name: 'Mountain Teahouse', count: 7, seconds: 105, hue: 95, grow: 1.27, nudge: 18, minSize: 18,
    kinds: ['remove', 'color', 'detail', 'grow', 'flip', 'nudge'] },
  { id: 'attic', name: "Clockmaker's Attic", count: 8, seconds: 115, hue: 75, grow: 1.22, nudge: 15, minSize: 15,
    kinds: ['remove', 'color', 'detail', 'grow', 'flip', 'nudge'] },
  { id: 'garden', name: 'Moonlit Koi Garden', count: 9, seconds: 125, hue: 60, grow: 1.2, nudge: 14, minSize: 13,
    kinds: ['remove', 'color', 'detail', 'grow', 'flip', 'nudge'] },
];

/** Stars for a cleared scene: three for a clean, quick hunt; two with time to spare; one for any clear. */
export function starsFor(result) {
  if (!result.cleared) return 0;
  const share = result.timeLeft / result.seconds;
  if (result.hintsUsed === 0 && result.misses <= 1 && share >= 0.4) return 3;
  if (share >= 0.15 && result.misses <= 4) return 2;
  return 1;
}

export const PALETTE = {
  ink: '#2a1b2e',
  paper: '#fff4e3',
  gold: '#ffc857',
  ember: '#ff7b54',
  rose: '#e85d75',
  plum: '#4b2a4f',
  night: '#1c1530',
  good: '#6ee7a8',
  bad: '#ff4d5e',
};
