import {test} from 'node:test';import assert from 'node:assert/strict';import {apply,chooseOperation,interval,stepRage,starsFor,tolerance} from '../src/rules.js';
test('all four operations apply to the running total',()=>{assert.equal(apply(8,'+1'),9);assert.equal(apply(8,'−1'),7);assert.equal(apply(8,'×2'),16);assert.equal(apply(8,'÷2'),4)});
test('first thirty sheep only add',()=>{for(let i=0;i<30;i++)assert.equal(chooseOperation(i,i,()=>.99),'+1')});
test('generated operations stay integer and reachable for long games',()=>{let value=0;for(let i=0;i<10000;i++){const op=chooseOperation(i,value);const next=apply(value,op);assert.ok(Number.isInteger(next));assert.ok(interval(i,next-value)>=Math.abs(next-value)/5+1.1);value=next}});
test('rage recovers near target, builds far away, and respects catch-up grace',()=>{assert.ok(stepRage(.5,0,10,1)<.5);assert.ok(stepRage(.5,10,10,1)>.5);assert.ok(stepRage(.5,20,10,1,true)<.5);assert.equal(stepRage(.99,20,10,1),1);assert.ok(tolerance(100)>tolerance(0))});
test('campaign star thresholds',()=>{assert.equal(starsFor(1),3);assert.equal(starsFor(.85),2);assert.equal(starsFor(.4),1)});

test('a sheep crosses before the next operation is generated',()=>{for(let i=0;i<1000;i++)assert.ok(interval(i,1)>1.6)});
