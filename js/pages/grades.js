/**
 * pages/grades.js
 * Halaman nilai akademik & IPK (Supabase Edition) - Klik card kosong untuk hapus/kelola matkul.
 */
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

let gradesCache = [];
let coursesCache = [];
let isFetching = false;

async function fetchGradesData() {
  if (isFetching) return;
  isFetching = true;

  const [gradeRes, crsRes] = await Promise.all([
    supabase.from('grades').select('*').order('created_at', { ascending: false }),
    supabase.from('courses').select('*').order('created_at', { ascending: false })
  ]);

  if (!gradeRes.error && gradeRes.data) gradesCache = gradeRes.data;
  if (!crsRes.error && crsRes.data) coursesCache = crsRes.data;

  isFetching = false;
  render();
}

fetchGradesData();

function scoreToLetter(score) {
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

function letterToPoint(letter) {
  switch (letter) {
    case 'A': return 4.0;
    case 'A-': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'B-': return 2.7;
    case 'C+': return 2.3;
    case 'C': return 2.0;
    case 'D': return 1.0;
    default: return 0.0;
  }
}

function courseFinalScore(courseId) {
  const courseGrades = gradesCache.filter(g => g.course_id === courseId);
  if (courseGrades.length === 0) return null;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const g of courseGrades) {
    const weight = Number(g.weight) || 0;
    const score = Number(g.score) || 0;
    totalWeightedScore += score * (weight / 100);
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    return totalWeightedScore * (100 / totalWeight);
  } else {
    const sum = courseGrades.reduce((acc, curr) => acc + Number(curr.score), 0);
    return sum / courseGrades.length;
  }
}

function computeIPK() {
  if (coursesCache.length === 0) return '-';

  let totalPoints = 0;
  let totalCredits = 0;
  let hasValidGrade = false;

  for (const c of coursesCache) {
    const fin = courseFinalScore(c.id);
    if (fin !== null) {
      hasValidGrade = true;
      const letter = scoreToLetter(fin);
      const point = letterToPoint(letter);
      const credits = Number(c.credits) || 0;
      totalPoints += point * credits;
      totalCredits += credits;
    }
  }

  if (!hasValidGrade || totalCredits === 0) return '-';
  return (totalPoints / totalCredits).toFixed(2);
}

export function pageGrades() {
  if (!coursesCache.length && !isFetching) {
    fetchGradesData();
  }

  const ipk = computeIPK();

  return `
    <div class="bg-gradient-to-r from-warning/20 to-warning/5 border border-warning/30 p-4 rounded-2xl flex justify-between items-center mb-4">
      <div>
        <span class="text-xs text-base-content/60 font-medium">IPK Berjalan</span>
        <b class="text-2xl block font-extrabold text-warning">${ipk}</b>
      </div>
      <div class="text-warning">${ICON.award || '🏆'}</div>
    </div>

    <div class="space-y-2">
      ${coursesCache.length ? coursesCache.map(c => {
        const fin = courseFinalScore(c.id);
        const courseGrades = gradesCache.filter(g => g.course_id === c.id);

        // Jika belum ada nilai, klik card utamanya langsung memunculkan opsi tambah nilai atau hapus matkul
        const clickAction = courseGrades.length === 0 
          ? `window.openEmptyCourseOptions('${c.id}', '${esc(c.name)}')` 
          : '';

        return `
          <div onclick="${clickAction}" class="p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-2 ${courseGrades.length === 0 ? 'cursor-pointer hover:border-primary/50 transition-all' : ''}">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-bold text-xs">${esc(c.name)}</h4>
                <span class="text-[10px] text-base-content/50">${c.credits || 0} SKS</span>
              </div>
              <div>
                ${fin !== null ? `<span class="badge badge-success font-bold">${fin.toFixed(1)} (${scoreToLetter(fin)})</span>` : `<span class="badge badge-ghost text-[10px]">Belum Ada</span>`}
              </div>
            </div>

            <!-- Daftar Komponen Nilai (Jika ada isinya, bisa diklik per baris) -->
            ${courseGrades.length ? `
              <div class="pt-2 border-t border-base-200 space-y-1">
                ${courseGrades.map(g => `
                  <div onclick="window.openGradeForm('${g.id}')" class="text-[11px] bg-base-200/50 hover:bg-base-200 active:scale-[0.99] px-3 py-2 rounded-xl cursor-pointer transition-all">
                    <span class="font-semibold">${esc(g.component_name)}</span>
                    <span class="text-base-content/60 ml-1">(${g.weight}%): <b>${g.score}</b></span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty || '📂'}Belum ada mata kuliah</div>`}
    </div>
  `;
}

