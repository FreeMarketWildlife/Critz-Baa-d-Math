# Critz: Baa’d Math

A counting game about a very fragile night's sleep. Browser MVP, with fluffy animated sheep and a sleeping wolf. No art assets or build step required.

## Play locally

Run `npm run dev` and open http://localhost:4187. Run `npm test` for the math and fairness checks.

Tap the left half to subtract one; tap the right half to add one. Arrow keys or A/D also work. Operations apply as soon as each sheep becomes visible at the screen edge. Keep the running total in your head; the true answer is revealed only after a run. For a perfect count, reach the next sheep’s resulting total before it crosses the center, and hold it until the crossing or the next sheep appears. Perfect crossings calm the wolf and count toward the final perfect percentage. Escape or Space pauses; switching tabs automatically pauses.

The current menu starts **endless survival**. Arithmetic unlocks use active time: +1 only for the first 15 seconds, −1 joins at 15 seconds, occasional ×2 at 30 seconds, and ÷2 at 60 seconds. The three-minute campaign and quick-dream menu have been replaced by this combined survival release.

Sheep pop up from both sides on gravity-driven arcs, spin, and fall back offscreen. Each changes the total once on entry; the center gate scores perfect timing. The fixed-step physics and queued arithmetic support overlapping flights.

White +1, red −1, gold ×2, blue ÷2. Screen redness communicates rage without a rage bar. Sound is optional. The end screen reports survival time, sheep passed, perfect percentage, peak math total, and dream score.

See [game design](docs/GAME-DESIGN.md) and [roadmap](docs/ROADMAP.md).

## Files

`index.html`: interface; `src/style.css`: responsive presentation; `src/game.js`: animation, input, lifecycle; `src/rules.js`: arithmetic and balancing; `src/physics.js`: ballistic motion; `src/sound.js`: synthesized sound effects; `src/music.js`: original lullaby and music-only room filter; `src/sheep.js`: shared directional personality renderer; `tests/`: rule regression checks; `docs/`: design and next steps.

## Phone and sound polish

Play uses full-screen left/right touch zones, large thumb targets, safe-area spacing, dynamic viewport sizing, and dedicated portrait/small-phone/landscape layouts. The menu scrolls when vertical space is tight. Fluffy canvas sheep have faces, wool curls, kicking hooves, and upright operation labels; the ballistic simulation and math unlock times are unchanged.

An original lullaby, musical counting chimes, launch whistles, occasional cartoon bleats, danger heartbeats, and win/loss jingles run through Web Audio. Sound starts with the first play gesture; the header mute toggle is saved locally. Audio suspends while paused or backgrounded and resumes on a user gesture. No audio downloads or external sound services are needed. Physical iPhone/Android speaker and browser testing remains a device check; desktop phone-sized previews do not establish that coverage.

## Public release

Play the immutable release at https://rawcdn.githack.com/FreeMarketWildlife/Critz-Baa-d-Math/41d1281410dda2478490228b939d60e70369d412/index.html. The CDN may show an external-content notice; choose “Open the page.” No login is required.

GitHub Pages deploys successfully, but its default URL inherits the organization’s existing `freemarketwildlife.com` domain and currently redirects to a 404. The CDN link serves the same public game files without changing organization DNS or unrelated hosting.
Every push to `main` runs the rule tests before deploying to GitHub Pages.
Only `index.html` and `src/` are included in the public site artifact.

## Personality and musical counting

The base +1 sheep stays happy. Red −1 sheep are angry, gold ×2 sheep are goofy, and blue ÷2 sheep cry. All face their flight direction without mirroring the math symbols. Taps cycle through C major with softly blended octave layers instead of rising forever. The wolf sleeps on the grass below the counting area, then drifts upward after fifteen seconds without rage gain.

Run the art review at http://localhost:4187/tests/visual-review.html to inspect every personality facing both directions. Rule tests include anticipation timing, perfect percentages, bounded C-major notes, crossing order, and predictive seven-taps-per-second full-night simulations.

## Moonwool lullaby and counted sheep

Moonwool is an original, looping 16-bar lullaby in C major, with a soft bell melody, harp pattern, warm chords, and quiet bass. It stays at 72 BPM in 3/4. A slow ×2 or ÷2 approach smoothly closes a music-only low-pass filter to 480 Hz; it opens back to 9 kHz at the crossing. Effects and counting notes stay clear. Pausing freezes the music position; restarting resets the score. Starting muted and enabling sound later works too.

Taps and perfect chimes share one continuous C-major sequence. Perfects use a longer bell tone with delayed octave sparkles on the same note. Ordinary crossings are silent and do not advance the sequence.

