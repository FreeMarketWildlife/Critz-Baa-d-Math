import test from 'node:test';
import assert from 'node:assert/strict';
import { countingError, stepRage, countColor } from '../src/rules.js';
import { commitCrossing } from '../src/counting.js';
import { launchFlight, advanceFlight, flightIsGone } from '../src/physics.js';
import { BY_ID, createProgression, planEncounter } from '../src/flock.js';
import { runStats } from '../src/finale.js';
import { readFileSync } from 'node:fs';
for(const [label,before,after] of [['exact 130 ×2',130,260],['half',260,130],['red',130,129],['negative double',-130,-260],['through zero',-1,1],['fraction',3,1.5],['zero',0,0]]) {
  test(`${label}: entire legitimate interval is safe before and after midpoint, then expires`,()=>{
    const flight={...launchFlight(-1,()=>.5,8),before,result:after,entered:true};
    let target=before, rage=.99;
    const color=countColor(before,target);
    for(const dt of [.1,.05,.3,.008,.07,.472]) {
      advanceFlight(flight,dt); target=commitCrossing(flight,target);
      for(const count of [before,after,(before+after)/2]) {
        const error=countingError(count,target,[flight]);
        assert.equal(error,0);rage=stepRage(rage,error,10,dt);assert.ok(rage<1);
      }
    }
    assert.equal(target,before);assert.equal(countColor(before,target),color);
    advanceFlight(flight,8-flight.age);target=commitCrossing(flight,target);
    assert.equal(target,after);
    for(const count of [before,after,(before+after)/2])assert.equal(countingError(count,target,[flight]),0);
    assert.equal(countingError(Math.max(before,after)+5,target,[flight]),5);
    while(!flightIsGone(flight))advanceFlight(flight,.1);
    assert.equal(countingError(before,target,[]),Math.abs(before-after));
  });
}
test('invisible and removed flights cannot authorize future counts, and disjoint intervals do not fill their gap',()=>{
  const visible={before:130,result:260,entered:true};
  const hidden={before:260,result:520,entered:false};
  assert.equal(countingError(520,130,[visible,hidden]),260);
  assert.equal(countingError(400,130,[visible,{before:500,result:600,entered:true}]),100);
  assert.equal(countingError(200,130,[]),70);
});
test('mixed overlapping visible operations retain each bounded range through ordered crossings',()=>{
  const flights=[{before:130,result:260},{before:260,result:259},{before:259,result:129.5}].map((f,i)=>({...launchFlight(1,()=>.5,1+i*.2),...f,entered:true}));
  let target=130;
  for(let t=0;t<3;t+=.1){
    for(const flight of flights){advanceFlight(flight,.1);target=commitCrossing(flight,target);}
    for(const count of [130,200,260,259,129.5])assert.equal(countingError(count,target,flights),0);
    assert.ok(countingError(400,target,flights)>0);
  }
  assert.equal(target,129.5);
});
test('colors and score stay midpoint/perfect based; damage and levitation share range error',()=>{
  assert.notEqual(countColor(260,130),countColor(260,260));
  assert.deepEqual(runStats({sheep:2,perfect:1,perfectScore:150,peak:260,seconds:12}).score,470);
  const s=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
  assert.match(s,/const error = countingError\(count, target, orbs\)/);
  assert.match(s,/buildingRage = stepRage\(0, error/);
  assert.match(s,/rage = stepRage\(rage, error/);
  assert.match(s,/revealed = new Set\(\); cueUntil = 0/);
  assert.match(s,/if \(!revealed.has\(orb.op\)\)/);
  assert.match(s,/if \(!reducedMotion.matches\)/);
});
test('red and double debut at the next 26-second wave each; waves themselves stay unchanged',()=>{
  const state=createProgression();
  assert.equal(planEncounter(state,[],12,{elapsed:0},()=>0),'+1');
  assert.equal(state.nextWave,1);
  planEncounter(state,[],12,{elapsed:25.99},()=>0);assert.equal(state.index,1);
  assert.equal(planEncounter(state,[],12,{elapsed:26},()=>0),'−1');
  assert.equal(state.nextWave,2);
  planEncounter(state,[],12,{elapsed:51.99},()=>0);assert.equal(state.index,2);
  assert.equal(planEncounter(state,[],12,{elapsed:52},()=>0),'×2');
  assert.equal(BY_ID['−1'].weight,12);
});
test('first-entry emphasis animates once per type per run and honors reduced motion',()=>{
  const source=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
  const block=source.slice(source.indexOf('      if (!revealed.has(orb.op))'),source.indexOf("      $('operation').style.color"));
  const run=new Function('revealed','orb','type','elapsed','reducedMotion','$','displayOperation',`let cueUntil=0; ${block};return cueUntil;`);
  let animations=0;
  const nodes=Object.fromEntries(['encounter','double','halve'].map(id=>[id,{textContent:'',getAnimations:()=>[],animate(){animations++;}}]));
  const seen=new Set();
  assert.equal(run(seen,{op:'×2'},BY_ID['×2'],5,{matches:false},id=>nodes[id],x=>x),6.4);
  assert.equal(animations,2);
  run(seen,{op:'×2'},BY_ID['×2'],6,{matches:false},id=>nodes[id],x=>x);assert.equal(animations,2);
  run(seen,{op:'÷2'},BY_ID['÷2'],7,{matches:false},id=>nodes[id],x=>x);assert.equal(animations,4);
  run(new Set(),{op:'×2'},BY_ID['×2'],0,{matches:false},id=>nodes[id],x=>x);assert.equal(animations,6);
  run(new Set(),{op:'÷2'},BY_ID['÷2'],0,{matches:true},id=>nodes[id],x=>x);assert.equal(animations,6);
  assert.match(nodes.encounter.textContent,/NEW/);
});
