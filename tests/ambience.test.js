import test from 'node:test';
import assert from 'node:assert/strict';
import { CricketAmbience } from '../src/ambience.js';
function context() {
  const param = () => ({ value: 0, events: [], setValueAtTime(...a) { this.events.push(['value', ...a]); }, linearRampToValueAtTime(...a) { this.events.push(['linear', ...a]); }, exponentialRampToValueAtTime(...a) { this.events.push(['exp', ...a]); }, setTargetAtTime(...a) { this.events.push(['target', ...a]); }, cancelScheduledValues() {} });
  const node = () => ({ gain: param(), frequency: param(), connect(n) { return n; }, disconnect() {}, start() {}, stop() {} });
  return { currentTime: 0, state: 'running', createGain: node, createOscillator: node };
}
test('crickets stay intermittent, fade away from the field, and stop on pause without replaying a backlog', () => {
  const c = context(), ambience = new CricketAmbience(c, c.createGain());
  ambience.start();
  for (let time = 0; time < 60; time += .05) {
    c.currentTime = time; ambience.update(); assert.ok(ambience.voices.size <= 2);
  }
  assert.ok(ambience.call > 20 && ambience.call < 40);
  ambience.update(8);
  const target = ambience.output.gain.events.at(-1);
  assert.equal(target[0], 'target'); assert.ok(target[1] < .001);
  ambience.stop(); assert.equal(ambience.active, false); assert.equal(ambience.voices.size, 0);
  const calls = ambience.call; c.currentTime += 100; ambience.update(); assert.equal(ambience.call, calls);
  ambience.resume(); ambience.update(); assert.equal(ambience.call, calls);
  c.currentTime += .3; ambience.update(); assert.equal(ambience.call, calls + 1);
  ambience.start(); assert.equal(ambience.call, 0);
});
