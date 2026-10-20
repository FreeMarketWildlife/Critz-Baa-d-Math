// Libriam Globe palette: its sub-moon Moon; massive ringed parent Kronos;
// complementary blue Zuhal and orange dwarf sun. Dream distances are illustrative.
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
const seed = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
function oval(ctx, x, y, rx, ry, color, angle = 0) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2); ctx.fill();
}
function halo(ctx, x, y, radius, color) {
  const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, color); light.addColorStop(1, '#b9dbe900');
  ctx.fillStyle = light; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}
function planet(ctx, x, y, r, color, rings = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.30);
  if (rings) {
    ctx.save(); ctx.globalAlpha *= .6;
    for (let i = 0; i < 24; i++) {
      ctx.strokeStyle = i % 4 ? color : '#72828f'; ctx.lineWidth = r * .012;
      ctx.beginPath(); ctx.ellipse(0, 0, r * (1.35 + i * .025), r * (.31 + i * .006), 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  const light = ctx.createRadialGradient(r * .2, -r * .5, 0, -r * .3, r * .4, r * 1.5);
  light.addColorStop(0, color); light.addColorStop(.6, '#737079'); light.addColorStop(1, '#101c30');
  oval(ctx, 0, 0, r, r, light);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  for (let i = -12; i <= 12; i++) oval(ctx, r * .12, i * r * .087, r * 1.05, r * (.015 + seed(i) * .017), i % 3 ? '#f0dbad12' : '#3c466425');
  ctx.restore();
  if (rings) {
    for (let i = 0; i < 24; i++) {
      ctx.strokeStyle = i % 5 ? color : '#72828f'; ctx.lineWidth = r * .008;
      ctx.beginPath(); ctx.ellipse(0, 0, r * (1.35 + i * .025), r * (.31 + i * .006), 0, 0, Math.PI); ctx.stroke();
    }
  }
  ctx.restore();
}
function fullMoon(ctx, x, y, r) {
  halo(ctx, x, y, r * 4.8, '#b8d6e51b');
  halo(ctx, x, y, r * 1.6, '#d7e4ef28');
  const pearl = ctx.createRadialGradient(x - r * .25, y - r * .3, 0, x, y, r * 1.1);
  pearl.addColorStop(0, '#f0efdb'); pearl.addColorStop(.72, '#d6ded6'); pearl.addColorStop(1, '#a6bdc8');
  oval(ctx, x, y, r, r, pearl);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * .98, 0, Math.PI * 2); ctx.clip();
  for (let i = 0; i < 55; i++) {
    const a = seed(i + 11) * Math.PI * 2, d = Math.sqrt(seed(i + 67)) * r * .94, cr = r * (.018 + seed(i + 99) * .13);
    oval(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, cr, cr * .8, i % 3 ? '#6e8d9c16' : '#7897a125', a);
  }
  ctx.restore();
}
export function drawDreamSky(ctx, w, h, height, time, stars) {
  const space = smooth((height - .6) / 2.8);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, mix([9, 18, 37], [3, 7, 18], space));
  bg.addColorStop(.6, mix([29, 49, 70], [10, 18, 34], space));
  bg.addColorStop(1, mix([54, 77, 80], [18, 31, 46], space));
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  for (const s of stars) {
    ctx.globalAlpha = .18 + (.5 + .5 * Math.sin(time * .18 + s.phase)) * .4;
    oval(ctx, s.x * w, ((s.y + height * .003) % 1) * h, s.r * .8, s.r * .8, '#c8d8df');
  }
  ctx.globalAlpha = 1;
  // Skybox bodies barely move with altitude: Kronos is enormous and far away.
  const skyShift = Math.log1p(height) * h * .012;
  ctx.save(); ctx.globalAlpha = .14 + space * .48;
  planet(ctx, w * .04, -h * .08 + skyShift, Math.max(w * .29, h * .32), '#d9b889', true);
  ctx.globalAlpha = .12 + space * .35;
  planet(ctx, w * .97, h * .16 + skyShift * .7, Math.min(w * .14, h * .15), '#799ce6', true);
  ctx.restore();
  // A fully illuminated Moon, Libriam's own sub-satellite, behind the dreamer.
  const mx = w * .57, my = h * .36 + skyShift * .35, mr = Math.min(w * .125, h * .115);
  fullMoon(ctx, mx, my, mr);
  // Broad, restrained moonlight across the clearing, not a theatrical spotlight.
  ctx.save(); ctx.globalAlpha = 1 - space * .8;
  ctx.save(); ctx.translate(mx, h * .73); ctx.scale(.8, 1.8);
  halo(ctx, 0, 0, Math.min(w * .65, h * .42), '#c3e3f00a');
  ctx.restore();
  ctx.restore();
  if (space > 0) {
    ctx.save(); ctx.globalAlpha = space * .65;
    halo(ctx, w * .82, h * .045, Math.min(w, h) * .10, '#ffba722b');
    oval(ctx, w * .82, h * .045, Math.min(w, h) * .012, Math.min(w, h) * .012, '#ffce98'); ctx.restore();
  }
  if (height > 1.3) {
    const r = Math.max(h * .16, h * 2.8 / (1 + height * .48));
    const cy = h * .98 + r - Math.min(h * .32, (height - 1.3) * h * .10);
    ctx.save(); ctx.globalAlpha = smooth((height - 1.3) / 1.5) * .75;
    ctx.shadowBlur = 15; ctx.shadowColor = '#83c7ce';
    oval(ctx, w * .5, cy, r * 1.006, r * 1.006, '#83c7ce60'); ctx.shadowBlur = 0;
    const world = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    world.addColorStop(0, '#397281'); world.addColorStop(.3, '#163f57'); world.addColorStop(1, '#050d1b');
    oval(ctx, w * .5, cy, r, r, world); ctx.restore();
  }
}

