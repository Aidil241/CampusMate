/**
 * pages/settings.js
 * Halaman Pengaturan, Profil Mahasiswa, & Backup Data (Supabase Edition).
 */
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';

let profileCache = null;
let isFetchingProfile = false;

async function fetchProfileData() {
  if (isFetchingProfile) return;
  isFetchingProfile = true;

  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (!error && data) {
    profileCache = data;
  }
  
  isFetchingProfile = false;
  render();
}

fetchProfileData();

export function pageSettings() {
  if (!profileCache && !isFetchingProfile) {
    fetchProfileData();
  }

  const p = profileCache || { name: 'Mahasiswa', major: 'Teknik Informatika', campus: 'Universitas' };

  return `
    <div class="space-y-4">
      <!-- Section Profil Mahasiswa -->
      <div class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-black text-primary">
            ${p.name ? p.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-sm truncate">${esc(p.name)}</h3>
            <p class="text-[10px] text-base-content/60 truncate">${esc(p.major || '-')} • ${esc(p.campus || '-')}</p>
          </div>
          <button onclick="window.openEditProfileForm()" class="btn btn-outline btn-xs btn-primary">
            Edit
          </button>
        </div>
      </div>

      <!-- Menu Backup & Restore -->
      <div class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-3">
        <div>
          <h3 class="font-bold text-xs mb-1">Data & Sinkronisasi (Backup)</h3>
          <p class="text-[10px] text-base-content/60">
            Cadangkan seluruh data akademik Anda ke dalam file JSON secara lokal sebagai pengaman ekstra, atau pulihkan data dari file cadangan sebelumnya.
          </p>
        </div>
        
        <div class="flex flex-col gap-2 pt-2">
          <button onclick="window.exportBackup()" class="btn btn-primary btn-sm flex items-center justify-center gap-2">
            📥 Ekspor Data (Backup)
          </button>
          <button onclick="window.triggerImport()" class="btn btn-outline btn-sm flex items-center justify-center gap-2">
            📤 Impor Data (Restore)
          </button>
          <input type="file" id="importFile" accept=".json" class="hidden" onchange="window.importBackup(event)" />
        </div>
      </div>
      
      <!-- Zona Berbahaya -->
      <div class="p-4 bg-error/10 border border-error/20 rounded-2xl shadow-sm space-y-3 mt-8">
        <div>
          <h3 class="font-bold text-xs text-error mb-1">Reset Data</h3>
          <p class="text-[10px] text-error/70">
            Hapus seluruh data akademik Anda dari database secara permanen. Tindakan ini tidak dapat dibatalkan!
          </p>
        </div>
        <button onclick="window.confirmFactoryReset()" class="btn btn-error btn-sm w-full font-bold">
           Hapus Semua Data
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// FUNGSI EDIT PROFIL MAHASISWA
// ==========================================
window.openEditProfileForm = function() {
  const p = profileCache || { name: '', major: '', campus: '' };

  openSheet('Edit Profil', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Nama Lengkap / Panggilan</label>
        <input id="f_prof_name" class="input input-bordered input-sm w-full" value="${esc(p.name || '')}" placeholder="Contoh: Alex" />
      </div>
      <div>
        <label class="label label-text font-bold">Program Studi / Jurusan</label>
        <input id="f_prof_major" class="input input-bordered input-sm w-full" value="${esc(p.major || '')}" placeholder="Contoh: Teknik Informatika" />
      </div>
      <div>
        <label class="label label-text font-bold">Universitas / Kampus</label>
        <input id="f_prof_campus" class="input input-bordered input-sm w-full" value="${esc(p.campus || '')}" placeholder="Contoh: Universitas Indonesia" />
      </div>

      <button class="btn btn-primary btn-sm mt-4 w-full" id="btnSaveProfile">Simpan Profil</button>
    </div>
  `);

  document.getElementById('btnSaveProfile').onclick = async () => {
    const name = document.getElementById('f_prof_name').value.trim();
    const major = document.getElementById('f_prof_major').value.trim();
    const campus = document.getElementById('f_prof_campus').value.trim();

    if (!name) {
      alert('Nama tidak boleh kosong!');
      return;
    }

    const payload = { name, major, campus };
    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    let error = null;
    if (profileCache && profileCache.id) {
      const res = await supabase.from('profiles').update(payload).eq('id', profileCache.id);
      error = res.error;
    } else {
      const res = await supabase.from('profiles').insert([payload]);
      error = res.error;
    }

    if (!error) {
      closeSheet();
      fetchProfileData();
    } else {
      alert('Gagal menyimpan profil: ' + error.message);
    }
  };
};

