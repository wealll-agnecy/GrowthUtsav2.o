const CACHE_NAME = 'gu-scanner-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Simple network-first strategy for scanner reliability
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
