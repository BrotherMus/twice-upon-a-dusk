// Hides a scene's differences. From one prop list it builds the original and the copy, changing
// `count` props in one picture or the other (a recolour, a missing prop, a missing detail, a size
// change, a mirror or a small slide), each far enough from the others that every find is its own
// circle. Harder levels allow subtler kinds and smaller props.
import { KINDS, propCircle } from './props.js';
import { turnHue } from './color.js';

/** Plain-language names the end screen uses for what each change was. */
export const CHANGE_WORDS = {
  remove: 'vanished',
  color: 'recoloured',
  detail: 'lost its',
  grow: 'resized',
  flip: 'mirrored',
  nudge: 'moved',
};

function canChange(kind, change, prop, level) {
  const spec = KINDS[kind];
  const size = Math.max(spec.w, spec.h) * prop.s;
  if (size < level.minSize && change !== 'color') return false;
  switch (change) {
    case 'remove': return !spec.fixed;
    case 'detail': return Boolean(spec.detail);
    case 'flip': return Boolean(spec.flips);
    case 'grow': return !spec.fixed || size < 120;
    case 'nudge': return !spec.fixed;
    case 'color': return Boolean(prop.color);
    default: return false;
  }
}

/** Applies one change to a prop copy and returns a short description of it. */
function applyChange(target, change, level, random) {
  const spec = KINDS[target.kind];
  switch (change) {
    case 'remove':
      target.hidden = true;
      return `${target.kind} ${CHANGE_WORDS.remove}`;
    case 'color':
      target.color = turnHue(target.color, (random.chance(0.5) ? 1 : -1) * level.hue * random.range(0.85, 1.15));
      return `${target.kind} ${CHANGE_WORDS.color}`;
    case 'detail':
      target.detail = !target.detail;
      return `${target.kind} ${CHANGE_WORDS.detail} ${spec.detail}`;
    case 'grow':
      target.s *= random.chance(0.5) ? level.grow : 1 / level.grow;
      return `${target.kind} ${CHANGE_WORDS.grow}`;
    case 'flip':
      target.flip = !target.flip;
      return `${target.kind} ${CHANGE_WORDS.flip}`;
    case 'nudge':
      target.x += (random.chance(0.5) ? 1 : -1) * level.nudge;
      return `${target.kind} ${CHANGE_WORDS.nudge}`;
    default:
      return target.kind;
  }
}

/** The hit circle that covers a changed prop in both pictures. */
function circleCovering(before, after) {
  const a = propCircle(before);
  const b = propCircle(after);
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  const reach = Math.max(Math.hypot(a.x - x, a.y - y) + a.r, Math.hypot(b.x - x, b.y - y) + b.r);
  return { x, y, r: Math.max(18, Math.min(reach + 6, 64)) };
}

/**
 * Picks the differences for one visit. Returns { left, right, diffs } where left/right are the prop
 * lists to paint and each diff is { id, x, y, r, side, change, words, found }.
 */
export function hideDifferences(props, level, random) {
  const left = props.map((p) => ({ ...p }));
  const right = props.map((p) => ({ ...p }));
  const diffs = [];
  const order = random.shuffle(props.map((_, index) => index));
  // Spread the change kinds: cycle through a shuffled list so no one kind dominates a scene.
  let kinds = random.shuffle(level.kinds);
  let kindIndex = 0;
  for (const index of order) {
    if (diffs.length >= level.count) break;
    const base = props[index];
    const circle = propCircle(base);
    const crowded = diffs.some((d) => Math.hypot(d.x - circle.x, d.y - circle.y) < d.r + circle.r + 6);
    if (crowded) continue;
    let change = null;
    for (let tries = 0; tries < kinds.length; tries += 1) {
      const candidate = kinds[(kindIndex + tries) % kinds.length];
      if (canChange(base.kind, candidate, base, level)) {
        change = candidate;
        kindIndex += tries + 1;
        break;
      }
    }
    if (!change) continue;
    if (kindIndex >= kinds.length) {
      kinds = random.shuffle(level.kinds);
      kindIndex = 0;
    }
    // A vanished prop reads better as "added" half the time: hide it in the original instead.
    const side = random.chance(0.5) ? 'right' : 'left';
    const target = side === 'right' ? right[index] : left[index];
    const words = applyChange(target, change, level, random);
    diffs.push({ id: diffs.length, ...circleCovering(base, target), side, change, words, found: false, kind: base.kind });
  }
  return { left, right, diffs };
}
