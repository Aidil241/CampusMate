// js/pages/exams.js
import { DB } from '../data/db.js';
import { openSheet, closeSheet } from '../ui/sheet.js';

// Fungsi bantu untuk menghitung sisa hari
function getDaysLeft(dateString) {
  if (!dateString) return null;
  const examDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = examDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 1. PASTIKAN ADA KATA KUNCI 'export' DI SINI
export function pageExams() {
  const list = DB.exams.all();
  
  // Mengurutkan ujian berdasarkan tanggal yang paling dekat
  list.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (list.length === 0) {
    return `
      <div class="space-y-3">
        <div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">
          📭<br>Belum ada jadwal ujian
        </div>
      </div>
    `;
  }

  const examsHtml = list.map(e => {
    const daysLeft = getDaysLeft(e.date);
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

    return `
      <div onclick="window.openExamForm('${e.id}')" class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm cursor-pointer transition-all hover:border-primary/30">
        <div class="p-3 bg-error/10 text-error rounded-xl">
          📅
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm">${e.name}</h4>
          <p class="text-xs text-base-content/60">${e.course} • ${e.room || '-'}</p>
          <p class="text-xs text-base-content/80 mt-0.5 font-medium">
            ${e.date ? new Date(e.date).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : ''} | ${e.time}
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

window.openExamForm = function(id = null) {
  const existing = id ? DB.exams.all().find(e => e.id === id) : null;
  const e = existing || {name: '', course: '', date: '', time: '', room: ''};
  
  window.openSheet(existing ? 'Edit Ujian' : 'Tambah Ujian', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Nama Ujian (Misal: UTS/UAS)</label>
        <input id="f_ex_name" class="input input-bordered input-sm w-full" value="${e.name}" placeholder="Contoh: UTS Struktur Data" />
      </div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <input id="f_ex_course" class="input input-bordered input-sm w-full" value="${e.course}" placeholder="Contoh: Struktur Data" />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">Tanggal</label>
          <input type="date" id="f_ex_date" class="input input-bordered input-sm w-full" value="${e.date}" />
        </div>
        <div>
          <label class="label label-text font-bold">Waktu</label>
          <input type="time" id="f_ex_time" class="input input-bordered input-sm w-full" value="${e.time}" />
        </div>
      </div>
      <div>
        <label class="label label-text font-bold">Ruangan / Link</label>
        <input id="f_ex_room" class="input input-bordered input-sm w-full" value="${e.room}" />
      </div>
      
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelEx">🗑️ Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveEx">Simpan</button>
      </div>
    </div>
  `);
  
  document.getElementById('btnSaveEx').onclick = () => {
    const name = document.getElementById('f_ex_name').value.trim();
    const date = document.getElementById('f_ex_date').value;
    
    if(!name || !date) return alert('Peringatan: Nama Ujian dan Tanggal wajib diisi!');
    
    DB.exams.save({
      id: e.id, 
      name, 
      course: document.getElementById('f_ex_course').value, 
      date,
      time: document.getElementById('f_ex_time').value,
      room: document.getElementById('f_ex_room').value
    });
    
    window.closeSheet(); 
    window.location.reload(); // Memperbarui halaman secara aman
  };
  
  if(existing) {
    document.getElementById('btnDelEx').onclick = () => { 
      if(confirm('Yakin ingin menghapus jadwal ujian ini?')) {
        DB.exams.remove(e.id); 
        window.closeSheet(); 
        window.location.reload(); 
      }
    };
  }
}