/**
 * main.js
 * Entry point. Diload sebagai <script type="module"> dari index.html.
 * Urutan di sini penting: pastikan data ter-seed, tema diterapkan,
 * baru render UI pertama kali.
 *
 * Modul lain (search.js, router.js, pages/*.js) mendaftarkan diri
 * ke window.App lewat efek samping saat di-import — karena itu semua
 * diimpor lebih dulu di sini walau tidak dipakai langsung di file ini.
 */
import './core/app-namespace.js';
import './core/search.js';
import './core/router.js';

import { seedIfEmpty } from './data/seed.js';
import { applyTheme } from './ui/theme.js';
import { render } from './core/render.js';
import './pages/exams.js';
seedIfEmpty();
applyTheme();
render();
