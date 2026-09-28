/**
 * pages/schedule.js
 * Halaman jadwal perkuliahan mingguan (per hari) + form tambah/edit jadwal.
 * Material Design 3 / CampusMate Edition — "The Focused Scholar"
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc, fmtTime } from '../utils/format.js';
import { DAYS, todayDayName } from '../utils/date.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { 
  fetchSharedCourses, 
  getCachedCourses, 
  subscribeCourses 
} from '../data/courses.js';
import {
  openCoursePicker,
  openSelectionSubSheet,
  openTimePicker,
  renderTimeTrigger,
  updateTimeTriggerUI,
  openDeleteConfirmation
} from '../ui/picker.js';

let schedulesCache = [];
let coursesCache = getCachedCourses();
let isFetching = false;
let hasLoaded = false;
let fetchError = false;

export function resetSchedulesCache() {
  schedulesCache = [];
  hasLoaded = false;
  isFetching = false;
  fetchError = false;
}

// Standar preset waktu kuliah umum (3 SKS / 2.5 jam)
const TIME_PRESETS = [
  { label: 'Pagi 1', start: '07:30', end: '10:00' },
  { label: 'Siang', start: '10:15', end: '12:45' },
  { label: 'Sore 1', start: '13:30', end: '16:00' },
  { label: 'Sore 2', start: '16:15', end: '18:45' }
];

// Helper notifikasi toast konsisten
function showToast(message, isError = false) {
  const toast = document.getElementById('toastStack');
  if (!toast) return;
  const el = document.createElement('div');
  el.className = isError
    ? 'alert alert-error text-xs shadow-none border border-rose-200 dark:border-rose-900 py-2.5 px-3.5 rounded-2xl flex items-center gap-2'
    : 'alert alert-success text-xs shadow-none border border-emerald-200 dark:border-emerald-900 py-2.5 px-3.5 rounded-2xl flex items-center gap-2';
  el.innerHTML = `<span>${esc(message)}</span>`;
  toast.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Sinkronkan cache mata kuliah setiap kali ada perubahan data global
subscribeCourses((updatedCourses) => {
  coursesCache = updatedCourses;
  // Re-render hanya jika halaman jadwal sedang aktif & sudah pernah dimuat
  if (hasLoaded && state.route === 'schedule') {
    render();
  }
});

// Fungsi menarik data jadwal & mata kuliah terbaru dari Supabase
async function fetchScheduleData() {
  if (isFetching) return;
  isFetching = true;

  try {
    const [schRes, courses] = await Promise.all([
      supabase.from('schedules').select('*').order('start_time', { ascending: true }),
      fetchSharedCourses()
    ]);

    if (!schRes.error && schRes.data) schedulesCache = schRes.data;
    if (courses) coursesCache = courses;
    fetchError = false;
  } catch (err) {
    console.error('Gagal memuat jadwal:', err);
    fetchError = true;
  } finally {
    isFetching = false;
    hasLoaded = true;
    render();
  }
}

// Panggil saat file pertama kali dimuat
fetchScheduleData();

// Helper status waktu kuliah (time-aware status pill)
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

// Helper hitung selisih jam & menit kuliah
function getDurationLabel(startStr, endStr) {
  if (!startStr || !endStr) return '';
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMin <= 0) return '';
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0 && mins > 0) return `${hours}j ${mins}m`;
  if (hours > 0) return `${hours} jam`;
  return `${mins} menit`;
}

// Skeleton loading state untuk mencegah false zero-state flash
function renderSkeleton() {
  return `
    <div class="space-y-4 animate-pulse">
      <!-- Day Bar Skeleton -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
        <div class="h-12 w-24 bg-base-200 dark:bg-base-800 rounded-2xl shrink-0"></div>
        <div class="h-12 w-24 bg-base-200 dark:bg-base-800 rounded-2xl shrink-0"></div>
        <div class="h-12 w-24 bg-base-200 dark:bg-base-800 rounded-2xl shrink-0"></div>
        <div class="h-12 w-24 bg-base-200 dark:bg-base-800 rounded-2xl shrink-0"></div>
        <div class="h-12 w-24 bg-base-200 dark:bg-base-800 rounded-2xl shrink-0"></div>
      </div>

      <!-- Schedule Cards Skeleton -->
      <div class="space-y-3">
        <div class="p-4 bg-base-100 dark:bg-base-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-center gap-3.5">
          <div class="h-12 w-16 bg-base-200 dark:bg-base-700 rounded-xl shrink-0"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-base-300 dark:bg-base-600 rounded w-44"></div>
            <div class="h-3 bg-base-200 dark:bg-base-700 rounded w-28"></div>
          </div>
        </div>
        <div class="p-4 bg-base-100 dark:bg-base-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-center gap-3.5">
          <div class="h-12 w-16 bg-base-200 dark:bg-base-700 rounded-xl shrink-0"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-base-300 dark:bg-base-600 rounded w-52"></div>
            <div class="h-3 bg-base-200 dark:bg-base-700 rounded w-36"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function pageSchedule() {
  if (!hasLoaded && !isFetching) {
    fetchScheduleData();
  }

  // Tampilkan skeleton loader jika data awal masih diambil
  if (!hasLoaded && isFetching) {
    return renderSkeleton();
  }

  const currentDayName = todayDayName();
  if (!state.schedDay) {
    state.schedDay = currentDayName;
  }

  const isCurrentDay = state.schedDay === currentDayName;
  const isWeekend = state.schedDay === 'Sabtu' || state.schedDay === 'Minggu';
  const list = schedulesCache.filter(s => s.day === state.schedDay);

  return `
    <div class="space-y-3.5">
      <!-- 1. Day Selector Ergonomics & Header Navigasi -->
      <div>
        <div class="flex items-center justify-between mb-2.5 px-0.5 gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-bold uppercase tracking-wider text-base-content/75 dark:text-slate-300 leading-none">Jadwal Perkuliahan</span>
            <span class="inline-flex items-center justify-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-base-200/90 dark:bg-base-800 text-base-content/85 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/80 leading-none shrink-0">
              ${list.length} Kelas
            </span>
          </div>
          ${!isCurrentDay ? `
            <button onclick="App.setSchedDay('${currentDayName}')" class="h-12 min-h-[48px] px-3.5 rounded-2xl bg-brand/10 dark:bg-brand/20 hover:bg-brand/15 dark:hover:bg-brand/30 text-xs font-semibold text-brand dark:text-indigo-300 inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0">
              <span>Ke Hari Ini (${currentDayName})</span>
              <span class="w-3.5 h-3.5 flex items-center justify-center shrink-0">${ICON.chevR}</span>
            </button>
          ` : `
            <span class="h-12 min-h-[48px] px-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/20 dark:border-emerald-700/60 text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 leading-none shrink-0">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>Hari Ini</span>
            </span>
          `}
        </div>

        <!-- 7-Day Filter Bar (48dp Touch Floor Standards) -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
          ${DAYS.map(d => {
            const isSelected = state.schedDay === d;
            const isToday = d === currentDayName;
            const dayCount = schedulesCache.filter(s => s.day === d).length;

            let btnCls = '';
            let badgeCls = '';

            if (isSelected) {
              btnCls = 'bg-brand text-white border-brand font-bold';
              badgeCls = 'bg-white/25 text-white';
            } else if (isToday) {
              btnCls = 'bg-brand/10 dark:bg-brand/20 border-brand/40 dark:border-brand/50 text-brand dark:text-indigo-300 font-bold hover:bg-brand/15';
              badgeCls = 'bg-brand/20 text-brand dark:bg-indigo-900/60 dark:text-indigo-200';
            } else {
              btnCls = 'bg-base-100 dark:bg-base-800/90 border-slate-200/90 dark:border-slate-700/80 text-base-content/85 dark:text-slate-200 hover:bg-base-200/80 dark:hover:bg-base-700 hover:text-base-content dark:hover:text-white font-medium';
              badgeCls = 'bg-base-200 dark:bg-base-700 text-base-content/75 dark:text-slate-300';
            }

            return `
              <button 
                onclick="App.setSchedDay('${d}')" 
                class="h-12 min-h-[48px] px-3.5 rounded-2xl border text-xs inline-flex items-center justify-center gap-2 flex-shrink-0 transition-all active:scale-95 cursor-pointer ${btnCls}">
                <span class="leading-none">${d}</span>
                ${isToday && !isSelected ? `<span class="w-1.5 h-1.5 rounded-full bg-brand dark:bg-indigo-400 shrink-0"></span>` : ''}
                ${dayCount > 0 ? `<span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none ${badgeCls}">${dayCount}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Daftar Kelas / Timeline List -->
      <div class="space-y-3">
        ${list.length ? list.map(sc => {
          const course = coursesCache.find(c => c.id === sc.course_id);
          const courseName = course ? course.name : 'Mata Kuliah Dihapus';
          const lecturer = course && course.lecturer ? course.lecturer : null;
          const lecturerContact = course && course.lecturer_contact ? course.lecturer_contact : null;
          const credits = course && course.credits ? `${course.credits} SKS` : null;
          const duration = getDurationLabel(sc.start_time, sc.end_time);

          // Status dinamis jika sedang melihat hari ini
          let statusPill = '';
          let cardBorderCls = 'border-slate-200/80 dark:border-slate-700/80 hover:border-brand/40 dark:hover:border-indigo-500/50';
          let cardBgCls = 'bg-base-100 dark:bg-base-800/80';

          if (isCurrentDay) {
            const status = getClassStatus(sc.start_time, sc.end_time);
            if (status === 'ongoing') {
              statusPill = `
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 leading-none shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  Sedang Berlangsung
                </span>
              `;
              cardBorderCls = 'border-emerald-300 dark:border-emerald-700/80';
              cardBgCls = 'bg-emerald-50/40 dark:bg-emerald-950/40';
            } else if (status === 'past') {
              statusPill = `<span class="inline-flex items-center text-xs text-base-content/60 dark:text-slate-400 font-medium px-2 py-0.5 rounded-md bg-base-200/60 dark:bg-base-800/60 border border-transparent dark:border-slate-700/60 leading-none shrink-0">Selesai</span>`;
              cardBgCls = 'bg-base-100/60 dark:bg-base-900/40 opacity-75';
            } else {
              statusPill = `<span class="inline-flex items-center text-xs text-brand dark:text-indigo-300 font-medium px-2 py-0.5 rounded-md bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 leading-none shrink-0">Akan Datang</span>`;
            }
          }

          return `
            <div onclick="App.editSched('${sc.id}')" class="group transition-all active:scale-[0.99] flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border ${cardBorderCls} ${cardBgCls} cursor-pointer">
              <!-- Kolom Waktu & SKS -->
              <div class="text-center pr-3 border-r border-slate-200/80 dark:border-slate-700/80 min-w-[70px] flex-shrink-0 flex flex-col items-center justify-center">
                <span class="font-display text-sm font-bold block text-brand dark:text-indigo-300 leading-tight">${fmtTime(sc.start_time)}</span>
                <span class="text-xs text-base-content/70 dark:text-slate-300 font-medium block mt-0.5 leading-tight">${fmtTime(sc.end_time)}</span>
                ${credits ? `
                  <span class="inline-flex items-center justify-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-base-200/90 dark:bg-base-800 text-base-content/85 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 mt-1.5 leading-none">
                    ${credits}
                  </span>
                ` : ''}
              </div>

              <!-- Informasi Mata Kuliah, Ruangan, dan Dosen -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100 group-hover:text-brand dark:group-hover:text-indigo-300 transition-colors truncate">
                    ${esc(courseName)}
                  </h4>
                  ${statusPill}
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-base-content/80 dark:text-slate-300">
                  <span class="inline-flex items-center gap-1 font-medium shrink-0">
                    <span class="text-brand dark:text-indigo-400 w-3.5 h-3.5 flex items-center justify-center shrink-0">${ICON.mapPin}</span>
                    <span>${esc(sc.room || 'Ruang belum ditentukan')}</span>
                  </span>
                  ${duration ? `
                    <span class="text-xs text-base-content/60 dark:text-slate-400 font-normal shrink-0">(${duration})</span>
                  ` : ''}
                  ${lecturer ? `
                    <span class="inline-flex items-center gap-1 font-medium truncate max-w-full">
                      <span class="opacity-40 shrink-0">•</span>
                      <span class="truncate">${esc(lecturer)}</span>
                    </span>
                  ` : ''}
                </div>

                ${lecturerContact ? `
                  <div class="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand dark:text-indigo-200 bg-brand/10 dark:bg-brand/25 border border-brand/20 dark:border-brand/30 px-2.5 py-0.5 rounded-md">
                    <span class="w-3.5 h-3.5 flex items-center justify-center shrink-0">${ICON.phone}</span>
                    <span class="truncate">${esc(lecturerContact)}</span>
                  </div>
                ` : ''}
              </div>

              <!-- Chevron Aksi -->
              <div class="w-6 h-6 flex items-center justify-center text-base-content/40 dark:text-slate-400 group-hover:text-base-content/70 dark:group-hover:text-slate-200 self-center pl-1 shrink-0 transition-colors">
                ${ICON.chevR}
              </div>
            </div>
          `;
        }).join('') : (
          isWeekend ? `
            <!-- Empty State Akhir Pekan (Calming & Relaxing) -->
            <div class="text-center p-8 border border-slate-200/80 dark:border-slate-700/80 bg-base-100/80 dark:bg-base-800/50 rounded-3xl space-y-3">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              </div>
              <div class="max-w-xs mx-auto space-y-1">
                <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100">Akhir Pekan Bebas Kuliah</h4>
                <p class="text-xs text-base-content/80 dark:text-slate-300 leading-relaxed">
                  Tidak ada agenda kuliah untuk hari ${state.schedDay}. Waktu yang tepat untuk istirahat, hobi, atau mencicil tugas mandiri.
                </p>
              </div>
              <div class="pt-2">
                <button onclick="App.openScheduleForm(null)" class="btn btn-ghost border border-slate-300 dark:border-slate-700 bg-base-100 dark:bg-base-800 h-12 min-h-[48px] px-5 rounded-2xl text-xs font-semibold text-base-content/85 dark:text-slate-200 hover:text-base-content dark:hover:text-white inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95">
                  <span class="w-4 h-4 flex items-center justify-center shrink-0">${ICON.plus}</span>
                  <span>Tambah Jadwal Khusus</span>
                </button>
              </div>
            </div>
          ` : `
            <!-- Empty State Hari Kerja (Action-Oriented) -->
            <div class="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700/90 bg-base-100/60 dark:bg-base-800/40 rounded-3xl space-y-3">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-brand/10 dark:bg-brand/25 border border-brand/20 dark:border-brand/40 flex items-center justify-center text-brand dark:text-indigo-300">
                <span class="w-6 h-6 flex items-center justify-center">${ICON.calendar}</span>
              </div>
              <div class="max-w-xs mx-auto space-y-1">
                <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100">Tidak Ada Kuliah di Hari ${state.schedDay}</h4>
                <p class="text-xs text-base-content/80 dark:text-slate-300 leading-relaxed">
                  Belum ada jadwal kuliah atau praktikum yang diagendakan untuk hari ${state.schedDay}.
                </p>
              </div>
              <div class="pt-2">
                <button onclick="App.openScheduleForm(null)" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] px-6 rounded-2xl text-xs font-semibold inline-flex items-center gap-2 active:scale-95 transition-all cursor-pointer border-none">
                  <span class="w-4 h-4 flex items-center justify-center shrink-0">${ICON.plus}</span>
                  <span>Tambah Jadwal ${state.schedDay}</span>
                </button>
              </div>
            </div>
          `
        )}
      </div>
    </div>
  `;
}

App.setSchedDay = (d) => {
  state.schedDay = d;
  render();
};

App.editSched = (id) => {
  const scheduleObj = schedulesCache.find(s => s.id === id);
  window.openScheduleForm(scheduleObj);
};

/**
 * Modal Bottom Sheet: Tambah / Edit Jadwal Kuliah
 * Dilengkapi M3 Touch Selection Sheets, validasi waktu presisi, & konfirmasi hapus in-sheet.
 */
