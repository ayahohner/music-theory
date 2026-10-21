import { readFileSync } from 'node:fs';
import { beforeEach, expect, it, vi } from 'vitest';
import { createApp, audition } from '../src/app.js';
const html = readFileSync('index.html', 'utf8');
let app;
const $ = (id) => document.getElementById(id);
const change = (id, value) => {
  $(id).value = value;
  $(id).dispatchEvent(new Event('change'));
};
beforeEach(() => {
  document.documentElement.innerHTML = html;
  localStorage.clear();
  app = createApp(localStorage, {
    ready: vi.fn().mockResolvedValue(),
    play: vi.fn(),
    bar: vi.fn(),
    context: { currentTime: 0 },
    setVolume: vi.fn(),
    stop: vi.fn(),
  });
});
it('edits, transposes, selects and replaces chords through real controls', () => {
  expect($('progression').children).toHaveLength(4);
  change('root', '3');
  change('quality', 'maj7');
  expect($('chord-name').textContent).toBe('E♭maj7');
  $('up').click();
  expect(app.state.key).toBe(1);
  $('down').click();
  change('key', '5');
  expect(app.state.key).toBe(5);
  $('chord-1').click();
  expect(app.state.selected).toBe(1);
  $('neighbors').children[0].click();
  expect($('status').textContent).toContain('Saved');
  expect($('keyboard').children).toHaveLength(36);
  expect($('keyboard').querySelectorAll('.active')).toHaveLength(4);
});
it('handles progression lengths, presets, tempo, playback and storage failure', async () => {
  for (let i = 0; i < 20; i++) $('append').click();
  expect(app.state.chords).toHaveLength(16);
  for (let i = 0; i < 20; i++) $('remove').click();
  expect(app.state.chords).toHaveLength(1);
  change('preset', 'Minor cadence');
  expect(app.state.chords[0].quality).toBe('m7♭5');
  change('color', '0');
  $('generate').click();
  expect(app.state.chords).toHaveLength(4);
  $('bpm').value = '120';
  $('bpm').dispatchEvent(new Event('input'));
  expect(app.state.bpm).toBe(120);
  $('play').click();
  await vi.waitFor(() => expect(app.piano.bar).toHaveBeenCalled());
  $('loop').dispatchEvent(new Event('change'));
  expect(app.transport.timer).toBeNull();
  $('stop').click();
  expect($('status').textContent).toContain('stopped');
  $('audition').click();
  $('keyboard').children[0].click();
  app.storage = {
    setItem: () => {
      throw Error('denied');
    },
  };
  $('up').click();
  expect($('status').textContent).toContain('unavailable');
});
it('reports audio failures without losing the progression', async () => {
  app.piano.ready.mockRejectedValue(new Error('denied'));
  await audition(app, [60]);
  expect($('status').textContent).toContain('could not start');
  $('play').click();
  await vi.waitFor(() => expect($('status').textContent).toContain('try again'));
  expect(app.state.chords).toHaveLength(4);
});

