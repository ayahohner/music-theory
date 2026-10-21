import './style.css';
import { createApp } from './app.js';
// Access can itself throw when storage is disabled by browser policy.
function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage disabled');
      },
    };
  }
}
const app = createApp(browserStorage());
window.addEventListener('pagehide', () => app.transport.stop());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) app.transport.stop();
});
