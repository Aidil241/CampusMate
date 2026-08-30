/**
 * pages/courses.js
 * Halaman daftar mata kuliah + form tambah/edit mata kuliah.
 */
import { App } from '../core/app-namespace.js';
import { DB } from '../data/db.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

export function pageCourses() {
  const list = DB.courses.all();
  return `
    <!-- Kolom Pencarian -->
    <div class="relative mb-4">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
        ${ICON.search}
      </div>
      <input type="text" placeholder="Cari mata kuliah atau dosen..." class="input input-bordered input-sm w-full pl-9 bg-base-100" oninput="App.searchData(this.value, '.course-item')" />
    </div>

    <div class="space-y-2">
    ${list.length ? list.map(c => `
      <div onclick="App.editCourse('${c.id}')" class="course-item flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm cursor-pointer transition-all">
        <div class="p-2.5 bg-brand/10 text-brand rounded-xl">${ICON.book}</div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs">${esc(c.name)}</h4>
          <p class="text-[11px] text-base-content/60">${esc(c.lecturer || '-')} · ${c.credits} SKS</p>

          <!-- Menampilkan kontak dosen jika ada -->
          ${c.lecturer_contact ? `<p class="text-[10px] text-brand mt-0.5 opacity-90 font-medium tracking-wide">📞 ${esc(c.lecturer_contact)}</p>` : ''}

        </div>
      </div>
    `).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Belum ada mata kuliah</div>`}
  </div>`;
}
App.editCourse = (id) => openCourseForm(DB.courses.find(id));

export function openCourseForm(existing) {
  // Tambahkan property lecturer_contact bawaan
  const c = existing || { name: '', lecturer: '', lecturer_contact: '', credits: 3, room: '' };

  openSheet(existing ? 'Edit Matkul' : 'Tambah Matkul', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Nama Mata Kuliah</label>
        <input id="f_name" class="input input-bordered input-sm w-full" value="${esc(c.name)}" />
      </div>

      <!-- Grid untuk Dosen & Kontak -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">Dosen</label>
          <input id="f_lect" class="input input-bordered input-sm w-full" value="${esc(c.lecturer)}" />
        </div>
        <div>
          <label class="label label-text font-bold">Kontak Dosen</label>
          <input id="f_contact" class="input input-bordered input-sm w-full" placeholder="WA / Email" value="${esc(c.lecturer_contact)}" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">SKS</label>
          <input type="number" id="f_cred" class="input input-bordered input-sm w-full" value="${c.credits}" />
        </div>
        <div>
          <label class="label label-text font-bold">Ruangan</label>
          <input id="f_room" class="input input-bordered input-sm w-full" value="${esc(c.room)}" />
        </div>
      </div>

      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelC">${ICON.trash} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveC">Simpan</button>
      </div>
    </div>
  `);

  document.getElementById('btnSaveC').onclick = () => {
    const name = document.getElementById('f_name').value.trim();
    if (!name) return;

    // Simpan data beserta lecturer_contact
    DB.courses.save({
      id: c.id,
      name,
      lecturer: document.getElementById('f_lect').value,
      lecturer_contact: document.getElementById('f_contact').value, // <--- Data baru ditangkap di sini
      credits: Number(document.getElementById('f_cred').value || 0),
      room: document.getElementById('f_room').value
    });

    closeSheet(); render();
  };

  if (existing) document.getElementById('btnDelC').onclick = () => { DB.courses.remove(c.id); closeSheet(); render(); };
}
