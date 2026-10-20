// Small synthesized toys: no downloads, audio files, or background music.
// The context is created/resumed only by a start, resume, or sound-button gesture.
export class DreamSounds {
  constructor() {
    this.enabled = true;
    try { this.enabled = localStorage.getItem('baad-sound') !== 'off'; } catch {}
    this.context = null;
    this.lastBaa = -1;
    this.lastWarning = -1;
  }
  unlock() {
    if (!this.enabled) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      if (!this.context) {
        this.context = new Context();
        this.master = this.context.createGain(); this.master.gain.value = .32;
        const limiter = this.context.createDynamicsCompressor();
        limiter.threshold.value = -18; limiter.ratio.value = 8;
        this.master.connect(limiter); limiter.connect(this.context.destination);
      }
      this.context.resume().catch(() => {});
    } catch { /* The game also works without audio hardware. */ }
  }
  toggle() {
    this.enabled = !this.enabled;
    try { localStorage.setItem('baad-sound', this.enabled ? 'on' : 'off'); } catch {}
    if (this.enabled) this.unlock();
    else if (this.context) this.context.suspend().catch(() => {});
  }
  note(frequency, duration = .15, delay = 0, type = 'sine', volume = .18, end = frequency) {
    const c = this.context;
    if (!this.enabled || !c || c.state !== 'running') return;
    const start = c.currentTime + delay, osc = c.createOscillator(), gain = c.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain).connect(this.master); osc.start(start); osc.stop(start + duration + .02);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  start() { this.unlock(); [392, 494, 587, 784].forEach((n, i) => this.note(n, .26, i * .085, 'sine', .14)); }
  tap(direction) {
    this.note(direction > 0 ? 620 : 440, .065, 0, 'sine', .1, direction > 0 ? 950 : 290);
    this.note(direction > 0 ? 1240 : 880, .035, .012, 'triangle', .025);
  }
  launch(side) {
    this.note(side < 0 ? 170 : 195, .13, 0, 'sine', .09, 560);
  }
  cross(op) {
    const root = { '+1': 660, '−1': 440, '×2': 784, '÷2': 523 }[op];
    this.note(root, .22, 0, 'sine', .11);
    this.note(root * 2, .12, .015, 'sine', .025);
    if (op === '×2' || op === '÷2') this.note(root * (op === '×2' ? 1.5 : .75), .24, .08, 'triangle', .06);
    const c = this.context;
    if (c && c.currentTime - this.lastBaa > 3.5) { this.lastBaa = c.currentTime; this.baa(); }
  }
  baa() {
    const c = this.context;
    if (!this.enabled || !c || c.state !== 'running') return;
    const t = c.currentTime + .035;
    const voice = c.createOscillator(), filter = c.createBiquadFilter(), gain = c.createGain();
    const wobble = c.createOscillator(), depth = c.createGain();
    voice.type = 'sawtooth'; voice.frequency.setValueAtTime(235, t);
    voice.frequency.exponentialRampToValueAtTime(165, t + .3);
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(1050, t); filter.Q.value = 2.5;
    filter.frequency.linearRampToValueAtTime(720, t + .3);
    wobble.frequency.value = 19; depth.gain.value = 15;
    wobble.connect(depth).connect(voice.frequency);
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.1, t + .035);
    gain.gain.exponentialRampToValueAtTime(.0001, t + .34);
    voice.connect(filter).connect(gain).connect(this.master);
    voice.start(t); wobble.start(t); voice.stop(t + .35); wobble.stop(t + .35);
    voice.onended = () => { voice.disconnect(); filter.disconnect(); gain.disconnect(); wobble.disconnect(); depth.disconnect(); };
  }
  warning() {
    const c = this.context;
    if (!c || c.currentTime - this.lastWarning < 1.3) return;
    this.lastWarning = c.currentTime;
    this.note(87, .16, 0, 'sine', .13, 70); this.note(78, .2, .22, 'sine', .1, 60);
  }
  finish(win) {
    const notes = win ? [523, 659, 784, 1047] : [294, 247, 196, 98];
    notes.forEach((n, i) => this.note(n, win ? .5 : .35, i * .12, 'triangle', .14));
  }
  pause() { if (this.context) this.context.suspend().catch(() => {}); }
}
