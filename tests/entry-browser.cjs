// Run with Playwright available: node tests/entry-browser.cjs (local server on port 4187).
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const [width,height] of [[390,844],[1440,900],[844,390]]){
const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;localStorage.setItem('baad-sound','off');});
await page.route('**/src/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+`\nwindow.review={begin:()=>begin('endless'),step:()=>{tick(1/120);update()},paint:()=>draw(elapsed),tap:delta=>tap(delta),state:()=>({target,count,n,status,elapsed,perfectHits,orbs:orbs.map(o=>({...o}))})};`});});
await page.goto('http://localhost:4187/');await page.reload();await page.waitForFunction(()=>window.review);
const audio=await page.evaluate(async()=>{
 const {DreamSounds}=await import('/src/sound.js');
 const render=async perfect=>{const context=new OfflineAudioContext(1,44100*2,44100),sounds=new DreamSounds();sounds.enabled=true;sounds.context=context;sounds.master=context.createGain();sounds.master.gain.value=.32;sounds.master.connect(context.destination);if(perfect)sounds.perfect();else sounds.cross('+1');const buffer=await context.startRendering();return Math.max(...buffer.getChannelData(0).map(Math.abs));};
 return {perfect:await render(true),ordinary:await render(false)};
});assert.ok(audio.perfect>0&&audio.perfect<1);assert.equal(audio.ordinary,0);
const result=await page.evaluate(()=>{const r=window.review;r.begin();let entry;
for(let i=0;i<120;i++){r.step();const s=r.state();if(s.target===1){entry=s;break;}}
if(!entry)throw Error('no entry');r.tap(1);for(let i=0;i<110;i++)r.step();return {entry,after:r.state()};});
assert.equal(result.entry.n,0);assert.equal(result.entry.orbs[0].crossed,false);assert.ok(result.entry.orbs[0].y>.85);assert.equal(result.after.target,1);assert.equal(result.after.n,1);assert.equal(result.after.perfectHits,1);assert.equal(typeof result.after.orbs[0].perfectAt,'number');
assert.equal(await page.locator('#perfect').count(),0);
await page.evaluate(()=>window.review.paint());await page.screenshot({path:`${process.cwd()}/artifacts/entry-timing-${width}.png`});
const simulation=await page.evaluate(()=>{const r=window.review;r.begin();let tapAt=0;
for(let i=0;i<120*180;i++){r.step();const s=r.state();if(s.elapsed>=tapAt&&s.count!==s.target){r.tap(Math.sign(s.target-s.count));tapAt=s.elapsed+1/7;}if(s.status!=='playing')return s;}
return r.state();});assert.equal(simulation.status,'playing');assert.ok(simulation.n>70);assert.ok(simulation.perfectHits/simulation.n>.95);
assert.deepEqual(errors,[]);console.log(JSON.stringify({width,height,entryTime:result.entry.elapsed,entryY:result.entry.orbs[0].y,sheep:simulation.n,perfects:simulation.perfectHits}));await page.close();
}await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
