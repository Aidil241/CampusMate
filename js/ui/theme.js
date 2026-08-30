/**
 * theme.js
 * Terapkan tema (light/dark) ke elemen <html> berdasarkan setting tersimpan.
 */
import { DB } from '../data/db.js';

export function applyTheme() {
  const s = DB.settings.get();
  document.documentElement.setAttribute('data-theme', s.dark ? 'dark' : 'light');
}
