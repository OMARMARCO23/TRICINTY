// A minimal, "pass-through" service worker.
// It is required for a PWA to be installable but doesn't implement any caching logic yet.
// This prevents errors from an empty sw.js file.

self.addEventListener('install', event => {
  // This event fires when the service worker is first installed.
  console.log('Service worker installing.');
});

self.addEventListener('activate', event => {
  // This event fires when the service worker becomes active.
  console.log('Service worker activating.');
});

self.addEventListener('fetch', event => {
  // This event fires for every network request.
  // By not calling event.respondWith(), we let the browser handle the request as it normally would.
  // This is a "no-op" or "pass-through" fetch handler.
  return;
});
