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

seedIfEmpty();
applyTheme();

// Aktifkan Mesin Pengingat (Reminder) di latar belakang
ReminderSys.init();

render();