window.openScheduleForm = async function(scheduleObj = null) {
  // Pastikan data mata kuliah dari shared cache terisi mutakhir
  let shared = getCachedCourses();
  if (!shared || shared.length === 0) {
    shared = await fetchSharedCourses();
  }
  if (shared && shared.length > 0) {
    coursesCache = shared;
  }

  const s = scheduleObj || {
    course_id: '',
    day: state.schedDay || 'Senin',
    start_time: '',
    end_time: '',
    room: ''
  };

  const initialCourseId = s.course_id || '';
  const initialDay = s.day || state.schedDay || 'Senin';
  const sortedCourses = [...coursesCache].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  openSheet(scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal', `
    <div id="sched_form_container" class="relative">
      <!-- VIEW 1: Formulir Utama Jadwal -->
      <div id="sched_form_main" class="flex flex-col gap-3.5 text-xs">
        <!-- Notifikasi Validasi / Error Inline -->
        <div id="sched_alert" class="hidden bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
          <svg class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span id="sched_alert_msg">Mata Kuliah wajib dipilih!</span>
        </div>

        ${coursesCache.length === 0 ? `
          <!-- Dead-end trap preventer: Link ke pembuatan mata kuliah -->
          <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-3">
            <div class="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0">
              ${ICON.book}
            </div>
            <div class="flex-1 min-w-0">
              <h5 class="font-bold text-xs text-amber-900 dark:text-amber-200">Belum Ada Mata Kuliah</h5>
              <p class="text-xs text-amber-800/90 dark:text-amber-300 mt-0.5">Tambahkan mata kuliah terlebih dahulu sebelum menyusun jadwal.</p>
              <button type="button" id="btnQuickAddCourse" class="mt-2 text-xs font-bold text-brand dark:text-indigo-300 hover:underline inline-flex items-center gap-1 cursor-pointer">
                + Tambah Mata Kuliah Sekarang →
              </button>
            </div>
          </div>
        ` : ''}

        <!-- 1. Mata Kuliah (M3 Selection Trigger Card) -->
        <div>
          <label class="block font-semibold text-xs text-base-content/90 dark:text-slate-200 mb-1">Mata Kuliah</label>
          <input type="hidden" id="f_s_course" value="${esc(initialCourseId)}" />
          <button type="button" id="trigger_f_s_course" class="w-full h-12 min-h-[48px] px-3.5 bg-base-100 dark:bg-base-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between text-left hover:border-brand/40 dark:hover:border-indigo-400/50 focus:border-brand transition-all cursor-pointer">
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-brand dark:text-indigo-400 shrink-0">${ICON.book}</span>
              <span id="course_display_text" class="font-semibold text-xs text-base-content dark:text-slate-100 truncate">Pilih Mata Kuliah...</span>
            </div>
            <span class="text-base-content/45 dark:text-slate-400 shrink-0">${ICON.chevR}</span>
          </button>
        </div>

        <!-- 2. Hari Perkuliahan (M3 Selection Trigger Card) -->
        <div>
          <label class="block font-semibold text-xs text-base-content/90 dark:text-slate-200 mb-1">Hari Perkuliahan</label>
          <input type="hidden" id="f_s_day" value="${esc(initialDay)}" />
          <button type="button" id="trigger_f_s_day" class="w-full h-12 min-h-[48px] px-3.5 bg-base-100 dark:bg-base-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between text-left hover:border-brand/40 dark:hover:border-indigo-400/50 focus:border-brand transition-all cursor-pointer">
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-brand dark:text-indigo-400 shrink-0">${ICON.calendar}</span>
              <span id="day_display_text" class="font-semibold text-xs text-base-content dark:text-slate-100 truncate">${esc(initialDay)}</span>
            </div>
            <span class="text-base-content/45 dark:text-slate-400 shrink-0">${ICON.chevR}</span>
          </button>
        </div>

        <!-- 3. Jam Mulai & Jam Selesai (M3 Time Pickers) -->
        <div>
          <label class="block font-semibold text-xs text-base-content/90 dark:text-slate-200 mb-1">Waktu Perkuliahan</label>
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              ${renderTimeTrigger({
                id: 'f_s_start',
                value: s.start_time || '08:00',
                label: 'Mulai',
                placeholder: '08:00 WIB'
              })}
            </div>
            <div>
              ${renderTimeTrigger({
                id: 'f_s_end',
                value: s.end_time || '10:30',
                label: 'Selesai',
                placeholder: '10:30 WIB'
              })}
            </div>
          </div>

          <!-- Preset Cepat Jam Kuliah -->
          <div class="mt-2.5">
            <span class="text-xs font-semibold text-base-content/75 dark:text-slate-300 block mb-1.5">Pilihan Cepat (3 SKS):</span>
            <div class="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              ${TIME_PRESETS.map(p => `
                <button 
                  type="button" 
                  data-start="${p.start}" 
                  data-end="${p.end}" 
                  class="btn-preset-time h-8 px-3 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700/80 bg-base-100 dark:bg-base-800 hover:bg-base-200 dark:hover:bg-base-700 active:scale-95 transition-all text-base-content/85 dark:text-slate-200 hover:text-base-content dark:hover:text-white whitespace-nowrap cursor-pointer flex-shrink-0">
                  ${p.label} (${p.start})
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 4. Ruangan Kelas / Lab -->
        <div>
          <label for="f_s_room" class="block font-semibold text-xs text-base-content/90 dark:text-slate-200 mb-1">Ruangan / Tempat</label>
          <div class="relative flex items-center">
            <span class="absolute left-3.5 text-base-content/50 dark:text-slate-400 pointer-events-none">${ICON.mapPin}</span>
            <input 
              id="f_s_room" 
              class="input input-bordered w-full pl-9 h-12 rounded-xl text-xs bg-base-100 dark:bg-base-800/90 border-slate-200 dark:border-slate-700/80 text-base-content dark:text-slate-100 placeholder:text-base-content/45 dark:placeholder:text-slate-400 focus:border-brand dark:focus:border-indigo-400 focus:outline-none" 
              value="${esc(s.room || '')}" 
              placeholder="Contoh: Gedung B - Lab Multimedia 3" 
            />
          </div>
        </div>

        <!-- Tombol Aksi Formulir (48dp Touch Targets) -->
        <div class="flex gap-2.5 mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
          ${scheduleObj ? `
            <button type="button" class="btn btn-ghost bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 h-12 min-h-[48px] px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer" id="btnDelSch">
              ${ICON.trash}
              <span>Hapus</span>
            </button>
          ` : ''}
          <button type="button" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer" id="btnSaveSch">
            ${ICON.check}
            <span>Simpan Jadwal</span>
          </button>
        </div>
      </div>

      <!-- VIEW 2: Sub-Sheet Pilihan M3 (Mata Kuliah & Hari) -->
      <div id="sched_form_sub" class="hidden"></div>

      <!-- VIEW 3: Sub-Sheet Konfirmasi Hapus In-Sheet -->
      <div id="sched_form_delete" class="hidden"></div>
    </div>
  `);

  const sheetTitle = document.getElementById('sheetTitle');
  if (sheetTitle) {
    sheetTitle.style.color = '';
    sheetTitle.className = 'font-display font-bold text-base mb-4 text-base-content dark:text-slate-100';
  }

  // Update label trigger mata kuliah terpilih
  function updateCourseTriggerUI(courseId) {
    const displayEl = document.getElementById('course_display_text');
    if (!displayEl) return;
    const found = coursesCache.find(c => String(c.id) === String(courseId));
    if (found) {
      displayEl.textContent = found.name;
      displayEl.className = 'font-semibold text-xs text-base-content dark:text-slate-100 truncate';
    } else {
      displayEl.textContent = 'Pilih Mata Kuliah...';
      displayEl.className = 'font-medium text-xs text-base-content/60 dark:text-slate-400 truncate';
    }
  }

  // Update label trigger hari terpilih
  function updateDayTriggerUI(dayVal) {
    const displayEl = document.getElementById('day_display_text');
    if (displayEl) {
      displayEl.textContent = dayVal || 'Pilih Hari...';
      displayEl.className = dayVal ? 'font-semibold text-xs text-base-content dark:text-slate-100 truncate' : 'font-medium text-xs text-base-content/60 dark:text-slate-400 truncate';
    }
  }

  // Jalankan inisialisasi teks trigger
  updateCourseTriggerUI(initialCourseId);
  updateDayTriggerUI(initialDay);

  const mainView = document.getElementById('sched_form_main');
  const subView = document.getElementById('sched_form_sub');
  const delView = document.getElementById('sched_form_delete');

  // Pasang trigger Course Picker M3
  const courseTrigger = document.getElementById('trigger_f_s_course');
  if (courseTrigger) {
    courseTrigger.onclick = () => {
      openCoursePicker({
        containerId: 'sched_form_sub',
        mainViewId: 'sched_form_main',
        currentVal: document.getElementById('f_s_course').value,
        allowEmpty: false,
        onSelect: (newVal) => {
          document.getElementById('f_s_course').value = newVal;
          updateCourseTriggerUI(newVal);
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        }
      });
    };
  }

  // Pasang trigger Hari Perkuliahan M3 Selection Sheet
  const dayTrigger = document.getElementById('trigger_f_s_day');
  if (dayTrigger) {
    dayTrigger.onclick = () => {
      openSelectionSubSheet({
        containerId: 'sched_form_sub',
        mainViewId: 'sched_form_main',
        title: 'Pilih Hari Kuliah',
        subtitle: 'Tentukan hari perkuliahan rutin setiap minggu',
        currentVal: document.getElementById('f_s_day').value || 'Senin',
        options: DAYS.map(d => ({
          id: d,
          label: d,
          desc: d === todayDayName() ? 'Hari Ini' : 'Hari Perkuliahan',
          icon: ICON.calendar
        })),
        onSelect: (newVal) => {
          document.getElementById('f_s_day').value = newVal;
          updateDayTriggerUI(newVal);
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        }
      });
    };
  }

  // Pasang trigger Jam Mulai M3 Time Picker
  const startTimeTrigger = document.getElementById('f_s_start');
  if (startTimeTrigger) {
    startTimeTrigger.onclick = () => {
      openTimePicker({
        containerId: 'sched_form_sub',
        mainViewId: 'sched_form_main',
        title: 'Pilih Jam Mulai Kuliah',
        currentVal: document.getElementById('f_s_start_val')?.value || '08:00',
        onSelect: (newVal) => {
          updateTimeTriggerUI('f_s_start', newVal);
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        }
      });
    };
  }

  // Pasang trigger Jam Selesai M3 Time Picker
  const endTimeTrigger = document.getElementById('f_s_end');
  if (endTimeTrigger) {
    endTimeTrigger.onclick = () => {
      openTimePicker({
        containerId: 'sched_form_sub',
        mainViewId: 'sched_form_main',
        title: 'Pilih Jam Selesai Kuliah',
        currentVal: document.getElementById('f_s_end_val')?.value || '10:30',
        onSelect: (newVal) => {
          updateTimeTriggerUI('f_s_end', newVal);
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal';
        }
      });
    };
  }

  // Shortcut tombol jika belum ada mata kuliah
  const btnQuickAddCourse = document.getElementById('btnQuickAddCourse');
  if (btnQuickAddCourse) {
    btnQuickAddCourse.onclick = () => {
      closeSheet();
      App.navigate('courses');
      if (typeof window.openCourseForm === 'function') {
        window.openCourseForm();
      }
    };
  }

  // Pasang trigger pilihan preset jam kuliah
  document.querySelectorAll('.btn-preset-time').forEach(chip => {
    chip.onclick = () => {
      const start = chip.getAttribute('data-start');
      const end = chip.getAttribute('data-end');
      updateTimeTriggerUI('f_s_start', start);
      updateTimeTriggerUI('f_s_end', end);
    };
  });

  // Pasang listener hapus jadwal jika mode edit dengan Reusable M3 Delete Confirmation
  const delBtn = document.getElementById('btnDelSch');
  if (delBtn && scheduleObj && scheduleObj.id) {
    delBtn.onclick = () => {
      const course = coursesCache.find(c => c.id === s.course_id);
      const courseName = course ? course.name : 'Mata Kuliah';
      openDeleteConfirmation({
        containerId: 'sched_form_delete',
        mainViewId: 'sched_form_main',
        title: 'Hapus Jadwal Kuliah Ini?',
        entityName: 'Jadwal Kuliah',
        entityDetailsHtml: `
          <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">Mata Kuliah & Waktu</div>
          <div class="text-xs font-bold text-base-content dark:text-slate-100">${esc(courseName)}</div>
          <div class="text-xs text-base-content/80 dark:text-slate-300 mt-0.5">${esc(s.day)}, ${fmtTime(s.start_time)} - ${fmtTime(s.end_time)} · ${esc(s.room || 'Ruang -')}</div>
        `,
        warningText: 'Tindakan ini permanen. Jadwal kelas akan dihapus dari kalender mingguan Anda.',
        onCancel: () => {
          if (sheetTitle) sheetTitle.textContent = 'Edit Jadwal';
        },
        onConfirm: async () => {
          const { error } = await supabase.from('schedules').delete().eq('id', scheduleObj.id);
          if (error) throw error;
          closeSheet();
          showToast('Jadwal perkuliahan berhasil dihapus');
          fetchScheduleData();
        }
      });
    };
  }

  // Pasang listener simpan jadwal
  const saveBtn = document.getElementById('btnSaveSch');
  saveBtn.onclick = async () => {
    const alertBox = document.getElementById('sched_alert');
    const alertMsg = document.getElementById('sched_alert_msg');

    function showError(msg) {
      if (alertMsg) alertMsg.textContent = msg;
      if (alertBox) alertBox.classList.remove('hidden');
      setTimeout(() => { if (alertBox) alertBox.classList.add('hidden'); }, 3500);
    }

    const course_id = document.getElementById('f_s_course').value.trim();
    if (!course_id) {
      showError('Mata Kuliah wajib dipilih!');
      return;
    }

    const day = document.getElementById('f_s_day').value.trim() || 'Senin';
    const start_time = (document.getElementById('f_s_start_val')?.value || document.getElementById('f_s_start')?.value || '').trim();
    const end_time = (document.getElementById('f_s_end_val')?.value || document.getElementById('f_s_end')?.value || '').trim();

    if (!start_time || !end_time) {
      showError('Waktu mulai dan selesai wajib diisi!');
      return;
    }

    if (start_time >= end_time) {
      showError('Waktu selesai harus lebih lambat dari waktu mulai!');
      return;
    }

    const room = document.getElementById('f_s_room').value.trim();

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>Menyimpan...</span>`;

    const payload = {
      course_id,
      day,
      start_time,
      end_time,
      room
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) payload.user_id = user.id;

      if (scheduleObj && scheduleObj.id) {
        const { error } = await supabase.from('schedules').update(payload).eq('id', scheduleObj.id);
        if (error) throw error;
        showToast('Jadwal perkuliahan berhasil diperbarui');
      } else {
        const { error } = await supabase.from('schedules').insert([payload]);
        if (error) throw error;
        showToast('Jadwal perkuliahan berhasil ditambahkan');
      }

      closeSheet();
      fetchScheduleData();
    } catch (err) {
      console.error('Gagal menyimpan jadwal:', err);
      showError('Gagal menyimpan jadwal: ' + (err.message || 'Terjadi kesalahan'));
      saveBtn.disabled = false;
      saveBtn.innerHTML = `${ICON.check} <span>Simpan Jadwal</span>`;
    }
  };
};

// Tambahkan trigger global jika dibutuhkan tombol FAB / Quick Action
App.openScheduleForm = () => window.openScheduleForm(null);