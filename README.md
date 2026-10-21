# Music theory — Chord studio

A local single-page app for experimenting with jazz harmony. Build and edit progressions, transpose, audition chords, loop playback, and explore nearby chords by voice-leading distance.

## Run

Requires Node.js 24.19 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Browser synthesis starts only after a play/listen action. Your progression saves in browser storage; export it as JSON to keep an external copy.

## Musical model

- Twelve-tone equal temperament, twelve chord qualities, and up to sixteen chords.
- Four upper voices plus a separate root bass. Extensions use incomplete voicings: the fifth is omitted from ninths and thirteenths.
- Each chord chooses the nearest available inversion to the preceding chord, minimizing summed semitone movement. This is a greedy, bounded search, not global phrase optimization.
- Six nearby harmonies are ranked by that same distance. Closeness does not establish harmonic function.
- Generation samples a small jazz grammar: ii–V–I–VI, tritone substitution, and backdoor cadence. Seventh, ninth, and thirteenth colors vary within the selected grammar; consecutive identical results are avoided. The minor cadence is also available as a preset. This is template-based generation, not an arbitrary-dimensional Tonnetz implementation.
- Notes use flat enharmonic display names rather than context-sensitive spelling. Audio is a lightweight triangle-wave synthesizer, not a piano sample library.
- No song transcription, third-party accounts, backend, or audio uploads.

## Quality

```sh
npm run check     # lint + formatting, tests with metrics, production build
npm test          # focused test suite
npm run coverage  # full coverage report
npm run format    # Biome formatting and safe fixes
```

The quality analyzer and tests are adapted from `web-experiments/material-tiles` (originally adapted from `wmaps`); Biome conventions follow those projects. No application code or assets from Chordify are used.

The gate checks **every application and quality-tooling function** with strict **CRAP < 8**, and **function/file MI > 70**. Tests and configuration files are not metric targets. The git pre-commit hook and GitHub Actions run the same checks.

CRAP = CC² × (1 − statement coverage)³ + CC. Untested functions receive zero coverage. MI uses the classic **171-point** scale: 171 − 5.2 ln(Halstead volume) − 0.23 CC − 16.2 ln(source lines). File MI uses mean function/module metrics, matching the borrowed implementation. This is not the normalized 0–100 MI variant. Metrics are heuristics, supplemented by musical invariants, DOM integration tests, audio lifecycle tests, and browser review.

## Structure

`src/theory.js` and `src/progressions.js` contain pure musical logic. `audio.js` owns synthesis, `transport.js` playback cancellation, `storage.js` validation, and `app.js` / `view.js` UI state and rendering. `docs/design.md` records design acceptance criteria.
