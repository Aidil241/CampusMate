/**
 * pages/notes.js
 * Halaman catatan materi kuliah (Supabase Edition) + form tambah/edit catatan.
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

let notesCache = [];
let coursesCache = [];
let isFetching = false;

// Ambil data catatan dan mata kuliah dari Supabase
async function fetchNotesData() {
  if (isFetching) return;
  isFetching = true;

  const [noteRes, crsRes] = await Promise.all([
    supabase.from('notes').select('*').order('created_at', { ascending: false }),
    supabase.from('courses').select('*').order('created_at', { ascending: false })
  ]);

  if (!noteRes.error && noteRes.data) notesCache = noteRes.data;
  if (!crsRes.error && crsRes.data) coursesCache = crsRes.data;

  isFetching = false;
  render();
}

// Panggil saat pertama kali dimuat
fetchNotesData();

// Helper untuk mencari nama mata kuliah
function getCourseName(courseId) {
  if (!courseId) return 'Umum';
  const found = coursesCache.find(c => c.id === courseId);
  return found ? found.name : 'Umum';
}

export function pageNotes() {
  if (!notesCache.length && !isFetching) {
    fetchNotesData();
  }

  return `
    <div class="space-y-2">
      ${notesCache.length ? notesCache.map(n => `
        <div onclick="App.editNote('${n.id}')" class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-1 cursor-pointer">
          <h4 class="font-bold text-xs">${esc(n.title)}</h4>
          <p class="text-xs text-base-content/70 line-clamp-2">${esc(n.content || '')}</p>
          <span class="badge badge-ghost badge-xs font-semibold mt-2">${esc(getCourseName(n.course_id))}</span>
        </div>
      `).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty || '📂'}Belum ada catatan</div>`}
    </div>
  `;
}

App.editNote = (id) => {
  const existing = notesCache.find(n => n.id === id);
  window.openNoteForm(existing);
};

window.openNoteForm = function(existing = null) {
  const n = existing || { course_id: '', title: '', content: '' };
  
  openSheet(existing ? 'Edit Catatan' : 'Tambah Catatan', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Judul</label>
        <input id="f_title" class="input input-bordered input-sm w-full" value="${esc(n.title || '')}" placeholder="Judul catatan..." />
      </div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          <option value="">Umum</option>
          ${coursesCache.map(c => `<option value="${c.id}" ${n.course_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label label-text font-bold">Isi Catatan</label>
        <textarea id="f_content" class="textarea textarea-bordered w-full h-28" placeholder="Tulis catatan di sini...">${esc(n.content || '')}</textarea>
      </div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelN">${ICON.trash || '🗑️'} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveN">Simpan</button>
      </div>
    </div>
  `);

  document.getElementById('btnSaveN').onclick = async () => {
    const title = document.getElementById('f_title').value.trim();
    if (!title) {
      alert('Judul catatan wajib diisi!');
      return;
    }

    const payload = {
      title,
      course_id: document.getElementById('f_course').value || null,
      content: document.getElementById('f_content').value
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    if (existing && existing.id) {
      await supabase.from('notes').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('notes').insert([payload]);
    }

    closeSheet();
    fetchNotesData();
  };

  if (existing) {
    document.getElementById('btnDelN').onclick = async () => {
      await supabase.from('notes').delete().eq('id', existing.id);
      closeSheet();
      fetchNotesData();
    };
  }
};

App.openNoteForm = () => window.openNoteForm(null);