// service-worker.js
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/arizona.html',
  '/attractions.html',
  '/checklists.html',
  '/confirmations.html',
  '/dc.html',
  '/houston.html',
  '/israel.html',
  '/la.html',
  '/login.html',
  '/manifest.json',
  '/miami.html',
  '/new-york.html',
  '/niagara.html',
  '/orlando.html',
  '/punta-cana.html',
  '/sf.html',
  '/summary.html',
  // הקישורים לתמונות מה-Imgur:
  'https://i.imgur.com/zDu7f3z.png',
  'https://i.imgur.com/kjGfZAl.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(response => {
        // שומרים כל תגובה תקינה (כולל תמונות CORS)
        if (!response || response.status !== 200) {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    }).catch(() => {
      // אופציונלי: להחזיר offline.html אם תרצה
      // return caches.match('/offline.html');
    })
  );
});