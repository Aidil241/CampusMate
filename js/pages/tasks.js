/**
 * pages/tasks.js
 * Halaman daftar tugas (Supabase Edition): filter status, pencarian, tag, & pilihan mata kuliah dinamis.
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc, deadlineBadge, priorityBadgeClass } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

let tasksCache = [];
let coursesCache = [];
let isFetching = false;

// Set state default untuk filter jika belum ada
if (!state.taskFilterStatus) state.taskFilterStatus = 'Semua';
if (!state.taskFilterTag) state.taskFilterTag = 'Semua';

// Fungsi untuk mengambil data tugas dan mata kuliah dari Supabase
async function fetchTasksData() {
  if (isFetching) return;
  isFetching = true;

  const [taskRes, crsRes] = await Promise.all([
    supabase.from('tasks').select('*').order('deadline', { ascending: true }),
    supabase.from('courses').select('*').order('created_at', { ascending: false })
  ]);

  if (!taskRes.error && taskRes.data) tasksCache = taskRes.data;
  if (!crsRes.error && crsRes.data) coursesCache = crsRes.data;

  isFetching = false;
  render();
}

// Panggil saat pertama kali dimuat
fetchTasksData();

// Helper untuk mencari nama mata kuliah berdasarkan ID
function getCourseName(courseId) {
  const found = coursesCache.find(c => c.id === courseId);
  return found ? found.name : '-';
}

export function pageTasks() {
  if (!tasksCache.length && !isFetching) {
    fetchTasksData();
  }

  let list = [...tasksCache];
  
  // MENGAMBIL TAG DINAMIS
  const usedTags = [...new Set(tasksCache.map(t => t.tag || 'Umum'))];
  const availableTags = ['Semua', ...usedTags];
  
  // 1. Terapkan Filter Status
  if (state.taskFilterStatus !== 'Semua') {
    list = list.filter(t => t.status === state.taskFilterStatus);
  }
  
  // 2. Terapkan Filter Tag/Kategori
  if (state.taskFilterTag !== 'Semua') {
    list = list.filter(t => (t.tag || 'Umum') === state.taskFilterTag);
  }

  return `
    <!-- Kolom Pencarian -->
    <div class="relative mb-3">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
        ${ICON.search || '🔍'}
      </div>
      <input type="text" placeholder="Cari judul tugas atau matkul..." class="input input-bordered input-sm w-full pl-9 bg-base-100" oninput="App.searchData(this.value, '.task-item')" />
    </div>

    <!-- Area Filter -->
    <div class="mb-4 space-y-2 bg-base-100 border border-base-200 p-2.5 rounded-2xl shadow-sm">
      
      <!-- Baris Filter Status -->
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-bold text-base-content/40 uppercase tracking-widest w-12 text-right">Status</span>
        <div class="flex gap-1.5 overflow-x-auto flex-1 pb-1 scrollbar-hide">
          ${['Semua', 'Belum dikerjakan', 'Sedang dikerjakan', 'Selesai'].map(s => `
            <button onclick="App.setTaskFilterStatus('${s}')" class="btn btn-xs flex-shrink-0 rounded-full font-medium ${state.taskFilterStatus === s ? 'btn-primary' : 'btn-outline border-base-300 text-base-content/60 hover:bg-base-200'}">${s}</button>
          `).join('')}
        </div>
      </div>

      <!-- Baris Filter Tag -->
      <div class="flex items-center gap-2">
        <span class="text-[9px] font-bold text-base-content/40 uppercase tracking-widest w-12 text-right">Kategori</span>
        <div class="flex gap-1.5 overflow-x-auto flex-1 pb-1 scrollbar-hide">
          ${availableTags.map(tg => `
            <button onclick="App.setTaskFilterTag('${tg}')" class="btn btn-xs flex-shrink-0 rounded-full font-medium ${state.taskFilterTag === tg ? 'btn-secondary' : 'btn-outline border-base-300 text-base-content/60 hover:bg-base-200'}">${tg}</button>
          `).join('')}
        </div>
      </div>
      
    </div>

    <!-- Daftar Tugas -->
    <div class="space-y-2">
      ${list.length ? list.map(t => {
        const b = deadlineBadge(t.deadline, t.status);
        const tagLabel = t.tag || 'Umum';
        return `<div class="task-item flex items-start gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm transition-all">
          <input type="checkbox" ${t.status === 'Selesai' ? 'checked' : ''} onclick="App.toggleTask('${t.id}')" class="checkbox checkbox-sm checkbox-primary mt-0.5" />
          <div class="flex-1 min-w-0 cursor-pointer" onclick="App.editTask('${t.id}')">
            <h4 class="font-bold text-xs ${t.status === 'Selesai' ? 'line-through opacity-40' : ''}">${esc(t.title)}</h4>
            <div class="flex gap-1.5 mt-1 flex-wrap items-center">
              <span class="text-[10px] text-base-content/60">${esc(getCourseName(t.course_id))}</span>
              <span class="badge ${b.cls} badge-xs font-semibold">${b.text}</span>
              <span class="badge ${priorityBadgeClass(t.priority)} badge-xs">${t.priority}</span>
              <span class="badge badge-outline border-base-300 text-base-content/70 badge-xs">${esc(tagLabel)}</span>
            </div>
          </div>
        </div>`;
      }).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty || '📂'}Belum ada tugas</div>`}
    </div>
  `;
}

App.setTaskFilterStatus = (s) => { state.taskFilterStatus = s; render(); };
App.setTaskFilterTag = (tg) => { state.taskFilterTag = tg; render(); };

App.toggleTask = async (id) => {
  const t = tasksCache.find(item => item.id === id);
  if (!t) return;
  const newStatus = t.status === 'Selesai' ? 'Belum dikerjakan' : 'Selesai';
  
  // Tambahkan .select() di akhir untuk mencegah error 400 columns
  await supabase.from('tasks').update({ status: newStatus }).eq('id', id).select();
  fetchTasksData();
};

App.editTask = (id) => {
  const taskObj = tasksCache.find(item => item.id === id);
  window.openTaskForm(taskObj);
};

window.openTaskForm = function(taskObj = null) {
  const t = taskObj || { title: '', course_id: '', deadline: '', priority: 'Sedang', status: 'Belum dikerjakan', tag: 'Umum' };

  openSheet(taskObj ? 'Edit Tugas' : 'Tambah Tugas', `
    <div class="form-control gap-3 text-xs">
      <div id="task_alert" class="hidden bg-error/20 border border-error text-error px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
        ⚠️ Peringatan: Judul Tugas wajib diisi!
      </div>
      <div>
        <label class="label label-text font-bold">Judul Tugas</label>
        <input id="f_t_title" class="input input-bordered input-sm w-full" value="${esc(t.title || '')}" placeholder="Contoh: Membuat Makalah" />
      </div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_t_course" class="select select-bordered select-sm w-full">
          <option value="">Pilih Mata Kuliah...</option>
          ${coursesCache.map(c => `<option value="${c.id}" ${t.course_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">Tenggat Waktu</label>
          <input type="date" id="f_t_deadline" class="input input-bordered input-sm w-full" value="${t.deadline ? t.deadline.split('T')[0] : ''}" />
        </div>
        <div>
          <label class="label label-text font-bold">Tag / Jenis</label>
          <select id="f_t_tag" class="select select-bordered select-sm w-full">
            ${['Umum', 'Kelompok', 'Presentasi', 'Makalah', 'Proyek', 'Kuis'].map(tg => `<option value="${tg}" ${(t.tag || 'Umum') === tg ? 'selected' : ''}>${tg}</option>`).join('')}
          </select>
        </div>
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

  document.getElementById('btnSaveTask').onclick = async () => {
    const title = document.getElementById('f_t_title').value.trim();
    
    if (!title) {
      const alertBox = document.getElementById('task_alert');
      alertBox.classList.remove('hidden');
      setTimeout(() => { if(alertBox) alertBox.classList.add('hidden'); }, 3000);
      return;
    }

    // Ambil nilai course_id, ubah string kosong menjadi null agar tidak error UUID
    const rawCourseId = document.getElementById('f_t_course').value;
    const course_id = (rawCourseId && rawCourseId.trim() !== "") ? rawCourseId : null;

    const payload = {
      title,
      course_id: course_id,
      deadline: document.getElementById('f_t_deadline').value || null,
      priority: document.getElementById('f_t_priority').value,
      tag: document.getElementById('f_t_tag').value,
      status: t.status || 'Belum dikerjakan'
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    let error = null;

    if (taskObj && taskObj.id) {
      const res = await supabase.from('tasks').update(payload).eq('id', taskObj.id);
      error = res.error;
    } else {
      const res = await supabase.from('tasks').insert([payload]);
      error = res.error;
    }

    if (error) {
      alert('Gagal menyimpan tugas: ' + error.message);
      return;
    }

    closeSheet();
    fetchTasksData();
  };
    };

App.openTaskForm = () => window.openTaskForm(null);