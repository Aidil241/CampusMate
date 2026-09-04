/**
 * pages/settings.js
 * Halaman Pengaturan (Profil, Reminder, Backup, Reset).
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
  if (!error && data) profileCache = data;
  
  isFetchingProfile = false;
  render();
}

fetchProfileData();

export function pageSettings() {
  if (!profileCache && !isFetchingProfile) {
    fetchProfileData();
  }

  const p = profileCache || { name: 'Mahasiswa', major: 'Teknik Informatika', campus: 'Universitas' };
  const isReminderActive = ('Notification' in window) && Notification.permission === 'granted' && localStorage.getItem('app_reminder') === '1';

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

      <!-- Pengingat & Notifikasi (REMINDER) -->
      <div class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-xs mb-0.5">Notifikasi Pengingat</h3>
            <p class="text-[10px] text-base-content/60">Push notif untuk kelas & deadline tugas</p>
          </div>
          <input type="checkbox" class="toggle toggle-primary toggle-sm" onchange="window.handleReminderToggle(this)" ${isReminderActive ? 'checked' : ''} />
        </div>
      </div>

      <!-- Menu Backup & Restore -->
      <div class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-3">
        <div>
          <h3 class="font-bold text-xs mb-1">Data & Sinkronisasi (Backup)</h3>
          <p class="text-[10px] text-base-content/60">
            Cadangkan data akademik Anda ke file JSON, atau pulihkan dari file sebelumnya.
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
          <h3 class="font-bold text-xs text-error mb-1">Zona Berbahaya</h3>
          <p class="text-[10px] text-error/70">Hapus seluruh data akademik dari database secara permanen.</p>
        </div>
        <button onclick="window.confirmFactoryReset()" class="btn btn-error btn-sm w-full font-bold">
          🗑️ Hapus Semua Data
        </button>
      </div>
    </div>
  `;
}

// === FUNGSI TOGGLE REMINDER ===
window.handleReminderToggle = async function(el) {
  if (el.checked) {
    if (!('Notification' in window)) {
      alert('Browser ini tidak mendukung notifikasi otomatis.');
      el.checked = false;
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      localStorage.setItem('app_reminder', '1');
      alert('Fitur Pengingat Aktif! Aplikasi akan memberikan notifikasi otomatis.');
      window.location.reload(); // Memuat ulang agar engine ReminderSys otomatis berjalan
    } else {
      alert('Izin notifikasi ditolak. Anda harus mengizinkannya di pengaturan browser.');
      el.checked = false;
    }
  } else {
    localStorage.setItem('app_reminder', '0');
  }
};

// === FUNGSI LAINNYA (Profile, Backup, Reset) SAMA SEPERTI SEBELUMNYA ===
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
    if (!name) return alert('Nama tidak boleh kosong!');

    const payload = { name, major, campus };
    const { data: { user } } = await supabase.auth.getUser();
    if (user) payload.user_id = user.id;

    if (profileCache && profileCache.id) await supabase.from('profiles').update(payload).eq('id', profileCache.id);
    else await supabase.from('profiles').insert([payload]);

    closeSheet();
    fetchProfileData();
  };
};

window.exportBackup = async function() {
  try {
    openSheet('Mencadangkan...', '<div class="p-6 text-center text-xs font-medium animate-pulse">Mengambil data dari server...</div>');
    const tables = ['profiles', 'courses', 'schedules', 'tasks', 'exams', 'notes', 'grades'];
    const backupData = {};
    for (const table of tables) {
      const { data } = await supabase.from(table).select('*');
      backupData[table] = data || [];
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadNode = document.createElement('a');
    downloadNode.setAttribute("href", dataStr);
    downloadNode.setAttribute("download", `CampusMate_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadNode);
    downloadNode.click();
    downloadNode.remove();
    closeSheet();
  } catch (err) { alert('Gagal backup: ' + err.message); }
};

window.triggerImport = () => document.getElementById('importFile').click();

window.importBackup = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      openSheet('Memulihkan...', '<div class="p-6 text-center text-xs font-medium animate-pulse">Menulis data ke server...</div>');
      const tables = ['profiles', 'courses', 'schedules', 'tasks', 'exams', 'notes', 'grades'];
      for (const table of tables) {
        if (importedData[table] && importedData[table].length > 0) {
          await supabase.from(table).upsert(importedData[table]);
        }
      }
      closeSheet();
      alert('Data dipulihkan!');
      window.location.reload();
    } catch (err) { alert('Gagal import: ' + err.message); }
    event.target.value = '';
  };
  reader.readAsText(file);
};

window.confirmFactoryReset = function() {
  openSheet('Peringatan Berbahaya', `
    <div class="space-y-4 text-xs">
      <p class="text-error font-bold">Yakin ingin menghapus SEMUA data?</p>
      <div class="flex gap-2 pt-2">
        <button class="btn btn-neutral btn-sm flex-1" onclick="window.closeSheet()">Batal</button>
        <button class="btn btn-error btn-sm flex-1" id="confirmResetBtn">Ya, Hapus</button>
      </div>
    </div>
  `);
  document.getElementById('confirmResetBtn').onclick = async () => {
    try {
      openSheet('Menghapus...', '<div class="p-6 text-center text-xs text-error font-medium animate-pulse">Menghapus data...</div>');
      const { data: { user } } = await supabase.auth.getUser();
      const tables = ['schedules', 'tasks', 'exams', 'notes', 'grades', 'courses']; 
      for (const table of tables) await supabase.from(table).delete().eq('user_id', user.id);
      closeSheet();
      alert('Seluruh data berhasil dihapus.');
      window.location.reload();
    } catch (err) { alert('Gagal reset: ' + err.message); }
  };
};