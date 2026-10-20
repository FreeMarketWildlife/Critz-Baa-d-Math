import { slowArithmetic } from './music.js';
import { drawSheep } from './sheep.js';
import { apply, tolerance, chooseOperation, interval, catchUpGrace, starsFor, stepRage, countColor, observeAnticipation, isPerfectCrossing, calmForPerfect, perfectPercent, countingError, creditCountedSheep } from './rules.js';
import { DreamSounds } from './sound.js';
import { launchFlight, advanceFlight, flightIsGone, FIXED_STEP, previewTime, launchGap } from './physics.js';

const $ = id => document.getElementById(id);
const canvas = $('night'), ctx = canvas.getContext('2d');
const colors = { '+1': '#f2efdf', '−1': '#f58992', '×2': '#eac47b', '÷2': '#98c7f1' };
const stars = Array.from({ length: 130 }, () => ({
  x: Math.random(), y: Math.random() * .8, r: Math.random() * 1.4 + .3, phase: Math.random() * 6,
}));
let w, h, dpr;
let mode = 'campaign', status = 'menu', count = 0, target = 0, plannedTarget = 0;
let n = 0, launched = 0, elapsed = 0, rage = 0;
let perfectHits = 0, perfectChain = 0, perfectFlash = 0;
let next = .45, grace = 0, orbs = [], particles = [], rings = [], lastSide = 1;
const sounds = new DreamSounds();
let previous = performance.now(), lastOp = -10;
let accumulator = 0, visualTime = 0, countKick = 0, crossingGlow = 0, tapGlow = 0, tapSide = 1;

function resize() {
  w = innerWidth; h = innerHeight; dpr = Math.min(devicePixelRatio, 2);
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize); resize();

function screens(id) {
  for (const name of ['menu', 'play', 'result', 'paused']) $(name).hidden = name !== id;
  $('footer').hidden = id === 'play';
  $('pause').disabled = id !== 'play';
  $('danger').style.opacity = id === 'play' ? rage * .85 : 0;
}

function begin(m) {
  mode = m; status = 'playing';
  count = target = plannedTarget = n = launched = elapsed = rage = 0;
  perfectHits = perfectChain = perfectFlash = 0;
  next = .45; grace = 0; accumulator = 0; orbs = []; particles = []; rings = [];
  lastOp = -10; countKick = crossingGlow = tapGlow = 0;
  $('modeLabel').textContent = m === 'campaign' ? 'NIGHT ONE' : m === 'demo' ? 'QUICK DREAM' : 'ENDLESS';
  sounds.start();
  screens('play'); update();
}

