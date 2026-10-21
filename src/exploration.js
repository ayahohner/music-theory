import { transformations } from './harmony.js';
import { label, NOTES, wrap } from './theory.js';
import { $, button } from './view.js';
export function renderMoves(chord, key, choose) {
  $('moves').replaceChildren(
    ...transformations(chord, key).map((item) => {
      const node = button('move', '', () => choose(item.chord));
      node.id = `move-${item.name}`;
      node.innerHTML = `<span>${item.name}</span><strong>${label(item.chord)}</strong>`;
      node.title = item.hint;
      return node;
    }),
  );
}
export function renderRoots(chord, choose) {
  $('root-map').replaceChildren(
    ...Array.from({ length: 12 }, (_, i) => {
      const root = wrap(i * 7);
      const node = button('root-pad', NOTES[root], () => choose({ ...chord, root }));
      node.id = `root-pad-${root}`;
      node.setAttribute('aria-label', `Set root ${NOTES[root]}`);
      node.setAttribute('aria-pressed', String(root === chord.root));
      return node;
    }),
  );
}
