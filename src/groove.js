export const GROOVES = {
  hold: { chords: [0], bass: [0], kick: [], snare: [], hat: [], swing: 0 },
  pocket: {
    chords: [0, 1.75, 3],
    bass: [0, 1.5, 2.5, 3.5],
    kick: [0, 2.5],
    snare: [1, 3],
    hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
    swing: 0.16,
  },
  broken: {
    chords: [0, 0.75, 2.5, 3.5],
    bass: [0, 0.75, 1.5, 2, 2.75, 3.5],
    kick: [0, 1.75, 3.5],
    snare: [2],
    hat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25, 3.5, 3.75],
    swing: 0,
  },
};
export function barEvents(notes, duration, groove) {
  const pattern = GROOVES[groove];
  const beat = duration / 4;
  const harmonic = pattern.chords.map((at) => event('chord', at, beat, pattern.swing, notes.slice(1)));
  const bass = pattern.bass.map((at) => event('bass', at, beat, pattern.swing, [notes[0] - 12]));
  const drums = ['kick', 'snare', 'hat'].flatMap((kind) =>
    pattern[kind].map((at) => event(kind, at, beat, pattern.swing, [])),
  );
  return [...harmonic, ...bass, ...drums].sort((a, b) => a.at - b.at);
}
function event(kind, at, beat, swing, notes) {
  const offset = Number.isInteger(at) ? 0 : swing;
  return { kind, at: (at + offset) * beat, notes };
}
