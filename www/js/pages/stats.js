/**
 * pages/stats.js
 * Halaman Statistik Akademik (Supabase Edition).
 * Standard: CampusMate M3 / Android-first / The Focused Scholar.
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc, courseName } from '../utils/format.js';
import { render } from '../core/render.js';

let statsData = {
  tasks: [],
  courses: [],
  schedules: [],
  isFetching: false,
  loaded: false,
  error: null
};

// Flag internal untuk membedakan re-render dari selesainya fetch vs navigasi baru oleh user
let isInternalRender = false;

async function fetchStatsData() {
  if (statsData.isFetching) return;
  statsData.isFetching = true;
  statsData.error = null;

  try {
    const [taskRes, crsRes, schRes] = await Promise.all([
      supabase.from('tasks').select('id, course_id, status, priority'),
      supabase.from('courses').select('id, name'),
      supabase.from('schedules').select('id')
    ]);

    if (taskRes.error) throw taskRes.error;
    if (crsRes.error) throw crsRes.error;
    if (schRes.error) throw schRes.error;

    statsData.tasks = taskRes.data || [];
    statsData.courses = crsRes.data || [];
    statsData.schedules = schRes.data || [];
    statsData.loaded = true;
  } catch (err) {
    console.error('Error fetching stats data:', err);
    statsData.error = err.message || 'Gagal memuat statistik';
  } finally {
    statsData.isFetching = false;
    isInternalRender = true;
    render();
  }
}

fetchStatsData();

App.fetchStatsData = () => {
  statsData.error = null;
  fetchStatsData();
};

// Helper status beban dan ringkasan statistik untuk konsumsi Top App Bar
export function hasStatsLoaded() {
  return statsData.loaded;
}

export function getStatsSummary() {
  const tasks = statsData.tasks || [];
  const courses = statsData.courses || [];
  const schedules = statsData.schedules || [];
  const hasAnyData = courses.length > 0 || tasks.length > 0 || schedules.length > 0;

  return {
    hasLoaded: statsData.loaded,
    isFetching: statsData.isFetching,
    hasAnyData,
    tasksCount: tasks.length,
    coursesCount: courses.length,
    schedulesCount: schedules.length
  };
}

export function pageStats() {
  // Selalu pastikan mengambil data terbaru saat pengguna mengunjungi/navigasi ke halaman Statistik
  if (isInternalRender) {
    isInternalRender = false;
  } else if (!statsData.isFetching) {
    fetchStatsData();
  }

  // P0.1: Loading State (Material 3 Skeleton Shimmer)
  if (statsData.isFetching && !statsData.loaded) {
    return `
      <div class="space-y-4 animate-pulse">
        <!-- Section Heading skeleton -->
        <div class="pt-1">
          <div class="h-4 w-32 bg-base-200 dark:bg-slate-800 rounded"></div>
        </div>

        <!-- Progress skeleton -->
        <div class="p-5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div class="flex justify-between items-center">
            <div class="space-y-1.5">
              <div class="h-3 w-28 bg-base-200 dark:bg-slate-800 rounded"></div>
              <div class="h-7 w-20 bg-base-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
            <div class="h-6 w-24 bg-base-200 dark:bg-slate-800 rounded-full"></div>
          </div>
          <div class="h-3 w-full bg-base-200 dark:bg-slate-800 rounded-full"></div>
          <div class="flex justify-between">
            <div class="h-3 w-28 bg-base-200 dark:bg-slate-800 rounded"></div>
            <div class="h-3 w-24 bg-base-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>

        <!-- Quick stats grid skeleton (3 cols) -->
        <div class="grid grid-cols-3 gap-2.5">
          ${[1, 2, 3].map(() => `
            <div class="p-3.5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div class="w-8 h-8 rounded-xl bg-base-200 dark:bg-slate-800"></div>
              <div class="h-6 w-10 bg-base-200 dark:bg-slate-800 rounded"></div>
              <div class="h-3 w-16 bg-base-200 dark:bg-slate-800 rounded"></div>
            </div>
          `).join('')}
        </div>

        <!-- Priority skeleton (3 cols) -->
        <div class="p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div class="h-3.5 w-48 bg-base-200 dark:bg-slate-800 rounded"></div>
          <div class="grid grid-cols-3 gap-2.5">
            ${[1, 2, 3].map(() => `
              <div class="p-3 rounded-xl bg-base-200/50 dark:bg-slate-800/50 space-y-1.5 text-center">
                <div class="h-6 w-8 mx-auto bg-base-200 dark:bg-slate-800 rounded"></div>
                <div class="h-3 w-12 mx-auto bg-base-200 dark:bg-slate-800 rounded"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tasks per course skeleton -->
        <div class="p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div class="h-3.5 w-44 bg-base-200 dark:bg-slate-800 rounded"></div>
          <div class="space-y-2 pt-1">
            ${[1, 2, 3].map(() => `
              <div class="h-10 w-full bg-base-200/50 dark:bg-slate-800/50 rounded-xl"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // P0.2: Error State dengan Tombol Coba Lagi (>= 48dp)
  if (statsData.error && !statsData.loaded) {
    return `
      <div class="p-8 text-center bg-base-100 dark:bg-slate-900/60 border border-rose-200 dark:border-rose-900/60 rounded-3xl space-y-3 my-4">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/70 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="space-y-1">
          <h3 class="font-display font-bold text-sm text-base-content dark:text-slate-100">
            Gagal Memuat Statistik
          </h3>
          <p class="text-xs text-base-content/70 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            ${esc(statsData.error || 'Terjadi gangguan saat mengambil data dari server.')}
          </p>
        </div>
        <div class="pt-2">
          <button 
            type="button" 
            onclick="App.fetchStatsData()" 
            class="btn btn-primary h-12 min-h-[48px] px-6 rounded-xl font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-none text-white transition-all active:scale-[0.99]"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.23-5.19"/></svg>
            <span>Coba Lagi</span>
          </button>
        </div>
      </div>
    `;
  }

  const tasks = statsData.tasks || [];
  const courses = statsData.courses || [];
  const schedules = statsData.schedules || [];

  // Helper pemeriksa status tugas (identik dengan source of truth tasks.js: 'Selesai')
  const isTaskCompleted = (t) => Boolean(t && (t.status === 'Selesai' || String(t.status || '').trim().toLowerCase() === 'selesai'));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(isTaskCompleted).length;
  const activeTasksCount = tasks.filter(t => !isTaskCompleted(t)).length;

  // Rumus persentase progress dinamis:
  // progressPercentage = (completedTasks / totalTasks) * 100
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Analisis Prioritas Tugas Aktif
  const highPriority = tasks.filter(t => t.priority === 'Tinggi' && !isTaskCompleted(t)).length;
  const mediumPriority = tasks.filter(t => t.priority === 'Sedang' && !isTaskCompleted(t)).length;
  const lowPriority = tasks.filter(t => t.priority === 'Rendah' && !isTaskCompleted(t)).length;

  // Kelompokkan tugas aktif berdasarkan Mata Kuliah
  const tasksPerCourse = {};
  tasks.forEach(t => {
    if (!isTaskCompleted(t) && t.course_id) {
      tasksPerCourse[t.course_id] = (tasksPerCourse[t.course_id] || 0) + 1;
    }
  });

  const hasAnyData = courses.length > 0 || totalTasks > 0 || schedules.length > 0;
  const hasTasksPerCourse = Object.keys(tasksPerCourse).length > 0;

  return `
    <div class="space-y-4">

      <!-- Section Heading: Progres Akademik (Header tunggal tetap di topbar) -->
      <div class="pt-1">
        <h3 class="font-display font-bold text-sm text-base-content dark:text-slate-200">
          Progres Akademik
        </h3>
      </div>

      <!-- P1.1: Kartu Progres Penyelesaian Tugas (M3 Tonal Surface Layering) -->
      <div class="p-5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-3xl transition-all">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-xs font-semibold text-brand dark:text-indigo-400 uppercase tracking-wider">
              Penyelesaian Tugas
            </span>
            <div class="font-display font-extrabold text-2xl text-base-content dark:text-slate-100 mt-0.5">
              ${progressPercentage}%
            </div>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand dark:bg-indigo-950/70 dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60">
              <span class="shrink-0 flex items-center justify-center">${ICON.check}</span>
              <span>${completedTasks} / ${totalTasks} Selesai</span>
            </span>
          </div>
        </div>

        <!-- M3 Linear Progress Bar dengan Tonal Track -->
        <div class="w-full bg-base-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-base-300/40 dark:border-slate-700/40">
          <div 
            class="bg-brand dark:bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out" 
            style="width: ${progressPercentage}%;"
            role="progressbar" 
            aria-valuenow="${progressPercentage}" 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>

        <div class="flex items-center justify-between mt-2.5 text-xs text-base-content/60 dark:text-slate-400">
          <span>${activeTasksCount} tugas aktif tersisa</span>
          <span>${totalTasks === 0 ? 'Belum ada tugas terdaftar' : (progressPercentage === 100 ? 'Semua tugas tuntas!' : `${100 - progressPercentage}% belum selesai`)}</span>
        </div>
      </div>

      <!-- P1.2: Grid Statistik Cepat (Actionable Portals, >= 48dp) -->
      <div class="grid grid-cols-3 gap-2.5">
        <!-- Mata Kuliah -> Courses -->
        <div 
          onclick="App.navigate('courses')" 
          class="group p-3.5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 hover:border-brand/40 dark:hover:border-indigo-500/40 rounded-2xl transition-all duration-150 active:scale-[0.98] cursor-pointer min-h-[56px] flex flex-col justify-between"
          role="button"
          tabindex="0"
          aria-label="Buka Halaman Mata Kuliah"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="w-8 h-8 rounded-xl bg-brand/10 text-brand dark:bg-indigo-950/70 dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
              ${ICON.book}
            </div>
            <span class="text-base-content/30 group-hover:text-brand dark:group-hover:text-indigo-300 transition-colors">${ICON.chevR}</span>
          </div>
          <div>
            <div class="font-display font-bold text-lg text-base-content dark:text-slate-100">
              ${courses.length}
            </div>
            <div class="text-xs text-base-content/60 dark:text-slate-400 font-medium truncate">
              Mata Kuliah
            </div>
          </div>
        </div>

        <!-- Jadwal Kuliah -> Schedule -->
        <div 
          onclick="App.navigate('schedule')" 
          class="group p-3.5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 hover:border-brand/40 dark:hover:border-indigo-500/40 rounded-2xl transition-all duration-150 active:scale-[0.98] cursor-pointer min-h-[56px] flex flex-col justify-between"
          role="button"
          tabindex="0"
          aria-label="Buka Halaman Jadwal Kuliah"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-500/20 dark:border-amber-800/60 flex items-center justify-center shrink-0">
              ${ICON.calendar}
            </div>
            <span class="text-base-content/30 group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors">${ICON.chevR}</span>
          </div>
          <div>
            <div class="font-display font-bold text-lg text-base-content dark:text-slate-100">
              ${schedules.length}
            </div>
            <div class="text-xs text-base-content/60 dark:text-slate-400 font-medium truncate">
              Jadwal Kelas
            </div>
          </div>
        </div>

        <!-- Tugas Aktif -> Tasks -->
        <div 
          onclick="App.navigate('tasks')" 
          class="group p-3.5 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 hover:border-brand/40 dark:hover:border-indigo-500/40 rounded-2xl transition-all duration-150 active:scale-[0.98] cursor-pointer min-h-[56px] flex flex-col justify-between"
          role="button"
          tabindex="0"
          aria-label="Buka Halaman Tugas"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-800/60 flex items-center justify-center shrink-0">
              ${ICON.tasks}
            </div>
            <span class="text-base-content/30 group-hover:text-brand dark:group-hover:text-indigo-300 transition-colors">${ICON.chevR}</span>
          </div>
          <div>
            <div class="font-display font-bold text-lg text-base-content dark:text-slate-100">
              ${activeTasksCount}
            </div>
            <div class="text-xs text-base-content/60 dark:text-slate-400 font-medium truncate">
              Tugas Aktif
            </div>
          </div>
        </div>
      </div>

      <!-- P1.3: Analisis Beban Tugas Berdasarkan Prioritas (Restrained & Actionable) -->
      <div class="p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display font-bold text-xs uppercase tracking-wider text-base-content/70 dark:text-slate-300">
            Beban Tugas Aktif (Belum Selesai)
          </h3>
          <button 
            type="button" 
            onclick="App.navigate('tasks')" 
            class="text-xs font-semibold text-brand dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>Buka Tugas</span>
            <span class="shrink-0">${ICON.chevR}</span>
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <!-- Prioritas Tinggi -->
          <div 
            onclick="App.navigate('tasks')" 
            class="p-3 rounded-xl border transition-all active:scale-[0.98] cursor-pointer text-center ${
              highPriority > 0
                ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                : 'bg-base-200/40 dark:bg-slate-800/40 border-base-200 dark:border-slate-800 text-base-content/60 dark:text-slate-400'
            }"
            role="button"
            tabindex="0"
            aria-label="Tugas Prioritas Tinggi: ${highPriority}"
          >
            <div class="font-display font-bold text-lg ${highPriority > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-base-content/70 dark:text-slate-300'}">
              ${highPriority}
            </div>
            <div class="text-xs font-semibold mt-0.5 ${highPriority > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-base-content/60 dark:text-slate-400'}">
              Tinggi
            </div>
          </div>

          <!-- Prioritas Sedang -->
          <div 
            onclick="App.navigate('tasks')" 
            class="p-3 rounded-xl border transition-all active:scale-[0.98] cursor-pointer text-center ${
              mediumPriority > 0
                ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300'
                : 'bg-base-200/40 dark:bg-slate-800/40 border-base-200 dark:border-slate-800 text-base-content/60 dark:text-slate-400'
            }"
            role="button"
            tabindex="0"
            aria-label="Tugas Prioritas Sedang: ${mediumPriority}"
          >
            <div class="font-display font-bold text-lg ${mediumPriority > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-base-content/70 dark:text-slate-300'}">
              ${mediumPriority}
            </div>
            <div class="text-xs font-semibold mt-0.5 ${mediumPriority > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-base-content/60 dark:text-slate-400'}">
              Sedang
            </div>
          </div>

          <!-- Prioritas Rendah -->
          <div 
            onclick="App.navigate('tasks')" 
            class="p-3 rounded-xl border transition-all active:scale-[0.98] cursor-pointer text-center ${
              lowPriority > 0
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-base-200/40 dark:bg-slate-800/40 border-base-200 dark:border-slate-800 text-base-content/60 dark:text-slate-400'
            }"
            role="button"
            tabindex="0"
            aria-label="Tugas Prioritas Rendah: ${lowPriority}"
          >
            <div class="font-display font-bold text-lg ${lowPriority > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-base-content/70 dark:text-slate-300'}">
              ${lowPriority}
            </div>
            <div class="text-xs font-semibold mt-0.5 ${lowPriority > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-base-content/60 dark:text-slate-400'}">
              Rendah
            </div>
          </div>
        </div>
      </div>

      <!-- P1.4: Rincian Tugas per Mata Kuliah (Differentiated Empty States & Visible Dividers) -->
      <div class="p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl">
        <h3 class="font-display font-bold text-xs uppercase tracking-wider text-base-content/70 dark:text-slate-300 mb-3">
          Tugas Aktif per Mata Kuliah
        </h3>

        ${hasTasksPerCourse ? `
          <div class="space-y-1">
            ${Object.entries(tasksPerCourse).map(([courseId, count]) => `
              <div 
                onclick="App.navigate('tasks')" 
                class="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-base-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-base-200 dark:border-slate-800 last:border-0 active:scale-[0.99]"
                role="button"
                tabindex="0"
                aria-label="Lihat tugas ${esc(courseName(courses, courseId))}"
              >
                <div class="flex items-center gap-2.5 min-w-0 pr-2">
                  <span class="w-2 h-2 rounded-full bg-brand dark:bg-indigo-400 shrink-0"></span>
                  <span class="font-medium text-xs text-base-content dark:text-slate-200 truncate">
                    ${esc(courseName(courses, courseId))}
                  </span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand dark:bg-indigo-950/70 dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60">
                    ${count} tugas aktif
                  </span>
                  <span class="text-base-content/40 dark:text-slate-500">${ICON.chevR}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : (
          !hasAnyData ? `
            <!-- Kasus A: Pengguna Baru (Belum ada mata kuliah/tugas) -> Onboarding Empty State -->
            <div class="text-center py-6 px-4 space-y-2">
              <div class="w-12 h-12 mx-auto rounded-2xl bg-base-200/60 dark:bg-slate-800/60 text-base-content/50 dark:text-slate-400 flex items-center justify-center">
                ${ICON.book}
              </div>
              <h4 class="font-display font-bold text-xs text-base-content dark:text-slate-200">
                Belum Ada Data Perkuliahan
              </h4>
              <p class="text-xs text-base-content/60 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Tambahkan mata kuliah dan jadwal kelas terlebih dahulu untuk mulai memantau beban akademik semestermu.
              </p>
              <div class="pt-1">
                <button 
                  type="button" 
                  onclick="App.navigate('courses')" 
                  class="btn btn-primary btn-sm h-10 min-h-[40px] px-4 rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer text-white shadow-none"
                >
                  <span>Tambah Mata Kuliah</span>
                  <span class="shrink-0">${ICON.chevR}</span>
                </button>
              </div>
            </div>
          ` : `
            <!-- Kasus B: Data Ada tapi Tidak Ada Tugas Aktif -> Positive Completion State -->
            <div class="text-center py-6 px-4 space-y-2">
              <div class="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                ${ICON.check}
              </div>
              <h4 class="font-display font-bold text-xs text-base-content dark:text-slate-100">
                Semua Tugas Telah Selesai
              </h4>
              <p class="text-xs text-base-content/60 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Tidak ada beban tugas aktif saat ini. Waktu yang tepat untuk istirahat atau meninjau materi kuliah.
              </p>
            </div>
          `
        )}
      </div>

    </div>
  `;
}
