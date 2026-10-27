// NODE_PATH=<bundled node_modules> node tests/crit-browser.cjs
// Review hooks are injected into intercepted responses, never shipped.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];fs.mkdirSync('artifacts/shop-v2',{recursive:true});
 for(const [label,viewport,reduced] of [['desktop',{width:1440,height:900},false],['phone',{width:390,height:844},false],['landscape',{width:844,height:390},false],['reduced',{width:390,height:844},true]]){
  const context=await browser.newContext({viewport,isMobile:label==='phone',hasTouch:label==='phone',reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.setItem('baad-sound','off');});
  await page.route('**/src/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:await response.text()+`\nimport {CATALOG,DEFAULTS,selectItem} from '/src/shop.js';
   window.qa={
    state:()=>({balance:shop.balance,earned:shop.earned,equipped:{...shop.equipped},status,count,target,elapsed,hits:perfectHits,bonus:perfectScore,runCritz,readyGlow,pops:critPops.length}),
    run(seconds,auto=true){let end=elapsed+seconds;while(elapsed<end&&status==='playing'){if(auto){const orb=nextSheep();if(orb)count=orb.result;}tick(FIXED_STEP);}update();draw(0);},
    cross(late=false){begin('endless');while(!nextSheep())tick(FIXED_STEP);const orb=nextSheep();if(!late)count=orb.result;while(!orb.crossed)tick(FIXED_STEP);if(late)count=orb.result;update();draw(0);},
    prep(){begin('endless');while(!nextSheep())tick(FIXED_STEP);count=nextSheep().result;for(let i=0;i<50;i++)tick(FIXED_STEP);update();draw(0);},
    credit(){earnCrit(shop,25000,storage);renderShop();},
    all(){shop.balance=10000;for(const item of CATALOG)selectItem(shop,item.category,item.id,storage);renderShop();},
    resetLook(){for(const [category,id]of Object.entries(DEFAULTS))selectItem(shop,category,id,storage);},
    preview(t){animateShop(t);},draw(){update();draw(0);},
    finish(){finish();finaleTime=1;draw(0);showResult();draw(0);},
    tally(t){resultAge=t;renderResultTally();},
    discover(){recordSheep(collection,'+1',false,storage);recordSheep(collection,'+1',true,storage);},
    readyScore(){begin('endless');n=7;perfectScore=150;elapsed=12.9;update();},
    timeOnly(){elapsed+=10;update();}
   };`});});
  await page.goto('http://localhost:4187/',{waitUntil:'networkidle'});
  assert.equal((await page.evaluate(()=>qa.state())).equipped.trail,'none');
  assert.equal(await page.locator('#collectionButton').innerText(),'Discovered');
  await page.locator('#collectionButton').click();assert.equal(await page.locator('.unknown-sheep').count(),22);
  assert.equal((await page.locator('#collection').innerText()).replaceAll('???','').replace('Back','').replace('Discovered','').trim(),'');
  await page.locator('#closeCollection').click();await page.evaluate(()=>qa.discover());await page.locator('#collectionButton').click();
  assert.equal(await page.locator('.unknown-sheep').count(),21);assert.equal(await page.locator('.sheep-card.mastered canvas').count(),1);assert.equal(await page.locator('#flockGrid h3,#flockGrid p,#flockGrid small').count(),0);
  await page.screenshot({path:`artifacts/shop-v2/${label}-discovered.png`});await page.locator('#closeCollection').click();
  await page.locator('#shopButton').click();assert.equal(await page.locator('#shopGrid .shop-card').count(),5);
  await page.getByRole('button',{name:/Preview Ripple/}).click();assert.equal(await page.locator('#shopAction').isDisabled(),true);
  await page.evaluate(()=>qa.credit());await page.locator('#shopAction').click();assert.equal((await page.evaluate(()=>qa.state())).balance,465);assert.match(await page.locator('#shopNotice').innerText(),/Ripple unlocked/);
  await page.reload({waitUntil:'networkidle'});assert.equal((await page.evaluate(()=>qa.state())).equipped.effect,'ripple');
  await page.locator('#shopButton').click();await page.getByRole('button',{name:/Preview Soft Bloom/}).click();await page.locator('#shopAction').click();
  await page.evaluate(()=>qa.preview(.9));await page.screenshot({path:`artifacts/shop-v2/${label}-shop.png`});
  await page.evaluate(()=>qa.all());
  for(const category of ['Sheep trails','Locations','Dream guardians','Sheep skins','Moon colors','Moon phases','Skies','Crit effects']){
   await page.getByRole('button',{name:category,exact:true}).click();
   const ids=await page.locator('#shopGrid .shop-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));
   for(const id of ids){await page.locator(`#shopGrid [data-id="${id}"]`).click();if(await page.locator('#shopAction').isEnabled())await page.locator('#shopAction').click();await page.evaluate(()=>{qa.draw();qa.preview(1.85);});}
  }
  // Color and phase purchases equip independently, including after a reload.
  await page.getByRole('button',{name:'Moon colors',exact:true}).click();await page.getByRole('button',{name:/Preview Rose Moon/}).click();await page.locator('#shopAction').click();
  await page.getByRole('button',{name:'Moon phases',exact:true}).click();await page.getByRole('button',{name:/Preview First quarter/}).click();await page.locator('#shopAction').click();
  let look=(await page.evaluate(()=>qa.state())).equipped;assert.equal(look.moon,'rose');assert.equal(look.phase,'first-quarter');
  await page.reload({waitUntil:'networkidle'});look=(await page.evaluate(()=>qa.state())).equipped;assert.equal(look.moon,'rose');assert.equal(look.phase,'first-quarter');
  await page.evaluate(()=>qa.resetLook());
  let before=await page.evaluate(()=>qa.state());await page.evaluate(()=>qa.cross(true));let late=await page.evaluate(()=>qa.state());assert.equal(late.balance,before.balance);assert.equal(late.hits,0);
  await page.evaluate(()=>qa.cross());let hit=await page.evaluate(()=>qa.state());assert.equal(hit.hits,1);assert.equal(hit.bonus,50);assert.equal(hit.balance,late.balance+1);assert.equal(hit.pops,1);assert.equal(await page.locator('#runScore').innerText(),'150');
  await page.evaluate(()=>qa.run(.1));assert.equal((await page.evaluate(()=>qa.state())).balance,hit.balance);
  await page.locator('#shopButton').click();let paused=await page.evaluate(()=>qa.state());await page.locator('#closeShop').click();assert.equal((await page.evaluate(()=>qa.state())).status,'paused');assert.equal((await page.evaluate(()=>qa.state())).elapsed,paused.elapsed);await page.locator('#resume').click();
  await page.evaluate(()=>qa.readyScore());assert.equal(await page.locator('#runScore').innerText(),'850');await page.evaluate(()=>qa.timeOnly());assert.equal(await page.locator('#runScore').innerText(),'850');
  await page.evaluate(()=>qa.finish());assert.equal(await page.locator('#stars').innerText(),reduced?'1,070':'850');
  await page.evaluate(()=>qa.tally(1));let midway=+(await page.locator('#stars').innerText()).replaceAll(',','');assert.ok(midway>850&&midway<=1070);
  await page.screenshot({path:`artifacts/shop-v2/${label}-result.png`});
  if(!reduced)await page.locator('#stars').click();assert.equal(await page.locator('#stars').innerText(),'1,070');assert.equal(await page.locator('#timeBonus').innerText(),'+0');
  await page.locator('#shopButton').click();await page.locator('#closeShop').click();assert.equal((await page.evaluate(()=>qa.state())).status,'result');assert.equal(await page.locator('#stars').innerText(),'1,070');
  console.log(label,'passed');await context.close();
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
