import { wrap } from './theory.js';
export const PRESETS = {
  'Jazz turnaround': [
    [2, 'm9'],
    [7, '13'],
    [0, 'maj9'],
    [9, '7♭9'],
  ],
  'Tritone detour': [
    [2, 'm9'],
    [1, '9'],
    [0, 'maj9'],
    [0, '6/9'],
  ],
  'Minor cadence': [
    [2, 'm7♭5'],
    [7, '7♭9'],
    [0, 'm9'],
    [0, 'm7'],
  ],
  'Backdoor cadence': [
    [5, 'm9'],
    [10, '13'],
    [0, 'maj9'],
    [0, '6/9'],
  ],
};
export function preset(name, key = 0) {
  return PRESETS[name].map(([root, quality]) => ({ root: wrap(root + key), quality }));
}
const COLORS = {
  m9: ['m7', 'm9'],
  13: ['7', '9', '13'],
  maj9: ['maj7', 'maj9', '6/9'],
  '7♭9': ['7', '7♭9'],
  9: ['7', '9', '13'],
  '6/9': ['maj7', 'maj9', '6/9'],
};
export function generate(key, color, random = Math.random, current = []) {
  const names = ['Jazz turnaround', 'Tritone detour', 'Backdoor cadence'];
  const choice = Math.min(2, Math.floor(random() * (color + 1)));
  const chords = preset(names[choice], key).map((chord) => colorChord(chord, random));
  if (JSON.stringify(chords) === JSON.stringify(current)) chords[0].quality = otherMinor(chords[0].quality);
  return chords;
}
function colorChord(chord, random) {
  const choices = COLORS[chord.quality];
  return { ...chord, quality: choices[Math.floor(random() * choices.length)] };
}
function otherMinor(quality) {
  return quality === 'm7' ? 'm9' : 'm7';
}