// ==========================================
// FUNGSI BACKUP (EKSPOR KE JSON)
// ==========================================
window.exportBackup = async function() {
  try {
    openSheet('Mencadangkan...', '<div class="p-6 text-center text-xs font-medium animate-pulse">Mengambil data dari server Supabase...</div>');
    
    const tables = ['profiles', 'courses', 'schedules', 'tasks', 'exams', 'notes', 'grades'];
    const backupData = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      backupData[table] = data || [];
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadNode = document.createElement('a');
    downloadNode.setAttribute("href", dataStr);
    
    const date = new Date().toISOString().slice(0,10);
    downloadNode.setAttribute("download", `CampusMate_Backup_${date}.json`);
    
    document.body.appendChild(downloadNode);
    downloadNode.click();
    downloadNode.remove();
    
    closeSheet();
    alert('Backup berhasil diunduh ke perangkat Anda!');
  } catch (err) {
    closeSheet();
    alert('Gagal melakukan backup: ' + err.message);
  }
};

// ==========================================
// FUNGSI RESTORE (IMPOR DARI JSON)
// ==========================================
window.triggerImport = function() {
  document.getElementById('importFile').click();
};

window.importBackup = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      openSheet('Memulihkan...', '<div class="p-6 text-center text-xs font-medium animate-pulse">Menulis ulang data ke server Supabase...<br>Jangan tutup aplikasi!</div>');
      
      const tables = ['profiles', 'courses', 'schedules', 'tasks', 'exams', 'notes', 'grades'];
      
      for (const table of tables) {
        if (importedData[table] && importedData[table].length > 0) {
          const { error } = await supabase.from(table).upsert(importedData[table]);
          if (error) throw error;
        }
      }
      
      closeSheet();
      alert('Data berhasil dipulihkan! Aplikasi akan dimuat ulang.');
      window.location.reload();
    } catch (err) {
      closeSheet();
      alert('Gagal memulihkan data: ' + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
};

// ==========================================
// FUNGSI RESET DATA
// ==========================================
window.confirmFactoryReset = function() {
  openSheet('Peringatan Berbahaya', `
    <div class="space-y-4 text-xs">
      <p class="text-error font-bold">Apakah Anda benar-benar yakin ingin menghapus SEMUA data?</p>
      <p class="text-base-content/70">Pastikan Anda sudah melakukan Backup terlebih dahulu. Data yang dihapus tidak bisa dikembalikan lagi.</p>
      <div class="flex gap-2 pt-2">
        <button class="btn btn-neutral btn-sm flex-1" onclick="window.closeSheet()">Batal</button>
        <button class="btn btn-error btn-sm flex-1" id="confirmResetBtn">Ya, Hapus Permanen</button>
      </div>
    </div>
  `);

  document.getElementById('confirmResetBtn').onclick = async () => {
    try {
      openSheet('Menghapus...', '<div class="p-6 text-center text-xs font-medium text-error animate-pulse">Memusnahkan data dari server...</div>');
      
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) throw new Error("Sesi pengguna tidak valid.");

      const tables = ['schedules', 'tasks', 'exams', 'notes', 'grades', 'courses']; 
      
      for (const table of tables) {
        await supabase.from(table).delete().eq('user_id', user.id);
      }
      
      closeSheet();
      alert('Seluruh data berhasil dihapus.');
      window.location.reload();
    } catch (err) {
      closeSheet();
      alert('Gagal menghapus data: ' + err.message);
    }
  };
};