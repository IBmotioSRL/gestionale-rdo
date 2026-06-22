const CACHE = 'rdo-ibmotion-v11';
const PRECACHE = [
  '/gestionale-rdo/',
  '/gestionale-rdo/index.html',
  '/gestionale-rdo/fornitori.html',
  '/gestionale-rdo/icon-512.png',
  '/gestionale-rdo/logo-full.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // API calls: network only (never cache)
  if (e.request.url.includes('/api/')) { e.respondWith(fetch(e.request)); return; }
  // Assets: cache-first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const clone = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, clone));
    return res;
  })));
});
