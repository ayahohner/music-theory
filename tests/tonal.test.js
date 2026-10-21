import { expect, it } from 'vitest';
import { Chord, Note, Pcset } from 'tonal';
import { QUALITIES, label, voice, noteName, transpose, voicedProgression } from '../src/theory.js';
import { chordSymbol, editedChord } from '../src/chord-names.js';
import { ascii, pitchClass } from '../src/tonal.js';
import { PRESETS, preset } from '../src/progressions.js';
import { validSession, save, load } from '../src/storage.js';

it('uses Tonal definitions for every curated voicing in all twelve transpositions', () => {
  for (let root = 0; root < 12; root++)
    for (const quality of Object.keys(QUALITIES)) {
      const chord = { root, quality },
        notes = voice(chord),
        symbol = chordSymbol(chord);
      const full = Chord.get(symbol);
      expect(full.empty, symbol).toBe(false);
      const pcs = full.notes.map(Note.chroma);
      expect(
        notes.every((n) => pcs.includes(n % 12)),
        symbol,
      ).toBe(true);
      expect(label({ ...chord, notes }), symbol).toBe(label(chord));
      expect(notes.map((n) => Note.midi(ascii(noteName(n, chord))))).toEqual(notes);
    }
});
it('recognizes inversions and non-chord basses rather than inventing root-based intervals', () => {
  expect(label(editedChord({ root: 4 }, [60, 64, 67, 71]))).toBe('Cmaj7/E');
  expect(label(editedChord({ root: 0 }, [61, 65, 68, 72]))).toBe('D♭maj7/C');
  expect(label(editedChord({ root: 0 }, [62, 66, 69, 73]))).toBe('Dmaj7/C');
  expect(label(editedChord({ root: 0 }, [60, 64, 67, 72]))).toBe('C');
  expect(label(editedChord({ root: 2 }, [54, 57, 60, 64]))).toBe('D9');
});
it('keeps jazz intent for known omitted-fifth voicings and names actual alterations', () => {
  expect(label({ root: 0, quality: '7alt' })).toBe('C7♯5♭9');
  expect(label({ root: 0, quality: '7♯11' })).toBe('C9♯11');
  for (const quality of ['13', 'maj9♯11', 'm11']) {
    const chord = { root: 0, quality };
    expect(label({ ...chord, notes: voice(chord) })).toBe(label(chord));
  }
  expect(label(editedChord({ root: 0 }, [60, 64, 67, 70]))).toBe('C7');
});
it('shows an explicit pitch collection only when Tonal cannot name it', () => {
  const chord = editedChord({ root: 0 }, [60, 61, 66, 71]);
  expect(chordSymbol(chord)).toBe('');
  expect(label(chord)).toBe('[C D♭ G♭ B]');
});
it('spells chord tones by harmonic role with exact MIDI round trips', () => {
  expect(noteName(54, { root: 2, quality: '9' })).toBe('F♯3');
  expect(noteName(57, { root: 0, quality: 'dim7' })).toBe('B♭♭3');
  expect(noteName(54)).toBe('G♭3');
  const chord = editedChord({ root: 0 }, [40, 55, 58, 60]);
  expect(label(chord)).toBe('C7');
  const low = editedChord({ root: 0 }, [28, 55, 58, 60]);
  expect(label(low)).toBe('C7/E');
});
it('preserves legacy sessions and exact notes across all preset names and transposition', () => {
  for (const name of Object.keys(PRESETS)) {
    const chords = preset(name),
      notes = voicedProgression(chords);
    const manual = chords.map((chord, i) => ({ ...chord, notes: notes[i] }));
    const state = { chords: manual, key: 0, bpm: 96 };
    expect(validSession(state)).toBe(true);
    save(localStorage, state);
    expect(load(localStorage)).toEqual(state);
    expect(transpose(manual, 1).map((c) => c.notes)).toEqual(notes.map((row) => row.map((n) => n + 1)));
    expect(transpose(manual, 12).map(label)).toEqual(manual.map(label));
  }
});
it('uses the full Tonal dictionary beyond the curated quality selector', () => {
  const notes = [60, 64, 68, 71];
  const chord = editedChord({ root: 0 }, notes);
  expect(Chord.get(chordSymbol(chord)).empty).toBe(false);
  expect(Pcset.isEqual(Chord.get(chordSymbol(chord)).notes, notes.map(pitchClass))).toBe(true);
});
it('round-trips minor-major slash aliases without blank labels', () => {
  for (let root = 0; root < 12; root++) {
    const chord = editedChord(
      { root },
      [60, 61, 64, 68].map((n) => n + root),
    );
    expect(label(chord)).not.toBe('');
    expect(Chord.get(chordSymbol(chord)).empty).toBe(false);
    expect(label(chord)).not.toContain('[');
    for (const note of chord.notes) expect(Note.midi(ascii(noteName(note, chord)))).toBe(note);
  }
});
it('uses the detected tonic for harmonic moves and the same bass pitch during playback', async () => {
  const { transformations } = await import('../src/harmony.js');
  const { barEvents } = await import('../src/groove.js');
  const chord = editedChord({ root: 4 }, [60, 64, 67, 71]);
  expect(label(chord)).toBe('Cmaj7/E');
  expect(transformations(chord, 0).find((m) => m.name === 'Pull').chord.root).toBe(7);
  const low = editedChord({ root: 0 }, [28, 55, 58, 60]);
  expect(label(low)).toBe('C7/E');
  expect(barEvents([36, ...low.notes], 2, 'hold').find((e) => e.kind === 'bass').notes).toEqual([36]);
});
