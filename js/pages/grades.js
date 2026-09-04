/**
 * pages/grades.js
 * Halaman nilai akademik & IPK (Supabase Edition) + form tambah komponen nilai.
 */
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

let gradesCache = [];
let coursesCache = [];
let isFetching = false;

// Ambil data nilai dan mata kuliah dari Supabase
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

// Panggil saat pertama kali dimuat
fetchGradesData();

// Helper konversi nilai angka ke huruf
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

// Helper konversi huruf kebobot IPK (Skala 4.0)
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

// Hitung nilai akhir per mata kuliah berdasarkan bobot
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

  // Jika bobot total diisi, hitung proporsional. Jika tidak, ambil rata-rata biasa.
  if (totalWeight > 0) {
    return totalWeightedScore * (100 / totalWeight);
  } else {
    const sum = courseGrades.reduce((acc, curr) => acc + Number(curr.score), 0);
    return sum / courseGrades.length;
  }
}

// Hitung IPK Berjalan
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
        return `
          <div class="p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm flex justify-between items-center">
            <div>
              <h4 class="font-bold text-xs">${esc(c.name)}</h4>
              <span class="text-[10px] text-base-content/50">${c.credits || 0} SKS</span>
            </div>
            <div>
              ${fin !== null ? `<span class="badge badge-success font-bold">${fin.toFixed(1)} (${scoreToLetter(fin)})</span>` : `<span class="badge badge-ghost text-[10px]">Belum Ada</span>`}
            </div>
          </div>
        `;
      }).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty || '📂'}Belum ada mata kuliah</div>`}
    </div>
  `;
}

// Fungsi Global untuk Membuka Form Tambah Nilai
window.openGradeForm = function() {
  openSheet('Tambah Nilai', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          ${coursesCache.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label label-text font-bold">Komponen (UTS / UAS / Tugas)</label>
        <input id="f_comp" class="input input-bordered input-sm w-full" placeholder="Contoh: UTS" />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">Bobot (%)</label>
          <input type="number" id="f_weight" class="input input-bordered input-sm w-full" value="30" />
        </div>
        <div>
          <label class="label label-text font-bold">Nilai (0-100)</label>
          <input type="number" id="f_score" class="input input-bordered input-sm w-full" value="85" />
        </div>
      </div>
      <button class="btn btn-primary btn-sm mt-4 w-full" id="btnSaveG">Simpan</button>
    </div>
  `);

  document.getElementById('btnSaveG').onclick = async () => {
    const course_id = document.getElementById('f_course').value;
    const component_name = document.getElementById('f_comp').value.trim() || 'Nilai';
    const weight = Number(document.getElementById('f_weight').value) || 0;
    const score = Number(document.getElementById('f_score').value) || 0;

    if (!course_id) {
      alert('Pilih mata kuliah terlebih dahulu!');
      return;
    }

    const payload = {
      course_id,
      component_name,
      weight,
      score
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    const { error } = await supabase.from('grades').insert([payload]);

    if (!error) {
      closeSheet();
      fetchGradesData();
    } else {
      alert('Gagal menyimpan nilai: ' + error.message);
    }
  };
};

App.openGradeForm = window.openGradeForm;