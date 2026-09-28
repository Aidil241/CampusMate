/**
 * pages/notes.js
 * Halaman catatan materi kuliah (Supabase Edition) + mode baca tenang + form tambah/edit catatan.
 * Standard: CampusMate M3 / Android-first / The Focused Scholar.
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { 
  fetchSharedCourses, 
  getCachedCourses, 
  subscribeCourses 
} from '../data/courses.js';
import { 
  openCoursePicker, 
  renderCourseTrigger, 
  updateCourseTriggerUI, 
  openDeleteConfirmation 
} from '../ui/picker.js';

let notesCache = [];
let coursesCache = getCachedCourses();
let isFetching = false;
let hasLoaded = false;

export function resetNotesCache() {
  notesCache = [];
  hasLoaded = false;
  isFetching = false;
}

subscribeCourses((updatedCourses) => {
  coursesCache = updatedCourses;
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

// Format tanggal & waktu catatan
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

function formatNoteDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatNoteDateFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} · ${hours}:${minutes} WIB`;
}

async function fetchNotesData() {
  if (isFetching) return;
  isFetching = true;

  try {
    const [noteRes, courses] = await Promise.all([
      supabase.from('notes').select('*').order('created_at', { ascending: false }),
      fetchSharedCourses()
    ]);

    if (!noteRes.error && noteRes.data) notesCache = noteRes.data;
    if (courses) coursesCache = courses;
    hasLoaded = true;
  } catch (err) {
    console.error('Error fetching notes:', err);
  } finally {
    isFetching = false;
    render();
  }
}

fetchNotesData();

function getCourseName(courseId) {
  if (!courseId) return 'Umum';
  const found = coursesCache.find(c => String(c.id) === String(courseId));
  return found ? found.name : 'Umum';
}

// Helper status beban dan ringkasan catatan untuk konsumsi Top App Bar
export function hasNotesLoaded() {
  return hasLoaded;
}

export function getCachedNotes() {
  return notesCache;
}

export function getNotesSummary() {
  return {
    hasLoaded,
    count: notesCache.length
  };
}

export function pageNotes() {
  if (!hasLoaded && !isFetching) {
    fetchNotesData();
  }

  // Loading Skeleton
  if (isFetching && !hasLoaded) {
    return `
      <div class="space-y-2.5">
        ${[1, 2, 3].map(() => `
          <div class="p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-3">
            <div class="flex items-center justify-between">
              <div class="h-5 w-24 bg-base-200 dark:bg-slate-800 rounded-full"></div>
              <div class="h-4 w-20 bg-base-200 dark:bg-slate-800 rounded-md"></div>
            </div>
            <div class="h-4 w-3/4 bg-base-200 dark:bg-slate-800 rounded"></div>
            <div class="h-3 w-full bg-base-200 dark:bg-slate-800 rounded"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Empty State
  if (!notesCache.length) {
    return `
      <div class="p-8 text-center bg-base-100 dark:bg-slate-900/60 border border-dashed border-base-300 dark:border-slate-800 rounded-3xl space-y-3 my-2">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-brand/10 dark:bg-indigo-950/70 text-brand dark:text-indigo-300 flex items-center justify-center border border-brand/20 dark:border-indigo-800/60">
          ${ICON.note}
        </div>
        <div class="space-y-1">
          <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100">Belum Ada Catatan</h4>
          <p class="text-xs text-base-content/70 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Catat ringkasan kuliah, rumus penting, atau penjelasan dosen agar persiapan belajar semakin terarah.
          </p>
        </div>
        <div class="pt-2">
          <button 
            type="button" 
            onclick="App.openNoteForm()" 
            class="btn btn-primary h-12 min-h-[48px] px-6 rounded-xl font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-none text-white transition-all active:scale-[0.99]"
          >
            <span class="shrink-0 flex items-center justify-center">${ICON.plus}</span>
            <span>Tulis Catatan Baru</span>
          </button>
        </div>
      </div>
    `;
  }

  // Note Cards List
  return `
    <div class="space-y-2.5">
      ${notesCache.map(n => `
        <div 
          onclick="App.viewNote('${n.id}')" 
          class="group p-4 bg-base-100 dark:bg-slate-900/60 border border-base-200 dark:border-slate-800 hover:border-brand/40 dark:hover:border-indigo-500/40 rounded-2xl transition-all duration-150 active:scale-[0.99] cursor-pointer"
        >
          <!-- Baris Atas: Chip Mata Kuliah + Timestamp -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand dark:bg-indigo-950/70 dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60 max-w-[65%] truncate">
              <span class="shrink-0 flex items-center justify-center">${ICON.book}</span>
              <span class="truncate">${esc(getCourseName(n.course_id))}</span>
            </span>
            <span class="text-xs text-base-content/60 dark:text-slate-400 shrink-0 font-medium">
              ${esc(formatNoteDateShort(n.created_at))}
            </span>
          </div>

          <!-- Judul Catatan -->
          <h4 class="font-display font-bold text-sm text-base-content dark:text-slate-100 group-hover:text-brand dark:group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            ${esc(n.title)}
          </h4>

          <!-- Preview Isi Catatan -->
          ${n.content ? `
            <p class="text-xs text-base-content/75 dark:text-slate-300 line-clamp-2 leading-relaxed mt-1.5 font-normal">
              ${esc(n.content)}
            </p>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * 1. MODE BACA / REVIEW TENANG
 * Membuka sheet fokus untuk membaca materi tanpa distraksi input editor.
 */
