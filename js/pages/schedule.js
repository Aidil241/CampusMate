/**
 * pages/schedule.js
 * Halaman jadwal mingguan (per hari) + form tambah/edit jadwal (Supabase Edition).
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc, fmtTime } from '../utils/format.js';
import { DAYS } from '../utils/date.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

let schedulesCache = [];
let coursesCache = [];
let isFetching = false;

// Fungsi untuk menarik data jadwal & mata kuliah terbaru dari Supabase
async function fetchScheduleData() {
  if (isFetching) return;
  isFetching = true;

  const [schRes, crsRes] = await Promise.all([
    supabase.from('schedules').select('*').order('start_time', { ascending: true }),
    supabase.from('courses').select('*').order('created_at', { ascending: false })
  ]);

  if (!schRes.error && schRes.data) schedulesCache = schRes.data;
  if (!crsRes.error && crsRes.data) coursesCache = crsRes.data;

  isFetching = false;
  render();
}

// Panggil saat file pertama kali dimuat
fetchScheduleData();

// Helper untuk mencari nama mata kuliah berdasarkan ID dari cache
function getCourseName(courseId) {
  const found = coursesCache.find(c => c.id === courseId);
  return found ? found.name : 'Mata Kuliah Dihapus';
}

export function pageSchedule() {
  if (!schedulesCache.length && !isFetching) {
    fetchScheduleData();
  }

  const list = schedulesCache.filter(s => s.day === state.schedDay);

  return `
    <div class="flex gap-1 overflow-x-auto pb-2 mb-4">
      ${DAYS.map(d => `<button onclick="App.setSchedDay('${d}')" class="btn btn-xs ${state.schedDay === d ? 'btn-primary' : 'btn-ghost border-base-300'}">${d}</button>`).join('')}
    </div>
    <div class="space-y-2">
      ${list.length ? list.map(sc => `
        <div onclick="App.editSched('${sc.id}')" class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm cursor-pointer">
          <div class="text-center font-bold text-xs text-brand pr-3 border-r border-base-200">
            ${fmtTime(sc.start_time)}<small class="block text-[9px] text-base-content/50">${fmtTime(sc.end_time)}</small>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs truncate">${esc(getCourseName(sc.course_id))}</h4>
            <p class="text-[11px] text-base-content/60">${esc(sc.room || '-')}</p>
          </div>
        </div>
      `).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Tidak ada kelas di hari ${state.schedDay}</div>`}
    </div>
  `;
}

App.setSchedDay = (d) => { state.schedDay = d; render(); };
App.editSched = (id) => {
  const scheduleObj = schedulesCache.find(s => s.id === id);
  window.openScheduleForm(scheduleObj);
};

window.openScheduleForm = function(scheduleObj = null) {
  const s = scheduleObj || { course_id: '', day: state.schedDay || 'Senin', start_time: '', end_time: '', room: '' };

  openSheet(scheduleObj ? 'Edit Jadwal' : 'Tambah Jadwal', `
    <div class="form-control gap-3 text-xs">
      <div id="sch_alert" class="hidden bg-error/20 border border-error text-error px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
        ⚠️ Peringatan: Mata Kuliah wajib dipilih!
      </div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_s_course" class="select select-bordered select-sm w-full">
          <option value="">Pilih Mata Kuliah...</option>
          ${coursesCache.map(c => `<option value="${c.id}" ${s.course_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label label-text font-bold">Hari</label>
        <select id="f_s_day" class="select select-bordered select-sm w-full">
          ${DAYS.map(d => `<option value="${d}" ${s.day === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">Mulai</label>
          <input type="time" id="f_s_start" class="input input-bordered input-sm w-full" value="${s.start_time || ''}" />
        </div>
        <div>
          <label class="label label-text font-bold">Selesai</label>
          <input type="time" id="f_s_end" class="input input-bordered input-sm w-full" value="${s.end_time || ''}" />
        </div>
      </div>
      <div>
        <label class="label label-text font-bold">Ruangan</label>
        <input id="f_s_room" class="input input-bordered input-sm w-full" value="${s.room || ''}" placeholder="Contoh: Lab Komputer" />
      </div>
      <div class="flex gap-2 mt-4">
        ${scheduleObj ? `<button class="btn btn-error btn-sm flex-1" id="btnDelSch">🗑️ Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveSch">Simpan</button>
      </div>
    </div>
  `);

  document.getElementById('btnSaveSch').onclick = async () => {
    const course_id = document.getElementById('f_s_course').value;
    
    if (!course_id) {
      const alertBox = document.getElementById('sch_alert');
      alertBox.classList.remove('hidden');
      setTimeout(() => { if(alertBox) alertBox.classList.add('hidden'); }, 3000);
      return;
    }

    const payload = {
      course_id,
      day: document.getElementById('f_s_day').value,
      start_time: document.getElementById('f_s_start').value,
      end_time: document.getElementById('f_s_end').value,
      room: document.getElementById('f_s_room').value
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    if (scheduleObj && scheduleObj.id) {
      await supabase.from('schedules').update(payload).eq('id', scheduleObj.id);
    } else {
      await supabase.from('schedules').insert([payload]);
    }

    closeSheet();
    fetchScheduleData();
  };

  if (scheduleObj) {
    document.getElementById('btnDelSch').onclick = async () => {
      openSheet('Hapus Jadwal', `
        <div class="space-y-4 text-xs">
          <p>Yakin ingin menghapus jadwal ini?</p>
          <div class="flex gap-2">
            <button class="btn btn-neutral btn-sm flex-1" id="cancelDelSch">Batal</button>
            <button class="btn btn-error btn-sm flex-1" id="confirmDelSch">Ya, Hapus</button>
          </div>
        </div>
      `);
      document.getElementById('cancelDelSch').onclick = () => window.openScheduleForm(scheduleObj);
      document.getElementById('confirmDelSch').onclick = async () => {
        await supabase.from('schedules').delete().eq('id', scheduleObj.id);
        closeSheet();
        fetchScheduleData();
      };
    };
  }
}

// Tambahkan tombol global untuk membuka form tambah jadwal jika dibutuhkan UI
App.openScheduleForm = () => window.openScheduleForm(null);