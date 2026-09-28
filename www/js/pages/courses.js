/**
 * pages/courses.js
 * Halaman daftar mata kuliah + form tambah/edit mata kuliah (Sync + Supabase).
 * Material Design 3 / CampusMate Edition — "The Focused Scholar"
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { openDeleteConfirmation } from '../ui/picker.js';
import { 
  fetchSharedCourses, 
  invalidateCoursesCache, 
  getCachedCourses, 
  hasCoursesLoaded,
  subscribeCourses 
} from '../data/courses.js';

let coursesCache = getCachedCourses();
let isFetching = false;

// Ringkasan data mata kuliah untuk konsumsi Top App Bar / widget lain
export function getCoursesSummary() {
  return {
    hasLoaded: hasCoursesLoaded(),
    count: coursesCache.length
  };
}

// Subscribe ke perubahan cache bersama
subscribeCourses((data) => {
  coursesCache = data;
});

// Helper notifikasi toast konsisten
function showToast(message, isError = false) {
  const toast = document.getElementById('toastStack');
  if (!toast) return;
  const el = document.createElement('div');
  el.className = isError
    ? 'alert alert-error text-xs shadow-none border border-rose-200 dark:border-rose-900 py-2.5 px-3.5 rounded-2xl flex items-center gap-2'
    : 'alert alert-success text-xs shadow-none border border-emerald-200 dark:border-emerald-900 py-2.5 px-3.5 rounded-2xl flex items-center gap-2';
  el.innerHTML = `<span>${esc(message)}</span>`;
  toast.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Helper pemformat tautan kontak (WhatsApp / Telepon / Email)
function formatContactLink(contact) {
  if (!contact) return '';
  const trimmed = contact.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanDigits = trimmed.replace(/[^0-9+]/g, '');
  if (cleanDigits.startsWith('+')) {
    return `https://wa.me/${cleanDigits.replace(/[^0-9]/g, '')}`;
  }
  if (cleanDigits.startsWith('08')) {
    return `https://wa.me/62${cleanDigits.slice(1)}`;
  }
  if (cleanDigits.length >= 7) {
    return `tel:${cleanDigits}`;
  }
  if (trimmed.includes('@')) {
    return `mailto:${trimmed}`;
  }
  return `tel:${trimmed}`;
}

// Fungsi untuk menarik data terbaru dari Supabase di background
async function fetchCoursesFromCloud() {
  if (isFetching) return;
  isFetching = true;
  await invalidateCoursesCache();
  coursesCache = getCachedCourses();
  render();
  isFetching = false;
}

// Panggil saat pertama kali file dimuat
fetchCoursesFromCloud();

// Handler pencarian real-time dengan status kosong yang jelas
App.handleCourseSearch = (val) => {
  const q = (val || '').trim().toLowerCase();
  const clearBtn = document.getElementById('btn_clear_course_search');
  if (clearBtn) {
    if (q) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }

  const items = document.querySelectorAll('.course-item');
  let matchCount = 0;
  items.forEach(el => {
    const matches = el.innerText.toLowerCase().includes(q);
    el.style.display = matches ? '' : 'none';
    if (matches) matchCount++;
  });

  const emptyEl = document.getElementById('course_search_empty');
  if (emptyEl) {
    if (q && matchCount === 0 && items.length > 0) {
      emptyEl.classList.remove('hidden');
    } else {
      emptyEl.classList.add('hidden');
    }
  }
};

App.clearCourseSearch = () => {
  const input = document.getElementById('course_search_input');
  if (input) {
    input.value = '';
    App.handleCourseSearch('');
    input.focus();
  }
};

export function pageCourses() {
  // Jika cache kosong dan belum mengambil, trigger fetch
  if (!coursesCache.length && !isFetching) {
    fetchCoursesFromCloud();
  }

  return `
    <!-- Kolom Pencarian M3 (48dp) -->
    <div class="relative mb-3.5">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40 dark:text-slate-400">
        ${ICON.search}
      </div>
      <input 
        type="text" 
        id="course_search_input"
        placeholder="Cari mata kuliah, dosen, atau ruangan..." 
        class="input input-bordered h-12 min-h-[48px] w-full pl-10 pr-10 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none transition-colors" 
        oninput="App.handleCourseSearch(this.value)" 
      />
      <button 
        type="button" 
        id="btn_clear_course_search" 
        class="hidden absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
        onclick="App.clearCourseSearch()"
        title="Hapus pencarian">
        ${ICON.close}
      </button>
    </div>

    <!-- State Kosong Hasil Pencarian -->
    <div id="course_search_empty" class="hidden text-center py-10 px-4 border border-dashed border-base-200 dark:border-slate-800 rounded-2xl bg-base-100/40 dark:bg-slate-900/20 mb-3.5">
      <div class="w-12 h-12 mx-auto mb-2.5 rounded-full bg-base-200/60 dark:bg-slate-800 flex items-center justify-center text-base-content/40 dark:text-slate-400">
        ${ICON.search}
      </div>
      <p class="font-bold text-xs text-base-content dark:text-slate-200">Mata kuliah tidak ditemukan</p>
      <p class="text-xs text-base-content/60 dark:text-slate-400 mt-1">Coba kata kunci lain atau periksa ejaan Anda.</p>
    </div>

    <!-- Daftar Kartu Mata Kuliah (Flat Tonal Surfaces, Bebas Arbitrary Shadow) -->
    <div class="space-y-2.5">
      ${coursesCache.length ? coursesCache.map(c => `
        <div onclick="App.editCourse('${c.id}')" 
             class="course-item flex flex-col p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all active:scale-[0.99] hover:border-brand/30 dark:hover:border-indigo-500/40">
          
          <div class="flex items-start gap-3">
            <div class="p-2.5 bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/15 dark:border-indigo-800/60 rounded-xl shrink-0 mt-0.5">
              ${ICON.book}
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100 leading-snug line-clamp-2">${esc(c.name)}</h4>
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60 shrink-0">
                  ${c.credits || 0} SKS
                </span>
              </div>
              
              <p class="text-xs text-base-content/70 dark:text-slate-400 mt-1 truncate">
                ${esc(c.lecturer || 'Dosen belum ditentukan')}
              </p>
              
              ${c.room ? `
                <div class="flex items-center gap-1.5 text-xs text-base-content/60 dark:text-slate-400 mt-1">
                  ${ICON.mapPin}
                  <span class="truncate">Ruang ${esc(c.room)}</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${c.lecturer_contact ? `
            <div class="mt-3 pt-2.5 border-t border-base-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span class="text-xs text-base-content/50 dark:text-slate-500">Kontak Dosen:</span>
              <a href="${formatContactLink(c.lecturer_contact)}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 onclick="event.stopPropagation()" 
                 class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-brand dark:text-indigo-300 bg-brand/10 dark:bg-indigo-950/60 hover:bg-brand/20 dark:hover:bg-indigo-900/60 transition-colors border border-brand/20 dark:border-indigo-800/50">
                ${ICON.phone}
                <span class="truncate max-w-[170px]">${esc(c.lecturer_contact)}</span>
              </a>
            </div>
          ` : ''}
        </div>
      `).join('') : `
        <div class="text-center py-10 px-4 border border-dashed border-base-200 dark:border-slate-800 rounded-2xl bg-base-100/40 dark:bg-slate-900/20">
          <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60 flex items-center justify-center">
            ${ICON.book}
          </div>
          <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100">Belum ada mata kuliah</h4>
          <p class="text-xs text-base-content/60 dark:text-slate-400 mt-1 max-w-xs mx-auto mb-4">
            Tambahkan mata kuliah semester ini untuk mengelola jadwal, tugas, dan nilai akademik Anda.
          </p>
          <button type="button" onclick="App.openCourseForm()" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl px-5 font-semibold text-xs border-none inline-flex items-center gap-2 cursor-pointer shadow-none">
            ${ICON.plus}
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      `}
    </div>`;
}

App.editCourse = (id) => {
  const existing = coursesCache.find(c => c.id === id);
  openCourseForm(existing);
};

export function openCourseForm(existing) {
  const c = existing || { name: '', lecturer: '', lecturer_contact: '', credits: 3, room: '' };
  const isEdit = Boolean(existing && existing.id);

  openSheet(isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah', `
    <div id="course_form_container">
      <!-- 1. VIEW UTAMA: Form Input Mata Kuliah -->
      <div id="course_form_main" class="space-y-4">
        <!-- Field Nama Mata Kuliah -->
        <div>
          <label class="label pb-1">
            <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
              Nama Mata Kuliah <span class="text-rose-500">*</span>
            </span>
          </label>
          <input 
            type="text"
            id="f_name" 
            class="input input-bordered h-12 min-h-[48px] w-full px-3.5 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none transition-colors" 
            placeholder="Contoh: Algoritma & Pemrograman"
            value="${esc(c.name)}" 
          />
          <div id="f_name_error" class="hidden text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">
            Nama mata kuliah wajib diisi
          </div>
        </div>

        <!-- Field Dosen Pengampu & Kontak -->
        <div class="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
          <div>
            <label class="label pb-1">
              <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">Dosen Pengampu</span>
            </label>
            <input 
              type="text"
              id="f_lect" 
              class="input input-bordered h-12 min-h-[48px] w-full px-3.5 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none transition-colors" 
              placeholder="Contoh: Dr. Hendra Setiawan"
              value="${esc(c.lecturer)}" 
            />
          </div>
          <div>
            <label class="label pb-1">
              <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">Kontak Dosen / WA</span>
            </label>
            <input 
              type="text"
              id="f_contact" 
              class="input input-bordered h-12 min-h-[48px] w-full px-3.5 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none transition-colors" 
              placeholder="0812... / Email" 
              value="${esc(c.lecturer_contact)}" 
            />
          </div>
        </div>

        <!-- Field SKS & Ruangan -->
        <div class="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
          <div>
            <div class="flex items-center justify-between pb-1">
              <label class="label p-0">
                <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">Jumlah SKS</span>
              </label>
              <!-- Quick SKS Pills -->
              <div class="flex gap-1" id="sks_presets">
                ${[2, 3, 4].map(sks => `
                  <button type="button" 
                          data-sks="${sks}"
                          class="sks-preset-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${Number(c.credits) === sks ? 'bg-brand text-white border-brand' : 'bg-base-200/80 dark:bg-slate-800 text-base-content/70 dark:text-slate-300 border-base-200 dark:border-slate-700'}">
                    ${sks} SKS
                  </button>
                `).join('')}
              </div>
            </div>
            <input 
              type="number" 
              id="f_cred" 
              min="1"
              max="12"
              class="input input-bordered h-12 min-h-[48px] w-full px-3.5 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 focus:border-brand focus:outline-none transition-colors" 
              value="${c.credits}" 
            />
          </div>
          <div>
            <label class="label pb-1">
              <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">Ruangan Kelas</span>
            </label>
            <input 
              type="text"
              id="f_room" 
              class="input input-bordered h-12 min-h-[48px] w-full px-3.5 rounded-xl bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-xs text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none transition-colors" 
              placeholder="Contoh: R.402 / Lab Komputer"
              value="${esc(c.room)}" 
            />
          </div>
        </div>

        <!-- Tombol Aksi Form (Minimum 48dp) -->
        <div class="flex gap-2.5 pt-2">
          ${isEdit ? `
            <button type="button" class="btn btn-ghost bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-[0.99]" id="btnDelC">
              <span class="inline-flex items-center justify-center gap-2 pointer-events-none">
                <span class="shrink-0 flex items-center justify-center">${ICON.trash}</span>
                <span class="whitespace-nowrap">Hapus</span>
              </span>
            </button>
          ` : ''}
          <button type="button" class="btn bg-brand hover:bg-brand/90 text-white h-12 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center cursor-pointer shadow-none transition-all active:scale-[0.99]" id="btnSaveC">
            <span class="inline-flex items-center justify-center gap-2 pointer-events-none">
              <span class="shrink-0 flex items-center justify-center">${ICON.check}</span>
              <span class="whitespace-nowrap">Simpan Mata Kuliah</span>
            </span>
          </button>
        </div>
      </div>

      <!-- 2. VIEW SUB: Konfirmasi Hapus In-Sheet (Material 3 Safety) -->
      <div id="course_form_delete" class="hidden"></div>
    </div>
  `);

  const sheetTitle = document.getElementById('sheetTitle');
  if (sheetTitle) {
    sheetTitle.style.color = '';
    sheetTitle.className = 'font-display font-bold text-base mb-4 text-base-content dark:text-slate-100';
  }

  // Quick SKS preset handlers
  const credInput = document.getElementById('f_cred');
  const presetBtns = document.querySelectorAll('.sks-preset-btn');
  presetBtns.forEach(btn => {
    btn.onclick = () => {
      const val = btn.getAttribute('data-sks');
      if (credInput) {
        credInput.value = val;
        presetBtns.forEach(b => {
          b.className = 'sks-preset-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-base-200/80 dark:bg-slate-800 text-base-content/70 dark:text-slate-300 border-base-200 dark:border-slate-700';
        });
        btn.className = 'sks-preset-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-brand text-white border-brand';
      }
    };
  });
  if (credInput) {
    credInput.oninput = () => {
      presetBtns.forEach(b => {
        const isMatch = b.getAttribute('data-sks') === credInput.value.trim();
        b.className = isMatch 
          ? 'sks-preset-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-brand text-white border-brand'
          : 'sks-preset-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer bg-base-200/80 dark:bg-slate-800 text-base-content/70 dark:text-slate-300 border-base-200 dark:border-slate-700';
      });
    };
  }

  // Validation handlers for name
  const nameInput = document.getElementById('f_name');
  const nameError = document.getElementById('f_name_error');
  if (nameInput) {
    nameInput.oninput = () => {
      if (nameInput.value.trim()) {
        nameInput.classList.remove('border-rose-500');
        if (nameError) nameError.classList.add('hidden');
      }
    };
  }

  // Save button
  const btnSave = document.getElementById('btnSaveC');
  if (btnSave) {
    btnSave.onclick = async () => {
      const name = (nameInput ? nameInput.value : '').trim();
      if (!name) {
        if (nameInput) {
          nameInput.classList.add('border-rose-500');
          nameInput.focus();
        }
        if (nameError) {
          nameError.classList.remove('hidden');
        }
        showToast('Nama mata kuliah wajib diisi', true);
        return;
      }

      const creditsVal = Number(document.getElementById('f_cred').value || 0);
      const payload = {
        name,
        lecturer: document.getElementById('f_lect').value.trim(),
        lecturer_contact: document.getElementById('f_contact').value.trim(),
        credits: creditsVal > 0 ? creditsVal : 0,
        room: document.getElementById('f_room').value.trim()
      };

      btnSave.disabled = true;
      btnSave.innerHTML = '<span class="inline-flex items-center justify-center gap-2 pointer-events-none"><span class="loading loading-spinner loading-xs"></span><span class="whitespace-nowrap">Menyimpan...</span></span>';

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) payload.user_id = user.id;

        if (isEdit) {
          const { error } = await supabase.from('courses').update(payload).eq('id', existing.id);
          if (error) throw error;
          showToast('Mata kuliah berhasil diperbarui');
        } else {
          const { error } = await supabase.from('courses').insert([payload]);
          if (error) throw error;
          showToast('Mata kuliah berhasil ditambahkan');
        }

        closeSheet(); 
        await invalidateCoursesCache();
        render();
      } catch (err) {
        console.error('Gagal menyimpan mata kuliah:', err);
        showToast('Gagal menyimpan mata kuliah: ' + (err.message || 'Terjadi kesalahan'), true);
        btnSave.disabled = false;
        btnSave.innerHTML = `<span class="inline-flex items-center justify-center gap-2 pointer-events-none"><span class="shrink-0 flex items-center justify-center">${ICON.check}</span><span class="whitespace-nowrap">Simpan Mata Kuliah</span></span>`;
      }
    };
  }

  // Delete button with shared M3 in-sheet confirmation
  if (isEdit) {
    const btnDel = document.getElementById('btnDelC');
    if (btnDel) {
      btnDel.onclick = () => {
        openDeleteConfirmation({
          containerId: 'course_form_delete',
          mainViewId: 'course_form_main',
          title: 'Hapus Mata Kuliah Ini?',
          entityName: 'Mata Kuliah',
          entityDetailsHtml: `
            <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">Informasi Mata Kuliah</div>
            <div class="font-display font-bold text-sm text-base-content dark:text-slate-100">${esc(c.name)}</div>
            <div class="text-xs text-base-content/80 dark:text-slate-300 mt-1">${esc(c.lecturer || 'Dosen belum ditentukan')} · ${c.credits || 0} SKS${c.room ? ` · Ruang ${esc(c.room)}` : ''}</div>
          `,
          warningText: 'Tindakan ini permanen. Menghapus mata kuliah ini akan menghapus data dari database dan dapat mempengaruhi jadwal, tugas, serta nilai akademik yang terkait.',
          onCancel: () => {
            if (sheetTitle) sheetTitle.textContent = 'Edit Mata Kuliah';
          },
          onConfirm: async () => {
            const { error } = await supabase.from('courses').delete().eq('id', existing.id);
            if (error) throw error;
            closeSheet();
            showToast('Mata kuliah berhasil dihapus');
            await invalidateCoursesCache();
            render();
          }
        });
      };
    }
  }
}

// Ekspor ke window dan App agar bisa dipanggil dari tombol pintasan halaman lain (seperti Jadwal)
if (typeof window !== 'undefined') {
  window.openCourseForm = openCourseForm;
}
App.openCourseForm = openCourseForm;
