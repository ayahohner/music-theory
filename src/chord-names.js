const INTERVALS = ['1', '♭9', '9', '♭3', '3', '11', '♯11', '5', '♭13', '13', '♭7', '7'];
const EXTRA = {
  '9sus4': [0, 2, 5, 7, 10],
  maj9sus4: [0, 2, 5, 7, 11],
  '7♯9': [0, 3, 4, 7, 10],
  'maj7♯11': [0, 4, 6, 7, 11],
  'm7♭9': [0, 1, 3, 7, 10],
  mMaj9: [0, 2, 3, 7, 11],
  'maj9♯5': [0, 2, 4, 8, 11],
  'm9♭5': [0, 2, 3, 6, 10],
  '9♭5': [0, 2, 4, 6, 10],
  '9♯5': [0, 2, 4, 8, 10],
  '7♭13': [0, 4, 7, 8, 10],
  'maj7♭5': [0, 4, 6, 11],
  maj7sus4: [0, 5, 7, 11],
  '': [0, 4, 7],
  m: [0, 3, 7],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  6: [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  mMaj7: [0, 3, 7, 11],
  '7♭5': [0, 4, 6, 10],
  'maj7♯5': [0, 4, 8, 11],
  '7♯5': [0, 4, 8, 10],
  add9: [0, 2, 4, 7],
  madd9: [0, 2, 3, 7],
};
export function intervals(notes, root) {
  return [...new Set([0, ...notes.map((note) => (((note - root) % 12) + 12) % 12)])].sort((a, b) => a - b);
}
export function identify(notes, root, qualities) {
  const actual = intervals(notes, root).join(',');
  return Object.entries({ ...qualities, ...EXTRA }).find(
    ([, pitches]) => intervals(pitches, 0).join(',') === actual,
  )?.[0];
}
export function voicingName(chord, qualities) {
  return (
    identify(chord.notes, chord.root, qualities) ??
    `(${intervals(chord.notes, chord.root)
      .map((i) => INTERVALS[i])
      .join(',')})`
  );
}
export function editedChord(chord, notes, qualities) {
  const quality = identify(notes, chord.root, qualities);
  return { root: chord.root, quality: Object.hasOwn(qualities, quality) ? quality : 'custom', notes: [...notes] };
}
