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
 * - PERBAIKAN BARU: daftar ASSETS sebelumnya tidak lengkap — beberapa file
 *   yang sudah lama ada di project (auth.js, exams.js, pomodoro.js, stats.js,
 *   utils/reminder.js, data/supabase.js) tidak pernah dicache. Karena semua
 *   file ini di-import lewat ES module, browser tetap butuh network saat
 *   offline untuk file yang hilang dari cache tsb — jadi banyak halaman akan
 *   blank saat offline walau service worker "aktif". Sekarang semua modul
 *   yang benar-benar dipakai aplikasi sudah masuk daftar.
 */
const CACHE_NAME = 'campusmate-v1.6';
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
  './js/data/courses.js',
  './js/data/db.js',
  './js/data/grades.js',
  './js/data/seed.js',
  './js/data/supabase.js',
  './js/pages/auth.js',
  './js/pages/courses.js',
  './js/pages/exams.js',
  './js/pages/grades.js',
  './js/pages/home.js',
  './js/pages/notes.js',
  './js/pages/pomodoro.js',
  './js/pages/schedule.js',
  './js/pages/settings.js',
  './js/pages/stats.js',
  './js/pages/tasks.js',
  './js/ui/bottomnav.js',
  './js/ui/fab.js',
  './js/ui/picker.js',
  './js/ui/sheet.js',
  './js/ui/theme.js',
  './js/ui/topbar.js',
  './js/utils/date.js',
  './js/utils/format.js',
  './js/utils/grades.js',
  './js/utils/icons.js',
  './js/utils/reminder.js'
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
  // Jangan cache-first untuk request ke Supabase (data harus selalu live).
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
