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
  const drag = createDrag(event, tile, index);
  drag.keydown = handle.onkeydown;
  handle.onkeydown = (next) => {
    next.preventDefault();
    next.stopPropagation();
    if (next.key === 'Escape') cancel(handle, drag);
  };
  handle.onpointermove = (next) => track(next, drag);
  handle.onpointerup = () => finish(handle, drag, move);
  handle.onpointercancel = () => cancel(handle, drag);
  handle.onlostpointercapture = handle.onpointercancel;
  drag.frame = requestAnimationFrame(() => edgeScroll(drag));
}
function createDrag(event, tile, index) {
  const scroller = document.getElementById('timeline-scroll');
  const bounds = tile.getBoundingClientRect();
  const ghost = tile.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.querySelectorAll('[id]').forEach((node) => {
    node.removeAttribute('id');
  });
  ghost.classList.add('drag-ghost');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  Object.assign(ghost.style, {
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
  });
  document.body.append(ghost);
  tile.classList.add('dragging');
  return {
    tile,
    ghost,
    scroller,
    bounds,
    index,
    target: index,
    x: event.clientX,
    startX: event.clientX,
    startY: event.clientY,
    scroll: scroller.scrollLeft,
    moved: false,
  };
}
function track(event, drag) {
  drag.x = event.clientX;
  drag.moved ||= Math.abs(event.clientX - drag.startX) > 5;
  drag.ghost.style.left = `${drag.bounds.left + event.clientX - drag.startX}px`;
  drag.ghost.style.top = `${drag.bounds.top + event.clientY - drag.startY}px`;
  shiftNeighbors(drag);
}
function shiftNeighbors(drag) {
  const tiles = [...drag.tile.parentElement.children];
  const stride = drag.bounds.width + 6;
  const delta = drag.x - drag.startX + drag.scroller.scrollLeft - drag.scroll;
  drag.target = Math.max(0, Math.min(tiles.length - 1, drag.index + Math.round(delta / stride)));
  tiles.forEach((tile, index) => {
    tile.style.transform = `translateX(${shiftOffset(index, drag.index, drag.target) * stride}px)`;
  });
}
export function shiftOffset(index, from, to) {
  if (index > from && index <= to) return -1;
  if (index < from && index >= to) return 1;
  return 0;
}
function edgeScroll(drag) {
  const bounds = drag.scroller.getBoundingClientRect();
  if (drag.moved && drag.x < bounds.left + 36) drag.scroller.scrollLeft -= 8;
  if (drag.moved && drag.x > bounds.right - 36) drag.scroller.scrollLeft += 8;
  shiftNeighbors(drag);
  drag.frame = requestAnimationFrame(() => edgeScroll(drag));
}
function finish(handle, drag, move) {
  clean(handle, drag);
  if (drag.moved) move(drag.index, drag.target);
  const destination = drag.scroller.querySelectorAll('.chord-tile')[drag.target];
  settle(drag.ghost, destination);
}
function settle(ghost, destination) {
  const bounds = destination.getBoundingClientRect();
  ghost.classList.add('settling');
  void ghost.offsetWidth;
  ghost.style.left = `${bounds.left}px`;
  ghost.style.top = `${bounds.top}px`;
  setTimeout(() => ghost.remove(), 150);
}
function cancel(handle, drag) {
  clean(handle, drag);
  drag.ghost.remove();
}
function clean(handle, drag) {
  cancelAnimationFrame(drag.frame);
  drag.tile.classList.remove('dragging');
  [...drag.tile.parentElement.children].forEach((tile) => {
    tile.style.transform = '';
  });
  handle.onkeydown = drag.keydown;
  handle.onpointermove = null;
  handle.onpointerup = null;
  handle.onpointercancel = null;
  handle.onlostpointercapture = null;
}
