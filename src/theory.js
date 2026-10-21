export const NOTES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export const QUALITIES = {
  'maj9♯11': [4, 11, 14, 18],
  '7♯11': [4, 10, 14, 18],
  '7alt': [4, 10, 13, 20],
  m11: [3, 10, 14, 17],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  7: [0, 4, 7, 10],
  maj9: [4, 7, 11, 14],
  m9: [3, 7, 10, 14],
  9: [4, 7, 10, 14],
  13: [4, 10, 14, 21],
  '7♭9': [4, 7, 10, 13],
  'm7♭5': [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  '7sus4': [0, 5, 7, 10],
  '6/9': [0, 4, 9, 14],
};
export const wrap = (value) => ((value % 12) + 12) % 12;
export const label = (chord) => `${NOTES[chord.root]}${chord.quality}`;
export const pitchClasses = (chord) => QUALITIES[chord.quality].map((interval) => wrap(chord.root + interval));
export const noteName = (midi) => `${NOTES[wrap(midi)]}${Math.floor(midi / 12) - 1}`;
export const transpose = (chords, amount) => chords.map((chord) => ({ ...chord, root: wrap(chord.root + amount) }));
export const movement = (from, to) => from.reduce((sum, note, index) => sum + Math.abs(note - to[index]), 0);

export function voicings(chord) {
  const pitches = pitchClasses(chord).sort((a, b) => a - b);
  return pitches
    .flatMap((_, inversion) => {
      const rotated = [...pitches.slice(inversion), ...pitches.slice(0, inversion).map((n) => n + 12)];
      return [48, 60].map((octave) => rotated.map((n) => n + octave));
    })
    .filter((notes) => notes[3] <= 83);
}

export function voice(chord, previous = [53, 57, 60, 64]) {
  return voicings(chord).sort((a, b) => movement(previous, a) - movement(previous, b))[0];
}

export function voicedProgression(chords) {
  return chords.reduce((result, chord) => {
    result.push(voice(chord, result.at(-1)));
    return result;
  }, []);
}

export function neighbors(chord, notes, previous = notes) {
  return NOTES.flatMap((_, root) => Object.keys(QUALITIES).map((quality) => ({ root, quality })))
    .filter((candidate) => label(candidate) !== label(chord))
    .map((candidate) => ({ chord: candidate, notes: voice(candidate, previous) }))
    .map((candidate) => ({ ...candidate, distance: movement(notes, candidate.notes) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6);
}
