export const holdRate = seconds => seconds >= 3 ? 64 : seconds >= 1 ? 32 : seconds >= .5 ? 16 : 8;
export const newHold = () => ({ age: 0, next: .1 });
export function stepHold(hold, dt, tick) {
  hold.age += dt;
  while (hold.age + 1e-9 >= hold.next) { tick(); hold.next += 1 / holdRate(hold.next); }
}
// Human input allowance follows the same acceleration, with extra reading time.
export function countTime(change) {
  let left = Math.abs(change);
  for (const [capacity, rate] of [[4, 8], [8, 16], [64, 32]]) {
    if (left <= capacity) return left / rate + .25;
    left -= capacity;
  }
  return 3.25 + left / 64;
}
export function bindCounting({ minus, plus, tap, active }) {
  let held = null;
  const stop = () => { held = null; };
  const start = (key, delta, event) => {
    if (!active()) return;
    held = { ...newHold(), key, delta };
    tap(delta, event);
  };
  for (const [button, delta] of [[minus, -1], [plus, 1]]) {
    button.addEventListener('pointerdown', e => {
      if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault(); button.setPointerCapture(e.pointerId); start(e.pointerId, delta, e);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, e => { if (held?.key === e.pointerId) stop(); });
    button.addEventListener('click', e => { if (e.detail === 0) tap(delta); });
    button.addEventListener('contextmenu', e => e.preventDefault());
  }
  const direction = key => ['ArrowLeft', 'a', 'A'].includes(key) ? -1 : ['ArrowRight', 'd', 'D'].includes(key) ? 1 : 0;
  addEventListener('keydown', e => { const delta = direction(e.key); if (delta) { e.preventDefault(); if (!e.repeat) start(e.code, delta); } });
  addEventListener('keyup', e => { if (held?.key === e.code) stop(); });
  addEventListener('blur', stop);
  document.addEventListener('visibilitychange', stop);
  return { stop, step(dt) { if (!active()) return stop(); if (held) stepHold(held, dt, () => tap(held.delta)); } };
}
export function encounterPreview(type, change) {
  if (Math.abs(change) <= 1) return .8 * type.slow;
  // At least 80% of the flight remains after the wool enters the viewport.
  return Math.max(.8 * type.slow, (countTime(change) + .6 * type.slow) / .8);
}
