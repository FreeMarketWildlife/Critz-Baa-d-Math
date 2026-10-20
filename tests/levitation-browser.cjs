// NODE_PATH=<runtime node_modules> node tests/levitation-browser.cjs
// Run against the dev server at localhost:4187. Review hooks exist only in this intercepted response.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const [width, height] of [[390, 844], [1440, 900], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; localStorage.setItem('baad-sound', 'off'); });
    await page.route('**/src/game.js', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()) + `\nwindow.review={
        begin:()=>begin('endless'),paint:()=>{update();draw(elapsed)},
        state:()=>({status,elapsed,rage,...levitation}),
        run:seconds=>{for(let i=0;i<seconds*120&&status==='playing';i++){tick(1/120);while(count!==target)tap(Math.sign(target-count));}update();draw(elapsed)},
        break:()=>{count=target+20;grace=-1;next=Infinity;orbs=[];tick(1/120);update();draw(elapsed)},
        fall:()=>{let penaltyStart=rage;while(levitation.falling&&status==='playing')tick(1/120);update();draw(elapsed);return rage-penaltyStart},
        pause:()=>{pause();frame(previous+100)},resume:()=>$('resume').click(),
        lose:()=>{rage=1;finish();frame(previous+100)},
        end:()=>{for(let i=0;i<25;i++)frame(previous+100)}
      };` });
    });
    await page.goto('http://localhost:4187/'); await page.reload(); await page.waitForFunction(() => window.review);
    assert.equal(await page.locator('.progress,#progress').count(), 0);
    await page.evaluate(() => review.begin());
    await page.evaluate(() => review.paint());
    await page.screenshot({ path: `artifacts/wolf-grass-${width}.png` });
    await page.evaluate(() => review.run(14.5));
    assert.equal((await page.evaluate(() => review.state())).height, 0);
    await page.evaluate(() => review.run(1));
    assert.ok((await page.evaluate(() => review.state())).height > 0);
    await page.evaluate(() => review.run(14.5));
    await page.screenshot({ path: `artifacts/wolf-liftoff-${width}.png` });
    await page.evaluate(() => review.run(60));
    const orbit = await page.evaluate(() => review.state()); assert.equal(orbit.status, 'playing'); assert.ok(orbit.height > .6 && orbit.height < 2);
    await page.screenshot({ path: `artifacts/wolf-moonlit-ascent-${width}.png` });
    await page.evaluate(() => review.pause());
    assert.equal((await page.evaluate(() => review.state())).height, orbit.height);
    await page.evaluate(() => review.resume());
    await page.evaluate(() => review.run(120));
    assert.ok((await page.evaluate(() => review.state())).height > 3);
    await page.screenshot({ path: `artifacts/wolf-space-${width}.png` });
    await page.evaluate(() => review.break());
    assert.equal((await page.evaluate(() => review.state())).falling, true);
    const penalty = await page.evaluate(() => review.fall());
    assert.ok(Math.abs(penalty - .5) < .01, String(penalty));
    const landed = await page.evaluate(() => review.state()); assert.equal(landed.height, 0); assert.equal(landed.status, 'playing');
    await page.screenshot({ path: `artifacts/wolf-landing-${width}.png` });
    await page.evaluate(() => review.lose()); await page.evaluate(() => review.end());
    assert.equal((await page.evaluate(() => review.state())).status, 'result');
    await page.locator('#again').click(); const fresh = await page.evaluate(() => review.state());
    assert.equal(fresh.height, 0); assert.equal(fresh.calm, 0); assert.equal(fresh.rage, 0); assert.equal(fresh.status, 'playing');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ width, height, orbit: orbit.height, landingRage: landed.rage, restart: fresh.status, errors }));
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
