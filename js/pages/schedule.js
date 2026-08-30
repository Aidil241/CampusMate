/**
 * pages/schedule.js
 * Halaman jadwal mingguan (per hari) + form tambah/edit jadwal.
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { DB } from '../data/db.js';
import { ICON } from '../utils/icons.js';
import { esc, courseName, fmtTime } from '../utils/format.js';
import { DAYS, todayDayName } from '../utils/date.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

export function pageSchedule() {
  const all = DB.schedules.all();
  const list = all.filter(s => s.day === state.schedDay);
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
            <h4 class="font-bold text-xs truncate">${esc(courseName(sc.course_id))}</h4>
            <p class="text-[11px] text-base-content/60">${esc(sc.room || '-')}</p>
          </div>
        </div>
      `).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Tidak ada kelas di hari ${state.schedDay}</div>`}
    </div>
  `;
}
App.setSchedDay = (d) => { state.schedDay = d; render(); };
App.editSched = (id) => openScheduleForm(DB.schedules.find(id));

export function openScheduleForm(existing) {
  const s = existing || { course_id: '', day: todayDayName(), start_time: '08:00', end_time: '09:40', room: '' };
  openSheet(existing ? 'Edit Jadwal' : 'Tambah Jadwal', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          ${DB.courses.all().map(c => `<option value="${c.id}" ${s.course_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label label-text font-bold">Hari</label>
        <select id="f_day" class="select select-bordered select-sm w-full">
          ${DAYS.map(d => `<option ${s.day === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="label label-text font-bold">Mulai</label><input type="time" id="f_start" class="input input-bordered input-sm w-full" value="${s.start_time}" /></div>
        <div><label class="label label-text font-bold">Selesai</label><input type="time" id="f_end" class="input input-bordered input-sm w-full" value="${s.end_time}" /></div>
      </div>
      <div><label class="label label-text font-bold">Ruangan</label><input id="f_room" class="input input-bordered input-sm w-full" value="${esc(s.room)}" /></div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelS">${ICON.trash} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveS">Simpan</button>
      </div>
    </div>
  `);
  document.getElementById('btnSaveS').onclick = () => {
    DB.schedules.save({
      id: s.id, course_id: document.getElementById('f_course').value,
      day: document.getElementById('f_day').value,
      start_time: document.getElementById('f_start').value,
      end_time: document.getElementById('f_end').value,
      room: document.getElementById('f_room').value
    });
    closeSheet(); render();
  };
  if (existing) document.getElementById('btnDelS').onclick = () => { DB.schedules.remove(s.id); closeSheet(); render(); };
}
