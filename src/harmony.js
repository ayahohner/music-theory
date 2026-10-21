import { wrap } from './theory.js';
export function transformations(chord, key) {
  return [
    { name: 'Resolve', hint: 'Home · major ninth', chord: { root: key, quality: 'maj9' } },
    { name: 'Pull', hint: 'Dominant of this root', chord: { root: wrap(chord.root + 7), quality: '7♭9' } },
    { name: 'Side-slip', hint: 'Up a semitone', chord: { ...chord, root: wrap(chord.root + 1) } },
    { name: 'Tritone', hint: 'Dominant a tritone away', chord: { root: wrap(chord.root + 6), quality: '7♯11' } },
    { name: 'Darken', hint: 'Minor ninth color', chord: { root: chord.root, quality: 'm9' } },
    { name: 'Lift', hint: 'Lydian color', chord: { root: chord.root, quality: 'maj9♯11' } },
  ];
}
