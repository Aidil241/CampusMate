/**
 * theme.js
 * Terapkan tema (sistem / terang / gelap) ke elemen <html> berdasarkan setting tersimpan.
 */
import { DB } from '../data/db.js';

export function applyTheme() {
  const s = DB.settings.get();
  const mode = s.theme || (s.dark ? 'dark' : 'system');

  let isDark = false;
  if (mode === 'dark') {
    isDark = true;
  } else if (mode === 'light') {
    isDark = false;
  } else {
    // Mode 'system': ikuti preferensi OS/perangkat via media query
    isDark = typeof window !== 'undefined' && 
             window.matchMedia && 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Terapkan ke elemen <html> untuk Tailwind 'selector' & DaisyUI data-theme
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

// Pasang listener sistem agar jika mode 'system', perubahan tema OS otomatis terdeteksi tanpa reload
if (typeof window !== 'undefined' && window.matchMedia) {
  try {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const s = DB.settings.get();
      if ((s.theme || 'system') === 'system') {
        applyTheme();
      }
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else if (mql.addListener) {
      mql.addListener(handler);
    }
  } catch (e) {
    // Fallback aman untuk platform/WebView lama
  }
}

