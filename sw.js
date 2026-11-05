const CACHE_NAME = 'pichonapps-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico'
    // Podés agregar acá pichisoft-premium.js, pichisoft-community.js, etc.
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
