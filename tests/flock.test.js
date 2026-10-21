import test from 'node:test';
import assert from 'node:assert/strict';
import { FLOCK, BY_ID, resultOf, eligible, createProgression, planEncounter } from '../src/flock.js';
import { countTime, encounterPreview, newHold, stepHold } from '../src/controls.js';
import { launchFlight, advanceFlight, flightIsGone, launchGap, FIXED_STEP } from '../src/physics.js';
import { waveInterval } from '../src/pacing.js';
import { recordSheep, readCollection } from '../src/collection.js';
import { runStats } from '../src/finale.js';
const rng = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

test('all ten additions and negative space variants have distinct identities, arithmetic, and rewards', () => {
  assert.equal(FLOCK.length, 22);assert.equal(new Set(FLOCK.map(s=>s.id)).size,22);
  const outcomes = {'+2':14,'−2':10,'+5':17,'×3':36,'⅓':4,'⅔':8,'¼':3,'¾':9,'↺0':0,'×−1':-12,'×−2':-24,'×−3':-36,'−½':-6,'−⅓':-4,'−⅔':-8,'−¼':-3,'−¾':-9,'×0':0};
  for (const [id, value] of Object.entries(outcomes)) assert.equal(resultOf(12,id),value,id);
  assert.ok(BY_ID['¾'].bonus>BY_ID['+1'].bonus);assert.ok(BY_ID['×0'].bonus>BY_ID['×−3'].bonus);
  for(const s of FLOCK.filter(s=>s.bonus>=300))assert.ok(s.slow>=1.8);
});

test('ground arithmetic never goes negative; fractions stay integral and negative types require space', () => {
  for(const value of [0,1,2,3,4,12,123,1000])for(const type of FLOCK) {
    if(eligible(type,value,{elapsed:500,height:1}))assert.ok(Number.isInteger(type.math(value))&&type.math(value)>=0);
    if(type.space)assert.equal(eligible(type,value,{elapsed:500,height:1}),false);
  }
  assert.equal(eligible(BY_ID['⅔'],7),false);
  assert.equal(eligible(BY_ID['−½'],-12,{space:true}),true);
  assert.equal(resultOf(-12,'−½'),6);
  for(const context of [{elapsed:180,height:4},{elapsed:181,height:0}]) assert.equal(eligible(BY_ID['×0'],12,context),false);
  assert.equal(eligible(BY_ID['×0'],12,{elapsed:181,height:.01}),true);
});

test('curriculum never skips a type, waits 2–3 waves, and isolates the whole debut flight', () => {
  const state=createProgression(), debuts=[];
  let elapsed=.45;
  for (const type of FLOCK) {
    elapsed=Math.max(elapsed,state.nextWave*26);
    // Every type is meaningful and divisible at 12; zero is not forced to teach a fraction.
    const context={elapsed,height:4,space:true};
    if(type.legendary) {
      assert.notEqual(planEncounter(state,[],12,context,()=>.5),'×0');
    }
    const oldSize=state.seen.size;
    assert.equal(planEncounter(state,[{}],12,context,()=>0),null);
    assert.equal(state.seen.size,oldSize);
    const id=planEncounter(state,[],12,context,()=>0);
    assert.equal(id,type.id);debuts.push({id,wave:Math.floor(elapsed/26)});
    assert.equal(planEncounter(state,[{}],12,context,()=>0),null);
    state.solo=false;
    const early={...context,elapsed:elapsed+26};
    const before=state.index;planEncounter(state,[],12,early,()=>.5);assert.equal(state.index,before);
    elapsed+=26;
  }
  for(let i=1;i<debuts.length;i++)assert.ok([2,3].includes(debuts[i].wave-debuts[i-1].wave));
  assert.deepEqual(debuts.map(s=>s.id),FLOCK.map(s=>s.id));
});

