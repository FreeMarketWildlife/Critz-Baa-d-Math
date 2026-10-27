export const EFFECT_COLORS = { bloom: '#b3f7ce', ripple: '#9cdfff', stardust: '#f3d78e', petal: '#f4b4d1', halo: '#cdb8ff' };
export const POP_DURATION = .85;
// The same renderer powers the counter and the five continuously animated shop previews.
export function drawCrit(ctx, { x, y, width, height, effect = 'bloom', ready = 0, age = -1, reduced = false }) {
  const popping = age >= 0 && age < POP_DURATION;
  if (!popping && ready < .001) return;
  const t = Math.min(1, Math.max(0, age / POP_DURATION));
  const color = EFFECT_COLORS[effect] || EFFECT_COLORS.bloom;
  const alpha = popping ? (1-t)**1.5 : ready * .85;
  const spring = reduced || !popping ? 1 : 1 + Math.sin(Math.min(1, age / .34)*Math.PI)*.12 + t*.16;
  ctx.save(); ctx.translate(x,y); ctx.scale(spring,spring); ctx.globalAlpha = alpha;
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.shadowColor = color; ctx.shadowBlur = reduced ? 0 : 12;
  ctx.beginPath(); ctx.roundRect(-width/2,-height/2,width,height,Math.min(22,height*.23));
  if (!popping && effect !== 'bloom') {
    const perimeter = 2*(width+height); ctx.setLineDash([perimeter*ready,perimeter]);
  }
  ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
  if (popping && !reduced) {
    if (effect === 'ripple' || effect === 'halo') for (let i=0;i<(effect==='ripple'?3:1);i++) {
      const p = Math.max(0,t-i*.12); ctx.globalAlpha = Math.max(0,1-p)*alpha*.65;
      ctx.beginPath(); ctx.ellipse(0,0,width/2+ p*45,height/2+p*(effect==='halo'?14:35),effect==='halo'?-.3:0,0,Math.PI*2);ctx.stroke();
    }
    const count = effect==='stardust'?16:effect==='petal'?10:8;
    for(let i=0;i<count;i++) {
      const a=i/count*Math.PI*2, distance=t*(effect==='stardust'?65:40);
      const px=Math.cos(a)*(width/2+distance), py=Math.sin(a)*(height/2+distance)+(effect==='petal'?t*t*30:0);
      ctx.globalAlpha=alpha*.85;ctx.fillStyle=color;
      ctx.save();ctx.translate(px,py);ctx.rotate(a+t*1.5);
      if(effect==='stardust') {ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(4,0);ctx.moveTo(0,-4);ctx.lineTo(0,4);ctx.stroke();}
      else {ctx.beginPath();ctx.ellipse(0,0,(effect==='petal'?5:3)*(1-t*.5),effect==='petal'?2:3,0,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
  }
  ctx.restore();
}
export function drawTrail(ctx, trail, style, w, h, radius) {
  if (style === 'none' || !style) return;
  const palette = {rainbow:['#f8a5b2','#ffd392','#e9eea2','#9ae0bf','#a0d8f4','#c6adf1'],fire:['#ed7969','#f6ac65','#ffe1a0'],aurora:['#9ae8d2','#baa2ef','#9ac9ed'],comet:['#f4d68c','#fff3d5']}[style];
  if (!palette) return;
  ctx.save();ctx.lineCap='round';
  for(let i=1;i<trail.length;i++) {
    const p=trail[i];ctx.globalAlpha=i/trail.length*.5;ctx.strokeStyle=palette[i%palette.length];ctx.lineWidth=radius*.22*i/trail.length;
    ctx.beginPath();ctx.moveTo(trail[i-1].x*w,trail[i-1].y*h);ctx.lineTo(p.x*w,p.y*h);ctx.stroke();
    if(style==='fire'||style==='comet'){ctx.fillStyle=palette[i%palette.length];ctx.beginPath();ctx.arc(p.x*w,p.y*h-Math.sin(i*3)*5,style==='comet'?1.5:3,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}
