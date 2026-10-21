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
  app = createApp(localStorage, { ready: vi.fn().mockResolvedValue(), play: vi.fn(), stop: vi.fn() });
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
  $('progression').children[1].click();
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
  $('generate').click();
  expect(app.state.chords).toHaveLength(4);
  $('bpm').value = '120';
  $('bpm').dispatchEvent(new Event('input'));
  expect(app.state.bpm).toBe(120);
  $('play').click();
  await vi.waitFor(() => expect(app.piano.play).toHaveBeenCalled());
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
