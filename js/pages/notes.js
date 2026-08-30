/**
 * pages/notes.js
 * Halaman catatan materi kuliah + form tambah/edit catatan.
 */
import { App } from '../core/app-namespace.js';
import { DB } from '../data/db.js';
import { ICON } from '../utils/icons.js';
import { esc, courseName } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

export function pageNotes() {
  const list = DB.notes.all();
  return `<div class="space-y-2">
    ${list.length ? list.map(n => `
      <div onclick="App.editNote('${n.id}')" class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-1 cursor-pointer">
        <h4 class="font-bold text-xs">${esc(n.title)}</h4>
        <p class="text-xs text-base-content/70 line-clamp-2">${esc(n.content)}</p>
        <span class="badge badge-ghost badge-xs font-semibold mt-2">${esc(courseName(n.course_id))}</span>
      </div>
    `).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Belum ada catatan</div>`}
  </div>`;
}
App.editNote = (id) => openNoteForm(DB.notes.find(id));

export function openNoteForm(existing) {
  const n = existing || { course_id: '', title: '', content: '' };
  openSheet(existing ? 'Edit Catatan' : 'Tambah Catatan', `
    <div class="form-control gap-3 text-xs">
      <div><label class="label label-text font-bold">Judul</label><input id="f_title" class="input input-bordered input-sm w-full" value="${esc(n.title)}" /></div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          <option value="">Umum</option>
          ${DB.courses.all().map(c => `<option value="${c.id}" ${n.course_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div><label class="label label-text font-bold">Isi Catatan</label><textarea id="f_content" class="textarea textarea-bordered w-full h-28">${esc(n.content)}</textarea></div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelN">${ICON.trash} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveN">Simpan</button>
      </div>
    </div>
  `);
  document.getElementById('btnSaveN').onclick = () => {
    const title = document.getElementById('f_title').value.trim();
    if (!title) return;
    DB.notes.save({ id: n.id, title, course_id: document.getElementById('f_course').value, content: document.getElementById('f_content').value });
    closeSheet(); render();
  };
  if (existing) document.getElementById('btnDelN').onclick = () => { DB.notes.remove(n.id); closeSheet(); render(); };
}
