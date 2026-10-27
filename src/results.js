// Time is banked after the run; the in-play score is exclusively sheep + Crit bonuses.
export const sheepScore = (sheep, critBonus = 0) => sheep * 100 + critBonus;
export const TALLY_DELAY = .45, TALLY_DURATION = 1.65;
export function resultTally(base, seconds, age, reduced = false) {
  const bonus = Math.floor(seconds) * 10;
  const progress = reduced ? 1 : Math.min(1, Math.max(0, (age - TALLY_DELAY) / TALLY_DURATION));
  const added = Math.min(bonus, Math.round(bonus * (1 - (1 - progress) ** 3)));
  return { score: base + added, remaining: bonus - added, bonus, done: progress === 1 || bonus === 0 };
}
