import { CATALOG, CATEGORIES, selectItem, saveShop } from './shop.js';
import { drawCrit, drawTrail, EFFECT_COLORS } from './crit.js';
import { drawSheep } from './sheep.js';
import { drawHunter } from './finale.js';
import { drawDreamSky, drawMoon } from './dream-sky.js';
import { drawLocation } from './locations.js';
const icons = { effect:'✧', trail:'≋', location:'◈', wolf:'♜', sheep:'♧', moon:'◉', phase:'◐', sky:'✦' };

export function drawShopPreview(canvas, entry, equipped, time, reduced, featured = false) {
  const p = canvas.getContext('2d'), { category, id } = entry;
  p.save();p.scale(canvas.width/280,canvas.height/150);
  const bg=p.createRadialGradient(140,70,3,140,70,170);bg.addColorStop(0,'#243650');bg.addColorStop(1,'#0b1426');
  p.fillStyle=bg;p.fillRect(0,0,280,150);
  for(let i=0;i<20;i++){p.globalAlpha=.2+(i%4)*.1;p.fillStyle='#b9dbe5';p.fillRect((i*89+27)%280,(i*47+13)%150,.6,.6);}p.globalAlpha=1;
  if(category==='effect') {
    const phase=reduced?.9:time%3;
    p.fillStyle=EFFECT_COLORS[id];p.font="48px 'Space Grotesk',sans-serif";p.textAlign='center';p.fillText('22',140,92);
    drawCrit(p,{x:140,y:75,width:90,height:70,effect:id,ready:phase<1.6?Math.min(1,phase*1.5):0,age:phase>=1.6?phase-1.6:-1,reduced});
  } else if(category==='sheep'||category==='trail') {
    const trail=Array.from({length:24},(_,i)=>({x:.04+i*.026,y:.57+Math.sin(i*.12+time)*.085}));
    if(!reduced)drawTrail(p,trail,category==='trail'?id:equipped.trail,280,150,28);
    drawSheep(p,{op:'+1',vx:1,angle:0,age:reduced?0:time,skin:category==='sheep'?id:equipped.sheep},180,78,28,'#f2efdf',reduced);
  } else if(category==='wolf') drawHunter(p,140,76,.7,{skin:id});
  else if(category==='moon'||category==='phase') {
    drawMoon(p,140,73,featured?44:39,{...equipped,[category]:id});
  } else {
    const look={...equipped,[category]:id};
    drawDreamSky(p,280,150,0,reduced?0:time,[],look);
    if(category==='location') {
      if(id==='meadow') {
        p.fillStyle='#344d4b';p.beginPath();p.ellipse(140,163,200,48,0,0,Math.PI*2);p.fill();
        for(let i=0;i<160;i++){p.fillStyle=['#9d8cc5','#dbcc91','#92b3d2'][i%3];p.beginPath();p.arc(i*37%280,119+i*13%32,.6+i%3*.3,0,Math.PI*2);p.fill();}
      } else drawLocation(p,280,150,0,time,id,reduced);
    }
  }
  p.restore();
}

