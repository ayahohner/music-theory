import { display } from './tonal.js';
import { ChordType, Interval } from 'tonal';
const PROFILES = {
  'maj9♯11': ['maj9#11', [3, 7, 9, 11]],
  '7♯11': ['9#11', [3, 7, 9, 11]],
  '7alt': ['7#5b9', [3, 7, 9, 5]],
  m11: ['m11', [3, 7, 9, 11]],
  maj7: ['maj7', [1, 3, 5, 7]],
  m7: ['m7', [1, 3, 5, 7]],
  7: ['7', [1, 3, 5, 7]],
  maj9: ['maj9', [3, 5, 7, 9]],
  m9: ['m9', [3, 5, 7, 9]],
  9: ['9', [3, 5, 7, 9]],
  13: ['13', [3, 7, 9, 13]],
  '7♭9': ['7b9', [3, 5, 7, 9]],
  'm7♭5': ['m7b5', [1, 3, 5, 7]],
  dim7: ['dim7', [1, 3, 5, 7]],
  '7sus4': ['7sus4', [1, 4, 5, 7]],
  '6/9': ['6/9', [1, 3, 6, 9]],
};
export const chordType = (quality) => PROFILES[quality]?.[0] ?? '';
export const QUALITIES = Object.fromEntries(
  Object.entries(PROFILES).map(([quality, profile]) => [quality, upperStructure(profile)]),
);
function upperStructure([type, degrees]) {
  const intervals = ChordType.get(type).intervals;
  const notes = degrees.map((degree) =>
    Interval.semitones(intervals.find((interval) => Interval.get(interval).num === degree)),
  );
  return notes.map((note, index) => raisedPitch(note, notes.slice(0, index)));
}
function raisedPitch(note, previous) {
  const floor = Math.max(-1, ...previous);
  while (note <= floor) note += 12;
  return note;
}

export const qualityLabel = (quality) => display(ChordType.get(chordType(quality)).aliases[0]);