// Pop-up pilihan jika card mata kuliah kosong diklik (bisa tambah nilai atau hapus mata kuliah dari database)
window.openEmptyCourseOptions = function(courseId, courseName) {
  openSheet(`Atur: ${courseName}`, `
    <div class="space-y-3 text-xs">
      <p class="text-base-content/70">Mata kuliah ini belum memiliki komponen nilai.</p>
      <div class="flex flex-col gap-2">
        <button onclick="window.closeSheet(); window.openGradeFormForCourse('${courseId}')" class="btn btn-primary btn-sm w-full">+ Tambah Komponen Nilai</button>
        <button onclick="window.confirmDeleteCourse('${courseId}', '${esc(courseName)}')" class="btn btn-error btn-sm btn-outline w-full">🗑️ Hapus Mata Kuliah Ini</button>
      </div>
    </div>
  `);
};

window.openGradeFormForCourse = function(courseId) {
  window.openGradeForm();
  setTimeout(() => {
    const sel = document.getElementById('f_course');
    if (sel) sel.value = courseId;
  }, 50);
};

window.confirmDeleteCourse = function(courseId, courseName) {
  openSheet('Hapus Mata Kuliah', `
    <div class="space-y-4 text-xs">
      <p>Yakin ingin menghapus mata kuliah <b>${courseName}</b>?</p>
      <div class="flex gap-2">
        <button class="btn btn-neutral btn-sm flex-1" onclick="window.closeSheet()">Batal</button>
        <button class="btn btn-error btn-sm flex-1" id="delCourseBtn">Ya, Hapus</button>
      </div>
    </div>
  `);

  document.getElementById('delCourseBtn').onclick = async () => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (!error) {
      closeSheet();
      fetchGradesData();
    } else {
      alert('Gagal menghapus mata kuliah: ' + error.message);
    }
  };
};

// Fungsi Form Edit & Hapus Komponen Nilai
export function openGradeForm(gradeId = null) {
  const existing = gradeId ? gradesCache.find(g => g.id === gradeId) : null;
  const g = existing || { course_id: coursesCache[0]?.id || '', component_name: '', weight: 30, score: 85 };

  openSheet(existing ? 'Edit Komponen Nilai' : 'Tambah Nilai', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          ${coursesCache.map(c => `<option value="${c.id}" ${g.course_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label label-text font-bold">Komponen (UTS / UAS / Tugas)</label>
        <input id="f_comp" class="input input-bordered input-sm w-full" value="${esc(g.component_name || '')}" placeholder="Contoh: UTS" />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">Bobot (%)</label>
          <input type="number" id="f_weight" class="input input-bordered input-sm w-full" value="${g.weight}" />
        </div>
        <div>
          <label class="label label-text font-bold">Nilai (0-100)</label>
          <input type="number" id="f_score" class="input input-bordered input-sm w-full" value="${g.score}" />
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelG">🗑️ Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveG">Simpan</button>
      </div>
    </div>
  `);

  document.getElementById('btnSaveG').onclick = async () => {
    const course_id = document.getElementById('f_course').value;
    const component_name = document.getElementById('f_comp').value.trim() || 'Nilai';
    const weight = Number(document.getElementById('f_weight').value) || 0;
    const score = Number(document.getElementById('f_score').value) || '0';

    if (!course_id) {
      alert('Pilih mata kuliah terlebih dahulu!');
      return;
    }

    const payload = { course_id, component_name, weight, score };
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
      fetchGradesData();
    } else {
      alert('Gagal menyimpan nilai: ' + error.message);
    }
  };

  if (existing) {
    document.getElementById('btnDelG').onclick = () => {
      openSheet('Hapus Nilai', `
        <div class="space-y-4 text-xs">
          <p>Yakin ingin menghapus nilai ini?</p>
          <div class="flex gap-2">
            <button class="btn btn-neutral btn-sm flex-1" onclick="window.closeSheet()">Batal</button>
            <button class="btn btn-error btn-sm flex-1" id="confirmDelG">Ya, Hapus</button>
          </div>
        </div>
      `);

      document.getElementById('confirmDelG').onclick = async () => {
        const { error } = await supabase.from('grades').delete().eq('id', existing.id);
        if (!error) {
          closeSheet();
          fetchGradesData();
        } else {
          alert('Gagal menghapus nilai: ' + error.message);
        }
      };
    };
  }
}

window.openGradeForm = openGradeForm;