import { $ } from './view.js';
export function bindPerformance(app, undo) {
  $('groove').onchange = () => {
    app.transport.stop();
    app.piano.groove = $('groove').value;
  };
  $('wobble').oninput = () => {
    app.piano.wobble = Number($('wobble').value) / 100;
  };
  $('volume').oninput = () => {
    app.piano.setVolume(Number($('volume').value) / 100);
  };
  $('undo').onclick = undo;
  document.onkeydown = (event) => shortcut(event, app, undo);
}
function shortcut(event, app, undo) {
  if (ignoreShortcut(event)) return;
  if (event.code === 'Space') return transportShortcut(event, app);
  if (event.key.toLowerCase() === 'z') {
    event.preventDefault();
    undo();
  }
}
function ignoreShortcut(event) {
  return event.repeat || event.ctrlKey || event.metaKey || event.altKey || isEntry(event.target);
}
function isEntry(target) {
  return ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
}
function transportShortcut(event, app) {
  if (event.target.closest('button, a')) return;
  event.preventDefault();
  toggle(app);
}
function toggle(app) {
  if (app.transport.sequence) $('stop').click();
  else $('play').click();
}
export function snapshot(state) {
  return { ...state, chords: state.chords.map((chord) => ({ ...chord })) };
}
export function remember(app) {
  app.history.push(snapshot(app.state));
  if (app.history.length > 40) app.history.shift();
}
export function undo(app, render, persist) {
  const previous = app.history.pop();
  if (!previous) return;
  app.transport.stop();
  Object.assign(app.state, previous);
  render(app);
  persist(app);
}
