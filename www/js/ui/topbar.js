/**
 * topbar.js
 * Header di atas tiap halaman (judul, subjudul, action bar).
 * Halaman "home" sengaja tidak punya topbar (lihat pageHome / index.html).
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { esc } from '../utils/format.js';
import { ICON } from '../utils/icons.js';
import { DAYS, todayDayName } from '../utils/date.js';
import { getCachedTasks, hasTasksLoaded } from '../pages/tasks.js';
import { getGradesSummary } from '../pages/grades.js';
import { getCoursesSummary } from '../pages/courses.js';
import { getExamsSummary } from '../pages/exams.js';
import { getNotesSummary } from '../pages/notes.js';
import { getStatsSummary } from '../pages/stats.js';
import { getPomodoroContext } from '../pages/pomodoro.js';

const PAGE_TITLES = {
  home: { title: '', sub: '' },
  tasks: { title: 'Tugas', sub: 'Kelola semua tugas kuliahmu' },
  schedule: { title: 'Jadwal Kuliah', sub: 'Atur jadwal mingguanmu' },
  courses: { title: 'Mata Kuliah', sub: 'Kelola mata kuliahmu' },
  notes: { title: 'Catatan', sub: 'Simpan dan kelola catatan kuliahmu' },
  grades: { title: 'Nilai', sub: 'Pantau perkembangan akademikmu' },
  settings: { title: 'Pengaturan', sub: 'Sesuaikan pengalaman CampusMate' },
  exams: { title: 'Ujian', sub: 'Persiapkan ujianmu dengan lebih teratur' },
  stats: { title: 'Statistik', sub: 'Ringkasan aktivitas akademikmu' },
  pomodoro: { title: 'Pomodoro', sub: 'Fokus belajar tanpa distraksi' }
};

/**
 * Helper tanggal kontekstual untuk jadwal mingguan.
 * Menghitung tanggal yang sesuai dengan hari aktif pada minggu berjalan.
 */
