export const apply = (value, op) => ({
  '+1': value + 1, '−1': value - 1, '×2': value * 2, '÷2': value / 2,
})[op];

export const tolerance = n => 10 + Math.min(6, Math.floor(n / 25));

export function chooseOperation(n, value, random = Math.random, mode = 'campaign') {
  const intro = mode === 'demo' ? 4 : 5;
  if (n < intro) return '+1';
  const options = ['+1', '+1', '−1', '−1'];
  if (n >= intro + 3 && Math.abs(value) >= 2 && Math.abs(value) <= 16) options.push('×2');
  if (n >= intro + 7 && value !== 0 && value % 2 === 0) options.push('÷2', '÷2');
  return options[Math.min(options.length - 1, Math.floor(random() * options.length))];
}

// Consecutive crossings retain this spacing even when several sheep are airborne.
// Large changes reserve a seven-taps/second catch-up budget before the next crossing.
export const interval = (n, change) => Math.max(.52, 1.65 - n * .045, Math.abs(change) / 7 + .35);
export const catchUpGrace = change => Math.min(.7, .14 + Math.abs(change) / 10);
export const starsFor = greenRatio => greenRatio >= .97 ? 3 : greenRatio >= .8 ? 2 : 1;

export function stepRage(rage, error, limit, dt, grace = false) {
  if (error <= 1) return Math.max(0, rage - dt * .3);
  if (grace) return rage;
  const rate = error >= limit ? .8 : .09 + .38 * (error - 1) / (limit - 1);
  return Math.min(1, rage + dt * rate);
}