export function createShopView({ shop, storage, sounds, reducedMotion, soundLabel }) {
  const $=id=>document.getElementById(id);
  let category='effect', selected=shop.equipped.effect, walletAnimation=null;
  const remembered={};
  const owned=e=>shop.owned.includes(`${e.category}:${e.id}`);
  const entries=()=>CATALOG.filter(i=>i.category===category);
  const current=()=>entries().find(e=>e.id===selected) || entries()[0];
  function focusCard() { $('shopGrid').querySelector(`[data-id="${selected}"]`).focus({preventScroll:true}); }
  function choose(id) {
    selected=id;remembered[category]=id;renderCards();renderFeature();focusCard();
    if(!reducedMotion.matches) $('shopFeature').animate([{opacity:.65},{opacity:1}],{duration:260});
    $('shopContent').scrollTo({top:0,behavior:reducedMotion.matches?'auto':'smooth'});
    sounds.shopSelect();
  }
  function renderCards() {
    $('shopGrid').replaceChildren();
    for(const entry of entries()) {
      const card=document.createElement('button');card.className='shop-card';card.dataset.id=entry.id;card.type='button';
      card.style.setProperty('--item-color',entry.color);
      const equipped=shop.equipped[category]===entry.id;
      card.classList.toggle('equipped',equipped);card.setAttribute('aria-pressed',String(selected===entry.id));
      const preview=document.createElement('canvas');preview.width=280;preview.height=150;preview.dataset.item=entry.id;preview.setAttribute('aria-hidden','true');
      const name=document.createElement('strong');name.textContent=entry.name;
      const price=document.createElement('span');price.className='card-price';price.textContent=equipped?'✓ Equipped':owned(entry)?'Owned':`${entry.price} ✦`;
      card.setAttribute('aria-label',`Preview ${entry.name}, ${price.textContent}`);
      card.append(preview,name,price);card.onclick=()=>choose(entry.id);$('shopGrid').append(card);
    }
  }
  function renderFeature() {
    const entry=current();$('shop').style.setProperty('--feature-color',entry.color);
    $('shopCategoryLabel').textContent=CATEGORIES[category];$('shopShelfTitle').textContent=CATEGORIES[category];
    $('shopOwned').textContent=`${entries().filter(owned).length} / ${entries().length} owned`;
    $('shopItemName').textContent=entry.name;$('shopItemDescription').textContent=entry.description;
    const isOwned=owned(entry),equipped=shop.equipped[category]===entry.id;
    $('shopItemPrice').textContent=isOwned?'':`${entry.price} Critz`;
    $('shopAction').textContent=equipped?'✓ Equipped':isOwned?'Equip':`Unlock · ${entry.price} Critz`;
    $('shopAction').disabled=equipped||!isOwned&&shop.balance<entry.price;
    $('shopShortfall').textContent=!isOwned&&shop.balance<entry.price?`${entry.price-shop.balance} more Critz to unlock`:'';
    $('shopHear').hidden=category!=='effect';
    $('shopPreview').setAttribute('aria-label',`${entry.name} preview`);
    animate(performance.now()/1000,true);
  }
  function render() {
    $('wallet').textContent=shop.balance.toLocaleString();walletAnimation=null;
    $('shopTabs').replaceChildren();
    for(const [key,label] of Object.entries(CATEGORIES)) {
      const button=document.createElement('button');button.type='button';button.dataset.category=key;
      const icon=document.createElement('span');icon.textContent=icons[key];icon.setAttribute('aria-hidden','true');
      const title=document.createElement('span');title.textContent=label;button.append(icon,title);
      button.setAttribute('aria-pressed',String(category===key));
      button.onclick=()=>{category=key;selected=remembered[key]||shop.equipped[key];render();$('shopContent').scrollTop=0;$('shopTabs').querySelector(`[data-category="${key}"]`).focus({preventScroll:true});sounds.shopSelect();};
      $('shopTabs').append(button);
    }
    renderCards();renderFeature();
  }
  function animate(time,force=false) {
    const entry=current(), t=reducedMotion.matches?0:time;
    drawShopPreview($('shopPreview'),entry,shop.equipped,t,reducedMotion.matches,true);
    // Static landscapes/moons render once per selection; decorative previews keep moving.
    if(force || ['effect','trail','sheep','sky'].includes(category)) for(const c of $('shopGrid').querySelectorAll('canvas')) {
      drawShopPreview(c,entries().find(i=>i.id===c.dataset.item),shop.equipped,t,reducedMotion.matches);
    }
    if(walletAnimation) {
      const progress=Math.min(1,(time-walletAnimation.start)/.55);
      $('wallet').textContent=Math.round(walletAnimation.from+(shop.balance-walletAnimation.from)*(1-(1-progress)**3)).toLocaleString();
      if(progress>=1)walletAnimation=null;
    }
  }
  $('shopAction').onclick=()=>{
    const entry=current(),bought=!owned(entry),before=shop.balance;
    if(!selectItem(shop,category,entry.id,storage))return;
    render();
    $('shopNotice').textContent=bought?`✦ ${entry.name} unlocked`:`✓ ${entry.name} equipped`;
    if(!saveShop(shop,storage))$('shopNotice').textContent+=' · This session only';
    if(!reducedMotion.matches) {
      if(bought){walletAnimation={from:before,start:performance.now()/1000};$('wallet').textContent=before.toLocaleString();}
      $('shopNotice').getAnimations().forEach(a=>a.cancel());
      $('shopNotice').animate([{opacity:0,transform:'translate(-50%,12px)'},{opacity:1,transform:'translate(-50%,0)',offset:.12},{opacity:1,offset:.8},{opacity:0}],{duration:2300,fill:'forwards'});
      $('shopFeature').getAnimations().forEach(a=>a.cancel());
      $('shopFeature').animate([{boxShadow:`0 0 0 0 ${entry.color}99`},{boxShadow:`0 0 50px 5px ${entry.color}44`,offset:.25},{boxShadow:`0 0 0 20px ${entry.color}00`}],{duration:650});
    }
    sounds.purchase(bought);focusCard();
  };
  $('shopHear').onclick=()=>{if(!sounds.enabled){sounds.toggle();soundLabel();}sounds.unlock();sounds.perfect(current().id);};
  return { render, animate };
}