A sheep turns delighted once its own total is reached, before or after its crossing, and stays delighted until despawning. Only the next incoming and most recent crossed sheep can receive new credit, so repeated totals do not accidentally credit the whole flock. This visual credit is separate from the existing held-through-crossing perfect timing rule.

Open `/tests/audio-review.html` to render an eighteen-second soundtrack sample through the actual Web Audio synthesizer, including a filter demonstration from seconds 6–11. `/tests/visual-review.html` also shows the counted expressions.

## Combined survival release

All runtime changes are included: phone controls, directional sheep personalities and persistent counted smiles, sleeping wolf, timed arithmetic unlocks, extended large-operation previews, continuous musical counting, the filtered Moonwool soundtrack, and the wolf wake/eating finale. The game ends with a scorecard and Play Again / Go Back to Sleep actions. Dream score is 100 per sheep passed + 50 per perfect + 10 per whole second survived.

The combined public release also includes compact phone scorecards with paired 44px-or-larger restart/navigation controls.

## Entry counting and gentler feedback

Accuracy follows the latest visible sheep immediately, including overlapping flights. Correct holds on an earlier sheep are preserved when a new sheep enters before its center crossing. The count eases through green, orange, yellow, and red over 0.45 seconds, with a ten-count minimum error scale so small totals do not jump straight to red. Halfway crossings have no ordinary chime or bleat; perfects retain the same C-major note sequence with a stronger, longer octave shimmer.


## Sleeping ascent

Fifteen continuous seconds without building rage starts the sleeping wolf levitating. There is no height ceiling: the camera follows him from the grass into a starfield. The sky uses the Libriam Globe’s orange dwarf sun, enormous gold-ringed Kronos, distant blue-white point Zuhal, large full Moon behind the wolf, and thin atmospheric limb. Celestial distances are compressed for this dream view; it is not a scale orbital map or new Dragex lore.

The ascent eases in over eight seconds and stays below 2.8% of a viewport per second, with a soft camera pickup and a little sleeping sway. Actual rage gain breaks the calm streak: the wolf hangs briefly, then falls with increasing acceleration. Correcting the count cannot cancel that fall. Ordinary rage accumulation waits until landing, so the wolf can fall all the way from space; landing adds no rage or other streak-loss penalty. Another fifteen calm seconds on the ground can start a fresh ascent. Pause freezes the ascent and fall; restart clears both. The rage bar, its DOM elements, and its CSS are removed; existing redness and wolf behavior provide feedback.

`src/levitation.js` owns the streak, uncapped altitude, gravity and impact; `src/dream-sky.js` renders the grass and celestial background. `npm test` includes streak/reset/landing regressions. With Playwright available, run `node tests/levitation-browser.cjs` against the dev server for phone, desktop and landscape checks, including pause, landing, finale and replay.


## Moonlit flower fields

Four cached layers of rolling hills move at different parallax speeds, so nearby flowers travel faster than the distant fields during ascent and descent. The meadow mixes daisies, lupines, cosmos, poppies, bluebells, and warm six-petalled flowers, with nine softly pulsing fireflies. A large full Moon provides restrained cool backlight; Kronos fills most of the sky with cloud belts and sweeping rings; faraway Zuhal appears as a bright blue-white star. The flower positions are deterministic and the cached layers rebuild only on viewport changes. Reduced motion disables decorative field wind, firefly movement, and wolf sway.

`src/ambience.js` supplies quiet intermittent synthesized crickets alongside the lullaby, fades them with altitude, and shares sound, pause, home, finale, and restart controls. `tests/ambience-browser.cjs` renders the actual Web Audio output and checks silence between calls and audio lifecycle behavior.


## Sheep celebrations and rich meadows

There is no Ready indicator or central Perfect label. At a perfect center crossing, that sheep gets its own short-lived “Perfect!” speech bubble, with a little pop, tail and sparkles. It stays upright and travels beside the sheep, stays within the viewport, and fades after about a second. The existing perfect scoring and chime remain. `src/sheep-callout.js` owns this independent overlay without changing the shared sheep renderer.

The cached meadows now plant thousands of depth-sorted flowers across every hill in continuous carpets, with broad patches of rich blues and purples, white daisies and yellow cups. Six flower shapes each have several color shades and close petals catch faint moonlight. Density scales with viewport width; only the cached layers move during ordinary frames. Counting controls have dark backing to stay legible against the flowers. Dropping from levitation has no landing penalty; ordinary counting-error rage rules still apply.
