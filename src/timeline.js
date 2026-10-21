import { bindOverflow, updateOverflow } from './overflow.js';
import { label } from './theory.js';
import { $, button } from './view.js';
import { icon } from './icons.js';
import { bindDrag } from './drag.js';
export function renderArrangement(state, actions) {
  $('timeline-content').style.setProperty('--count', state.chords.length);
  $('progression').replaceChildren(...state.chords.map((chord, index) => tile(chord, index, state, actions)));
  $('add-chord').disabled = state.chords.length >= 16;
  bindOverflow($('timeline-scroll'));
  updateOverflow($('timeline-scroll'));
}
function tile(chord, index, state, actions) {
  const node = document.createElement('article');
  node.className = 'chord-tile';
  node.dataset.chordIndex = index;
  const header = document.createElement('div');
  header.className = 'tile-tools';
  const handle = tool('grip', `Move chord ${index + 1}; drag or use arrow keys`, () => {});
  handle.id = `drag-${index}`;
  bindDrag(handle, node, index, actions.move);
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  header.append(handle, number, ...editTools(index, state, actions));
  const main = button('chord-card', label(chord), () => actions.select(index));
  main.id = `chord-${index}`;
  main.title = label(chord);
  main.classList.toggle('pitch-set', label(chord).startsWith('['));
  main.setAttribute('aria-label', `Chord ${index + 1}: ${label(chord)}`);
  main.setAttribute('aria-pressed', String(index === state.selected));
  node.classList.toggle('selected', index === state.selected);
  node.append(header, main);
  return node;
}
function editTools(index, state, actions) {
  const copy = tool('duplicate', `Duplicate chord ${index + 1}`, () => actions.duplicate(index));
  const remove = tool('remove', `Remove chord ${index + 1}`, () => actions.remove(index));
  copy.disabled = state.chords.length >= 16;
  remove.disabled = state.chords.length === 1;
  copy.id = `copy-${index}`;
  remove.id = `delete-${index}`;
  return [copy, remove];
}
function tool(name, title, action) {
  const node = button(`icon-button ${name}`, '', action);
  node.innerHTML = icon(name);
  node.title = title;
  node.setAttribute('aria-label', title);
  return node;
}

export function revealChord(index) {
  const scroller = document.getElementById('timeline-scroll');
  const tile = document.getElementById(`chord-${index}`).closest('article');
  const bounds = scroller.getBoundingClientRect();
  const card = tile.getBoundingClientRect();
  if (card.left < bounds.left) scroller.scrollLeft -= bounds.left - card.left;
  if (card.right > bounds.right) scroller.scrollLeft += card.right - bounds.right;
  updateOverflow(scroller);
}
