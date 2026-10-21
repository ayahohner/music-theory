import { expect, it, vi } from 'vitest';
import { editedChord, identify } from '../src/chord-names.js';
import { QUALITIES, label, transpose, voicedProgression, voice } from '../src/theory.js';
import { load, save, validChord } from '../src/storage.js';
import { bindNoteDrag, dragPitch } from '../src/note-drag.js';
import { shiftOffset } from '../src/drag.js';
import { bindOverflow, updateOverflow } from '../src/overflow.js';

it('names edited pitches over the bass and preserves voice identity and octaves', () => {
  const chord = editedChord({ root: 0, quality: 'maj7' }, [60, 64, 67, 70], QUALITIES);
  expect(label(chord)).toBe('C7');
  expect(voice(chord)).toEqual([60, 64, 67, 70]);
  expect(identify([60, 64, 67, 72], 0, QUALITIES)).toBe('');
  expect(label(editedChord(chord, [60, 61, 66, 71], QUALITIES))).toBe('C(1,♭9,♯11,7)');
  expect(voice(editedChord(chord, [72, 64, 67, 70], QUALITIES))).toEqual([72, 64, 67, 70]);
  const shifted = transpose([chord], 2)[0];
  expect(label(shifted)).toBe('D7');
  expect(shifted.notes).toEqual([62, 66, 69, 72]);
  expect(voicedProgression([chord, shifted])).toEqual([chord.notes, shifted.notes]);
});
it('persists explicit notes and rejects malformed custom chords', () => {
  const chord = editedChord({ root: 2, quality: 'm7' }, [50, 61, 66, 71], QUALITIES);
  const state = { chords: [chord], key: 0, bpm: 96 };
  save(localStorage, state);
  expect(load(localStorage)).toEqual(state);
  expect(validChord({ root: 0, quality: 'custom' })).toBe(false);
  for (const notes of [null, [60, 64, 67], [60, 64, 67, 128], [60, 64, 67, 1.5]]) {
    expect(validChord({ root: 0, quality: 'custom', notes })).toBe(false);
  }
  expect(validChord({ root: 0, quality: 'maj7', notes: 'bad' })).toBe(false);
});
it('previews semitone drags, commits once, suppresses the extra click, and cancels safely', () => {
  document.body.innerHTML = '<button id="note">C4</button>';
  const node = document.getElementById('note');
  node.setPointerCapture = vi.fn();
  const actions = { start: vi.fn(), preview: vi.fn(), commit: vi.fn(), cancel: vi.fn() };
  const click = vi.fn();
  node.addEventListener('click', click);
  bindNoteDrag(node, 60, { low: 48, high: 72 }, actions);
  const down = (button) => node.onpointerdown({ button, clientY: 100, pointerId: 1, preventDefault: vi.fn() });
  down(1);
  expect(actions.start).not.toHaveBeenCalled();
  down(0);
  node.onpointermove({ clientY: 99 });
  expect(actions.preview).not.toHaveBeenCalled();
  node.onpointermove({ clientY: 83 });
  expect(actions.preview).toHaveBeenCalledWith(62, { low: 48, high: 72 });
  expect(actions.commit).not.toHaveBeenCalled();
  node.onpointerup();
  expect(actions.commit).toHaveBeenCalledWith(62);
  node.click();
  expect(click).not.toHaveBeenCalled();
  down(0);
  node.onpointerup();
  node.click();
  expect(click).toHaveBeenCalledTimes(1);
  down(0);
  node.onpointercancel();
  expect(actions.cancel).toHaveBeenCalledOnce();
  node.onkeydown({ key: 'ArrowDown', preventDefault: vi.fn() });
  expect(actions.commit).toHaveBeenLastCalledWith(59);
  node.onkeydown({ key: 'Enter' });
  expect(dragPitch(60, 10000, { low: 48, high: 72 })).toBe(48);
  expect(dragPitch(60, -10000, { low: 48, high: 72 })).toBe(72);
});
it('shifts neighbors into the gap in both directions', () => {
  expect([0, 1, 2, 3].map((i) => shiftOffset(i, 0, 2))).toEqual([0, -1, -1, 0]);
  expect([0, 1, 2, 3].map((i) => shiftOffset(i, 3, 1))).toEqual([0, 1, 1, 0]);
});
it('shows overflow only on the edges with hidden content', () => {
  document.body.innerHTML = '<div><div id="scroll"><div></div></div></div>';
  const scroller = document.getElementById('scroll');
  Object.defineProperties(scroller, { clientWidth: { value: 300 }, scrollWidth: { value: 600 } });
  bindOverflow(scroller);
  updateOverflow(scroller);
  expect(scroller.parentElement.className).toBe('more-right');
  scroller.scrollLeft = 150;
  scroller.onscroll();
  expect(scroller.parentElement.classList.contains('more-left')).toBe(true);
  scroller.scrollLeft = 300;
  updateOverflow(scroller);
  expect(scroller.parentElement.className).toBe('more-left');
});
it('animates a lifted card, shifts siblings, auto-scrolls, and cancels with Escape', async () => {
  const { bindDrag } = await import('../src/drag.js');
  document.body.innerHTML =
    '<div id="timeline-scroll"><div><article class="chord-tile"><button id="handle"></button></article><article class="chord-tile"></article></div></div>';
  const tiles = document.querySelectorAll('article'),
    handle = document.getElementById('handle');
  const scroller = document.getElementById('timeline-scroll');
  tiles[0].getBoundingClientRect = () => ({ left: 0, top: 20, width: 144, height: 84 });
  scroller.getBoundingClientRect = () => ({ left: 0, right: 300 });
  handle.setPointerCapture = vi.fn();
  const frames = [];
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((fn) => {
      frames.push(fn);
      return frames.length;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const move = vi.fn();
  bindDrag(handle, tiles[0], 0, move);
  handle.onpointerdown({ button: 0, pointerId: 1, clientX: 20, clientY: 30, preventDefault: vi.fn() });
  handle.onpointermove({ clientX: 290, clientY: 45 });
  expect(document.querySelector('.drag-ghost').style.left).toBe('270px');
  expect(tiles[1].style.transform).toBe('translateX(-150px)');
  frames.shift()();
  expect(scroller.scrollLeft).toBe(8);
  handle.onpointermove({ clientX: 0, clientY: 45 });
  frames.shift()();
  expect(scroller.scrollLeft).toBe(0);
  handle.onkeydown({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn() });
  expect(document.querySelector('.drag-ghost')).toBeNull();
  expect(tiles[1].style.transform).toBe('');
  expect(move).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});
it('refuses out-of-range transposition without changing saved notes or roots', () => {
  const chords = [{ root: 0, quality: 'custom', notes: [0, 60, 64, 127] }];
  expect(transpose(chords, 1)).toBe(chords);
  expect(transpose(chords, -1)).toBe(chords);
  expect(validChord(chords[0])).toBe(true);
});
it('edits transposed pitches above the piano range without jumping octaves', () => {
  const node = document.createElement('button'),
    commit = vi.fn();
  bindNoteDrag(node, 107, { low: 100, high: 110 }, { commit });
  node.onkeydown({ key: 'ArrowUp', preventDefault: vi.fn() });
  expect(commit).toHaveBeenCalledWith(108);
});
