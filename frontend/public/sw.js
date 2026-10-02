const CACHE_NAME = 'memorymate-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-icon.svg',
  '/pwa-maskable.svg'
];

// Install Event: pre-cache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-while-revalidate for assets, Network-first with offline fallback for navigation
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or chrome-extension URLs
  if (event.request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Static Assets (JS, CSS, Images, Fonts): Cache first with network fallback & background update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for images if offline
        if (event.request.destination === 'image') {
          return caches.match('/pwa-icon.svg');
        }
      });
    })
  );
});
