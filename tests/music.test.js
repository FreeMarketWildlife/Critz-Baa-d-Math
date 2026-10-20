import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lullabyScore, LOOP_LENGTH, BAR, slowArithmetic, Lullaby, musicRoom } from '../src/music.js';
import { DreamSounds, cMajorVoices } from '../src/sound.js';
import { creditCountedSheep } from '../src/rules.js';

test('original lullaby is a sorted sixteen-bar loop with bounded voices and C-major harmony', () => {
  const score = lullabyScore(); assert.equal(LOOP_LENGTH, BAR * 16); assert.ok(score.length > 150);
  const scale = new Set([0, 2, 4, 5, 7, 9, 11]);
  for (const [i, event] of score.entries()) {
    const note = Math.round(69 + 12 * Math.log2(event.frequency / 440));
    assert.ok(scale.has(((note % 12) + 12) % 12));
    assert.ok(event.time >= 0 && event.time < LOOP_LENGTH); assert.ok(event.duration > 0);
    assert.ok(event.frequency >= 60 && event.frequency <= 1100);
    assert.ok(event.volume > 0 && event.volume < .2);
    if (i) assert.ok(event.time >= score[i - 1].time);
  }
});
test('a perfect continues the tap melody and its crossing cannot double-advance it', () => {
  const sounds = new DreamSounds(), notes = [];
  sounds.note = (...args) => notes.push(args);
  const checkStep = (step, action) => {
    notes.length = 0; action();
    assert.deepEqual(notes.map(args => args[0]), cMajorVoices(step).filter(v => v.gain > .002).map(v => v.frequency));
  };
  checkStep(0, () => sounds.tap(1)); checkStep(1, () => sounds.perfect());
  notes.length = 0; sounds.cross('+1', { perfect: true }); assert.equal(notes.length, 0);
  checkStep(2, () => sounds.tap(1)); checkStep(3, () => sounds.cross('×2'));
  assert.equal(sounds.tapStep, 4);
  checkStep(3, () => sounds.tap(-1)); checkStep(3, () => sounds.perfect());
});
test('room focus lasts through overlapping slow arithmetic and releases on crossing', () => {
  const times = [{ op: '×2', crossingTime: 2, crossed: false }, { op: '÷2', crossingTime: 1.4, crossed: false }];
  assert.equal(slowArithmetic(times), true); times[0].crossed = true;
  assert.equal(slowArithmetic(times), true); times[1].crossed = true;
  assert.equal(slowArithmetic(times), false);
  assert.equal(slowArithmetic([{ op: '+1', crossingTime: 2, crossed: false }]), false);
  assert.equal(slowArithmetic([{ op: '÷2', crossingTime: .8, crossed: false }]), false);
});
test('counted expressions attach to the specific chronological sheep and persist', () => {
  const sheep = [{ result: 2, crossed: true }, { result: 3, crossed: true }, { result: 4, crossed: false }, { result: 3, crossed: false }];
  creditCountedSheep(sheep, 3);
  assert.equal(sheep[1].counted, true); assert.equal(sheep[3].counted, undefined);
  creditCountedSheep(sheep, 4); assert.equal(sheep[2].counted, true);
  creditCountedSheep(sheep, 99); assert.equal(sheep[1].counted, true); assert.equal(sheep[2].counted, true);
  creditCountedSheep([], 0);
});

class Param {
  constructor() { this.value = 0; this.events = []; }
  setValueAtTime(...args) { this.events.push(['value', ...args]); }
  linearRampToValueAtTime(...args) { this.events.push(['linear', ...args]); }
  exponentialRampToValueAtTime(...args) { this.events.push(['exponential', ...args]); }
  setTargetAtTime(...args) { this.events.push(['target', ...args]); }
  cancelScheduledValues(...args) { this.events.push(['cancel', ...args]); }
  cancelAndHoldAtTime(...args) { this.events.push(['hold', ...args]); }
}
function fakeContext() {
  const node = () => ({ gain: new Param(), frequency: new Param(), Q: new Param(), delayTime: new Param(),
    connect(target) { return target; }, disconnect() {}, start() {}, stop() {} });
  return { currentTime: 0, state: 'running', createGain: node, createOscillator: node, createBiquadFilter: node, createDelay: node };
}
test('music filter glides in both directions without altering the score clock', () => {
  const context = fakeContext(), room = musicRoom(context, context.createGain());
  room.focus(true); room.focus(false);
  const targets = room.filter.frequency.events.filter(event => event[0] === 'target');
  assert.deepEqual(targets, [['target', 480, 0, .27], ['target', 9000, 0, .48]]);
  const music = new Lullaby(context, context.createGain()); music.start();
  const origin = music.origin; music.update(true); music.update(false); assert.equal(music.origin, origin);
});
test('music loops, pauses at its position, resumes without backlog, and resets on replay', () => {
  const context = fakeContext(), music = new Lullaby(context, context.createGain()); music.start();
  for (let time = 0; time < LOOP_LENGTH * 3; time += .05) {
    context.currentTime = time; music.update(time % 10 < 3);
    assert.ok(music.voices.size < 100);
  }
  const before = context.currentTime - music.origin; music.pause();
  assert.equal(music.active, false); assert.equal(music.voices.size, 0); assert.ok(Math.abs(music.position - before) < 1e-8);
  context.currentTime += 12; music.resume(); assert.equal(music.active, true);
  assert.ok(Math.abs(context.currentTime + .05 - music.origin - before) < 1e-8);
  music.start(); assert.equal(music.position, 0); assert.equal(music.cycle, 0);
});

test('a muted start, later unmute, paused sound preview, and resume keep one music instance', () => {
  const context = fakeContext(); context.state = 'suspended';
  context.destination = context.createGain();
  context.createDynamicsCompressor = () => ({ ...context.createGain(), threshold: new Param(), ratio: new Param() });
  context.resume = () => { context.state = 'running'; return Promise.resolve(); };
  context.suspend = () => { context.state = 'suspended'; return Promise.resolve(); };
  const previousWindow = globalThis.window;
  globalThis.window = { AudioContext: function () { return context; } };
  try {
    const sounds = new DreamSounds(); sounds.enabled = false; sounds.start();
    assert.equal(sounds.music, null); sounds.toggle();
    const music = sounds.music; assert.ok(music.active); sounds.updateMusic(true);
    sounds.pause(); assert.equal(music.active, false);
    sounds.toggle(); sounds.toggle(); assert.equal(music.active, false);
    sounds.resume(); assert.equal(sounds.music, music); assert.equal(music.active, true);
    sounds.stopMusic(); assert.equal(music.active, false);
  } finally { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; }
});
