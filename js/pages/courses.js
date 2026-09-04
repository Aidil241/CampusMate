/**
 * pages/courses.js
 * Halaman daftar mata kuliah + form tambah/edit mata kuliah (Sync + Supabase).
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

let coursesCache = [];
let isFetching = false;

// Fungsi untuk menarik data terbaru dari Supabase di background
async function fetchCoursesFromCloud() {
  if (isFetching) return;
  isFetching = true;
  const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
  if (!error && data) {
    coursesCache = data;
    render(); // Render ulang tampilan setelah data cloud didapat
  }
  isFetching = false;
}

// Panggil saat pertama kali file dimuat
fetchCoursesFromCloud();

export function pageCourses() {
  // Jika cache kosong dan belum mengambil, trigger fetch
  if (!coursesCache.length && !isFetching) {
    fetchCoursesFromCloud();
  }

  return `
    <!-- Kolom Pencarian -->
    <div class="relative mb-4">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
        ${ICON.search}
      </div>
      <input type="text" placeholder="Cari mata kuliah atau dosen..." class="input input-bordered input-sm w-full pl-9 bg-base-100" oninput="App.searchData(this.value, '.course-item')" />
    </div>

    <div class="space-y-2">
    ${coursesCache.length ? coursesCache.map(c => `
      <div onclick="App.editCourse('${c.id}')" class="course-item flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm cursor-pointer transition-all">
        <div class="p-2.5 bg-brand/10 text-brand rounded-xl">${ICON.book}</div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs">${esc(c.name)}</h4>
          <p class="text-[11px] text-base-content/60">${esc(c.lecturer || '-')} · ${c.credits} SKS</p>
          ${c.lecturer_contact ? `<p class="text-[10px] text-brand mt-0.5 opacity-90 font-medium tracking-wide">📞 ${esc(c.lecturer_contact)}</p>` : ''}
        </div>
      </div>
    `).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Belum ada mata kuliah</div>`}
  </div>`;
}

App.editCourse = (id) => {
  const existing = coursesCache.find(c => c.id === id);
  openCourseForm(existing);
};

export function openCourseForm(existing) {
  const c = existing || { name: '', lecturer: '', lecturer_contact: '', credits: 3, room: '' };

  openSheet(existing ? 'Edit Matkul' : 'Tambah Matkul', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Nama Mata Kuliah</label>
        <input id="f_name" class="input input-bordered input-sm w-full" value="${esc(c.name)}" />
      </div>

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

  document.getElementById('btnSaveC').onclick = async () => {
    const name = document.getElementById('f_name').value.trim();
    if (!name) return;

    const payload = {
      name,
      lecturer: document.getElementById('f_lect').value,
      lecturer_contact: document.getElementById('f_contact').value,
      credits: Number(document.getElementById('f_cred').value || 0),
      room: document.getElementById('f_room').value
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    if (existing && existing.id) {
      await supabase.from('courses').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('courses').insert([payload]);
    }

    closeSheet(); 
    fetchCoursesFromCloud(); // Ambil ulang data terbaru ke cache
  };

  if (existing) {
    document.getElementById('btnDelC').onclick = async () => {
      await supabase.from('courses').delete().eq('id', existing.id);
      closeSheet(); 
      fetchCoursesFromCloud(); // Ambil ulang data terbaru ke cache
    };
  }
}