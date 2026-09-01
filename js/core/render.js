/**
 * render.js
 * Titik pusat re-render aplikasi dengan Proteksi Auth Supabase
 */
import { state } from './state.js';
import { DB } from '../data/db.js';
import { applyTheme } from '../ui/theme.js';
import { renderTopbar } from '../ui/topbar.js';
import { renderBottomNav } from '../ui/bottomnav.js';
import { renderFab } from '../ui/fab.js';
import { supabase } from '../data/supabase.js'; // <-- Import supabase

import { pageHome } from '../pages/home.js';
import { pageTasks } from '../pages/tasks.js';
import { pageSchedule } from '../pages/schedule.js';
import { pageCourses } from '../pages/courses.js';
import { pageNotes } from '../pages/notes.js';
import { pageGrades } from '../pages/grades.js';
import { pageSettings } from '../pages/settings.js';
import { pageExams } from '../pages/exams.js';
import { pageStats } from '../pages/stats.js';
import { pagePomodoro } from '../pages/pomodoro.js';
import { pageAuth } from '../pages/auth.js'; // <-- Import halaman auth

const PAGES = {
  home: pageHome,
  tasks: pageTasks,
  schedule: pageSchedule,
  courses: pageCourses,
  notes: pageNotes,
  grades: pageGrades,
  settings: pageSettings,
  exams: pageExams,
  stats: pageStats,
  pomodoro: pagePomodoro,
  auth: pageAuth // <-- Daftarkan rute auth
};

// Variabel status login global sederhana
let currentUser = null;

export async function render() {
  // Cek sesi user yang sedang login di Supabase
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session ? session.user : null;

  // Jika belum login, paksa rute ke halaman 'auth'
  if (!currentUser) {
    state.route = 'auth';
    
    // Amankan pembersihan elemen agar tidak error jika elemennya tidak ada
    const topbarEl = document.getElementById('topbar');
    const bottomNavEl = document.getElementById('bottom-nav');
    const fabEl = document.getElementById('fab');
    
    if (topbarEl) topbarEl.innerHTML = '';
    if (bottomNavEl) bottomNavEl.innerHTML = '';
    if (fabEl) fabEl.innerHTML = '';
    
    const page = document.getElementById('page');
    if (page) page.innerHTML = pageAuth();
    return;
  }

  // Jika sudah login, render normal seperti biasa
  applyTheme();
  renderTopbar();
  renderBottomNav();

  const page = document.getElementById('page');
  const renderPage = PAGES[state.route] || pageHome;
  if (page) page.innerHTML = renderPage();

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