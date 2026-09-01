/**
 * pages/settings.js
 * Pengaturan Aplikasi, Profil Mahasiswa, dan Backup/Restore Data
 */
import { state } from '../core/state.js';
import { DB } from '../data/db.js';
import { render } from '../core/render.js';
import { supabase } from '../data/supabase.js';

export function pageSettings() {
  const settings = DB.settings ? DB.settings.get() : { name: 'Mahasiswa', dark: false };

  return `
    <div class="space-y-4 max-w-md mx-auto">
      
      <!-- Kartu Profil Mahasiswa -->
      <div class="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/50">Profil Mahasiswa</h3>
        
        <div class="form-control">
          <label class="label text-xs font-medium">Nama Lengkap / Panggilan</label>
          <input type="text" id="inputName" value="${settings.name || ''}" placeholder="Masukkan nama Anda" class="input input-bordered input-sm bg-base-100" />
        </div>

        <div class="form-control">
          <label class="label text-xs font-medium">NIM / Nomor Induk</label>
          <input type="text" id="inputNim" value="${settings.nim || ''}" placeholder="Contoh: 12345678" class="input input-bordered input-sm bg-base-100" />
        </div>

        <div class="form-control">
          <label class="label text-xs font-medium">Program Studi / Jurusan</label>
          <input type="text" id="inputProdi" value="${settings.prodi || ''}" placeholder="Contoh: Teknik Informatika" class="input input-bordered input-sm bg-base-100" />
        </div>

        <button onclick="App.saveProfile()" class="btn btn-primary btn-sm w-full mt-2">Simpan Profil</button>
      </div>

      <!-- Kartu Backup & Restore Data (Lokal) -->
      <div class="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/50">Backup & Pemulihan Data</h3>
        <p class="text-[11px] text-base-content/60 leading-relaxed">
          Amankan data aplikasi Anda dengan mengunduhnya ke file cadangan, atau pulihkan kembali kapan saja.
        </p>
        
        <div class="flex gap-2 pt-1">
          <button onclick="App.exportData()" class="btn btn-outline btn-sm flex-1">📥 Unduh Backup</button>
          <label class="btn btn-outline btn-sm flex-1 cursor-pointer">
            📤 Pulihkan Data
            <input type="file" id="importFile" accept=".json" class="hidden" onchange="App.importData(event)" />
          </label>
        </div>
      </div>

      <!-- Pengaturan Tema -->
      <div class="bg-base-100 border border-base-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 class="font-bold text-xs">Mode Gelap (Dark Mode)</h3>
          <p class="text-[10px] text-base-content/50">Sesuaikan kenyamanan mata</p>
        </div>
        <input type="checkbox" id="toggleDark" class="toggle toggle-primary toggle-sm" ${settings.dark ? 'checked' : ''} />
      </div>
      <button onclick="App.handleLogout()" class="btn btn-error btn-outline btn-sm w-full mt-4">Keluar Akun (Logout)</button>

    </div>
  `;
}

// Tambahan Fungsi Global ke App Namespace untuk Profil & Backup
import { App } from '../core/app-namespace.js';

App.saveProfile = () => {
  const name = document.getElementById('inputName').value;
  const nim = document.getElementById('inputNim').value;
  const prodi = document.getElementById('inputProdi').value;

  const settings = DB.settings.get();
  settings.name = name;
  settings.nim = nim;
  settings.prodi = prodi;
  DB.settings.save(settings);

  alert('Profil berhasil diperbarui! 🎉');
  render();
};

// Tambahkan fungsi logout ke App Namespace
App.handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    alert('Berhasil keluar akun.');
    window.location.reload();
  } else {
    alert('Gagal keluar: ' + error.message);
  }
};

App.exportData = () => {
  // Mengambil seluruh data dari localStorage / DB
  const backupData = {
    settings: DB.settings.get(),
    tasks: DB.tasks ? DB.tasks.all() : [],
    courses: DB.courses ? DB.courses.all() : [],
    schedules: DB.schedules ? DB.schedules.all() : [],
    notes: DB.notes ? DB.notes.all() : [],
    grades: DB.grades ? DB.grades.all() : [],
    exams: DB.exams ? DB.exams.all() : [],
    version: '3.0'
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `campusmate_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

App.importData = (event) => {
  const fileReader = new FileReader();
  if (event.target.files[0]) {
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        
        // Simpan kembali ke masing-masing modul penyimpanan lokal
        if (parsedData.settings) DB.settings.save(parsedData.settings);
        if (parsedData.tasks && DB.tasks) localStorage.setItem('campusmate_tasks', JSON.stringify(parsedData.tasks));
        if (parsedData.courses && DB.courses) localStorage.setItem('campusmate_courses', JSON.stringify(parsedData.courses));
        if (parsedData.schedules && DB.schedules) localStorage.setItem('campusmate_schedules', JSON.stringify(parsedData.schedules));
        if (parsedData.notes && DB.notes) localStorage.setItem('campusmate_notes', JSON.stringify(parsedData.notes));
        if (parsedData.grades && DB.grades) localStorage.setItem('campusmate_grades', JSON.stringify(parsedData.grades));
        if (parsedData.exams && DB.exams) localStorage.setItem('campusmate_exams', JSON.stringify(parsedData.exams));

        alert('Data berhasil dipulihkan! Halaman akan dimuat ulang. 🔄');
        window.location.reload();
      } catch (err) {
        alert('Gagal memuat file! Pastikan format file JSON backup valid.');
      }
    };
  }
};