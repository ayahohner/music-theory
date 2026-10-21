import { expect, it } from 'vitest';
import { load, save, validChord, validSession } from '../src/storage.js';
import { preset } from '../src/progressions.js';
const session = { chords: preset('Jazz turnaround'), key: 0, bpm: 96 };
it('round-trips a session and rejects malformed or oversized data', () => {
  localStorage.clear();
  expect(load(localStorage)).toBeNull();
  expect(save(localStorage, session)).toBe(true);
  expect(load(localStorage)).toEqual(session);
  for (const value of [
    null,
    {},
    { ...session, bpm: 0 },
    { ...session, key: 12 },
    { ...session, chords: [] },
    { ...session, chords: Array(17).fill(session.chords[0]) },
  ])
    expect(validSession(value)).toBe(false);
  for (const chord of [
    null,
    { root: -1, quality: 'm7' },
    { root: 0, quality: 'constructor' },
    { root: 0.5, quality: 'm7' },
  ])
    expect(validChord(chord)).toBe(false);
  localStorage.setItem('music-theory-session', '{bad');
  expect(load(localStorage)).toBeNull();
});
it('survives denied storage access', () => {
  const storage = {
    getItem: () => {
      throw Error('denied');
    },
    setItem: () => {
      throw Error('denied');
    },
  };
  expect(load(storage)).toBeNull();
  expect(save(storage, session)).toBe(false);
});
