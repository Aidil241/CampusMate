/**
 * main.js
 * Entry point. Diload sebagai <script type="module"> dari index.html.
 */
import './core/app-namespace.js';
import './core/search.js';
import './core/router.js';

import { ReminderSys } from './utils/reminder.js';
import { seedIfEmpty } from './data/seed.js';
import { applyTheme } from './ui/theme.js';
import { render } from './core/render.js';
import { initAuthDeepLinks } from './utils/auth-redirect.js';

async function bootstrap() {
  seedIfEmpty();
  applyTheme();

  // Aktifkan Mesin Pengingat (Reminder) di latar belakang
  ReminderSys.init();

  // Inisialisasi listener Deep Link untuk Google OAuth & Password Reset
  // Await memastikan jika aplikasi dibuka via cold-start deep link,
  // proses code exchange selesai sebelum initial render berjalan
  try {
    await initAuthDeepLinks();
  } catch (err) {
    console.warn('[Main] initAuthDeepLinks warning:', err);
  }

  // Render antarmuka aplikasi
  await render();
}

bootstrap();