import { transformations } from './harmony.js';
import { label, NOTES, pitchClasses, wrap } from './theory.js';
import { $, button } from './view.js';
export function renderMoves(chord, key, choose) {
  $('moves').replaceChildren(
    ...transformations(chord, key).map((item) => {
      const node = button('move', '', () => choose(item.chord));
      node.id = `move-${item.name}`;
      node.innerHTML = `<span>${item.name}</span><strong>${label(item.chord)}</strong>`;
      node.title = item.hint;
      return node;
    }),
  );
}
export function renderRoots(chord, choose) {
  const notes = pitchClasses(chord);
  $('root-map').replaceChildren(
    ...Array.from({ length: 12 }, (_, i) => {
      const root = wrap(i * 7);
      const node = button('root-pad', NOTES[root], () => choose({ ...chord, root }));
      node.id = `root-pad-${root}`;
      node.setAttribute('aria-label', `Set root ${NOTES[root]}`);
      node.setAttribute('aria-pressed', String(root === chord.root));
      node.classList.toggle('chord-tone', notes.includes(root));
      return node;
    }),
  );
}
const COLORS = ['#f8c369', '#d89bfa', '#6bd7d0', '#9cb2ff'];
export function voicePaths(voicings, selected) {
  const width = 600,
    height = 90;
  const paths = [0, 1, 2, 3].map((voice) => path(voicings, voice, selected));
  $('voice-paths').innerHTML =
    `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Four voice paths across the progression; vertical position is MIDI pitch"><path d="M20 20H580 M20 45H580 M20 70H580" stroke="#353d47" fill="none"/>${paths.join('')}</svg>`;
}
function position(note, index, length) {
  return [20 + (index * 560) / Math.max(1, length - 1), 80 - ((note - 48) / 35) * 70];
}
function path(voicings, voice, selected) {
  const points = voicings.map((notes, index) => position(notes[voice], index, voicings.length));
  const [x, y] = points[selected];
  return `<polyline points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${COLORS[voice]}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="5" fill="${COLORS[voice]}" stroke="#14191f" stroke-width="2"/>`;
}
