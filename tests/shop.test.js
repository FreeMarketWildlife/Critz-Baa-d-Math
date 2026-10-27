import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, DEFAULTS, readShop, selectItem, earnCrit } from '../src/shop.js';
const memory = () => { let value;return {getItem:()=>value,setItem:(k,v)=>{value=v;}}; };
test('fresh and corrupt saves preserve the entire original look and no trail',()=>{
  assert.deepEqual(readShop().equipped,DEFAULTS);
  const storage=memory();storage.setItem('', 'bad json');assert.equal(readShop(storage).balance,0);
  storage.setItem('',JSON.stringify({balance:-1,earned:'5',equipped:{effect:'stardust',trail:'fire'},owned:['effect:missing']}));
  storage.setItem('',JSON.stringify({balance:-1,owned:42}));
  const state=readShop(storage);assert.deepEqual(state.equipped,DEFAULTS);assert.equal(state.balance,0);
});
test('Crit rewards are difficulty weighted, survive reload, and are not spent as score',()=>{
  const storage=memory(),state=readShop(storage);
  assert.equal(earnCrit(state,50,storage),1);assert.equal(earnCrit(state,125,storage),3);assert.equal(earnCrit(state,2500,storage),50);
  assert.equal(readShop(storage).balance,54);assert.equal(state.earned,54);
});
test('purchases enforce balance, charge once, equip and persist; default items stay free',()=>{
  const storage=memory(),state=readShop(storage);
  assert.equal(selectItem(state,'effect','ripple',storage),false);
  assert.equal(selectItem(state,'effect','missing',storage),false);
  earnCrit(state,2500,storage);
  assert.equal(selectItem(state,'effect','ripple',storage),true);assert.equal(state.balance,15);
  assert.equal(selectItem(state,'effect','bloom',storage),true);assert.equal(selectItem(state,'effect','ripple',storage),true);assert.equal(state.balance,15);
  assert.equal(readShop(storage).equipped.effect,'ripple');assert.equal(readShop(storage).earned,50);
  assert.equal(state.owned.filter(i=>i==='effect:ripple').length,1);
});
test('every category has a free default and every cosmetic can be bought, restored and removed',()=>{
  const storage=memory(),state=readShop(storage);state.balance=100000;
  assert.equal(CATALOG.filter(i=>i.category==='effect').length,5);
  assert.equal(new Set(CATALOG.map(i=>`${i.category}:${i.id}`)).size,CATALOG.length);
  for(const entry of CATALOG) {assert.ok(selectItem(state,entry.category,entry.id,storage));assert.equal(readShop(storage).equipped[entry.category],entry.id);}
  for(const [category,id] of Object.entries(DEFAULTS))assert.ok(selectItem(state,category,id,storage));
  assert.deepEqual(readShop(storage).equipped,DEFAULTS);
});
test('denied storage does not prevent earning, buying, or equipping this session',()=>{
  const storage={getItem(){throw Error();},setItem(){throw Error();}};const state=readShop(storage);
  earnCrit(state,2500,storage);assert.ok(selectItem(state,'trail','rainbow',storage));assert.equal(state.balance,5);
});

test('legacy moon colors and Crescent purchases migrate without changing wallet or charging again',()=>{
  const storage=memory();
  storage.setItem('',JSON.stringify({balance:321,earned:500,owned:['moon:rose','moon:crescent'],equipped:{moon:'crescent'}}));
  let state=readShop(storage);assert.equal(state.balance,321);assert.equal(state.earned,500);
  assert.equal(state.equipped.moon,'full');assert.equal(state.equipped.phase,'waning-crescent');
  assert.ok(selectItem(state,'moon','rose',storage));assert.equal(state.balance,321);assert.equal(state.equipped.phase,'waning-crescent');
  assert.ok(selectItem(state,'phase','full',storage));assert.ok(selectItem(state,'phase','waning-crescent',storage));
  state=readShop(storage);assert.equal(state.equipped.moon,'rose');assert.equal(state.equipped.phase,'waning-crescent');assert.equal(state.balance,321);
});
