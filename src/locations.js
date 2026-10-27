// Small vector landscapes retain parallax and disappear naturally during ascent.
export function drawLocation(ctx,w,h,camera,time,id,reduced=false) {
  const shift=camera*h, unit=Math.min(w/850,h/650);
  if(shift>h*.5)return;
  ctx.save();ctx.translate(0,shift);
  const polygon=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  const oval=(x,y,rx,ry,color,angle=0)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);ctx.fill();};
  for(let layer=0;layer<3;layer++) {
    const base=h*(.73+layer*.09), depth=layer+1;
    const tones={desert:['#877255','#a88b62','#b79c74'],island:['#17505d','#236777','#baa681'],jungle:['#183f3c','#205248','#296051'],alpine:['#738a9f','#405d69','#284c50']}[id];
    const pts=[[0,h*1.1]];
    for(let x=0;x<=w+20;x+=20)pts.push([x,base+Math.sin(x/w*6+layer*2)*h*.035]);
    pts.push([w,h*1.1]);polygon(pts,tones[layer]);
    if(id==='alpine'&&layer===0) for(let i=0;i<6;i++) {
      const x=i*w/5,peak=base-h*(.13+(i%3)*.025),size=w*.13;
      polygon([[x-size,base],[x,peak],[x+size,base]],'#8ba0b0');polygon([[x-size*.35,peak+h*.06],[x,peak],[x+size*.4,peak+h*.065]],'#dce6e6');
    }
    if(id==='island'&&layer<2)for(let i=0;i<9;i++){
      const x=(i/8*w+(reduced?0:Math.sin(time*.3+i)*8));ctx.strokeStyle='#a2d7d640';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,base+20,25,2,0,0,Math.PI);ctx.stroke();
    }
    if((id==='jungle'||id==='alpine')&&layer>0)for(let i=0;i<16;i++){
      const x=(i+.3)*w/16, tall=(25+(i*17%38))*depth*unit;
      ctx.strokeStyle='#173a35';ctx.lineWidth=5*unit;ctx.beginPath();ctx.moveTo(x,base+25);ctx.lineTo(x,base-tall);ctx.stroke();
      if(id==='alpine')polygon([[x-22*depth*unit,base],[x,base-tall],[x+22*depth*unit,base]],layer===1?'#244b48':'#163c39');
      else for(let j=0;j<5;j++)oval(x+Math.cos(j*1.4)*20*unit,base-tall+Math.sin(j*1.4)*12*unit,32*unit,10*unit,layer===1?'#2f6a52':'#39765b',j);
    }
  }
  if(id==='jungle')for(let i=0;i<12;i++){
    const x=(i+.5)*w/12,y=h*(.95+(i%3)*.018);
    for(let j=0;j<5;j++){const a=-Math.PI*.9+j*Math.PI*.2;oval(x+Math.cos(a)*16*unit,y+Math.sin(a)*18*unit,23*unit,4*unit,'#478568',a);}
  }
  if(id==='island')for(const x of [w*.09,w*.88]){
    const base=h*.91;ctx.strokeStyle='#7f7859';ctx.lineWidth=9*unit;ctx.beginPath();ctx.moveTo(x,base);ctx.quadraticCurveTo(x-15*unit,base-75*unit,x+10*unit,base-130*unit);ctx.stroke();
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;oval(x+10*unit+Math.cos(a)*30*unit,base-130*unit+Math.sin(a)*14*unit,48*unit,9*unit,'#326653',a+(reduced?0:Math.sin(time*.4)*.025));}
  }
  if(id==='desert')for(const x of [w*.13,w*.86]){
    ctx.strokeStyle='#436252';ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,h*.94);ctx.lineTo(x,h*.80);ctx.moveTo(x,h*.87);ctx.lineTo(x-20,h*.87);ctx.lineTo(x-20,h*.83);ctx.moveTo(x,h*.89);ctx.lineTo(x+20,h*.89);ctx.lineTo(x+20,h*.85);ctx.stroke();
    for(let i=0;i<15;i++)oval((i*137%1000)/1000*w,h*(.94+i%3*.02),2,1,'#e3c691');
  }
  ctx.restore();
}