test('seeded long runs retain isolated introductions, arithmetic ordering, and an upward total trend', () => {
  for(let seed=1;seed<=8;seed++) {
    const random=rng(seed),state=createProgression();
    let flights=[],value=0,next=.45,serial=0,crossed=0,previousWave=-3,lastIndex=0;
    for(let t=0;t<1400;t+=FIXED_STEP) {
      if(t>=next) {
        const id=planEncounter(state,flights,value,{elapsed:t,height:t/60,space:t>205},random);
        if(id!==null) {
          const type=BY_ID[id],after=type.math(value),change=after-value;
          assert.ok(Number.isSafeInteger(after));if(t<=205)assert.ok(after>=0);
          if(state.index!==lastIndex) {
            assert.equal(flights.length,0);assert.ok(Math.floor(t/26)-previousWave>=2||serial===0);
            previousWave=Math.floor(t/26);lastIndex=state.index;
          } else assert.equal(flights.some(f=>f.debut),false);
          const lead=encounterPreview(type,change);
          flights.push({...launchFlight(serial%2?-1:1,random,lead),serial:serial++,debut:state.solo});
          value=after;next=t+launchGap(waveInterval(t,0)+Math.max(0,countTime(change)-.4),lead);
        }
      }
      for(const f of flights)if(advanceFlight(f,FIXED_STEP)&&!f.crossed){assert.equal(f.serial,crossed++);f.crossed=true;}
      flights=flights.filter(f=>!flightIsGone(f));
    }
    assert.ok(state.seen.size>=14);assert.ok(serial>150);
  }
  // Expected drift across the full ground flock is upward even at large totals.
  for(const value of [12,120,1200]) {
    const state=createProgression();state.seen=new Set(FLOCK.filter(s=>!s.space&&!s.legendary).map(s=>s.id));state.index=13;state.nextWave=99999;
    const random=rng(567);let sum=0;
    for(let i=0;i<20000;i++)sum+=resultOf(value,planEncounter(state,[],value,{elapsed:300,height:0},random))-value;
    assert.ok(sum>0,`upward expected drift at ${value}: ${sum}`);
  }
});

test('hold waits .5s, accelerates at 1/3s, and does not depend on frame rate', () => {
  const totals=[];
  for(const step of [1/120,1/60,1/20]) {
    const hold=newHold();let taps=0;
    stepHold(hold,.499,()=>taps++);assert.equal(taps,0);
    stepHold(hold,.001,()=>taps++);assert.equal(taps,1);
    for(let t=.5;t<4-1e-8;t+=step)stepHold(hold,step,()=>taps++);
    totals.push(taps);
  }
  assert.ok(Math.max(...totals)-Math.min(...totals)<=1);
  assert.ok(totals[0]>130);
  assert.ok(countTime(1000)>3&&countTime(1000)<20);
});

test('collection survives reload, rejects corrupt data, and difficulty bonuses reach final score', () => {
  const storage={value:null,getItem(){return this.value},setItem(key,value){this.value=value}};
  const data={};recordSheep(data,'¾',false,storage);recordSheep(data,'¾',true,storage);
  assert.deepEqual(readCollection(storage)['¾'],{seen:1,perfect:1});
  const stats=runStats({sheep:2,perfect:2,peak:20,seconds:10,perfectScore:750});assert.equal(stats.score,1050);
  storage.value='{broken';assert.deepEqual(readCollection(storage),{});
});

test('even extreme jumps leave enough visible preview for accelerated holds on phone and desktop', () => {
  for(const [width,height] of [[390,844],[1365,900]]) for(const type of [BY_ID['×3'],BY_ID['−¾'],BY_ID['×0']]) for(const change of [3,100,1000,50000]) {
    const flight=launchFlight(-1,()=>.5,encounterPreview(type,change));
    let entry=0;
    while(flight.y*height-Math.max(25,Math.min(width*.075,38))*1.15>height) {advanceFlight(flight,FIXED_STEP);entry=flight.age;}
    assert.ok(flight.crossingTime-entry>=countTime(change),`${type.id} ${change}`);
  }
});
