# Game design — initial prototype

## Author's concept

A wolf counts sheep to sleep. Losing count wakes it and ends in a ravenous, bloody sheep-eating scene. The player uses only left/right taps to maintain a hidden mathematical running total. Keep the game interface minimal; do not explain a player-as-wolf role. Starry night, arcing sheep, and later sunrise support the premise. Fruit Ninja is a reference for readable moving objects, not slicing controls.

## Prototype decisions (tunable, not final canon)

- Start total and player count at zero. Each crossing of the central line applies exactly one operation, in order.
- White +1; red −1; proposed gold ×2 and blue ÷2. Both symbol and color communicate meaning.
- Five opening +1 sheep (four in quick dream). Subtraction follows immediately; ×2 unlocks at sheep nine and ÷2 at sheep thirteen in standard modes.
- Generate ÷2 only for nonzero even totals, including negative totals. Offer ×2 only for absolute totals 2–16. Symbol and color both identify an operation; labels stay upright while the bodies tumble.
- Launches alternate sides most of the time, with occasional repeats. Every flight uses a constant downward acceleration, horizontal momentum, initial upward velocity, and independent angular velocity. Simulation runs at a fixed 120 Hz. Normalized world coordinates keep the action framed across screen sizes.
- Each flight reaches the central counting gate 0.8 seconds after launch. Launch height, point, gravity, and spin vary; flights then descend below the screen. Crossing time stays consistent so overlapping operations cannot overtake each other. Each crossing is applied exactly once.
- Operations are generated against the projected total after all airborne sheep. This prevents a queued division from becoming fractional when preceding sheep cross.
- Base spacing drops from 1.65 seconds to 0.52 seconds over the first 26 launches. Multiple sheep can be airborne together. Large operations reserve at least abs(change)/7 + 0.35 seconds until the next crossing, allowing seven taps per second plus a small margin.
- Catch-up grace is min(0.7, 0.14 + abs(change)/10) seconds, always shorter than the next crossing interval. Grace holds rage steady for errors; it does not heal missed counts. Within ±1, rage recovers at 0.3/second. Otherwise rage grows from 0.09 toward 0.47/second below tolerance and at 0.8/second at or above tolerance.
- Tolerance starts at 10 and increases by one every 25 sheep, capped at 16. Rage is clamped to 0–1; 1 ends the run. Difficulty and seven-taps-per-second budgeting are provisional playtest values, not a universal accessibility guarantee.
- Crossing sparks, a flashing center gate, directional tap light/ripples, counter bounce, and short optional launch/count sounds provide feedback without revealing the answer.
- Night one lasts 180 active seconds; quick dream 60; endless has no finish time. Pausing freezes simulation; backgrounding pauses automatically.
- Stars use time within ±1, excluding catch-up grace: 3 for at least 97%, 2 for at least 80%, 1 for surviving. A perfect green run earns 3. Failed runs earn none. Browser-local best ratings are saved separately from the slower original prototype.

## Visual boundary

Circles with symbols are deliberately temporary. The prototype uses night scenery and a red failure treatment. A procedural canvas wolf sleeps at the bottom, breathes, emits drifting Zs, twitches its ears as rage rises, and opens an eye near waking. Sheep remain symbolic wool-edged discs. Final sheep artwork and the intended graphic game-over scene are not implemented. The campaign currently contains one playable night; no invented story or level map.
