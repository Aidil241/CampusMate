/**
 * render.js
 * Titik pusat re-render aplikasi dengan Proteksi Auth Supabase
 */
import { App } from './app-namespace.js';
import { state } from './state.js';
import { DB } from '../data/db.js';
import { applyTheme } from '../ui/theme.js';
import { renderTopbar } from '../ui/topbar.js';
import { renderBottomNav } from '../ui/bottomnav.js';
import { renderFab } from '../ui/fab.js';
import { supabase } from '../data/supabase.js'; // <-- Import supabase
import { isOAuthExchangePending, waitForOAuthExchange } from '../utils/auth-redirect.js';
import { checkUserSessionChange } from './session.js';

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
  try {
    // Jika proses pertukaran kode OAuth sedang berjalan, tunggu hingga selesai
    // agar deep-link callback tidak dianggap sebagai unauthenticated state
    if (isOAuthExchangePending()) {
      await waitForOAuthExchange();
    }

    // Cek sesi user yang sedang login di Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      currentUser = session ? session.user : null;
    } catch (authErr) {
      console.warn('[Render] getSession fallback:', authErr);
      currentUser = null;
    }

    // Periksa apakah user ID berubah (misal logout A -> login B)
    const currentUserId = currentUser ? currentUser.id : null;
    checkUserSessionChange(currentUserId);

    // Jika sudah login tetapi masih di rute 'auth', alihkan rute ke 'home'
    if (currentUser && state.route === 'auth') {
      state.route = 'home';
    }

    // Jika belum login, paksa rute ke halaman 'auth'
    if (!currentUser) {
      state.route = 'auth';
      
      const topbarEl = document.getElementById('topbar');
      const bottomNavEl = document.getElementById('bottomnav');
      const fabEl = document.getElementById('fabBtn');
      
      if (topbarEl) topbarEl.innerHTML = '';
      if (bottomNavEl) bottomNavEl.innerHTML = '';
      if (fabEl) { fabEl.innerHTML = ''; fabEl.classList.add('hidden'); }
      
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
    if (page) {
      try {
        page.innerHTML = renderPage();
      } catch (pageErr) {
        console.error(`[Render] Gagal merender halaman '${state.route}':`, pageErr);
        page.innerHTML = `
          <div class="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div class="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-4">
              <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 class="text-base font-bold text-base-content font-display mb-1">Gagal Memuat Halaman</h2>
            <p class="text-xs text-base-content/60 max-w-xs mb-6">Terjadi kendala saat memuat konten. Kamu bisa kembali ke Beranda atau mencoba lagi.</p>
            <div class="flex items-center gap-3">
              <button onclick="App.navigate('home')" class="btn btn-primary btn-sm min-h-[44px] px-5 rounded-xl font-medium">
                Ke Beranda
              </button>
              <button onclick="App.render()" class="btn btn-ghost btn-sm min-h-[44px] px-4 rounded-xl font-medium text-base-content/70">
                Coba Lagi
              </button>
            </div>
          </div>
        `;
      }
    }

    renderFab();
    bindEvents();
  } catch (globalErr) {
    console.error('[Render] Global app render error:', globalErr);
  }
}

App.render = render;

/** Pasang event listener untuk elemen yang hanya muncul di halaman tertentu (misalnya Pengaturan). */
function bindEvents() {
  const toggleDark = document.getElementById('toggleDark');
  if (toggleDark) toggleDark.onchange = () => {
    const s = DB.settings.get();
    s.dark = !s.dark;
    DB.settings.save(s);
    applyTheme();
  };
}