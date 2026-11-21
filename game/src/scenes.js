// Spot the Difference — Harbor Lights: the three original picture scenes.
// Every scene is drawn with plain Canvas 2D shapes — no images, no assets.
// draw(ctx, W, H, changed) paints the scene; `changed` is a Set of difference
// ids that are applied to the right-hand panel only. The left panel is drawn
// with an empty set, so the two pictures differ exactly at the listed spots.
const W = 560;
const H = 400;

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y - 6 * s, 20 * s, 0, Math.PI * 2);
  ctx.arc(x + 38 * s, y, 15 * s, 0, Math.PI * 2);
  ctx.fill();
}

function bird(ctx, x, y, s, stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 9 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 9 * s, x + 12 * s, y);
  ctx.stroke();
}

function fourStar(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function flower(ctx, x, y, petal, center) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7, petal);
  }
  circle(ctx, x, y, 6, center);
}

// ---------------------------------------------------------------------------
// Level 1 — Harbor at Dusk. 7 differences, 150 seconds.
// ---------------------------------------------------------------------------
function drawHarbor(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#2b3a67');
  sky.addColorStop(0.55, '#c96f4a');
  sky.addColorStop(1, '#f2a65a');
  rect(ctx, 0, 0, W, 260, sky);
  // Sun (difference: missing on the changed panel).
  if (!changed.has('sun')) {
    circle(ctx, 470, 62, 26, '#ffd76a');
    circle(ctx, 470, 62, 34, 'rgba(255,215,106,0.25)');
  }
  // Stars fading in at dusk.
  fourStar(ctx, 60, 40, 6, '#fff6d8');
  fourStar(ctx, 200, 30, 5, '#fff6d8');
  fourStar(ctx, 350, 48, 5, '#fff6d8');
  fourStar(ctx, 520, 28, 4, '#fff6d8');
  // Clouds (difference: an extra cloud on the changed panel).
  cloud(ctx, 90, 90, 1, 'rgba(255,220,200,0.85)');
  cloud(ctx, 380, 120, 0.8, 'rgba(255,220,200,0.7)');
  if (changed.has('cloud')) cloud(ctx, 150, 58, 0.9, 'rgba(255,220,200,0.85)');
  // Birds (difference: the middle bird is gone on the changed panel).
  bird(ctx, 260, 78, 1, '#2b2b3a');
  if (!changed.has('bird')) bird(ctx, 300, 88, 0.9, '#2b2b3a');
  bird(ctx, 340, 70, 1, '#2b2b3a');
  // Sea.
  const sea = ctx.createLinearGradient(0, 260, 0, H);
  sea.addColorStop(0, '#3d6f8e');
  sea.addColorStop(1, '#22465e');
  rect(ctx, 0, 260, W, 140, sea);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[40, 290, 60], [180, 310, 80], [330, 295, 70], [450, 320, 60], [90, 350, 90], [280, 360, 80]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + wl, wy);
    ctx.stroke();
  }
  // Lighthouse on the rocks (difference: middle red stripe missing).
  poly(ctx, [[30, 260], [120, 260], [108, 150], [44, 150]], '#f4ead2');
  rect(ctx, 44, 150, 64, 12, '#2b2b3a');
  if (!changed.has('stripe')) rect(ctx, 48, 196, 56, 18, '#d94f3d');
  rect(ctx, 40, 138, 72, 14, '#2b2b3a');
  circle(ctx, 76, 128, 12, '#ffd76a');
  ctx.strokeStyle = 'rgba(255,215,106,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(76, 128); ctx.lineTo(30, 110); ctx.moveTo(76, 128); ctx.lineTo(122, 110); ctx.stroke();
  poly(ctx, [[18, 262], [132, 262], [150, 300], [0, 300]], '#5a5a66');
  // Sailboat (difference: its sail is teal instead of red).
  poly(ctx, [[300, 300], [360, 300], [330, 300]], '#5a4632');
  rect(ctx, 328, 240, 4, 62, '#5a4632');
  poly(ctx, [[332, 244], [332, 296], [372, 296]], changed.has('sail') ? '#2fa8a0' : '#d94f3d');
  poly(ctx, [[326, 252], [326, 296], [298, 296]], '#f4ead2');
  ellipse(ctx, 330, 302, 42, 9, '#7a4d2a');
  // Little rowboat.
  ellipse(ctx, 480, 345, 30, 8, '#8a5a2a');
  rect(ctx, 472, 330, 4, 14, '#5a4632');
  // Buoy (difference: green instead of orange).
  circle(ctx, 440, 330, 10, changed.has('buoy') ? '#37c978' : '#ff7a2f');
  rect(ctx, 436, 314, 8, 8, '#2b2b3a');
  // Jumping fish (difference: only on the changed panel).
  if (changed.has('fish')) {
    ctx.strokeStyle = '#bfe3ef';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(220, 348, 12, Math.PI, 0);
    ctx.stroke();
    ellipse(ctx, 220, 336, 12, 6, '#7fb8cc');
    poly(ctx, [[230, 334], [240, 330], [238, 340]], '#7fb8cc');
  }
}