function nextSheep() { return orbs.find(orb => !orb.crossed); }
function readyAhead() { const sheep = nextSheep(); return sheep && count === sheep.result; }
function update() {
  const duration = mode === 'demo' ? 60 : 180;
  const seconds = mode === 'endless' ? Math.floor(elapsed) : Math.ceil(Math.max(0, duration - elapsed));
  $('time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  $('count').textContent = count;
  $('count').style.color = countColor(count, readyAhead() ? count : target);
  $('count').style.transform = `scale(${1 + countKick * .08})`;
  $('sheep').textContent = n;
  $('state').textContent = rage > .7 ? 'WAKING UP' : rage > .3 ? 'RESTLESS' : 'SOUND ASLEEP';
  $('perfect').textContent = perfectFlash > .1 ? `✧ PERFECT${perfectChain > 1 ? ' ×' + perfectChain : ''}` : readyAhead() ? '✧ READY' : '';
  $('perfect').style.opacity = perfectFlash > .1 || readyAhead() ? 1 : 0;
  $('feedback').textContent = rage > .7 ? 'The dream is slipping…' : rage > .3 ? 'Find your rhythm.' : 'Keep the dream alive.';
  $('danger').style.opacity = rage * (.65 + .2 * Math.sin(visualTime * (4 + rage * 5)));
  $('progress').style.width = mode === 'endless' ? '0' : `${Math.min(100, elapsed / duration * 100)}%`;
  $('operation').style.opacity = Math.max(0, 1 - (elapsed - lastOp) / .65);
  $('operation').style.transform = `translate(-50%, ${-(elapsed - lastOp) * 12}px)`;
  $('pace').textContent = elapsed < 15 ? 'SETTLE IN' : elapsed < 30 ? 'DREAM DEEPER' : elapsed < 60 ? 'QUICKENING' : 'FEVER DREAM';
  document.documentElement.style.setProperty('--tap-left', tapSide < 0 ? tapGlow * .1 : 0);
  document.documentElement.style.setProperty('--tap-right', tapSide > 0 ? tapGlow * .1 : 0);
}

function finish(win) {
  status = 'result'; screens('result');
  const perfectRatio = n ? perfectHits / n : 0;
  const award = win ? starsFor(perfectRatio) : 0;
  $('resultTag').textContent = win ? 'THE SUN IS RISING' : 'THE WOLF WOKE UP';
  $('resultTitle').textContent = win ? 'A dream well kept.' : 'Baa’d night.';
  $('stars').textContent = win ? '★'.repeat(award) + '☆'.repeat(3 - award) : '☾';
  $('resultText').textContent = `${n} sheep · ${Math.floor(elapsed)} seconds · ${perfectPercent(perfectHits, n)}% perfect (${perfectHits}/${n} early counts). Your count: ${count}. True count: ${target}.`;
  if (win) {
    try { localStorage.setItem('baad-v3-' + mode, Math.max(award, Number(localStorage.getItem('baad-v3-' + mode) || 0))); } catch {}
  }
  sounds.finish(win);
}

function tap(delta, event) {
  if (status !== 'playing') return;
  count += delta; countKick = 1; tapGlow = 1; tapSide = delta;
  rings.push({ x: event?.clientX ?? w * (delta > 0 ? .78 : .22), y: event?.clientY ?? h * .78, age: 0 });
  observeAnticipation(nextSheep(), count);
  creditCountedSheep(orbs, count);
  sounds.tap(delta); update();
}
for (const [id, delta] of [['minus', -1], ['plus', 1]]) {
  $(id).addEventListener('pointerdown', e => { e.preventDefault(); tap(delta, e); });
  $(id).onclick = e => { if (e.detail === 0) tap(delta); };
}
for (const button of document.querySelectorAll('[data-mode]')) button.onclick = () => begin(button.dataset.mode);
function pause() {
  if (status !== 'playing') return;
  status = 'paused'; accumulator = 0; sounds.pause(); screens('paused');
}
$('pause').onclick = pause;
$('resume').onclick = () => { sounds.resume(); status = 'playing'; accumulator = 0; screens('play'); };
function home() {
  sounds.stopMusic();
  status = 'menu'; orbs = []; particles = []; rings = []; screens('menu');
  try { $('best').textContent = localStorage.getItem('baad-v3-campaign') ? `NIGHT ONE BEST  ${'★'.repeat(Number(localStorage.getItem('baad-v3-campaign')))}` : ''; } catch {}
}
$('home').onclick = home; $('quit').onclick = home; $('again').onclick = () => begin(mode);
function soundLabel() {
  $('sound').textContent = sounds.enabled ? '♫ On' : '♫ Off';
  $('sound').setAttribute('aria-pressed', String(sounds.enabled));
  $('sound').setAttribute('aria-label', sounds.enabled ? 'Mute sound' : 'Enable sound');
}
$('sound').onclick = () => { sounds.toggle(); soundLabel(); if (sounds.enabled) sounds.baa(); };
soundLabel();
addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D', 'Escape', ' '].includes(e.key)) return;
  if (e.target.tagName === 'BUTTON' && e.key === ' ') return;
  e.preventDefault();
  if (e.key === 'Escape' || e.key === ' ') {
    if (status === 'playing') pause(); else if (status === 'paused') $('resume').click();
  } else tap(['ArrowLeft', 'a', 'A'].includes(e.key) ? -1 : 1);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

function burst(x, y, color, size = 1) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2, speed = (.02 + Math.random() * .055) * size;
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - .025, life: .4 + Math.random() * .25, age: 0, color });
  }
}

