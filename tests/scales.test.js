import { expect, it } from 'vitest';
import { Chord, Note } from 'tonal';
import { SCALES, scaleFor, scalePitches, scaleChords, generateInScale, validScale } from '../src/scales.js';
import { roman } from '../src/roman.js';
import { chordSymbol } from '../src/chord-names.js';
import { validChord, validSession, save, load } from '../src/storage.js';
import { preset } from '../src/progressions.js';
import { transposeChord } from '../src/theory.js';
it('builds playable, named chords entirely within each scale in all twelve keys', () => {
  for (const scale of SCALES)
    for (let key = 0; key < 12; key++) {
      expect(scaleFor(key, scale).empty, `${key} ${scale}`).toBe(false);
      const pitches = scalePitches(key, scale);
      const chords = scaleChords(key, scale);
      expect(chords.length, `${key} ${scale}`).toBeGreaterThan(0);
      for (const chord of chords) {
        expect(validChord(chord)).toBe(true);
        expect(Chord.get(chordSymbol(chord)).empty).toBe(false);
        expect([chord.root, ...chord.notes.map((n) => n % 12)].every((n) => pitches.includes(n))).toBe(true);
        expect(roman(chord, key, scale)).not.toBe('—');
      }
      const generated = generateInScale(key, scale, () => 0.6);
      expect(generated).toHaveLength(4);
      expect(generated.at(-1)).toEqual(chords[0]);
      expect(
        generated.every((chord) => chords.some((candidate) => JSON.stringify(candidate) === JSON.stringify(chord))),
      ).toBe(true);
    }
});
it('expresses qualities, borrowed roots, slash basses, and unknown sets relative to the key', () => {
  expect(preset('Jazz turnaround').map((c) => roman(c, 0))).toEqual(['ii9', 'V13', 'Imaj9', 'VI7♭9']);
  expect(roman({ root: 8, quality: 'maj7' }, 0, 'minor')).toBe('♭VImaj7');
  expect(roman({ root: 2, quality: 'm7♭5' }, 0, 'minor')).toBe('iiø7');
  expect(roman({ root: 11, quality: 'dim7' }, 0)).toBe('vii°7');
  expect(roman({ root: 4, quality: 'custom', notes: [60, 64, 67, 71] }, 0)).toBe('Imaj7/E');
  expect(roman({ root: 0, quality: 'custom', notes: [60, 61, 66, 71] }, 0)).toBe('—');
  for (let key = 0; key < 12; key++) {
    expect(roman(transposeChord({ root: 2, quality: 'm9' }, key), key)).toBe('ii9');
  }
});
it('uses characteristic scale notes and conventional major-reference accidentals', () => {
  expect(scaleFor(0, 'dorian').notes).toEqual(['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb']);
  expect(scaleFor(0, 'harmonic minor').notes).toContain('B');
  expect(scaleFor(0, 'lydian').notes).toContain('F#');
  expect(roman({ root: 6, quality: 'm7♭5' }, 0, 'lydian')).toBe('♯ivø7');
  expect(scaleFor(7, 'major').notes.map(Note.chroma)).toContain(6);
});
it('persists scale choice while accepting legacy sessions and rejecting unknown scales', () => {
  const session = { chords: preset('Jazz turnaround'), key: 0, bpm: 96 };
  expect(validSession(session)).toBe(true);
  expect(validSession({ ...session, scale: 'nonsense' })).toBe(false);
  expect(validScale(null)).toBe(false);
  expect(validScale(undefined)).toBe(true);
  save(localStorage, { ...session, scale: 'dorian' });
  expect(load(localStorage).scale).toBe('dorian');
});
