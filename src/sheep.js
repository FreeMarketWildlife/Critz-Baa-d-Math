// Shared canvas renderer: used by gameplay and the visual review page.
export function drawSheep(ctx, orb, x, y, r, color) {
  const ellipse = (x, y, rx, ry, fill, rotation = 0) => {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2); ctx.fill();
  };
  const happy = Boolean(orb.counted);
  ctx.globalAlpha = happy ? 1 : orb.crossed ? .88 : 1;
  const direction = orb.vx < 0 ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(direction, 1);
  // A gentle tumble lets faces stay recognizable while wool and hooves rotate.
  ctx.rotate(Math.sin(orb.angle) * .32);
  const face = '#344454', hoof = '#273748';
  const kick = Math.sin(orb.age * (happy ? 22 : 14)) * (happy ? .17 : .1);
  // Four tiny kicking legs and dark rounded hooves.
  for (const [lx, ly, angle] of [[-.55, .63, -.15], [.2, .67, .12], [-.25, .6, .2], [.48, .54, -.1]]) {
    ellipse(lx * r, ly * r, r * .115, r * .3, face, angle + kick);
    ellipse(lx * r + kick * r, (ly + .22) * r, r * .15, r * .1, hoof);
  }
  // Tail and creamy colored wool, shaded underneath and puffed along the rim.
  ellipse(-r * 1.04, -r * .1, r * .26, r * .22, color, -.4);
  ctx.shadowColor = happy ? '#c2f7d2' : color; ctx.shadowBlur = happy ? 14 : orb.crossed ? 0 : 9;
  ellipse(-r * .12, 0, r * 1.05, r * .77, color); ctx.shadowBlur = 0;
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    ellipse(-r * .12 + Math.cos(a) * r * .88, Math.sin(a) * r * .62, r * .3, r * .27, color);
  }
  ellipse(-r * .15, r * .39, r * .74, r * .21, '#26394d13');
  // Soft curls create wool texture rather than an operation coin.
  ctx.strokeStyle = '#ffffff65'; ctx.lineWidth = Math.max(1, r * .04);
  for (const [cx, cy] of [[-.65, -.25], [-.1, -.47], [.32, -.2], [-.62, .23], [.22, .31]]) {
    ctx.beginPath(); ctx.arc(cx * r, cy * r, r * .13, .2, Math.PI * 1.65); ctx.stroke();
  }
  // Floppy ears, a charcoal face, sparkling eyes, blush, and a little smile.
  ellipse(r * .57, -r * .35, r * .35, r * .15, face, -.55);
  ellipse(r * 1.19, -r * .28, r * .3, r * .14, face, .6);
  ellipse(r * .55, -r * .34, r * .19, r * .07, '#d998a0', -.55);
  ellipse(r * 1.19, -r * .27, r * .16, r * .065, '#d998a0', .6);
  ellipse(r * .87, -r * .03, r * .44, r * .54, face, -.12);
  if (happy) {
    ctx.strokeStyle = '#fff4dc'; ctx.lineWidth = r * .055; ctx.lineCap = 'round';
    for (const ex of [.71, 1.02]) {
      ctx.beginPath(); ctx.moveTo((ex - .09) * r, -r * .06);
      ctx.quadraticCurveTo(ex * r, -r * .28, (ex + .09) * r, -r * .06); ctx.stroke();
    }
  } else for (const [index, ex] of [.71, 1.02].entries()) {
    const goofy = orb.op === '×2', ey = goofy && index === 1 ? -.2 : -.12;
    ellipse(r * ex, r * ey, r * (goofy && index === 1 ? .13 : .095), r * (goofy ? .15 : .125), '#fff9e8');
    ellipse(r * (ex + (goofy ? (index ? -.035 : .04) : .015)), r * (ey + .015), r * .051, r * .076, '#172638');
    ellipse(r * (ex + .035), r * (ey - .02), r * .02, r * .025, '#ffffff');
  }
  ellipse(r * .58, r * .14, r * .09, r * .05, '#df99a666');
  ellipse(r * 1.12, r * .17, r * .08, r * .05, '#df99a666');
  ellipse(r * .87, r * .16, r * .055, r * .04, '#dfacb4');
  ctx.strokeStyle = '#b8c6ca'; ctx.lineWidth = r * .04; ctx.lineCap = 'round';
  if (happy) {
    // A big open yay mouth and delighted eyes override every original mood.
    ellipse(r * .87, r * .29, r * .19, r * .17, '#172638');
    ellipse(r * .87, r * .39, r * .12, r * .065, '#f4a4b7');
    ctx.strokeStyle = '#fff4dc'; ctx.lineWidth = r * .035;
    ctx.beginPath(); ctx.moveTo(r * .71, r * .18); ctx.quadraticCurveTo(r * .87, r * .25, r * 1.03, r * .18); ctx.stroke();
  } else if (orb.op === '−1') {
    // Low inward brows, a cross little frown, and a tiny forehead crease.
    ctx.strokeStyle = '#111e2d'; ctx.lineWidth = r * .08;
    ctx.beginPath(); ctx.moveTo(r * .58, -r * .34); ctx.lineTo(r * .82, -r * .21);
    ctx.moveTo(r * .92, -r * .21); ctx.lineTo(r * 1.16, -r * .34); ctx.stroke();
    ctx.strokeStyle = '#d3b6bd'; ctx.lineWidth = r * .04;
    ctx.beginPath(); ctx.moveTo(r * .72, r * .35); ctx.quadraticCurveTo(r * .87, r * .2, r * 1.02, r * .35); ctx.stroke();
  } else if (orb.op === '×2') {
    // Uneven eyes, an open grin, and a wagging tongue: gleefully chaotic.
    ellipse(r * .9, r * .29, r * .18, r * .15, '#182839', -.2);
    ellipse(r * .97, r * .39, r * .09, r * .16, '#f2a0ae', Math.sin(orb.age * 15) * .3);
    ctx.strokeStyle = '#bd647f'; ctx.lineWidth = r * .025;
    ctx.beginPath(); ctx.moveTo(r * .97, r * .34); ctx.lineTo(r * .97, r * .46); ctx.stroke();
    ctx.strokeStyle = '#edf0da'; ctx.lineWidth = r * .04;
    ctx.beginPath(); ctx.moveTo(r * .59, -r * .4); ctx.lineTo(r * .77, -r * .43); ctx.stroke();
  } else if (orb.op === '÷2') {
    // Worried brows, a trembling pout, and continuous blue tear streams.
    ctx.strokeStyle = '#c1d1df'; ctx.lineWidth = r * .04;
    ctx.beginPath(); ctx.moveTo(r * .58, -r * .36); ctx.lineTo(r * .8, -r * .43);
    ctx.moveTo(r * .94, -r * .43); ctx.lineTo(r * 1.15, -r * .36); ctx.stroke();
    ctx.strokeStyle = '#88d9ff'; ctx.lineWidth = r * .065;
    for (const ex of [.69, 1.05]) {
      ctx.beginPath(); ctx.moveTo(r * ex, 0); ctx.quadraticCurveTo(r * (ex - .06), r * .22, r * ex, r * .42); ctx.stroke();
      const drop = (orb.age * 1.7 + ex) % 1;
      ellipse(r * ex, r * (.35 + drop * .48), r * .065 * (1 - drop * .3), r * .105, '#91dcff');
    }
    ctx.strokeStyle = '#d2dce5'; ctx.lineWidth = r * .045;
    ctx.beginPath(); ctx.moveTo(r * .77, r * .34); ctx.quadraticCurveTo(r * .87, r * .24, r * .97, r * .34); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(r * .87, r * .2); ctx.quadraticCurveTo(r * .84, r * .3, r * .74, r * .25); ctx.stroke();
  }
  // A wool forelock sits between the ears.
  for (const [fx, fy] of [[.61, -.49], [.85, -.55], [1.06, -.47]]) ellipse(fx * r, fy * r, r * .18, r * .16, color);
  if (orb.op === '×2') {
    ctx.strokeStyle = color; ctx.lineWidth = r * .075;
    ctx.beginPath(); ctx.moveTo(r * .67, -r * .64); ctx.lineTo(r * .5, -r * .99); ctx.lineTo(r * .86, -r * .8); ctx.lineTo(r * 1.01, -r * 1.03); ctx.stroke();
  }
  if (happy) {
    ctx.strokeStyle = '#f6df9b'; ctx.lineWidth = r * .04;
    const pulse = 1 + Math.sin(orb.age * 7) * .1;
    for (const [sx, sy, size] of [[1.22, -.78, .12], [.46, -.98, .09]]) {
      ctx.beginPath(); ctx.moveTo((sx - size * pulse) * r, sy * r); ctx.lineTo((sx + size * pulse) * r, sy * r);
      ctx.moveTo(sx * r, (sy - size * pulse) * r); ctx.lineTo(sx * r, (sy + size * pulse) * r); ctx.stroke();
    }
  }
  ctx.restore();
  // The arithmetic stays upright on the sheep's side for quick reading.
  ctx.fillStyle = '#1b2838'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${r * .75}px 'Space Grotesk',sans-serif`;
  ctx.fillText(orb.op, x - direction * r * .2, y + r * .03);
  ctx.globalAlpha = 1;
}