function tick(dt) {
  elapsed += dt;
  // Plan against every airborne operation, not just those that already crossed.
  // Extended previews delay subsequent launches so overlapping crossings stay ordered.
  if (elapsed >= next) {
    const op = chooseOperation(elapsed, plannedTarget);
    const after = apply(plannedTarget, op), changed = after - plannedTarget;
    lastSide = Math.random() < .78 ? -lastSide : lastSide;
    const lead = previewTime(changed);
    const flight = { ...launchFlight(lastSide, Math.random, lead), op, result: after, readyBeforeCenter: false, counted: false };
    orbs.push(flight); plannedTarget = after; launched++;
    next = elapsed + launchGap(interval(launched, changed), lead);
    burst(flight.x, .98, colors[op], .65);
    sounds.launch(lastSide);
  }
  observeAnticipation(nextSheep(), count);
  creditCountedSheep(orbs, count);
  for (const orb of orbs) {
    if (advanceFlight(orb, dt) && !orb.crossed) {
      const perfect = isPerfectCrossing(orb, count);
      orb.crossed = true;
      if (count === orb.result) orb.counted = true;
      if (perfect) {
        perfectHits++; perfectChain++; perfectFlash = 1;
        rage = calmForPerfect(rage); sounds.perfect();
      } else perfectChain = 0;
      observeAnticipation(nextSheep(), count);
      const before = target; target = apply(target, orb.op); n++;
      grace = elapsed + catchUpGrace(target - before);
      lastOp = elapsed; crossingGlow = 1;
      $('operation').textContent = orb.op;
      $('operation').style.color = colors[orb.op];
      burst(orb.x, orb.y, colors[orb.op]);
      sounds.cross(orb.op, { perfect });
    }
    if (Math.floor(orb.age / .025) !== Math.floor((orb.age - dt) / .025)) {
      orb.trail.push({ x: orb.x, y: orb.y });
      if (orb.trail.length > 9) orb.trail.shift();
    }
  }
  creditCountedSheep(orbs, count);
  orbs = orbs.filter(orb => !flightIsGone(orb));
  for (const p of particles) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .12 * dt; }
  particles = particles.filter(p => p.age < p.life);
  for (const ring of rings) ring.age += dt;
  rings = rings.filter(ring => ring.age < .4);
  const error = countingError(count, target, nextSheep());
  rage = stepRage(rage, error, tolerance(n), dt, elapsed <= grace);
  if (rage > .7) sounds.warning();
  perfectFlash = Math.max(0, perfectFlash - dt);
  countKick *= Math.exp(-dt * 13); crossingGlow *= Math.exp(-dt * 7); tapGlow *= Math.exp(-dt * 10);
  if (rage >= 1) finish(false);
  else if (mode !== 'endless' && elapsed >= (mode === 'demo' ? 60 : 180)) finish(true);
}

function ellipse(x, y, rx, ry, fill, rotation = 0) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2); ctx.fill();
}
function path(points, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(...points[0]);
  for (const p of points.slice(1)) ctx.lineTo(...p);
  ctx.closePath(); ctx.fill();
}

function drawWolf(time) {
  const playing = status === 'playing' || status === 'paused';
  const x = playing ? w * .5 : w * (w < 600 ? .70 : .77);
  const y = playing ? h * .5 : h * .875;
  const scale = Math.min(w / (w < 600 ? 490 : 620), h / 650, 1.18) * (playing ? .8 : 1.12);
  const restless = status === 'result' && rage >= 1 ? 1 : playing ? rage : 0;
  const breathe = Math.sin(time * (2 + restless * 4));
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ellipse(0, 18, 115, 16, '#050d1770');
  // Curled body, lighter ruff, and a broad tail wrapped around the paws.
  ellipse(13, -15, 83, 48 + breathe * 1.7, '#3a4e62', -.08);
  ellipse(27, -24, 59, 33 + breathe, '#465d70', -.12);
  ctx.strokeStyle = '#80969b45'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(13, -16, 81, 46 + breathe * 1.7, -.08, 3.4, 5.8); ctx.stroke();
  ctx.fillStyle = '#283c50'; ctx.beginPath(); ctx.moveTo(76, -22);
  ctx.bezierCurveTo(145, 0, 105, 59, 23, 37); ctx.bezierCurveTo(-15, 27, -22, 14, -13, 8);
  ctx.bezierCurveTo(25, 26, 86, 20, 76, -22); ctx.fill();
  ctx.fillStyle = '#9aacae'; ctx.beginPath(); ctx.moveTo(-13, 8);
  ctx.bezierCurveTo(-29, 11, -34, 21, -15, 29); ctx.bezierCurveTo(5, 42, 25, 40, 33, 36);
  ctx.bezierCurveTo(16, 29, 10, 22, -13, 8); ctx.fill();
  ellipse(-39, 13, 34, 12, '#768c98'); ellipse(-62, 19, 22, 8, '#a6b7ba');
  // Angular ears make the sleeping silhouette distinctly lupine.
  ctx.save(); ctx.translate(-50, -25 - breathe * .9);
  const twitch = restless * Math.sin(time * 8) * 3;
  path([[-27, -5], [-30 - twitch, -61], [3, -29], [26, -50 + twitch], [28, -3]], '#526b7d');
  path([[-23, -41], [-20, -15], [-3, -26]], '#9e9da0');
  path([[12, -26], [23, -38], [23, -12]], '#90959b');
  ellipse(-1, -3, 40, 32, '#607b8a', -.18);
  path([[-35, -8], [-47, 5], [-41, 7], [-49, 16], [-30, 18], [-22, 30], [4, 17]], '#7f99a2');
  ellipse(-19, 16, 31, 16, '#b7c8c5', -.12);
  ellipse(-44, 15, 8, 6, '#142433', .2);
  ctx.strokeStyle = '#213746'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  if (restless > .72) {
    ellipse(-13, 0, 8, 3.5 + restless * 2, '#e8ba7e'); ellipse(-15, 0, 2, 4, '#182431');
  } else {
    ctx.beginPath(); ctx.moveTo(-21, -1); ctx.quadraticCurveTo(-13, 6, -4, -1); ctx.stroke();
  }
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-38, 23); ctx.quadraticCurveTo(-25, 27, -20, 23); ctx.stroke();
  ctx.restore();
  // Quiet drifting Zs, which disappear as the wolf wakes.
  if (restless < .65) {
    for (let i = 0; i < 3; i++) {
      const phase = ((time * .27 + i / 3) % 1);
      ctx.globalAlpha = Math.sin(phase * Math.PI) * .65 * (1 - restless);
      ctx.fillStyle = '#bfdabc'; ctx.font = `500 ${12 + phase * 8}px 'Space Grotesk',sans-serif`;
      ctx.fillText('z', -78 + phase * 30, -61 - phase * 47);
    }
  }
  ctx.restore(); ctx.globalAlpha = 1;
}

