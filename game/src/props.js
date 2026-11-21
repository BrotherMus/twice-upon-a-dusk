// The prop painter: every object a difference can hide in. Each kind draws itself with its
// bottom-centre at (0, 0), inside a w x h box (x in [-w/2, w/2], y in [-h, 0]), from a plain record
// { kind, x, y, s, color, color2, detail, flip }. `detail` names the small feature the "detail"
// difference takes away; `fixed` kinds are scenery too big to vanish or mirror.
import { shade, withAlpha } from './color.js';

function ellipse(c, x, y, rx, ry, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}

function poly(c, points, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
  c.closePath();
  c.fill();
}

function box(c, x, y, w, h, fill) {
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
}

function glow(c, x, y, r, color, alpha) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, withAlpha(color, alpha));
  g.addColorStop(1, withAlpha(color, 0));
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function line(c, x1, y1, x2, y2, stroke, width) {
  c.strokeStyle = stroke;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

const INK = '#3a2233';

export const KINDS = {
  cloud: { w: 104, h: 40, detail: 'top puff', fixed: false,
    draw(c, p) {
      const top = shade(p.color, 0.25);
      ellipse(c, -26, -13, 30, 13, p.color);
      ellipse(c, 10, -17, 34, 17, p.color);
      ellipse(c, 36, -11, 18, 11, p.color);
      ellipse(c, -46, -8, 12, 8, p.color);
      if (p.detail) ellipse(c, -4, -29, 15, 11, p.color);
      ellipse(c, 8, -24, 22, 6, top);
    } },
  bird: { w: 26, h: 12, flips: true,
    draw(c, p) {
      c.strokeStyle = p.color;
      c.lineWidth = 2.4;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-12, -9);
      c.quadraticCurveTo(-6, -11, 0, -4);
      c.quadraticCurveTo(5, -12, 13, -10);
      c.stroke();
    } },
  star: { w: 10, h: 10,
    draw(c, p) {
      glow(c, 0, -5, 8, p.color, 0.5);
      poly(c, [0, -10, 1.6, -6.6, 5, -5, 1.6, -3.4, 0, 0, -1.6, -3.4, -5, -5, -1.6, -6.6], p.color);
    } },
  lantern: { w: 22, h: 46, detail: 'tassel',
    draw(c, p) {
      line(c, 0, -46, 0, -36, INK, 1.5);
      glow(c, 0, -22, 22, '#ffb347', 0.45);
      ellipse(c, 0, -22, 10, 13, p.color);
      ellipse(c, -3, -24, 3, 8, shade(p.color, 0.35));
      box(c, -6, -37, 12, 4, INK);
      box(c, -6, -10, 12, 3, INK);
      if (p.detail) line(c, 0, -7, 0, 0, p.color2 || '#ffd166', 2.5);
    } },
  house: { w: 74, h: 82, detail: 'lit window', flips: true, fixed: true,
    draw(c, p) {
      box(c, 14, -78, 9, 18, shade(p.color2, -0.25));
      box(c, -32, -50, 64, 50, p.color);
      box(c, -32, -50, 8, 50, shade(p.color, -0.12));
      poly(c, [-39, -48, 0, -80, 39, -48], p.color2);
      poly(c, [-39, -48, 0, -80, 0, -74, -32, -48], shade(p.color2, 0.15));
      const lit = '#ffd27a';
      const dark = '#4a3550';
      box(c, -22, -40, 12, 12, p.detail ? lit : dark);
      box(c, 9, -40, 12, 12, lit);
      if (p.detail) glow(c, -16, -34, 16, lit, 0.35);
      glow(c, 15, -34, 16, lit, 0.35);
      box(c, -5, -22, 11, 22, shade(p.color, -0.45));
    } },
  pine: { w: 42, h: 92,
    draw(c, p) {
      box(c, -3, -12, 6, 12, '#5a3a2e');
      poly(c, [-21, -12, 0, -48, 21, -12], p.color);
      poly(c, [-17, -36, 0, -70, 17, -36], shade(p.color, 0.08));
      poly(c, [-12, -58, 0, -92, 12, -58], shade(p.color, 0.16));
      poly(c, [0, -92, 12, -58, 4, -58], shade(p.color, -0.2));
    } },
  tree: { w: 66, h: 86, detail: 'fruit',
    draw(c, p) {
      box(c, -4, -30, 8, 30, '#6b4430');
      ellipse(c, 0, -52, 30, 26, p.color);
      ellipse(c, -16, -44, 16, 14, shade(p.color, -0.12));
      ellipse(c, 14, -62, 16, 14, shade(p.color, 0.14));
      if (p.detail) {
        const fruit = p.color2 || '#ff6b6b';
        ellipse(c, -12, -56, 4, 4, fruit);
        ellipse(c, 10, -46, 4, 4, fruit);
        ellipse(c, 2, -66, 4, 4, fruit);
        ellipse(c, 18, -54, 4, 4, fruit);
      }
    } },
  boat: { w: 84, h: 74, detail: 'pennant', flips: true,
    draw(c, p) {
      line(c, 2, -14, 2, -70, INK, 2.5);
      poly(c, [5, -66, 5, -20, 34, -20], p.color2);
      poly(c, [-1, -60, -1, -20, -26, -20], shade(p.color2, -0.15));
      if (p.detail) poly(c, [2, -70, 16, -65, 2, -61], '#ff5d73');
      poly(c, [-40, -16, 40, -16, 30, 0, -32, 0], p.color);
      box(c, -38, -16, 76, 3, shade(p.color, 0.3));
      ellipse(c, -18, -8, 2.5, 2.5, '#ffe7b0');
      ellipse(c, -6, -8, 2.5, 2.5, '#ffe7b0');
      ellipse(c, 6, -8, 2.5, 2.5, '#ffe7b0');
    } },
  lighthouse: { w: 46, h: 156, detail: 'tower window', fixed: true,
    draw(c, p) {
      glow(c, 0, -134, 70, '#fff1a8', 0.45);
      poly(c, [-18, 0, 18, 0, 12, -118, -12, -118], '#fbeee0');
      for (let i = 0; i < 3; i += 1) {
        const y0 = -18 - i * 36;
        const w0 = 18 - (i * 36 + 18) * 0.05;
        const w1 = 18 - (i * 36 + 36) * 0.05;
        poly(c, [-w0, y0, w0, y0, w1, y0 - 18, -w1, y0 - 18], p.color);
      }
      box(c, -14, -122, 28, 6, INK);
      box(c, -9, -142, 18, 20, '#fff1a8');
      poly(c, [-12, -142, 12, -142, 0, -156], p.color);
      if (p.detail) box(c, -3, -76, 6, 9, '#4a3550');
    } },
  crate: { w: 28, h: 26,
    draw(c, p) {
      box(c, -14, -26, 28, 26, p.color);
      c.strokeStyle = shade(p.color, -0.35);
      c.lineWidth = 2;
      c.strokeRect(-13, -25, 26, 24);
      line(c, -12, -24, 12, -2, shade(p.color, -0.35), 2);
    } },
  barrel: { w: 24, h: 30, detail: 'band',
    draw(c, p) {
      ellipse(c, 0, -15, 12, 15, p.color);
      box(c, -12, -21, 24, 3, '#3d2a2a');
      if (p.detail) box(c, -12, -11, 24, 3, '#3d2a2a');
      ellipse(c, -4, -16, 3, 10, shade(p.color, 0.18));
    } },
  buoy: { w: 18, h: 28, detail: 'bell',
    draw(c, p) {
      if (p.detail) {
        line(c, 0, -28, 0, -20, INK, 2);
        ellipse(c, 0, -27, 3.5, 3.5, '#ffd166');
      }
      poly(c, [-9, 0, 9, 0, 6, -20, -6, -20], p.color);
      box(c, -8, -12, 16, 5, '#fff4e3');
    } },
  cat: { w: 36, h: 32, detail: 'tail', flips: true,
    draw(c, p) {
      if (p.detail) {
        c.strokeStyle = p.color;
        c.lineWidth = 4;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(10, -6);
        c.quadraticCurveTo(24, -6, 18, -26);
        c.stroke();
      }
      ellipse(c, 2, -9, 13, 9, p.color);
      ellipse(c, -9, -21, 8, 7, p.color);
      poly(c, [-16, -24, -14, -33, -9, -27], p.color);
      poly(c, [-8, -27, -3, -33, -2, -23], p.color);
      ellipse(c, -11, -22, 1.3, 1.6, '#ffe66d');
      ellipse(c, -6, -22, 1.3, 1.6, '#ffe66d');
    } },
  basket: { w: 38, h: 28, detail: 'top fruit',
    draw(c, p) {
      ellipse(c, -9, -14, 7, 7, p.color);
      ellipse(c, 4, -15, 7, 7, shade(p.color, -0.1));
      ellipse(c, 13, -13, 6, 6, p.color);
      if (p.detail) ellipse(c, -2, -22, 6, 6, shade(p.color, 0.12));
      poly(c, [-19, -12, 19, -12, 14, 0, -14, 0], '#a0673c');
      line(c, -16, -7, 16, -7, '#7a4a2a', 1.6);
    } },
  stall: { w: 124, h: 104, detail: 'fringe', fixed: true,
    draw(c, p) {
      box(c, -56, -78, 5, 78, '#5d3a2e');
      box(c, 51, -78, 5, 78, '#5d3a2e');
      box(c, -60, -34, 120, 34, p.color2);
      box(c, -60, -34, 120, 5, shade(p.color2, 0.25));
      for (let i = 0; i < 6; i += 1) {
        poly(c, [-62 + i * 20.7, -80, -41 + i * 20.7, -80, -45 + i * 20.7, -104, -58 + i * 20.7, -104],
          i % 2 ? '#fff1dc' : p.color);
      }
      if (p.detail) {
        for (let i = 0; i < 6; i += 1) {
          c.fillStyle = i % 2 ? '#fff1dc' : p.color;
          c.beginPath();
          c.arc(-51.5 + i * 20.7, -80, 10.3, 0, Math.PI);
          c.fill();
        }
      }
    } },
  sign: { w: 38, h: 50, detail: 'emblem', flips: true,
    draw(c, p) {
      box(c, -2, -26, 4, 26, '#5d3a2e');
      box(c, -18, -50, 34, 24, p.color);
      box(c, -18, -50, 34, 3, shade(p.color, 0.3));
      if (p.detail) {
        ellipse(c, -6, -38, 6, 6, '#ffe7b0');
        ellipse(c, -3, -40, 5, 5, p.color);
      }
      line(c, 4, -42, 12, -42, '#ffe7b0', 2);
      line(c, 4, -36, 10, -36, '#ffe7b0', 2);
    } },
  plant: { w: 28, h: 40, detail: 'flower',
    draw(c, p) {
      ellipse(c, -6, -22, 5, 11, '#4f9d69');
      ellipse(c, 6, -24, 5, 12, '#5fb37a');
      ellipse(c, 0, -28, 4, 13, '#3f8a5a');
      if (p.detail) {
        ellipse(c, 6, -37, 4.5, 4.5, p.color2 || '#ff8fab');
        ellipse(c, 6, -37, 1.8, 1.8, '#ffe066');
      }
      poly(c, [-11, -14, 11, -14, 8, 0, -8, 0], p.color);
    } },
  clock: { w: 38, h: 44, detail: 'hand position',
    draw(c, p) {
      box(c, -10, -6, 20, 6, shade(p.color, -0.3));
      ellipse(c, 0, -25, 18, 18, p.color);
      ellipse(c, 0, -25, 14, 14, '#fff6e6');
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        ellipse(c, Math.cos(a) * 11.5, -25 + Math.sin(a) * 11.5, 0.9, 0.9, INK);
      }
      const hour = p.detail ? -2.1 : 0.6;
      const minute = p.detail ? -1.05 : 2.4;
      line(c, 0, -25, Math.cos(hour) * 7, -25 + Math.sin(hour) * 7, INK, 2.2);
      line(c, 0, -25, Math.cos(minute) * 11, -25 + Math.sin(minute) * 11, INK, 1.5);
      poly(c, [-6, -43, 6, -43, 0, -48], p.color);
    } },
  books: { w: 36, h: 32, detail: 'top book',
    draw(c, p) {
      box(c, -17, -10, 34, 10, p.color);
      box(c, -14, -20, 30, 10, p.color2);
      box(c, 13, -10, 3, 10, '#fff1dc');
      if (p.detail) {
        box(c, -12, -29, 26, 9, shade(p.color, 0.3));
        box(c, -12, -26, 26, 2, '#ffd166');
      }
    } },
  jar: { w: 18, h: 26, detail: 'lid',
    draw(c, p) {
      if (p.detail) box(c, -7, -26, 14, 5, '#7a4a2a');
      box(c, -8, -21, 16, 21, withAlpha('#dff3ff', 0.55));
      box(c, -7, -13, 14, 12, p.color);
      box(c, -5, -19, 3, 16, withAlpha('#ffffff', 0.5));
    } },
  candle: { w: 14, h: 34, detail: 'flame',
    draw(c, p) {
      box(c, -5, -22, 10, 22, p.color);
      box(c, -5, -22, 3, 22, shade(p.color, 0.3));
      line(c, 0, -22, 0, -25, INK, 1.2);
      if (p.detail) {
        glow(c, 0, -29, 16, '#ffcf6e', 0.55);
        ellipse(c, 0, -29, 3, 5.5, '#ffb03b');
        ellipse(c, 0, -28, 1.5, 3, '#fff3c4');
      }
    } },
  frame: { w: 46, h: 38, detail: 'painted sun',
    draw(c, p) {
      box(c, -23, -38, 46, 38, p.color);
      box(c, -18, -33, 36, 28, '#ffcf99');
      poly(c, [-18, -5, -6, -20, 4, -11, 10, -17, 18, -5], '#7d5a8c');
      if (p.detail) ellipse(c, 9, -26, 4.5, 4.5, '#ff7b54');
    } },
  teapot: { w: 40, h: 30, detail: 'lid knob', flips: true,
    draw(c, p) {
      c.strokeStyle = p.color;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(15, -13, 7, -Math.PI / 2, Math.PI / 2);
      c.stroke();
      poly(c, [-12, -12, -22, -22, -19, -24, -8, -16], p.color);
      ellipse(c, 0, -11, 14, 11, p.color);
      ellipse(c, 0, -21, 8, 3, shade(p.color, -0.2));
      if (p.detail) ellipse(c, 0, -26, 3, 3, shade(p.color, -0.3));
      ellipse(c, -4, -13, 4, 5, shade(p.color, 0.3));
    } },
  cup: { w: 16, h: 14,
    draw(c, p) {
      poly(c, [-7, -12, 7, -12, 5, 0, -5, 0], p.color);
      box(c, -7, -12, 14, 2, shade(p.color, 0.35));
    } },
  mushroom: { w: 18, h: 18, detail: 'spots',
    draw(c, p) {
      box(c, -3, -9, 6, 9, '#fff1dc');
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(0, -9, 9, Math.PI, 0);
      c.fill();
      if (p.detail) {
        ellipse(c, -4, -13, 1.8, 1.8, '#fff8ec');
        ellipse(c, 3, -15, 1.6, 1.6, '#fff8ec');
        ellipse(c, 5, -11, 1.3, 1.3, '#fff8ec');
      }
    } },
  flower: { w: 14, h: 28,
    draw(c, p) {
      line(c, 0, 0, 0, -18, '#4f9d69', 2);
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2;
        ellipse(c, Math.cos(a) * 4, -22 + Math.sin(a) * 4, 3.2, 3.2, p.color);
      }
      ellipse(c, 0, -22, 2.2, 2.2, '#ffe066');
    } },
  lily: { w: 40, h: 14, detail: 'blossom',
    draw(c, p) {
      c.fillStyle = '#3f8f6a';
      c.beginPath();
      c.ellipse(0, -4, 19, 6, 0, 0.35, Math.PI * 2);
      c.lineTo(0, -4);
      c.fill();
      if (p.detail) {
        poly(c, [-6, -5, -3, -13, 0, -6, 3, -13, 6, -5], p.color);
        ellipse(c, 0, -6, 2, 2, '#ffe066');
      }
    } },
  frog: { w: 22, h: 16, flips: true,
    draw(c, p) {
      ellipse(c, 0, -6, 10, 6, p.color);
      ellipse(c, -5, -12, 3.5, 3.5, p.color);
      ellipse(c, 4, -12, 3.5, 3.5, p.color);
      ellipse(c, -5, -12, 1.4, 1.4, INK);
      ellipse(c, 4, -12, 1.4, 1.4, INK);
      ellipse(c, 8, -2, 4, 2, shade(p.color, -0.2));
    } },
  koi: { w: 40, h: 16, detail: 'spot', flips: true,
    draw(c, p) {
      poly(c, [14, -8, 22, -15, 22, -1], p.color);
      ellipse(c, 0, -8, 15, 6.5, p.color);
      if (p.detail) ellipse(c, 2, -9, 5, 3.5, p.color2 || '#fff4e3');
      ellipse(c, -10, -9, 1.2, 1.2, INK);
    } },
  stoneLantern: { w: 30, h: 54, detail: 'glow',
    draw(c, p) {
      box(c, -9, -14, 18, 14, p.color);
      box(c, -13, -18, 26, 5, shade(p.color, -0.15));
      box(c, -9, -34, 18, 16, p.color);
      box(c, -4, -30, 8, 8, p.detail ? '#ffd27a' : '#3a3346');
      if (p.detail) glow(c, 0, -26, 20, '#ffd27a', 0.45);
      poly(c, [-16, -34, 16, -34, 0, -48], shade(p.color, 0.1));
      ellipse(c, 0, -50, 3, 3, p.color);
    } },
  rock: { w: 36, h: 18,
    draw(c, p) {
      c.fillStyle = p.color;
      c.beginPath();
      c.moveTo(-18, 0);
      c.quadraticCurveTo(-16, -16, 0, -17);
      c.quadraticCurveTo(16, -16, 18, 0);
      c.closePath();
      c.fill();
      ellipse(c, -5, -11, 6, 3, shade(p.color, 0.18));
    } },
  bench: { w: 54, h: 24,
    draw(c, p) {
      box(c, -24, -10, 4, 10, '#4a3030');
      box(c, 20, -10, 4, 10, '#4a3030');
      box(c, -27, -14, 54, 5, p.color);
      box(c, -27, -24, 54, 4, p.color);
    } },
  parasol: { w: 52, h: 56, detail: 'finial',
    draw(c, p) {
      line(c, 0, 0, 0, -44, '#5d3a2e', 2.5);
      c.fillStyle = p.color;
      c.beginPath();
      c.moveTo(-26, -40);
      c.quadraticCurveTo(0, -64, 26, -40);
      c.closePath();
      c.fill();
      poly(c, [-9, -40, 0, -54, 9, -40], shade(p.color, 0.3));
      if (p.detail) ellipse(c, 0, -54, 3, 3, '#ffd166');
    } },
  kite: { w: 30, h: 56, detail: 'tail bows', flips: true,
    draw(c, p) {
      c.strokeStyle = INK;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, -24);
      c.quadraticCurveTo(10, -14, 2, 0);
      c.stroke();
      poly(c, [0, -56, 13, -40, 0, -24, -13, -40], p.color);
      poly(c, [0, -56, 13, -40, 0, -40], shade(p.color, 0.3));
      if (p.detail) {
        poly(c, [4, -16, 9, -14, 4, -12], '#ffd166');
        poly(c, [4, -7, 9, -5, 4, -3], '#ffd166');
      }
    } },
  bridge: { w: 180, h: 56, detail: 'post lanterns', fixed: true,
    draw(c, p) {
      c.strokeStyle = p.color;
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(-88, -4);
      c.quadraticCurveTo(0, -60, 88, -4);
      c.stroke();
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-84, -20);
      c.quadraticCurveTo(0, -76, 84, -20);
      c.stroke();
      for (let i = -2; i <= 2; i += 1) {
        const x = i * 36;
        const y = -4 - (1 - (x / 88) ** 2) * 28;
        box(c, x - 2, y - 18, 4, 18, p.color);
        if (p.detail && i % 2 === 0) {
          glow(c, x, y - 22, 12, '#ffd27a', 0.6);
          ellipse(c, x, y - 22, 3.5, 3.5, '#ffd27a');
        }
      }
    } },
  globe: { w: 32, h: 42, detail: 'ring',
    draw(c, p) {
      box(c, -9, -4, 18, 4, '#6b4430');
      box(c, -1.5, -10, 3, 7, '#6b4430');
      ellipse(c, 0, -25, 13, 13, p.color);
      ellipse(c, -4, -28, 5, 4, p.color2 || '#7fc97f');
      ellipse(c, 5, -20, 4, 3, p.color2 || '#7fc97f');
      if (p.detail) {
        c.strokeStyle = '#c9a25c';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(0, -25, 16, -Math.PI * 0.7, Math.PI * 0.7);
        c.stroke();
      }
    } },
  gear: { w: 28, h: 28, detail: 'hub',
    draw(c, p) {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        ellipse(c, Math.cos(a) * 11, -14 + Math.sin(a) * 11, 3.5, 3.5, p.color);
      }
      ellipse(c, 0, -14, 11, 11, p.color);
      ellipse(c, 0, -14, 4.5, 4.5, p.detail ? shade(p.color, -0.45) : p.color);
    } },
  hourglass: { w: 18, h: 30, detail: 'falling sand',
    draw(c, p) {
      box(c, -9, -30, 18, 3, '#6b4430');
      box(c, -9, -3, 18, 3, '#6b4430');
      poly(c, [-7, -27, 7, -27, 0, -15], withAlpha('#dff3ff', 0.6));
      poly(c, [-7, -3, 7, -3, 0, -15], withAlpha('#dff3ff', 0.6));
      poly(c, [-4, -22, 4, -22, 0, -16], p.color);
      poly(c, [-6, -3, 6, -3, 0, -9], p.color);
      if (p.detail) line(c, 0, -15, 0, -5, p.color, 1.2);
    } },
  firefly: { w: 10, h: 10,
    draw(c, p) {
      glow(c, 0, -5, 9, p.color, 0.8);
      ellipse(c, 0, -5, 1.8, 1.8, '#fffbe0');
    } },
  bamboo: { w: 34, h: 116, detail: 'top leaves',
    draw(c, p) {
      const stems = [[-10, 112], [0, 116], [10, 104]];
      stems.forEach(([x, h], i) => {
        box(c, x - 2.5, -h, 5, h, i === 1 ? p.color : shade(p.color, -0.12));
        for (let y = -20; y > -h; y -= 22) box(c, x - 3.5, y, 7, 2, shade(p.color, -0.3));
      });
      c.fillStyle = shade(p.color, 0.15);
      const leaf = (x, y, dir) => {
        c.beginPath();
        c.ellipse(x + dir * 9, y, 10, 3, dir * 0.35, 0, Math.PI * 2);
        c.fill();
      };
      leaf(-10, -70, -1); leaf(10, -60, 1); leaf(0, -88, 1);
      if (p.detail) { leaf(0, -110, -1); leaf(-10, -104, 1); leaf(10, -98, 1); }
    } },
  crane: { w: 36, h: 56, detail: 'red crown', flips: true,
    draw(c, p) {
      line(c, -2, 0, -3, -20, '#3a2233', 1.6);
      line(c, 4, 0, 3, -20, '#3a2233', 1.6);
      ellipse(c, 2, -26, 13, 8, p.color);
      poly(c, [10, -28, 20, -22, 12, -22], '#3a2233');
      c.strokeStyle = p.color;
      c.lineWidth = 3.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-6, -30);
      c.quadraticCurveTo(-12, -44, -6, -50);
      c.stroke();
      ellipse(c, -5, -51, 4, 3.5, p.color);
      poly(c, [-8, -51, -18, -49, -8, -49], '#e0a040');
      if (p.detail) ellipse(c, -4, -54, 2.2, 1.6, '#e8364a');
    } },
  fox: { w: 44, h: 30, detail: 'white tail tip', flips: true,
    draw(c, p) {
      c.fillStyle = p.color;
      c.beginPath();
      c.ellipse(16, -12, 11, 5, -0.6, 0, Math.PI * 2);
      c.fill();
      if (p.detail) ellipse(c, 23, -17, 4, 3, '#fff4e3');
      ellipse(c, 0, -10, 12, 7, p.color);
      box(c, -8, -6, 3, 6, shade(p.color, -0.3));
      box(c, 5, -6, 3, 6, shade(p.color, -0.3));
      ellipse(c, -12, -17, 6.5, 5.5, p.color);
      poly(c, [-17, -20, -16, -29, -11, -22], p.color);
      poly(c, [-11, -22, -7, -29, -6, -19], p.color);
      poly(c, [-17, -16, -24, -14, -16, -13], '#fff4e3');
      ellipse(c, -13, -18, 1.2, 1.2, '#2a1830');
    } },
  reeds: { w: 26, h: 40, detail: 'cattail',
    draw(c, p) {
      [[-8, -30, -0.2], [0, -38, 0], [8, -28, 0.25], [-3, -24, -0.1]].forEach(([x, h, lean]) => {
        line(c, x, 0, x + lean * 30, h, p.color, 2);
      });
      if (p.detail) {
        c.fillStyle = '#7a4a2a';
        c.beginPath();
        c.ellipse(0, -36, 2.5, 6, 0, 0, Math.PI * 2);
        c.fill();
      }
    } },
  butterfly: { w: 16, h: 12, flips: true,
    draw(c, p) {
      ellipse(c, -4, -8, 4.5, 3.5, p.color);
      ellipse(c, 4, -8, 4.5, 3.5, p.color);
      ellipse(c, -3, -3, 3, 2.5, shade(p.color, -0.15));
      ellipse(c, 3, -3, 3, 2.5, shade(p.color, -0.15));
      line(c, 0, -11, 0, -1, '#2a1830', 1.4);
    } },
  bunting: { w: 150, h: 30, detail: 'middle flag', fixed: true,
    draw(c, p) {
      c.strokeStyle = INK;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-75, -30);
      c.quadraticCurveTo(0, -12, 75, -30);
      c.stroke();
      const colors = [p.color, p.color2, '#fff1dc'];
      for (let i = 0; i < 7; i += 1) {
        if (i === 3 && !p.detail) continue;
        const x = -60 + i * 20;
        const y = -30 + (1 - (x / 75) ** 2) * 9;
        poly(c, [x - 7, y, x + 7, y, x, y + 14], colors[i % 3]);
      }
    } },
};

/** Kinds that hang, fly, float or sit on a wall: they cast no ground shadow. */
const UNGROUNDED = new Set(['cloud', 'bird', 'star', 'lantern', 'kite', 'firefly', 'bunting', 'butterfly', 'boat', 'buoy',
  'koi', 'lily', 'frog', 'frame', 'bridge', 'lighthouse']);

/** Draws one prop in scene space, applying its position, scale and mirror, with a soft shadow. */
export function drawProp(c, prop) {
  const kind = KINDS[prop.kind];
  c.save();
  c.translate(prop.x, prop.y);
  c.scale(prop.flip ? -prop.s : prop.s, prop.s);
  if (!UNGROUNDED.has(prop.kind)) ellipse(c, 0, -0.5, kind.w * 0.44, 3.2, 'rgba(25,8,30,0.3)');
  kind.draw(c, prop);
  c.restore();
}

/** The circle (scene units) a prop fills: where a tap counts as touching it. */
export function propCircle(prop) {
  const kind = KINDS[prop.kind];
  const w = kind.w * prop.s;
  const h = kind.h * prop.s;
  return { x: prop.x, y: prop.y - h / 2, r: Math.max(w, h) / 2 };
}