const HARBOR_DIFFS = [
  { id: 'sun', x: 470, y: 62, r: 30, label: 'the setting sun' },
  { id: 'cloud', x: 150, y: 58, r: 30, label: 'an extra cloud' },
  { id: 'sail', x: 350, y: 272, r: 26, label: 'the sailboat sail colour' },
  { id: 'stripe', x: 76, y: 205, r: 22, label: 'the lighthouse stripe' },
  { id: 'bird', x: 300, y: 88, r: 20, label: 'a bird in the sky' },
  { id: 'buoy', x: 440, y: 330, r: 18, label: 'the buoy colour' },
  { id: 'fish', x: 220, y: 340, r: 20, label: 'a jumping fish' },
];

// ---------------------------------------------------------------------------
// Level 2 — Cat Café Garden. 8 differences, 120 seconds.
// ---------------------------------------------------------------------------
function drawGarden(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#7ec8e3');
  sky.addColorStop(1, '#dff3e3');
  rect(ctx, 0, 0, W, 250, sky);
  // Sun with a smile (difference: the smile is gone).
  circle(ctx, 80, 70, 30, '#ffd94d');
  circle(ctx, 70, 62, 4, '#7a5a00');
  circle(ctx, 90, 62, 4, '#7a5a00');
  if (!changed.has('sunface')) {
    ctx.strokeStyle = '#7a5a00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(80, 72, 12, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  // Tree and a bird on its branch (difference: the bird is gone).
  rect(ctx, 470, 90, 16, 160, '#7a5230');
  circle(ctx, 478, 80, 52, '#58a05c');
  circle(ctx, 440, 105, 34, '#6fb56e');
  circle(ctx, 516, 105, 34, '#6fb56e');
  if (!changed.has('bird')) {
    ellipse(ctx, 492, 62, 12, 8, '#3d6fd9');
    poly(ctx, [[502, 60], [510, 56], [508, 64]], '#e8a13c');
  }
  // Butterfly (difference: an extra butterfly on the changed panel).
  if (changed.has('butterfly')) {
    ctx.fillStyle = '#b678e8';
    ellipse(ctx, 444, 118, 10, 6, '#b678e8');
    ellipse(ctx, 458, 118, 10, 6, '#b678e8');
    ellipse(ctx, 444, 128, 8, 5, '#8a4fd0');
    ellipse(ctx, 458, 128, 8, 5, '#8a4fd0');
  }
  // Fence (difference: one post is missing).
  rect(ctx, 0, 238, W, 8, '#c9a06a');
  rect(ctx, 0, 258, W, 8, '#c9a06a');
  for (const fx of [30, 110, 190, 270, 350, 430, 510]) {
    if (changed.has('fence') && fx === 190) continue;
    rect(ctx, fx, 222, 12, 56, '#a8824f');
  }
  // Grass.
  rect(ctx, 0, 276, W, 124, '#7cc46a');
  rect(ctx, 0, 276, W, 10, '#93d67f');
  // Flower bed (difference: one flower is yellow instead of purple).
  for (const [fx, fy] of [[60, 330], [120, 345], [180, 328], [420, 335], [500, 330]]) {
    flower(ctx, fx, fy, '#e86a92', '#ffd94d');
  }
  flower(ctx, 120, 345, changed.has('flower') ? '#ffd94d' : '#9b6ad9', '#ff9d3c');
  // Table with a teapot (difference: no steam rising).
  rect(ctx, 380, 250, 110, 10, '#8a5a2a');
  rect(ctx, 388, 260, 10, 60, '#8a5a2a');
  rect(ctx, 472, 260, 10, 60, '#8a5a2a');
  ellipse(ctx, 435, 238, 30, 18, '#4d8fd1');
  rect(ctx, 428, 214, 14, 12, '#4d8fd1');
  poly(ctx, [[464, 228], [486, 238], [464, 246]], '#4d8fd1');
  if (!changed.has('steam')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(428, 206);
    ctx.quadraticCurveTo(420, 192, 428, 180);
    ctx.moveTo(444, 206);
    ctx.quadraticCurveTo(452, 192, 444, 178);
    ctx.stroke();
  }
  // Watering can with drips (difference: no water dripping).
  rect(ctx, 60, 300, 46, 26, '#5a8a9e');
  poly(ctx, [[106, 306], [128, 314], [106, 320]], '#5a8a9e');
  if (!changed.has('can')) {
    ctx.strokeStyle = '#7ec8e3';
    ctx.lineWidth = 3;
    for (const dx of [130, 138, 146]) {
      ctx.beginPath(); ctx.moveTo(dx, 322); ctx.lineTo(dx, 336); ctx.stroke();
      circle(ctx, dx, 342, 3, '#7ec8e3');
    }
  }
  // The café cat (difference: its red bow is missing).
  ellipse(ctx, 300, 330, 52, 34, '#f2a03c');
  circle(ctx, 300, 282, 28, '#f2a03c');
  poly(ctx, [[278, 264], [272, 232], [292, 254]], '#f2a03c');
  poly(ctx, [[322, 264], [328, 232], [308, 254]], '#f2a03c');
  poly(ctx, [[280, 260], [276, 238], [290, 254]], '#e88ca0');
  poly(ctx, [[320, 260], [324, 238], [310, 254]], '#e88ca0');
  circle(ctx, 290, 278, 3.5, '#2b2b3a');
  circle(ctx, 310, 278, 3.5, '#2b2b3a');
  poly(ctx, [[296, 288], [304, 288], [300, 294]], '#d96a6a');
  ctx.strokeStyle = '#2b2b3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(268, 292); ctx.lineTo(244, 288);
  ctx.moveTo(268, 298); ctx.lineTo(246, 302);
  ctx.moveTo(332, 292); ctx.lineTo(356, 288);
  ctx.moveTo(332, 298); ctx.lineTo(354, 302);
  ctx.stroke();
  if (!changed.has('bow')) {
    poly(ctx, [[300, 312], [284, 302], [284, 322]], '#d94f3d');
    poly(ctx, [[300, 312], [316, 302], [316, 322]], '#d94f3d');
    circle(ctx, 300, 312, 5, '#b03a2a');
  }
}

const GARDEN_DIFFS = [
  { id: 'bow', x: 300, y: 312, r: 20, label: "the cat's bow" },
  { id: 'flower', x: 120, y: 345, r: 18, label: 'a flower colour' },
  { id: 'butterfly', x: 450, y: 122, r: 20, label: 'an extra butterfly' },
  { id: 'steam', x: 436, y: 192, r: 22, label: 'the teapot steam' },
  { id: 'sunface', x: 80, y: 72, r: 24, label: "the sun's smile" },
  { id: 'fence', x: 196, y: 250, r: 18, label: 'a fence post' },
  { id: 'bird', x: 492, y: 62, r: 20, label: 'a bird on the branch' },
  { id: 'can', x: 138, y: 330, r: 20, label: 'the watering-can drips' },
];

// ---------------------------------------------------------------------------
// Level 3 — Lantern Night Market. 9 differences, 100 seconds.
// ---------------------------------------------------------------------------
function drawMarket(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#0d1530');
  sky.addColorStop(1, '#2c3a6e');
  rect(ctx, 0, 0, W, 300, sky);
  // Moon (difference: no crater).
  circle(ctx, 480, 60, 26, '#fdf6d8');
  if (!changed.has('moon')) {
    circle(ctx, 472, 54, 5, '#d8cfae');
    circle(ctx, 488, 68, 4, '#d8cfae');
    circle(ctx, 490, 50, 3, '#d8cfae');
  }
  // Stars (difference: one extra star).
  fourStar(ctx, 60, 40, 5, '#fff6d8');
  fourStar(ctx, 150, 70, 4, '#fff6d8');
  fourStar(ctx, 330, 36, 5, '#fff6d8');
  fourStar(ctx, 410, 90, 4, '#fff6d8');
  if (changed.has('star')) fourStar(ctx, 250, 50, 5, '#fff6d8');
  // String lights (difference: one bulb is dark).
  ctx.strokeStyle = '#3a2c1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.quadraticCurveTo(280, 140, 560, 96);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const bx = t * 560;
    const by = 96 + Math.sin(t * Math.PI) * 34;
    const dark = changed.has('bulb') && i === 4;
    circle(ctx, bx, by + 10, 7, dark ? '#3a3a44' : ['#ffd76a', '#ff8a6b', '#7ec8e3'][i % 3]);
    if (!dark) circle(ctx, bx, by + 10, 12, 'rgba(255,215,106,0.18)');
  }
  // Rooftops and a cat (difference: the cat is gone).
  poly(ctx, [[300, 150], [470, 150], [440, 118], [330, 118]], '#1c2438');
  rect(ctx, 300, 150, 170, 10, '#141a2c');
  if (!changed.has('cat')) {
    ellipse(ctx, 385, 112, 18, 10, '#2b2b3a');
    circle(ctx, 400, 100, 8, '#2b2b3a');
    poly(ctx, [[396, 94], [394, 84], [400, 92]], '#2b2b3a');
    poly(ctx, [[404, 94], [406, 84], [402, 92]], '#2b2b3a');
  }
  // Paper lanterns (difference: one lantern is gold instead of red).
  for (const [lx, ly] of [[60, 180], [150, 165], [230, 180]]) {
    const gold = changed.has('lantern') && lx === 150;
    ellipse(ctx, lx, ly, 20, 26, gold ? '#e8b13c' : '#d94f3d');
    ctx.strokeStyle = gold ? '#b07f1e' : '#a03a2a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx - 18, ly - 8); ctx.lineTo(lx + 18, ly - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx - 18, ly + 8); ctx.lineTo(lx + 18, ly + 8); ctx.stroke();
    rect(ctx, lx - 4, ly - 32, 8, 6, '#e8b13c');
  }
  // Stall awnings and counters.
  for (const [sx, sw, col] of [[20, 150, '#d94f3d'], [200, 150, '#2fa8a0'], [380, 150, '#e8a13c']]) {
    poly(ctx, [[sx, 210], [sx + sw, 210], [sx + sw - 12, 178], [sx + 12, 178]], col);
    rect(ctx, sx + 8, 210, sw - 16, 90, '#6e4a2f');
    rect(ctx, sx, 300, sw, 12, '#8a5a2a');
  }
  // Stall sign (difference: the star on the middle sign is gone).
  circle(ctx, 275, 240, 16, '#fdf6d8');
  if (!changed.has('sign')) fourStar(ctx, 275, 240, 8, '#d94f3d');
  circle(ctx, 95, 240, 16, '#fdf6d8');
  fourStar(ctx, 95, 240, 8, '#2fa8a0');
  circle(ctx, 455, 240, 16, '#fdf6d8');
  fourStar(ctx, 455, 240, 8, '#e8a13c');
  // Dumpling steamer with steam (difference: no steam).
  ellipse(ctx, 120, 292, 34, 12, '#b8c4cc');
  rect(ctx, 92, 272, 56, 20, '#9fb0ba');
  if (!changed.has('steam')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(110, 266); ctx.quadraticCurveTo(104, 252, 110, 240);
    ctx.moveTo(130, 266); ctx.quadraticCurveTo(136, 252, 130, 240);
    ctx.stroke();
  }
  // Fish kite (difference: its tail is missing).
  ellipse(ctx, 470, 210, 26, 14, '#7ec8e3');
  poly(ctx, [[444, 210], [430, 200], [432, 220]], '#7ec8e3');
  circle(ctx, 490, 206, 3, '#0d1530');
  if (!changed.has('kite')) {
    ctx.strokeStyle = '#ff8a6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(446, 214);
    ctx.quadraticCurveTo(430, 232, 418, 226);
    ctx.quadraticCurveTo(408, 240, 398, 232);
    ctx.stroke();
  }
  // Window (difference: the window is dark).
  rect(ctx, 40, 160, 44, 34, '#141a2c');
  if (!changed.has('window')) {
    rect(ctx, 46, 166, 32, 22, '#ffd76a');
    rect(ctx, 60, 166, 3, 22, '#141a2c');
  }
  // Ground and crowd silhouettes.
  rect(ctx, 0, 312, W, 88, '#241a12');
  for (const [px, col] of [[180, '#3d5a76'], [250, '#5a3a6e'], [330, '#2f6e4f']]) {
    circle(ctx, px, 340, 12, col);
    ellipse(ctx, px, 372, 18, 24, col);
  }
}