function draw(time) {
  ctx.clearRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#080f20'); bg.addColorStop(.65, '#15283c'); bg.addColorStop(1, '#243e43');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  for (const s of stars) {
    ctx.globalAlpha = .25 + (.5 + .5 * Math.sin(time * .5 + s.phase)) * .5;
    ellipse(s.x * w, s.y * h, s.r, s.r, '#dbe7d8');
  }
  ctx.globalAlpha = 1;
  const mx = w * .77, my = h * (h < 500 ? .4 : .24), mr = Math.min(w * .075, h * .08, 64);
  const halo = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 3);
  halo.addColorStop(0, '#d5e5c416'); halo.addColorStop(1, '#d5e5c400');
  ctx.fillStyle = halo; ctx.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
  ellipse(mx, my, mr, mr, '#e0e5c8');
  for (const [x, y, r] of [[-.3, .1, .16], [.25, -.3, .12], [.25, .4, .2]]) ellipse(mx + x * mr, my + y * mr, mr * r, mr * r, '#c7cfb2');
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = ['#162d39', '#112731', '#0b1c25'][layer]; ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w + 10; x += 10) ctx.lineTo(x, h * (.77 + layer * .075) + Math.sin(x / w * 8 + layer * 2) * h * .035 + Math.cos(x / w * 4 + layer) * h * .025);
    ctx.lineTo(w, h); ctx.fill();
  }
  drawWolf(time);
  if (status === 'playing' || status === 'paused') {
    // The center gate flashes on exactly the event that changes the hidden total.
    ctx.strokeStyle = `rgba(196,224,191,${.08 + crossingGlow * .5})`; ctx.lineWidth = 1 + crossingGlow * 2;
    ctx.setLineDash([3, 7]);
    ctx.beginPath(); ctx.moveTo(w * .5, h * .26); ctx.lineTo(w * .5, h * .43);
    ctx.moveTo(w * .5, h * .57); ctx.lineTo(w * .5, h * .76); ctx.stroke(); ctx.setLineDash([]);
    for (const orb of orbs) drawOrb(orb);
    for (const p of particles) {
      ctx.globalAlpha = (1 - p.age / p.life) * .7;
      ellipse(p.x * w, p.y * h, 2, 2, p.color);
    }
    for (const ring of rings) {
      ctx.globalAlpha = (1 - ring.age / .4) * .45; ctx.strokeStyle = '#bfdabc'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, 12 + ring.age * 95, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (status === 'result' && rage >= 1) { ctx.fillStyle = '#a51c2440'; ctx.fillRect(0, 0, w, h); }
}

function drawOrb(orb) {
  const color = colors[orb.op];
  // A larger, landscape-shaped silhouette reads clearly on small phone screens.
  const r = Math.max(25, Math.min(w * .075, 38));
  for (let i = 1; i < orb.trail.length; i++) {
    ctx.globalAlpha = i / orb.trail.length * .13;
    ctx.strokeStyle = color; ctx.lineWidth = r * .4 * i / orb.trail.length;
    ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(orb.trail[i - 1].x * w, orb.trail[i - 1].y * h);
    ctx.lineTo(orb.trail[i].x * w, orb.trail[i].y * h); ctx.stroke();
  }
  drawSheep(ctx, orb, orb.x * w, orb.y * h, r, color);
}

function frame(t) {
  const dt = Math.min(.1, (t - previous) / 1000); previous = t;
  if (status !== 'paused') visualTime += dt;
  if (status === 'playing') {
    accumulator += dt;
    while (accumulator >= FIXED_STEP && status === 'playing') { tick(FIXED_STEP); accumulator -= FIXED_STEP; }
    if (status === 'playing') { update(); sounds.updateMusic(slowArithmetic(orbs)); }
  }
  draw(visualTime); requestAnimationFrame(frame);
}
home(); requestAnimationFrame(frame);
