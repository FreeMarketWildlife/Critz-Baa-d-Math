// Run with Playwright available and the local dev server on port 4187.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:4187/'); await page.reload();
  const audio = await page.evaluate(async () => {
    const { CricketAmbience } = await import('/src/ambience.js');
    const context = new OfflineAudioContext(1, 44100 * 8, 44100);
    const master = context.createGain(); master.gain.value = .32; master.connect(context.destination);
    const crickets = new CricketAmbience(context, master); crickets.start();
    [1, 2.8, 4.7, 6.4].forEach((at, i) => crickets.chirp(at, i));
    const buffer = await context.startRendering(), samples = buffer.getChannelData(0);
    let peak = 0, energy = 0, silentGapPeak = 0;
    for (let i = 0; i < samples.length; i++) {
      peak = Math.max(peak, Math.abs(samples[i])); energy += samples[i] ** 2;
      if (i > 44100 * 1.5 && i < 44100 * 2.5) silentGapPeak = Math.max(silentGapPeak, Math.abs(samples[i]));
    }
    // Actual Web Audio lifecycle: mute, late unmute, pause, resume, and home.
    const { DreamSounds } = await import('/src/sound.js');
    const sounds = new DreamSounds(); sounds.enabled = false; sounds.start();
    sounds.toggle(); const ambience = sounds.ambience;
    const started = ambience.active; sounds.updateMusic(false, .2);
    sounds.pause(); const paused = !ambience.active && ambience.voices.size === 0;
    sounds.toggle(); sounds.toggle(); const staysPaused = !ambience.active;
    sounds.resume(); const resumed = ambience.active && sounds.ambience === ambience;
    sounds.stopMusic(); const stopped = !ambience.active && ambience.voices.size === 0;
    await sounds.context.close();
    return { peak, rms: Math.sqrt(energy / samples.length), silentGapPeak, started, paused, staysPaused, resumed, stopped };
  });
  assert.ok(audio.peak > .001 && audio.peak < .005, JSON.stringify(audio));
  assert.ok(audio.rms < .001); assert.equal(audio.silentGapPeak, 0);
  for (const state of ['started', 'paused', 'staysPaused', 'resumed', 'stopped']) assert.equal(audio[state], true, state);
  const rendering = await page.evaluate(async () => {
    const { drawDreamSky, drawGrass } = await import('/src/dream-sky.js');
    const canvas = document.createElement('canvas'); canvas.width = 1440; canvas.height = 900;
    const ctx = canvas.getContext('2d'), stars = Array.from({length:130}, (_,i)=>({x:i/130,y:(i*.71)%1,r:1,phase:i}));
    drawDreamSky(ctx,1440,900,0,0,stars); drawGrass(ctx,1440,900,0);
    const before = performance.now();
    for(let i=0;i<120;i++){drawDreamSky(ctx,1440,900,0,i/60,stars);drawGrass(ctx,1440,900,0,0,.5,i/60);}
    return { millisecondsPerDraw:(performance.now()-before)/120 };
  });
  assert.ok(rendering.millisecondsPerDraw < 16.7, JSON.stringify(rendering));
  assert.deepEqual(errors, []); console.log(JSON.stringify({ audio, rendering, errors }));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
