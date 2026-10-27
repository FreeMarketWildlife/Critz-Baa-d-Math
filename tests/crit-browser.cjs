// NODE_PATH=<bundled node_modules> node tests/crit-browser.cjs
// Review hooks are injected into intercepted responses, never shipped.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const errors=[];fs.mkdirSync('artifacts/crits',{recursive:true});
 for(const [label,viewport,reduced] of [['desktop',{width:1440,height:900},false],['phone',{width:390,height:844},false],['landscape',{width:844,height:390},false],['reduced',{width:390,height:844},true]]){
  const context=await browser.newContext({viewport,isMobile:label==='phone',hasTouch:label==='phone',reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.setItem('baad-sound','off');});
  await page.route('**/src/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:await response.text()+`\nwindow.qa={
   state:()=>({balance:shop.balance,earned:shop.earned,equipped:{...shop.equipped},status,count,target,elapsed,hits:perfectHits,bonus:perfectScore,runCritz,readyGlow,pops:critPops.length}),
   run(seconds,auto=true){let end=elapsed+seconds;while(elapsed<end&&status==='playing'){if(auto){const orb=nextSheep();if(orb)count=orb.result;}tick(FIXED_STEP);}update();draw(visualTime);},
   cross(late=false){begin('endless');while(!nextSheep())tick(FIXED_STEP);let orb=nextSheep();if(!late)count=orb.result;while(!orb.crossed)tick(FIXED_STEP);if(late)count=orb.result;update();draw(0);},
   prep(){begin('endless');while(!nextSheep())tick(FIXED_STEP);count=nextSheep().result;for(let i=0;i<50;i++)tick(FIXED_STEP);update();draw(0);},
   credit(){earnCrit(shop,25000,storage);renderShop();},
   all(){for(const item of CATALOG){shop.balance=10000;selectItem(shop,item.category,item.id,storage);}renderShop();},
   resetLook(){for(const [category,id]of Object.entries(DEFAULTS))selectItem(shop,category,id,storage);},
   preview(t){animateShop(t);},draw(){update();draw(0);},finish(){finish();finaleTime=1;draw(0);finaleTime=2.3;showResult();draw(0);}
  };`.replace('Object.entries(DEFAULTS)','Object.entries({effect:"bloom",trail:"none",location:"meadow",wolf:"wolf",sheep:"sheep",moon:"full",sky:"night"})')});});
  await page.goto('http://localhost:4187/',{waitUntil:'networkidle'});
  assert.equal((await page.evaluate(()=>qa.state())).equipped.trail,'none');
  await page.locator('#shopButton').click();assert.equal(await page.locator('#shopGrid article').count(),5);
  assert.equal(await page.locator('#shopGrid button').filter({hasText:'Buy'}).first().isDisabled(),true);
  await page.evaluate(()=>qa.credit());
  await page.locator('#shopGrid article').filter({hasText:'Ripple'}).getByRole('button',{name:'Buy · 35 Critz'}).click();
  assert.equal((await page.evaluate(()=>qa.state())).balance,465);
  await page.reload({waitUntil:'networkidle'});assert.equal((await page.evaluate(()=>qa.state())).equipped.effect,'ripple');
  await page.locator('#shopButton').click();await page.locator('#shopGrid article').filter({hasText:'Soft Bloom'}).getByRole('button',{name:'Equip',exact:true}).click();
  await page.evaluate(()=>qa.preview(.9));await page.screenshot({path:`artifacts/crits/${label}-shop.png`});
  // Every listed cosmetic must render and equip through its real UI.
  await page.evaluate(()=>qa.all());
  for(const category of ['Sheep trails','Locations','Dream guardians','Sheep skins','Moons','Skies','Crit effects']){
   await page.getByRole('button',{name:category,exact:true}).click();
   const count=await page.locator('#shopGrid article').count();
   for(let i=0;i<count;i++){
    const button=page.locator('#shopGrid article').nth(i).getByRole('button',{name:/^(Equip|Equipped)$/});
    if(await button.isEnabled())await button.click();
    await page.evaluate(()=>{qa.draw();qa.preview(1.85);});
   }
  }
  await page.locator('#closeShop').click();await page.evaluate(()=>qa.resetLook());
  let before=await page.evaluate(()=>qa.state());await page.evaluate(()=>qa.cross(true));let late=await page.evaluate(()=>qa.state());assert.equal(late.balance,before.balance);assert.equal(late.hits,0);
  await page.evaluate(()=>qa.cross());let hit=await page.evaluate(()=>qa.state());assert.equal(hit.hits,1);assert.equal(hit.bonus,50);assert.equal(hit.balance,late.balance+1);assert.equal(hit.runCritz,1);assert.equal(hit.pops,1);
  await page.screenshot({path:`artifacts/crits/${label}-pop.png`});
  await page.evaluate(()=>qa.run(.1));assert.equal((await page.evaluate(()=>qa.state())).balance,hit.balance);
  await page.locator('#shopButton').click();let paused=await page.evaluate(()=>qa.state());await page.locator('#closeShop').click();assert.equal((await page.evaluate(()=>qa.state())).status,'paused');assert.equal((await page.evaluate(()=>qa.state())).elapsed,paused.elapsed);await page.locator('#resume').click();
  await page.evaluate(()=>qa.prep());await page.screenshot({path:`artifacts/crits/${label}-ready.png`});
  assert.ok(await page.locator('#count').isVisible());assert.equal(await page.locator('#pace,#feedback,#state,#operation,.countline').count(),0);
  await page.evaluate(()=>qa.run(120));assert.equal((await page.evaluate(()=>qa.state())).status,'playing');
  await page.evaluate(()=>qa.finish());assert.match(await page.locator('#resultCritz').innerText(),/Crits.*Critz/);
  await page.locator('#shopButton').click();await page.locator('#closeShop').click();assert.equal((await page.evaluate(()=>qa.state())).status,'result');
  console.log(label,'passed',await page.evaluate(()=>qa.state()));await context.close();
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
