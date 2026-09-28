/**
 * pages/home.js
 * Halaman utama / dashboard — Material Design 3 Edition
 * "The Focused Scholar" (Android-first personal academic companion)
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc, fmtTime } from '../utils/format.js';
import { todayDayName } from '../utils/date.js';
import { render } from '../core/render.js';
import { computeIPK as computeIPKShared } from '../utils/grades.js';
import { 
  fetchSharedCourses, 
  getCachedCourses, 
  subscribeCourses 
} from '../data/courses.js';
import {
  fetchSharedGrades,
  getCachedGrades,
  subscribeGrades
} from '../data/grades.js';
import {
  getCachedTasks,
  hasTasksLoaded,
  subscribeTasks,
  fetchTasksData
} from './tasks.js';
import {
  fetchSharedProfile,
  getCachedProfile,
  subscribeProfile,
  getProfileDisplayName
} from '../data/profile.js';

let homeData = {
  profile: getCachedProfile(),
  schedules: [],
  courses: getCachedCourses(),
  grades: getCachedGrades(),
  tasks: getCachedTasks(),
  exams: [],
  isFetching: false,
  hasLoaded: false,
  fetchError: false
};

// Reset seluruh data Home saat pergantian akun
export function resetHomeData() {
  homeData = {
    profile: null,
    schedules: [],
    courses: [],
    grades: [],
    tasks: [],
    exams: [],
    isFetching: false,
    hasLoaded: false,
    fetchError: false
  };
}

// Sinkronkan cache profil setiap kali ada pembaruan di modul Profile / Settings
subscribeProfile((updatedProfile) => {
  homeData.profile = updatedProfile;
  if (homeData.hasLoaded) {
    render();
  }
});

// Sinkronkan cache mata kuliah setiap kali ada perubahan data global
subscribeCourses((updatedCourses) => {
  homeData.courses = updatedCourses;
  if (homeData.hasLoaded) {
    render();
  }
});

// Sinkronkan cache nilai setiap kali ada perubahan data global
subscribeGrades((updatedGrades) => {
  homeData.grades = updatedGrades;
  if (homeData.hasLoaded) {
    render();
  }
});

// Sinkronkan cache tugas setiap kali ada perubahan di modul Tasks
subscribeTasks((updatedTasks) => {
  homeData.tasks = updatedTasks;
  if (homeData.hasLoaded) {
    render();
  }
});

// Ambil semua data yang diperlukan untuk Dashboard Home
export async function fetchHomeData(forceRefresh = false) {
  if (homeData.isFetching) return;
  homeData.isFetching = true;

  try {
    const [profile, schRes, courses, grades, tasks, exmRes] = await Promise.all([
      fetchSharedProfile(forceRefresh),
      supabase.from('schedules').select('*'),
      fetchSharedCourses(forceRefresh),
      fetchSharedGrades(forceRefresh),
      fetchTasksData(forceRefresh),
      supabase.from('exams').select('*').order('exam_date', { ascending: true })
    ]);

    homeData.profile = profile || getCachedProfile();
    if (!schRes.error && schRes.data) homeData.schedules = schRes.data;
    else if (forceRefresh) homeData.schedules = [];

    if (Array.isArray(courses) && courses.length > 0) {
      homeData.courses = courses;
    } else {
      homeData.courses = getCachedCourses();
    }
    if (Array.isArray(grades) && grades.length > 0) {
      homeData.grades = grades;
    } else {
      homeData.grades = getCachedGrades();
    }
    if (Array.isArray(tasks) && tasks.length > 0) {
      homeData.tasks = tasks;
    } else {
      homeData.tasks = getCachedTasks();
    }
    if (!exmRes.error && exmRes.data) homeData.exams = exmRes.data;
    else if (forceRefresh) homeData.exams = [];

    homeData.fetchError = false;
  } catch (err) {
    console.error('Gagal memuat data Home:', err);
    homeData.fetchError = true;
  } finally {
    homeData.isFetching = false;
    homeData.hasLoaded = true;
    render();
  }
}

// Panggil saat pertama kali dimuat
fetchHomeData();

// Helper hitung IPK ringkas
function computeIPK() {
  const courses = (Array.isArray(homeData.courses) && homeData.courses.length > 0) ? homeData.courses : getCachedCourses();
  const grades = (Array.isArray(homeData.grades) && homeData.grades.length > 0) ? homeData.grades : getCachedGrades();
  return computeIPKShared(courses, grades);
}

// Helper status waktu kuliah (time-aware schedule)
function getClassStatus(startTimeStr, endTimeStr) {
  if (!startTimeStr || !endTimeStr) return 'upcoming';
  const now = new Date();
  const [sh, sm] = startTimeStr.split(':').map(Number);
  const [eh, em] = endTimeStr.split(':').map(Number);
  const start = new Date(); start.setHours(sh, sm, 0, 0);
  const end = new Date(); end.setHours(eh, em, 0, 0);
  if (now >= start && now <= end) return 'ongoing';
  if (now > end) return 'past';
  return 'upcoming';
}

// Helper hitung countdown relatif ujian
function getExamCountdown(examDateStr) {
  if (!examDateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exam = new Date(examDateStr);
  exam.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Selesai', isUrgent: false };
  if (diffDays === 0) return { label: 'Hari Ini', isUrgent: true };
  if (diffDays === 1) return { label: 'Besok', isUrgent: true };
  if (diffDays <= 7) return { label: `H-${diffDays}`, isUrgent: true };
  return { label: `H-${diffDays}`, isUrgent: false };
}

// Helper peranan warna dinamis IPK
function getIpkTheme(ipkVal) {
  const num = parseFloat(ipkVal);
  if (isNaN(num) || num <= 0) {
    return {
      text: 'text-base-content/60 dark:text-slate-200',
      badge: 'bg-base-200/80 dark:bg-slate-800/90 border-base-300 dark:border-slate-700',
      iconBox: 'bg-base-300/80 dark:bg-slate-700/80 dark:border dark:border-slate-600/60 text-base-content/60 dark:text-slate-400',
      label: 'Belum Ada'
    };
  }
  if (num >= 3.50) {
    return {
      text: 'text-emerald-600 dark:text-emerald-300',
      badge: 'bg-emerald-50 dark:bg-slate-800/90 border-emerald-200 dark:border-slate-700',
      iconBox: 'bg-emerald-100 dark:bg-emerald-950/70 dark:border dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400',
      label: 'Cum Laude'
    };
  }
  if (num >= 3.00) {
    return {
      text: 'text-brand dark:text-indigo-300',
      badge: 'bg-indigo-50 dark:bg-slate-800/90 border-indigo-200 dark:border-slate-700',
      iconBox: 'bg-indigo-100 dark:bg-indigo-950/70 dark:border dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300',
      label: 'Memuaskan'
    };
  }
  return {
    text: 'text-amber-600 dark:text-amber-300',
    badge: 'bg-amber-50 dark:bg-slate-800/90 border-amber-200 dark:border-slate-700',
    iconBox: 'bg-amber-100 dark:bg-amber-950/70 dark:border dark:border-amber-800/60 text-amber-700 dark:text-amber-400',
    label: 'Perhatian'
  };
}

// Skeleton loading state saat data async masih berjalan
function renderSkeleton() {
  return `
    <div class="space-y-4 animate-pulse">
      <!-- Header Skeleton -->
      <div class="bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-none">
        <div class="space-y-2">
          <div class="h-5 bg-base-300 dark:bg-slate-800 rounded w-36"></div>
          <div class="h-3.5 bg-base-200 dark:bg-slate-800 rounded w-28"></div>
        </div>
        <div class="h-12 w-20 bg-base-200 dark:bg-slate-800 rounded-xl"></div>
      </div>

      <!-- Quick Action Skeleton -->
      <div class="h-12 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl"></div>

      <!-- Schedule Skeleton -->
      <div class="space-y-2">
        <div class="h-4 bg-base-200 dark:bg-slate-800 rounded w-32 mb-2"></div>
        <div class="h-16 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl"></div>
        <div class="h-16 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl"></div>
      </div>

      <!-- Stats Skeleton -->
      <div class="grid grid-cols-2 gap-3">
        <div class="h-20 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl"></div>
        <div class="h-20 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl"></div>
      </div>
    </div>
  `;
}

export function pageHome() {
  if (!homeData.courses || homeData.courses.length === 0) {
    const cachedC = getCachedCourses();
    if (cachedC && cachedC.length > 0) homeData.courses = cachedC;
  }
  if (!homeData.grades || homeData.grades.length === 0) {
    const cachedG = getCachedGrades();
    if (cachedG && cachedG.length > 0) homeData.grades = cachedG;
  }

  if (!homeData.hasLoaded && !homeData.isFetching) {
    fetchHomeData();
  }

  // Tampilkan Skeleton jika data awal masih diambil (menghindari false zero-state flash)
  if (!homeData.hasLoaded && homeData.isFetching) {
    return renderSkeleton();
  }

  const profile = homeData.profile || getCachedProfile();
  const name = getProfileDisplayName(profile);
  const ipk = computeIPK();
  const ipkTheme = getIpkTheme(ipk);
  const currentDay = todayDayName();

  // Filter jadwal hari ini
  const todaySchedules = homeData.schedules.filter(s => s.day === currentDay);

  // Cari ujian terdekat yang belum lewat
  const now = new Date();
  const upcomingExams = homeData.exams.filter(e => new Date(e.exam_date) >= new Date(now.setHours(0, 0, 0, 0)));
  const nextExam = upcomingExams[0] || homeData.exams[0];
  const examCountdown = nextExam ? getExamCountdown(nextExam.exam_date) : null;

  // Ambil daftar tugas dari cache terpadu atau homeData
  const allTasks = (hasTasksLoaded() && Array.isArray(getCachedTasks()) && getCachedTasks().length > 0)
    ? getCachedTasks()
    : (Array.isArray(homeData.tasks) ? homeData.tasks : []);
  
  // Tugas aktif: seluruh tugas yang BELUM berstatus 'Selesai' ('Belum dikerjakan' & 'Sedang dikerjakan')
  const activeTasks = allTasks.filter(t => t && t.status !== 'Selesai');

  // Hitung tugas mendesak (deadline hari ini / lewat) dari tugas aktif
  const todayDateStr = new Date().toISOString().split('T')[0];
  const urgentTasks = activeTasks.filter(t => t.deadline && t.deadline <= todayDateStr);

  return `
    <div class="space-y-4">
      <!-- 1. Header Mahasiswa & IPK (Material 3 Flattened Container) -->
      <div class="bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center transition-all shadow-none">
        <div class="min-w-0 pr-3">
          <h2 class="font-display text-lg font-bold text-base-content dark:text-slate-100 truncate">Halo, ${esc(name)}</h2>
          <p class="text-xs text-base-content/70 dark:text-slate-400 mt-0.5 font-medium">Semester Aktif · ${currentDay}</p>
        </div>
        <button onclick="App.navigate('grades')" class="cursor-pointer active:scale-95 transition-transform flex items-center gap-2 px-3 py-1.5 rounded-xl border ${ipkTheme.badge}" title="Lihat detail nilai & IPK">
          <div class="w-7 h-7 rounded-lg ${ipkTheme.iconBox} flex items-center justify-center shrink-0">
            ${ICON.award}
          </div>
          <div class="text-right">
            <span class="text-xs uppercase tracking-wider block font-bold text-base-content/70 dark:text-slate-400">IPK</span>
            <span class="font-display text-lg font-extrabold block leading-tight ${ipkTheme.text}">${ipk}</span>
          </div>
        </button>
      </div>

      <!-- 2. Pomodoro Focus Quick-Action (Core Pillar Launcher) -->
      <div onclick="App.navigate('pomodoro')" class="cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between p-3.5 bg-brand/5 dark:bg-slate-900/60 border border-brand/15 dark:border-slate-800 rounded-2xl hover:bg-brand/10 dark:hover:bg-slate-900/80">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="p-2 rounded-xl bg-brand/10 dark:bg-indigo-950/60 text-brand dark:text-indigo-400 flex-shrink-0">
            ${ICON.timer}
          </div>
          <div class="min-w-0">
            <h3 class="font-display text-xs font-bold text-base-content dark:text-slate-100">Fokus Belajar (Pomodoro)</h3>
            <p class="text-xs text-base-content/60 dark:text-slate-400 truncate">Tingkatkan konsentrasi belajar per sesi</p>
          </div>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 bg-base-100 dark:bg-slate-800 border border-brand/20 dark:border-slate-700 text-brand dark:text-indigo-400 rounded-full flex-shrink-0">
          Mulai Sesi →
        </span>
      </div>

      <!-- 3. Jadwal Kuliah Hari Ini -->
      <div>
        <div class="flex justify-between items-center mb-2 px-0.5">
          <h3 class="font-display font-bold text-xs uppercase tracking-wider text-base-content/70 dark:text-slate-400">
            Jadwal Kuliah (${currentDay})
          </h3>
          <button onclick="App.navigate('schedule')" class="text-xs text-primary dark:text-indigo-400 font-semibold hover:underline">
            ${todaySchedules.length} Kelas · Lihat Semua →
          </button>
        </div>

        <div class="space-y-2">
          ${todaySchedules.length ? todaySchedules.map(sc => {
            const courseObj = homeData.courses.find(c => String(c.id) === String(sc.course_id));
            const courseName = courseObj ? courseObj.name : 'Mata Kuliah';
            const status = getClassStatus(sc.start_time, sc.end_time);

            let statusBadge = '';
            let cardClass = 'bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800';

            if (status === 'ongoing') {
              statusBadge = '<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex-shrink-0">Sedang Berlangsung</span>';
              cardClass = 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50';
            } else if (status === 'past') {
              statusBadge = '<span class="text-xs text-base-content/40 dark:text-slate-500 font-medium flex-shrink-0">Selesai</span>';
              cardClass = 'bg-base-100/60 dark:bg-slate-900/40 border-base-200 dark:border-slate-800 opacity-70';
            }

            return `
              <div onclick="App.navigate('schedule')" class="cursor-pointer active:scale-[0.99] transition-all flex items-center gap-3 p-3.5 border rounded-2xl ${cardClass} hover:border-primary/40 dark:hover:border-indigo-500/40">
                <div class="text-center font-bold text-xs text-primary dark:text-indigo-400 pr-3 border-r border-base-200 dark:border-slate-800 min-w-[62px] flex-shrink-0">
                  <span class="font-display font-bold">${fmtTime(sc.start_time)}</span>
                  <small class="block text-xs text-base-content/60 dark:text-slate-400 font-medium">${fmtTime(sc.end_time)}</small>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-display font-bold text-xs text-base-content dark:text-slate-100 truncate">${esc(courseName)}</h4>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs text-base-content/70 dark:text-slate-400 flex items-center gap-1 truncate">
                      ${ICON.mapPin} ${esc(sc.room || 'Ruang -')}
                    </span>
                    ${statusBadge}
                  </div>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="text-center p-6 bg-base-100 dark:bg-slate-900/60 border border-dashed border-base-300 dark:border-slate-800 rounded-2xl">
              <p class="font-display text-xs font-semibold text-base-content/70 dark:text-slate-300">Tidak ada jadwal kuliah hari ${currentDay}</p>
              <p class="text-xs text-base-content/50 dark:text-slate-400 mt-0.5">Nikmati waktu luang atau cicil tugas kuliah</p>
              <button onclick="App.navigate('schedule')" class="btn btn-xs btn-outline btn-primary dark:border-indigo-500/50 dark:text-indigo-400 mt-3 rounded-full font-medium">
                Kelola Jadwal Kuliah
              </button>
            </div>
          `}
        </div>
      </div>

      <!-- 4. Ringkasan Tugas & Ujian Terdekat (Interactive Stat Blocks) -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Card Tugas -->
        <div onclick="App.navigate('tasks')" class="cursor-pointer active:scale-[0.98] transition-all p-3.5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl hover:border-primary/40">
          <div class="flex justify-between items-start">
            <span class="text-xs text-base-content/70 dark:text-slate-400 font-semibold block">Tugas Aktif</span>
            <span class="text-xs text-primary font-bold">→</span>
          </div>
          <div class="my-1">
            <span class="font-display text-2xl font-extrabold ${urgentTasks.length > 0 ? 'text-error dark:text-rose-400' : 'text-primary'}">
              ${activeTasks.length}
            </span>
          </div>
          <span class="text-xs block text-base-content/60 dark:text-slate-400 font-medium">
            ${urgentTasks.length > 0 ? `<span class="text-error dark:text-rose-400 font-semibold">${urgentTasks.length} mendesak</span>` : 'Semua aman'}
          </span>
        </div>

        <!-- Card Ujian -->
        <div onclick="App.navigate('exams')" class="cursor-pointer active:scale-[0.98] transition-all p-3.5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl hover:border-primary/40">
          <div class="flex justify-between items-start">
            <span class="text-xs text-base-content/70 dark:text-slate-400 font-semibold block">Ujian Terdekat</span>
            <span class="text-xs text-primary font-bold">→</span>
          </div>
          <div class="my-1">
            <span class="font-display text-2xl font-extrabold ${examCountdown && examCountdown.isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-base-content dark:text-slate-100'}">
              ${examCountdown ? examCountdown.label : '-'}
            </span>
          </div>
          <span class="text-xs font-bold text-base-content dark:text-slate-200 truncate block">
            ${nextExam ? esc(nextExam.title) : 'Belum ada ujian'}
          </span>
        </div>
      </div>
    </div>
  `;
}
