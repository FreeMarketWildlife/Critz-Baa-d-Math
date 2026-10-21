import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runStats } from '../src/finale.js';
const source = readFileSync(new URL('../src/game.js', import.meta.url), 'utf8');
const body = source.match(/function showResult\(\) \{([\s\S]*?)\n\}/)[1];
for (const [label, count, target] of [['correct',12,12],['incorrect',8,12],['zero',0,0],['negative',-12,-10],['large',1000000,999999]]) {
  test(`results distinguish final count from arithmetic sheep total: ${label}`, () => {
    const nodes = Object.fromEntries(['stars','resultCount','resultSheep','again'].map(id => [id,{textContent:'',focus(){}}]));
    new Function('$','runStats','count','target',`let status; const screens=()=>{}; const n=7, perfectHits=2, peak=99, elapsed=12.9, perfectScore=150; ${body}`)(id=>nodes[id],runStats,count,target);
    assert.equal(nodes.stars.textContent,'970');
    assert.equal(nodes.resultCount.textContent,count.toLocaleString());
    assert.equal(nodes.resultSheep.textContent,target.toLocaleString());
  });
}
