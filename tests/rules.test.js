import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, chooseOperation, interval, catchUpGrace, stepRage, starsFor, tolerance } from '../src/rules.js';
import { launchFlight, advanceFlight, flightIsGone, CROSSING_TIME, FIXED_STEP } from '../src/physics.js';

function seeded(seed = 17) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('all four operations apply to the running total', () => {
  assert.equal(apply(8, '+1'), 9); assert.equal(apply(8, '−1'), 7);
  assert.equal(apply(8, '×2'), 16); assert.equal(apply(8, '÷2'), 4);
});
test('short warm-up introduces all operations within the opening fifteen sheep', () => {
  for (let i = 0; i < 5; i++) assert.equal(chooseOperation(i, i, () => .99), '+1');
  assert.equal(chooseOperation(5, 6, () => .99), '−1');
  assert.equal(chooseOperation(8, 6, () => .99), '×2');
  assert.equal(chooseOperation(12, 6, () => .99), '÷2');
});
test('new pacing ramps quickly but large arithmetic changes retain a tap budget', () => {
  assert.ok(interval(25, 1) < .6);
  assert.ok(interval(25, 1) < interval(0, 1) / 2);
  for (let n = 0; n < 200; n++) for (let change = -32; change <= 32; change++) {
    assert.ok(interval(n, change) >= Math.abs(change) / 7 + .35);
    assert.ok(interval(n, change) > catchUpGrace(change));
  }
});
test('rage rises without tapping, recovers when close, and does not heal errors during grace', () => {
  assert.ok(stepRage(.5, 0, 10, 1) < .5);
  assert.ok(stepRage(.5, 10, 10, 1) > .5);
  assert.equal(stepRage(.5, 20, 10, 1, true), .5);
  assert.equal(stepRage(.99, 20, 10, 1), 1);
  assert.ok(tolerance(100) > tolerance(0));
  let rage = 0;
  for (let i = 0; i < 10; i++) rage = stepRage(rage, 6, 10, .28);
  assert.ok(rage > .8, 'fast launches cannot grant permanent immunity');
});
test('campaign star thresholds', () => {
  assert.equal(starsFor(1), 3); assert.equal(starsFor(.85), 2); assert.equal(starsFor(.4), 1);
});
test('both sides follow ballistic motion, cross once at the same time, and fall offscreen', () => {
  const random = seeded();
  for (const side of [-1, 1]) for (let flight = 0; flight < 50; flight++) {
    const body = launchFlight(side, random), initial = { ...body };
    let crossings = 0, rising = false, falling = false;
    while (!flightIsGone(body)) {
      if (advanceFlight(body, FIXED_STEP)) {
        crossings++;
        assert.ok(Math.abs(body.age - CROSSING_TIME) <= FIXED_STEP + 1e-9);
        assert.ok(Math.abs(body.x - .5) < .006);
        assert.ok(body.y > .32 && body.y < .51);
      }
      rising ||= body.vy < 0; falling ||= body.vy > 0;
      assert.ok(body.age < 3, 'flight must return below the floor');
    }
    assert.equal(crossings, 1); assert.ok(rising && falling);
    assert.ok(Math.abs(body.y - (initial.y + initial.vy * body.age + .5 * initial.gravity * body.age ** 2)) < 1e-10);
  }
});
test('dense overlapping flights preserve arithmetic order and whole-number divisions', () => {
  const random = seeded(93);
  let planned = 0, target = 0, spawned = 0, crossed = 0, clock = 0, next = 0, maxAirborne = 0;
  const seen = new Set(); let bodies = [];
  while (crossed < 2000) {
    clock += FIXED_STEP;
    if (clock >= next && spawned < 2000) {
      const op = chooseOperation(spawned, planned, random), after = apply(planned, op);
      bodies.push({ ...launchFlight(spawned % 2 ? -1 : 1, random), op, expected: after, index: spawned });
      next = clock + interval(spawned + 1, after - planned); planned = after; spawned++;
    }
    maxAirborne = Math.max(maxAirborne, bodies.length);
    for (const body of bodies) if (advanceFlight(body, FIXED_STEP)) {
      assert.equal(body.index, crossed);
      target = apply(target, body.op); crossed++;
      assert.equal(target, body.expected); assert.ok(Number.isInteger(target)); seen.add(body.op);
    }
    bodies = bodies.filter(body => !flightIsGone(body));
  }
  assert.ok(maxAirborne >= 3); assert.equal(seen.size, 4); assert.equal(target, planned);
});

test('three-minute runs remain physically achievable at seven taps per second', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const random = seeded(seed);
    let planned = 0, target = 0, player = 0, spawned = 0, clock = 0, next = 0, grace = 0, rage = 0, tapAt = 0;
    let bodies = [];
    while (clock < 180) {
      clock += FIXED_STEP;
      if (clock >= next) {
        const op = chooseOperation(spawned, planned, random), after = apply(planned, op);
        bodies.push({ ...launchFlight(spawned % 2 ? -1 : 1, random), op });
        next = clock + interval(spawned + 1, after - planned); planned = after; spawned++;
      }
      for (const body of bodies) if (advanceFlight(body, FIXED_STEP)) {
        const before = target; target = apply(target, body.op);
        grace = clock + catchUpGrace(target - before);
        tapAt = Math.max(tapAt, clock + .12);
      }
      bodies = bodies.filter(body => !flightIsGone(body));
      if (clock >= tapAt && player !== target) { player += Math.sign(target - player); tapAt = clock + 1 / 7; }
      rage = stepRage(rage, Math.abs(player - target), tolerance(spawned), FIXED_STEP, clock <= grace);
      assert.ok(rage < 1, `seed ${seed} lost at ${clock.toFixed(2)}s`);
    }
    assert.ok(spawned > 100);
  }
});