export function openNoteView(noteOrId) {
  const note = typeof noteOrId === 'string'
    ? notesCache.find(n => String(n.id) === String(noteOrId))
    : noteOrId;

  if (!note) return;

  openSheet('Detail Catatan', `
    <!-- Sub-sheet container untuk Konfirmasi Hapus M3 -->
    <div id="note_view_sub_sheet" class="hidden"></div>

    <!-- Tampilan Utama Mode Baca -->
    <div id="note_view_main" class="space-y-4">
      <!-- Metadata Header: Mata Kuliah & Tanggal -->
      <div class="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-base-200 dark:border-slate-800">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand dark:bg-indigo-950/70 dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60">
          <span class="shrink-0 flex items-center justify-center">${ICON.book}</span>
          <span class="truncate max-w-[200px]">${esc(getCourseName(note.course_id))}</span>
        </div>
        <div class="inline-flex items-center gap-1.5 text-xs text-base-content/60 dark:text-slate-400 font-medium">
          <span class="shrink-0 flex items-center justify-center">${ICON.calendar}</span>
          <span>${esc(formatNoteDateFull(note.created_at))}</span>
        </div>
      </div>

      <!-- Judul Catatan -->
      <div>
        <h3 class="font-display font-bold text-base md:text-lg text-base-content dark:text-slate-100 leading-snug break-words">
          ${esc(note.title)}
        </h3>
      </div>

      <!-- Area Teks Isi Catatan (Fokus Baca) -->
      <div class="p-4 rounded-2xl bg-base-200/40 dark:bg-slate-800/40 border border-base-200 dark:border-slate-800 text-sm text-base-content dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto select-text font-normal break-words">
        ${note.content ? esc(note.content) : '<span class="italic text-base-content/40 dark:text-slate-500">Tidak ada isi catatan.</span>'}
      </div>

      <!-- Action Buttons (>= 48dp floor) -->
      <div class="flex items-center gap-2.5 pt-2">
        <button 
          type="button" 
          id="btnDelViewNote" 
          class="btn btn-ghost bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 h-12 min-h-[48px] px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <span class="shrink-0 flex items-center justify-center">${ICON.trash}</span>
          <span>Hapus</span>
        </button>

        <button 
          type="button" 
          id="btnEditViewNote" 
          class="btn btn-primary h-12 min-h-[48px] rounded-xl font-semibold text-xs flex-1 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] text-white"
        >
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          <span>Edit Catatan</span>
        </button>
      </div>
    </div>
  `);

  // Tombol Hapus: Trigger M3 In-Sheet Delete Confirmation
  const btnDel = document.getElementById('btnDelViewNote');
  if (btnDel) {
    btnDel.onclick = () => {
      openDeleteConfirmation({
        containerId: 'note_view_sub_sheet',
        mainViewId: 'note_view_main',
        title: 'Hapus Catatan Ini?',
        entityName: 'Catatan',
        entityDetailsHtml: `
          <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">Catatan Kuliah</div>
          <div class="font-display font-bold text-sm text-base-content dark:text-slate-100">${esc(note.title)}</div>
          <div class="text-xs text-base-content/80 dark:text-slate-300 mt-1">
            ${esc(getCourseName(note.course_id))} · ${formatNoteDateShort(note.created_at)}
          </div>
        `,
        warningText: 'Tindakan ini permanen. Catatan materi ini akan dihapus dari database.',
        onCancel: () => {
          const sheetTitle = document.getElementById('sheetTitle');
          if (sheetTitle) sheetTitle.textContent = 'Detail Catatan';
        },
        onConfirm: async () => {
          try {
            const { error } = await supabase.from('notes').delete().eq('id', note.id);
            if (error) throw error;
            closeSheet();
            showToast('Catatan berhasil dihapus');
            fetchNotesData();
          } catch (err) {
            console.error('Gagal menghapus catatan:', err);
            showToast('Gagal menghapus catatan: ' + (err.message || 'Terjadi kesalahan'), true);
          }
        }
      });
    };
  }

  // Tombol Edit: Buka Form Edit
  const btnEdit = document.getElementById('btnEditViewNote');
  if (btnEdit) {
    btnEdit.onclick = () => {
      openNoteForm(note);
    };
  }
}

