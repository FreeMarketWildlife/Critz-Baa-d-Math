import test from 'node:test';
import assert from 'node:assert/strict';
import { attackBeat, FINALE_DURATION, runStats } from '../src/finale.js';
test('every frozen sheep gets a bite before the gulp and result, even in a crowded sky', () => {
  assert.ok(FINALE_DURATION < 3);
  for (const count of [0, 1, 4, 20]) {
    const visited = new Set();
    for(let t=.65;t<1.7;t+=1/120) visited.add(attackBeat(t,count).index);
    for(let i=0;i<count;i++) assert.ok(visited.has(i));
  }
});
test('survival score rewards sheep and perfect timing without confusing the arithmetic total with sheep', () => {
  assert.deepEqual(runStats({sheep:12,perfect:8,peak:37,seconds:21.9}),{sheep:12,perfect:8,peak:37,seconds:21.9,score:1810});
  assert.equal(runStats({sheep:0,perfect:0,peak:0,seconds:0}).score,0);
});
