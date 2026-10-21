import { expect, it, vi } from 'vitest';
import { addedChord, duplicateAt, removeAt, moveTo, movedSelection } from '../src/arrangement.js';
import { bindDrag } from '../src/drag.js';
it('preserves identity through every reorder and enforces size limits', () => {
  const chords = Array.from({ length: 16 }, (_, root) => ({ root, quality: 'maj9' }));
  for (let from = 0; from < 16; from++)
    for (let to = 0; to < 16; to++) {
      const moved = moveTo(chords, from, to);
      expect(moved[to]).toBe(chords[from]);
      for (let selected = 0; selected < 16; selected++)
        expect(moved[movedSelection(selected, from, to)]).toBe(chords[selected]);
    }
  expect(duplicateAt(chords, 0)).toBe(chords);
  expect(addedChord(chords, 0)).toBe(chords);
  const one = chords.slice(0, 1);
  expect(removeAt(one, 0)).toBe(one);
  expect(duplicateAt(one, 0)).toEqual([one[0], one[0]]);
  expect(removeAt(chords, 3)).not.toContain(chords[3]);
});
it('moves by pointer, handles cancellation and ignores taps and unrelated keys', () => {
  document.body.innerHTML =
    '<div id="timeline-scroll"><article class="chord-tile" data-chord-index="0"><button></button></article><article class="chord-tile" data-chord-index="1"></article></div>';
  const tile = document.querySelector('article'),
    handle = document.querySelector('button');
  const target = document.querySelectorAll('article')[1],
    move = vi.fn();
  handle.setPointerCapture = vi.fn();
  document.elementFromPoint = vi.fn(() => target);
  bindDrag(handle, tile, 0, move);
  const down = (button = 0) => handle.onpointerdown({ button, pointerId: 1, clientX: 100, preventDefault: vi.fn() });
  down(1);
  expect(tile.classList.contains('dragging')).toBe(false);
  down();
  handle.onpointerup();
  expect(move).not.toHaveBeenCalled();
  down();
  handle.onpointermove({ clientX: 200, clientY: 20 });
  handle.onpointerup();
  expect(move).toHaveBeenCalledWith(0, 1);
  down();
  handle.onpointermove({ clientX: -10, clientY: 20 });
  handle.onpointercancel();
  expect(tile.classList.contains('dragging')).toBe(false);
  document.elementFromPoint.mockReturnValue(null);
  down();
  handle.onpointermove({ clientX: 100, clientY: 20 });
  handle.onpointerup();
  handle.onkeydown({ key: 'Enter' });
  expect(move).toHaveBeenCalledTimes(1);
});
it('reveals selected columns beyond either timeline edge', async () => {
  const { revealChord } = await import('../src/timeline.js');
  document.body.innerHTML = '<div id="timeline-scroll"><article><button id="chord-0"></button></article></div>';
  const scroller = document.getElementById('timeline-scroll'),
    tile = document.querySelector('article');
  scroller.getBoundingClientRect = () => ({ left: 40, right: 400 });
  tile.getBoundingClientRect = () => ({ left: 410, right: 550 });
  revealChord(0);
  expect(scroller.scrollLeft).toBe(150);
  tile.getBoundingClientRect = () => ({ left: 10, right: 150 });
  revealChord(0);
  expect(scroller.scrollLeft).toBe(120);
});
