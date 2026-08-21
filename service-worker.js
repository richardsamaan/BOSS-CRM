const CACHE_NAME = 'boss-crm-shell-v4';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// App shell files: cache-first (fast, works offline).
// Everything else (Firestore, EmailJS, fonts, xlsx lib): always go to the network,
// since client data must always be live and current.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShellFile = APP_SHELL.some((f) => url.pathname.endsWith(f.replace('./', '')));

  if (isShellFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // else: let it hit the network normally (default browser behavior)
});
