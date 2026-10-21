# Chord studio acceptance criteria

Primary task: compose and audition a short jazz progression, change an individual chord, and compare nearby harmonies. Controls must work with keyboard and pointer, show selected and playing state, remain usable at 320px, and give explicit audio/storage failure feedback. No account or backend required.

Considered a full-screen lattice with floating controls and a progression-first studio. Selected the studio: progression order and direct listening matter before abstract geometry. Use dark instrument-panel surfaces, mint for selected notes and primary actions, large chord symbols, and a playable keyboard as the main visual artifact. Nearby harmonies are a six-result graph neighborhood, not an n-dimensional lattice visualization.

Scope: twelve-tone equal temperament, four-note upper voicings and a root bass, template-based jazz variations, local persistence and JSON export. No audio transcription, song lookup, MIDI export, or claim of a sampled acoustic piano. Chord extensions use intentionally incomplete four-note voicings. Chord tones use Tonal harmonic spelling; the neutral pitch axis uses flat chromatic labels.

User refinement: no eyebrows, marketing presentation, or unnecessary text. Treat this as a working single-page instrument. Applied the local design taxonomy: prioritize editable musical objects (content selection), distinguish selection from playback (state encoding), retain focus during replacement (input handling), and keep distance explanations adjacent to the ranked choices (annotation). Removed the hero, brand ornament, badge, and decorative footer.

## Instrument upgrade

Acceptance: actual synthesis and timing changes, a single-screen desktop workspace at 1280×720 (including keyboard), and no page-level horizontal overflow at 320px. Keep chord identity, selected chord, and playing chord distinct. Harmonic exploration must preserve keyboard focus, be audible, and be undoable. Stop must cancel future scheduled audio and pending resumes.

Applied the design ontology rather than embedding it: information hierarchy makes progression the top-level object; conceptual models distinguish chord edits from global performance controls; equivalent representations pair chord labels with pitch trajectories and sound; state behavior governs undo/cancellation; geometric adaptation keeps the instrument together on desktop and scrolls only genuinely sequential/keyboard content horizontally on narrow screens. A full-canvas spatial explorer was considered, but would hide direct chord controls and make sequential editing less efficient than this dense instrument layout.

The visual language uses restrained dark instrument surfaces, amber for edit selection, teal for playback, and four consistent colors for low-to-high voice paths. No marketing copy, eyebrows, or decorative status badges. The circle-of-fifths pads transpose the bass anchor and chord, not a claim to implement an n-dimensional Tonnetz.

## Arrangement and voice-leading revision

Arrangement tiles carry drag handles, duplicate and remove icons. Clicking the chord auditions it; keyboard arrows on a handle reorder it. Add and duplicate reveal the new selection, and deleting another chord preserves selection identity. A shared horizontal timeline aligns each chord with four named, individually playable voice notes on a 228px pitch plot. The pitch axis stays fixed and the score heading remains visible during horizontal scrolling. This uses spatial correspondence to make harmonic consequences visible beside their cause.

Transpose sits with key, transport with arrangement, sound selection with keyboard, and root-changing controls with the selected chord. Amber pad fill denotes the separate bass anchor. Instrument choices use synthesis, with additive soft piano as default and reduced FM modulation available as an alternative. Space remains transport control while piano keys are focused; other native buttons retain their normal activation behavior.

## Direct manipulation

Acceptance: a chart-note drag previews pitch and the corresponding chord label, commits one reversible edit, preserves explicit notes through storage/playback, and has an arrow-key equivalent. Card reorder visibly carries the card with the pointer, makes space with neighbor movement, and settles at the dropped position. Hidden timeline columns get edge shadows that disappear at the corresponding end. Remove monospace throughout.

Distinct horizontal positions keep all four voices reachable even at unison. Note drag previews stay inside the visible pitch range; the score reframes after release. Escape cancels either drag. The sounding bass anchors inversion notation, and unmatched pitch collections are labeled with actual note names rather than assigned approximate chord names. Reduced-motion users receive immediate neighbor movement without animated settling.

## Tonal naming

Acceptance: shared Tonal-backed chord labels across cards, inspector, transformations and neighbors; shared harmonic note spelling across chart, inspector and piano; unchanged playback pitches and saved-session compatibility. The quality selector uses canonical names while preserving legacy storage IDs. Recognition includes sounding bass, alternate roots and slash chords. The application retains its deliberate four-voice omissions, rather than silently adding notes from a complete chord definition.

The inspector calls the stored bass anchor “Bass” because Tonal can infer a different tonic in a slash chord. Harmonic moves use that detected tonic. Both audition and transport play the same bass octave.
