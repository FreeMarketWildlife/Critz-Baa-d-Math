# Critz: Baa’d Math

A counting game about a very fragile night's sleep. Browser MVP, with fluffy animated sheep and a sleeping wolf. No art assets or build step required.

## Play locally

Run `npm run dev` and open http://localhost:4187. Run `npm test` for the math and fairness checks.

Tap the left half to subtract one; tap the right half to add one. Arrow keys or A/D also work. Operations apply when a sheep crosses the center line. Keep the running total in your head; the true answer is revealed only after a run. For a perfect count, reach the next sheep’s resulting total before it crosses the center, and hold it through the crossing. Perfect crossings calm the wolf and count toward the final perfect percentage. Escape or Space pauses; switching tabs automatically pauses.

The current menu starts **endless survival**. Arithmetic unlocks use active time: +1 only for the first 15 seconds, −1 joins at 15 seconds, occasional ×2 at 30 seconds, and ÷2 at 60 seconds. The three-minute campaign and quick-dream menu have been replaced by this combined survival release.

Sheep pop up from both sides on gravity-driven arcs, spin, and fall back offscreen. Each counts once when crossing the center gate. The fixed-step physics and queued arithmetic support overlapping flights.

White +1, red −1, gold ×2, blue ÷2. Screen redness communicates rage without a rage bar. Sound is optional. The end screen reports survival time, sheep passed, perfect percentage, peak math total, and dream score.

See [game design](docs/GAME-DESIGN.md) and [roadmap](docs/ROADMAP.md).

## Files

`index.html`: interface; `src/style.css`: responsive presentation; `src/game.js`: animation, input, lifecycle; `src/rules.js`: arithmetic and balancing; `src/physics.js`: ballistic motion; `src/sound.js`: synthesized sound effects; `src/music.js`: original lullaby and music-only room filter; `src/sheep.js`: shared directional personality renderer; `tests/`: rule regression checks; `docs/`: design and next steps.

## Phone and sound polish

Play uses full-screen left/right touch zones, large thumb targets, safe-area spacing, dynamic viewport sizing, and dedicated portrait/small-phone/landscape layouts. The menu scrolls when vertical space is tight. Fluffy canvas sheep have faces, wool curls, kicking hooves, and upright operation labels; the ballistic simulation and math unlock times are unchanged.

An original lullaby, musical counting chimes, launch whistles, occasional cartoon bleats, danger heartbeats, and win/loss jingles run through Web Audio. Sound starts with the first play gesture; the header mute toggle is saved locally. Audio suspends while paused or backgrounded and resumes on a user gesture. No audio downloads or external sound services are needed. Physical iPhone/Android speaker and browser testing remains a device check; desktop phone-sized previews do not establish that coverage.

## Public release

Play the immutable release at https://rawcdn.githack.com/FreeMarketWildlife/Critz-Baa-d-Math/bd7e4e484f0f618e7c3d8240c53cbebc59ec7a88/index.html. The CDN may show an external-content notice; choose “Open the page.” No login is required.

GitHub Pages deploys successfully, but its default URL inherits the organization’s existing `freemarketwildlife.com` domain and currently redirects to a 404. The CDN link serves the same public game files without changing organization DNS or unrelated hosting.
Every push to `main` runs the rule tests before deploying to GitHub Pages.
Only `index.html` and `src/` are included in the public site artifact.

## Personality and musical counting

The base +1 sheep stays happy. Red −1 sheep are angry, gold ×2 sheep are goofy, and blue ÷2 sheep cry. All face their flight direction without mirroring the math symbols. Taps cycle through C major with softly blended octave layers instead of rising forever. The wolf sits at the exact screen-center anchor during play.

Run the art review at http://localhost:4187/tests/visual-review.html to inspect every personality facing both directions. Rule tests include anticipation timing, perfect percentages, bounded C-major notes, crossing order, and predictive seven-taps-per-second full-night simulations.

## Moonwool lullaby and counted sheep

Moonwool is an original, looping 16-bar lullaby in C major, with a soft bell melody, harp pattern, warm chords, and quiet bass. It stays at 72 BPM in 3/4. A slow ×2 or ÷2 approach smoothly closes a music-only low-pass filter to 480 Hz; it opens back to 9 kHz at the crossing. Effects and counting notes stay clear. Pausing freezes the music position; restarting resets the score. Starting muted and enabling sound later works too.

Taps, ordinary crossing chimes, and perfect chimes share one continuous C-major sequence. Perfects use a longer sparkling tone instead of an unrelated chord, and their crossing does not consume a second note.

A sheep turns delighted once its own total is reached, before or after its crossing, and stays delighted until despawning. Only the next incoming and most recent crossed sheep can receive new credit, so repeated totals do not accidentally credit the whole flock. This visual credit is separate from the existing held-through-crossing perfect timing rule.

Open `/tests/audio-review.html` to render an eighteen-second soundtrack sample through the actual Web Audio synthesizer, including a filter demonstration from seconds 6–11. `/tests/visual-review.html` also shows the counted expressions.

## Combined survival release

All runtime changes are included: phone controls, directional sheep personalities and persistent counted smiles, centered sleeping wolf, timed arithmetic unlocks, extended large-operation previews, continuous musical counting, the filtered Moonwool soundtrack, and the wolf wake/eating finale. The game ends with a scorecard and Play Again / Go Back to Sleep actions. Dream score is 100 per sheep passed + 50 per perfect + 10 per whole second survived.
