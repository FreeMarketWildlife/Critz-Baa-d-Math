// NODE_PATH=<runtime node_modules> node tests/flock-browser.cjs
// Uses installed Chrome against localhost:4187; review hooks are response-only.
const { chromium } = require('playwright');
const path=require('path');const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[],reports=[];
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1365,height:900},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{requestAnimationFrame=()=>0;localStorage.setItem('baad-sound','off');});
  await page.route('**/src/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+`\nwindow.qa={
   state(){return {count,target,status,elapsed,rage,space:levitation.space,height:levitation.height,types:[...introductions.seen],perfectHits,perfectScore,score:n*100+perfectScore+Math.floor(elapsed)*10};},
   hold(seconds){for(let t=0;t<seconds-1e-8;t+=.001)controls.step(.001);update();},
   run(seconds){const end=elapsed+seconds;let debuts=[],index=introductions.index;while(elapsed<end&&status==='playing'){count=target;tick(FIXED_STEP);if(index!==introductions.index){if(orbs.length!==1)throw Error('Crowded debut');debuts.push({id:orbs.at(-1).op,wave:Math.floor(elapsed/26)});index=introductions.index;}}count=target;update();draw(visualTime);return debuts;},
   viewAll(){for(const type of FLOCK){recordSheep(collection,type.id,false,storage);recordSheep(collection,type.id,true,storage);}openCollection();},
   prepareSpace(){levitation.height=3.4;stepLevitation(levitation,FIXED_STEP,false);update();draw(visualTime);},
   draw(){update();draw(visualTime);},reset:()=>begin('endless')};`});});
  await page.goto('http://localhost:4187/',{waitUntil:'networkidle'});await page.locator('[data-mode]').click();
  if(mobile){
   const cdp=await context.newCDPSession(page);const box=await page.locator('#plus').boundingBox();const x=box.x+box.width*.5,y=box.y+box.height*.7;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   await page.evaluate(()=>qa.hold(.499));if(await page.evaluate(()=>qa.state().count)!==1)throw Error('Touch repeated before .5s');
   await page.evaluate(()=>qa.hold(.001));if(await page.evaluate(()=>qa.state().count)!==2)throw Error('Touch did not repeat at .5s');
   await page.evaluate(()=>qa.hold(3.5));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
   const box=await page.locator('#plus').boundingBox();await page.mouse.move(box.x+box.width*.5,box.y+box.height*.7);await page.mouse.down();await page.evaluate(()=>qa.hold(.499));if(await page.evaluate(()=>qa.state().count)!==1)throw Error('Mouse repeated before .5s');await page.evaluate(()=>qa.hold(.001));if(await page.evaluate(()=>qa.state().count)!==2)throw Error('Mouse did not repeat at .5s');await page.evaluate(()=>qa.hold(3.5));await page.mouse.up();
  }
  const held=await page.evaluate(()=>qa.state().count);if(held<130)throw Error('Hold failed '+held);
  await page.evaluate(()=>qa.hold(.5));if(await page.evaluate(()=>qa.state().count)!==held)throw Error('Release stuck');
  await page.evaluate(()=>qa.reset());await page.keyboard.down('ArrowLeft');await page.evaluate(()=>qa.hold(.5));await page.keyboard.up('ArrowLeft');if(await page.evaluate(()=>qa.state().count)!==0)throw Error('Ground negative');
  await page.keyboard.down('ArrowRight');await page.evaluate(()=>qa.hold(.499));if(await page.evaluate(()=>qa.state().count)!==1)throw Error('Keyboard repeated before .5s');await page.evaluate(()=>qa.hold(1.001));await page.keyboard.up('ArrowRight');const keyboard=await page.evaluate(()=>qa.state().count);if(keyboard<20)throw Error('Keyboard hold failed');
  await page.evaluate(()=>qa.prepareSpace());await page.keyboard.down('ArrowLeft');await page.evaluate(()=>qa.hold(2));await page.keyboard.up('ArrowLeft');if(await page.evaluate(()=>qa.state().count)>=0)throw Error('Space negative failed');
  await page.evaluate(()=>qa.reset());const debuts=await page.evaluate(()=>qa.run(1500));
  const state=await page.evaluate(()=>qa.state());if(!state.space||state.types.length<15)throw Error('Long run failed '+JSON.stringify(state));
  await page.screenshot({path:path.join(process.cwd(),'artifacts/flock-space-'+(mobile?'phone':'desktop')+'.png')});
  await page.locator('#collectionButton').click();const summary=await page.locator('#collectionSummary').textContent();
  await page.screenshot({path:path.join(process.cwd(),'artifacts/flock-achievements-'+(mobile?'phone':'desktop')+'.png')});
  if(await page.locator('.sheep-card').count()!==22)throw Error('Missing collection cards');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Page overflow');
  await page.locator('#closeCollection').click();if(await page.evaluate(()=>qa.state().status)!=='paused')throw Error('Collection failed pause');
  await page.locator('#resume').click();await page.locator('#pause').click();await page.evaluate(()=>qa.hold(1));await page.locator('#resume').click();
  await page.reload({waitUntil:'networkidle'});await page.locator('#collectionButton').click();if(await page.locator('#collectionSummary').textContent()!==summary)throw Error('Collection did not persist');
  await page.locator('#closeCollection').click();await page.locator('[data-mode]').click();if(await page.evaluate(()=>qa.state().types.length)!==0)throw Error('Restart curriculum');
  await page.evaluate(()=>qa.viewAll());await page.screenshot({path:path.join(process.cwd(),'artifacts/flock-all-'+(mobile?'phone':'desktop')+'.png')});
  reports.push({mobile,held,keyboard,summary,state,debuts});await context.close();
 }
 for(const viewport of [{width:320,height:568},{width:844,height:390}]) {
  const p=await browser.newPage({viewport});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:4187/',{waitUntil:'networkidle'});await p.locator('#collectionButton').click();
  const box=await p.locator('#closeCollection').boundingBox();if(!box||box.y<0||box.y+box.height>viewport.height)throw Error('Collection close unreachable');
  await p.screenshot({path:path.join(process.cwd(),'artifacts/flock-compact-'+viewport.width+'.png')});await p.close();
 }
 const art=await browser.newPage({viewport:{width:1000,height:1800}});await art.goto('http://localhost:4187/tests/visual-review.html',{waitUntil:'networkidle'});await art.screenshot({path:path.join(process.cwd(),'artifacts/flock-personalities.png')});
 await browser.close();fs.writeFileSync(path.join(process.cwd(),'artifacts/flock-qa.json'),JSON.stringify({reports,errors},null,2));console.log(JSON.stringify({reports,errors},null,2));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
