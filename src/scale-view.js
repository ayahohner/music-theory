import { Note } from 'tonal';
import { scaleChords, scaleFor } from './scales.js';
import { roman } from './roman.js';
import { label } from './theory.js';
import { display } from './tonal.js';
import { $, button } from './view.js';
export function renderScale(state, choose) {
  $('scale').value = state.scale;
  const scale = scaleFor(state.key, state.scale);
  $('scale-notes').textContent = scale.notes.map(display).join(' · ');
  $('scale-chords').replaceChildren(
    ...scaleChords(state.key, state.scale).map((chord, index) => {
      const node = button('scale-chord', '', () => choose(chord));
      node.id = `scale-chord-${index}`;
      node.innerHTML = `<span>${roman(chord, state.key, state.scale)}</span><strong>${label(chord)}</strong>`;
      node.title = `Replace selected chord with ${label(chord)} and play`;
      return node;
    }),
  );
  const pitches = scale.notes.map(Note.chroma);
  for (const node of $('keyboard').children) {
    const inScale = pitches.includes(Number(node.id.slice(4)) % 12);
    node.classList.toggle('in-scale', inScale);
    if (inScale) node.setAttribute('aria-label', `${node.getAttribute('aria-label')}, in scale`);
  }
}
export function renderRoman(chord, index, state) {
  const text = roman(chord, state.key, state.scale);
  $(`roman-${index}`).title = `${text} · Relative to key tonic; accidentals reference major. Slash note = bass.`;
  $(`roman-${index}`).textContent = text;
  if (index === state.selected) $('chord-roman').textContent = text;
}
