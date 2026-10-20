# Critz: Baa’d Math

A counting game about a very fragile night's sleep. Browser MVP, with fluffy animated sheep and a sleeping wolf. No art assets or build step required.

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

`index.html`: interface; `src/style.css`: responsive presentation; `src/game.js`: animation, input, lifecycle; `src/rules.js`: arithmetic and balancing; `src/physics.js`: ballistic motion; `src/sound.js`: synthesized sound effects; `tests/`: rule regression checks; `docs/`: design and next steps.

## Phone and sound polish

Play uses full-screen left/right touch zones, large thumb targets, safe-area spacing, dynamic viewport sizing, and dedicated portrait/small-phone/landscape layouts. The menu scrolls when vertical space is tight. Fluffy canvas sheep have faces, wool curls, kicking hooves, and upright operation labels; the ballistic simulation and math unlock times are unchanged.

Synthesized pops, launch whistles, chimes, occasional cartoon bleats, danger heartbeats, and win/loss jingles run through Web Audio. Sound starts with the first play gesture; the header mute toggle is saved locally. Audio suspends while paused or backgrounded and resumes on a user gesture. No audio downloads or external sound services are needed. Physical iPhone/Android speaker and browser testing remains a device check; desktop phone-sized previews do not establish that coverage.

## Public release

Play the immutable release at https://rawcdn.githack.com/FreeMarketWildlife/Critz-Baa-d-Math/e192978eb8f353a3b96818082d163425a6091956/index.html. The CDN may show an external-content notice; choose “Open the page.” No login is required.

GitHub Pages deploys successfully, but its default URL inherits the organization’s existing `freemarketwildlife.com` domain and currently redirects to a 404. The CDN link serves the same public game files without changing organization DNS or unrelated hosting.
Every push to `main` runs the rule tests before deploying to GitHub Pages.
Only `index.html` and `src/` are included in the public site artifact.
