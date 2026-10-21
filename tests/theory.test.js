import { describe, expect, it } from 'vitest';
import { generate, preset } from '../src/progressions.js';
import {
  movement,
  neighbors,
  pitchClasses,
  QUALITIES,
  transpose,
  voice,
  voicedProgression,
  voicings,
} from '../src/theory.js';
describe('musical invariants', () => {
  it('builds a ii–V–I–VI jazz turnaround and transposes reversibly', () => {
    const chords = preset('Jazz turnaround');
    expect(chords.map((c) => c.root)).toEqual([2, 7, 0, 9]);
    expect(transpose(transpose(chords, -1), 1)).toEqual(chords);
    expect(pitchClasses({ root: 2, quality: 'm9' })).toEqual([2, 5, 0, 4]);
  });
  it('keeps every candidate sorted, in range, and faithful to its chord', () => {
    for (let root = 0; root < 12; root++)
      for (const quality of Object.keys(QUALITIES)) {
        const chord = { root, quality };
        for (const notes of voicings(chord)) {
          expect(notes).toEqual([...notes].sort((a, b) => a - b));
          expect(notes[0]).toBeGreaterThanOrEqual(48);
          expect(notes.at(-1)).toBeLessThanOrEqual(84);
          expect(notes.map((n) => n % 12).sort((a, b) => a - b)).toEqual(pitchClasses(chord).sort((a, b) => a - b));
        }
      }
  });
  it('chooses the minimum available ordered voice movement', () => {
    const previous = [53, 57, 60, 64],
      chord = { root: 7, quality: '13' };
    expect(movement(previous, voice(chord, previous))).toBe(
      Math.min(...voicings(chord).map((v) => movement(previous, v))),
    );
    expect(voicedProgression(preset('Jazz turnaround'))).toHaveLength(4);
  });
  it('ranks distinct neighbors by voice movement', () => {
    const chord = { root: 0, quality: 'maj9' },
      rows = neighbors(chord, voice(chord));
    expect(rows).toHaveLength(6);
    expect(rows.every((row) => JSON.stringify(row.chord) !== JSON.stringify(chord))).toBe(true);
    expect(rows.map((row) => row.distance)).toEqual(rows.map((row) => row.distance).sort((a, b) => a - b));
  });
  it('selects allowed variations deterministically with an injected RNG', () => {
    expect(generate(0, 0, () => 0.9).map((c) => c.root)).toEqual([2, 7, 0, 9]);
    expect(generate(3, 1, () => 0.9).map((c) => c.root)).toEqual([5, 4, 3, 3]);
    expect(generate(5, 2, () => 0.99).map((c) => c.root)).toEqual([10, 3, 5, 5]);
  });
});

it('neighbor scores match the voicing actually heard after replacement', () => {
  const chords = preset('Jazz turnaround');
  const notes = voicedProgression(chords);
  for (let index = 0; index < chords.length; index++) {
    const previous = notes[index - 1] ?? [60, 64, 67, 71];
    for (const candidate of neighbors(chords[index], notes[index], previous)) {
      const changed = [...chords];
      changed[index] = candidate.chord;
      const actual = voicedProgression(changed)[index];
      expect(candidate.notes).toEqual(actual);
      expect(candidate.distance).toBe(movement(notes[index], actual));
    }
  }
});

it('varies chord colors and prevents an unchanged generated progression', () => {
  const low = generate(0, 0, () => 0);
  const high = generate(0, 0, () => 0.99);
  expect(low).not.toEqual(high);
  expect(generate(0, 0, () => 0, low)).not.toEqual(low);
  expect(generate(0, 0, () => 0.99, high)).not.toEqual(high);
});
