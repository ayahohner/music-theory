import { chordLabel, chordNotes } from './chord-names.js';
import { QUALITIES } from './chord-catalog.js';
import { display, rootName, spellNote, transposePitch, transposeRoot } from './tonal.js';
export { QUALITIES } from './chord-catalog.js';
export const NOTES = Array.from({ length: 12 }, (_, i) => display(rootName(i)));
export const wrap = (value) => ((value % 12) + 12) % 12;
export const label = chordLabel;
export const pitchClasses = (chord) =>
  chord.notes?.map(wrap) ?? QUALITIES[chord.quality].map((interval) => wrap(chord.root + interval));
export const noteName = (midi, chord) => spellNote(midi, chord ? chordNotes(chord) : []);
export function transpose(chords, amount) {
  if (!canTranspose(chords, amount)) return chords;
  return chords.map((chord) => transposeChord(chord, amount));
}
export function canTranspose(chords, amount) {
  return chords.every((chord) => (chord.notes ?? []).every((note) => note + amount >= 0 && note + amount <= 127));
}
export function transposeChord(chord, amount) {
  if (!canTranspose([chord], amount)) return chord;
  const result = { ...chord, root: transposeRoot(chord.root, amount) };
  if (chord.notes) result.notes = chord.notes.map((note) => transposePitch(note, amount));
  return result;
}
export const movement = (from, to) => from.reduce((sum, note, index) => sum + Math.abs(note - to[index]), 0);

export function voicings(chord) {
  if (chord.notes) return [[...chord.notes]];
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
