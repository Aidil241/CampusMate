/**
 * ui/picker.js
 * Global CampusMate M3 Overlay & Picker Standard
 * Komponen modal & picker Android Material 3 (The Focused Scholar) yang reusable
 * untuk semua halaman (Courses, Tasks, Schedule, Grades, Exams, Notes, dsb).
 * 
 * Standar:
 * - 100% Material 3 / Material You tokens
 * - Minimum 48dp touch targets
 * - Light & Dark mode support
 * - Tonal surfaces, tanpa arbitrary shadows
 * - Zero raw emojis (hanya SVG ICON)
 * - Zero native browser select / alert / confirm / datetime dialogs
 * - Menjaga presisi data contract (e.g. YYYY-MM-DDTHH:mm)
 */
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { getCachedCourses } from '../data/courses.js';

// Konstanta Nama Bulan & Hari Bahasa Indonesia
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];
const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Standard University Time Slot Presets
export const UNIVERSITY_TIME_PRESETS = [
  '07:30', '08:00', '09:00', '09:40', '10:30', '13:00', '14:00', '15:30', '16:00', '18:30'
];

/**
 * Pemformat tanggal & waktu Indonesia untuk display trigger
 * Input: "YYYY-MM-DDTHH:mm" atau ISO string
 */
export function formatDateTimeDisplay(dtStr) {
  if (!dtStr) return 'Pilih Tanggal & Waktu...';
  const d = new Date(dtStr);
  if (isNaN(d.getTime())) return dtStr;
  const dayName = DAY_NAMES_FULL[d.getDay()];
  const dateNum = d.getDate();
  const monthName = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dayName}, ${dateNum} ${monthName} ${year} · ${hours}:${minutes} WIB`;
}

/**
 * Pemformat tanggal Indonesia untuk display trigger
 * Input: "YYYY-MM-DD"
 */
export function formatDateDisplay(dStr) {
  if (!dStr) return 'Pilih Tanggal...';
  const parts = dStr.split('-');
  if (parts.length !== 3) return dStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(d.getTime())) return dStr;
  const dayName = DAY_NAMES_FULL[d.getDay()];
  const dateNum = d.getDate();
  const monthName = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${dateNum} ${monthName} ${year}`;
}

/**
 * Helper serialize string ke YYYY-MM-DDTHH:mm presisi
 */
