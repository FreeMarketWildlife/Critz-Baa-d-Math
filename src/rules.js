export const apply = (value, op) => ({
  '+1': value + 1, '−1': value - 1, '×2': value * 2, '÷2': value / 2,
})[op];

export const tolerance = n => 10 + Math.min(6, Math.floor(n / 25));

// Unlocks use active play time; pausing never advances the curriculum.
export function chooseOperation(elapsed, value, random = Math.random) {
  if (elapsed < 15) return '+1';
  const options = ['+1', '+1', '+1', '+1', '+1', '+1', '−1', '−1', '−1', '−1'];
  // One multiplication slot keeps doubles occasional. Large changes still reserve
  // enough tap time through interval(), and projected totals keep division whole.
  if (elapsed >= 30 && Math.abs(value) >= 2 && Math.abs(value) <= 40) options.push('×2');
  if (elapsed >= 60 && value !== 0 && value % 2 === 0) options.push('÷2', '÷2');
  return options[Math.min(options.length - 1, Math.floor(random() * options.length))];
}

// Consecutive crossings retain this spacing even when several sheep are airborne.
// Large changes reserve a seven-taps/second catch-up budget before the next crossing.
export const interval = (n, change) => Math.max(.52, 1.65 - n * .045, Math.abs(change) / 7 + .35);
export const catchUpGrace = change => .14 + Math.abs(change) / 7;
export const starsFor = greenRatio => greenRatio >= .97 ? 3 : greenRatio >= .8 ? 2 : 1;

export function stepRage(rage, error, limit, dt, grace = false) {
  if (error <= 1) return Math.max(0, rage - dt * .3);
  if (grace) return rage;
  const rate = error >= limit ? .8 : .09 + .38 * (error - 1) / (limit - 1);
  return Math.min(1, rage + dt * rate);
}