const flowerColors = ['#c2cfe0', '#a99bd7', '#d898bc', '#dfb96d', '#8db7db', '#e1a28d'];
function flower(ctx, x, y, size, species, color, lean = 0) {
  const top = y - size * (species === 1 ? 6 : 3.6);
  ctx.strokeStyle = '#527b6a'; ctx.lineWidth = Math.max(.5, size * .22);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - size, top + size * 2, x + lean, top); ctx.stroke();
  oval(ctx, x - size * .7, y - size * 1.3, size * 1.2, size * .36, '#62846a', -.5);
  if (species === 1) { // Lupines: rising tiers of lavender bells.
    for (let j = 0; j < 5; j++) {
      const s = size * (1 - j * .12), yy = top + size * 2.5 - j * size * .7;
      oval(ctx, x + lean - s * .5, yy, s * .75, s * .52, color, -.3);
      oval(ctx, x + lean + s * .5, yy, s * .75, s * .52, color, .3);
    }
  } else if (species === 4) { // Nodding bluebells.
    for (let j = 0; j < 3; j++) oval(ctx, x + lean + (j % 2 ? -1 : 1) * size, top + j * size * .9, size * .75, size, color, .3);
  } else {
    const petals = species === 0 ? 8 : species === 2 ? 5 : species === 3 ? 4 : 6;
    for (let j = 0; j < petals; j++) {
      const a = j / petals * Math.PI * 2;
      oval(ctx, x + lean + Math.cos(a) * size * .85, top + Math.sin(a) * size * .85, size * .86, size * .47, color, a);
    }
    oval(ctx, x + lean, top, size * .42, size * .42, species === 3 ? '#836b44' : '#dac788');
  }
}
const fields = [
  { horizon: .72, depth: .16, color: '#233d48', light: '#385660', count: 160, size: .55 },
  { horizon: .79, depth: .34, color: '#1b3b3d', light: '#345c58', count: 260, size: .8 },
  { horizon: .87, depth: .66, color: '#15332f', light: '#315749', count: 260, size: 1.3 },
  { horizon: .95, depth: 1, color: '#102b28', light: '#244e3e', count: 180, size: 2.8 },
];
let fieldCache;
function hillY(x, w, h, layer) {
  return h * fields[layer].horizon + Math.sin(x / w * 5 + layer * 2.2) * h * .035 + Math.cos(x / w * 8 + layer) * h * .018;
}
function buildFields(w, h) {
  const layers = fields.map((field, layer) => {
    const canvas = document.createElement('canvas'); canvas.width = w + 160; canvas.height = h + 70;
    const c = canvas.getContext('2d'); c.translate(80, 0);
    const earth = c.createLinearGradient(0, h * field.horizon - h * .05, 0, h * 1.08);
    earth.addColorStop(0, field.light); earth.addColorStop(.4, field.color); earth.addColorStop(1, '#102824');
    c.fillStyle = earth; c.beginPath(); c.moveTo(-80, h + 70);
    for (let x = -80; x <= w + 80; x += 5) c.lineTo(x, hillY(x, w, h, layer));
    c.lineTo(w + 80, h + 70); c.closePath(); c.fill();
    const count = Math.round(field.count * Math.max(.65, Math.min(1.7, w / 850)));
    for (let i = 0; i < count; i++) {
      const key = i + layer * 1100, x = seed(key) * (w + 160) - 80;
      const depth = seed(key + 291), base = hillY(x, w, h, layer);
      const y = base + 4 + depth * Math.max(8, h * .07);
      const scale = field.size * (.6 + depth * .8) * Math.min(1.25, Math.max(.8, w / 850));
      c.globalAlpha = .5 + depth * .35;
      const species = Math.floor(seed(key + 890) * 6);
      flower(c, x, y, scale, species, flowerColors[species], (seed(key + 76) - .5) * scale);
      if (i % 2 === 0) {
        c.strokeStyle = '#73957836'; c.lineWidth = .7; c.beginPath(); c.moveTo(x + 5, y + 3); c.quadraticCurveTo(x + 2, y - scale * 3, x + 7, y - scale * 5); c.stroke();
      }
    }
    c.globalAlpha = 1;
    return canvas;
  });
  return { w, h, layers };
}
export function drawGrass(ctx, w, h, camera, impact = 0, restingX = .5, time = 0, reduced = false) {
  if (!fieldCache || fieldCache.w !== w || fieldCache.h !== h) fieldCache = buildFields(w, h);
  for (const [layer, field] of fields.entries()) {
    const vertical = camera * h * field.depth;
    if (h * field.horizon + vertical > h + 70) continue;
    // Nearby flowers travel faster than the far hills. Small wind adds quiet life.
    const wind = reduced ? 0 : Math.sin(time * .17 + layer) * (1 + layer * .8);
    const horizontal = -Math.sin(camera * .5) * 34 * field.depth + wind;
    ctx.drawImage(fieldCache.layers[layer], -80 + horizontal, vertical);
  }
  const ground = h * .89 + camera * h;
  if (ground < h * 1.2) {
    oval(ctx, w * restingX, ground + 3, Math.min(w * .18, 160), 10, '#132e27');
    halo(ctx, w * .57, ground - h * .07, Math.min(w, h) * .43, '#c9e6db0d');
    if (impact > 0) {
      ctx.save(); ctx.globalAlpha = impact * .35;
      for (let i = 0; i < 12; i++) {
        const x = w * restingX + Math.sin(i * 7) * (1 - impact) * 130;
        oval(ctx, x, ground - Math.sin((1 - impact) * Math.PI) * (18 + i * 2), 2, 1, flowerColors[i % 6], i);
      }
      ctx.restore();
    }
  }
  // Just a handful of fireflies, softly breathing over the flower fields.
  const visibility = 1 - smooth(camera / 1.2);
  if (visibility > 0) {
    ctx.save();
    for (let i = 0; i < 9; i++) {
      const t = reduced ? 0 : time;
      const x = (seed(i + 23) * .9 + .05) * w + Math.sin(t * .23 + i * 2) * 13;
      const y = h * (.73 + seed(i + 18) * .23) + camera * h * .5 + Math.cos(t * .19 + i) * 9;
      ctx.globalAlpha = visibility * (.18 + .42 * (.5 + .5 * Math.sin(t * .7 + i * 3)));
      halo(ctx, x, y, 12, '#dae99455'); oval(ctx, x, y, 1.1, 1.1, '#f1edb3');
    }
    ctx.restore();
  }
}
