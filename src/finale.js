import { guardianPalettes } from './shop.js';
// Short, deterministic choreography. Sheep renderers stay owned by sheep.js.
export const FINALE_DURATION = 2.2;
export function runStats({ sheep, perfect, peak, seconds, perfectScore = perfect * 50 }) {
  return { sheep, perfect, peak, seconds, score: sheep * 100 + perfectScore + Math.floor(seconds) * 10 };
}
export function attackBeat(time, total) {
  const slot = 1.05 / Math.max(1, total);
  return { index: Math.min(total - 1, Math.floor(Math.max(0, time - .65) / slot)), phase: Math.max(0, time - .65) % slot / slot, slot };
}
export function drawHunter(ctx, x, y, size, { mouth = 0, look = 0, lookUp = false, gulp = 0, bloody = false, skin = 'wolf' } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size, size);
  const oval = (x,y,a,b,c) => {ctx.fillStyle=guardianPalettes[skin]?.[c]||c;ctx.beginPath();ctx.ellipse(x,y,a,b,0,0,Math.PI*2);ctx.fill();};
  const poly = (p,c) => {ctx.fillStyle=guardianPalettes[skin]?.[c]||c;ctx.beginPath();p.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fill();};
  if(skin==='lion')oval(0,3,83,79,'#926035');
  // Same slate fur, pale ruff and angular ears as the curled sleeping wolf.
  oval(12,38,65,39,'#344b60');
  if(skin==='lion'||skin==='hyena') {
    oval(-46,-44,18,20,'#607b8a');oval(34,-42,18,20,'#607b8a');
    poly([[-54,28],[-66,9],[-58,-20],[-32,-48],[0,-53],[38,-40],[47,-7],[66,20],[43,58],[-15,65]],'#607b8a');
  } else poly([[-54,28],[-80,9],[-64,-12],[-70,-69],[-32,-48],[0,-63],[25,-43],[56,-61],[47,-7],[66,20],[43,58],[-15,65]],'#607b8a');
  if(skin==='hyena'){oval(-51,-48,19,21,'#ae936b');oval(40,-46,18,20,'#ae936b');for(let i=0;i<9;i++)oval(-46+i*37%90,16+i*19%32,4,3,'#514534');}
  if(skin!=='lion'&&skin!=='hyena') poly([[-62,-54],[-58,-20],[-36,-37]],'#aa919a');if(skin!=='lion'&&skin!=='hyena') poly([[42,-46],[35,-19],[17,-34]],'#aa919a');
  poly([[-62,15],[-78,32],[-50,31],[-60,49],[-25,46],[0,72],[34,47],[61,27],[35,20]],'#a8bdbf');
  if(skin==='hyena')for(const [x,y]of [[-42,-19],[37,3],[-30,16],[23,-36],[-15,-36]])oval(x,y,3,2.5,'#514534');
  for(const ex of [-29,23]) {oval(ex, -13, 14, 9,'#f2cd86');oval(ex+look,lookUp ? -18 : -14,3,6,'#172333');}
  poly([[-46,-30],[-13,-22],[-14,-17],[-43,-22]],'#24394a');poly([[7,-22],[39,-32],[36,-22],[8,-17]],'#24394a');
  oval(-2,14,32,19,'#c5d2c9');oval(-2,5,12,8,'#142333');
  oval(-2,35,28,5+mouth*34,'#250f22');
  for(let i=0;i<5;i++){const xx=-25+i*11;poly([[xx,26-mouth*14],[xx+8,26-mouth*14],[xx+4,38+mouth*2]],'#fff2d8');}
  if(mouth>.15)oval(0,41+mouth*15,15,5,'#c96b7d');
  if(bloody){oval(-20,34,5,9,'#ad304c');oval(19,37,4,12,'#ad304c');}
  if(gulp>0)oval(0,66,12+gulp*8,9+gulp*8,'#b4c7c5');
  ctx.restore();
}
