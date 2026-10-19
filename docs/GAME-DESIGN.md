# Game design — initial prototype

## Author's concept

A wolf counts sheep to sleep. Losing count wakes it and ends in a ravenous, bloody sheep-eating scene. The player uses only left/right taps to maintain a hidden mathematical running total. Keep the game interface minimal; do not explain a player-as-wolf role. Starry night, arcing sheep, and later sunrise support the premise. Fruit Ninja is a reference for readable moving objects, not slicing controls.

## Prototype decisions (tunable, not final canon)

- Start total and player count at zero. Each crossing of the central line applies exactly one operation, in order.
- White +1; red −1; proposed gold ×2 and blue ÷2. Both symbol and color communicate meaning.
- First 30 operations are white in standard modes. Quick dream shortens this introduction to eight. Subtraction then enters; multiplication unlocks five sheep later and division ten sheep later.
- Generate ÷2 only for positive even totals. Offer ×2 only for totals 1–20. This keeps integer-only tapping practical. Negative totals are supported.
- Base spacing decreases from 3.3 to 1.8 seconds. Each event reserves at least abs(total change)/5 + 1.1 seconds before the next event: a five-taps-per-second catch-up budget.
- After crossing, rage assessment has a grace period of max(0.65, abs(change)/5 + 0.3) seconds. Errors of 0–1 are green and recover rage at 0.24/second. Above that, rage grows up to 0.13/second below the tolerance. At or above the tolerance it grows at 0.42/second. Tolerance starts at 10 and grows by one every 15 sheep, capped at 30. Grace recovers 0.08/second. Rage is clamped to 0–1; 1 ends the run.
- This replaces instant failure at a ten-point difference with a readable danger window. Arithmetic jumps never cause instant death. No promise of universal human difficulty is implied: playtesting must tune these provisional values.
- Night one lasts 180 active seconds; quick dream 60; endless has no finish time. Pausing freezes simulation; backgrounding pauses automatically.
- Stars use time within ±1, excluding catch-up grace: 3 for at least 97%, 2 for at least 80%, 1 for surviving. A perfect green run earns 3. Failed runs earn none. Browser-local best ratings are saved.

## Visual boundary

Circles with symbols are deliberately temporary. The prototype uses night scenery and a red failure treatment. Wolf animation, sheep models, and the intended graphic game-over scene are not implemented. The campaign currently contains one playable night; no invented story or level map.
