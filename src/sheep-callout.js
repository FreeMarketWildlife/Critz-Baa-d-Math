// Each perfect belongs to its sheep and travels with it, rather than the HUD.
export function perfectBubble(orb, w, h, r) {
  if (orb.perfectAt === undefined) return null;
  const age = orb.age - orb.perfectAt;
  if (age < 0 || age >= 1.05) return null;
  const width = w < 600 ? 100 : 118, height = w < 600 ? 33 : 38;
  // Sit above the face; switch sides with the flight and keep the bubble on screen.
  const face = orb.x * w + Math.sign(orb.vx) * r * .7;
  const beside = orb.x * w + (orb.vx > 0 ? r * 1.65 : -r * 1.65 - width);
  const side = h < 500 && beside >= 12 && beside + width <= w - 12;
  const x = side ? beside : Math.max(12, Math.min(w - width - 12, face - width * .5));
  const y = Math.max(side ? 110 : 65, Math.min(h - height - 12, side ? orb.y * h - height * .5 : orb.y * h - r * 1.2 - height - 10));
  return { x, y, width, height, age, face, side, opacity: Math.min(1, (1.05 - age) / .25) };
}

export function drawPerfectBubble(ctx, orb, w, h, r, reduced = false) {
  const bubble = perfectBubble(orb, w, h, r);
  if (!bubble) return;
  const { x, y, width, height, age, opacity, face, side } = bubble;
  const pop = reduced ? 1 : 1 - Math.exp(-age * 22) * Math.cos(age * 19) * .24;
  ctx.save(); ctx.globalAlpha = opacity;
  ctx.translate(x + width / 2, y + height / 2);
  ctx.scale(pop, pop); ctx.rotate(reduced ? 0 : Math.sin(age * 5) * .035);
  ctx.shadowColor = '#081a3255'; ctx.shadowBlur = 9; ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#f4eed6'; ctx.strokeStyle = '#d9c98a'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(-width / 2, -height / 2, width, height, [14, 14, 14, 5]); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  const tail = Math.max(-width / 2 + 12, Math.min(width / 2 - 12, face - x - width / 2));
  ctx.beginPath();
  if (side) {
    const edge = (orb.vx > 0 ? -1 : 1) * width / 2;
    ctx.moveTo(edge, -5); ctx.lineTo(edge + Math.sign(edge) * 10, 7); ctx.lineTo(edge, 11);
  } else {
    ctx.moveTo(tail - 7, height / 2 - 1); ctx.lineTo(tail + 2, height / 2 + 9); ctx.lineTo(tail + 9, height / 2 - 1);
  }
  ctx.fill();
  ctx.fillStyle = '#355b61'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${w < 600 ? 15 : 17}px 'Space Grotesk',sans-serif`;
  ctx.fillText('Perfect!', 0, 1);
  // A little celebratory sparkle on either side of the speech bubble.
  ctx.strokeStyle = '#efe2a2'; ctx.lineWidth = 1.4;
  for (const side of [-1, 1]) {
    const sx = side * (width / 2 + 7 + Math.min(age, .3) * 15), sy = -height * .28;
    ctx.beginPath(); ctx.moveTo(sx - 3, sy); ctx.lineTo(sx + 3, sy); ctx.moveTo(sx, sy - 4); ctx.lineTo(sx, sy + 4); ctx.stroke();
  }
  ctx.restore();
}
