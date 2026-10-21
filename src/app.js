import { SCALES, generateInScale } from './scales.js';
import { renderScale, renderRoman } from './scale-view.js';
import { qualityLabel } from './chord-catalog.js';
import { editedChord } from './chord-names.js';
import { revealChord, renderArrangement } from './timeline.js';
import { renderScore, previewScore } from './voice-score.js';
import { duplicateAt, removeAt, moveTo, movedSelection, addedChord } from './arrangement.js';
import { INSTRUMENTS } from './instruments.js';
import { icon } from './icons.js';
import { renderMoves, renderRoots } from './exploration.js';
import { bindPerformance, remember, undo } from './performance.js';
import { Piano } from './audio.js';
import { generate, preset, PRESETS } from './progressions.js';
import { load, save } from './storage.js';
import { NOTES, QUALITIES, transpose, voicedProgression, wrap, transposeChord, label, noteName } from './theory.js';
import { Transport } from './transport.js';
import { $, markPlaying, options, renderDetail, renderKeyboard, renderNeighbors } from './view.js';

export function createApp(storage, piano = new Piano()) {
  const saved = load(storage) ?? { chords: preset('Jazz turnaround'), key: 0, bpm: 96 };
  const state = { scale: 'major', ...saved, selected: 0 };
  const app = { state, storage, piano, history: [], playing: -1 };
  app.transport = new Transport(
    piano,
    (index) => setPlaying(app, index),
    () => setPlaying(app, -1),
  );
  setupOptions();
  bindControls(app);
  bindPerformance(app, () => undo(app, render, persist));
  render(app);
  return app;
}
function setPlaying(app, index) {
  app.playing = index;
  markPlaying(index);
}
function setupOptions() {
  options(
    'scale',
    SCALES.map((name) => [name, name === 'minor' ? 'Natural minor' : name[0].toUpperCase() + name.slice(1)]),
  );
  options('instrument', Object.entries(INSTRUMENTS));
  $('audition').innerHTML = icon('play');
  $('append').innerHTML = icon('duplicate');
  $('remove').innerHTML = icon('remove');
  const notes = NOTES.map((name, index) => [index, name]);
  options('root', notes);
  options('key', notes);
  options('quality', [...Object.keys(QUALITIES).map((name) => [name, qualityLabel(name)]), ['custom', 'Custom notes']]);
  $('quality').lastElementChild.disabled = true;
  options('preset', [['', 'Load…'], ...Object.keys(PRESETS).map((name) => [name, name])]);
}
export function render(app) {
  $('preset').value = '';
  $('preset').options[0].disabled = true;
  const focused = document.activeElement;
  const { state } = app;
  const notes = voicedProgression(state.chords);
  renderArrangement(state, arrangementActions(app));
  state.chords.forEach((chord, index) => {
    renderRoman(chord, index, state);
  });
  renderDetail(state, notes);
  renderKeyboard(notes[state.selected], (pitches) => audition(app, pitches), state.chords[state.selected]);
  renderScale(state, (chord) => replace(app, chord));
  renderNeighbors(
    state.chords[state.selected],
    notes[state.selected],
    notes[state.selected - 1] ?? [53, 57, 60, 64],
    (chord) => replace(app, chord),
  );
  renderMoves(state.chords[state.selected], state.key, (chord) => replace(app, chord), state.scale);
  renderRoots(state.chords[state.selected], (chord) => replace(app, chord));
  renderScore(notes, state.selected, (pitches) => audition(app, pitches), noteActions(app, notes), state.chords);
  $('undo').disabled = app.history.length === 0;
  markPlaying(app.playing);
  restoreFocus(focused, state.selected);
  revealChord(state.selected);
}
function restoreFocus(focused, selected) {
  if (focused.isConnected) return;
  const target = $(focused.id) ?? $(`chord-${selected}`);
  target.focus({ preventScroll: true });
}
function persist(app) {
  const success = save(app.storage, app.state);
  $('status').textContent = success
    ? 'Saved locally.'
    : 'Browser storage unavailable. Export JSON to keep your progression.';
}
export function update(app, changes, record = true) {
  if (record) remember(app);
  app.transport.stop();
  Object.assign(app.state, changes);
  render(app);
  persist(app);
}
function select(app, selected) {
  app.state.selected = selected;
  render(app);
  listen(app);
}
function replace(app, chord) {
  if (chord === app.state.chords[app.state.selected]) {
    render(app);
    $('status').textContent = 'Transposition would exceed the MIDI pitch range.';
    return;
  }
  const chords = [...app.state.chords];
  chords[app.state.selected] = chord;
  update(app, { chords });
  listen(app);
}
export async function audition(app, notes) {
  const token = app.transport.token;
  try {
    await app.piano.ready();
    if (token !== app.transport.token) return;
    app.piano.play(notes);
  } catch {
    $('status').textContent = 'Audio could not start. Check browser audio permissions and try Listen again.';
  }
}
function listen(app) {
  const chord = app.state.chords[app.state.selected];
  audition(app, [36 + chord.root, ...voicedProgression(app.state.chords)[app.state.selected]]);
}
async function play(app) {
  const notes = voicedProgression(app.state.chords).map((voicing, i) => [36 + app.state.chords[i].root, ...voicing]);
  try {
    const started = await app.transport.start(notes, app.state.bpm, $('loop').checked);
    if (started) $('status').textContent = 'Playing.';
  } catch {
    $('status').textContent = 'Audio could not start. Check browser audio permissions and try again.';
  }
}
function shift(app, amount) {
  const chords = transpose(app.state.chords, amount);
  if (chords === app.state.chords) {
    $('key').value = app.state.key;
    $('status').textContent = 'Transposition would exceed the MIDI pitch range.';
    return;
  }
  update(app, { chords, key: wrap(app.state.key + amount) });
}
function arrangementActions(app) {
  return {
    select: (index) => select(app, index),
    duplicate: (index) => duplicate(app, index),
    remove: (index) => remove(app, index),
    move: (from, to) => reorder(app, from, to),
  };
}
function duplicate(app, index = app.state.selected) {
  if (app.state.chords.length >= 16) return;
  update(app, { chords: duplicateAt(app.state.chords, index), selected: index + 1 });
}
function add(app) {
  if (app.state.chords.length >= 16) return;
  update(app, { chords: addedChord(app.state.chords, app.state.key), selected: app.state.chords.length });
}
function remove(app, index = app.state.selected) {
  if (app.state.chords.length <= 1) return;
  const chords = removeAt(app.state.chords, index);
  update(app, {
    chords,
    selected: Math.min(app.state.selected - Number(index < app.state.selected), chords.length - 1),
  });
}
function reorder(app, from, to) {
  if (to < 0 || to >= app.state.chords.length || from === to) return;
  update(app, { chords: moveTo(app.state.chords, from, to), selected: movedSelection(app.state.selected, from, to) });
  revealChord(to);
  $(`drag-${to}`).focus({ preventScroll: true });
}
function exportSession(app) {
  const blob = new Blob(
    [
      JSON.stringify(
        { key: app.state.key, scale: app.state.scale, bpm: app.state.bpm, chords: app.state.chords },
        null,
        2,
      ),
    ],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'progression.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function bindControls(app) {
  bindEditing(app);
  $('play').onclick = () => play(app);
  $('stop').onclick = () => {
    app.transport.stop();
    $('status').textContent = 'Playback stopped.';
  };
  $('audition').onclick = () => listen(app);
  $('bpm').oninput = () => changeTempo(app);
  $('bpm').onchange = () => {
    app.editingTempo = false;
  };
  $('loop').onchange = () => app.transport.stop();
  $('export').onclick = () => exportSession(app);
}
function bindEditing(app) {
  $('root').onchange = () =>
    replace(
      app,
      transposeChord(
        app.state.chords[app.state.selected],
        Number($('root').value) - app.state.chords[app.state.selected].root,
      ),
    );
  $('quality').onchange = () =>
    replace(app, { root: app.state.chords[app.state.selected].root, quality: $('quality').value });
  $('scale').onchange = () => update(app, { scale: $('scale').value });
  $('preset').onchange = () => update(app, { chords: preset($('preset').value, app.state.key), selected: 0 });
  $('generate').onclick = () =>
    update(app, {
      chords: generatedChords(app.state),
      selected: 0,
    });
  $('key').onchange = () => shift(app, Number($('key').value) - app.state.key);
  $('up').onclick = () => shift(app, 1);
  $('down').onclick = () => shift(app, -1);
  $('append').onclick = () => duplicate(app);
  $('add-chord').onclick = () => add(app);
  $('remove').onclick = () => remove(app);
}

function changeTempo(app) {
  if (!app.editingTempo) remember(app);
  app.editingTempo = true;
  update(app, { bpm: Number($('bpm').value) }, false);
}

function noteActions(app, voicings) {
  return {
    start: () => app.transport.stop(),
    preview: (index, voice, pitch, range) => {
      const notes = voicings.map((row) => [...row]);
      notes[index][voice] = pitch;
      const chord = editedChord(app.state.chords[index], notes[index]);
      previewScore(notes, index, voice, range, chord);
      renderRoman(chord, index, app.state);
      $(`chord-${index}`).textContent = label(chord);
      $(`chord-${index}`).title = label(chord);
      $(`chord-${index}`).classList.toggle('pitch-set', label(chord).startsWith('['));
      if (index === app.state.selected) {
        $('chord-name').textContent = label(chord);
        $('chord-name').classList.toggle('pitch-set', label(chord).startsWith('['));
        $('notes').textContent = notes[index].map((note) => noteName(note, chord)).join(' · ');
      }
    },
    commit: (index, voice, pitch) => editNote(app, voicings, index, voice, pitch),
    cancel: () => render(app),
  };
}
function editNote(app, voicings, index, voice, pitch) {
  const notes = [...voicings[index]];
  if (notes[voice] === pitch) return;
  notes[voice] = pitch;
  const chords = app.state.chords.map((chord, position) => ({ ...chord, notes: [...voicings[position]] }));
  chords[index] = editedChord(chords[index], notes);
  update(app, { chords, selected: index });
  listen(app);
}

function generatedChords(state) {
  if ($('color').value === '-1') return generateInScale(state.key, state.scale);
  return generate(state.key, Number($('color').value), Math.random, state.chords);
}
