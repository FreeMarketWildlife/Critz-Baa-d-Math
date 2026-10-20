// Visual palette and bodies from Critz-Dragex's Libriam Globe / Kronos system.
// This dream ascent compresses celestial distances for the game, not a scale map.
const clamp = n => Math.max(0, Math.min(1, n));
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
function oval(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function planet(ctx, x, y, r, color, rings = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.24);
  if (rings) {
    ctx.strokeStyle = color; ctx.lineWidth = r * .22; ctx.globalAlpha = .45;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.85, r * .48, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const light = ctx.createRadialGradient(-r * .4, -r * .4, 0, r * .2, r * .2, r * 1.3);
  light.addColorStop(0, color); light.addColorStop(1, '#070c18');
  oval(ctx, 0, 0, r, r, light);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  for (let i = -3; i <= 3; i++) oval(ctx, 0, i * r * .25, r, r * .055, '#fff0d016');
  ctx.restore();
  if (rings) {
    ctx.strokeStyle = color; ctx.lineWidth = r * .13;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.85, r * .48, 0, 0, Math.PI); ctx.stroke();
  }
  ctx.restore();
}
export function drawDreamSky(ctx, w, h, height, time, stars) {
  const space = clamp((height - .65) / 1.8);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, mix([8, 15, 32], [3, 5, 14], space));
  bg.addColorStop(.65, mix([21, 40, 60], [7, 12, 25], space));
  bg.addColorStop(1, mix([36, 62, 67], [13, 21, 36], space));
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  for (const s of stars) {
    ctx.globalAlpha = (.25 + (.5 + .5 * Math.sin(time * .5 + s.phase)) * .5) * (.7 + space * .3);
    const y = ((s.y + height * .045) % 1) * h;
    oval(ctx, s.x * w, y, s.r, s.r, '#adc6db');
  }
  ctx.globalAlpha = 1;
  // Moon is small and remote. Kronos is the gold ringed parent of Libriam;
  // Zuhal is its complementary blue companion. The sun is an orange dwarf.
  const sceneHeight = Math.log1p(height);
  const moonY = h * (.24 + sceneHeight * .19);
  planet(ctx, w * .77, moonY, Math.min(w * .025, h * .026, 23), '#b9b9ba');
  if (height > .5) {
    ctx.globalAlpha = clamp((height - .5) / 1.2);
    planet(ctx, w * .23, h * (.08 + Math.sin(sceneHeight * .55) * .15), Math.min(w * .11, h * .1), '#e6b875', true);
    planet(ctx, w * .85, h * (.12 + Math.sin(sceneHeight * .34 + 1) * .1), Math.min(w * .038, h * .037), '#799ce6', true);
    const sx = w * .58, sy = h * .12, sr = Math.min(w, h) * .014;
    const glow = ctx.createRadialGradient(sx, sy, sr, sx, sy, sr * 8);
    glow.addColorStop(0, '#ffba7260'); glow.addColorStop(1, '#ffba7200');
    ctx.fillStyle = glow; ctx.fillRect(sx - sr * 8, sy - sr * 8, sr * 16, sr * 16);
    oval(ctx, sx, sy, sr, sr, '#ffba72');
    ctx.globalAlpha = 1;
  }
  // The receding world has a thin atmospheric limb, as in the globe reference.
  if (height > 1) {
    const r = Math.max(h * .16, h * 2.8 / (1 + height * .48));
    const cy = h * .98 + r - Math.min(h * .32, (height - 1) * h * .12);
    ctx.save(); ctx.globalAlpha = clamp(height - 1);
    ctx.shadowBlur = 18; ctx.shadowColor = '#64c7bd';
    oval(ctx, w * .5, cy, r * 1.012, r * 1.012, '#64c7bd65');
    ctx.shadowBlur = 0;
    const world = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    world.addColorStop(0, '#397d86'); world.addColorStop(.3, '#163f57'); world.addColorStop(1, '#050d1b');
    oval(ctx, w * .5, cy, r, r, world); ctx.restore();
  }
}

export function drawGrass(ctx, w, h, camera, impact = 0, restingX = .5) {
  const ground = h * .89 + camera * h;
  if (ground > h * 1.2) return;
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = ['#162f37', '#122b2c', '#102724'][layer]; ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w + 10; x += 10) {
      const shape = (Math.sin(x / w * 8 + layer * 2) + Math.cos(x / w * 4 + layer)) * h * .018;
      ctx.lineTo(x, ground - (2 - layer) * h * .055 + shape);
    }
    ctx.lineTo(w, h); ctx.fill();
  }
  // A real grassy resting patch directly under the sleeping wolf.
  oval(ctx, w * restingX, ground + 3, w * .18, 9, '#19372d');
  ctx.strokeStyle = '#527b4b'; ctx.lineWidth = 1;
  for (let i = 0; i < 95; i++) {
    const x = w * (restingX - .18 + i / 95 * .36), y = ground + 3 + Math.sin(i * 4.7) * 3;
    ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.quadraticCurveTo(x - 3, y - 3, x + Math.sin(i) * 5, y - 6 - i % 6); ctx.stroke();
  }
  if (impact > 0) {
    ctx.strokeStyle = `rgba(191,218,188,${impact * .5})`;
    ctx.beginPath(); ctx.ellipse(w * restingX, ground + 5, (1 - impact) * w * .2 + 30, (1 - impact) * 14 + 4, 0, 0, Math.PI * 2); ctx.stroke();
  }
}
