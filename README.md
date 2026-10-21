# Critz: Baa’d Math

A counting game about a very fragile night's sleep. Browser MVP, with fluffy animated sheep and a sleeping wolf. No art assets or build step required.

## Play locally

Run `npm run dev` and open http://localhost:4187. Run `npm test` for the math and fairness checks.

Tap the left half to subtract one; tap the right half to add one. Hold either side (or A/D/arrow keys) for repeats starting at 0.5 seconds: 16 counts/second, then 32 at 1 second and 64 at 3 seconds. Each press counts once immediately; holding never repeats before 0.5 seconds. Subtraction stops at zero until permanent space drift unlocks negative counts. Arrow keys or A/D also work. Operations apply once when each sheep crosses the halfway line; incoming sheep do not change correctness colors before crossing. The smaller ×2 and ÷2 buttons unlock independently when their matching sheep first becomes visible in each run, and operate only on your count (halving odd counts preserves the fraction). Keep the running total in your head; the true answer is revealed only after a run. For a perfect count, reach the next sheep’s resulting total before it crosses the center, and hold it until the crossing or the next sheep appears. Perfect crossings calm the wolf and count toward the final perfect percentage. Escape or Space pauses; switching tabs automatically pauses.

The current menu starts **endless survival**. A fixed 22-sheep curriculum alternates minimum two- and three-wave waits between first encounters. Each debut waits for a clear sky, flies alone until gone, and keeps its place in the same sequence every run. Fraction eligibility, long flights, space gates, and legendary rarity may extend the wait; types are never skipped.

Sheep pop up from both sides on gravity-driven arcs, spin, and fall back offscreen. Each changes the total once at the center gate; the center gate scores perfect timing. The fixed-step physics and queued arithmetic support overlapping flights.

White +1, red −1, gold ×2, blue ÷2. Screen redness communicates rage without a rage bar. Sound is optional. The end screen shows the score first, then your final count and the actual sheep total after arithmetic operations.

See [game design](docs/GAME-DESIGN.md) and [roadmap](docs/ROADMAP.md).

## Files

`index.html`: interface; `src/style.css`: responsive presentation; `src/game.js`: animation, input, lifecycle; `src/flock.js`: catalogue, arithmetic, fixed introductions, rewards, and weighted selection; `src/controls.js`: pointer/keyboard hold acceleration and human input budgets; `src/collection.js`: persistent achievements; `src/pacing.js`: wave envelope; `src/rules.js`: accuracy and rage; `src/physics.js`: ballistic motion; `src/sound.js`: synthesized sound effects; `src/music.js`: original lullaby and music-only room filter; `src/sheep.js`: shared directional personality renderer; `tests/`: rule regression checks; `docs/`: design and next steps.

## Phone and sound polish

Play uses full-screen left/right touch zones, large thumb targets, safe-area spacing, dynamic viewport sizing, and dedicated portrait/small-phone/landscape layouts. The menu scrolls when vertical space is tight. Fluffy canvas sheep have faces, wool curls, kicking hooves, and upright operation labels; the ballistic simulation keeps chronological crossings, with longer previews for harder sheep.

An original lullaby, musical counting chimes, launch whistles, occasional cartoon bleats, danger heartbeats, and win/loss jingles run through Web Audio. Sound starts with the first play gesture; the header mute toggle is saved locally. Audio suspends while paused or backgrounded and resumes on a user gesture. No audio downloads or external sound services are needed. Physical iPhone/Android speaker and browser testing remains a device check; desktop phone-sized previews do not establish that coverage.

## Public release

Play directly at **https://critz-baad-math.pages.dev/**. This opens the game immediately with no GitHack warning page or login.

Cloudflare Pages hosts only `index.html` and `src/`. To publish all current game changes, run `npm install` once, sign in with `npx wrangler login` if needed, then run `npm run deploy`. Deployment runs the tests and prepares `.public/` before updating the stable production address. Generated bundles, screenshots, and local runtime files remain excluded from Git and the public site.

Every push to `main` runs the regression tests and packages the public game files in GitHub Actions. Cloudflare publication is handled by `npm run deploy`; the inherited GitHub Pages domain is no longer used as the game link.

## Personality and musical counting

The base +1 sheep stays happy. Red −1 sheep are angry, gold ×2 sheep are goofy, and blue ÷2 sheep cry. All face their flight direction without mirroring the math symbols. Taps cycle through C major with softly blended octave layers instead of rising forever. The wolf sleeps on the grass below the counting area, then drifts upward after fifteen seconds without rage gain.

