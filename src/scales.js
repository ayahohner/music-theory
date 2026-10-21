import { Chord, Interval, Note, Scale } from 'tonal';
import { editedChord } from './chord-names.js';
import { rootName } from './tonal.js';
export const SCALES = [
  'major',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'minor',
  'locrian',
  'harmonic minor',
  'melodic minor',
  'major pentatonic',
  'minor pentatonic',
  'blues',
  'whole tone',
  'diminished',
  'half-whole diminished',
];
export function scaleFor(key, type = 'major') {
  return Scale.get(`${rootName(key)} ${type}`);
}
export function validScale(type) {
  return type === undefined || SCALES.includes(type);
}
export function scalePitches(key, type) {
  return scaleFor(key, type).notes.map(Note.chroma);
}
const TYPES = ['maj7', 'm7', '7', 'm7b5', 'dim7', 'mM7', 'aug7', 'maj7#5', 'M', 'm', 'aug', 'dim', 'sus4', 'sus2'];
function fittingChord(root, pitches) {
  return TYPES.map((type) => Chord.getChord(type, root)).find((chord) =>
    chord.notes.every((note) => pitches.includes(Note.chroma(note))),
  );
}
function playableChord(chord) {
  const root = Note.chroma(chord.tonic);
  const notes = chord.intervals.map((interval) => 48 + root + Interval.semitones(interval));
  if (notes.length === 3) notes.push(notes[0] + 12);
  return editedChord({ root }, notes);
}
export function scaleChords(key, type) {
  const scale = scaleFor(key, type);
  const pitches = scale.notes.map(Note.chroma);
  return scale.notes
    .map((root) => fittingChord(root, pitches))
    .filter(Boolean)
    .map(playableChord);
}
export function generateInScale(key, type, random = Math.random) {
  const choices = scaleChords(key, type);
  return Array.from({ length: 4 }, (_, i) =>
    structuredClone(choices[i === 3 ? 0 : Math.floor(random() * choices.length)]),
  );
}
