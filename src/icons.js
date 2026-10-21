const PATHS = {
  duplicate: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M15 5H5v10"/>',
  remove: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  grip: '<path d="M8 5h1m6 0h1M8 12h1m6 0h1M8 19h1m6 0h1"/>',
};
export function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
}
