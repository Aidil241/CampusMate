/**
 * pages/exams.js
 * Halaman jadwal ujian (Supabase Edition) dengan relasi mata kuliah dinamis.
 * Material Design 3 / CampusMate Edition — "The Focused Scholar"
 * Menggunakan Global CampusMate M3 Overlay & Picker Standard
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { esc } from '../utils/format.js';
import { ICON } from '../utils/icons.js';
import { navigate } from '../core/router.js';
import { 
  fetchSharedCourses, 
  getCachedCourses, 
  subscribeCourses 
} from '../data/courses.js';
import {
  renderCourseTrigger,
  updateCourseTriggerUI,
  openCoursePicker,
  renderDateTimeTrigger,
  updateDateTimeTriggerUI,
  openDateTimePicker,
  openDeleteConfirmation
} from '../ui/picker.js';
import { ReminderSys } from '../utils/reminder.js';

let examsCache = [];
let coursesCache = getCachedCourses();
let isFetching = false;
let hasLoaded = false;

export function resetExamsCache() {
  examsCache = [];
  hasLoaded = false;
  isFetching = false;
}

subscribeCourses((updatedCourses) => {
  coursesCache = updatedCourses;
});

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

// Fungsi untuk menarik data ujian dan mata kuliah dari Supabase
async function fetchExamsData() {
  if (isFetching) return;
  isFetching = true;

  try {
    const [examRes, courses] = await Promise.all([
      supabase.from('exams').select('*').order('exam_date', { ascending: true }),
      fetchSharedCourses()
    ]);

    if (!examRes.error && examRes.data) examsCache = examRes.data;
    if (courses) coursesCache = courses;
    hasLoaded = true;
  } catch (err) {
    console.error('Gagal mengambil data ujian:', err);
  } finally {
    isFetching = false;
    render();
  }
}

// Panggil saat pertama kali dimuat
fetchExamsData();

// Helper untuk menghitung sisa hari secara presisi
function getDaysLeft(dateString) {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  if (isNaN(examDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(examDate);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Helper status beban dan ringkasan ujian untuk konsumsi Top App Bar
export function hasExamsLoaded() {
  return hasLoaded;
}

export function getCachedExams() {
  return examsCache;
}

export function getExamsSummary() {
  const upcomingExams = examsCache.filter(e => {
    const days = getDaysLeft(e.exam_date);
    return days !== null && days >= 0;
  });

  return {
    hasLoaded,
    totalCount: examsCache.length,
    upcomingCount: upcomingExams.length
  };
}

// Helper untuk mencari data mata kuliah berdasarkan ID
function getCourseInfo(courseId) {
  const found = coursesCache.find(c => String(c.id) === String(courseId));
  if (!found) return { name: 'Mata Kuliah Umum', credits: null };
  return { name: found.name, credits: found.credits };
}

// Helper pemformat tanggal lengkap dengan nama hari
function formatExamDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateFormatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = dateString.includes('T') 
    ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') + ' WIB'
    : '';
  return `${dayName}, ${dateFormatted}${timeStr ? ` · ${timeStr}` : ''}`;
}

// Helper deteksi URL online meeting (Zoom / Meet / Teams / Web Link)
function detectUrl(text) {
  if (!text) return null;
  const trimmed = text.trim();
  const urlRegex = /(https?:\/\/[^\s]+|zoom\.us\/[^\s]+|meet\.google\.com\/[^\s]+|teams\.microsoft\.com\/[^\s]+)/i;
  const match = trimmed.match(urlRegex);
  if (match) {
    let url = match[0];
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }
  return null;
}

// Calibrated Material 3 urgency badge
function getUrgencyBadge(daysLeft) {
  if (daysLeft < 0) {
    return {
      cls: 'bg-base-200/80 dark:bg-slate-800 text-base-content/60 dark:text-slate-400 border border-base-300 dark:border-slate-700',
      text: 'Selesai'
    };
  }
  if (daysLeft === 0) {
    return {
      cls: 'bg-brand text-white font-bold',
      text: 'Hari Ini'
    };
  }
  if (daysLeft === 1) {
    return {
      cls: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold',
      text: 'Besok'
    };
  }
  if (daysLeft <= 7) {
    return {
      cls: 'bg-indigo-50 dark:bg-indigo-950/60 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/50 font-semibold',
      text: `${daysLeft} Hari Lagi`
    };
  }
  return {
    cls: 'bg-base-200/70 dark:bg-slate-800 text-base-content/70 dark:text-slate-300 border border-base-200 dark:border-slate-700 font-medium',
    text: `${daysLeft} Hari Lagi`
  };
}

// Aksi shortcut ke Pomodoro Focus Timer
App.launchExamStudy = (courseId, examTitle) => {
  navigate('pomodoro');
  showToast(`Sesi fokus disiapkan untuk ${examTitle}`);
};

// Render card kartu ujian
function renderExamCard(e, isHistory = false) {
  const daysLeft = getDaysLeft(e.exam_date);
  const badge = getUrgencyBadge(daysLeft);
  const course = getCourseInfo(e.course_id);
  const url = detectUrl(e.room);

  return `
    <div onclick="window.openExamForm('${e.id}')" 
         class="exam-card p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all active:scale-[0.99] hover:border-brand/30 dark:hover:border-indigo-500/40 ${isHistory ? 'opacity-75 hover:opacity-100' : ''}">
      
      <div class="flex items-start gap-3">
        <div class="p-2.5 ${isHistory ? 'bg-base-200/80 dark:bg-slate-800 text-base-content/60 dark:text-slate-400' : 'bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/15 dark:border-indigo-800/50'} rounded-xl shrink-0 mt-0.5">
          ${ICON.calendar}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100 leading-snug line-clamp-2">${esc(e.title)}</h4>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${badge.cls}">
              ${badge.text}
            </span>
          </div>

          <p class="text-xs text-base-content/70 dark:text-slate-400 mt-1 truncate">
            ${esc(course.name)}${course.credits ? ` · ${course.credits} SKS` : ''}
          </p>

          <div class="flex items-center gap-1.5 text-xs text-base-content/70 dark:text-slate-400 mt-1.5 font-medium">
            <span class="opacity-60">${ICON.timer}</span>
            <span>${formatExamDate(e.exam_date)}</span>
          </div>

          ${e.room ? `
            <div class="mt-2 flex items-center gap-1.5 text-xs">
              ${url ? `
                <a href="${esc(url)}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   onclick="event.stopPropagation()" 
                   class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold text-brand dark:text-indigo-300 bg-brand/10 dark:bg-indigo-950/60 hover:bg-brand/20 border border-brand/20 dark:border-indigo-800/50 transition-colors">
                  ${ICON.video}
                  <span class="truncate max-w-[200px]">${esc(e.room)}</span>
                  ${ICON.externalLink}
                </a>
              ` : `
                <span class="inline-flex items-center gap-1 text-base-content/60 dark:text-slate-400 truncate">
                  ${ICON.mapPin}
                  <span>Ruang ${esc(e.room)}</span>
                </span>
              `}
            </div>
          ` : ''}
        </div>
      </div>

      ${!isHistory ? `
        <div class="mt-3 pt-2.5 border-t border-base-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <span class="text-xs text-base-content/50 dark:text-slate-500">Persiapan Ujian:</span>
          <button type="button" 
                  onclick="event.stopPropagation(); App.launchExamStudy('${e.course_id}', '${esc(e.title)}')" 
                  class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-brand dark:text-indigo-300 bg-brand/10 dark:bg-indigo-950/60 hover:bg-brand/20 dark:hover:bg-indigo-900/60 transition-colors border border-brand/20 dark:border-indigo-800/50 cursor-pointer">
            ${ICON.timer}
            <span>Fokus Belajar</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export function pageExams() {
  if (!examsCache.length && !isFetching) {
    fetchExamsData();
  }

  // Partisi data: Ujian Mendatang vs Riwayat Ujian
  const upcomingExams = examsCache
    .filter(e => {
      const days = getDaysLeft(e.exam_date);
      return days !== null && days >= 0;
    })
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

  const pastExams = examsCache
    .filter(e => {
      const days = getDaysLeft(e.exam_date);
      return days !== null && days < 0;
    })
    .sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));

  if (examsCache.length === 0) {
    return `
      <!-- State Kosong Menarik & Aksi CTA -->
      <div class="text-center py-10 px-4 border border-dashed border-base-200 dark:border-slate-800 rounded-2xl bg-base-100/40 dark:bg-slate-900/20">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60 flex items-center justify-center">
          ${ICON.calendar}
        </div>
        <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100">Belum ada jadwal ujian</h4>
        <p class="text-xs text-base-content/60 dark:text-slate-400 mt-1 max-w-xs mx-auto mb-4">
          Catat jadwal UTS, UAS, atau kuis Anda untuk memantau sisa hari dan mempersiapkan materi lebih awal.
        </p>
        <button type="button" onclick="window.openExamForm()" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl px-5 font-semibold text-xs border-none inline-flex items-center gap-2 cursor-pointer shadow-none">
          ${ICON.plus}
          <span>Tambah Jadwal Ujian</span>
        </button>
      </div>
    `;
  }

  return `
    <!-- Section 1: Ujian Mendatang -->
    <div class="space-y-3">
      ${upcomingExams.length ? `
        <div class="space-y-2.5">
          ${upcomingExams.map(e => renderExamCard(e, false)).join('')}
        </div>
      ` : `
        <div class="text-center py-6 px-4 bg-base-100/50 dark:bg-slate-900/30 border border-dashed border-base-200 dark:border-slate-800 rounded-2xl">
          <p class="font-bold text-xs text-base-content dark:text-slate-200">Tidak ada ujian mendatang</p>
          <p class="text-xs text-base-content/60 dark:text-slate-400 mt-0.5">Semua ujian telah selesai atau belum dijadwalkan.</p>
        </div>
      `}

      <!-- Section 2: Riwayat Ujian (Telah Selesai) -->
      ${pastExams.length ? `
        <div class="pt-4">
          <div class="flex items-center justify-between mb-2.5 px-1">
            <span class="text-xs font-semibold text-base-content/60 dark:text-slate-400 uppercase tracking-wider">
              Riwayat Ujian Selesai (${pastExams.length})
            </span>
          </div>
          <div class="space-y-2.5">
            ${pastExams.map(e => renderExamCard(e, true)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Fungsi global untuk form ujian dengan Material 3 Pickers
window.openExamForm = function(id = null) {
  const existing = id ? examsCache.find(e => e.id === id) : null;
  const e = existing || { title: '', course_id: '', exam_date: '', room: '' };
  const isEdit = Boolean(existing && existing.id);

  // State nilai form terpilih
  let selectedCourseId = e.course_id || '';
  let selectedExamDate = e.exam_date ? e.exam_date.substring(0, 16) : '';

  openSheet(isEdit ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian', `
    <div id="exam_form_container">
      <!-- 1. VIEW UTAMA: Form Input Jadwal Ujian -->
      <div id="exam_form_main" class="space-y-4">
        <!-- Field Nama Ujian & Quick Type Chips -->
        <div>
          <div class="flex items-center justify-between pb-1">
            <label class="label p-0">
              <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
                Nama Ujian <span class="text-rose-500">*</span>
              </span>
            </label>
            <!-- Preset Jenis Ujian -->
            <div class="flex gap-1" id="exam_type_presets">
              ${['UTS', 'UAS', 'Kuis', 'Praktikum'].map(type => `
                <button type="button" 
                        data-type="${type}"
                        class="exam-preset-btn px-2 py-0.5 rounded-md text-xs font-semibold border transition-all cursor-pointer bg-base-200/80 dark:bg-slate-800 text-base-content/70 dark:text-slate-300 border-base-200 dark:border-slate-700">
                  ${type}
                </button>
              `).join('')}
            </div>
          </div>
          <input 
            type="text"
            id="f_ex_title" 
            class="input input-bordered h-12 min-h-[48px] w-full px-3.5 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none transition-colors" 
            placeholder="Contoh: UTS Algoritma & Pemrograman" 
            value="${esc(e.title || '')}" 
          />
          <div id="f_ex_title_error" class="hidden text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">
            Nama ujian wajib diisi
          </div>
        </div>

        <!-- Field Mata Kuliah (M3 Course Picker Trigger) -->
        <div>
          ${renderCourseTrigger({
            id: 'trigger_ex_course',
            courseId: selectedCourseId,
            label: 'Mata Kuliah',
            required: false,
            placeholder: 'Pilih Mata Kuliah...'
          })}
        </div>

        <!-- Field Tanggal & Waktu Ujian (M3 DateTime Picker Trigger) -->
        <div>
          ${renderDateTimeTrigger({
            id: 'trigger_ex_datetime',
            value: selectedExamDate,
            label: 'Tanggal & Waktu Ujian',
            required: true,
            placeholder: 'Pilih Tanggal & Waktu...'
          })}
        </div>

        <!-- Field Ruangan / Link Online -->
        <div>
          <label class="label pb-1">
            <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">Ruangan / Tautan Online</span>
          </label>
          <input 
            type="text"
            id="f_ex_room" 
            class="input input-bordered h-12 min-h-[48px] w-full px-3.5 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none transition-colors" 
            value="${esc(e.room || '')}" 
            placeholder="Contoh: Lab Komputer 2 atau https://zoom.us/j/..." 
          />
        </div>

        <!-- Tombol Aksi Form (Minimum 48dp) -->
        <div class="flex gap-2.5 pt-2">
          ${isEdit ? `
            <button type="button" class="btn btn-ghost bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-[0.99]" id="btnDelEx">
              <span class="inline-flex items-center justify-center gap-2 pointer-events-none">
                <span class="shrink-0 flex items-center justify-center">${ICON.trash}</span>
                <span class="whitespace-nowrap">Hapus</span>
              </span>
            </button>
          ` : ''}
          <button type="button" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center cursor-pointer shadow-none transition-all active:scale-[0.99]" id="btnSaveEx">
            <span class="inline-flex items-center justify-center gap-2 pointer-events-none">
              <span class="shrink-0 flex items-center justify-center">${ICON.check}</span>
              <span class="whitespace-nowrap">Simpan Jadwal Ujian</span>
            </span>
          </button>
        </div>
      </div>

      <!-- 2. VIEW SUB: Reusable Sub-Sheet (Course Picker, DateTime Picker, Delete Confirmation) -->
      <div id="exam_sub_sheet" class="hidden"></div>
    </div>
  `);

  const sheetTitle = document.getElementById('sheetTitle');
  if (sheetTitle) {
    sheetTitle.style.color = '';
    sheetTitle.className = 'font-display font-bold text-base mb-4 text-base-content dark:text-slate-100';
  }

  // Quick Preset Chips Handler
  const titleInput = document.getElementById('f_ex_title');
  const titleError = document.getElementById('f_ex_title_error');

  const presetBtns = document.querySelectorAll('.exam-preset-btn');
  presetBtns.forEach(btn => {
    btn.onclick = () => {
      const type = btn.getAttribute('data-type');
      if (titleInput) {
        const current = titleInput.value.trim();
        const prefixes = ['UTS', 'UAS', 'Kuis', 'Praktikum'];
        let baseTitle = current;
        for (const p of prefixes) {
          if (baseTitle.startsWith(p)) {
            baseTitle = baseTitle.substring(p.length).trim();
            break;
          }
        }
        titleInput.value = baseTitle ? `${type} ${baseTitle}` : `${type} `;
        titleInput.focus();
        if (titleError) titleError.classList.add('hidden');
        titleInput.classList.remove('border-rose-500');
      }
    };
  });

  if (titleInput) {
    titleInput.oninput = () => {
      if (titleInput.value.trim()) {
        titleInput.classList.remove('border-rose-500');
        if (titleError) titleError.classList.add('hidden');
      }
    };
  }

  // PASANG TRIGGER M3 COURSE PICKER
  const courseTrigger = document.getElementById('trigger_ex_course');
  if (courseTrigger) {
    courseTrigger.onclick = () => {
      openCoursePicker({
        containerId: 'exam_sub_sheet',
        mainViewId: 'exam_form_main',
        currentVal: selectedCourseId,
        allowEmpty: true,
        emptyLabel: 'Tanpa Mata Kuliah',
        onSelect: (courseId) => {
          selectedCourseId = courseId;
          updateCourseTriggerUI('trigger_ex_course', courseId);
          if (sheetTitle) sheetTitle.textContent = isEdit ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = isEdit ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian';
        }
      });
    };
  }

  // PASANG TRIGGER M3 DATE & TIME PICKER
  const dtTrigger = document.getElementById('trigger_ex_datetime');
  if (dtTrigger) {
    dtTrigger.onclick = () => {
      openDateTimePicker({
        containerId: 'exam_sub_sheet',
        mainViewId: 'exam_form_main',
        currentVal: selectedExamDate,
        onSelect: (dtStr) => {
          selectedExamDate = dtStr;
          updateDateTimeTriggerUI('trigger_ex_datetime', dtStr);
          if (sheetTitle) sheetTitle.textContent = isEdit ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = isEdit ? 'Edit Jadwal Ujian' : 'Tambah Jadwal Ujian';
        }
      });
    };
  }

  // Save handler
  const btnSave = document.getElementById('btnSaveEx');
  if (btnSave) {
    btnSave.onclick = async () => {
      const title = (titleInput ? titleInput.value : '').trim();
      const dtError = document.getElementById('trigger_ex_datetime_error');
      const dtBtn = document.getElementById('trigger_ex_datetime');

      let hasError = false;
      if (!title) {
        if (titleInput) {
          titleInput.classList.add('border-rose-500');
          titleInput.focus();
        }
        if (titleError) titleError.classList.remove('hidden');
        hasError = true;
      }

      if (!selectedExamDate) {
        if (dtBtn) dtBtn.classList.add('border-rose-500');
        if (dtError) dtError.classList.remove('hidden');
        hasError = true;
      }

      if (hasError) {
        showToast('Nama ujian dan tanggal wajib diisi', true);
        return;
      }

      const payload = {
        title,
        course_id: selectedCourseId || null,
        exam_date: selectedExamDate,
        room: document.getElementById('f_ex_room').value.trim()
      };

      btnSave.disabled = true;
      btnSave.innerHTML = '<span class="inline-flex items-center justify-center gap-2 pointer-events-none"><span class="loading loading-spinner loading-xs"></span><span class="whitespace-nowrap">Menyimpan...</span></span>';

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) payload.user_id = user.id;

        let savedExam = null;
        if (isEdit) {
          const res = await supabase.from('exams').update(payload).eq('id', existing.id).select();
          if (res.error) throw res.error;
          savedExam = res.data && res.data[0] ? res.data[0] : { id: existing.id, ...payload };
          showToast('Jadwal ujian berhasil diperbarui');
        } else {
          const res = await supabase.from('exams').insert([payload]).select();
          if (res.error) throw res.error;
          if (res.data && res.data[0]) savedExam = res.data[0];
          showToast('Jadwal ujian berhasil ditambahkan');
        }

        if (savedExam) {
          const cName = getCourseInfo(savedExam.course_id).name;
          ReminderSys.scheduleExamReminder(savedExam, cName).catch(() => {});
        }

        closeSheet(); 
        fetchExamsData();
      } catch (err) {
        console.error('Gagal menyimpan jadwal ujian:', err);
        showToast('Gagal menyimpan jadwal ujian: ' + (err.message || 'Terjadi kesalahan'), true);
        btnSave.disabled = false;
        btnSave.innerHTML = `<span class="inline-flex items-center justify-center gap-2 pointer-events-none"><span class="shrink-0 flex items-center justify-center">${ICON.check}</span><span class="whitespace-nowrap">Simpan Jadwal Ujian</span></span>`;
      }
    };
  }

  // REUSABLE M3 IN-SHEET DELETE CONFIRMATION
  if (isEdit) {
    const btnDel = document.getElementById('btnDelEx');
    if (btnDel) {
      btnDel.onclick = () => {
        openDeleteConfirmation({
          containerId: 'exam_sub_sheet',
          mainViewId: 'exam_form_main',
          title: 'Hapus Jadwal Ujian Ini?',
          entityName: 'Jadwal Ujian',
          entityDetailsHtml: `
            <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">Informasi Ujian</div>
            <div class="font-display font-bold text-sm text-base-content dark:text-slate-100">${esc(existing.title)}</div>
            <div class="text-xs text-base-content/80 dark:text-slate-300 mt-1">
              ${esc(getCourseInfo(selectedCourseId || existing.course_id).name)} · ${formatExamDate(selectedExamDate || existing.exam_date)}
            </div>
          `,
          warningText: 'Tindakan ini permanen. Jadwal ujian akan dihapus dari daftar kalender dan tidak dapat dikembalikan.',
          onCancel: () => {
            if (sheetTitle) sheetTitle.textContent = 'Edit Jadwal Ujian';
          },
          onConfirm: async () => {
            const { error } = await supabase.from('exams').delete().eq('id', existing.id);
            if (error) throw error;
            ReminderSys.cancelExamReminder(existing.id).catch(() => {});
            closeSheet();
            showToast('Jadwal ujian berhasil dihapus');
            fetchExamsData();
          }
        });
      };
    }
  }
};

// Tombol global pembuka form ujian
App.openExamForm = () => window.openExamForm(null);