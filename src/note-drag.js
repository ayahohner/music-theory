export function dragPitch(note, deltaY, range) {
  return Math.max(
    Math.max(0, range.low),
    Math.min(Math.min(127, range.high), Math.round(note - (deltaY * (range.high - range.low)) / 204)),
  );
}
export function bindNoteDrag(node, note, range, actions) {
  let dragged = false;
  node.addEventListener(
    'click',
    (event) => {
      if (!dragged) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      dragged = false;
    },
    true,
  );
  node.onkeydown = (event) => keyPitch(event, note, actions);
  node.onpointerdown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragged = false;
    start(event, node, note, range, actions, () => {
      dragged = true;
    });
  };
}
function keyPitch(event, note, actions) {
  const offsets = { ArrowUp: 1, ArrowDown: -1 };
  if (!(event.key in offsets)) return;
  event.preventDefault();
  actions.commit(Math.max(0, Math.min(127, note + offsets[event.key])));
}
function start(event, node, note, range, actions, moved) {
  node.focus();
  node.setPointerCapture(event.pointerId);
  actions.start();
  let pitch = note;
  const keydown = node.onkeydown;
  node.classList.add('note-dragging');
  node.onkeydown = (next) => {
    next.preventDefault();
    next.stopPropagation();
    if (next.key !== 'Escape') return;
    clean(node, keydown);
    actions.cancel();
  };
  node.onpointermove = (next) => {
    const nextPitch = dragPitch(note, next.clientY - event.clientY, range);
    if (nextPitch === pitch) return;
    moved();
    pitch = nextPitch;
    actions.preview(pitch, range);
  };
  node.onpointerup = () => {
    clean(node, keydown);
    actions.commit(pitch);
  };
  node.onpointercancel = () => {
    clean(node, keydown);
    actions.cancel();
  };
  node.onlostpointercapture = node.onpointercancel;
}
function clean(node, keydown) {
  node.onkeydown = keydown;
  node.classList.remove('note-dragging');
  node.onpointermove = null;
  node.onpointerup = null;
  node.onpointercancel = null;
  node.onlostpointercapture = null;
}
