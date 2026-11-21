// Short-lived feedback drawn over the pictures: sparkle bursts and a drawn-on ring for a find,
// a red cross and a shake for a miss, floating score text, and the drifting light motes that
// float identically over both pictures (so they never count as a difference).
import { makeRandom } from './random.js';

export function createEffects() {
  const sparks = [];
  const crosses = [];
  const floaters = [];
  let shake = 0;

  return {
    /** Sparkles burst from a find, in scene space, on both pictures. */
    burst(x, y, color, amount = 26) {
      for (let i = 0; i < amount; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 150;
        sparks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30, life: 0.7 + Math.random() * 0.5, age: 0, color, size: 1.5 + Math.random() * 2.5 });
      }
    },
    /** A miss: a red cross at the tap, on the panel that was tapped. */
    cross(panel, x, y) {
      crosses.push({ panel, x, y, age: 0, life: 0.9 });
      shake = 0.35;
    },
    /** Text that rises and fades on the stage (score gains, penalties, streaks). */
    float(text, x, y, color, size = 26) {
      floaters.push({ text, x, y, color, size, age: 0, life: 1.2 });
    },
    update(dt) {
      for (const list of [sparks, crosses, floaters]) {
        for (let i = list.length - 1; i >= 0; i -= 1) {
          const item = list[i];
          item.age += dt;
          if (item.vx !== undefined) {
            item.x += item.vx * dt;
            item.y += item.vy * dt;
            item.vy += 160 * dt;
            item.vx *= 0.97;
          }
          if (item.age >= item.life) list.splice(i, 1);
        }
      }
      shake = Math.max(0, shake - dt);
    },
    /** Pixel offset for the stage while a miss shakes it. */
    shakeOffset() {
      if (shake <= 0) return [0, 0];
      const power = shake * 18;
      return [Math.sin(shake * 90) * power, Math.cos(shake * 70) * power * 0.4];
    },
    drawSparks(c) {
      for (const s of sparks) {
        const fade = 1 - s.age / s.life;
        c.globalAlpha = fade;
        c.fillStyle = s.color;
        c.beginPath();
        c.arc(s.x, s.y, s.size * (0.5 + fade), 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    },
    drawCrosses(c, panel) {
      for (const m of crosses) {
        if (m.panel !== panel) continue;
        const fade = 1 - m.age / m.life;
        const r = 12 + (1 - fade) * 6;
        c.globalAlpha = fade;
        c.strokeStyle = '#ff4d5e';
        c.lineWidth = 5;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(m.x - r, m.y - r); c.lineTo(m.x + r, m.y + r);
        c.moveTo(m.x + r, m.y - r); c.lineTo(m.x - r, m.y + r);
        c.stroke();
      }
      c.globalAlpha = 1;
    },
    drawFloaters(c) {
      for (const f of floaters) {
        const t = f.age / f.life;
        c.globalAlpha = 1 - t * t;
        c.font = `800 ${f.size}px "Trebuchet MS", system-ui, sans-serif`;
        c.textAlign = 'center';
        c.lineWidth = 5;
        c.strokeStyle = 'rgba(30,15,35,0.85)';
        c.strokeText(f.text, f.x, f.y - t * 46);
        c.fillStyle = f.color;
        c.fillText(f.text, f.x, f.y - t * 46);
      }
      c.globalAlpha = 1;
    },
    clear() {
      sparks.length = 0;
      crosses.length = 0;
      floaters.length = 0;
      shake = 0;
    },
  };
}

/** Drifting motes of evening light, placed from a seed and moved by time alone. */
export function createMotes(seed, count = 18) {
  const random = makeRandom(seed);
  const motes = Array.from({ length: count }, () => ({
    x: random.range(0, 600), y: random.range(0, 450), r: random.range(1, 2.6),
    speed: random.range(6, 16), phase: random.range(0, Math.PI * 2),
  }));
  return {
    draw(c, time) {
      for (const m of motes) {
        const y = (m.y - time * m.speed + 450 * 10) % 450;
        const x = m.x + Math.sin(time * 0.6 + m.phase) * 10;
        c.globalAlpha = 0.35 + Math.sin(time * 2 + m.phase) * 0.2;
        c.fillStyle = '#fff1c4';
        c.beginPath();
        c.arc(x, y, m.r, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    },
  };
}
