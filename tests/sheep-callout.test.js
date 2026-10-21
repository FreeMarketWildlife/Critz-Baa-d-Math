import test from 'node:test';
import assert from 'node:assert/strict';
import { perfectBubble } from '../src/sheep-callout.js';
test('only a sheep awarded a perfect at its crossing gets a speech bubble', () => {
  const orb = { x: .5, y: .4, vx: .5, age: .8 };
  assert.equal(perfectBubble(orb, 390, 844, 29), null);
  orb.perfectAt = .8;
  assert.equal(perfectBubble(orb, 390, 844, 29).opacity, 1);
  orb.age += 1.1; assert.equal(perfectBubble(orb, 390, 844, 29), null);
});
test('the bubble travels with its sheep in both directions and remains inside phone and landscape viewports', () => {
  for (const [w, h] of [[390,844],[844,390],[1440,900]]) for (const vx of [-.5,.5]) {
    const orb = { x: .5, y: .4, vx, age: .9, perfectAt: .8 };
    const first = perfectBubble(orb, w, h, 29);
    orb.x += vx * .2;
    const second = perfectBubble(orb, w, h, 29);
    assert.equal(Math.sign(second.x - first.x), Math.sign(vx));
    for (const x of [.02,.98]) {
      orb.x = x; const bubble = perfectBubble(orb, w, h, 29);
      assert.ok(bubble.x >= 0 && bubble.x + bubble.width <= w);
      assert.ok(bubble.y >= 0 && bubble.y + bubble.height <= h);
    }
  }
});
