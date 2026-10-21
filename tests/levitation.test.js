import test from 'node:test';
import assert from 'node:assert/strict';
import { createLevitation, stepLevitation, cameraHeight } from '../src/levitation.js';
const advance = (s, seconds, rage = false) => {
  let penalty = 0;
  for (let i = 0; i < Math.round(seconds * 120); i++) penalty += stepLevitation(s, 1 / 120, rage);
  return penalty;
};
test('sleep on the ground for fifteen continuous calm seconds, then climb without a ceiling', () => {
  const s = createLevitation();
  advance(s, 14.5); assert.equal(s.height, 0);
  advance(s, 1, true); assert.equal(s.calm, 0);
  advance(s, 14.5); assert.equal(s.height, 0);
  advance(s, 1); assert.ok(s.height > 0);
  const liftoff = s.height; assert.ok(liftoff < .002);
  advance(s, 60); const orbit = s.height; assert.ok(orbit > .6 && orbit < 2);
  advance(s, 300); assert.ok(s.height > orbit + 5);
  assert.ok(Math.abs(s.height - cameraHeight(s.height) - .32) < 1e-10);
});
test('a broken airborne streak falls under gravity and lands without adding any rage', () => {
  const s = createLevitation(); advance(s, 80);
  const top = s.height;
  assert.equal(stepLevitation(s, 1 / 120, true), 0);
  assert.equal(s.falling, true); assert.ok(s.height < top); assert.equal(s.calm, 0);
  // Recovering the count cannot cancel an in-progress fall.
  advance(s, .2); assert.equal(s.falling, true);
  let penalty = 0;
  while (s.falling) penalty += stepLevitation(s, 1 / 120, true);
  assert.equal(penalty, 0); assert.equal(s.height, 0);
  assert.equal(advance(s, 1, true), 0);
  advance(s, 14.5); assert.equal(s.height, 0);
  advance(s, 1); assert.ok(s.height > 0);
});
test('grounded mistakes reset the streak without adding a fall penalty; new runs start grounded', () => {
  const s = createLevitation(); advance(s, 9);
  assert.equal(advance(s, 1, true), 0); assert.equal(s.calm, 0); assert.equal(s.falling, false);
  assert.deepEqual(createLevitation(), { calm: 0, height: 0, velocity: 0, falling: false, fallTime: 0, impact: 0 });
});

test('a fall hangs briefly before accelerating into a dramatic plunge', () => {
  const s = createLevitation(); s.height = 2;
  stepLevitation(s, 1 / 120, true);
  advance(s, .5);
  assert.ok(2 - s.height < .01);
  advance(s, 1);
  assert.ok(s.velocity < -.3);
  assert.equal(s.falling, true);
});
