# Critz: Baa’d Math

A counting game about a very fragile night's sleep. Browser MVP, with numbered circles standing in for sheep. No art assets or build step required.

## Play locally

Run `npm run dev` and open http://localhost:4187. Run `npm test` for the math and fairness checks.

Tap the left half to subtract one; tap the right half to add one. Arrow keys or A/D also work. Operations apply when a circle crosses the center line. Keep the running total in your head; the true answer is revealed only after a run. Escape or Space pauses; switching tabs automatically pauses.

- **Night one:** three minutes, first 30 sheep are +1, then progressively mixed arithmetic.
- **Quick dream:** a one-minute preview; mixed arithmetic starts after eight sheep.
- **Endless:** survive an accelerating stream.

White +1, red −1, gold ×2, blue ÷2. Sound is optional. Campaign best stars save on this browser when local storage is available.

See [game design](docs/GAME-DESIGN.md) and [roadmap](docs/ROADMAP.md).

## Files

`index.html`: interface; `src/style.css`: responsive presentation; `src/game.js`: animation, input, lifecycle; `src/rules.js`: arithmetic and balancing; `tests/`: rule regression checks; `docs/`: design and next steps.
