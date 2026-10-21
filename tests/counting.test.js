import test from 'node:test';
import assert from 'node:assert/strict';
import { commitCrossing, transformCount } from '../src/counting.js';
import { advanceFlight, launchFlight } from '../src/physics.js';
import { countColor, apply } from '../src/rules.js';
import { readFileSync } from 'node:fs';
test('midpoint alone commits mixed arithmetic, once, with variable frame lengths', () => {
  let total = 4;
  for (const op of ['×2','÷2','+1','×2','÷2']) {
    const flight = {...launchFlight(-1,()=>.5),result:apply(total,op)};
    const before = total, color = countColor(4,total);
    assert.equal(commitCrossing(flight,total),before);
    advanceFlight(flight,.799);
    assert.equal(commitCrossing(flight,total),before);
    assert.equal(countColor(4,total),color);
    advanceFlight(flight,.001);
    total = commitCrossing(flight,total);
    assert.equal(total,apply(before,op));
    advanceFlight(flight,.137);
    assert.equal(commitCrossing(flight,total),total);
  }
  assert.equal(total,5);
});
test('several crossings in a long frame commit in flight order without duplication',()=>{
  const flights=[{op:'×2',result:8},{op:'÷2',result:4},{op:'+1',result:5}].map(f=>({...launchFlight(1,()=>.5),...f}));
  let total=4;
  for(const f of flights){advanceFlight(f,1.1);total=commitCrossing(f,total);}
  assert.equal(total,5);
  for(const f of flights) total=commitCrossing(f,total);
  assert.equal(total,5);
});
test('math shortcuts preserve odd fractions, negatives, zero and actual target',()=>{
  for(const n of [0,1,3,-1,-3,99999]){
    assert.equal(transformCount(n,'×2'),n*2);
    assert.equal(transformCount(n,'÷2'),n/2);
  }
  assert.equal(transformCount(Number.MAX_SAFE_INTEGER,'×2'),Number.MAX_SAFE_INTEGER);
});
test('unlock handlers are independent and every new run hides both',()=>{
  const source=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
  const unlock=source.match(/if \(orb.op === '×2'\)[^\n]+\n\s*if \(orb.op === '÷2'\)[^\n]+/)[0];
  for(const op of ['+1','×2','÷2']){
    const nodes={double:{hidden:true},halve:{hidden:true}};
    new Function('orb','$',unlock)({op},id=>nodes[id]);
    assert.equal(nodes.double.hidden,op!=='×2');assert.equal(nodes.halve.hidden,op!=='÷2');
  }
  assert.match(source,/function begin[\s\S]*?\$\('double'\).hidden = \$\('halve'\).hidden = true/);
  const entry=source.slice(source.indexOf('if (enterFlight'),source.indexOf('if (crossedNow'));
  assert.doesNotMatch(entry,/target\s*=/);
});