it('preserves keyboard focus when selecting and replacing a chord', () => {
  const card = $('chord-1');
  card.focus();
  card.click();
  expect(document.activeElement.id).toBe('chord-1');
  const neighbor = $('neighbors').children[0];
  neighbor.focus();
  neighbor.click();
  expect(document.activeElement.id).toBe('chord-1');
});
it('supports reversible harmonic moves, root exploration and performance controls', () => {
  const original = JSON.stringify(app.state.chords);
  $('moves').children[3].click();
  expect(app.state.chords[0].quality).toBe('7♯11');
  $('undo').click();
  expect(JSON.stringify(app.state.chords)).toBe(original);
  $('root-map').children[1].click();
  expect(app.state.chords[0].root).toBe(7);
  expect($('voice-paths').querySelectorAll('polyline')).toHaveLength(4);
  change('groove', 'broken');
  expect(app.piano.groove).toBe('broken');
  $('wobble').value = '80';
  $('wobble').dispatchEvent(new Event('input'));
  expect(app.piano.wobble).toBe(0.8);
  $('volume').value = '25';
  $('volume').dispatchEvent(new Event('input'));
  expect(app.piano.setVolume).toHaveBeenCalledWith(0.25);
});
it('does not play a deferred audition after Stop', async () => {
  let resume;
  app.piano.ready.mockImplementation(
    () =>
      new Promise((resolve) => {
        resume = resolve;
      }),
  );
  const pending = audition(app, [60]);
  $('stop').click();
  resume();
  await pending;
  expect(app.piano.play).not.toHaveBeenCalled();
});
it('handles play and undo shortcuts without stealing form input', async () => {
  const press = (target, key, code) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
  const original = JSON.stringify(app.state.chords);
  $('moves').children[2].click();
  press($('root'), 'z', 'KeyZ');
  expect(JSON.stringify(app.state.chords)).not.toBe(original);
  press(document.body, 'z', 'KeyZ');
  expect(JSON.stringify(app.state.chords)).toBe(original);
  press(document.body, ' ', 'Space');
  await vi.waitFor(() => expect(app.piano.bar).toHaveBeenCalled());
  press(document.body, ' ', 'Space');
  expect(app.transport.sequence).toBeNull();
});
it('preserves native button Space, semantic focus and playing indication', () => {
  const hear = $('audition');
  hear.focus();
  const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
  hear.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(app.piano.bar).not.toHaveBeenCalled();
  const move = $('move-Side-slip');
  move.focus();
  move.click();
  expect(document.activeElement.id).toBe('move-Side-slip');
  const root = $('root-pad-7');
  root.focus();
  root.click();
  expect(document.activeElement.id).toBe('root-pad-7');
  app.transport.onStep(0);
  $('chord-1').click();
  expect($('chord-0').closest('article').classList.contains('playing')).toBe(true);
  expect($('chord-1').getAttribute('aria-pressed')).toBe('true');
});
it('treats tempo dragging as one undoable edit and retains earlier chord changes', () => {
  const original = JSON.stringify(app.state.chords);
  $('moves').children[2].click();
  for (let bpm = 97; bpm <= 160; bpm++) {
    $('bpm').value = String(bpm);
    $('bpm').dispatchEvent(new Event('input'));
  }
  $('bpm').dispatchEvent(new Event('change'));
  expect(app.history).toHaveLength(2);
  $('undo').click();
  expect(app.state.bpm).toBe(96);
  $('undo').click();
  expect(JSON.stringify(app.state.chords)).toBe(original);
});
it('auditions cards and edits the arrangement in place with undo', async () => {
  const first = { ...app.state.chords[0] };
  $('chord-1').click();
  await vi.waitFor(() => expect(app.piano.play).toHaveBeenCalled());
  $('copy-0').click();
  expect(app.state.chords[1]).toEqual(first);
  $('delete-1').click();
  expect(app.state.chords).toHaveLength(4);
  $('add-chord').click();
  expect(app.state.chords.at(-1)).toEqual({ root: app.state.key, quality: 'maj9' });
  const before = [...app.state.chords];
  $('drag-0').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  expect(app.state.chords[1]).toEqual(before[0]);
  expect(document.activeElement.id).toBe('drag-1');
  $('undo').click();
  expect(app.state.chords).toEqual(before);
  $('drag-0').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  expect(app.state.chords).toEqual(before);
});
it('changes instruments and toggles transport with Space on a piano key', async () => {
  change('instrument', 'bell');
  expect(app.piano.instrument).toBe('bell');
  const key = $('keyboard').children[0];
  key.click();
  key.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true }));
  await vi.waitFor(() => expect(app.piano.bar).toHaveBeenCalled());
  key.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true }));
  expect(app.transport.sequence).toBeNull();
  $('voice-0-0').click();
  await vi.waitFor(() => expect(app.piano.play).toHaveBeenCalled());
});
it('preserves the selected chord when deleting another tile', () => {
  $('chord-3').click();
  const selected = app.state.chords[3];
  $('delete-0').click();
  expect(app.state.selected).toBe(2);
  expect(app.state.chords[app.state.selected]).toEqual(selected);
});
it('edits a chart note, renames and persists the chord, and undoes in one step', () => {
  change('quality', 'maj7');
  change('root', '0');
  const before = JSON.stringify(app.state.chords);
  const history = app.history.length;
  const note = $('voice-0-3');
  note.focus();
  note.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
  expect(app.state.chords[0].notes).toHaveLength(4);
  expect($('chord-0').textContent).toBe($('chord-name').textContent);
  expect(JSON.parse(localStorage.getItem('music-theory-session')).chords).toEqual(app.state.chords);
  expect(document.activeElement.id).toBe('voice-0-3');
  expect(app.history).toHaveLength(history + 1);
  $('undo').click();
  expect(JSON.stringify(app.state.chords)).toBe(before);
});
it('transposes custom voicing with root and replaces it when quality changes', () => {
  $('voice-0-0').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
  const notes = [...app.state.chords[0].notes];
  const root = app.state.chords[0].root;
  change('root', String(root + 1));
  expect(app.state.chords[0].notes).toEqual(notes.map((n) => n + 1));
  change('quality', 'm7');
  expect(app.state.chords[0].notes).toBeUndefined();
});
it('leaves key and history unchanged when transposition exceeds MIDI limits', () => {
  app.state.chords[0] = { root: 0, quality: 'custom', notes: [0, 60, 64, 127] };
  const history = app.history.length;
  change('key', '1');
  expect(app.state.key).toBe(0);
  expect($('key').value).toBe('0');
  expect(app.history).toHaveLength(history);
  change('root', '1');
  expect(app.state.chords[0].root).toBe(0);
  expect($('status').textContent).toContain('MIDI');
});
it('changes only the dragged voice and keeps other chord voicings intact', async () => {
  const { voicedProgression } = await import('../src/theory.js');
  const before = voicedProgression(app.state.chords);
  $('voice-0-0').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
  const after = voicedProgression(app.state.chords);
  expect(after[0]).toEqual([before[0][0] + 1, ...before[0].slice(1)]);
  expect(after.slice(1)).toEqual(before.slice(1));
});
it('uses Tonal chord names and contextual notes across the arrangement, inspector, chart and keyboard', async () => {
  change('preset', 'Jazz turnaround');
  $('voice-0-0').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
  expect($('chord-0').textContent).toBe('D9');
  expect($('chord-name').textContent).toBe('D9');
  expect($('notes').textContent).toContain('F♯3');
  expect($('voice-0-0').textContent).toBe('F♯3');
  expect($('key-54').getAttribute('aria-label')).toBe('Play F♯3');
  await vi.waitFor(() => expect(app.piano.play).toHaveBeenCalledWith([38, 54, 57, 60, 64]));
});
it('previews Tonal names while dragging and restores the original on cancellation', () => {
  change('preset', 'Jazz turnaround');
  const node = $('voice-0-0');
  node.setPointerCapture = vi.fn();
  const history = app.history.length;
  node.onpointerdown({ button: 0, pointerId: 1, clientY: 100, preventDefault: vi.fn() });
  node.onpointermove({ clientY: 87 });
  expect($('chord-name').textContent).toBe('D9');
  expect($('voice-0-0').textContent).toBe('F♯3');
  expect($('notes').textContent).toContain('F♯3');
  expect(app.history).toHaveLength(history);
  node.onpointercancel();
  expect($('chord-name').textContent).toBe('Dm9');
  expect($('voice-0-0').textContent).toBe('F3');
});
