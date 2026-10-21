import { transposeRoot } from './tonal.js';
export const PRESETS = {
  'Chromatic orbit': [
    [0, 'maj9♯11'],
    [3, 'maj9'],
    [8, 'm11'],
    [1, '7♯11'],
    [0, 'maj9'],
    [9, '7alt'],
    [2, 'm9'],
    [7, '7alt'],
  ],
  'Suspended gravity': [
    [0, 'm11'],
    [8, 'maj9♯11'],
    [5, 'm9'],
    [7, '7alt'],
  ],
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
  return PRESETS[name].map(([root, quality]) => ({ root: transposeRoot(root, key), quality }));
}
const COLORS = {
  m9: ['m7', 'm9', 'm11'],
  13: ['7', '9', '13'],
  maj9: ['maj7', 'maj9', 'maj9♯11'],
  '7♭9': ['7♭9', '7alt'],
  9: ['7', '9', '13'],
  '6/9': ['maj7', 'maj9', '6/9'],
};
export function generate(key, color, random = Math.random, current = []) {
  const names = ['Jazz turnaround', 'Tritone detour', 'Backdoor cadence', 'Chromatic orbit', 'Suspended gravity'];
  const choice = Math.min(4, Math.floor(random() * (color + 1)));
  const chords = preset(names[choice], key).map((chord) => colorChord(chord, random));
  if (JSON.stringify(chords) === JSON.stringify(current)) chords[0].quality = otherMinor(chords[0].quality);
  return chords;
}
function colorChord(chord, random) {
  const choices = COLORS[chord.quality] ?? [chord.quality];
  return { ...chord, quality: choices[Math.floor(random() * choices.length)] };
}
function otherMinor(quality) {
  return quality === 'm7' ? 'm9' : 'm7';
}
