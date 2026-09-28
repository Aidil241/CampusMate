/**
 * pages/tasks.js
 * Halaman daftar tugas (Material Design 3 Edition)
 * "The Focused Scholar" — Optimistic toggle, 48dp ergonomics, working deletion, and clear hierarchy.
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc, deadlineBadge, priorityBadgeClass } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { 
  fetchSharedCourses, 
  getCachedCourses, 
  subscribeCourses 
} from '../data/courses.js';
import {
  openCoursePicker,
  openDatePicker,
  openSelectionSubSheet,
  openDeleteConfirmation
} from '../ui/picker.js';
import { ReminderSys } from '../utils/reminder.js';

let tasksCache = [];
let coursesCache = getCachedCourses();
let isFetching = false;
let hasLoaded = false;
const taskListeners = new Set();

function notifyTaskListeners() {
  for (const fn of taskListeners) {
    try {
      fn(tasksCache);
    } catch (err) {
      console.error('Error in task subscriber:', err);
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('cm:tasks-updated', {
      detail: { tasks: tasksCache }
    }));
  }
}

export function subscribeTasks(fn) {
  taskListeners.add(fn);
  return () => taskListeners.delete(fn);
}

export function getCachedTasks() {
  return tasksCache;
}

export function hasTasksLoaded() {
  return hasLoaded;
}

export function resetTasksCache() {
  tasksCache = [];
  hasLoaded = false;
  isFetching = false;
  notifyTaskListeners();
}

// Set state default untuk filter jika belum ada
if (!state.taskFilterStatus) state.taskFilterStatus = 'Semua';
if (!state.taskFilterTag) state.taskFilterTag = 'Semua';

// Sinkronkan cache mata kuliah setiap kali ada perubahan data global
subscribeCourses((updatedCourses) => {
  coursesCache = updatedCourses;
  if (hasLoaded && state.route === 'tasks') {
    render();
  }
});

// Fungsi untuk mengambil data tugas dan mata kuliah dari Supabase
export async function fetchTasksData(forceRefresh = false) {
  if (!forceRefresh && hasLoaded && tasksCache.length > 0) {
    return tasksCache;
  }
  if (isFetching) return tasksCache;
  isFetching = true;

  try {
    const [taskRes, courses] = await Promise.all([
      supabase.from('tasks').select('*').order('deadline', { ascending: true }),
      fetchSharedCourses()
    ]);

    if (!taskRes.error && Array.isArray(taskRes.data)) {
      tasksCache = taskRes.data;
      notifyTaskListeners();
    }
    if (courses && Array.isArray(courses)) coursesCache = courses;
  } catch (err) {
    console.error('Gagal mengambil data tugas:', err);
  } finally {
    isFetching = false;
    hasLoaded = true;
    render();
  }
  return tasksCache;
}

// Panggil saat pertama kali dimuat
fetchTasksData();

// Helper untuk mencari nama mata kuliah berdasarkan ID
function getCourseName(courseId) {
  if (!coursesCache || !Array.isArray(coursesCache)) return 'Umum';
  const found = coursesCache.find(c => String(c.id) === String(courseId));
  return found ? found.name : 'Umum';
}

function renderTaskSkeleton() {
  return `
    <div class="space-y-3 animate-pulse">
      <div class="h-10 bg-base-200 rounded-xl"></div>
      <div class="h-16 bg-base-100 border border-base-200 rounded-2xl"></div>
      <div class="space-y-2 mt-4">
        <div class="h-4 bg-base-200 rounded w-28 mb-2"></div>
        <div class="h-20 bg-base-100 border border-base-200 rounded-2xl"></div>
        <div class="h-20 bg-base-100 border border-base-200 rounded-2xl"></div>
        <div class="h-20 bg-base-100 border border-base-200 rounded-2xl"></div>
      </div>
    </div>
  `;
}

export function pageTasks() {
  if (!hasLoaded && !isFetching) {
    fetchTasksData();
  }

  if (!hasLoaded && isFetching) {
    return renderTaskSkeleton();
  }

  let list = [...tasksCache];
  
  // Tag dinamis dari data
  const usedTags = [...new Set(tasksCache.map(t => t.tag || 'Umum'))];
  const availableTags = ['Semua', ...usedTags];
  
  // 1. Terapkan Filter Status
  if (state.taskFilterStatus !== 'Semua') {
    list = list.filter(t => t.status === state.taskFilterStatus);
  }
  
  // 2. Terapkan Filter Tag/Kategori
  if (state.taskFilterTag !== 'Semua') {
    list = list.filter(t => (t.tag || 'Umum') === state.taskFilterTag);
  }

  // Hitung jumlah tugas per status untuk badge filter
  const countBelum = tasksCache.filter(t => t.status === 'Belum dikerjakan').length;
  const countSedang = tasksCache.filter(t => t.status === 'Sedang dikerjakan').length;
  const countSelesai = tasksCache.filter(t => t.status === 'Selesai').length;

  const statusOptions = [
    { key: 'Semua', label: 'Semua', count: tasksCache.length },
    { key: 'Belum dikerjakan', label: 'Belum', count: countBelum },
    { key: 'Sedang dikerjakan', label: 'Sedang', count: countSedang },
    { key: 'Selesai', label: 'Selesai', count: countSelesai }
  ];

  return `
    <div class="space-y-3">
      <!-- Kolom Pencarian -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/50">
          ${ICON.search}
        </div>
        <input 
          type="text" 
          placeholder="Cari judul tugas atau mata kuliah..." 
          class="input input-bordered input-sm w-full pl-10 h-10 rounded-xl bg-base-100 text-xs text-base-content focus:border-brand focus:outline-none" 
          oninput="App.searchData(this.value, '.task-item')" 
        />
      </div>

      <!-- Area Filter (Flattened M3 Tonal Surface) -->
      <div class="bg-base-100 border border-base-200 p-3 rounded-2xl space-y-2.5">
        <!-- Baris Filter Status -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-base-content/60 uppercase tracking-wider w-16 text-right flex-shrink-0">Status</span>
          <div class="flex gap-1.5 overflow-x-auto flex-1 pb-0.5 scrollbar-hide">
            ${statusOptions.map(opt => {
              const active = state.taskFilterStatus === opt.key;
              const activeCls = active ? 'bg-brand text-white border-brand' : 'bg-base-200/80 text-base-content/70 border-transparent hover:bg-base-300';
              return `
                <button 
                  onclick="App.setTaskFilterStatus('${opt.key}')" 
                  class="btn btn-xs h-8 px-3 rounded-full border text-xs font-medium flex-shrink-0 flex items-center gap-1.5 transition-all ${activeCls}">
                  <span>${opt.label}</span>
                  <span class="text-xs opacity-75 font-semibold">(${opt.count})</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Baris Filter Tag/Kategori -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-base-content/60 uppercase tracking-wider w-16 text-right flex-shrink-0">Kategori</span>
          <div class="flex gap-1.5 overflow-x-auto flex-1 pb-0.5 scrollbar-hide">
            ${availableTags.map(tg => {
              const active = state.taskFilterTag === tg;
              const activeCls = active ? 'bg-brand text-white border-brand' : 'bg-base-200/80 text-base-content/70 border-transparent hover:bg-base-300';
              return `
                <button 
                  onclick="App.setTaskFilterTag('${tg}')" 
                  class="btn btn-xs h-8 px-3 rounded-full border text-xs font-medium flex-shrink-0 transition-all ${activeCls}">
                  ${tg}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Header Daftar Tugas & Counter -->
      <div class="flex justify-between items-center px-1 pt-1">
        <h3 class="font-display font-bold text-xs uppercase tracking-wider text-base-content/70">
          Daftar Tugas (${list.length})
        </h3>
        ${(state.taskFilterStatus !== 'Semua' || state.taskFilterTag !== 'Semua') ? `
          <button onclick="App.resetTaskFilters()" class="text-xs text-primary font-semibold hover:underline">
            Reset Filter
          </button>
        ` : ''}
      </div>

      <!-- Daftar Kartu Tugas -->
      <div class="space-y-2.5">
        ${list.length ? list.map(t => {
          if (!t) return '';
          try {
            const b = deadlineBadge(t.deadline, t.status);
            const tagLabel = t.tag || 'Umum';
            const isDone = t.status === 'Selesai';
            const isWorking = t.status === 'Sedang dikerjakan';
            const priorityVal = t.priority || 'Sedang';

            let statusBadge = '';
            if (isWorking) {
              statusBadge = '<span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold">Sedang Dikerjakan</span>';
            }

            return `
              <div class="task-item flex items-start gap-1 p-3 bg-base-100 border border-base-200 rounded-2xl transition-all hover:border-primary/40">
                <!-- Dedicated 48x48dp Touch Area for Checkbox (Prevents accidental edit modal triggers) -->
                <div 
                  onclick="event.stopPropagation(); App.toggleTask('${t.id}')" 
                  class="w-12 h-12 flex items-center justify-center flex-shrink-0 cursor-pointer -ml-1.5 -mt-1.5 rounded-xl hover:bg-base-200/60 active:scale-95 transition-all"
                  title="${isDone ? 'Tandai belum selesai' : 'Tandai selesai'}">
                  <input 
                    type="checkbox" 
                    ${isDone ? 'checked' : ''} 
                    class="checkbox checkbox-primary w-5 h-5 rounded-md pointer-events-none cursor-pointer" 
                  />
                </div>

                <!-- Content Area (Clicking opens Edit Sheet) -->
                <div class="flex-1 min-w-0 cursor-pointer pt-0.5" onclick="App.editTask('${t.id}')">
                  <h4 class="font-display font-semibold text-base leading-snug text-base-content ${isDone ? 'line-through text-base-content/40' : ''}">
                    ${esc(t.title || 'Tanpa Judul')}
                  </h4>
                  
                  <div class="flex gap-1.5 mt-2 flex-wrap items-center">
                    <!-- Course Pill -->
                    <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                      ${esc(getCourseName(t.course_id))}
                    </span>

                    <!-- Deadline Badge -->
                    <span class="text-xs px-2 py-0.5 rounded-full border ${b.cls}">
                      ${b.text}
                    </span>

                    <!-- Priority Badge -->
                    <span class="text-xs px-2 py-0.5 rounded-full border ${priorityBadgeClass(priorityVal)}">
                      ${priorityVal}
                    </span>

                    <!-- Status Badge if in-progress -->
                    ${statusBadge}

                    <!-- Tag Category -->
                    <span class="text-xs text-base-content/60 font-medium px-1">
                      · ${esc(tagLabel)}
                    </span>
                  </div>
                </div>
              </div>
            `;
          } catch (renderErr) {
            console.error('Gagal merender item tugas:', t, renderErr);
            return '';
          }
        }).join('') : `
          <div class="text-center p-8 bg-base-100 border border-dashed border-base-300 rounded-2xl">
            <div class="mb-2 text-base-content/30">${ICON.empty}</div>
            <p class="font-display text-xs font-semibold text-base-content/70">Tidak ada tugas yang cocok</p>
            <p class="text-xs text-base-content/50 mt-0.5">Coba ubah kata kunci pencarian atau reset filter</p>
            <button onclick="App.resetTaskFilters()" class="btn btn-xs btn-outline btn-primary mt-3 rounded-full font-medium">
              Tampilkan Semua Tugas
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

App.setTaskFilterStatus = (s) => { state.taskFilterStatus = s; render(); };
App.setTaskFilterTag = (tg) => { state.taskFilterTag = tg; render(); };
App.resetTaskFilters = () => { 
  state.taskFilterStatus = 'Semua'; 
  state.taskFilterTag = 'Semua'; 
  render(); 
};

// Optimistic Task Status Toggle
App.toggleTask = async (id) => {
  const t = tasksCache.find(item => item.id === id);
  if (!t) return;

  const oldStatus = t.status;
  const newStatus = oldStatus === 'Selesai' ? 'Belum dikerjakan' : 'Selesai';
  
  // 1. Optimistic UI update immediately
  t.status = newStatus;
  notifyTaskListeners();
  render();

  // 2. Background sync to Supabase & ReminderSys
  try {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id).select();
    if (error) throw error;
    if (newStatus === 'Selesai') {
      ReminderSys.cancelTaskReminder(id).catch(() => {});
    } else {
      ReminderSys.scheduleTaskReminder(t).catch(() => {});
    }
  } catch (err) {
    console.error('Gagal memperbarui status tugas:', err);
    // Rollback if failed
    t.status = oldStatus;
    notifyTaskListeners();
    render();
    const toast = document.getElementById('toastStack');
    if (toast) {
      const el = document.createElement('div');
      el.className = 'alert alert-error text-xs shadow-none border border-rose-200 py-2.5 px-3.5 rounded-2xl';
      el.innerHTML = `<span>Gagal sinkronisasi: ${esc(err.message || 'Koneksi bermasalah')}</span>`;
      toast.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }
};

App.editTask = (id) => {
  const taskObj = tasksCache.find(item => item.id === id);
  window.openTaskForm(taskObj);
};

// Configuration for M3 Selection Sheets
const TAG_OPTIONS = [
  { id: 'Umum', label: 'Umum', desc: 'Tugas harian & umum', icon: ICON.tasks },
  { id: 'Kelompok', label: 'Kelompok', desc: 'Kolaborasi tim & kelompok kerja', icon: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id: 'Presentasi', label: 'Presentasi', desc: 'Slide & materi tayang presentasi', icon: ICON.award },
  { id: 'Makalah', label: 'Makalah', desc: 'Paper, esai & laporan tertulis', icon: ICON.book },
  { id: 'Proyek', label: 'Proyek', desc: 'Karya besar & tugas akhir semester', icon: ICON.grid },
  { id: 'Kuis', label: 'Kuis', desc: 'Ujian kecil & kuis mingguan', icon: ICON.timer }
];

const PRIORITY_OPTIONS = [
  { 
    id: 'Rendah', 
    label: 'Rendah', 
    desc: 'Tugas santai tanpa urgensi mendesak', 
    badgeCls: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
  },
  { 
    id: 'Sedang', 
    label: 'Sedang', 
    desc: 'Prioritas standar perkuliahan berkala', 
    badgeCls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60' 
  },
  { 
    id: 'Tinggi', 
    label: 'Tinggi', 
    desc: 'Mendesak atau memiliki bobot nilai besar', 
    badgeCls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60' 
  }
];

const STATUS_OPTIONS = [
  { 
    id: 'Belum dikerjakan', 
    label: 'Belum dikerjakan', 
    desc: 'Tugas belum dimulai sama sekali', 
    badgeCls: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
  },
  { 
    id: 'Sedang dikerjakan', 
    label: 'Sedang dikerjakan', 
    desc: 'Sedang aktif diproses atau dikerjakan', 
    badgeCls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60' 
  },
  { 
    id: 'Selesai', 
    label: 'Selesai', 
    desc: 'Telah rampung sepenuhnya', 
    badgeCls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' 
  }
];

function formatDeadlineDisplay(dateStr) {
  if (!dateStr) return '<span class="text-base-content/50 font-normal">Pilih tenggat waktu...</span>';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = d.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const formatted = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    
    if (diffDays === 0) return `<span class="text-rose-600 dark:text-rose-400 font-bold">Hari Ini</span> • ${formatted}`;
    if (diffDays === 1) return `<span class="text-amber-700 dark:text-amber-300 font-bold">Besok</span> • ${formatted}`;
    if (diffDays === -1) return `<span class="text-rose-700 dark:text-rose-400 font-bold">Terlewat</span> • ${formatted}`;
    if (diffDays < -1) return `<span class="text-rose-700 dark:text-rose-400 font-bold">Terlewat ${Math.abs(diffDays)} hari</span> • ${formatted}`;
    if (diffDays > 1 && diffDays <= 3) return `<span class="text-amber-700 dark:text-amber-300 font-bold">${diffDays} hari lagi</span> • ${formatted}`;
    return `<span class="text-base-content font-semibold">${formatted}</span>`;
  } catch (e) {
    return dateStr;
  }
}

window.openTaskForm = function(taskObj = null) {
  // Pastikan data mata kuliah dari shared cache terisi mutakhir
  const shared = getCachedCourses();
  if (shared && shared.length > 0) {
    coursesCache = shared;
  }

  const t = taskObj || { 
    title: '', 
    course_id: '', 
    deadline: '', 
    priority: 'Sedang', 
    status: 'Belum dikerjakan', 
    tag: 'Umum' 
  };

  const initialCourseId = t.course_id || '';
  const initialTag = t.tag || 'Umum';
  const initialPriority = t.priority || 'Sedang';
  const initialStatus = t.status || 'Belum dikerjakan';
  const initialDeadline = t.deadline ? t.deadline.split('T')[0] : '';

  // Sort courses alphabetically for easy selection
  const sortedCourses = [...coursesCache].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  openSheet(taskObj ? 'Edit Tugas' : 'Tambah Tugas', `
    <div id="task_form_container" class="relative">
      <!-- VIEW 1: Formulir Utama Tugas -->
      <div id="task_form_main" class="flex flex-col gap-3.5 text-xs">
        <!-- Notifikasi Validasi / Error Inline -->
        <div id="task_alert" class="hidden bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
          <svg class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span id="task_alert_msg">Judul Tugas wajib diisi!</span>
        </div>

        <!-- 1. Judul Tugas -->
        <div>
          <label for="f_t_title" class="block font-semibold text-xs text-base-content dark:text-slate-100 mb-1">Judul Tugas</label>
          <input 
            id="f_t_title" 
            class="input input-bordered w-full rounded-xl text-xs h-12 bg-base-100 border-base-300 text-base-content focus:border-brand focus:outline-none" 
            value="${esc(t.title || '')}" 
            placeholder="Contoh: Membuat Makalah Analisis Algoritma" 
          />
        </div>

        <!-- 2. Mata Kuliah (M3 Selection Trigger Card) -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block font-semibold text-xs text-base-content dark:text-slate-100">Mata Kuliah</label>
            <span class="text-xs font-medium text-base-content dark:text-slate-100">Opsional</span>
          </div>
          <input type="hidden" id="f_t_course" value="${esc(initialCourseId)}" />
          <button type="button" id="trigger_f_t_course" class="w-full h-12 min-h-[48px] px-3.5 bg-base-100 border border-base-300 rounded-xl flex items-center justify-between text-left hover:border-brand/40 focus:border-brand transition-all cursor-pointer">
            <div class="flex items-center gap-2.5 truncate">
              <span id="course_display_icon" class="text-brand dark:text-indigo-400 shrink-0">${ICON.book}</span>
              <span id="course_display_text" class="font-semibold text-xs text-base-content truncate"></span>
            </div>
            <span class="text-base-content/40 shrink-0">${ICON.chevR}</span>
          </button>
        </div>
        
        <!-- 3. Tenggat Waktu (M3 Visual Presentation) -->
        <div>
          <label class="block font-semibold text-xs text-base-content dark:text-slate-100 mb-1">Tenggat Waktu</label>
          <input type="hidden" id="f_t_deadline" value="${initialDeadline}" />
          <button type="button" id="trigger_f_t_deadline" class="w-full h-12 min-h-[48px] px-3.5 bg-base-100 dark:bg-slate-900/60 border border-base-300 dark:border-slate-800 rounded-xl flex items-center justify-between text-left hover:border-brand/40 focus:border-brand transition-all cursor-pointer">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="text-brand dark:text-indigo-400 shrink-0">${ICON.calendar}</span>
              <div id="deadline_display_text" class="text-xs font-semibold text-base-content dark:text-slate-100 flex-1 truncate">
                ${formatDeadlineDisplay(initialDeadline)}
              </div>
            </div>
            <span class="text-base-content/40 dark:text-slate-500 shrink-0 ml-2">${ICON.chevR}</span>
          </button>
          <!-- Quick Date Shortcut Chips -->
          <div class="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
            <button type="button" class="btn-quick-date h-8 px-3 rounded-full text-xs font-medium border border-base-300 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 active:scale-95 transition-all text-base-content/80 dark:text-slate-300 hover:text-base-content whitespace-nowrap cursor-pointer" data-days="0">Hari Ini</button>
            <button type="button" class="btn-quick-date h-8 px-3 rounded-full text-xs font-medium border border-base-300 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 active:scale-95 transition-all text-base-content/80 dark:text-slate-300 hover:text-base-content whitespace-nowrap cursor-pointer" data-days="1">Besok</button>
            <button type="button" class="btn-quick-date h-8 px-3 rounded-full text-xs font-medium border border-base-300 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 active:scale-95 transition-all text-base-content/80 dark:text-slate-300 hover:text-base-content whitespace-nowrap cursor-pointer" data-days="7">+7 Hari</button>
            <button type="button" class="btn-quick-date h-8 px-3 rounded-full text-xs font-medium border border-base-300 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 active:scale-95 transition-all text-rose-500 hover:text-rose-600 whitespace-nowrap cursor-pointer" data-clear="true">Kosongkan</button>
          </div>
        </div>

        <!-- 4. Kategori & Prioritas (M3 Selection Trigger Cards) -->
        <div class="grid grid-cols-2 gap-2.5">
          <!-- Trigger Kategori / Tag -->
          <div>
            <label class="block font-semibold text-xs text-base-content dark:text-slate-100 mb-1">Kategori / Tag</label>
            <input type="hidden" id="f_t_tag" value="${esc(initialTag)}" />
            <button type="button" id="trigger_f_t_tag" class="w-full h-12 min-h-[48px] px-3 bg-base-100 border border-base-300 rounded-xl flex items-center justify-between text-left hover:border-brand/40 focus:border-brand transition-all cursor-pointer">
              <div class="flex items-center gap-1.5 truncate">
                <span id="tag_display_icon" class="text-brand dark:text-indigo-400 shrink-0"></span>
                <span id="tag_display_text" class="font-semibold text-xs text-base-content truncate">${esc(initialTag)}</span>
              </div>
              <span class="text-base-content/40 shrink-0">${ICON.chevR}</span>
            </button>
          </div>

          <!-- Trigger Prioritas -->
          <div>
            <label class="block font-semibold text-xs text-base-content dark:text-slate-100 mb-1">Prioritas</label>
            <input type="hidden" id="f_t_priority" value="${esc(initialPriority)}" />
            <button type="button" id="trigger_f_t_priority" class="w-full h-12 min-h-[48px] px-3 bg-base-100 border border-base-300 rounded-xl flex items-center justify-between text-left hover:border-brand/40 focus:border-brand transition-all cursor-pointer">
              <div class="flex items-center gap-1.5 truncate">
                <span id="priority_display_badge" class="px-2.5 py-0.5 rounded-full text-xs font-semibold border truncate"></span>
              </div>
              <span class="text-base-content/40 shrink-0">${ICON.chevR}</span>
            </button>
          </div>
        </div>

        <!-- 5. Status Pengerjaan (M3 Selection Trigger Card) -->
        <div>
          <label class="block font-semibold text-xs text-base-content dark:text-slate-100 mb-1">Status Pengerjaan</label>
          <input type="hidden" id="f_t_status" value="${esc(initialStatus)}" />
          <button type="button" id="trigger_f_t_status" class="w-full h-12 min-h-[48px] px-3 bg-base-100 border border-base-300 rounded-xl flex items-center justify-between text-left hover:border-brand/40 focus:border-brand transition-all cursor-pointer">
            <div class="flex items-center gap-2 truncate">
              <span id="status_display_badge" class="px-2.5 py-0.5 rounded-full text-xs font-semibold border truncate"></span>
            </div>
            <span class="text-base-content/40 shrink-0">${ICON.chevR}</span>
          </button>
        </div>

        <!-- Bottom Action Buttons (48dp Touch Targets) -->
        <div class="flex gap-2.5 mt-2 pt-3 border-t border-base-200">
          ${taskObj ? `
            <button type="button" class="btn btn-outline btn-error btn-sm h-12 min-h-[48px] flex-1 gap-1.5 rounded-full font-semibold" id="btnDelTask">
              ${ICON.trash} Hapus
            </button>
          ` : ''}
          <button type="button" class="btn btn-primary btn-sm h-12 min-h-[48px] flex-1 rounded-full font-semibold" id="btnSaveTask">
            Simpan Tugas
          </button>
        </div>
      </div>

      <!-- VIEW 2: Sub-Sheet View (Selection & Confirmation) -->
      <div id="task_sub_sheet" class="hidden flex flex-col gap-3 min-h-[340px]">
        <!-- Dynamic content injected by openSelectionSheet / openDeleteConfirmation -->
      </div>
    </div>
  `);

  // Ensure sheet title text and style are theme-aware
  const sheetTitleEl = document.getElementById('sheetTitle');
  if (sheetTitleEl) {
    sheetTitleEl.style.color = '';
    sheetTitleEl.className = 'font-display font-bold text-base mb-4 text-base-content';
  }

  // Helper sync UI fungsi internal
  function updateCourseTriggerUI(val) {
    const textEl = document.getElementById('course_display_text');
    const iconEl = document.getElementById('course_display_icon');
    if (!val) {
      if (textEl) textEl.innerHTML = '<span class="text-base-content/50 font-normal">Pilih Mata Kuliah (Opsional)...</span>';
      if (iconEl) iconEl.className = 'text-base-content/40 shrink-0';
    } else {
      const found = coursesCache.find(c => String(c.id) === String(val));
      if (textEl) textEl.textContent = found ? found.name : 'Mata Kuliah Dihapus';
      if (iconEl) iconEl.className = 'text-brand dark:text-indigo-400 shrink-0';
    }
  }

  function updateTagTriggerUI(val) {
    const item = TAG_OPTIONS.find(o => o.id === val) || TAG_OPTIONS[0];
    const tagIconEl = document.getElementById('tag_display_icon');
    const tagTextEl = document.getElementById('tag_display_text');
    if (tagIconEl) {
      tagIconEl.innerHTML = item.icon;
      tagIconEl.className = 'text-brand dark:text-indigo-400 shrink-0';
    }
    if (tagTextEl) tagTextEl.textContent = item.label;
  }

  function updatePriorityTriggerUI(val) {
    const item = PRIORITY_OPTIONS.find(o => o.id === val) || PRIORITY_OPTIONS[1];
    const badgeEl = document.getElementById('priority_display_badge');
    if (badgeEl) {
      badgeEl.className = `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.badgeCls}`;
      badgeEl.textContent = item.label;
    }
  }

  function updateStatusTriggerUI(val) {
    const item = STATUS_OPTIONS.find(o => o.id === val) || STATUS_OPTIONS[0];
    const badgeEl = document.getElementById('status_display_badge');
    if (badgeEl) {
      badgeEl.className = `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.badgeCls}`;
      badgeEl.textContent = item.label;
    }
  }

  function updateDeadlineUI(val) {
    const textEl = document.getElementById('deadline_display_text');
    if (textEl) {
      textEl.innerHTML = formatDeadlineDisplay(val);
    }
    const inputEl = document.getElementById('f_t_deadline');
    if (inputEl && inputEl.value !== (val || '')) {
      inputEl.value = val || '';
    }
  }

  // Inisialisasi tampilan trigger pada formulir utama
  updateCourseTriggerUI(initialCourseId);
  updateTagTriggerUI(initialTag);
  updatePriorityTriggerUI(initialPriority);
  updateStatusTriggerUI(initialStatus);

  // Fungsi Transisi Sub-Sheet
  function closeSubSheet() {
    const mainView = document.getElementById('task_form_main');
    const subView = document.getElementById('task_sub_sheet');
    const sheetTitle = document.getElementById('sheetTitle');

    if (subView) subView.classList.add('hidden');
    if (mainView) mainView.classList.remove('hidden');
    if (sheetTitle) {
      sheetTitle.style.color = '';
      sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
      sheetTitle.className = 'font-display font-bold text-base mb-4 text-base-content';
    }
  }

  // Pasang listener pada trigger Course Picker M3
  const courseTrigger = document.getElementById('trigger_f_t_course');
  if (courseTrigger) {
    courseTrigger.onclick = () => {
      openCoursePicker({
        containerId: 'task_sub_sheet',
        mainViewId: 'task_form_main',
        currentVal: document.getElementById('f_t_course').value,
        allowEmpty: true,
        emptyLabel: 'Tidak ada mata kuliah',
        onSelect: (newVal) => {
          document.getElementById('f_t_course').value = newVal;
          updateCourseTriggerUI(newVal);
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        }
      });
    };
  }

  // Pasang listener pada trigger Date Picker M3 (Tenggat Waktu)
  const deadlineTrigger = document.getElementById('trigger_f_t_deadline');
  if (deadlineTrigger) {
    deadlineTrigger.onclick = () => {
      openDatePicker({
        containerId: 'task_sub_sheet',
        mainViewId: 'task_form_main',
        currentVal: document.getElementById('f_t_deadline').value,
        allowClear: true,
        onSelect: (newVal) => {
          updateDeadlineUI(newVal);
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        }
      });
    };
  }

  // Pasang listener pada trigger Tag / Kategori
  const tagTrigger = document.getElementById('trigger_f_t_tag');
  if (tagTrigger) {
    tagTrigger.onclick = () => {
      openSelectionSubSheet({
        containerId: 'task_sub_sheet',
        mainViewId: 'task_form_main',
        title: 'Pilih Kategori Tugas',
        subtitle: 'Pilih kategori yang paling sesuai untuk tugas ini',
        currentVal: document.getElementById('f_t_tag').value,
        options: TAG_OPTIONS.map(o => ({ id: o.id, label: o.label, desc: o.desc, icon: o.icon })),
        onSelect: (newVal) => {
          document.getElementById('f_t_tag').value = newVal;
          updateTagTriggerUI(newVal);
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        }
      });
    };
  }

  // Pasang listener pada trigger Prioritas
  const priorityTrigger = document.getElementById('trigger_f_t_priority');
  if (priorityTrigger) {
    priorityTrigger.onclick = () => {
      openSelectionSubSheet({
        containerId: 'task_sub_sheet',
        mainViewId: 'task_form_main',
        title: 'Tingkat Prioritas',
        subtitle: 'Tentukan urgensi untuk penjadwalan belajar Anda',
        currentVal: document.getElementById('f_t_priority').value,
        options: PRIORITY_OPTIONS.map(o => ({ id: o.id, label: o.label, desc: o.desc, icon: ICON.award })),
        onSelect: (newVal) => {
          document.getElementById('f_t_priority').value = newVal;
          updatePriorityTriggerUI(newVal);
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        }
      });
    };
  }

  // Pasang listener pada trigger Status
  const statusTrigger = document.getElementById('trigger_f_t_status');
  if (statusTrigger) {
    statusTrigger.onclick = () => {
      openSelectionSubSheet({
        containerId: 'task_sub_sheet',
        mainViewId: 'task_form_main',
        title: 'Status Pengerjaan',
        subtitle: 'Perbarui tahapan progres penyelesaian tugas',
        currentVal: document.getElementById('f_t_status').value,
        options: STATUS_OPTIONS.map(o => ({ id: o.id, label: o.label, desc: o.desc, icon: ICON.tasks })),
        onSelect: (newVal) => {
          document.getElementById('f_t_status').value = newVal;
          updateStatusTriggerUI(newVal);
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = taskObj ? 'Edit Tugas' : 'Tambah Tugas';
        }
      });
    };
  }

  // Pasang listener pada chip shortcut tanggal
  document.querySelectorAll('.btn-quick-date').forEach(chip => {
    chip.onclick = () => {
      if (chip.getAttribute('data-clear') === 'true') {
        updateDeadlineUI('');
        return;
      }
      const days = parseInt(chip.getAttribute('data-days'), 10);
      const target = new Date();
      target.setDate(target.getDate() + days);
      const yyyy = target.getFullYear();
      const mm = String(target.getMonth() + 1).padStart(2, '0');
      const dd = String(target.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      updateDeadlineUI(dateStr);
    };
  });

  // Pasang listener pada perubahan native date input
  const dateInput = document.getElementById('f_t_deadline');
  if (dateInput) {
    dateInput.oninput = (e) => updateDeadlineUI(e.target.value);
    dateInput.onchange = (e) => updateDeadlineUI(e.target.value);
  }

  // Pasang listener Hapus Tugas dengan Reusable M3 Delete Confirmation
  const delBtn = document.getElementById('btnDelTask');
  if (delBtn && taskObj && taskObj.id) {
    delBtn.onclick = () => {
      openDeleteConfirmation({
        containerId: 'task_sub_sheet',
        mainViewId: 'task_form_main',
        title: 'Hapus Tugas Ini?',
        entityName: 'Tugas',
        entityDetailsHtml: `
          <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">Judul Tugas</div>
          <div class="font-display font-bold text-sm text-base-content dark:text-slate-100 break-words">${esc(taskObj.title)}</div>
        `,
        warningText: 'Tindakan ini permanen. Tugas akan dihapus secara permanen dari basis data dan kalender akademik Anda.',
        onCancel: () => {
          if (sheetTitle) sheetTitle.textContent = 'Edit Tugas';
        },
        onConfirm: async () => {
          const { error } = await supabase.from('tasks').delete().eq('id', taskObj.id);
          if (error) throw error;
          ReminderSys.cancelTaskReminder(taskObj.id).catch(() => {});
          tasksCache = tasksCache.filter(t => t.id !== taskObj.id);
          notifyTaskListeners();
          closeSheet();
          fetchTasksData(true);
        }
      });
    };
  }

  // Pasang listener Simpan Tugas
  document.getElementById('btnSaveTask').onclick = async () => {
    const title = document.getElementById('f_t_title').value.trim();
    const alertBox = document.getElementById('task_alert');
    const alertMsg = document.getElementById('task_alert_msg');
    
    if (!title) {
      if (alertMsg) alertMsg.textContent = 'Judul Tugas wajib diisi!';
      if (alertBox) alertBox.classList.remove('hidden');
      setTimeout(() => { if (alertBox) alertBox.classList.add('hidden'); }, 3000);
      return;
    }

    const rawCourseId = document.getElementById('f_t_course').value;
    const course_id = (rawCourseId && rawCourseId.trim() !== "") ? rawCourseId : null;

    const payload = {
      title,
      course_id: course_id,
      deadline: document.getElementById('f_t_deadline').value || null,
      priority: document.getElementById('f_t_priority').value,
      tag: document.getElementById('f_t_tag').value,
      status: document.getElementById('f_t_status').value
    };

    const saveBtn = document.getElementById('btnSaveTask');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Menyimpan...';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) payload.user_id = user.id;

      let error = null;
      let savedTask = null;
      if (taskObj && taskObj.id) {
        const res = await supabase.from('tasks').update(payload).eq('id', taskObj.id).select();
        error = res.error;
        savedTask = res.data && res.data[0] ? res.data[0] : { id: taskObj.id, ...payload };
        if (!error && savedTask) {
          const idx = tasksCache.findIndex(t => t.id === taskObj.id);
          if (idx !== -1) tasksCache[idx] = savedTask;
          notifyTaskListeners();
        }
      } else {
        const res = await supabase.from('tasks').insert([payload]).select();
        error = res.error;
        if (res.data && res.data[0]) {
          savedTask = res.data[0];
          tasksCache.unshift(savedTask);
          notifyTaskListeners();
        }
      }

      if (error) throw error;

      if (savedTask) {
        ReminderSys.scheduleTaskReminder(savedTask).catch(() => {});
      }

      closeSheet();
      fetchTasksData(true);
    } catch (err) {
      console.error('Gagal menyimpan tugas:', err);
      if (alertMsg) alertMsg.textContent = 'Gagal menyimpan tugas: ' + (err.message || 'Koneksi bermasalah');
      if (alertBox) alertBox.classList.remove('hidden');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Simpan Tugas';
    }
  };
};

App.openTaskForm = () => window.openTaskForm(null);
