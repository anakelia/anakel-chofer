const CACHE_NAME = 'anakel-ventas-v1';
const URLS_TO_CACHE = [
  '/anakel-chofer/chofer_app.html',
  '/anakel-chofer/manifest.json',
  '/anakel-chofer/icon_192.png',
  '/anakel-chofer/icon_512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network first for Firebase, cache first for app shell
  if (event.request.url.includes('firebase') || event.request.url.includes('google')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }))
    );
  }
});
