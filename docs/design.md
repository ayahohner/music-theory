# Chord studio acceptance criteria

Primary task: compose and audition a short jazz progression, change an individual chord, and compare nearby harmonies. Controls must work with keyboard and pointer, show selected and playing state, remain usable at 320px, and give explicit audio/storage failure feedback. No account or backend required.

Considered a full-screen lattice with floating controls and a progression-first studio. Selected the studio: progression order and direct listening matter before abstract geometry. Use dark instrument-panel surfaces, mint for selected notes and primary actions, large chord symbols, and a playable keyboard as the main visual artifact. Nearby harmonies are a six-result graph neighborhood, not an n-dimensional lattice visualization.

Scope: twelve-tone equal temperament, four-note upper voicings and a root bass, template-based jazz variations, local persistence and JSON export. No audio transcription, song lookup, MIDI export, or claim of a sampled acoustic piano. Chord extensions use intentionally incomplete four-note voicings. Pitch names use flat enharmonic labels; they are not context-aware theoretical spellings.

User refinement: no eyebrows, marketing presentation, or unnecessary text. Treat this as a working single-page instrument. Applied the local design taxonomy: prioritize editable musical objects (content selection), distinguish selection from playback (state encoding), retain focus during replacement (input handling), and keep distance explanations adjacent to the ranked choices (annotation). Removed the hero, brand ornament, badge, and decorative footer.

## Instrument upgrade

Acceptance: actual synthesis and timing changes, a single-screen desktop workspace at 1280×720 (including keyboard), and no page-level horizontal overflow at 320px. Keep chord identity, selected chord, and playing chord distinct. Harmonic exploration must preserve keyboard focus, be audible, and be undoable. Stop must cancel future scheduled audio and pending resumes.

Applied the design ontology rather than embedding it: information hierarchy makes progression the top-level object; conceptual models distinguish chord edits from global performance controls; equivalent representations pair chord labels with pitch trajectories and sound; state behavior governs undo/cancellation; geometric adaptation keeps the instrument together on desktop and scrolls only genuinely sequential/keyboard content horizontally on narrow screens. A full-canvas spatial explorer was considered, but would hide direct chord controls and make sequential editing less efficient than this dense instrument layout.

The visual language uses restrained dark instrument surfaces, amber for edit selection, teal for playback, and four consistent colors for low-to-high voice paths. No marketing copy, eyebrows, or decorative status badges. The circle-of-fifths pads are a root selector, not a claim to implement an n-dimensional Tonnetz.