Run the art review at http://localhost:4187/tests/visual-review.html to inspect every personality facing both directions. Rule tests include anticipation timing, perfect percentages, bounded C-major notes, crossing order, and predictive seven-taps-per-second full-night simulations.

## Moonwool lullaby and counted sheep

Moonwool is an original, looping 16-bar lullaby in C major, with a soft bell melody, harp pattern, warm chords, and quiet bass. It stays at 72 BPM in 3/4. A slow multiplier, fraction, or reset approach smoothly closes a music-only low-pass filter to 480 Hz; it opens back to 9 kHz at the crossing. Effects and counting notes stay clear. Pausing freezes the music position; restarting resets the score. Starting muted and enabling sound later works too.

Taps and perfect chimes share one continuous C-major sequence. Perfects use a longer bell tone with delayed octave sparkles on the same note. Ordinary crossings are silent and do not advance the sequence.

A sheep turns delighted once its own total is reached, before or after its crossing, and stays delighted until despawning. Only the next incoming and most recent crossed sheep can receive new credit, so repeated totals do not accidentally credit the whole flock. This visual credit is separate from the existing held-through-crossing perfect timing rule.

Open `/tests/audio-review.html` to render an eighteen-second soundtrack sample through the actual Web Audio synthesizer, including a filter demonstration from seconds 6–11. `/tests/visual-review.html` also shows the counted expressions.

## Combined survival release

All runtime changes are included: phone controls, directional sheep personalities and persistent counted smiles, sleeping wolf, timed arithmetic unlocks, extended large-operation previews, continuous musical counting, the filtered Moonwool soundtrack, and the wolf wake/eating finale. The game ends with a scorecard and Play Again / Go Back to Sleep actions. Dream score is 100 per sheep passed + each sheep’s difficulty-weighted perfect bonus + 10 per whole second survived. The live score and final scorecard use the same accumulated bonuses.

The combined public release also includes compact phone scorecards with paired 44px-or-larger restart/navigation controls.

## Entry counting and gentler feedback

Accuracy follows the latest visible sheep immediately, including overlapping flights. Correct holds on an earlier sheep are preserved when a new sheep enters before its center crossing. The count eases through green, orange, yellow, and red over 0.45 seconds, with a ten-count minimum error scale so small totals do not jump straight to red. Halfway crossings have no ordinary chime or bleat; perfects retain the same C-major note sequence with a stronger, longer octave shimmer.


## Sleeping ascent

Fifteen continuous seconds without building rage starts the sleeping wolf levitating. There is no height ceiling: the camera follows him from the grass into a starfield. The sky uses the Libriam Globe’s orange dwarf sun, enormous gold-ringed Kronos, distant blue-white point Zuhal, large full Moon behind the wolf, and thin atmospheric limb. Celestial distances are compressed for this dream view; it is not a scale orbital map or new Dragex lore.

The ascent eases in over eight seconds and stays below 2.8% of a viewport per second, with a soft camera pickup and a little sleeping sway. Actual rage gain breaks the calm streak: the wolf hangs briefly, then falls with increasing acceleration. Correcting the count cannot cancel that fall. Ordinary rage accumulation waits until landing, so the wolf can fall all the way from the upper atmosphere before escape; landing adds no rage or other streak-loss penalty. Another fifteen calm seconds on the ground can start a fresh ascent. Reaching 3.4 viewport heights without falling permanently escapes gravity: rage still builds for counting errors, but the wolf continues drifting for the rest of that run. An uninterrupted ascent reaches this boundary after roughly three minutes. Pause freezes the ascent and fall; restart clears both. The rage bar, its DOM elements, and its CSS are removed; existing redness and wolf behavior provide feedback.

`src/levitation.js` owns the streak, uncapped altitude, gravity and impact; `src/dream-sky.js` renders the grass and celestial background. `npm test` includes streak/reset/landing regressions. With Playwright available, run `node tests/levitation-browser.cjs` against the dev server for phone, desktop and landscape checks, including pause, landing, finale and replay.


## Moonlit flower fields

Four cached layers of rolling hills move at different parallax speeds, so nearby flowers travel faster than the distant fields during ascent and descent. The meadow mixes daisies, lupines, cosmos, poppies, bluebells, and warm six-petalled flowers, with nine softly pulsing fireflies. A large full Moon provides restrained cool backlight; Kronos fills most of the sky with cloud belts and sweeping rings; faraway Zuhal appears as a bright blue-white star. The flower positions are deterministic and the cached layers rebuild only on viewport changes. Reduced motion disables decorative field wind, firefly movement, and wolf sway.

