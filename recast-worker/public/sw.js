/*!
 * Recast service worker — makes the core converter usable with zero network
 * connection after the first visit. This is the honest, actually-deliverable
 * version of "offline mode" for a web app: no native packaging, no install
 * wizard, no code signing — just "Add to Home Screen" (or the browser's
 * install prompt) and it keeps working on a plane.
 *
 * Strategy: precache the core app shell (the homepage + every shared script
 * and stylesheet — everything needed for the workbench itself to run) on
 * install, since that's the thing that has to work offline unconditionally.
 * Everything else (individual tool pages, blog posts) gets cached the first
 * time it's actually visited, so a page you've opened once keeps working
 * offline too, without bloating the initial install with 23 near-duplicate
 * tool pages nobody's asked for yet.
 */
// IMPORTANT — bump this on every deploy that changes any cached file
// (index.html, styles.css, app.js, or anything in CORE_ASSETS below).
// Browsers only detect a service worker update when sw.js's own bytes
// change; if this string stays the same, already-installed clients never
// re-check, never re-fetch, and stay stuck on whatever was cached the
// first time they visited — indefinitely, not just until a normal cache
// expiry. This bit someone on the "Demo" page launch: the nav link update
// never reached anyone with the SW already active, because this file was
// otherwise unchanged.
const CACHE_VERSION = 'recast-v24';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/lib/engine.js',
  '/lib/worker.js',
  '/lib/highlight.js',
  '/lib/history.js',
  '/lib/share.js',
  '/lib/batch.js',
  '/lib/recipes.js',
  '/lib/presets.js',
  '/lib/csv-compare.js',
  '/lib/graph.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // never intercept POST (e.g. /v1/convert API calls)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (fonts, GA, Stripe, cdnjs) pass straight through

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached; // cache-first for anything already known
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Offline and not cached — for a page navigation, fall back to the
        // shell so the app still opens rather than showing the browser's
        // dinosaur/no-connection page.
        if (req.mode === 'navigate') return caches.match('/index.html');
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
