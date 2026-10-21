const observers = new WeakMap();
export function bindOverflow(scroller) {
  scroller.onscroll = () => updateOverflow(scroller);
  if (observers.has(scroller)) return;
  if (typeof ResizeObserver === 'undefined') return;
  const observer = new ResizeObserver(() => updateOverflow(scroller));
  observer.observe(scroller);
  observer.observe(scroller.firstElementChild);
  observers.set(scroller, observer);
}
export function updateOverflow(scroller) {
  scroller.parentElement.classList.toggle('more-left', scroller.scrollLeft > 4);
  scroller.parentElement.classList.toggle(
    'more-right',
    scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4,
  );
}
