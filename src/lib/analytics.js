// Analytics without the weight: posthog-js (about 165 KB) is loaded after the
// page is interactive and only in production on the real domain. Until then,
// events are queued and flushed once it arrives. usePostHog() keeps the same
// shape the components already use (posthog?.capture(...)).
const enabled =
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

let client = null;
let started = false;
const queue = [];

function flush() {
  while (queue.length && client) {
    const [method, args] = queue.shift();
    if (typeof client[method] === 'function') client[method](...args);
  }
}

const facade = {
  capture: (...args) => { if (enabled) { queue.push(['capture', args]); flush(); } },
  identify: (...args) => { if (enabled) { queue.push(['identify', args]); flush(); } },
  reset: (...args) => { if (enabled) { queue.push(['reset', args]); flush(); } },
};

export function initAnalytics() {
  if (!enabled || started) return;
  started = true;
  const start = () =>
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
        api_host: process.env.REACT_APP_POSTHOG_HOST,
        ui_host: 'https://us.posthog.com',
        defaults: '2026-05-30',
        person_profiles: 'identified_only',
      });
      client = posthog;
      flush();
    });
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 4000 });
  else setTimeout(start, 2000);
}

export function usePostHog() {
  return facade;
}