const MARKET_DIFFS = [
  { id: 'lantern', x: 150, y: 165, r: 22, label: 'a lantern colour' },
  { id: 'moon', x: 480, y: 60, r: 26, label: 'a moon crater' },
  { id: 'star', x: 250, y: 50, r: 16, label: 'an extra star' },
  { id: 'sign', x: 275, y: 240, r: 18, label: 'the sign star' },
  { id: 'cat', x: 385, y: 105, r: 22, label: 'the cat on the roof' },
  { id: 'bulb', x: 280, y: 116, r: 16, label: 'a dark string bulb' },
  { id: 'steam', x: 120, y: 252, r: 22, label: 'the steamer steam' },
  { id: 'kite', x: 415, y: 228, r: 22, label: 'the fish kite tail' },
  { id: 'window', x: 62, y: 177, r: 20, label: 'a lit window' },
];

// ---------------------------------------------------------------------------
// Level table.
// ---------------------------------------------------------------------------
export const LEVELS = [
  { name: 'Harbor at Dusk', timeLimit: 150, hints: 3, draw: drawHarbor, differences: HARBOR_DIFFS },
  { name: 'Cat Café Garden', timeLimit: 120, hints: 3, draw: drawGarden, differences: GARDEN_DIFFS },
  { name: 'Lantern Night Market', timeLimit: 100, hints: 3, draw: drawMarket, differences: MARKET_DIFFS },
];

export { W as PANEL_W, H as PANEL_H };
