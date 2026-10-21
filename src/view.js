import { label, movement, neighbors, noteName, NOTES, wrap, pitchClasses } from './theory.js';
export const $ = (id) => document.getElementById(id);
export function options(id, values) {
  $(id).replaceChildren(...values.map(([value, text]) => new Option(text, value)));
}
export function button(className, text, action) {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = className;
  node.textContent = text;
  node.addEventListener('click', action);
  return node;
}
export function renderCards(state, select) {
  $('progression').replaceChildren(
    ...state.chords.map((chord, index) => {
      const node = button('chord-card', '', () => select(index));
      node.id = `chord-${index}`;
      node.setAttribute('aria-pressed', String(index === state.selected));
      node.setAttribute('aria-label', `Chord ${index + 1}: ${label(chord)}`);
      node.innerHTML = `<span class="number">${String(index + 1).padStart(2, '0')}</span><strong>${label(chord)}</strong><span class="beats">${pitchClasses(
        chord,
      )
        .map((n) => NOTES[n])
        .join(' · ')}</span>`;
      return node;
    }),
  );
}
export function renderDetail(state, voicings) {
  const chord = state.chords[state.selected];
  $('position').textContent = `${state.selected + 1} / ${state.chords.length}`;
  $('chord-name').textContent = label(chord);
  $('notes').textContent = voicings[state.selected].map(noteName).join(' · ');
  $('root').value = chord.root;
  $('quality').value = chord.quality;
  $('key').value = state.key;
  $('bpm').value = state.bpm;
  $('tempo-output').textContent = `${state.bpm} BPM`;
  $('remove').disabled = state.chords.length === 1;
  $('append').disabled = state.chords.length >= 16;
  $('movement').textContent = movementLabel(state.selected, voicings);
}
function movementLabel(index, voicings) {
  if (index === 0) return 'Starting voicing';
  return `${movement(voicings[index - 1], voicings[index])} semitones from previous chord`;
}
export function renderNeighbors(chord, notes, previous, replace) {
  $('neighbors').replaceChildren(
    ...neighbors(chord, notes, previous).map((candidate) => {
      const node = button('neighbor', '', () => replace(candidate.chord));
      node.id = `neighbor-${candidate.chord.root}-${candidate.chord.quality}`;
      node.innerHTML = `<strong>${label(candidate.chord)}</strong><span>${candidate.distance} st</span>`;
      return node;
    }),
  );
}
export function renderKeyboard(notes, play) {
  const keys = Array.from({ length: 36 }, (_, i) => i + 48);
  let whites = 0;
  $('keyboard').replaceChildren(
    ...keys.map((note) => {
      const black = [1, 3, 6, 8, 10].includes(wrap(note));
      if (!black) whites += 1;
      return pianoKey(note, black, whites, notes, play);
    }),
  );
}
function pianoKey(note, black, whites, notes, play) {
  const node = button(`key ${black ? 'black' : 'white'}`, NOTES[wrap(note)], () => play([note]));
  node.id = `key-${note}`;
  node.classList.toggle('active', notes.includes(note));
  node.setAttribute('aria-label', `Play ${noteName(note)}`);
  if (black) node.style.left = `${(whites / 21) * 100 - 1.55}%`;
  return node;
}
export function markPlaying(index) {
  $('play').classList.toggle('running', index >= 0);
  $('play').textContent = index >= 0 ? '↺ Restart' : '▶ Play';
  [...$('progression').children].forEach((node, position) => {
    node.classList.toggle('playing', position === index);
  });
}
