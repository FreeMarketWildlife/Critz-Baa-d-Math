import test from 'node:test';
import assert from 'node:assert/strict';
import { recoveryAt, waveInterval, createIntroductions, nextEncounter } from '../src/pacing.js';
import { launchFlight, advanceFlight, flightIsGone, previewTime, launchGap, FIXED_STEP } from '../src/physics.js';
import { chooseOperation, apply } from '../src/rules.js';

test('18-second swells and 8-second recoveries blend smoothly and repeat', () => {
  for (let cycle = 0; cycle < 20; cycle++) {
    const t = cycle * 26;
    assert.equal(recoveryAt(t + 17), 0);
    assert.equal(recoveryAt(t + 19), .5);
    assert.equal(recoveryAt(t + 22), 1);
    assert.equal(recoveryAt(t + 25), .5);
  }
  for (const boundary of [18, 20, 24, 26]) assert.ok(Math.abs(recoveryAt(boundary - .001) - recoveryAt(boundary + .001)) < .00001);
  assert.ok(waveInterval(74, 1) > waveInterval(65, 1) * 2);
  assert.ok(waveInterval(130, 1) < waveInterval(52, 1));
  for (let t = 0; t < 600; t++) for (const change of [-40, -1, 1, 40]) assert.ok(waveInterval(t, change) >= Math.abs(change) / 7 + .35);
});

test('reserve unseen types, drain existing sheep, and block followers until solo sheep leaves', () => {
  const state = createIntroductions();
  assert.equal(nextEncounter(state, [], () => '+1'), '+1');
  assert.equal(nextEncounter(state, [{}], () => '+1'), null);
  assert.equal(nextEncounter(state, [], () => '+1'), '+1');
  assert.equal(nextEncounter(state, [{}], () => '−1'), null);
  assert.equal(nextEncounter(state, [{}], () => { throw Error('must keep reserved debut'); }), null);
  assert.equal(nextEncounter(state, [], () => '+1'), '−1');
  assert.equal(nextEncounter(state, [{}], () => '+1'), null);
  assert.equal(nextEncounter(state, [], () => '+1'), '+1');
  assert.equal(createIntroductions().seen.size, 0);
});

test('ten-minute mixed flock preserves order, integer math, and every isolated debut', () => {
  const state = createIntroductions();
  let flights = [], planned = 0, next = .45, serial = 0, crossed = 0, seed = 47;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const types = new Set();
  for (let t = 0; t < 600; t += FIXED_STEP) {
    if (t >= next) {
      const op = nextEncounter(state, flights, () => chooseOperation(t, planned, random));
      if (op !== null) {
        if (!types.has(op)) assert.equal(flights.length, 0);
        if (flights.length) assert.equal(flights.some(f => f.debut), false);
        const result = apply(planned, op), change = result - planned, lead = previewTime(change);
        assert.ok(Number.isInteger(result));
        flights.push({ ...launchFlight(serial % 2 ? -1 : 1, random, lead), serial: serial++, debut: !types.has(op) });
        types.add(op); planned = result;
        next = t + launchGap(waveInterval(t, change), lead);
      }
    }
    for (const f of flights) if (advanceFlight(f, FIXED_STEP) && !f.crossed) { assert.equal(f.serial, crossed++); f.crossed = true; }
    flights = flights.filter(f => !flightIsGone(f));
  }
  assert.equal(types.size, 4);
  assert.ok(crossed > 200);
});
