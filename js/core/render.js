/**
 * render.js
 * Titik pusat re-render aplikasi. Dipanggil ulang setiap kali ada
 * perubahan data atau navigasi. Pola render-nya sederhana:
 * hitung ulang HTML dari data terbaru, lalu timpa innerHTML #page.
 */
import { state } from './state.js';
import { DB } from '../data/db.js';
import { applyTheme } from '../ui/theme.js';
import { renderTopbar } from '../ui/topbar.js';
import { renderBottomNav } from '../ui/bottomnav.js';
import { renderFab } from '../ui/fab.js';
import { pageHome } from '../pages/home.js';
import { pageTasks } from '../pages/tasks.js';
import { pageSchedule } from '../pages/schedule.js';
import { pageCourses } from '../pages/courses.js';
import { pageNotes } from '../pages/notes.js';
import { pageGrades } from '../pages/grades.js';
import { pageSettings } from '../pages/settings.js';
import { pageExams } from '../pages/exams.js';

const PAGES = {
  home: pageHome,
  tasks: pageTasks,
  schedule: pageSchedule,
  courses: pageCourses,
  notes: pageNotes,
  grades: pageGrades,
  settings: pageSettings,
  exams: pageExams
};

export function render() {
  applyTheme();
  renderTopbar();
  renderBottomNav();

  const page = document.getElementById('page');
  const renderPage = PAGES[state.route] || pageHome;
  page.innerHTML = renderPage();

  renderFab();
  bindEvents();
}

/** Pasang event listener untuk elemen yang hanya muncul di halaman tertentu (misalnya Pengaturan). */
function bindEvents() {
  const toggleDark = document.getElementById('toggleDark');
  if (toggleDark) toggleDark.onchange = () => {
    const s = DB.settings.get();
    s.dark = !s.dark;
    DB.settings.save(s);
    applyTheme();
  };

  const fname = document.getElementById('f_name');
  if (fname) fname.onchange = () => {
    const s = DB.settings.get();
    s.name = fname.value || 'Mahasiswa';
    DB.settings.save(s);
  };
}
