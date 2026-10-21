import { Piano } from './audio.js';
import { generate, preset, PRESETS } from './progressions.js';
import { load, save } from './storage.js';
import { NOTES, QUALITIES, transpose, voicedProgression, wrap } from './theory.js';
import { Transport } from './transport.js';
import { $, markPlaying, options, renderCards, renderDetail, renderKeyboard, renderNeighbors } from './view.js';

export function createApp(storage, piano = new Piano()) {
  const saved = load(storage) ?? { chords: preset('Jazz turnaround'), key: 0, bpm: 96 };
  const state = { ...saved, selected: 0 };
  const transport = new Transport(piano, markPlaying, () => markPlaying(-1));
  const app = { state, storage, piano, transport };
  setupOptions();
  bindControls(app);
  render(app);
  return app;
}
function setupOptions() {
  const notes = NOTES.map((name, index) => [index, name]);
  options('root', notes);
  options('key', notes);
  options(
    'quality',
    Object.keys(QUALITIES).map((name) => [name, name]),
  );
  options(
    'preset',
    Object.keys(PRESETS).map((name) => [name, name]),
  );
}
export function render(app) {
  const focused = document.activeElement;
  const { state } = app;
  const notes = voicedProgression(state.chords);
  renderCards(state, (index) => select(app, index));
  renderDetail(state, notes);
  renderKeyboard(notes[state.selected], (pitches) => audition(app, pitches));
  renderNeighbors(
    state.chords[state.selected],
    notes[state.selected],
    notes[state.selected - 1] ?? [60, 64, 67, 71],
    (chord) => replace(app, chord),
  );
  restoreFocus(focused, state.selected);
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
export function update(app, changes) {
  app.transport.stop();
  Object.assign(app.state, changes);
  render(app);
  persist(app);
}
function select(app, selected) {
  update(app, { selected });
}
function replace(app, chord) {
  const chords = [...app.state.chords];
  chords[app.state.selected] = chord;
  update(app, { chords });
}
export async function audition(app, notes) {
  try {
    await app.piano.ready();
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
    await app.transport.start(notes, app.state.bpm, $('loop').checked);
    $('status').textContent = 'Playing.';
  } catch {
    $('status').textContent = 'Audio could not start. Check browser audio permissions and try again.';
  }
}
function shift(app, amount) {
  update(app, { chords: transpose(app.state.chords, amount), key: wrap(app.state.key + amount) });
}
function append(app) {
  if (app.state.chords.length >= 16) return;
  update(app, {
    chords: [...app.state.chords, { ...app.state.chords[app.state.selected] }],
    selected: app.state.chords.length,
  });
}
function remove(app) {
  if (app.state.chords.length <= 1) return;
  const chords = app.state.chords.filter((_, index) => index !== app.state.selected);
  update(app, { chords, selected: Math.min(app.state.selected, chords.length - 1) });
}
function exportSession(app) {
  const blob = new Blob(
    [JSON.stringify({ key: app.state.key, bpm: app.state.bpm, chords: app.state.chords }, null, 2)],
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
  $('bpm').oninput = () => update(app, { bpm: Number($('bpm').value) });
  $('loop').onchange = () => app.transport.stop();
  $('export').onclick = () => exportSession(app);
}
function bindEditing(app) {
  $('root').onchange = () => replace(app, { ...app.state.chords[app.state.selected], root: Number($('root').value) });
  $('quality').onchange = () => replace(app, { ...app.state.chords[app.state.selected], quality: $('quality').value });
  $('preset').onchange = () => update(app, { chords: preset($('preset').value, app.state.key), selected: 0 });
  $('generate').onclick = () =>
    update(app, {
      chords: generate(app.state.key, Number($('color').value), Math.random, app.state.chords),
      selected: 0,
    });
  $('key').onchange = () => shift(app, Number($('key').value) - app.state.key);
  $('up').onclick = () => shift(app, 1);
  $('down').onclick = () => shift(app, -1);
  $('append').onclick = () => append(app);
  $('remove').onclick = () => remove(app);
}
