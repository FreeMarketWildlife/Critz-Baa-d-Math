# Game design — initial prototype

## Author's concept

A wolf counts sheep to sleep. Losing count wakes it and ends in a ravenous, bloody sheep-eating scene. The player uses only left/right taps to maintain a hidden mathematical running total. Keep the game interface minimal; do not explain a player-as-wolf role. Starry night, arcing sheep, and later sunrise support the premise. Fruit Ninja is a reference for readable moving objects, not slicing controls.

## Prototype decisions (tunable, not final canon)

- Start total and player count at zero. Each sheep applies exactly one operation when its wool first becomes visible at the viewport edge, in order. The center line remains the perfect checkpoint.
- White +1; red −1; proposed gold ×2 and blue ÷2. Both symbol and color communicate meaning.
- All modes use active-time unlocks: 0–15 seconds only +1; at 15 seconds add −1; at 30 seconds add occasional ×2; at 60 seconds add ÷2. Previous operations remain in the mix. Unlocks govern launches; operations apply on first visible entry. Pause freezes progression. All four operations can appear in survival once their unlock time is reached.
- Generate ÷2 only for nonzero even totals, including negative totals. Offer ×2 only for absolute totals 2–40. Symbol and color both identify an operation; labels stay upright while the bodies tumble.
- Launches alternate sides most of the time, with occasional repeats. Every flight uses a constant downward acceleration, horizontal momentum, initial upward velocity, and independent angular velocity. Simulation runs at a fixed 120 Hz. Normalized world coordinates keep the action framed across screen sizes.
- Standard ±1 sheep reach the center 0.8 seconds after launch. Larger jumps get max(0.8, abs(change)/7 + 0.7) seconds of preview time. Velocity and gravity are adjusted to keep the same on-screen arc. Subsequent launches wait when necessary, preserving crossing order. Every sheep counts once.
- Operations are generated against the projected total after all airborne sheep. This prevents a queued division from becoming fractional when preceding sheep enter.
- Base spacing drops from 1.65 seconds to 0.52 seconds over the first 26 launches. Multiple sheep can be airborne together. Large operations reserve at least abs(change)/7 + 0.35 seconds until the next crossing, allowing seven taps per second plus a small margin.
- Catch-up grace is 0.14 + abs(change)/7 seconds, always shorter than the next crossing interval. Grace holds rage steady for errors; it does not heal missed counts. Within ±1, rage recovers at 0.3/second. Otherwise rage grows from 0.09 toward 0.47/second below tolerance and at 0.8/second at or above tolerance.
- Accuracy uses abs(player − target) / max(10, abs(target)), clamped to 100%. It blends from green through orange at 35%, yellow at 65%, and red at 100%, easing color changes over 0.45 seconds. The small-total floor prevents abrupt red feedback for a single early miss. Accuracy follows the latest visible operation and is separate from accumulated rage.
- Rage is communicated by screen redness and the existing wolf reactions; there is no rage bar.
- Tolerance starts at 10 and increases by one every 25 sheep, capped at 16. Rage is clamped to 0–1; 1 ends the run. Difficulty and seven-taps-per-second budgeting are provisional playtest values, not a universal accessibility guarantee.
- Crossing sparks, a flashing center gate, directional tap light/ripples, counter bounce, and short optional launch/count sounds provide feedback without revealing the answer.
- The combined release exposes endless survival from the main menu. Pausing freezes simulation; backgrounding pauses automatically. Previous campaign/quick-dream menu entries are not exposed in this release.
- Perfect means reaching the next incoming sheep’s resulting total before its center crossing, then holding that total until its crossing or until the next visible sheep updates the total. A correct hold is locked when the next sheep enters, so following its operation does not forfeit the previous perfect. Each perfect crossing calms rage by 0.22 (clamped at zero), adds one to the perfect count, and shows a brief chime/sparkle. No numeric score multiplier is introduced by this mechanic. The end perfect percentage is floor(perfect crossings / crossed sheep × 100), so only an all-perfect run displays 100%. The survival scorecard displays the perfect percentage and counts directly; there is no win/star finish in endless survival.

