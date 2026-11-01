# Roadmap

1. Playtest pace, rage grace, tolerance, tap fatigue, and three-minute level length on touch devices.
2. Add authored campaign nights, unlock progression, and a sunrise finish transition.
3. Refine the procedural wolf sleeping/restless/waking states and refine the fluffy procedural sheep artwork, preserving symbol accessibility.
4. Build the intended ravenous game-over sequence and agree on its visual intensity.
5. Add educational arithmetic challenges only after basic mental counting feels good. Define fractions and input before any operation can produce them.
6. Playtest the synthesized sound design on physical iPhone/Android devices, expand reduced-motion settings, and broaden device testing.

No accounts, analytics, external services, or final visual assets are required for this MVP.

## Optional prompt vocabulary for future polish

Source: [Game Development Cheat Sheet](https://gamedev-cheatsheet.com/) (reviewed November 1, 2026). The following are proposed investigation prompts, not implemented changes or replacements for current rules. Read the latest README and source before using this roadmap: earlier prototype notes can differ from the current game.

- **Frame budget / time slicing:** profile sheep rendering, cached scenery and decorative effects separately from fixed-step arithmetic. Budget optional visual work; never defer center-crossing rewards or reorder operations to improve a frame-time number.
- **Input buffering:** useful to reason about event delivery, but not permission to add a grace window that retroactively earns a Crit. Preserve current hold acceleration, anticipation locks and exactly-once crossing awards; discard stale input on pause, blur and replay.
- **Finite state machines:** document menu/play/pause/finale/results and audio transitions, including repeated interrupts. Preserve the existing architecture rather than rewriting it just to use this term.
- **Object pooling:** only consider transient visual effects if allocation profiling shows a problem. Reused objects must not retain sheep credit, wallet rewards or previous-run state.

### Focused review prompt

> Inspect the current input and fixed-step crossing pipeline. Explain how each input is consumed and how chronological arithmetic, anticipation locks and exactly-once Critz rewards survive low frame rates, simultaneous crossings, pointer cancellation, pause/resume and replay. Propose regression cases at 30/60/120 Hz rendering without changing simulation rules or reward timing. Keep reduced motion, operation-symbol readability, audio pause behavior and existing save keys unchanged. Distinguish physical-device observations from browser emulation.

Use the site's terms to make a request precise, not to import its platformer examples or arbitrary timing values. Profile first; record measured results and remaining limitations before claiming a performance improvement.
