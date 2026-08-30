/**
 * pages/grades.js
 * Halaman nilai akademik & IPK + form tambah komponen nilai.
 */
import { DB } from '../data/db.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { computeIPK, courseFinalScore, scoreToLetter } from '../utils/grades.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

export function pageGrades() {
  const courses = DB.courses.all();
  const ipk = computeIPK();
  return `
    <div class="bg-gradient-to-r from-warning/20 to-warning/5 border border-warning/30 p-4 rounded-2xl flex justify-between items-center mb-4">
      <div><span class="text-xs text-base-content/60 font-medium">IPK Berjalan</span><b class="text-2xl block font-extrabold text-warning">${ipk ?? '-'}</b></div>
      <div class="text-warning">${ICON.award}</div>
    </div>
    <div class="space-y-2">
      ${courses.length ? courses.map(c => {
        const fin = courseFinalScore(c.id);
        return `<div class="p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm flex justify-between items-center">
          <div><h4 class="font-bold text-xs">${esc(c.name)}</h4><span class="text-[10px] text-base-content/50">${c.credits} SKS</span></div>
          ${fin !== null ? `<span class="badge badge-success font-bold">${fin.toFixed(1)} (${scoreToLetter(fin)})</span>` : `<span class="badge badge-ghost text-[10px]">Belum Ada</span>`}
        </div>`;
      }).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Belum ada mata kuliah</div>`}
    </div>
  `;
}

export function openGradeForm() {
  openSheet('Tambah Nilai', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          ${DB.courses.all().map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div><label class="label label-text font-bold">Komponen (UTS/UAS/Tugas)</label><input id="f_comp" class="input input-bordered input-sm w-full" placeholder="UTS" /></div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="label label-text font-bold">Bobot (%)</label><input type="number" id="f_weight" class="input input-bordered input-sm w-full" value="30" /></div>
        <div><label class="label label-text font-bold">Nilai (0-100)</label><input type="number" id="f_score" class="input input-bordered input-sm w-full" value="85" /></div>
      </div>
      <button class="btn btn-primary btn-sm mt-4 w-full" id="btnSaveG">Simpan</button>
    </div>
  `);
  document.getElementById('btnSaveG').onclick = () => {
    DB.grades.save({
      course_id: document.getElementById('f_course').value,
      component: document.getElementById('f_comp').value || 'Nilai',
      weight: Number(document.getElementById('f_weight').value),
      score: Number(document.getElementById('f_score').value)
    });
    closeSheet(); render();
  };
}
