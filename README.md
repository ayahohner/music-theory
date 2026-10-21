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

- Twelve-tone equal temperament, sixteen chord qualities, and up to sixteen chords.
- Four upper voices plus a separate root bass. Ninths, thirteenths, and the new altered/Lydian colors use rootless four-note upper structures; the separate bass supplies the root.
- Each chord chooses the nearest available inversion to the preceding chord, minimizing summed semitone movement. This is a greedy, bounded search, not global phrase optimization.
- Six nearby harmonies are ranked by that same distance. Closeness does not establish harmonic function.
- Generation samples a small jazz grammar: ii–V–I–VI, tritone substitution, and backdoor cadence. Seventh, ninth, and thirteenth colors vary within the selected grammar; consecutive identical results are avoided. The minor cadence is also available as a preset. Chromatic-orbit and suspended-minor templates extend the palette to eight-chord phrases and rootless altered/Lydian voicings. This is template-based generation, not an arbitrary-dimensional Tonnetz implementation.
- Tonal supplies chord definitions, detection, interval transposition, note spelling, fifths and MIDI frequencies. Chord tones use harmonic spelling (including sharps and double accidentals); the neutral pitch axis uses flats. Choose soft piano (the default), glass keys, drawbar organ, or mellow FM electric keys. Audio uses additive/FM synthesis, filtered saw bass, and synthesized kick/snare/hi-hat through a shared compressor. Choose held chords, swung pocket, or a half-time broken groove. Bass motion controls filter sweeps; volume controls the output gain. This is synthesis, not a sampled piano.
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

`src/theory.js` and `src/progressions.js` contain pure musical logic. `audio.js` / `synthesis.js` own audio nodes, `groove.js` defines beat events, `transport.js` schedules ahead on the audio clock and owns cancellation, `storage.js` validation, and `app.js` / `view.js` UI state and rendering. `docs/design.md` records design acceptance criteria.

## Performing and exploring

Click a chord to select and audition it. Drag its handle to reorder, or focus the handle and use Left/Right. Add a tonic major ninth with Add chord; duplicate and remove controls live on each tile. All arrangement edits support undo. Harmonic moves, bass pads, and nearby voicings replace it and audition the result. The enlarged voice-leading score shares columns and horizontal scrolling with the arrangement. Four colored paths show actual upper-voice pitches; click named notes to audition them. The filled amber pad shows the separate bass anchor; clicking another pad transposes the chord to that bass and plays the result. Harmonic moves use the detected tonic, which may differ from the bass in slash chords. Distances exclude bass motion. Undo restores up to forty edits; a tempo drag counts as one edit. Space toggles transport from the page or focused piano keys; other native controls retain their normal Space behavior. Z undoes when not editing a field.

Instrument and groove settings are session controls; the saved/exported progression contains chords, key, and tempo. Edits and groove changes stop playback. Audio uses an audio-clock lookahead scheduler; hiding the page stops playback to avoid throttled background scheduling.

### Editing individual voices

Drag a chart note vertically to change its pitch in semitone steps, or focus it and use ↑ / ↓. The chart previews within its visible pitch range; releasing reframes the chart around the result. Arrow keys can extend the range. Escape cancels a drag. The first pitch edit preserves the phrase’s current voicings so other chords cannot silently revoice. A completed pitch edit is one undo step and retains exact voice order, octave and pitch through playback, saving, duplication and reordering. Selecting a new chord quality replaces the manual voicing; transposing the bass/key moves it intact. Transposition stops at MIDI limits instead of writing an unloadable session.

Chord names are recomputed with Tonal from all sounding pitches, including the separate bass. Detection supports alternate roots and slash chords such as `Cmaj7/E` and `Dmaj7/C`. Known jazz voicings retain their intended extensions when the fifth is intentionally omitted; otherwise exact Tonal matches take priority, followed by its omitted-fifth detection and upper-chord/slash-bass analysis. Unrecognized collections show their actual note names in brackets, never a fabricated chord symbol. Ambiguous sets use a deterministic name, not a claim to infer compositional intent. Voices may cross or share a pitch; their colors/positions retain identity.

Arrangement dragging lifts a card, shifts neighbors into its gap, scrolls at the edges and snaps on release. Edge shadows indicate hidden columns. All interface text uses the system sans-serif family.

### Tonal integration

[Tonal](https://github.com/tonaljs/tonal) is bundled locally; no theory API or CDN is required at runtime. Version 6.4.3 is pinned: the 6.5.0 package available under this environment’s release-age policy has a missing Node entry point, while 6.5.1 is too recent for that policy.

The curated quality selector stores its existing IDs for session compatibility, but builds its pitches from Tonal chord intervals and displays canonical symbols. In particular, the old `7♯11` profile includes a ninth and now displays `9♯11`; the old `7alt` voicing displays its actual `7♯5♭9` alterations. The four-voice selection, jazz templates, greedy voice-leading distance, audio scheduling and synth envelopes remain application policy. Existing JSON sessions retain their exact notes.

Audition and transport now use the same bass octave (MIDI36 plus the stored bass pitch class), so inversion labels agree with both playback paths. Tonal slash-containing quality aliases are normalized before constructing inversion symbols.

Scale context sits beside the key. Choose among the seven major modes, harmonic and melodic minor, major/minor pentatonic, blues, whole tone, and both diminished scales. Scale changes preserve the arrangement, are undoable, and persist locally and in JSON exports; older sessions default to major. Keyboard dots mark scale tones independently of the filled chord notes. The **In scale** row replaces and auditions the selected chord. It offers one compatible seventh chord (or triad with a doubled root) per available root, using Tonal definitions; it does not claim to list every possible voicing. **Palette → In scale → Generate** makes a four-chord sequence from those choices. Other palettes and named jazz presets retain their chromatic vocabulary. Resolve uses the chosen scale's tonic chord (the existing major-nine color in major).

Roman labels on arrangement cards and the inspector follow the selected key tonic: uppercase for major/dominant, lowercase for minor, ° for diminished and ø for half-diminished. Accidentals use the conventional major-scale reference even in minor (e.g. E♭ in C minor is ♭III). Extensions are retained; a slash letter names the actual bass, not a secondary-dominant analysis. Unrecognized pitch collections show an em dash. Labels update during note dragging and after transposition without changing the played notes.
