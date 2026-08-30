/**
 * router.js
 * Navigasi antar halaman. Aplikasi ini single-page tanpa URL routing
 * (tidak pakai history/hash) — cukup ubah state.route lalu render ulang.
 */
import { App } from './app-namespace.js';
import { state } from './state.js';
import { render } from './render.js';

export function navigate(route) {
  state.route = route;
  render();
  document.getElementById('page').scrollTo(0, 0);
}

App.navigate = navigate;