`src/ambience.js` supplies quiet intermittent synthesized crickets alongside the lullaby, fades them with altitude, and shares sound, pause, home, finale, and restart controls. `tests/ambience-browser.cjs` renders the actual Web Audio output and checks silence between calls and audio lifecycle behavior.


## Sheep celebrations and rich meadows

There is no Ready indicator or central Perfect label. At a perfect center crossing, that sheep gets its own short-lived glowing “Perfect” text pop with a springy scale animation and sparkles, without a speech bubble or tail. It stays upright and travels beside the sheep, stays within the viewport, and fades after about a second. The existing perfect scoring and chime remain. `src/sheep-callout.js` owns this independent overlay without changing the shared sheep renderer.

The cached meadows now plant thousands of depth-sorted flowers across every hill in continuous carpets, with broad patches of rich blues and purples, white daisies and yellow cups. Six flower shapes each have several color shades and close petals catch faint moonlight. Density scales with viewport width; only the cached layers move during ordinary frames. Counting controls have dark backing to stay legible against the flowers. Dropping from levitation has no landing penalty; ordinary counting-error rage rules still apply.


## Gentle waves and solo introductions

Spawn spacing follows an exponential pressure curve across active play time, with 18-second swells followed by 8-second recoveries. Two-second blends soften the transitions. Late swells reach the existing fast crossing limit; recoveries return to at least 1.65 seconds between launches. Large arithmetic changes reserve input time using the accelerating hold rates, plus reading time; extreme sheep have additional preview time and gentler flight arcs.

Every operation's first appearance in each run waits for all airborne sheep to leave, then flies alone until fully offscreen. Restart resets those introductions; pause freezes their progress. The fixed curriculum replaces the previous 15/30/60-second unlock schedule. Integer arithmetic stays intact, including all signed fractions. The blue halving sheep shows a stacked 1 over 2 on its wool, in the menu, and in the operation feedback; its internal operation remains division by two.

`tests/pacing.test.js` checks smooth wave boundaries, recovery spacing, reserved introductions, and a ten-minute mixed-flock simulation for isolated debuts and ordered whole-number arithmetic.


## Night exposure and perfect-note climb

The sky, giant planet, and flower fields use a darker blue night exposure, with the Moon shifted slightly to the right. Perfect rewards are floating gold text with a quick pop and small sparkles, with no speech-bubble background or tail. Their chimes have their own ascending two-octave C-major phrase, so subtraction taps cannot lower the next perfect reward. The phrase repeats after two octaves to stay in a comfortable register. Taps keep their existing bounded C-major voicings.


## Expanded flock, achievements, and permanent space

`src/flock.js` is the shared source for 22 personalities, colors, expressions, spins, arithmetic, and perfect bonuses (50–2,500). Additive weights dominate; large downward changes become rarer as totals grow, giving the running total a positive expected drift. Fractions only spawn at divisible totals. Backwards and signed multipliers/fractions require permanent space. Blank resets to zero; the separate Legendary Shadow ×0 is exceptionally rare, needs positive altitude and more than 180 seconds, and follows the complete fixed curriculum. Its first-encounter roll is 0.3% per eligible launch decision, never per physics tick.

The Flock button opens the achievement collection from the menu, play, pause, or results. Opening during play pauses the run. Seen counts, perfect counts, and mastery stars persist in browser local storage on this device. Each discovered card lists its perfect bonus; a sheep’s floating perfect reward also shows its bonus. Discovery progression resets on replay while the collection persists.

Permanent orbit introduces the original **Starwake** synth soundtrack with wide suspended pads, syncopated triangle arpeggios, and a bass pulse. Music changes while preserving its clock and pause state. Distant stars, moon, and giant planet have almost imperceptible altitude parallax; closer wisps and occasional shooting stars establish motion. Space remains dangerous: counting mistakes can still wake the wolf and end the run.

`tests/flock.test.js` covers the complete curriculum, eight long seeded runs, upward expected drift at multiple totals, whole-number and space gates, rarity gates, preview budgets up to 50,000 count changes, collection reloads, score bonuses, and repeat cadence independent of frame rate. `tests/flock-browser.cjs` checks desktop mouse, emulated phone touch, keyboard holds, release, negative gating, extended runs, saved achievements, and responsive rendering. Run it with Playwright available via `NODE_PATH` against port 4187. Browser review hooks are injected only into intercepted responses; shipped game files contain no review controls.
