import { scaleChords } from './scales.js';
import { harmonicRoot } from './chord-names.js';
import { wrap, transposeChord } from './theory.js';
export function transformations(chord, key, scale = 'major') {
  const root = harmonicRoot(chord);
  return [
    { name: 'Resolve', hint: 'Home · selected scale', chord: homeChord(key, scale) },
    { name: 'Pull', hint: 'Dominant of this root', chord: { root: wrap(root + 7), quality: '7♭9' } },
    { name: 'Side-slip', hint: 'Up a semitone', chord: transposeChord(chord, 1) },
    { name: 'Tritone', hint: 'Dominant a tritone away', chord: { root: wrap(root + 6), quality: '7♯11' } },
    { name: 'Darken', hint: 'Minor ninth color', chord: { root, quality: 'm9' } },
    { name: 'Lift', hint: 'Lydian color', chord: { root, quality: 'maj9♯11' } },
  ];
}

function homeChord(key, scale) {
  if (scale === 'major') return { root: key, quality: 'maj9' };
  return scaleChords(key, scale)[0];
}