export function toDateTimeLocalString(dateObj, timeStr = '08:00') {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T${timeStr}`;
}

/* ==========================================================================
   1. TRIGGER RENDERERS (KOMPONEN PEMICU FORM >= 48DP)
   ========================================================================== */

/**
 * Render Trigger Card untuk Mata Kuliah
 */
export function renderCourseTrigger({
  id = 'trigger_course',
  courseId = '',
  label = 'Mata Kuliah',
  required = false,
  placeholder = 'Pilih Mata Kuliah...'
}) {
  const courses = getCachedCourses();
  const found = courses.find(c => String(c.id) === String(courseId));
  const title = found ? found.name : placeholder;
  const sub = found 
    ? `${found.credits || 0} SKS ${found.lecturer ? '· ' + found.lecturer : ''}`
    : 'Sentuh untuk memilih mata kuliah';

  return `
    <div class="w-full">
      <label class="label pb-1 pt-0">
        <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
          ${esc(label)} ${required ? '<span class="text-rose-500">*</span>' : ''}
        </span>
      </label>
      <input type="hidden" id="${id}_val" value="${esc(courseId || '')}" />
      <button 
        type="button" 
        id="${id}" 
        class="w-full min-h-[52px] px-3.5 py-2.5 rounded-xl border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200/50 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
        aria-haspopup="listbox"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl ${found ? 'bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60' : 'bg-base-200 dark:bg-slate-800 text-base-content/50 dark:text-slate-400'} flex items-center justify-center shrink-0">
            ${ICON.book}
          </div>
          <div class="min-w-0">
            <span id="${id}_title" class="font-semibold text-xs text-base-content dark:text-slate-100 block truncate ${!found ? 'text-base-content/50 dark:text-slate-400 font-normal' : ''}">
              ${esc(title)}
            </span>
            <span id="${id}_sub" class="text-xs text-base-content/60 dark:text-slate-400 block truncate mt-0.5">
              ${esc(sub)}
            </span>
          </div>
        </div>
        <span class="text-base-content/40 dark:text-slate-500 shrink-0 ml-2">${ICON.chevR}</span>
      </button>
      <div id="${id}_error" class="hidden text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">
        ${esc(label)} wajib dipilih
      </div>
    </div>
  `;
}

/**
 * Update UI Trigger Card Mata Kuliah setelah pemilihan
 */
export function updateCourseTriggerUI(id, courseId) {
  const hiddenInput = document.getElementById(`${id}_val`);
  if (hiddenInput) hiddenInput.value = courseId || '';

  const courses = getCachedCourses();
  const found = courses.find(c => String(c.id) === String(courseId));
  const titleEl = document.getElementById(`${id}_title`);
  const subEl = document.getElementById(`${id}_sub`);
  const errorEl = document.getElementById(`${id}_error`);
  const triggerBtn = document.getElementById(id);

  if (titleEl) {
    titleEl.textContent = found ? found.name : 'Pilih Mata Kuliah...';
    titleEl.className = found 
      ? 'font-semibold text-xs text-base-content dark:text-slate-100 block truncate'
      : 'font-normal text-xs text-base-content/50 dark:text-slate-400 block truncate';
  }
  if (subEl) {
    subEl.textContent = found 
      ? `${found.credits || 0} SKS ${found.lecturer ? '· ' + found.lecturer : ''}`
      : 'Sentuh untuk memilih mata kuliah';
  }
  if (errorEl) errorEl.classList.add('hidden');
  if (triggerBtn) triggerBtn.classList.remove('border-rose-500');
}

/**
 * Render Trigger Card untuk Tanggal & Waktu (Date + Time)
 */
export function renderDateTimeTrigger({
  id = 'trigger_datetime',
  value = '', // YYYY-MM-DDTHH:mm
  label = 'Tanggal & Waktu',
  required = false,
  placeholder = 'Pilih Tanggal & Waktu...'
}) {
  const displayStr = value ? formatDateTimeDisplay(value) : placeholder;

  return `
    <div class="w-full">
      <label class="label pb-1 pt-0">
        <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
          ${esc(label)} ${required ? '<span class="text-rose-500">*</span>' : ''}
        </span>
      </label>
      <input type="hidden" id="${id}_val" value="${esc(value || '')}" />
      <button 
        type="button" 
        id="${id}" 
        class="w-full min-h-[52px] px-3.5 py-2.5 rounded-xl border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200/50 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl ${value ? 'bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60' : 'bg-base-200 dark:bg-slate-800 text-base-content/50 dark:text-slate-400'} flex items-center justify-center shrink-0">
            ${ICON.calendar}
          </div>
          <div class="min-w-0">
            <span id="${id}_text" class="font-semibold text-xs text-base-content dark:text-slate-100 block truncate ${!value ? 'text-base-content/50 dark:text-slate-400 font-normal' : ''}">
              ${esc(displayStr)}
            </span>
            <span class="text-xs text-base-content/60 dark:text-slate-400 block truncate mt-0.5">
              Format: Hari, Tanggal & Jam (WIB)
            </span>
          </div>
        </div>
        <span class="text-base-content/40 dark:text-slate-500 shrink-0 ml-2">${ICON.chevR}</span>
      </button>
      <div id="${id}_error" class="hidden text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">
        ${esc(label)} wajib ditentukan
      </div>
    </div>
  `;
}

/**
 * Update UI Trigger Card Tanggal & Waktu setelah pemilihan
 */
export function updateDateTimeTriggerUI(id, dtStr) {
  const hiddenInput = document.getElementById(`${id}_val`);
  if (hiddenInput) hiddenInput.value = dtStr || '';

  const textEl = document.getElementById(`${id}_text`);
  const errorEl = document.getElementById(`${id}_error`);
  const triggerBtn = document.getElementById(id);

  if (textEl) {
    textEl.textContent = dtStr ? formatDateTimeDisplay(dtStr) : 'Pilih Tanggal & Waktu...';
    textEl.className = dtStr
      ? 'font-semibold text-xs text-base-content dark:text-slate-100 block truncate'
      : 'font-normal text-xs text-base-content/50 dark:text-slate-400 block truncate';
  }
  if (errorEl) errorEl.classList.add('hidden');
  if (triggerBtn) triggerBtn.classList.remove('border-rose-500');
}

/**
 * Render Trigger Card untuk Tanggal (Date Only)
 */
export function renderDateTrigger({
  id = 'trigger_date',
  value = '', // YYYY-MM-DD
  label = 'Tenggat Waktu',
  required = false,
  placeholder = 'Pilih Tanggal...'
}) {
  const displayStr = value ? formatDateDisplay(value) : placeholder;

  return `
    <div class="w-full">
      <label class="label pb-1 pt-0">
        <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
          ${esc(label)} ${required ? '<span class="text-rose-500">*</span>' : ''}
        </span>
      </label>
      <input type="hidden" id="${id}_val" value="${esc(value || '')}" />
      <button 
        type="button" 
        id="${id}" 
        class="w-full min-h-[52px] px-3.5 py-2.5 rounded-xl border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200/50 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl ${value ? 'bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60' : 'bg-base-200 dark:bg-slate-800 text-base-content/50 dark:text-slate-400'} flex items-center justify-center shrink-0">
            ${ICON.calendar}
          </div>
          <div class="min-w-0">
            <span id="${id}_text" class="font-semibold text-xs text-base-content dark:text-slate-100 block truncate ${!value ? 'text-base-content/50 dark:text-slate-400 font-normal' : ''}">
              ${esc(displayStr)}
            </span>
            <span class="text-xs text-base-content/60 dark:text-slate-400 block truncate mt-0.5">
              Sentuh untuk memilih tanggal kalender
            </span>
          </div>
        </div>
        <span class="text-base-content/40 dark:text-slate-500 shrink-0 ml-2">${ICON.chevR}</span>
      </button>
      <div id="${id}_error" class="hidden text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">
        ${esc(label)} wajib ditentukan
      </div>
    </div>
  `;
}

/**
 * Update UI Trigger Card Tanggal setelah pemilihan
 */
export function updateDateTriggerUI(id, dStr) {
  const hiddenInput = document.getElementById(`${id}_val`);
  if (hiddenInput) hiddenInput.value = dStr || '';

  const textEl = document.getElementById(`${id}_text`);
  const errorEl = document.getElementById(`${id}_error`);
  const triggerBtn = document.getElementById(id);

  if (textEl) {
    textEl.textContent = dStr ? formatDateDisplay(dStr) : 'Pilih Tanggal...';
    textEl.className = dStr
      ? 'font-semibold text-xs text-base-content dark:text-slate-100 block truncate'
      : 'font-normal text-xs text-base-content/50 dark:text-slate-400 block truncate';
  }
  if (errorEl) errorEl.classList.add('hidden');
  if (triggerBtn) triggerBtn.classList.remove('border-rose-500');
}

/**
 * Render Trigger Card untuk Waktu (Time Only)
 */
export function renderTimeTrigger({
  id = 'trigger_time',
  value = '', // HH:mm
  label = 'Waktu',
  required = false,
  placeholder = 'Pilih Jam...'
}) {
  const displayStr = value ? `${value} WIB` : placeholder;

  return `
    <div class="w-full">
      <label class="label pb-1 pt-0">
        <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
          ${esc(label)} ${required ? '<span class="text-rose-500">*</span>' : ''}
        </span>
      </label>
      <input type="hidden" id="${id}_val" value="${esc(value || '')}" />
      <button 
        type="button" 
        id="${id}" 
        class="w-full min-h-[52px] px-3.5 py-2.5 rounded-xl border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200/50 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg ${value ? 'bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60' : 'bg-base-200 dark:bg-slate-800 text-base-content/50 dark:text-slate-400'} flex items-center justify-center shrink-0">
            ${ICON.timer}
          </div>
          <div class="min-w-0">
            <span id="${id}_text" class="font-semibold text-xs text-base-content dark:text-slate-100 block truncate ${!value ? 'text-base-content/50 dark:text-slate-400 font-normal' : ''}">
              ${esc(displayStr)}
            </span>
          </div>
        </div>
        <span class="text-base-content/40 dark:text-slate-500 shrink-0 ml-1.5">${ICON.chevR}</span>
      </button>
      <div id="${id}_error" class="hidden text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">
        ${esc(label)} wajib ditentukan
      </div>
    </div>
  `;
}

/**
 * Update UI Trigger Card Waktu setelah pemilihan
 */
export function updateTimeTriggerUI(id, tStr) {
  const hiddenInput = document.getElementById(`${id}_val`);
  if (hiddenInput) hiddenInput.value = tStr || '';

  const textEl = document.getElementById(`${id}_text`);
  const errorEl = document.getElementById(`${id}_error`);
  const triggerBtn = document.getElementById(id);

  if (textEl) {
    textEl.textContent = tStr ? `${tStr} WIB` : 'Pilih Jam...';
    textEl.className = tStr
      ? 'font-semibold text-xs text-base-content dark:text-slate-100 block truncate'
      : 'font-normal text-xs text-base-content/50 dark:text-slate-400 block truncate';
  }
  if (errorEl) errorEl.classList.add('hidden');
  if (triggerBtn) triggerBtn.classList.remove('border-rose-500');
}


/* ==========================================================================
   2. REUSABLE M3 SELECTION PICKER SHEET
   ========================================================================== */

/**
 * Membuka Material 3 Selection Sheet di dalam subview modal form
 */
export function openSelectionSubSheet({
  containerId,
  mainViewId,
  title = 'Pilihan',
  subtitle = 'Pilih salah satu opsi di bawah',
  options = [], // [{ id, label, desc, icon, badge }]
  currentVal = '',
  onSelect,
  onBack,
  sheetTitleElId = 'sheetTitle'
}) {
  const container = document.getElementById(containerId);
  const mainView = document.getElementById(mainViewId);
  const sheetTitle = document.getElementById(sheetTitleElId);

  if (!container || !mainView) return;

  mainView.classList.add('hidden');
  container.classList.remove('hidden');

  if (sheetTitle) {
    sheetTitle.textContent = title;
  }

  container.innerHTML = `
    <!-- Sub-Sheet Navigation Bar -->
    <div class="flex items-center justify-between pb-2.5 mb-2 border-b border-base-200 dark:border-slate-800">
      <button type="button" id="btn_picker_back" class="btn btn-ghost btn-sm h-10 px-3 rounded-full text-xs font-semibold text-base-content/85 dark:text-slate-200 hover:text-base-content dark:hover:text-white flex items-center gap-1.5 -ml-1 cursor-pointer">
        ${ICON.chevL} <span>Kembali</span>
      </button>
      <span class="text-xs font-semibold text-brand dark:text-indigo-300 px-2.5 py-0.5 rounded-full bg-brand/10 dark:bg-indigo-950/70 border border-brand/20 dark:border-indigo-800/60">
        Pilihan
      </span>
    </div>

    <!-- Judul & Keterangan -->
    <div class="mb-3 px-0.5">
      <h4 class="font-display font-bold text-base text-base-content dark:text-slate-100">${esc(title)}</h4>
      ${subtitle ? `<p class="text-xs text-base-content/60 dark:text-slate-400 mt-0.5">${esc(subtitle)}</p>` : ''}
    </div>

    <!-- List Opsi M3 (Min-h 48dp) -->
    <div class="space-y-2 max-h-[55vh] overflow-y-auto pr-1" id="picker_options_list">
      ${options.length ? options.map(opt => {
        const isSelected = String(opt.id) === String(currentVal);
        return `
          <button 
            type="button" 
            data-picker-val="${esc(opt.id)}"
            class="picker-option-item w-full min-h-[52px] px-3.5 py-3 rounded-2xl border ${isSelected ? 'border-brand dark:border-indigo-500 bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 font-semibold' : 'border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200/50 dark:hover:bg-slate-800/80 text-base-content dark:text-slate-200'} flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl ${isSelected ? 'bg-brand/20 dark:bg-indigo-900/50 text-brand dark:text-indigo-300' : 'bg-base-200 dark:bg-slate-800 text-base-content/60 dark:text-slate-400'} flex items-center justify-center shrink-0">
                ${opt.icon || ICON.book}
              </div>
              <div class="min-w-0">
                <span class="font-semibold text-xs ${isSelected ? 'text-brand dark:text-indigo-300' : 'text-base-content dark:text-slate-100'} block truncate">
                  ${esc(opt.label)}
                </span>
                ${opt.desc ? `
                  <span class="text-xs ${isSelected ? 'text-brand/90 dark:text-indigo-200' : 'text-base-content/60 dark:text-slate-400'} block truncate mt-0.5">
                    ${esc(opt.desc)}
                  </span>
                ` : ''}
              </div>
            </div>
            ${isSelected ? `<span class="text-brand dark:text-indigo-300 shrink-0 ml-2">${ICON.check}</span>` : ''}
          </button>
        `;
      }).join('') : `
        <div class="text-center py-8 px-4 border border-dashed border-base-200 dark:border-slate-800 rounded-2xl text-xs text-base-content/60 dark:text-slate-400">
          Tidak ada pilihan yang tersedia
        </div>
      `}
    </div>
  `;

  // Pasang Back Handler
  const backBtn = document.getElementById('btn_picker_back');
  if (backBtn) {
    backBtn.onclick = () => {
      container.classList.add('hidden');
      mainView.classList.remove('hidden');
      if (typeof onBack === 'function') onBack();
    };
  }

  // Pasang Item Click Handler
  const optionBtns = container.querySelectorAll('.picker-option-item');
  optionBtns.forEach(btn => {
    btn.onclick = () => {
      const val = btn.getAttribute('data-picker-val');
      const selectedItem = options.find(o => String(o.id) === String(val));
      container.classList.add('hidden');
      mainView.classList.remove('hidden');
      if (typeof onSelect === 'function') onSelect(val, selectedItem);
    };
  });
}

/**
 * Reusable Course Picker Sheet
 */
export function openCoursePicker({
  containerId,
  mainViewId,
  currentVal = '',
  onSelect,
  onBack,
  allowEmpty = false,
  emptyLabel = 'Tanpa Mata Kuliah'
}) {
  const courses = [...getCachedCourses()].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const options = [];

  if (allowEmpty) {
    options.push({
      id: '',
      label: emptyLabel,
      desc: 'Tidak ditautkan ke mata kuliah tertentu',
      icon: ICON.close
    });
  }

  courses.forEach(c => {
    options.push({
      id: String(c.id),
      label: c.name,
      desc: `${c.credits || 0} SKS ${c.lecturer ? '· ' + c.lecturer : ''}`,
      icon: ICON.book
    });
  });

  openSelectionSubSheet({
    containerId,
    mainViewId,
    title: 'Pilih Mata Kuliah',
    subtitle: 'Tautkan jadwal dengan mata kuliah terdaftar',
    options,
    currentVal,
    onSelect,
    onBack
  });
}


/* ==========================================================================
   3. REUSABLE M3 DATE & TIME PICKER SHEET
   ========================================================================== */

/**
 * Material 3 Date & Time Picker Sheet
 * Menghasilkan format string presisi YYYY-MM-DDTHH:mm
 */
export function openDateTimePicker({
  containerId,
  mainViewId,
  currentVal = '', // YYYY-MM-DDTHH:mm
  onSelect,
  onBack,
  sheetTitleElId = 'sheetTitle'
}) {
  const container = document.getElementById(containerId);
  const mainView = document.getElementById(mainViewId);
  const sheetTitle = document.getElementById(sheetTitleElId);

  if (!container || !mainView) return;

  mainView.classList.add('hidden');
  container.classList.remove('hidden');

  if (sheetTitle) {
    sheetTitle.textContent = 'Pilih Tanggal & Waktu';
  }

  // State Picker internal
  let initialDate = currentVal ? new Date(currentVal) : new Date();
  if (isNaN(initialDate.getTime())) initialDate = new Date();

  let selectedYear = initialDate.getFullYear();
  let selectedMonth = initialDate.getMonth(); // 0-11
  let selectedDate = initialDate.getDate(); // 1-31
  let selectedHour = String(initialDate.getHours()).padStart(2, '0');
  let selectedMinute = String(Math.floor(initialDate.getMinutes() / 5) * 5).padStart(2, '0');

  let activeTab = 'date'; // 'date' | 'time'

  function renderPickerDOM() {
    const currentSelectedFull = new Date(selectedYear, selectedMonth, selectedDate);
    const dayOfWeek = DAY_NAMES_FULL[currentSelectedFull.getDay()];
    const monthName = MONTH_SHORT[selectedMonth];
    const previewDateStr = `${dayOfWeek}, ${selectedDate} ${monthName} ${selectedYear}`;
    const previewTimeStr = `${selectedHour}:${selectedMinute} WIB`;

    container.innerHTML = `
      <!-- Top Navigation & Tab Switcher -->
      <div class="flex items-center justify-between pb-2.5 mb-2 border-b border-base-200 dark:border-slate-800">
        <button type="button" id="btn_dt_back" class="btn btn-ghost btn-sm h-10 px-3 rounded-full text-xs font-semibold text-base-content/85 dark:text-slate-200 hover:text-base-content dark:hover:text-white flex items-center gap-1.5 -ml-1 cursor-pointer">
          ${ICON.chevL} <span>Kembali</span>
        </button>
        <div class="inline-flex rounded-xl p-1 bg-base-200/80 dark:bg-slate-800 border border-base-300/60 dark:border-slate-700">
          <button type="button" id="tab_dt_date" class="px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeTab === 'date' ? 'bg-base-100 dark:bg-slate-900 text-brand dark:text-indigo-300 shadow-sm' : 'text-base-content/70 dark:text-slate-400 hover:text-base-content'}">
            Tanggal
          </button>
          <button type="button" id="tab_dt_time" class="px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeTab === 'time' ? 'bg-base-100 dark:bg-slate-900 text-brand dark:text-indigo-300 shadow-sm' : 'text-base-content/70 dark:text-slate-400 hover:text-base-content'}">
            Waktu
          </button>
        </div>
      </div>

      <!-- Preview Header -->
      <div class="p-3 bg-brand/5 dark:bg-indigo-950/40 border border-brand/15 dark:border-indigo-900/60 rounded-2xl mb-3 flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-brand dark:text-indigo-300 uppercase tracking-wider">Jadwal Terpilih</div>
          <div class="font-display font-bold text-sm text-base-content dark:text-slate-100 mt-0.5">
            ${previewDateStr} · ${previewTimeStr}
          </div>
        </div>
        <div class="w-8 h-8 rounded-xl bg-brand/10 dark:bg-indigo-900/60 text-brand dark:text-indigo-300 flex items-center justify-center shrink-0">
          ${ICON.calendar}
        </div>
      </div>

      <!-- TAB 1: KALENDER TANGGAL M3 -->
      <div id="view_dt_date" class="${activeTab === 'date' ? 'block' : 'hidden'} space-y-3">
        <!-- Quick Date Preset Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button type="button" data-offset="0" class="btn_quick_date px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300 whitespace-nowrap cursor-pointer">
            Hari Ini
          </button>
          <button type="button" data-offset="1" class="btn_quick_date px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300 whitespace-nowrap cursor-pointer">
            Besok
          </button>
          <button type="button" data-offset="7" class="btn_quick_date px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300 whitespace-nowrap cursor-pointer">
            +7 Hari
          </button>
          <button type="button" data-offset="14" class="btn_quick_date px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300 whitespace-nowrap cursor-pointer">
            +14 Hari
          </button>
        </div>

        <!-- Month Navigation -->
        <div class="flex items-center justify-between px-1">
          <h5 class="font-display font-bold text-sm text-base-content dark:text-slate-100">
            ${MONTH_NAMES[selectedMonth]} ${selectedYear}
          </h5>
          <div class="flex items-center gap-1">
            <button type="button" id="btn_cal_prev" class="w-10 h-10 rounded-xl hover:bg-base-200 dark:hover:bg-slate-800 flex items-center justify-center text-base-content/70 dark:text-slate-300 cursor-pointer">
              ${ICON.chevL}
            </button>
            <button type="button" id="btn_cal_next" class="w-10 h-10 rounded-xl hover:bg-base-200 dark:hover:bg-slate-800 flex items-center justify-center text-base-content/70 dark:text-slate-300 cursor-pointer">
              ${ICON.chevR}
            </button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1 text-center">
          ${DAY_NAMES_SHORT.map(d => `
            <div class="text-xs font-bold text-base-content/50 dark:text-slate-400 py-1">
              ${d}
            </div>
          `).join('')}

          ${generateCalendarDays(selectedYear, selectedMonth, selectedDate)}
        </div>
      </div>

      <!-- TAB 2: PEMILIH WAKTU (HOURS & MINUTES) M3 -->
      <div id="view_dt_time" class="${activeTab === 'time' ? 'block' : 'hidden'} space-y-3">
        <!-- Quick Preset Jam Kuliah / Ujian -->
        <div>
          <span class="text-xs font-semibold text-base-content/70 dark:text-slate-400 block mb-1.5">Preset Jam Kuliah & Ujian:</span>
          <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            ${UNIVERSITY_TIME_PRESETS.map(t => `
              <button type="button" data-preset-time="${t}" class="btn_preset_time px-3 py-1.5 rounded-full text-xs font-semibold border ${t === `${selectedHour}:${selectedMinute}` ? 'border-brand dark:border-indigo-500 bg-brand text-white' : 'border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 text-base-content/80 dark:text-slate-300 hover:bg-base-200 dark:hover:bg-slate-800'} whitespace-nowrap cursor-pointer">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Grid Selector Jam & Menit -->
        <div class="grid grid-cols-2 gap-3 pt-1">
          <!-- Kolom Jam (00 - 23) -->
          <div>
            <span class="text-xs font-semibold text-base-content/70 dark:text-slate-400 block mb-1">Jam (00 - 23):</span>
            <div class="grid grid-cols-4 gap-1.5 max-h-[200px] overflow-y-auto p-1 bg-base-200/40 dark:bg-slate-900/40 rounded-xl border border-base-200 dark:border-slate-800">
              ${Array.from({ length: 24 }, (_, i) => {
                const h = String(i).padStart(2, '0');
                const isSelected = h === selectedHour;
                return `
                  <button type="button" data-hour="${h}" class="btn_select_hour h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected ? 'bg-brand text-white shadow-sm' : 'hover:bg-base-300 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300'}">
                    ${h}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Kolom Menit (00 - 55 kelipatan 5) -->
          <div>
            <span class="text-xs font-semibold text-base-content/70 dark:text-slate-400 block mb-1">Menit:</span>
            <div class="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto p-1 bg-base-200/40 dark:bg-slate-900/40 rounded-xl border border-base-200 dark:border-slate-800">
              ${['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => {
                const isSelected = m === selectedMinute;
                return `
                  <button type="button" data-minute="${m}" class="btn_select_minute h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected ? 'bg-brand text-white shadow-sm' : 'hover:bg-base-300 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300'}">
                    :${m}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Aksi Batal & Terapkan (>= 48dp) -->
      <div class="flex gap-2.5 pt-3 mt-2 border-t border-base-200 dark:border-slate-800">
        <button type="button" id="btn_dt_cancel" class="btn btn-ghost bg-base-200 dark:bg-slate-800 hover:bg-base-300 dark:hover:bg-slate-700 text-base-content dark:text-slate-200 h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs cursor-pointer">
          Batal
        </button>
        <button type="button" id="btn_dt_apply" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center gap-2 cursor-pointer shadow-none active:scale-[0.99]">
          ${ICON.check}
          <span>Terapkan</span>
        </button>
      </div>
    `;

    // Pasang Event Listeners
    attachPickerListeners();
  }

  function generateCalendarDays(year, month, activeDate) {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Min, 1 = Sen ...
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

    let cellsHtml = '';

    // Sel kosong sebelum hari ke-1
    for (let i = 0; i < firstDayIndex; i++) {
      cellsHtml += `<div class="h-10"></div>`;
    }

    // Sel tanggal 1 sampai N
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = day === activeDate;
      const isToday = isThisMonth && today.getDate() === day;

      cellsHtml += `
        <button 
          type="button" 
          data-day="${day}"
          class="btn_cal_day h-10 w-10 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-brand text-white font-bold' : isToday ? 'border-2 border-brand text-brand dark:text-indigo-400 font-bold' : 'hover:bg-base-200 dark:hover:bg-slate-800 text-base-content dark:text-slate-200'}"
        >
          ${day}
        </button>
      `;
    }

    return cellsHtml;
  }

  function attachPickerListeners() {
    // Back & Cancel
    const closePicker = () => {
      container.classList.add('hidden');
      mainView.classList.remove('hidden');
      if (typeof onBack === 'function') onBack();
    };

    const backBtn = document.getElementById('btn_dt_back');
    if (backBtn) backBtn.onclick = closePicker;

    const cancelBtn = document.getElementById('btn_dt_cancel');
    if (cancelBtn) cancelBtn.onclick = closePicker;

    // Tab Switcher
    const tabDate = document.getElementById('tab_dt_date');
    const tabTime = document.getElementById('tab_dt_time');
    if (tabDate && tabTime) {
      tabDate.onclick = () => {
        activeTab = 'date';
        renderPickerDOM();
      };
      tabTime.onclick = () => {
        activeTab = 'time';
        renderPickerDOM();
      };
    }

    // Quick Date Presets
    container.querySelectorAll('.btn_quick_date').forEach(btn => {
      btn.onclick = () => {
        const offset = Number(btn.getAttribute('data-offset') || 0);
        const target = new Date();
        target.setDate(target.getDate() + offset);
        selectedYear = target.getFullYear();
        selectedMonth = target.getMonth();
        selectedDate = target.getDate();
        renderPickerDOM();
      };
    });

    // Month Navigation
    const prevBtn = document.getElementById('btn_cal_prev');
    if (prevBtn) {
      prevBtn.onclick = () => {
        selectedMonth--;
        if (selectedMonth < 0) {
          selectedMonth = 11;
          selectedYear--;
        }
        selectedDate = 1;
        renderPickerDOM();
      };
    }

    const nextBtn = document.getElementById('btn_cal_next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        selectedMonth++;
        if (selectedMonth > 11) {
          selectedMonth = 0;
          selectedYear++;
        }
        selectedDate = 1;
        renderPickerDOM();
      };
    }

    // Day Click
    container.querySelectorAll('.btn_cal_day').forEach(btn => {
      btn.onclick = () => {
        selectedDate = Number(btn.getAttribute('data-day'));
        // Setelah memilih tanggal, otomatis arahkan preview ke tab waktu jika belum disetel
        activeTab = 'time';
        renderPickerDOM();
      };
    });

    // Time Presets
    container.querySelectorAll('.btn_preset_time').forEach(btn => {
      btn.onclick = () => {
        const parts = btn.getAttribute('data-preset-time').split(':');
        selectedHour = parts[0];
        selectedMinute = parts[1];
        renderPickerDOM();
      };
    });

    // Hour Select
    container.querySelectorAll('.btn_select_hour').forEach(btn => {
      btn.onclick = () => {
        selectedHour = btn.getAttribute('data-hour');
        renderPickerDOM();
      };
    });

    // Minute Select
    container.querySelectorAll('.btn_select_minute').forEach(btn => {
      btn.onclick = () => {
        selectedMinute = btn.getAttribute('data-minute');
        renderPickerDOM();
      };
    });

    // Apply Button
    const applyBtn = document.getElementById('btn_dt_apply');
    if (applyBtn) {
      applyBtn.onclick = () => {
        const y = selectedYear;
        const m = String(selectedMonth + 1).padStart(2, '0');
        const d = String(selectedDate).padStart(2, '0');
        const finalIsoString = `${y}-${m}-${d}T${selectedHour}:${selectedMinute}`;

        container.classList.add('hidden');
        mainView.classList.remove('hidden');

        if (typeof onSelect === 'function') {
          onSelect(finalIsoString);
        }
      };
    }
  }

  // Render awal
  renderPickerDOM();
}

/**
 * Material 3 Date Picker Sheet (Date Only)
 * Menghasilkan format string YYYY-MM-DD
 */
export function openDatePicker({
  containerId,
  mainViewId,
  currentVal = '', // YYYY-MM-DD
  onSelect,
  onBack,
  allowClear = false,
  sheetTitleElId = 'sheetTitle'
}) {
  const container = document.getElementById(containerId);
  const mainView = document.getElementById(mainViewId);
  const sheetTitle = document.getElementById(sheetTitleElId);

  if (!container || !mainView) return;

  mainView.classList.add('hidden');
  container.classList.remove('hidden');

  if (sheetTitle) {
    sheetTitle.textContent = 'Pilih Tanggal';
  }

  let parts = currentVal ? currentVal.split('-') : [];
  let initialDate = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date();
  if (isNaN(initialDate.getTime())) initialDate = new Date();

  let selectedYear = initialDate.getFullYear();
  let selectedMonth = initialDate.getMonth();
  let selectedDate = currentVal ? initialDate.getDate() : null;

  function renderDatePickerDOM() {
    const previewStr = selectedDate 
      ? formatDateDisplay(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`)
      : 'Belum ada tanggal dipilih';

    container.innerHTML = `
      <div class="flex items-center justify-between pb-2.5 mb-2 border-b border-base-200 dark:border-slate-800">
        <button type="button" id="btn_dp_back" class="btn btn-ghost btn-sm h-10 px-3 rounded-full text-xs font-semibold text-base-content/85 dark:text-slate-200 hover:text-base-content dark:hover:text-white flex items-center gap-1.5 -ml-1 cursor-pointer">
          ${ICON.chevL} <span>Kembali</span>
        </button>
        <span class="text-xs font-semibold text-brand dark:text-indigo-300 px-2.5 py-0.5 rounded-full bg-brand/10 dark:bg-indigo-950/70 border border-brand/20 dark:border-indigo-800/60">
          Kalender
        </span>
      </div>

      <div class="p-3 bg-brand/5 dark:bg-indigo-950/40 border border-brand/15 dark:border-indigo-900/60 rounded-2xl mb-3 flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-brand dark:text-indigo-300 uppercase tracking-wider">Tanggal Terpilih</div>
          <div class="font-display font-bold text-sm text-base-content dark:text-slate-100 mt-0.5">
            ${previewStr}
          </div>
        </div>
        <div class="w-8 h-8 rounded-xl bg-brand/10 dark:bg-indigo-900/60 text-brand dark:text-indigo-300 flex items-center justify-center shrink-0">
          ${ICON.calendar}
        </div>
      </div>

      <!-- Quick Date Preset Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide mb-2">
        <button type="button" data-offset="0" class="btn_dp_quick px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300 whitespace-nowrap cursor-pointer">
          Hari Ini
        </button>
        <button type="button" data-offset="1" class="btn_dp_quick px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300 whitespace-nowrap cursor-pointer">
          Besok
        </button>
        <button type="button" data-offset="7" class="btn_dp_quick px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300 whitespace-nowrap cursor-pointer">
          +7 Hari
        </button>
        ${allowClear ? `
          <button type="button" id="btn_dp_clear" class="px-3 py-1.5 rounded-full text-xs font-semibold border border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 hover:bg-base-200 dark:hover:bg-slate-800 text-rose-500 whitespace-nowrap cursor-pointer">
            Kosongkan
          </button>
        ` : ''}
      </div>

      <!-- Month Navigation -->
      <div class="flex items-center justify-between px-1 mb-1">
        <h5 class="font-display font-bold text-sm text-base-content dark:text-slate-100">
          ${MONTH_NAMES[selectedMonth]} ${selectedYear}
        </h5>
        <div class="flex items-center gap-1">
          <button type="button" id="btn_dp_prev" class="w-10 h-10 rounded-xl hover:bg-base-200 dark:hover:bg-slate-800 flex items-center justify-center text-base-content/70 dark:text-slate-300 cursor-pointer">
            ${ICON.chevL}
          </button>
          <button type="button" id="btn_dp_next" class="w-10 h-10 rounded-xl hover:bg-base-200 dark:hover:bg-slate-800 flex items-center justify-center text-base-content/70 dark:text-slate-300 cursor-pointer">
            ${ICON.chevR}
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1 text-center">
        ${DAY_NAMES_SHORT.map(d => `
          <div class="text-xs font-bold text-base-content/50 dark:text-slate-400 py-1">
            ${d}
          </div>
        `).join('')}

        ${generateCalendarDays(selectedYear, selectedMonth, selectedDate)}
      </div>

      <div class="flex gap-2.5 pt-3 mt-3 border-t border-base-200 dark:border-slate-800">
        <button type="button" id="btn_dp_cancel" class="btn btn-ghost bg-base-200 dark:bg-slate-800 hover:bg-base-300 dark:hover:bg-slate-700 text-base-content dark:text-slate-200 h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs cursor-pointer">
          Batal
        </button>
        <button type="button" id="btn_dp_apply" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center gap-2 cursor-pointer shadow-none active:scale-[0.99]">
          ${ICON.check}
          <span>Terapkan</span>
        </button>
      </div>
    `;

    attachDatePickerListeners();
  }

  function generateCalendarDays(year, month, activeDate) {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

    let cellsHtml = '';
    for (let i = 0; i < firstDayIndex; i++) {
      cellsHtml += `<div class="h-10"></div>`;
    }
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = day === activeDate;
      const isToday = isThisMonth && today.getDate() === day;
      cellsHtml += `
        <button 
          type="button" 
          data-day="${day}"
          class="btn_dp_day h-10 w-10 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-brand text-white font-bold' : isToday ? 'border-2 border-brand text-brand dark:text-indigo-400 font-bold' : 'hover:bg-base-200 dark:hover:bg-slate-800 text-base-content dark:text-slate-200'}"
        >
          ${day}
        </button>
      `;
    }
    return cellsHtml;
  }

  function attachDatePickerListeners() {
    const closePicker = () => {
      container.classList.add('hidden');
      mainView.classList.remove('hidden');
      if (typeof onBack === 'function') onBack();
    };

    const backBtn = document.getElementById('btn_dp_back');
    if (backBtn) backBtn.onclick = closePicker;

    const cancelBtn = document.getElementById('btn_dp_cancel');
    if (cancelBtn) cancelBtn.onclick = closePicker;

    const prevBtn = document.getElementById('btn_dp_prev');
    if (prevBtn) {
      prevBtn.onclick = () => {
        selectedMonth--;
        if (selectedMonth < 0) {
          selectedMonth = 11;
          selectedYear--;
        }
        renderDatePickerDOM();
      };
    }

    const nextBtn = document.getElementById('btn_dp_next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        selectedMonth++;
        if (selectedMonth > 11) {
          selectedMonth = 0;
          selectedYear++;
        }
        renderDatePickerDOM();
      };
    }

    container.querySelectorAll('.btn_dp_quick').forEach(btn => {
      btn.onclick = () => {
        const offset = Number(btn.getAttribute('data-offset') || 0);
        const target = new Date();
        target.setDate(target.getDate() + offset);
        selectedYear = target.getFullYear();
        selectedMonth = target.getMonth();
        selectedDate = target.getDate();
        renderDatePickerDOM();
      };
    });

    const clearBtn = document.getElementById('btn_dp_clear');
    if (clearBtn) {
      clearBtn.onclick = () => {
        selectedDate = null;
        renderDatePickerDOM();
      };
    }

    container.querySelectorAll('.btn_dp_day').forEach(btn => {
      btn.onclick = () => {
        selectedDate = Number(btn.getAttribute('data-day'));
        renderDatePickerDOM();
      };
    });

    const applyBtn = document.getElementById('btn_dp_apply');
    if (applyBtn) {
      applyBtn.onclick = () => {
        const dStr = selectedDate 
          ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
          : '';
        container.classList.add('hidden');
        mainView.classList.remove('hidden');
        if (typeof onSelect === 'function') onSelect(dStr);
      };
    }
  }

  renderDatePickerDOM();
}

/**
 * Material 3 Time Picker Sheet (Time Only)
 * Menghasilkan format string HH:mm
 */
export function openTimePicker({
  containerId,
  mainViewId,
  currentVal = '', // HH:mm
  title = 'Pilih Waktu Kuliah',
  onSelect,
  onBack,
  sheetTitleElId = 'sheetTitle'
}) {
  const container = document.getElementById(containerId);
  const mainView = document.getElementById(mainViewId);
  const sheetTitle = document.getElementById(sheetTitleElId);

  if (!container || !mainView) return;

  mainView.classList.add('hidden');
  container.classList.remove('hidden');

  if (sheetTitle) {
    sheetTitle.textContent = title;
  }

  let [initialHour, initialMinute] = (currentVal || '08:00').split(':');
  let selectedHour = initialHour || '08';
  let selectedMinute = initialMinute || '00';

  function renderTimePickerDOM() {
    container.innerHTML = `
      <div class="flex items-center justify-between pb-2.5 mb-2 border-b border-base-200 dark:border-slate-800">
        <button type="button" id="btn_tp_back" class="btn btn-ghost btn-sm h-10 px-3 rounded-full text-xs font-semibold text-base-content/85 dark:text-slate-200 hover:text-base-content dark:hover:text-white flex items-center gap-1.5 -ml-1 cursor-pointer">
          ${ICON.chevL} <span>Kembali</span>
        </button>
        <span class="text-xs font-semibold text-brand dark:text-indigo-300 px-2.5 py-0.5 rounded-full bg-brand/10 dark:bg-indigo-950/70 border border-brand/20 dark:border-indigo-800/60">
          Waktu
        </span>
      </div>

      <div class="p-3 bg-brand/5 dark:bg-indigo-950/40 border border-brand/15 dark:border-indigo-900/60 rounded-2xl mb-3 flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-brand dark:text-indigo-300 uppercase tracking-wider">Waktu Terpilih</div>
          <div class="font-display font-bold text-sm text-base-content dark:text-slate-100 mt-0.5">
            ${selectedHour}:${selectedMinute} WIB
          </div>
        </div>
        <div class="w-8 h-8 rounded-xl bg-brand/10 dark:bg-indigo-900/60 text-brand dark:text-indigo-300 flex items-center justify-center shrink-0">
          ${ICON.timer}
        </div>
      </div>

      <div>
        <span class="text-xs font-semibold text-base-content/70 dark:text-slate-400 block mb-1.5">Preset Jam Kuliah:</span>
        <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          ${UNIVERSITY_TIME_PRESETS.map(t => `
            <button type="button" data-preset-time="${t}" class="btn_tp_preset px-3 py-1.5 rounded-full text-xs font-semibold border ${t === `${selectedHour}:${selectedMinute}` ? 'border-brand dark:border-indigo-500 bg-brand text-white' : 'border-base-200 dark:border-slate-800 bg-base-100 dark:bg-slate-900/60 text-base-content/80 dark:text-slate-300 hover:bg-base-200 dark:hover:bg-slate-800'} whitespace-nowrap cursor-pointer">
              ${t}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-2">
        <div>
          <span class="text-xs font-semibold text-base-content/70 dark:text-slate-400 block mb-1">Jam (00 - 23):</span>
          <div class="grid grid-cols-4 gap-1.5 max-h-[190px] overflow-y-auto p-1 bg-base-200/40 dark:bg-slate-900/40 rounded-xl border border-base-200 dark:border-slate-800">
            ${Array.from({ length: 24 }, (_, i) => {
              const h = String(i).padStart(2, '0');
              const isSelected = h === selectedHour;
              return `
                <button type="button" data-hour="${h}" class="btn_tp_hour h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected ? 'bg-brand text-white shadow-sm' : 'hover:bg-base-300 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300'}">
                  ${h}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div>
          <span class="text-xs font-semibold text-base-content/70 dark:text-slate-400 block mb-1">Menit:</span>
          <div class="grid grid-cols-3 gap-1.5 max-h-[190px] overflow-y-auto p-1 bg-base-200/40 dark:bg-slate-900/40 rounded-xl border border-base-200 dark:border-slate-800">
            ${['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => {
              const isSelected = m === selectedMinute;
              return `
                <button type="button" data-minute="${m}" class="btn_tp_minute h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected ? 'bg-brand text-white shadow-sm' : 'hover:bg-base-300 dark:hover:bg-slate-800 text-base-content/80 dark:text-slate-300'}">
                  :${m}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="flex gap-2.5 pt-3 mt-3 border-t border-base-200 dark:border-slate-800">
        <button type="button" id="btn_tp_cancel" class="btn btn-ghost bg-base-200 dark:bg-slate-800 hover:bg-base-300 dark:hover:bg-slate-700 text-base-content dark:text-slate-200 h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs cursor-pointer">
          Batal
        </button>
        <button type="button" id="btn_tp_apply" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center gap-2 cursor-pointer shadow-none active:scale-[0.99]">
          ${ICON.check}
          <span>Terapkan</span>
        </button>
      </div>
    `;

    attachTimePickerListeners();
  }

  function attachTimePickerListeners() {
    const closePicker = () => {
      container.classList.add('hidden');
      mainView.classList.remove('hidden');
      if (typeof onBack === 'function') onBack();
    };

    const backBtn = document.getElementById('btn_tp_back');
    if (backBtn) backBtn.onclick = closePicker;

    const cancelBtn = document.getElementById('btn_tp_cancel');
    if (cancelBtn) cancelBtn.onclick = closePicker;

    container.querySelectorAll('.btn_tp_preset').forEach(btn => {
      btn.onclick = () => {
        const parts = btn.getAttribute('data-preset-time').split(':');
        selectedHour = parts[0];
        selectedMinute = parts[1];
        renderTimePickerDOM();
      };
    });

    container.querySelectorAll('.btn_tp_hour').forEach(btn => {
      btn.onclick = () => {
        selectedHour = btn.getAttribute('data-hour');
        renderTimePickerDOM();
      };
    });

    container.querySelectorAll('.btn_tp_minute').forEach(btn => {
      btn.onclick = () => {
        selectedMinute = btn.getAttribute('data-minute');
        renderTimePickerDOM();
      };
    });

    const applyBtn = document.getElementById('btn_tp_apply');
    if (applyBtn) {
      applyBtn.onclick = () => {
        container.classList.add('hidden');
        mainView.classList.remove('hidden');
        if (typeof onSelect === 'function') onSelect(`${selectedHour}:${selectedMinute}`);
      };
    }
  }

  renderTimePickerDOM();
}


/* ==========================================================================
   4. REUSABLE M3 IN-SHEET DELETE CONFIRMATION
   ========================================================================== */

/**
 * Membuka Sub-Sheet Konfirmasi Hapus M3
 * Menjamin form asli TIDAK hilang dan dapat dibatalkan secara aman.
 */
export function openDeleteConfirmation({
  containerId,
  mainViewId,
  title = 'Hapus Item Ini?',
  entityName = '',
  entityDetailsHtml = '',
  warningText = 'Tindakan ini permanen. Data akan dihapus secara permanen dari database.',
  onConfirm,
  onCancel,
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  sheetTitleElId = 'sheetTitle'
}) {
  const container = document.getElementById(containerId);
  const mainView = document.getElementById(mainViewId);
  const sheetTitle = document.getElementById(sheetTitleElId);

  if (!container || !mainView) return;

  mainView.classList.add('hidden');
  container.classList.remove('hidden');

  if (sheetTitle) {
    sheetTitle.textContent = title;
  }

  container.innerHTML = `
    <div class="text-center py-2">
      <!-- Tonal Danger Badge -->
      <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </div>

      <h4 class="font-display font-bold text-base text-base-content dark:text-slate-100">
        ${esc(title)}
      </h4>

      ${entityDetailsHtml ? `
        <div class="mt-3 mb-3 p-3.5 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 rounded-2xl text-left">
          ${entityDetailsHtml}
        </div>
      ` : ''}

      <p class="text-xs text-base-content/80 dark:text-slate-300 leading-relaxed mb-4">
        ${esc(warningText)}
      </p>

      <div id="del_confirm_error" class="hidden mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold text-left"></div>

      <!-- Action Buttons (>= 48dp) -->
      <div class="flex gap-2.5">
        <button type="button" id="btn_cancel_delete" class="btn btn-ghost bg-base-200 dark:bg-slate-800 text-base-content dark:text-slate-200 hover:bg-base-300 dark:hover:bg-slate-700 h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs cursor-pointer">
          ${esc(cancelLabel)}
        </button>
        <button type="button" id="btn_execute_delete" class="btn bg-rose-600 hover:bg-rose-700 text-white h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center cursor-pointer transition-all active:scale-[0.99]">
          <span class="inline-flex items-center justify-center gap-2 pointer-events-none">
            <span class="shrink-0 flex items-center justify-center">${ICON.trash}</span>
            <span class="whitespace-nowrap">${esc(confirmLabel)}</span>
          </span>
        </button>
      </div>
    </div>
  `;

  // Batal Handler: Mengembalikan tampilan form utama tanpa menghapus data input
  const cancelBtn = document.getElementById('btn_cancel_delete');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      container.classList.add('hidden');
      mainView.classList.remove('hidden');
      if (typeof onCancel === 'function') onCancel();
    };
  }

  // Ya, Hapus Handler
  const confirmBtn = document.getElementById('btn_execute_delete');
  const errBox = document.getElementById('del_confirm_error');

  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="inline-flex items-center justify-center gap-2 pointer-events-none"><span class="loading loading-spinner loading-xs"></span><span class="whitespace-nowrap">Menghapus...</span></span>';
      if (errBox) errBox.classList.add('hidden');

      try {
        if (typeof onConfirm === 'function') {
          await onConfirm();
        }
      } catch (err) {
        console.error('Delete action failed:', err);
        if (errBox) {
          errBox.textContent = 'Gagal menghapus data: ' + (err.message || 'Terjadi kesalahan koneksi');
          errBox.classList.remove('hidden');
        }
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<span class="inline-flex items-center justify-center gap-2 pointer-events-none"><span class="shrink-0 flex items-center justify-center">${ICON.trash}</span><span class="whitespace-nowrap">${esc(confirmLabel)}</span></span>`;
      }
    };
  }
}
