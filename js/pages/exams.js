/**
 * pages/exams.js
 * Halaman jadwal ujian (Supabase Edition) dengan relasi mata kuliah dinamis.
 */
import { supabase } from '../data/supabase.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { esc } from '../utils/format.js';

let examsCache = [];
let coursesCache = [];
let isFetching = false;

// Fungsi untuk menarik data ujian dan mata kuliah dari Supabase
async function fetchExamsData() {
  if (isFetching) return;
  isFetching = true;

  const [examRes, crsRes] = await Promise.all([
    supabase.from('exams').select('*').order('exam_date', { ascending: true }),
    supabase.from('courses').select('*').order('created_at', { ascending: false })
  ]);

  if (!examRes.error && examRes.data) examsCache = examRes.data;
  if (!crsRes.error && crsRes.data) coursesCache = crsRes.data;

  isFetching = false;
  render();
}

// Panggil saat pertama kali dimuat
fetchExamsData();

// Helper untuk menghitung sisa hari
function getDaysLeft(dateString) {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = examDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper untuk mencari nama mata kuliah berdasarkan ID
function getCourseName(courseId) {
  const found = coursesCache.find(c => c.id === courseId);
  return found ? found.name : '-';
}

export function pageExams() {
  if (!examsCache.length && !isFetching) {
    fetchExamsData();
  }

  if (examsCache.length === 0) {
    return `
      <div class="space-y-3">
        <div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">
          📭<br>Belum ada jadwal ujian
        </div>
      </div>
    `;
  }

  const examsHtml = examsCache.map(e => {
    const daysLeft = getDaysLeft(e.exam_date);
    let badgeClass = 'badge-primary';
    let textDays = daysLeft + ' Hari Lagi';
    
    if (daysLeft < 0) {
      badgeClass = 'bg-base-300 text-base-content/70 border-none';
      textDays = 'Selesai';
    } else if (daysLeft === 0) {
      badgeClass = 'badge-error animate-pulse';
      textDays = 'HARI INI!';
    } else if (daysLeft <= 3) {
      badgeClass = 'badge-error';
    } else if (daysLeft <= 7) {
      badgeClass = 'badge-warning';
    }

    const formattedDate = e.exam_date ? new Date(e.exam_date).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : '';

    return `
      <div onclick="window.openExamForm('${e.id}')" class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm cursor-pointer transition-all hover:border-primary/30">
        <div class="p-3 bg-error/10 text-error rounded-xl">📅</div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm">${esc(e.title)}</h4>
          <p class="text-xs text-base-content/60">${esc(getCourseName(e.course_id))} • ${esc(e.room || '-')}</p>
          <p class="text-xs text-base-content/80 mt-0.5 font-medium">
            ${formattedDate} ${e.exam_date && e.exam_date.includes('T') ? '| ' + e.exam_date.split('T')[1].substring(0,5) : ''}
          </p>
        </div>
        <div class="badge ${badgeClass} badge-sm font-bold shadow-sm whitespace-nowrap">${textDays}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-3">
      ${examsHtml}
    </div>
  `;
}

// Fungsi global untuk form ujian
window.openExamForm = function(id = null) {
  const existing = id ? examsCache.find(e => e.id === id) : null;
  const e = existing || { title: '', course_id: '', exam_date: '', room: '' };
  
  // Format tanggal untuk input type="date"
  const dateVal = e.exam_date ? e.exam_date.split('T')[0] : '';

  openSheet(existing ? 'Edit Ujian' : 'Tambah Ujian', `
    <div class="form-control gap-3 text-xs">
      <div id="ex_alert" class="hidden bg-error/20 border border-error text-error px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
        ⚠️ Peringatan: Nama Ujian dan Tanggal wajib diisi!
      </div>

      <div>
        <label class="label label-text font-bold">Nama Ujian (Misal: UTS/UAS)</label>
        <input id="f_ex_title" class="input input-bordered input-sm w-full" value="${esc(e.title || '')}" placeholder="Contoh: UTS Struktur Data" />
      </div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_ex_course" class="select select-bordered select-sm w-full">
          <option value="">Pilih Mata Kuliah...</option>
          ${coursesCache.map(c => `<option value="${c.id}" ${e.course_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label label-text font-bold">Tanggal & Waktu Ujian</label>
        <input type="datetime-local" id="f_ex_date" class="input input-bordered input-sm w-full" value="${e.exam_date ? e.exam_date.substring(0,16) : ''}" />
      </div>
      <div>
        <label class="label label-text font-bold">Ruangan / Link</label>
        <input id="f_ex_room" class="input input-bordered input-sm w-full" value="${esc(e.room || '')}" placeholder="Contoh: Lab Komputer / Zoom" />
      </div>
      
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelEx">🗑️ Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveEx">Simpan</button>
      </div>
    </div>
  `);
  
  document.getElementById('btnSaveEx').onclick = async () => {
    const title = document.getElementById('f_ex_title').value.trim();
    const exam_date = document.getElementById('f_ex_date').value;
    
    if(!title || !exam_date) {
      const alertBox = document.getElementById('ex_alert');
      alertBox.classList.remove('hidden');
      setTimeout(() => { if(alertBox) alertBox.classList.add('hidden'); }, 3000);
      return;
    }
    
    const payload = {
      title,
      course_id: document.getElementById('f_ex_course').value || null,
      exam_date,
      room: document.getElementById('f_ex_room').value
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    if (existing && existing.id) {
      await supabase.from('exams').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('exams').insert([payload]);
    }
    
    closeSheet(); 
    fetchExamsData();
  };
  
  if(existing) {
    document.getElementById('btnDelEx').onclick = () => { 
      openSheet('Hapus Ujian', `
        <div class="space-y-4 text-xs">
          <p>Yakin ingin menghapus jadwal ujian <b>${esc(existing.title)}</b>?</p>
          <div class="flex gap-2">
            <button class="btn btn-neutral btn-sm flex-1" id="cancelDel">Batal</button>
            <button class="btn btn-error btn-sm flex-1" id="confirmDel">Ya, Hapus</button>
          </div>
        </div>
      `);

      document.getElementById('cancelDel').onclick = () => window.openExamForm(existing.id);
      document.getElementById('confirmDel').onclick = async () => {
        await supabase.from('exams').delete().eq('id', existing.id);
        closeSheet(); 
        fetchExamsData();
      };
    };
  }
};

// Tombol global pembuka form ujian
App.openExamForm = () => window.openExamForm(null);