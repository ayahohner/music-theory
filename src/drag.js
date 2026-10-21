export function bindDrag(handle, tile, index, move) {
  handle.onpointerdown = (event) => begin(event, handle, tile, index, move);
  handle.onkeydown = (event) => keyboardMove(event, index, move);
}
function keyboardMove(event, index, move) {
  const offsets = { ArrowLeft: -1, ArrowRight: 1 };
  if (!(event.key in offsets)) return;
  event.preventDefault();
  move(index, index + offsets[event.key]);
}
function begin(event, handle, tile, index, move) {
  if (event.button !== 0) return;
  event.preventDefault();
  handle.focus();
  handle.setPointerCapture(event.pointerId);
  tile.classList.add('dragging');
  const drag = { target: index, startX: event.clientX, moved: false };
  handle.onpointermove = (next) => track(next, drag);
  handle.onpointerup = () => finish(handle, tile, drag, index, move);
  handle.onpointercancel = () => clean(handle, tile);
}
function track(event, drag) {
  drag.moved = Math.abs(event.clientX - drag.startX) > 5;
  const tile = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-chord-index]');
  if (!tile) return;
  drag.target = Number(tile.dataset.chordIndex);
  document.querySelectorAll('.drop-target').forEach((node) => {
    node.classList.remove('drop-target');
  });
  tile.classList.add('drop-target');
  scrollNearEdge(event.clientX);
}
function scrollNearEdge(x) {
  const scroller = document.getElementById('timeline-scroll');
  const bounds = scroller.getBoundingClientRect();
  if (x < bounds.left + 36) scroller.scrollLeft -= 20;
  if (x > bounds.right - 36) scroller.scrollLeft += 20;
}
function finish(handle, tile, drag, index, move) {
  clean(handle, tile);
  if (drag.moved) move(index, drag.target);
}
function clean(handle, tile) {
  tile.classList.remove('dragging');
  document.querySelectorAll('.drop-target').forEach((node) => {
    node.classList.remove('drop-target');
  });
  handle.onpointermove = null;
  handle.onpointerup = null;
  handle.onpointercancel = null;
}