function getActiveDayDate(dayName) {
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;
  const targetIdx = DAYS.indexOf(dayName);
  if (targetIdx === -1) {
    return today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  const diffDays = targetIdx - todayIdx;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diffDays);
  return targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Helper informasi kontekstual untuk halaman Tugas.
 * Menghitung tugas aktif (belum selesai) yang perlu diselesaikan.
 */
function getTasksContext() {
  if (!hasTasksLoaded()) return 'Memuat tugas...';
  const tasks = getCachedTasks();
  const pending = tasks.filter(t => t.status !== 'Selesai');
  if (pending.length === 0) {
    return tasks.length > 0 ? 'Semua tugas telah diselesaikan' : 'Belum ada tugas tercatat';
  }
  if (pending.length === 1) {
    return '1 tugas perlu diselesaikan';
  }
  return `${pending.length} tugas perlu diselesaikan`;
}

/**
 * Prototype Top App Bar V2 khusus Schedule — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Jadwal Kuliah" (prominent, 24-26px, font-display)
 * 2. Konteks dinamis: Hari & Tanggal aktif (14-16px, muted)
 * 3. Relevant Action: Tombol Tambah Jadwal (48dp touch target)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderScheduleTopbar(bar) {
  const activeDay = state.schedDay || todayDayName();
  const dateContext = getActiveDayDate(activeDay);

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Jadwal Kuliah
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(dateContext)}
        </p>
      </div>

      <!-- Existing Action: Tambah Jadwal (Touch Floor 48dp) -->
      <button 
        type="button" 
        onclick="App.openScheduleForm()" 
        aria-label="Tambah Jadwal Kuliah" 
        title="Tambah Jadwal Kuliah"
        class="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center text-base-content/80 dark:text-base-content/85 hover:bg-base-200 dark:hover:bg-base-200/60 active:scale-95 transition-all cursor-pointer shrink-0">
        <span class="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICON.plus}</span>
      </button>
    </div>
  `;
}

/**
 * Prototype Top App Bar khusus Tasks — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Tugas" (prominent, 24px, font-display)
 * 2. Konteks dinamis: Jumlah tugas perlu diselesaikan (14-16px, muted)
 * 3. Relevant Action: Tombol Tambah Tugas (48dp touch target)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderTasksTopbar(bar) {
  const tasksContext = getTasksContext();

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Tugas
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(tasksContext)}
        </p>
      </div>

      <!-- Existing Action: Tambah Tugas (Touch Floor 48dp) -->
      <button 
        type="button" 
        onclick="App.openTaskForm()" 
        aria-label="Tambah Tugas" 
        title="Tambah Tugas"
        class="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center text-base-content/80 dark:text-base-content/85 hover:bg-base-200 dark:hover:bg-base-200/60 active:scale-95 transition-all cursor-pointer shrink-0">
        <span class="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICON.plus}</span>
      </button>
    </div>
  `;
}

/**
 * Helper informasi kontekstual untuk halaman Nilai.
 * Menampilkan IPK berjalan atau status pemantauan akademik berdasarkan data riil.
 */
function getGradesContext() {
  const summary = getGradesSummary();
  if (!summary.hasLoaded) return 'Memuat nilai...';
  if (summary.coursesCount === 0) return 'Belum ada mata kuliah';
  if (!summary.creditsSummary || summary.creditsSummary.gradedCourses === 0 || summary.ipk === '-') {
    return 'Pantau perkembangan akademikmu';
  }
  return `IPK Berjalan · ${summary.ipk}`;
}

/**
 * Prototype Top App Bar khusus Grades — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Nilai" (prominent, 24px, font-display)
 * 2. Konteks dinamis: IPK berjalan atau ringkasan akademik (14-16px, muted)
 * 3. Relevant Action: Tombol Tambah Komponen Nilai (48dp touch target)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderGradesTopbar(bar) {
  const gradesContext = getGradesContext();

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Nilai
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(gradesContext)}
        </p>
      </div>

      <!-- Existing Action: Tambah Nilai (Touch Floor 48dp) -->
      <button 
        type="button" 
        onclick="App.openGradeForm()" 
        aria-label="Tambah Nilai" 
        title="Tambah Nilai"
        class="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center text-base-content/80 dark:text-base-content/85 hover:bg-base-200 dark:hover:bg-base-200/60 active:scale-95 transition-all cursor-pointer shrink-0">
        <span class="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICON.plus}</span>
      </button>
    </div>
  `;
}

/**
 * Helper informasi kontekstual untuk halaman Mata Kuliah.
 * Menghitung jumlah mata kuliah pada semester aktif.
 */
function getCoursesContext() {
  const summary = getCoursesSummary();
  if (!summary.hasLoaded) return 'Memuat mata kuliah...';
  if (summary.count === 0) return 'Kelola mata kuliahmu';
  if (summary.count === 1) return 'Semester aktif · 1 mata kuliah';
  return `Semester aktif · ${summary.count} mata kuliah`;
}

/**
 * Prototype Top App Bar khusus Courses — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Mata Kuliah" (prominent, 24px, font-display)
 * 2. Konteks dinamis: Semester aktif · X mata kuliah (14-16px, muted)
 * 3. Relevant Action: Tombol Tambah Mata Kuliah (48dp touch target)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderCoursesTopbar(bar) {
  const coursesContext = getCoursesContext();

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Mata Kuliah
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(coursesContext)}
        </p>
      </div>

      <!-- Existing Action: Tambah Mata Kuliah (Touch Floor 48dp) -->
      <button 
        type="button" 
        onclick="App.openCourseForm()" 
        aria-label="Tambah Mata Kuliah" 
        title="Tambah Mata Kuliah"
        class="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center text-base-content/80 dark:text-base-content/85 hover:bg-base-200 dark:hover:bg-base-200/60 active:scale-95 transition-all cursor-pointer shrink-0">
        <span class="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICON.plus}</span>
      </button>
    </div>
  `;
}

/**
 * Helper informasi kontekstual untuk halaman Ujian.
 * Menghitung jumlah ujian mendatang yang perlu dipersiapkan mahasiswa.
 */
function getExamsContext() {
  const summary = getExamsSummary();
  if (!summary.hasLoaded) return 'Memuat jadwal ujian...';
  if (summary.upcomingCount === 0) return 'Persiapkan ujianmu dengan lebih teratur';
  if (summary.upcomingCount === 1) return '1 ujian mendatang';
  return `${summary.upcomingCount} ujian mendatang`;
}

/**
 * Prototype Top App Bar khusus Exams — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Ujian" (prominent, 24px, font-display)
 * 2. Konteks dinamis: X ujian mendatang (14-16px, muted)
 * 3. Relevant Action: Tombol Tambah Jadwal Ujian (48dp touch target)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderExamsTopbar(bar) {
  const examsContext = getExamsContext();

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Ujian
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(examsContext)}
        </p>
      </div>

      <!-- Existing Action: Tambah Jadwal Ujian (Touch Floor 48dp) -->
      <button 
        type="button" 
        onclick="App.openExamForm()" 
        aria-label="Tambah Jadwal Ujian" 
        title="Tambah Jadwal Ujian"
        class="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center text-base-content/80 dark:text-base-content/85 hover:bg-base-200 dark:hover:bg-base-200/60 active:scale-95 transition-all cursor-pointer shrink-0">
        <span class="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICON.plus}</span>
      </button>
    </div>
  `;
}

/**
 * Helper informasi kontekstual untuk halaman Catatan.
 * Menghitung jumlah catatan kuliah tersimpan.
 */
function getNotesContext() {
  const summary = getNotesSummary();
  if (!summary.hasLoaded) return 'Memuat catatan...';
  if (summary.count === 0) return 'Simpan dan kelola catatan kuliahmu';
  if (summary.count === 1) return '1 catatan tersimpan';
  return `${summary.count} catatan tersimpan`;
}

/**
 * Prototype Top App Bar khusus Notes — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Catatan" (prominent, 24px, font-display)
 * 2. Konteks dinamis: X catatan tersimpan (14-16px, muted)
 * 3. Relevant Action: Tombol Tambah Catatan (48dp touch target)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderNotesTopbar(bar) {
  const notesContext = getNotesContext();

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Catatan
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(notesContext)}
        </p>
      </div>

      <!-- Existing Action: Tambah Catatan (Touch Floor 48dp) -->
      <button 
        type="button" 
        onclick="App.openNoteForm()" 
        aria-label="Tambah Catatan" 
        title="Tambah Catatan"
        class="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center text-base-content/80 dark:text-base-content/85 hover:bg-base-200 dark:hover:bg-base-200/60 active:scale-95 transition-all cursor-pointer shrink-0">
        <span class="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">${ICON.plus}</span>
      </button>
    </div>
  `;
}

/**
 * Helper informasi kontekstual untuk halaman Statistik.
 * Menyajikan ringkasan status akademik secara elegan dan akurat.
 */
function getStatsContext() {
  const summary = getStatsSummary();
  if (!summary.hasLoaded) return 'Memuat statistik...';
  if (summary.hasAnyData) return 'Ringkasan aktivitas akademikmu';
  return 'Lihat perkembangan akademikmu';
}

/**
 * Prototype Top App Bar khusus Stats — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Statistik" (prominent, 24px, font-display)
 * 2. Konteks dinamis: Ringkasan aktivitas akademikmu (14-16px, muted)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderStatsTopbar(bar) {
  const statsContext = getStatsContext();

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Statistik
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(statsContext)}
        </p>
      </div>
    </div>
  `;
}

/**
 * Prototype Top App Bar khusus Pomodoro — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Pomodoro" (prominent, 24px, font-display)
 * 2. Konteks dinamis: Fokus belajar tanpa distraksi / status sesi timer (14-16px, muted)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderPomodoroTopbar(bar) {
  const pomodoroContext = getPomodoroContext();

  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Pomodoro
        </h1>
        <p id="pomodoroTopbarContext" class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          ${esc(pomodoroContext)}
        </p>
      </div>
    </div>
  `;
}

/**
 * Prototype Top App Bar khusus Settings — Contextual Dashboard Direction
 * Menampilkan:
 * 1. Judul halaman: "Pengaturan" (prominent, 24px, font-display)
 * 2. Konteks: "Sesuaikan pengalaman CampusMate" (14-16px, muted)
 * Menyatu dengan surface halaman tanpa card frame atau border berat.
 */
function renderSettingsTopbar(bar) {
  bar.className = 'topbar sticky top-0 z-20 px-4 pt-4 pb-2 bg-base-100 transition-colors';
  bar.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex flex-col min-w-0">
        <h1 class="font-display font-bold text-2xl tracking-tight text-base-content dark:text-slate-100 leading-tight truncate">
          Pengaturan
        </h1>
        <p class="text-sm sm:text-base font-medium text-base-content/70 dark:text-slate-400 mt-1 leading-normal truncate">
          Sesuaikan pengalaman CampusMate
        </p>
      </div>
    </div>
  `;
}

export function renderTopbar() {
  const bar = document.getElementById('topbar');
  if (!bar) return;

  if (state.route === 'home') {
    bar.innerHTML = '';
    bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');

  // Khusus prototype Schedule Top App Bar
  if (state.route === 'schedule') {
    renderScheduleTopbar(bar);
    return;
  }

  // Khusus prototype Tasks Top App Bar
  if (state.route === 'tasks') {
    renderTasksTopbar(bar);
    return;
  }

  // Khusus prototype Grades Top App Bar
  if (state.route === 'grades') {
    renderGradesTopbar(bar);
    return;
  }

  // Khusus prototype Courses Top App Bar
  if (state.route === 'courses') {
    renderCoursesTopbar(bar);
    return;
  }

  // Khusus prototype Exams Top App Bar
  if (state.route === 'exams') {
    renderExamsTopbar(bar);
    return;
  }

  // Khusus prototype Notes Top App Bar
  if (state.route === 'notes') {
    renderNotesTopbar(bar);
    return;
  }

  // Khusus prototype Stats Top App Bar
  if (state.route === 'stats') {
    renderStatsTopbar(bar);
    return;
  }

  // Khusus prototype Pomodoro Top App Bar
  if (state.route === 'pomodoro') {
    renderPomodoroTopbar(bar);
    return;
  }

  // Khusus prototype Settings Top App Bar
  if (state.route === 'settings') {
    renderSettingsTopbar(bar);
    return;
  }

  // Fallback existing untuk rute lain agar tidak mengubah halaman lain
  bar.className = 'topbar sticky top-0 z-20 p-4 bg-base-100/80 backdrop-blur border-b border-base-200';
  const info = PAGE_TITLES[state.route] || { title: '', sub: '' };

  bar.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div>
          <h1 class="font-bold text-base line-clamp-1 text-base-content dark:text-slate-100">${esc(info.title)}</h1>
          ${info.sub ? `<p class="text-xs text-base-content/75 dark:text-slate-300 font-medium">${esc(info.sub)}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}
