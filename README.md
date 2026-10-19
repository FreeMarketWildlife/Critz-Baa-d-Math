# Critz: Baa’d Math

A counting game about a very fragile night's sleep. Browser MVP, with wool-edged operation discs standing in for sheep and an animated sleeping wolf. No art assets or build step required.

## Play locally

Run `npm run dev` and open http://localhost:4187. Run `npm test` for the math and fairness checks.

Tap the left half to subtract one; tap the right half to add one. Arrow keys or A/D also work. Operations apply when a circle crosses the center line. Keep the running total in your head; the true answer is revealed only after a run. Escape or Space pauses; switching tabs automatically pauses.

- **Night one:** three minutes, +1 only for 15 seconds, then −1 joins, occasional ×2 joins at 30 seconds, and ÷2 joins at 60 seconds.
- **Quick dream:** a one-minute preview with the same gradual unlocks; division is introduced in the longer modes.
- **Endless:** survive an accelerating stream.

Sheep pop up from both sides on gravity-driven arcs, spin, and fall back offscreen. Each counts once when crossing the center gate. The fixed-step physics and queued arithmetic support overlapping flights.

White +1, red −1, gold ×2, blue ÷2. Screen redness communicates rage without a rage bar. Sound is optional. Campaign best stars save on this browser when local storage is available.

See [game design](docs/GAME-DESIGN.md) and [roadmap](docs/ROADMAP.md).

## Files

`index.html`: interface; `src/style.css`: responsive presentation; `src/game.js`: animation, input, lifecycle; `src/rules.js`: arithmetic and balancing; `src/physics.js`: ballistic motion; `tests/`: rule regression checks; `docs/`: design and next steps.
