/**
 * sw.js
 * Service worker untuk dukungan PWA/offline: cache-first untuk aset statis.
 *
 * PERBAIKAN dari versi sebelumnya:
 * - './style.css' dihapus dari daftar cache karena file itu tidak pernah
 *   ada (styling memakai Tailwind CDN) — sebelumnya ini membuat
 *   cache.addAll() gagal total sehingga instalasi service worker selalu error.
 * - Path JS diperbarui mengikuti struktur folder js/ yang baru.
 * - CACHE_NAME dinaikkan supaya klien lama otomatis mengambil cache baru.
 */
const CACHE_NAME = 'campusmate-v1.3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './js/main.js',
  './js/core/app-namespace.js',
  './js/core/render.js',
  './js/core/router.js',
  './js/core/search.js',
  './js/core/state.js',
  './js/data/db.js',
  './js/data/seed.js',
  './js/pages/courses.js',
  './js/pages/grades.js',
  './js/pages/home.js',
  './js/pages/notes.js',
  './js/pages/schedule.js',
  './js/pages/settings.js',
  './js/pages/tasks.js',
  './js/ui/bottomnav.js',
  './js/ui/fab.js',
  './js/ui/sheet.js',
  './js/ui/theme.js',
  './js/ui/topbar.js',
  './js/utils/date.js',
  './js/utils/format.js',
  './js/utils/grades.js',
  './js/utils/icons.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
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
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
