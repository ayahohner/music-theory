import { QUALITIES } from './theory.js';
export const initial = () => ({ chords: [], key: 0, bpm: 96 });
export function validChord(chord) {
  return Number.isInteger(chord?.root) && chord.root >= 0 && chord.root < 12 && Object.hasOwn(QUALITIES, chord.quality);
}
export function validSession(value) {
  return validSettings(value) && value.chords.length > 0 && value.chords.length <= 16 && value.chords.every(validChord);
}
function validSettings(value) {
  return (
    Array.isArray(value?.chords) &&
    Number.isInteger(value.key) &&
    value.key >= 0 &&
    value.key < 12 &&
    validTempo(value.bpm)
  );
}
export function validTempo(bpm) {
  return Number.isFinite(bpm) && bpm >= 40 && bpm <= 200;
}
export function load(storage) {
  try {
    const saved = JSON.parse(storage.getItem('music-theory-session'));
    return validSession(saved) ? saved : null;
  } catch {
    return null;
  }
}
export function save(storage, session) {
  try {
    storage.setItem('music-theory-session', JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}