## Visual boundary

Sheep are drawn procedurally in canvas. The prototype uses night scenery and a red failure treatment. During play a procedural canvas wolf sleeps at the screen center, breathes, emits drifting Zs, twitches its ears as rage rises, and opens an eye near waking. Sheep now have fluffy bodies and faces; the combined release includes a short stylized wolf attack/eating finale followed by a scorecard. No campaign map or invented story is included.

## Phone presentation and sound

- Entire left/right screen halves accept immediate pointer taps; no drag, swipe, or held-button auto-counting is added. Controls avoid the phone home indicator and header actions. Portrait, short portrait, and landscape layouts use safe-area insets and dynamic viewport units; cramped menus scroll.
- Sheep now have colored fluffy wool, curls, charcoal faces, floppy pink-lined ears, shiny eyes, blush, smiles, and kicking legs. Upright high-contrast math symbols stay on their sides while their bodies gently tumble.
- Web Audio synthesizes soft tap pops, rising launch sounds, operation chimes, occasional cartoon bleats, a warning heartbeat, and end jingles. A master compressor bounds overlapping voices. Sound is enabled by default, unlocked on a play gesture, and can be muted with a saved preference. Pausing/backgrounding suspends the audio context; resume uses a user gesture.
- No accounts, trackers, downloaded audio, final external art assets, or changes to the 15/30/60-second operation unlocks are introduced.

## Individual personalities and anticipation

- +1 retains the happy base sheep; −1 has angry brows and a frown; ×2 has uneven eyes, a wagging tongue, and a wild tuft; ÷2 has worried brows, a pout, and continuously falling tears. Bodies mirror with horizontal velocity while arithmetic symbols remain upright and unmirrored. The shared renderer is reviewed at `/tests/visual-review.html`.
- Taps move through C, D, E, F, G, A, B and wrap back to C. Left taps reverse the sequence. Soft octave layers fade around a fixed register for a Shepard-style looping ascent; frequencies stay bounded and the sequence resets for each new dream.
- Matching the latest visible total turns the count green and displays READY while that sheep approaches the center. The target and catch-up grace update on visible entry; hidden sheep cannot receive anticipation credit.

## Lullaby and persistent counted expressions

- Moonwool is an original 16-bar C-major lullaby at 72 BPM in 3/4. Bell melody, soft pad chords, harp pattern, and bass are scheduled with a short look-ahead window, with soft room echoes. It loops without restarting on perfects or arithmetic events.
- Slow ×2/÷2 approaches set music-only low-pass cutoff toward 480 Hz with a 0.27-second time constant. At crossing it returns toward 9 kHz with a 0.48-second time constant. Overlapping approaches keep it muffled until all have crossed. Tempo and playback rate remain unchanged; counting/SFX bypass this filter.
- Every tap and perfect chime consumes one step of the same C-major phrase. Perfect crossings use a longer bell voice with delayed octave sparkles on the same pitch class. Ordinary crossings are silent, including incidental bleats, and consume no melody step.
- Counted credit is latched to a specific sheep when its resulting total is reached. The next incoming sheep or the most recent crossed sheep may be credited while still onscreen. The new delighted expression, celebratory kicks, soft halo, and little sparkles persist until despawn; crying sheep stop crying and angry sheep lose their frown. Sheep color, operation labels, flight direction, and perfect timing stay unchanged.
- Soundtrack position survives pause/resume. Replay resets the score; mute retains its existing saved preference. Browser-generated WAV preview and art review pages use the exact runtime score and renderer.

## Combined end screen

At maximum rage, a 2.2-second finale freezes the visible flock, wakes the wolf, runs through bite beats, and finishes with a gulp. Reduced-motion mode removes the camera shake. The scorecard shows sheep passed, perfect counts/percentage, peak running math total, and active survival time. Dream score is sheep × 100 + perfects × 50 + floor(seconds) × 10. Play Again resets the run and music; Go Back to Sleep returns to the menu.
