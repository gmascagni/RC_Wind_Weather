const SHELL_CACHE = 'rc-wind-shell-v5';
const API_CACHE = 'rc-wind-api-v5';
const API_MAX_AGE_MS = 3 * 60 * 1000; // 3 minutes max for weather API responses

function getScopeUrl(path = '') {
  return new URL(path, self.registration.scope).href;
}

const PRECACHE_PATHS = [
  '',
  'index.html',
  'manifest.webmanifest',
  'favicon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-192.png',
  'icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_PATHS.map((p) => getScopeUrl(p))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== API_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Weather API: Network-first, short-lived fallback cache (<= 3 minutes)
  if (url.hostname === 'api.open-meteo.com') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(API_CACHE);
            const headers = new Headers(response.headers);
            headers.set('x-sw-cached-at', String(Date.now()));
            const body = await response.clone().arrayBuffer();
            await cache.put(
              request,
              new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers,
              })
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(API_CACHE);
          const cached = await cache.match(request);
          if (cached) {
            const cachedAt = Number(cached.headers.get('x-sw-cached-at') || 0);
            if (Date.now() - cachedAt <= API_MAX_AGE_MS) {
              return cached;
            }
            await cache.delete(request);
          }
          return Response.error();
        })
    );
    return;
  }

  // Same-origin App Shell & Vite hashed assets
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then(async (res) => {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(getScopeUrl('index.html'), res.clone());
            return res;
          })
          .catch(async () => {
            const cache = await caches.open(SHELL_CACHE);
            return (
              (await cache.match(getScopeUrl('index.html'))) ||
              (await cache.match(getScopeUrl('')))
            );
          })
      );
      return;
    }

    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then(async (res) => {
            if (res.ok) {
              const cache = await caches.open(SHELL_CACHE);
              cache.put(request, res.clone());
            }
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
