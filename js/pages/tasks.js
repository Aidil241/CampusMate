/**
 * pages/tasks.js
 * Halaman daftar tugas (dengan filter status & pencarian) + form tambah/edit tugas.
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { DB } from '../data/db.js';
import { ICON } from '../utils/icons.js';
import { esc, courseName, deadlineBadge, priorityBadgeClass } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { navigate } from '../core/router.js';

export function pageTasks() {
  let list = DB.tasks.all();
  if (state.taskFilterStatus !== 'Semua') list = list.filter(t => t.status === state.taskFilterStatus);
  return `
    <!-- Kolom Pencarian -->
    <div class="relative mb-3">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
        ${ICON.search}
      </div>
      <input type="text" placeholder="Cari judul tugas atau matkul..." class="input input-bordered input-sm w-full pl-9 bg-base-100" oninput="App.searchData(this.value, '.task-item')" />
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2 mb-4">
      ${['Semua', 'Belum dikerjakan', 'Sedang dikerjakan', 'Selesai'].map(s => `
        <button onclick="App.setTaskFilter('${s}')" class="btn btn-xs ${state.taskFilterStatus === s ? 'btn-primary' : 'btn-ghost border-base-300'}">${s}</button>
      `).join('')}
    </div>

    <div class="space-y-2">
      ${list.length ? list.map(t => {
        const b = deadlineBadge(t.deadline, t.status);
        return `<div class="task-item flex items-start gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm transition-all">
          <input type="checkbox" ${t.status === 'Selesai' ? 'checked' : ''} onclick="App.toggleTask('${t.id}')" class="checkbox checkbox-sm checkbox-primary mt-0.5" />
          <div class="flex-1 min-w-0 cursor-pointer" onclick="App.editTask('${t.id}')">
            <h4 class="font-bold text-xs ${t.status === 'Selesai' ? 'line-through opacity-40' : ''}">${esc(t.title)}</h4>
            <div class="flex gap-1.5 mt-1 flex-wrap items-center">
              <span class="text-[10px] text-base-content/60">${esc(courseName(t.course_id))}</span>
              <span class="badge ${b.cls} badge-xs font-semibold">${b.text}</span>
              <span class="badge ${priorityBadgeClass(t.priority)} badge-xs">${t.priority}</span>
            </div>
          </div>
        </div>`;
      }).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Belum ada tugas</div>`}
    </div>
  `;
}

App.setTaskFilter = (s) => { state.taskFilterStatus = s; render(); };
App.toggleTask = (id) => {
  const t = DB.tasks.find(id); if (!t) return;
  t.status = t.status === 'Selesai' ? 'Belum dikerjakan' : 'Selesai';
  DB.tasks.save(t); render();
};
App.editTask = (id) => openTaskForm(DB.tasks.find(id));

window.openTaskForm = function(taskObj = null) {
  const t = taskObj || { title: '', course_id: '', deadline: '', priority: 'Sedang', status: 'Belum dikerjakan' };

  openSheet(taskObj ? 'Edit Tugas' : 'Tambah Tugas', `
    <div class="form-control gap-3 text-xs">
      <div id="task_alert" class="hidden bg-error/20 border border-error text-error px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
        ⚠️ Peringatan: Judul Tugas wajib diisi!
      </div>
      <div>
        <label class="label label-text font-bold">Judul Tugas</label>
        <input id="f_t_title" class="input input-bordered input-sm w-full" value="${t.title || ''}" placeholder="Contoh: Membuat Makalah" />
      </div>
      <div>
        <label class="label label-text font-bold">ID / Mata Kuliah</label>
        <input id="f_t_course" class="input input-bordered input-sm w-full" value="${t.course_id || ''}" placeholder="Contoh: IF101" />
      </div>
      <div>
        <label class="label label-text font-bold">Tenggat Waktu (Deadline)</label>
        <!-- Menggunakan ID f_t_deadline agar cocok -->
        <input type="date" id="f_t_deadline" class="input input-bordered input-sm w-full" value="${t.deadline || ''}" />
      </div>
      <div>
        <label class="label label-text font-bold">Prioritas</label>
        <select id="f_t_priority" class="select select-bordered select-sm w-full">
          ${['Rendah', 'Sedang', 'Tinggi'].map(p => `<option value="${p}" ${t.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="flex gap-2 mt-4">
        ${taskObj ? `<button class="btn btn-error btn-sm flex-1" id="btnDelTask">🗑️ Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveTask">Simpan</button>
      </div>
    </div>
  `);

  document.getElementById('btnSaveTask').onclick = () => {
    const title = document.getElementById('f_t_title').value.trim();
    
    if (!title) {
      const alertBox = document.getElementById('task_alert');
      alertBox.classList.remove('hidden');
      setTimeout(() => { if(alertBox) alertBox.classList.add('hidden'); }, 3000);
      return;
    }

    // Disimpan dengan properti 'deadline' agar sinkron dengan fungsi badge asli
    DB.tasks.save({
      id: taskObj ? taskObj.id : undefined,
      title,
      course_id: document.getElementById('f_t_course').value,
      deadline: document.getElementById('f_t_deadline').value,
      priority: document.getElementById('f_t_priority').value,
      status: t.status || 'Belum dikerjakan'
    });

    closeSheet();
    navigate('tasks'); 
  };

  if (taskObj) {
    document.getElementById('btnDelTask').onclick = () => {
      openSheet('Hapus Tugas', `
        <div class="space-y-4 text-xs">
          <p>Yakin ingin menghapus tugas <b>${taskObj.title}</b>?</p>
          <div class="flex gap-2">
            <button class="btn btn-neutral btn-sm flex-1" id="cancelDelTask">Batal</button>
            <button class="btn btn-error btn-sm flex-1" id="confirmDelTask">Ya, Hapus</button>
          </div>
        </div>
      `);
      document.getElementById('cancelDelTask').onclick = () => window.openTaskForm(taskObj);
      document.getElementById('confirmDelTask').onclick = () => {
        DB.tasks.remove(taskObj.id);
        closeSheet();
        navigate('tasks');
      };
    };
  }
}