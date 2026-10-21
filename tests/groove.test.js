import { expect, it } from 'vitest';
import { barEvents } from '../src/groove.js';
import { transformations } from '../src/harmony.js';
import { validChord } from '../src/storage.js';
it('keeps all onsets inside the bar, preserves notes, and distinguishes feels', () => {
  const notes = [36, 60, 64, 67, 71];
  const hold = barEvents(notes, 2, 'hold'),
    pocket = barEvents(notes, 2, 'pocket'),
    broken = barEvents(notes, 2, 'broken');
  expect(hold.map((e) => e.kind)).toEqual(['chord', 'bass']);
  for (const events of [hold, pocket, broken]) {
    expect(events.every((e) => e.at >= 0 && e.at < 2)).toBe(true);
    expect(events.find((e) => e.kind === 'chord').notes).toEqual(notes.slice(1));
    expect(events.find((e) => e.kind === 'bass').notes).toEqual([36]);
  }
  expect(pocket.filter((e) => e.kind === 'snare').map((e) => e.at)).toEqual([0.5, 1.5]);
  expect(broken.filter((e) => e.kind === 'snare').map((e) => e.at)).toEqual([1]);
  expect(pocket.find((e) => e.kind === 'hat' && e.at > 0).at).toBeCloseTo(0.33);
});
it('provides valid transformations in all twelve keys', () => {
  for (let root = 0; root < 12; root++) {
    const moves = transformations({ root, quality: 'm9' }, 5);
    expect(moves.every((item) => validChord(item.chord))).toBe(true);
    expect(moves[0].chord).toEqual({ root: 5, quality: 'maj9' });
    expect(moves[2].chord.root).toBe((root + 1) % 12);
    expect(moves[3].chord.root).toBe((root + 6) % 12);
  }
});
