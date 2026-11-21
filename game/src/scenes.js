// The five hand-placed scenes of the journey. Each has a backdrop painter (sky, land, water: never
// changed between the two pictures) and a list of props, any of which may hide a difference.
import { KINDS } from './props.js';
import { shade, withAlpha } from './color.js';

/** One prop record; `detail` starts present on every kind that has one. */
function prop(kind, x, y, s, color, color2) {
  return { kind, x, y, s, color, color2, detail: Boolean(KINDS[kind].detail), flip: false };
}

function skyGradient(c, stops, height) {
  const g = c.createLinearGradient(0, 0, 0, height);
  stops.forEach(([at, color]) => g.addColorStop(at, color));
  c.fillStyle = g;
  c.fillRect(0, 0, 600, height);
}

function sunDisc(c, x, y, r, color, haloColor) {
  const halo = c.createRadialGradient(x, y, r * 0.5, x, y, r * 4);
  halo.addColorStop(0, withAlpha(haloColor, 0.55));
  halo.addColorStop(1, withAlpha(haloColor, 0));
  c.fillStyle = halo;
  c.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

/** A ridge of hills or mountains from a list of [x, y] peaks, filled down to `base`. */
function ridge(c, points, base, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(points[0][0], base);
  points.forEach(([x, y]) => c.lineTo(x, y));
  c.lineTo(points[points.length - 1][0], base);
  c.closePath();
  c.fill();
}

function waterShimmer(c, x, top, bottom, color) {
  for (let y = top + 6, i = 0; y < bottom; y += 9, i += 1) {
    const w = 70 - (y - top) * 0.12 + (i % 3) * 14;
    c.fillStyle = withAlpha(color, 0.55 - (y - top) / (bottom - top) * 0.4);
    c.fillRect(x - w / 2 + ((i * 37) % 23) - 11, y, w, 2.5);
  }
}

/** Little fans of grass blades at the given points (scenery: the same in both pictures). */
function grassTufts(c, points, color = '#6d5a86') {
  c.strokeStyle = color;
  c.lineWidth = 1.6;
  c.lineCap = 'round';
  for (const [x, y] of points) {
    c.beginPath();
    for (let i = -2; i <= 2; i += 1) {
      c.moveTo(x + i * 2, y);
      c.lineTo(x + i * 4, y - 8 + Math.abs(i));
    }
    c.stroke();
  }
}

function paintHarbor(c) {
  skyGradient(c, [[0, '#2d1f4f'], [0.35, '#8c3f6b'], [0.62, '#ff7b54'], [0.8, '#ffc778']], 262);
  sunDisc(c, 380, 246, 44, '#ffe3a3', '#ffb347');
  ridge(c, [[0, 205], [70, 190], [150, 214], [230, 236], [260, 262]], 262, '#6b3a5e');
  ridge(c, [[480, 262], [500, 236], [560, 222], [600, 230]], 262, '#4b2a4f');
  const sea = c.createLinearGradient(0, 262, 0, 450);
  sea.addColorStop(0, '#d9707a');
  sea.addColorStop(0.3, '#7b4a78');
  sea.addColorStop(1, '#2b2147');
  c.fillStyle = sea;
  c.fillRect(0, 262, 600, 188);
  waterShimmer(c, 380, 262, 440, '#ffd9a0');
  // The pier: planks and posts along the bottom left.
  c.fillStyle = '#5a3a3a';
  for (let x = 12; x < 240; x += 46) c.fillRect(x, 392, 7, 58);
  c.fillStyle = '#8a5a4a';
  c.fillRect(0, 386, 246, 10);
  c.fillStyle = '#a8705a';
  c.fillRect(0, 384, 246, 3);
  // Lamp post on the pier.
  c.fillStyle = '#3a2233';
  c.fillRect(150, 300, 4, 86);
  c.fillRect(150, 300, 28, 4);
}

function paintMarket(c) {
  skyGradient(c, [[0, '#2a1d4a'], [0.45, '#7a3b6e'], [0.8, '#ff8c61'], [1, '#ffbf7a']], 240);
  sunDisc(c, 470, 70, 18, '#fff2d0', '#ffe1a8');
  // Rooftops along the back of the square.
  const roofs = [[0, 150, 110], [100, 130, 90], [180, 160, 120], [290, 120, 100], [380, 150, 90], [460, 135, 140]];
  roofs.forEach(([x, top, w], i) => {
    c.fillStyle = i % 2 ? '#5a2f55' : '#4a2a50';
    c.fillRect(x, top, w, 240 - top);
    c.fillStyle = '#3a2040';
    c.beginPath();
    c.moveTo(x - 6, top);
    c.lineTo(x + w / 2, top - 26);
    c.lineTo(x + w + 6, top);
    c.closePath();
    c.fill();
    c.fillStyle = withAlpha('#ffcf7a', 0.85);
    for (let wx = x + 14; wx < x + w - 14; wx += 30) c.fillRect(wx, top + 22, 10, 14);
  });
  // Cobbled square.
  const ground = c.createLinearGradient(0, 240, 0, 450);
  ground.addColorStop(0, '#a35d5d');
  ground.addColorStop(1, '#5c3346');
  c.fillStyle = ground;
  c.fillRect(0, 240, 600, 210);
  c.fillStyle = withAlpha('#2a1830', 0.18);
  for (let y = 250, row = 0; y < 450; y += 16, row += 1) {
    for (let x = (row % 2) * 14; x < 600; x += 28) c.fillRect(x, y, 24, 2);
  }
  // String poles holding the lantern lines.
  c.fillStyle = '#3a2233';
  c.fillRect(6, 40, 5, 220);
  c.fillRect(589, 40, 5, 220);
  c.strokeStyle = '#3a2233';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(8, 50);
  c.quadraticCurveTo(300, 120, 592, 50);
  c.stroke();
}

function paintTeahouse(c) {
  skyGradient(c, [[0, '#3a2a63'], [0.4, '#a1497a'], [0.75, '#ff8a5c'], [1, '#ffd08a']], 300);
  sunDisc(c, 210, 196, 34, '#ffefc2', '#ffb35c');
  ridge(c, [[0, 170], [80, 110], [140, 150], [230, 90], [320, 160], [400, 120], [480, 170], [600, 130]], 300, '#9a5a86');
  ridge(c, [[0, 230], [60, 190], [150, 226], [260, 180], [340, 230], [430, 200], [520, 236], [600, 206]], 300, '#6e3d6e');
  c.fillStyle = withAlpha('#ffd6b0', 0.35);
  c.fillRect(0, 232, 600, 16);
  // Grassy slope and the stream.
  c.fillStyle = '#4e3a5e';
  c.fillRect(0, 280, 600, 170);
  c.fillStyle = '#5d4a6a';
  c.beginPath();
  c.moveTo(0, 280);
  c.quadraticCurveTo(300, 255, 600, 286);
  c.lineTo(600, 330);
  c.lineTo(0, 330);
  c.fill();
  const stream = c.createLinearGradient(0, 380, 0, 450);
  stream.addColorStop(0, '#e98b7d');
  stream.addColorStop(1, '#6b4a85');
  c.fillStyle = stream;
  c.beginPath();
  c.moveTo(0, 396);
  c.quadraticCurveTo(300, 370, 600, 398);
  c.lineTo(600, 450);
  c.lineTo(0, 450);
  c.fill();
  waterShimmer(c, 300, 392, 446, '#ffe2b8');
  // Stone path from the teahouse door down to the bridge.
  c.fillStyle = '#b48a8a';
  c.beginPath();
  c.moveTo(486, 304);
  c.quadraticCurveTo(470, 340, 410, 372);
  c.lineTo(440, 376);
  c.quadraticCurveTo(500, 344, 514, 304);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(60,30,60,0.25)';
  for (let i = 0; i < 6; i += 1) c.fillRect(492 - i * 15, 312 + i * 11, 18, 2);
  grassTufts(c, [[30, 330], [120, 300], [180, 340], [230, 296], [300, 352], [350, 304], [420, 336], [560, 336], [590, 360], [160, 380]]);
  // The teahouse on the right: two curved roofs and a warm doorway.
  c.fillStyle = '#7a3f3f';
  c.fillRect(436, 222, 128, 82);
  c.fillStyle = '#ffcf7a';
  c.fillRect(486, 252, 28, 52);
  c.fillRect(452, 246, 22, 20);
  c.fillRect(526, 246, 22, 20);
  c.fillStyle = '#2f2140';
  c.beginPath();
  c.moveTo(420, 226);
  c.quadraticCurveTo(500, 196, 580, 226);
  c.lineTo(560, 206);
  c.lineTo(440, 206);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(436, 206);
  c.quadraticCurveTo(500, 170, 564, 206);
  c.lineTo(540, 180);
  c.lineTo(460, 180);
  c.closePath();
  c.fill();
}

function paintAttic(c) {
  // Plank wall.
  c.fillStyle = '#6b3f3a';
  c.fillRect(0, 0, 600, 450);
  for (let x = 0; x < 600; x += 40) {
    c.fillStyle = (x / 40) % 2 ? '#74463f' : '#683c37';
    c.fillRect(x, 0, 38, 360);
  }
  // Slanted beams.
  c.fillStyle = '#3e2530';
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(160, 0); c.lineTo(0, 120);
  c.fill();
  c.beginPath();
  c.moveTo(600, 0); c.lineTo(440, 0); c.lineTo(600, 120);
  c.fill();
  // The round window and its sunset.
  c.save();
  c.beginPath();
  c.arc(300, 120, 82, 0, Math.PI * 2);
  c.clip();
  skyGradient(c, [[0, '#4a2c6b'], [0.25, '#c04e74'], [0.38, '#ff8a5c'], [0.5, '#ffd08a']], 240);
  sunDisc(c, 300, 150, 24, '#fff0c4', '#ffb35c');
  c.fillStyle = '#7b4a78';
  c.fillRect(200, 160, 200, 60);
  waterShimmer(c, 300, 160, 210, '#ffd9a0');
  ridge(c, [[210, 160], [250, 142], [280, 160]], 161, '#4b2a4f');
  c.restore();
  c.strokeStyle = '#3e2530';
  c.lineWidth = 10;
  c.beginPath();
  c.arc(300, 120, 82, 0, Math.PI * 2);
  c.stroke();
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(218, 120); c.lineTo(382, 120);
  c.moveTo(300, 38); c.lineTo(300, 202);
  c.stroke();
  // Sunbeam across the room.
  c.fillStyle = withAlpha('#ffcf8a', 0.12);
  c.beginPath();
  c.moveTo(240, 160); c.lineTo(360, 160); c.lineTo(470, 450); c.lineTo(250, 450);
  c.fill();
  // Shelves.
  c.fillStyle = '#3e2530';
  c.fillRect(20, 150, 170, 8);
  c.fillRect(20, 250, 170, 8);
  c.fillRect(410, 150, 170, 8);
  c.fillRect(410, 250, 170, 8);
  // Floor and the workbench.
  c.fillStyle = '#4a2c33';
  c.fillRect(0, 360, 600, 90);
  c.fillStyle = '#8a4f3a';
  c.fillRect(200, 330, 260, 14);
  c.fillStyle = '#6b3a2e';
  c.fillRect(214, 344, 10, 80);
  c.fillRect(436, 344, 10, 80);
  // Rug.
  c.fillStyle = '#b5525c';
  c.beginPath();
  c.ellipse(110, 420, 90, 18, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#ffd166';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(110, 420, 76, 13, 0, 0, Math.PI * 2);
  c.stroke();
}

function paintGarden(c) {
  skyGradient(c, [[0, '#1f1840'], [0.45, '#5b2d6b'], [0.8, '#d0577a'], [1, '#ff9a6b']], 220);
  c.fillStyle = '#fff4d6';
  c.beginPath();
  c.arc(470, 64, 26, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = withAlpha('#fff4d6', 0.15);
  c.beginPath();
  c.arc(470, 64, 44, 0, Math.PI * 2);
  c.fill();
  // Pagoda silhouette against the afterglow.
  c.fillStyle = '#2a1a3a';
  for (let i = 0; i < 4; i += 1) {
    const y = 210 - i * 26;
    const w = 54 - i * 9;
    c.fillRect(120 - w / 3, y - 16, (w * 2) / 3, 16);
    c.beginPath();
    c.moveTo(120 - w, y - 14);
    c.quadraticCurveTo(120, y - 32, 120 + w, y - 14);
    c.lineTo(120, y - 24);
    c.fill();
  }
  c.fillRect(118, 86, 4, 24);
  ridge(c, [[0, 214], [200, 206], [400, 216], [600, 204]], 230, '#2e2148');
  // Lawn and the pond.
  const lawn = c.createLinearGradient(0, 214, 0, 450);
  lawn.addColorStop(0, '#3f3a5e');
  lawn.addColorStop(1, '#2a2944');
  c.fillStyle = lawn;
  c.fillRect(0, 214, 600, 236);
  const pond = c.createLinearGradient(0, 270, 0, 430);
  pond.addColorStop(0, '#c4607e');
  pond.addColorStop(1, '#3a2a5e');
  c.fillStyle = '#4b4468';
  c.beginPath();
  c.ellipse(310, 350, 236, 84, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = pond;
  c.beginPath();
  c.ellipse(310, 350, 224, 74, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = withAlpha('#fff4d6', 0.35);
  c.beginPath();
  c.ellipse(470, 300, 18, 5, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = withAlpha(shade('#ff9a6b', 0.2), 0.25);
  c.fillRect(140, 290, 340, 3);
  c.fillRect(170, 318, 280, 2);
}

/** id -> { paint(ctx), props: [...] }. A fresh copy each call, so differences never leak between visits. */
export function buildScene(id) {
  const P = prop;
  switch (id) {
    case 'harbor':
      return { paint: paintHarbor, props: [
        P('cloud', 120, 84, 1.0, '#ffb38a'), P('cloud', 470, 66, 0.8, '#ff9e80'), P('cloud', 300, 132, 0.62, '#ffc2a0'),
        P('star', 40, 40, 1.4, '#fff1c1'), P('star', 250, 34, 1.2, '#fff1c1'), P('star', 560, 26, 1.3, '#fff1c1'),
        P('bird', 200, 118, 1, '#3a2233'), P('bird', 228, 104, 0.8, '#3a2233'), P('bird', 520, 140, 0.9, '#3a2233'),
        P('house', 46, 228, 0.62, '#f2d0a9', '#b5525c'), P('house', 104, 236, 0.56, '#e8b89a', '#7d5a8c'),
        P('house', 158, 246, 0.5, '#ffd9b0', '#c0574e'),
        P('lighthouse', 548, 262, 1.0, '#e85d75'),
        P('boat', 404, 300, 0.62, '#2f4a6d', '#ffd6a5'), P('boat', 262, 334, 0.92, '#7d3c5a', '#fff1dc'),
        P('boat', 478, 372, 1.12, '#b5525c', '#fff1dc'),
        P('buoy', 340, 368, 1.0, '#ff5d73'), P('buoy', 572, 410, 0.9, '#ffd166'),
        P('crate', 34, 386, 1.0, '#c98b5a'), P('crate', 62, 386, 0.85, '#b07848'), P('barrel', 92, 386, 1.0, '#8a5a3c'),
        P('lantern', 172, 350, 0.9, '#ff7b54', '#ffd166'),
        P('cat', 214, 386, 1.0, '#f4a259'),
        P('kite', 60, 160, 0.8, '#4ecdc4'),
      ] };
    case 'market':
      return { paint: paintMarket, props: [
        P('bunting', 150, 80, 1.5, '#e85d75', '#ffd166'), P('bunting', 450, 80, 1.5, '#4ecdc4', '#ff9f43'),
        P('lantern', 90, 118, 1.0, '#ff5d5d', '#ffd166'), P('lantern', 210, 136, 1.0, '#ffb347', '#ff5d73'),
        P('lantern', 300, 140, 1.05, '#ff5d5d', '#ffd166'), P('lantern', 390, 136, 1.0, '#ffb347', '#ff5d73'),
        P('lantern', 510, 118, 1.0, '#ff5d5d', '#ffd166'),
        P('bird', 70, 50, 0.9, '#2a1830'), P('bird', 560, 36, 0.8, '#2a1830'),
        P('stall', 112, 342, 1.12, '#e85d75', '#8a5a3c'), P('stall', 304, 346, 1.1, '#2f8f83', '#7a4a2a'),
        P('stall', 494, 342, 1.08, '#ffb703', '#6b4430'),
        P('basket', 82, 304, 0.9, '#ff6b6b'), P('basket', 140, 304, 0.9, '#ffd166'),
        P('basket', 280, 308, 0.9, '#90be6d'), P('teapot', 330, 308, 0.85, '#4ecdc4'),
        P('jar', 470, 304, 1.0, '#c77dff'), P('jar', 492, 304, 1.0, '#ff9f43'), P('basket', 532, 304, 0.85, '#f9844a'),
        P('sign', 214, 380, 1.0, '#7d3c5a'), P('sign', 402, 384, 0.95, '#2f4a6d'),
        P('cat', 262, 426, 1.05, '#f4a259'),
        P('crate', 30, 428, 1.0, '#b07848'), P('crate', 58, 428, 0.9, '#c98b5a'),
        P('plant', 450, 432, 1.0, '#b5525c', '#ff8fab'), P('plant', 568, 432, 1.0, '#7d5a8c', '#ffd166'),
        P('parasol', 160, 444, 1.1, '#ff7b54'),
        P('barrel', 590, 432, 0.9, '#8a5a3c'),
      ] };
    case 'teahouse':
      return { paint: paintTeahouse, props: [
        P('cloud', 90, 70, 0.8, '#ffc2a0'), P('cloud', 400, 56, 0.7, '#ffb38a'), P('cloud', 262, 34, 0.5, '#ffd0b0'),
        P('bird', 300, 80, 0.9, '#3a2233'), P('bird', 330, 96, 0.7, '#3a2233'), P('bird', 520, 110, 0.8, '#3a2233'),
        P('kite', 360, 150, 0.8, '#ff5d73'),
        P('bamboo', 20, 312, 1.0, '#5f9a5a'), P('bamboo', 50, 318, 0.82, '#6aa860'),
        P('pine', 94, 300, 0.8, '#2f5a4f'), P('pine', 590, 300, 0.8, '#2f5a4f'), P('pine', 392, 292, 0.6, '#376a5a'),
        P('tree', 150, 318, 0.95, '#c2617a', '#ff9f43'),
        P('butterfly', 128, 236, 1.0, '#ffd166'), P('butterfly', 344, 286, 0.9, '#c77dff'),
        P('lantern', 450, 244, 0.75, '#ff7b54', '#ffd166'), P('lantern', 552, 244, 0.75, '#ff7b54', '#ffd166'),
        P('fox', 204, 356, 0.95, '#e8783c'),
        P('bench', 262, 338, 1.0, '#8a4f3a'), P('teapot', 250, 322, 0.7, '#4ecdc4'), P('cup', 276, 324, 0.9, '#fff1dc'),
        P('parasol', 318, 344, 1.1, '#e85d75'),
        P('flower', 104, 344, 1.0, '#ffd166'), P('flower', 368, 352, 0.9, '#ff8fab'), P('flower', 398, 344, 0.8, '#c77dff'),
        P('mushroom', 170, 368, 1.0, '#e85d75'),
        P('stoneLantern', 60, 386, 1.0, '#9a8fa8'), P('stoneLantern', 560, 392, 0.9, '#9a8fa8'),
        P('bridge', 330, 410, 1.15, '#c0392b'),
        P('reeds', 96, 424, 1.0, '#7aa060'), P('reeds', 246, 436, 0.9, '#7aa060'), P('reeds', 588, 438, 1.0, '#7aa060'),
        P('crane', 520, 444, 0.95, '#fff4e3'),
        P('rock', 140, 432, 1.0, '#6a5a7a'), P('rock', 450, 440, 0.9, '#7a6a8a'),
        P('koi', 196, 442, 1.0, '#ff8c42', '#fff4e3'), P('koi', 404, 428, 0.9, '#fff4e3', '#ff5d5d'),
      ] };
    case 'attic':
      return { paint: paintAttic, props: [
        P('lantern', 120, 60, 1.0, '#ffb347', '#ff5d73'), P('lantern', 480, 60, 1.0, '#ffb347', '#ff5d73'),
        P('clock', 50, 150, 0.95, '#c9a25c'), P('books', 100, 150, 1.0, '#7d3c5a', '#2f8f83'),
        P('jar', 140, 150, 1.0, '#ff9f43'), P('hourglass', 168, 150, 1.0, '#ffd166'),
        P('gear', 440, 150, 1.0, '#c9a25c'), P('clock', 490, 150, 1.1, '#b5525c'), P('globe', 550, 150, 1.0, '#4e8fd0', '#7fc97f'),
        P('books', 50, 250, 1.0, '#2f4a6d', '#ffb703'), P('candle', 92, 250, 1.0, '#fff1dc'),
        P('frame', 140, 250, 1.0, '#c9a25c'), P('plant', 176, 250, 0.9, '#b5525c', '#ff8fab'),
        P('jar', 430, 250, 1.0, '#90be6d'), P('clock', 470, 250, 0.9, '#2f8f83'), P('gear', 512, 250, 0.9, '#9a8fa8'),
        P('teapot', 552, 250, 0.9, '#e85d75'),
        P('clock', 260, 330, 1.2, '#7d3c5a'), P('gear', 310, 330, 0.85, '#c9a25c'), P('cup', 344, 330, 1.0, '#4ecdc4'),
        P('candle', 372, 330, 1.0, '#ff8fab'), P('hourglass', 414, 330, 1.0, '#ff9f43'),
        P('frame', 560, 90, 1.0, '#7d3c5a'), P('frame', 40, 90, 0.9, '#2f8f83'),
        P('cat', 100, 416, 1.2, '#3d3040'), P('books', 520, 440, 1.1, '#e85d75', '#4ecdc4'),
        P('plant', 580, 440, 1.0, '#c9a25c', '#ffd166'),
      ] };
    case 'garden':
    default:
      return { paint: paintGarden, props: [
        P('star', 40, 30, 1.1, '#fff1c1'), P('star', 210, 50, 0.9, '#fff1c1'), P('star', 300, 24, 1.2, '#fff1c1'),
        P('star', 380, 70, 0.8, '#fff1c1'), P('star', 560, 36, 1.0, '#fff1c1'),
        P('cloud', 330, 150, 0.6, '#b8607e'),
        P('tree', 40, 262, 1.1, '#f6a6c1', '#fff4f8'), P('tree', 556, 254, 1.0, '#f6a6c1', '#fff4f8'),
        P('stoneLantern', 210, 280, 0.8, '#9a8fa8'), P('stoneLantern', 430, 282, 0.8, '#9a8fa8'),
        P('lily', 180, 342, 1.0, '#ff8fab'), P('lily', 260, 312, 0.8, '#fff4e3'), P('lily', 400, 330, 0.9, '#ff8fab'),
        P('lily', 450, 384, 1.0, '#fff4e3'), P('lily', 230, 396, 0.9, '#ff8fab'),
        P('koi', 320, 350, 1.0, '#ff8c42', '#fff4e3'), P('koi', 360, 396, 0.9, '#fff4e3', '#ff5d5d'),
        P('koi', 140, 372, 0.85, '#ffd166', '#ff5d5d'),
        P('frog', 186, 334, 0.9, '#7bc96f'), P('frog', 452, 376, 0.9, '#7bc96f'),
        P('rock', 90, 330, 1.0, '#6a5a7a'), P('rock', 530, 348, 1.1, '#7a6a8a'), P('rock', 300, 280, 0.8, '#6a5a7a'),
        P('mushroom', 40, 420, 1.0, '#e85d75'), P('mushroom', 60, 428, 0.8, '#ff9f43'),
        P('flower', 110, 440, 1.0, '#ff8fab'), P('flower', 520, 440, 1.0, '#ffd166'), P('flower', 560, 432, 0.9, '#c77dff'),
        P('firefly', 90, 236, 1.0, '#e8ff8a'), P('firefly', 520, 214, 1.0, '#e8ff8a'), P('firefly', 300, 250, 1.0, '#e8ff8a'),
        P('firefly', 400, 440, 1.0, '#e8ff8a'),
      ] };
  }
}
