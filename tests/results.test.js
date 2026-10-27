import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runStats } from '../src/finale.js';
import { sheepScore, resultTally } from '../src/results.js';
const source = readFileSync(new URL('../src/game.js', import.meta.url), 'utf8');
const body = source.match(/function showResult\(\) \{([\s\S]*?)\n\}/)[1];
for (const [label, count, target] of [['correct',12,12],['incorrect',8,12],['zero',0,0],['negative',-12,-10],['large',1000000,999999]]) {
  test(`results distinguish final count from arithmetic sheep total: ${label}`, () => {
    const nodes = Object.fromEntries(['stars','resultCount','resultSheep','resultCritz','again'].map(id => [id,{textContent:'',focus(){}}]));
    new Function('$','runStats','count','target',`let status; let resultAge=0,lastTallyBeat=-1,tallyComplete=false; const renderResultTally=()=>{}; const screens=()=>{}; const n=7, perfectHits=2, peak=99, elapsed=12.9, perfectScore=150, runCritz=3, shop={balance:3}; ${body}`)(id=>nodes[id],runStats,count,target);

    assert.equal(nodes.resultCount.textContent,count.toLocaleString());
    assert.equal(nodes.resultSheep.textContent,target.toLocaleString());
  });
}

test('live sheep score excludes survival time and keeps the Crit bonus',()=>{
  assert.equal(sheepScore(7,150),850);
  assert.equal(runStats({sheep:7,perfect:2,peak:99,seconds:12.9,perfectScore:150}).score,970);
});
test('result tally starts with sheep score, adds time monotonically and ends at the exact final total',()=>{
  for(const seconds of [0,.9,12.9,3600.9]) {
    const base=850,final=base+Math.floor(seconds)*10;
    assert.equal(resultTally(base,seconds,0).score,base);
    let previous=base;
    for(let t=0;t<3;t+=.013){const tally=resultTally(base,seconds,t);assert.ok(tally.score>=previous&&tally.score<=final);assert.equal(tally.score+tally.remaining,final);previous=tally.score;}
    assert.equal(resultTally(base,seconds,3).score,final);
    assert.equal(resultTally(base,seconds,3).done,true);
    assert.equal(resultTally(base,seconds,0,true).score,final);
  }
});
