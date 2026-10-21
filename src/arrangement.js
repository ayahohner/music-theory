export function duplicateAt(chords, index) {
  if (chords.length >= 16) return chords;
  const result = [...chords];
  result.splice(index + 1, 0, { ...chords[index] });
  return result;
}
export function removeAt(chords, index) {
  if (chords.length === 1) return chords;
  return chords.filter((_, position) => position !== index);
}
export function moveTo(chords, from, to) {
  const result = [...chords];
  const [chord] = result.splice(from, 1);
  result.splice(to, 0, chord);
  return result;
}
export function movedSelection(selected, from, to) {
  const identities = Array.from({ length: 16 }, (_, i) => i);
  return moveTo(identities, from, to).indexOf(selected);
}
export function addedChord(chords, key) {
  if (chords.length >= 16) return chords;
  return [...chords, { root: key, quality: 'maj9' }];
}