/**
 * 2. FORM TAMBAH / EDIT CATATAN (M3 STANDARDS)
 */
export function openNoteForm(existing = null) {
  const isEdit = Boolean(existing && existing.id);
  const n = existing || { course_id: '', title: '', content: '' };
  let selectedCourseId = n.course_id || '';
  
  openSheet(isEdit ? 'Edit Catatan' : 'Tambah Catatan', `
    <!-- Sub-sheet container untuk Course Picker & Delete Confirmation M3 -->
    <div id="note_sub_sheet" class="hidden"></div>

    <!-- Tampilan Form Utama -->
    <div id="note_form_main" class="form-control gap-3.5 text-xs">
      <!-- Inline Alert Box -->
      <div id="note_alert" class="hidden p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium"></div>

      <!-- Judul Catatan -->
      <div>
        <label class="label pb-1 pt-0">
          <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
            Judul Catatan <span class="text-rose-500">*</span>
          </span>
        </label>
        <input 
          id="f_title" 
          class="input input-bordered w-full h-12 min-h-[48px] rounded-xl text-xs bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand dark:focus:border-indigo-500" 
          value="${esc(n.title || '')}" 
          placeholder="Contoh: Ringkasan Algoritma Greedy..." 
        />
        <div id="f_title_error" class="hidden text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
          Judul catatan wajib diisi
        </div>
      </div>

      <!-- M3 Shared Course Picker Trigger -->
      ${renderCourseTrigger({
        id: 'trigger_note_course',
        courseId: selectedCourseId,
        label: 'Mata Kuliah',
        required: false,
        placeholder: 'Pilih Mata Kuliah (Opsional)...'
      })}

      <!-- Isi Catatan -->
      <div>
        <label class="label pb-1 pt-0">
          <span class="label-text font-bold text-xs text-base-content dark:text-slate-200">
            Isi Catatan
          </span>
        </label>
        <textarea 
          id="f_content" 
          class="textarea textarea-bordered w-full min-h-[140px] rounded-xl text-xs bg-base-100 dark:bg-slate-900/60 border-base-200 dark:border-slate-800 text-base-content dark:text-slate-100 placeholder:text-base-content/40 dark:placeholder:text-slate-500 focus:border-brand dark:focus:border-indigo-500 leading-relaxed" 
          placeholder="Tulis ringkasan kuliah, rumus, atau poin penting dosen di sini..."
        >${esc(n.content || '')}</textarea>
      </div>

      <!-- Action Buttons (>= 48dp floor) -->
      <div class="flex gap-2.5 pt-2">
        ${isEdit ? `
          <button 
            type="button" 
            class="btn btn-ghost bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 h-12 min-h-[48px] px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]" 
            id="btnDelN"
          >
            <span class="shrink-0 flex items-center justify-center">${ICON.trash}</span>
            <span>Hapus</span>
          </button>
        ` : ''}
        <button 
          type="button" 
          class="btn btn-primary h-12 min-h-[48px] rounded-xl font-semibold text-xs flex-1 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] text-white" 
          id="btnSaveN"
        >
          <span class="shrink-0 flex items-center justify-center">${ICON.check}</span>
          <span>${isEdit ? 'Simpan Perubahan' : 'Simpan Catatan'}</span>
        </button>
      </div>
    </div>
  `);

  // Pasang Trigger M3 Course Picker
  const courseTrigger = document.getElementById('trigger_note_course');
  if (courseTrigger) {
    courseTrigger.onclick = () => {
      openCoursePicker({
        containerId: 'note_sub_sheet',
        mainViewId: 'note_form_main',
        currentVal: selectedCourseId,
        allowEmpty: true,
        emptyLabel: 'Umum (Tanpa Mata Kuliah)',
        onSelect: (courseId) => {
          selectedCourseId = courseId;
          updateCourseTriggerUI('trigger_note_course', courseId);
          const sheetTitle = document.getElementById('sheetTitle');
          if (sheetTitle) sheetTitle.textContent = isEdit ? 'Edit Catatan' : 'Tambah Catatan';
        },
        onBack: () => {
          const sheetTitle = document.getElementById('sheetTitle');
          if (sheetTitle) sheetTitle.textContent = isEdit ? 'Edit Catatan' : 'Tambah Catatan';
        }
      });
    };
  }

  // Clear validation styling saat user mengetik
  const titleInput = document.getElementById('f_title');
  const titleError = document.getElementById('f_title_error');
  if (titleInput) {
    titleInput.oninput = () => {
      titleInput.classList.remove('border-rose-500', 'focus:border-rose-500');
      if (titleError) titleError.classList.add('hidden');
    };
  }

  // Handler Simpan Catatan
  const btnSave = document.getElementById('btnSaveN');
  if (btnSave) {
    btnSave.onclick = async () => {
      const title = titleInput ? titleInput.value.trim() : '';
      if (!title) {
        if (titleInput) {
          titleInput.classList.add('border-rose-500', 'focus:border-rose-500');
          titleInput.focus();
        }
        if (titleError) titleError.classList.remove('hidden');
        return;
      }

      btnSave.disabled = true;
      btnSave.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Menyimpan...';

      try {
        const payload = {
          title,
          course_id: selectedCourseId || null,
          content: document.getElementById('f_content') ? document.getElementById('f_content').value : ''
        };

        const { data: { user } } = await supabase.auth.getUser();
        if (user) payload.user_id = user.id;

        if (isEdit) {
          const { error } = await supabase.from('notes').update(payload).eq('id', existing.id);
          if (error) throw error;
          showToast('Catatan berhasil diperbarui');
        } else {
          const { error } = await supabase.from('notes').insert([payload]);
          if (error) throw error;
          showToast('Catatan berhasil disimpan');
        }

        closeSheet();
        fetchNotesData();
      } catch (err) {
        console.error('Gagal menyimpan catatan:', err);
        showToast('Gagal menyimpan catatan: ' + (err.message || 'Terjadi kesalahan'), true);
        btnSave.disabled = false;
        btnSave.innerHTML = `<span class="shrink-0 flex items-center justify-center">${ICON.check}</span><span>${isEdit ? 'Simpan Perubahan' : 'Simpan Catatan'}</span>`;
      }
    };
  }

  // Handler Hapus Catatan dengan M3 Confirmation
  if (isEdit) {
    const btnDel = document.getElementById('btnDelN');
    if (btnDel) {
      btnDel.onclick = () => {
        openDeleteConfirmation({
          containerId: 'note_sub_sheet',
          mainViewId: 'note_form_main',
          title: 'Hapus Catatan Ini?',
          entityName: 'Catatan',
          entityDetailsHtml: `
            <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">Catatan Kuliah</div>
            <div class="font-display font-bold text-sm text-base-content dark:text-slate-100">${esc(existing.title)}</div>
            <div class="text-xs text-base-content/80 dark:text-slate-300 mt-1">
              ${esc(getCourseName(selectedCourseId || existing.course_id))} · ${formatNoteDateShort(existing.created_at)}
            </div>
          `,
          warningText: 'Tindakan ini permanen. Catatan materi ini akan dihapus dari database.',
          onCancel: () => {
            const sheetTitle = document.getElementById('sheetTitle');
            if (sheetTitle) sheetTitle.textContent = 'Edit Catatan';
          },
          onConfirm: async () => {
            try {
              const { error } = await supabase.from('notes').delete().eq('id', existing.id);
              if (error) throw error;
              closeSheet();
              showToast('Catatan berhasil dihapus');
              fetchNotesData();
            } catch (err) {
              console.error('Gagal menghapus catatan:', err);
              showToast('Gagal menghapus catatan: ' + (err.message || 'Terjadi kesalahan'), true);
            }
          }
        });
      };
    }
  }
}

// Window & App namespace exposure untuk backward-compatibility & event handling
App.viewNote = (id) => {
  const existing = notesCache.find(n => String(n.id) === String(id));
  if (existing) openNoteView(existing);
};

App.editNote = (id) => {
  const existing = notesCache.find(n => String(n.id) === String(id));
  openNoteForm(existing);
};

App.openNoteForm = () => openNoteForm(null);
window.openNoteForm = openNoteForm;
window.openNoteView = openNoteView;