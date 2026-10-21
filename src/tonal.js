import { Interval, Midi, Note } from 'tonal';
export const ascii = (text) => text.replaceAll('♭', 'b').replaceAll('♯', '#');
export const display = (text) => text.replaceAll('b', '♭').replaceAll('#', '♯');
export const pitchName = (midi) => Midi.midiToNoteName(midi);
export const pitchClass = (midi) => Note.pitchClass(pitchName(midi));
export const rootName = (root) => pitchClass(60 + root);
export const transposePitch = (midi, amount) =>
  Note.midi(Note.transpose(pitchName(midi), Interval.fromSemitones(amount)));
export const transposeRoot = (root, amount) =>
  Note.chroma(Note.transpose(rootName(root), Interval.fromSemitones(amount)));
export function spellNote(midi, names = []) {
  const spelling = names.find((name) => Note.chroma(name) === Note.chroma(pitchName(midi)));
  return display(spelling ? Note.enharmonic(pitchName(midi), spelling) : pitchName(midi));
}
