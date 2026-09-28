/**
 * pages/grades.js
 * Halaman nilai akademik & IPK (Material 3 Edition)
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import {
  openCoursePicker,
  openDeleteConfirmation
} from '../ui/picker.js';
import {
  scoreToLetter,
  courseFinalScore,
  computeIPK,
  getGradeBadgeClass,
  courseWeightSummary,
  computeCreditsSummary
} from '../utils/grades.js';
import { 
  fetchSharedCourses, 
  getCachedCourses, 
  subscribeCourses 
} from '../data/courses.js';
import {
  fetchSharedGrades,
  getCachedGrades,
  subscribeGrades,
  invalidateGradesCache
} from '../data/grades.js';

let gradesCache = getCachedGrades();
let coursesCache = getCachedCourses();
let isFetching = false;
let hasLoaded = false;
let fetchError = false;

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
  if (hasLoaded) {
    render();
  }
});

// Sinkronkan cache nilai setiap kali ada perubahan data global
subscribeGrades((updatedGrades) => {
  gradesCache = updatedGrades;
  if (hasLoaded) {
    render();
  }
});

// Fungsi menarik data nilai & mata kuliah terbaru dari Supabase
export async function fetchGradesData(forceRefresh = false) {
  if (isFetching) return;
  isFetching = true;

  try {
    const [grades, courses] = await Promise.all([
      fetchSharedGrades(forceRefresh),
      fetchSharedCourses(forceRefresh)
    ]);

    if (grades) gradesCache = grades;
    if (courses) coursesCache = courses;
    fetchError = false;
    hasLoaded = true;
  } catch (err) {
    console.error('Gagal memuat data nilai:', err);
    fetchError = true;
  } finally {
    isFetching = false;
    render();
  }
}

fetchGradesData();

// Ringkasan data nilai & mata kuliah untuk konsumsi Top App Bar / widget lain
export function getGradesSummary() {
  return {
    hasLoaded,
    coursesCount: coursesCache.length,
    ipk: computeIPK(coursesCache, gradesCache),
    creditsSummary: computeCreditsSummary(coursesCache, gradesCache)
  };
}

// Skeleton loader untuk menjaga kestabilan visual saat pertama kali memuat data
function renderSkeleton() {
  return `
    <div class="space-y-4 animate-pulse">
      <!-- IPK Card Skeleton -->
      <div class="bg-base-100 border border-base-200 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-none">
        <div class="space-y-2">
          <div class="h-3 w-20 bg-base-200 dark:bg-slate-800 rounded"></div>
          <div class="h-8 w-16 bg-base-200 dark:bg-slate-800 rounded"></div>
          <div class="h-3 w-40 bg-base-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-base-200 dark:bg-slate-800"></div>
      </div>

      <!-- Course Cards Skeleton -->
      <div class="space-y-3">
        <div class="p-4 bg-base-100 border border-base-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-none">
          <div class="flex justify-between items-center">
            <div class="space-y-1.5">
              <div class="h-4 w-32 bg-base-200 dark:bg-slate-800 rounded"></div>
              <div class="h-3 w-24 bg-base-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div class="h-6 w-20 bg-base-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
          <div class="pt-2 border-t border-base-200 dark:border-slate-800 space-y-2">
            <div class="h-10 bg-base-200/50 dark:bg-slate-800/50 rounded-xl"></div>
            <div class="h-10 bg-base-200/50 dark:bg-slate-800/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function pageGrades() {
  if (!hasLoaded && isFetching) {
    return renderSkeleton();
  }

  if (!hasLoaded && !isFetching) {
    fetchGradesData();
    return renderSkeleton();
  }

  const ipk = computeIPK(coursesCache, gradesCache);
  const creditsSummary = computeCreditsSummary(coursesCache, gradesCache);

  return `
    <div class="space-y-4">
      <!-- 1. Header IPK Berjalan (Material 3 Tonal Surface Container) -->
      <div class="bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-none">
        <div class="min-w-0 pr-3">
          <span class="text-xs uppercase tracking-wider font-semibold text-base-content/60 dark:text-slate-400">IPK Berjalan</span>
          <b class="text-3xl font-display font-extrabold text-base-content dark:text-slate-100 mt-0.5 block">${ipk}</b>
          <p class="text-xs text-base-content/70 dark:text-slate-400 mt-1 font-medium">
            ${creditsSummary.gradedCredits} dari ${creditsSummary.totalCredits} SKS dinilai · ${creditsSummary.gradedCourses} dari ${creditsSummary.totalCourses} matkul
          </p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
          ${ICON.award}
        </div>
      </div>

      <!-- 2. Daftar Nilai Mata Kuliah -->
      <div class="space-y-3">
        ${coursesCache.length ? coursesCache.map(c => {
          const fin = courseFinalScore(gradesCache, c.id);
          const weightSummary = courseWeightSummary(gradesCache, c.id);
          const courseGrades = gradesCache.filter(g => g.course_id != null && c.id != null && String(g.course_id) === String(c.id));
          const badgeClass = fin !== null ? getGradeBadgeClass(fin) : 'bg-base-200 dark:bg-slate-800 border-base-300 dark:border-slate-700 text-base-content/60 dark:text-slate-400';

          return `
            <div class="p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-none">
              <!-- Baris Header Mata Kuliah -->
              <div class="flex justify-between items-start gap-2">
                <div class="min-w-0 flex-1">
                  <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100 truncate">${esc(c.name)}</h4>
                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-base-200 dark:bg-slate-800 text-base-content/70 dark:text-slate-300">${c.credits || 0} SKS</span>
                    ${weightSummary.isComplete ? `
                      <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Bobot: 100% lengkap</span>
                    ` : weightSummary.isOver ? `
                      <span class="text-xs font-semibold text-rose-600 dark:text-rose-400">Bobot: ${weightSummary.totalWeight}% (Kelebihan)</span>
                    ` : weightSummary.totalWeight > 0 ? `
                      <span class="text-xs font-medium text-amber-600 dark:text-amber-400">Bobot: ${weightSummary.totalWeight}% (Sementara)</span>
                    ` : `
                      <span class="text-xs text-base-content/50 dark:text-slate-500">Belum ada komponen</span>
                    `}
                  </div>
                </div>
                <div class="flex-shrink-0 text-right">
                  ${fin !== null ? `
                    <span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${badgeClass}">
                      ${fin.toFixed(1)} (${scoreToLetter(fin)})
                    </span>
                  ` : `
                    <span class="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-base-200 dark:bg-slate-800 border border-base-300 dark:border-slate-700 text-base-content/60 dark:text-slate-400">
                      Belum Ada
                    </span>
                  `}
                </div>
              </div>

              <!-- Daftar Komponen Nilai (Divider Rows dengan 48dp target) -->
              ${courseGrades.length ? `
                <div class="border-t border-base-200 dark:border-slate-800 divide-y divide-base-200/60 dark:divide-slate-800/60 pt-1">
                  ${courseGrades.map(g => `
                    <div onclick="window.openGradeForm('${g.id}')" class="min-h-[48px] py-2 px-2 flex items-center justify-between hover:bg-base-200/40 dark:hover:bg-slate-800/40 active:bg-base-200/60 dark:active:bg-slate-800/60 rounded-xl cursor-pointer transition-colors" title="Klik untuk mengedit komponen nilai">
                      <div class="min-w-0 pr-2">
                        <p class="text-sm font-semibold text-base-content dark:text-slate-200 truncate">${esc(g.component_name)}</p>
                        <p class="text-xs text-base-content/60 dark:text-slate-400">Bobot: <span class="font-medium">${g.weight}%</span></p>
                      </div>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-sm font-bold text-base-content dark:text-slate-100">${g.score}</span>
                        <span class="text-xs font-medium text-base-content/50 dark:text-slate-400">(${scoreToLetter(g.score)})</span>
                        <span class="text-base-content/40 dark:text-slate-500">${ICON.chevR}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Tombol Aksi Tambah Komponen In-Context -->
              <div class="pt-2 border-t border-base-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <button onclick="window.openGradeFormForCourse('${c.id}')" class="btn btn-ghost btn-sm h-10 px-3 text-xs font-semibold text-brand hover:bg-brand/10 dark:hover:bg-brand/20 rounded-xl flex items-center gap-1.5 transition-colors">
                  ${ICON.plus}
                  <span>Tambah Komponen</span>
                </button>
              </div>
            </div>
          `;
        }).join('') : `
          <!-- Empty State Terstruktur & Actionable -->
          <div class="p-8 text-center bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-none">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-base-200 dark:bg-slate-800 text-base-content/40 dark:text-slate-500 flex items-center justify-center">
              ${ICON.book}
            </div>
            <h3 class="font-display font-bold text-sm text-base-content dark:text-slate-100">Belum Ada Mata Kuliah</h3>
            <p class="text-xs text-base-content/60 dark:text-slate-400 max-w-xs mx-auto">
              Tambahkan mata kuliah terlebih dahulu untuk mulai mencatat komponen nilai (UTS, UAS, Tugas) dan menghitung IPK.
            </p>
            <button onclick="App.navigate('courses')" class="btn btn-primary btn-sm h-10 px-4 rounded-xl text-xs font-semibold">
              + Tambah Mata Kuliah
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

// Buka form komponen nilai dengan mata kuliah yang sudah terpilih
window.openGradeFormForCourse = function(courseId) {
  openGradeForm(null, courseId);
};

// Preset komponen nilai standar perguruan tinggi Indonesia
window.applyGradePreset = function(componentName, defaultWeight) {
  const compInput = document.getElementById('f_comp');
  const weightInput = document.getElementById('f_weight');
  if (compInput) compInput.value = componentName;
  if (weightInput && (!weightInput.value || weightInput.value === '30' || weightInput.value === '0')) {
    weightInput.value = defaultWeight;
  }
};

// Form Tambah / Edit Komponen Nilai (Custom Material 3 Modal & Selection Sheet)
export function openGradeForm(gradeId = null, preselectedCourseId = null) {
  // Pastikan data mata kuliah dari shared cache terisi mutakhir
  const shared = getCachedCourses();
  if (shared && shared.length > 0) {
    coursesCache = shared;
  }

  if (coursesCache.length === 0) {
    openSheet('Tambah Komponen Nilai', `
      <div class="space-y-4 text-xs">
        <div class="w-10 h-1 bg-base-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1"></div>
        <div class="text-center p-6 space-y-3">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-base-200 dark:bg-slate-800 text-base-content/40 dark:text-slate-500 flex items-center justify-center">
            ${ICON.book}
          </div>
          <div>
            <h4 class="font-display font-bold text-base text-base-content dark:text-slate-100">Belum Ada Mata Kuliah</h4>
            <p class="text-xs text-base-content/70 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Tambahkan mata kuliah terlebih dahulu sebelum mulai mencatat komponen nilai (UTS, UAS, Tugas).
            </p>
          </div>
          <div class="pt-2 flex flex-col gap-2">
            <button onclick="window.closeSheet(); App.navigate('courses')" class="btn btn-primary h-12 w-full rounded-xl text-xs font-semibold text-white">
              + Tambah Mata Kuliah
            </button>
            <button onclick="window.closeSheet()" class="btn btn-ghost h-12 w-full rounded-xl text-xs font-semibold text-base-content/80 dark:text-slate-300">
              Tutup
            </button>
          </div>
        </div>
      </div>
    `);
    return;
  }

  const existing = gradeId ? gradesCache.find(g => g.id != null && String(g.id) === String(gradeId)) : null;
  const initialCourseId = existing ? existing.course_id : (preselectedCourseId || coursesCache[0]?.id || '');
  const selectedCourse = coursesCache.find(c => String(c.id) === String(initialCourseId)) || coursesCache[0];
  const g = existing || { course_id: initialCourseId, component_name: '', weight: 30, score: 85 };

  openSheet(existing ? 'Edit Komponen Nilai' : 'Tambah Komponen Nilai', `
    <div class="space-y-4 text-xs">
      <!-- 1. VIEW UTAMA: Formulir Komponen Nilai -->
      <div id="grades_form_main" class="space-y-3.5">
        <!-- Drag Affordance M3 -->
        <div class="w-10 h-1 bg-base-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-1"></div>

        <!-- Custom Material 3 Course Picker Trigger (Tanpa native select/radio) -->
        <div>
          <label class="block text-xs font-semibold text-base-content dark:text-slate-200 mb-1.5">Mata Kuliah</label>
          <input type="hidden" id="f_course" value="${selectedCourse ? selectedCourse.id : ''}" />
          <button 
            type="button" 
            id="trigger_course_picker" 
            class="w-full min-h-[52px] px-3.5 py-2.5 rounded-2xl border border-base-300 dark:border-slate-700 bg-base-100 dark:bg-slate-800/80 hover:bg-base-200/50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
            aria-haspopup="listbox"
            aria-label="Pilih Mata Kuliah"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-indigo-300 flex items-center justify-center shrink-0">
                ${ICON.book}
              </div>
              <div class="min-w-0">
                <span id="course_display_name" class="font-semibold text-sm text-base-content dark:text-slate-100 block truncate">
                  ${esc(selectedCourse ? selectedCourse.name : 'Pilih Mata Kuliah')}
                </span>
                <span id="course_display_sub" class="text-xs text-base-content/70 dark:text-slate-400 block truncate">
                  ${selectedCourse ? `${selectedCourse.credits || 0} SKS ${selectedCourse.lecturer ? '· ' + esc(selectedCourse.lecturer) : ''}` : 'Sentuh untuk memilih'}
                </span>
              </div>
            </div>
            <span class="text-base-content/40 dark:text-slate-500 shrink-0 ml-2">${ICON.chevR}</span>
          </button>
        </div>

        <!-- Preset Komponen Cepat -->
        <div>
          <label class="block text-xs font-semibold text-base-content dark:text-slate-200 mb-1.5">Preset Komponen Cepat</label>
          <div class="flex flex-wrap gap-1.5">
            <button type="button" onclick="window.applyGradePreset('UTS', 30)" class="btn btn-xs h-8 px-2.5 rounded-lg border border-base-300 dark:border-slate-700 bg-base-200/60 dark:bg-slate-800 text-base-content dark:text-slate-200 font-medium text-xs hover:border-brand transition-colors">UTS (30%)</button>
            <button type="button" onclick="window.applyGradePreset('UAS', 35)" class="btn btn-xs h-8 px-2.5 rounded-lg border border-base-300 dark:border-slate-700 bg-base-200/60 dark:bg-slate-800 text-base-content dark:text-slate-200 font-medium text-xs hover:border-brand transition-colors">UAS (35%)</button>
            <button type="button" onclick="window.applyGradePreset('Tugas', 20)" class="btn btn-xs h-8 px-2.5 rounded-lg border border-base-300 dark:border-slate-700 bg-base-200/60 dark:bg-slate-800 text-base-content dark:text-slate-200 font-medium text-xs hover:border-brand transition-colors">Tugas (20%)</button>
            <button type="button" onclick="window.applyGradePreset('Praktikum', 20)" class="btn btn-xs h-8 px-2.5 rounded-lg border border-base-300 dark:border-slate-700 bg-base-200/60 dark:bg-slate-800 text-base-content dark:text-slate-200 font-medium text-xs hover:border-brand transition-colors">Praktikum (20%)</button>
            <button type="button" onclick="window.applyGradePreset('Kuis', 15)" class="btn btn-xs h-8 px-2.5 rounded-lg border border-base-300 dark:border-slate-700 bg-base-200/60 dark:bg-slate-800 text-base-content dark:text-slate-200 font-medium text-xs hover:border-brand transition-colors">Kuis (15%)</button>
            <button type="button" onclick="window.applyGradePreset('Presensi', 10)" class="btn btn-xs h-8 px-2.5 rounded-lg border border-base-300 dark:border-slate-700 bg-base-200/60 dark:bg-slate-800 text-base-content dark:text-slate-200 font-medium text-xs hover:border-brand transition-colors">Presensi (10%)</button>
          </div>
        </div>

        <!-- Nama Komponen Input -->
        <div>
          <label class="block text-xs font-semibold text-base-content dark:text-slate-200 mb-1.5">Nama Komponen</label>
          <input id="f_comp" class="input input-bordered w-full h-12 text-sm rounded-xl bg-base-100 dark:bg-slate-800/80 border-base-300 dark:border-slate-700 text-base-content dark:text-slate-100 focus:border-brand" value="${esc(g.component_name || '')}" placeholder="Contoh: UTS, UAS, Tugas 1, Laporan Praktikum" />
        </div>

        <!-- Grid Bobot & Nilai -->
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-semibold text-base-content dark:text-slate-200 mb-1.5">Bobot (1–100%)</label>
            <input type="number" id="f_weight" min="1" max="100" class="input input-bordered w-full h-12 text-sm rounded-xl bg-base-100 dark:bg-slate-800/80 border-base-300 dark:border-slate-700 text-base-content dark:text-slate-100 focus:border-brand" value="${g.weight}" placeholder="30" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-base-content dark:text-slate-200 mb-1.5">Nilai (0–100)</label>
            <input type="number" id="f_score" min="0" max="100" class="input input-bordered w-full h-12 text-sm rounded-xl bg-base-100 dark:bg-slate-800/80 border-base-300 dark:border-slate-700 text-base-content dark:text-slate-100 focus:border-brand" value="${g.score}" placeholder="85" />
          </div>
        </div>

        <!-- Tombol Aksi Form -->
        <div class="flex gap-2.5 pt-2">
          ${existing ? `
            <button type="button" id="btnOpenDeleteConfirm" class="btn btn-error btn-outline h-12 flex-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
              ${ICON.trash}
              <span>Hapus</span>
            </button>
          ` : `
            <button type="button" onclick="window.closeSheet()" class="btn btn-ghost h-12 flex-1 rounded-xl text-xs font-semibold text-base-content/80 dark:text-slate-300">
              Batal
            </button>
          `}
          <button type="button" class="btn btn-primary h-12 flex-1 rounded-xl text-xs font-semibold text-white" id="btnSaveG">
            ${existing ? 'Simpan Perubahan' : 'Simpan Nilai'}
          </button>
        </div>
      </div>

      <!-- 2. SUB-VIEW: Material 3 Selection Sheet untuk Mata Kuliah -->
      <div id="grades_sub_sheet" class="hidden"></div>

      <!-- 3. SUB-VIEW: Material 3 Konfirmasi Hapus In-Sheet -->
      <div id="grades_del_confirm" class="hidden"></div>
    </div>
  `);

  const mainView = document.getElementById('grades_form_main');
  const sheetTitle = document.getElementById('sheetTitle');
  const triggerBtn = document.getElementById('trigger_course_picker');
  const saveBtn = document.getElementById('btnSaveG');
  const openDelBtn = document.getElementById('btnOpenDeleteConfirm');

  // Helper pembaruan tampilan Course Trigger UI
  function updateCourseSelection(courseId) {
    const course = coursesCache.find(c => String(c.id) === String(courseId));
    if (!course) return;

    const hiddenInput = document.getElementById('f_course');
    const nameEl = document.getElementById('course_display_name');
    const subEl = document.getElementById('course_display_sub');

    if (hiddenInput) hiddenInput.value = course.id;
    if (nameEl) nameEl.textContent = course.name;
    if (subEl) subEl.textContent = `${course.credits || 0} SKS ${course.lecturer ? '· ' + course.lecturer : ''}`;
  }

  // Transisi: Buka Course Selection Sheet dengan Reusable M3 Course Picker
  if (triggerBtn) {
    triggerBtn.onclick = () => {
      openCoursePicker({
        containerId: 'grades_sub_sheet',
        mainViewId: 'grades_form_main',
        currentVal: document.getElementById('f_course')?.value,
        allowEmpty: false,
        onSelect: (courseId) => {
          updateCourseSelection(courseId);
          if (sheetTitle) sheetTitle.textContent = existing ? 'Edit Komponen Nilai' : 'Tambah Komponen Nilai';
        },
        onBack: () => {
          if (sheetTitle) sheetTitle.textContent = existing ? 'Edit Komponen Nilai' : 'Tambah Komponen Nilai';
        }
      });
    };
  }

  // Transisi: Buka Konfirmasi Hapus In-Sheet dengan Reusable M3 Delete Confirmation
  if (openDelBtn && existing) {
    openDelBtn.onclick = () => {
      const compVal = document.getElementById('f_comp')?.value.trim() || 'Komponen Nilai';
      const course = coursesCache.find(c => String(c.id) === String(document.getElementById('f_course')?.value));
      const courseName = course ? course.name : 'Mata Kuliah';
      const scoreVal = document.getElementById('f_score')?.value || existing.score;
      const weightVal = document.getElementById('f_weight')?.value || existing.weight;

      openDeleteConfirmation({
        containerId: 'grades_del_confirm',
        mainViewId: 'grades_form_main',
        title: 'Hapus Komponen Nilai?',
        entityName: 'Komponen Nilai',
        entityDetailsHtml: `
          <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">${esc(courseName)}</div>
          <div class="font-display font-bold text-sm text-base-content dark:text-slate-100">${esc(compVal)} · ${weightVal}%</div>
          <div class="text-xs text-base-content/80 dark:text-slate-300 mt-0.5">Nilai saat ini: <span class="font-bold text-base-content dark:text-slate-100">${scoreVal}</span></div>
        `,
        warningText: 'Tindakan ini permanen. Kalkulasi IPK dan nilai akhir mata kuliah ini akan disesuaikan secara otomatis.',
        onCancel: () => {
          if (sheetTitle) sheetTitle.textContent = 'Edit Komponen Nilai';
        },
        onConfirm: async () => {
          const { error } = await supabase.from('grades').delete().eq('id', existing.id);
          if (!error) {
            closeSheet();
            showToast('Komponen nilai berhasil dihapus');
            await invalidateGradesCache();
          } else {
            showToast('Gagal menghapus nilai: ' + error.message, true);
          }
        }
      });
    };
  }

  // Simpan Komponen Nilai (Tambah / Edit)
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const course_id = document.getElementById('f_course')?.value;
      const component_name = document.getElementById('f_comp')?.value.trim() || 'Nilai';
      const weightVal = Number(document.getElementById('f_weight')?.value);
      const scoreVal = Number(document.getElementById('f_score')?.value);

      if (!course_id) {
        showToast('Pilih mata kuliah terlebih dahulu', true);
        return;
      }

      if (isNaN(weightVal) || weightVal <= 0 || weightVal > 100) {
        showToast('Bobot harus berupa angka antara 1% hingga 100%', true);
        return;
      }

      if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
        showToast('Nilai harus berupa angka antara 0 hingga 100', true);
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Menyimpan...';

      const payload = {
        course_id,
        component_name,
        weight: weightVal,
        score: scoreVal
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (user) payload.user_id = user.id;

      let error = null;
      if (existing && existing.id) {
        const res = await supabase.from('grades').update(payload).eq('id', existing.id);
        error = res.error;
      } else {
        const res = await supabase.from('grades').insert([payload]);
        error = res.error;
      }

      if (!error) {
        closeSheet();
        showToast(existing ? 'Komponen nilai berhasil diperbarui' : 'Komponen nilai berhasil ditambahkan');
        await invalidateGradesCache();
      } else {
        showToast('Gagal menyimpan nilai: ' + error.message, true);
        saveBtn.disabled = false;
        saveBtn.textContent = existing ? 'Simpan Perubahan' : 'Simpan Nilai';
      }
    };
  }
}

window.openGradeForm = openGradeForm;
App.openGradeForm = () => openGradeForm(null);