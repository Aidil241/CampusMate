/**
 * pages/settings.js
 * Halaman Pengaturan (Profil, Tampilan & Tema, Pengingat, Backup, Reset).
 * Standard: CampusMate M3 / Android-first / The Focused Scholar.
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { openSheet, closeSheet } from '../ui/sheet.js';
import { render } from '../core/render.js';
import { DB } from '../data/db.js';
import { applyTheme } from '../ui/theme.js';
import { ReminderSys } from '../utils/reminder.js';
import {
  fetchSharedProfile,
  updateSharedProfile,
  getCachedProfile,
  subscribeProfile
} from '../data/profile.js';
import { clearAllUserCaches } from '../core/session.js';

let profileCache = getCachedProfile();
let isFetchingProfile = false;
let userSessionEmail = '';
let pendingImportData = null;

export function resetSettingsProfileCache() {
  profileCache = null;
  userSessionEmail = '';
  isFetchingProfile = false;
}

// Sinkronkan cache lokal settings saat profil diubah di manapun
subscribeProfile((updatedProfile) => {
  profileCache = updatedProfile;
  if (updatedProfile && updatedProfile.email) {
    userSessionEmail = updatedProfile.email;
  }
});

/**
 * Helper notifikasi toast konsisten CampusMate
 */
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

/**
 * Ambil data profil & info user aktif dari Supabase via profile service
 */
async function fetchProfileData(forceRefresh = false) {
  if (isFetchingProfile) return;
  isFetchingProfile = true;

  try {
    const profile = await fetchSharedProfile(forceRefresh);
    if (profile) {
      profileCache = profile;
      userSessionEmail = profile.email || '';
    }
  } catch (err) {
    console.error('Error fetching profile data:', err);
  } finally {
    isFetchingProfile = false;
    render();
  }
}

fetchProfileData();

export function pageSettings() {
  if (!profileCache && !isFetchingProfile) {
    fetchProfileData();
  }

  const p = profileCache || { name: '', major: '', campus: '' };
  const isReminderActive = localStorage.getItem('app_reminder') === '1';
  const currentSettings = DB.settings.get();
  const currentTheme = currentSettings.theme || (currentSettings.dark ? 'dark' : 'system');

  // Inisial avatar
  const avatarChar = p.name ? p.name.trim().charAt(0).toUpperCase() : '';

  return `
    <div class="space-y-4 max-w-lg mx-auto pb-8 px-1">
      
      <!-- Section 1: Profil Mahasiswa & Akun Terpadu -->
      <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4">
        ${isFetchingProfile && !profileCache ? `
          <!-- Shimmer Skeleton Profil -->
          <div class="flex items-center gap-3.5 animate-pulse">
            <div class="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div class="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
          </div>
        ` : `
          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-2xl bg-brand/10 dark:bg-indigo-950/60 border border-brand/20 dark:border-indigo-800/60 flex items-center justify-center text-xl font-bold text-brand dark:text-indigo-300 font-display flex-shrink-0">
              ${avatarChar || `<span class="w-6 h-6">${ICON.user}</span>`}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-display font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                ${p.name ? esc(p.name) : '<span class="italic font-normal text-slate-400 dark:text-slate-500">Nama belum diisi</span>'}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                ${(p.major || p.campus) 
                  ? `${esc(p.major || 'Program Studi')} · ${esc(p.campus || 'Kampus')}` 
                  : '<span class="italic text-slate-400 dark:text-slate-500">Data jurusan & kampus belum diisi</span>'}
              </p>
              ${userSessionEmail ? `
                <p class="text-xs font-medium text-brand dark:text-indigo-300 truncate mt-1">
                  ${esc(userSessionEmail)}
                </p>
              ` : ''}
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button onclick="App.openEditProfileForm()" 
              class="min-h-[48px] flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 active:scale-[0.98] font-display font-semibold text-xs transition-all flex items-center justify-center gap-2">
              <span>Edit Profil</span>
            </button>
            <button onclick="App.confirmLogout()" 
              class="min-h-[48px] py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 active:scale-[0.98] font-display font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              title="Keluar dari akun">
              <span class="w-4 h-4 text-slate-500 dark:text-slate-400">${ICON.logOut}</span>
              <span>Keluar</span>
            </button>
          </div>
        `}
      </div>

      <!-- Section 2: Tampilan & Tema (M3 Segmented Pill Switcher) -->
      <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3">
        <div>
          <h3 class="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Tampilan & Tema</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih tema antarmuka yang nyaman untuk waktu belajar Anda.</p>
        </div>

        <div class="bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-1.5 rounded-2xl flex items-center justify-center gap-1.5">
          <button onclick="App.setThemeMode('system')" 
            class="min-h-[48px] flex-1 py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              currentTheme === 'system' 
                ? 'bg-brand text-white dark:bg-indigo-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }">
            <span class="w-4 h-4">${ICON.monitor}</span>
            <span>Sistem</span>
          </button>
          <button onclick="App.setThemeMode('light')" 
            class="min-h-[48px] flex-1 py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              currentTheme === 'light' 
                ? 'bg-brand text-white dark:bg-indigo-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }">
            <span class="w-4 h-4">${ICON.sun}</span>
            <span>Terang</span>
          </button>
          <button onclick="App.setThemeMode('dark')" 
            class="min-h-[48px] flex-1 py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              currentTheme === 'dark' 
                ? 'bg-brand text-white dark:bg-indigo-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }">
            <span class="w-4 h-4">${ICON.moon}</span>
            <span>Gelap</span>
          </button>
        </div>
      </div>

      <!-- Section 3: Pengingat & Notifikasi -->
      <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-brand dark:text-indigo-300 flex items-center justify-center flex-shrink-0">
              <span class="w-5 h-5">${ICON.bell}</span>
            </div>
            <div class="min-w-0">
              <h3 class="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Notifikasi Pengingat</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pengingat tenggat tugas & ujian di perangkat</p>
            </div>
          </div>
          <label class="relative inline-flex items-center justify-center p-2 min-w-[48px] min-h-[48px] cursor-pointer select-none flex-shrink-0">
            <input type="checkbox" onchange="App.handleReminderToggle(this)" ${isReminderActive ? 'checked' : ''} class="toggle toggle-primary h-7 w-12 cursor-pointer" />
          </label>
        </div>
        <div class="pt-1 flex items-center gap-2 text-xs ${isReminderActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}">
          <span class="w-2 h-2 rounded-full ${isReminderActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}"></span>
          <span>${isReminderActive ? 'Notifikasi aktif untuk tugas & ujian' : 'Notifikasi perangkat nonaktif'}</span>
        </div>
      </div>

      <!-- Section 4: Data & Sinkronisasi (Backup & Restore) -->
      <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3">
        <div>
          <h3 class="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Cadangan & Pemulihan Data</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadangkan seluruh data akademik Anda ke file JSON atau pulihkan dari file sebelumnya.
          </p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button onclick="App.exportBackup()" 
            class="min-h-[48px] py-2.5 px-4 rounded-2xl bg-brand/10 hover:bg-brand/15 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60 font-display font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            <span class="w-4 h-4">${ICON.download}</span>
            <span>Ekspor Data (Backup)</span>
          </button>
          
          <button onclick="App.triggerImport()" 
            class="min-h-[48px] py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 font-display font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            <span class="w-4 h-4">${ICON.upload}</span>
            <span>Impor Data (Restore)</span>
          </button>
          <input type="file" id="importFile" accept=".json" class="hidden" onchange="App.importBackup(event)" />
        </div>
      </div>

      <!-- Section 5: Data & Penyimpanan -->
<div class="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl space-y-3 mt-6">
  <div class="flex items-center gap-2.5 text-base-content dark:text-slate-100">
    <span class="w-4 h-4">${ICON.alertTriangle}</span>
    <h3 class="font-display font-bold text-sm">Data & Penyimpanan</h3>
  </div>

  <p class="text-xs text-base-content/70 dark:text-slate-300 leading-relaxed">
    Kelola data akademik yang tersimpan di CampusMate. Penghapusan data bersifat permanen dan tidak dapat dibatalkan.
  </p>

  <button onclick="App.confirmFactoryReset()" 
    class="min-h-[48px] w-full py-2.5 px-4 rounded-2xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-display font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
    <span class="w-4 h-4">${ICON.trash}</span>
    <span>Hapus Semua Data Akademik</span>
  </button>
</div>
    </div>
  `;
}

// === INTERAKSI & HANDLERS DI ATAS NAMESPACE APP ===

App.setThemeMode = (mode) => {
  const s = DB.settings.get();
  s.theme = mode;
  if (mode === 'dark') {
    s.dark = true;
  } else if (mode === 'light') {
    s.dark = false;
  } else {
    // Mode 'system'
    s.dark = typeof window !== 'undefined' && 
             window.matchMedia && 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  DB.settings.save(s);
  applyTheme();
  render();
};

App.handleReminderToggle = async (el) => {
  if (el.checked) {
    el.disabled = true;
    try {
      const granted = await ReminderSys.requestPermission();
      el.disabled = false;

      if (granted) {
        localStorage.setItem('app_reminder', '1');
        await ReminderSys.ensureChannel();
        ReminderSys.setupTapListener();
        await ReminderSys.syncAll();
        showToast('Notifikasi pengingat berhasil diaktifkan');
        render();
      } else {
        el.checked = false;
        localStorage.setItem('app_reminder', '0');
        showToast('Izin notifikasi belum diberikan di pengaturan perangkat', true);
        render();
      }
    } catch (err) {
      el.disabled = false;
      el.checked = false;
      localStorage.setItem('app_reminder', '0');
      showToast('Gagal mengaktifkan notifikasi: ' + (err.message || 'Terjadi kesalahan'), true);
      render();
    }
  } else {
    localStorage.setItem('app_reminder', '0');
    try {
      await ReminderSys.cancelAll();
    } catch (e) {}
    showToast('Notifikasi pengingat dinonaktifkan');
    render();
  }
};

App.openEditProfileForm = () => {
  const p = profileCache || { name: '', major: '', campus: '' };
  openSheet('Edit Profil Mahasiswa', `
    <div class="space-y-4 text-left">
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap / Panggilan</label>
        <input id="f_prof_name" class="input input-bordered h-12 w-full text-sm rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100" value="${esc(p.name || '')}" placeholder="Contoh: Alex" />
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Program Studi / Jurusan</label>
        <input id="f_prof_major" class="input input-bordered h-12 w-full text-sm rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100" value="${esc(p.major || '')}" placeholder="Contoh: Teknik Informatika" />
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Universitas / Kampus</label>
        <input id="f_prof_campus" class="input input-bordered h-12 w-full text-sm rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100" value="${esc(p.campus || '')}" placeholder="Contoh: Universitas Indonesia" />
      </div>

      <div class="flex gap-2.5 pt-2">
        <button type="button" onclick="App.closeSheet()" class="btn btn-ghost bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[48px] rounded-xl flex-1 font-semibold text-xs cursor-pointer">
          Batal
        </button>
        <button type="button" id="btnSaveProfile" onclick="App.saveProfile()" class="btn bg-brand hover:bg-brand-dark text-white min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center cursor-pointer transition-all active:scale-[0.99]">
          Simpan Profil
        </button>
      </div>
    </div>
  `);
};

App.saveProfile = async () => {
  const nameInput = document.getElementById('f_prof_name');
  const majorInput = document.getElementById('f_prof_major');
  const campusInput = document.getElementById('f_prof_campus');
  if (!nameInput) return;

  const name = nameInput.value.trim();
  const major = majorInput ? majorInput.value.trim() : '';
  const campus = campusInput ? campusInput.value.trim() : '';

  if (!name) {
    showToast('Nama tidak boleh kosong', true);
    return;
  }

  const btn = document.getElementById('btnSaveProfile');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Menyimpan...';
  }

  try {
    const updated = await updateSharedProfile({ name, major, campus });
    if (updated) {
      profileCache = updated;
    }

    closeSheet();
    showToast('Profil berhasil disimpan');
    render();
  } catch (err) {
    console.error('Error saving profile:', err);
    showToast('Gagal menyimpan profil: ' + (err.message || 'Terjadi kesalahan'), true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Simpan Profil';
    }
  }
};

App.exportBackup = async () => {
  try {
    showToast('Menyiapkan file cadangan...');
    const tables = ['profiles', 'courses', 'schedules', 'tasks', 'exams', 'notes', 'grades'];
    const backupData = {};
    for (const table of tables) {
      const { data } = await supabase.from(table).select('*');
      backupData[table] = data || [];
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadNode = document.createElement('a');
    downloadNode.setAttribute("href", dataStr);
    downloadNode.setAttribute("download", `CampusMate_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadNode);
    downloadNode.click();
    downloadNode.remove();
    showToast('Data berhasil dicadangkan');
  } catch (err) {
    showToast('Gagal mencadangkan data: ' + (err.message || 'Terjadi kesalahan'), true);
  }
};

App.triggerImport = () => {
  const input = document.getElementById('importFile');
  if (input) input.click();
};

App.importBackup = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    let importedData = null;
    try {
      importedData = JSON.parse(e.target.result);
    } catch (err) {
      showToast('File bukan format JSON yang valid', true);
      event.target.value = '';
      return;
    }

    if (!importedData || typeof importedData !== 'object') {
      showToast('Struktur file cadangan tidak valid', true);
      event.target.value = '';
      return;
    }

    const summary = [
      { label: 'Mata Kuliah', count: (importedData.courses || []).length },
      { label: 'Jadwal Kuliah', count: (importedData.schedules || []).length },
      { label: 'Tugas', count: (importedData.tasks || []).length },
      { label: 'Ujian', count: (importedData.exams || []).length },
      { label: 'Catatan', count: (importedData.notes || []).length },
      { label: 'Nilai', count: (importedData.grades || []).length }
    ];
    const totalItems = summary.reduce((acc, curr) => acc + curr.count, 0);

    if (totalItems === 0 && (!importedData.profiles || importedData.profiles.length === 0)) {
      showToast('File cadangan tidak memuat data akademik', true);
      event.target.value = '';
      return;
    }

    pendingImportData = importedData;

    openSheet('Pratinjau Pemulihan Data', `
      <div class="space-y-4 text-left">
        <p class="text-xs text-slate-600 dark:text-slate-400">
          File cadangan berhasil dibaca. Berikut ringkasan data yang akan dipulihkan ke akun Anda:
        </p>

        <div class="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-2">
          ${summary.map(s => `
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-600 dark:text-slate-300 font-medium">${esc(s.label)}</span>
              <span class="font-bold text-slate-800 dark:text-slate-100 tabular-nums">${s.count} item</span>
            </div>
          `).join('')}
        </div>

        <p class="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
          Data dari file cadangan akan disinkronkan ke akun Anda.
        </p>

        <div class="flex gap-2.5 pt-2">
          <button type="button" onclick="App.cancelImport()" class="btn btn-ghost bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[48px] rounded-xl flex-1 font-semibold text-xs cursor-pointer">
            Batal
          </button>
          <button type="button" id="btnExecuteImport" onclick="App.executeImport()" class="btn bg-brand hover:bg-brand-dark text-white min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none flex items-center justify-center cursor-pointer transition-all active:scale-[0.99]">
            Pulihkan Sekarang
          </button>
        </div>
      </div>
    `);

    event.target.value = '';
  };
  reader.readAsText(file);
};

App.cancelImport = () => {
  pendingImportData = null;
  closeSheet();
};

App.executeImport = async () => {
  if (!pendingImportData) return;

  const btn = document.getElementById('btnExecuteImport');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Memulihkan...';
  }

  try {
    const tables = ['profiles', 'courses', 'schedules', 'tasks', 'exams', 'notes', 'grades'];
    for (const table of tables) {
      if (pendingImportData[table] && pendingImportData[table].length > 0) {
        await supabase.from(table).upsert(pendingImportData[table]);
      }
    }
    closeSheet();
    pendingImportData = null;
    showToast('Data akademik berhasil dipulihkan!');
    fetchProfileData();
    render();
  } catch (err) {
    showToast('Gagal memulihkan data: ' + (err.message || 'Terjadi kesalahan'), true);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Pulihkan Sekarang';
    }
  }
};

App.confirmLogout = () => {
  openSheet('Konfirmasi Keluar', `
    <div class="space-y-4 text-center py-1">
      <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
        <span class="w-6 h-6">${ICON.logOut}</span>
      </div>
      <div>
        <h4 class="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Keluar dari CampusMate?</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sesi akun pada perangkat ini akan diakhiri. Seluruh data akademik tetap tersimpan aman di akun Anda.
        </p>
      </div>
      <div class="flex gap-2.5 pt-2">
        <button onclick="App.closeSheet()" class="btn btn-ghost bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[48px] rounded-xl flex-1 font-semibold text-xs">
          Batal
        </button>
        <button id="btnExecuteLogout" onclick="App.executeLogout()" class="btn bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none">
          Ya, Keluar
        </button>
      </div>
    </div>
  `);
};

App.executeLogout = async () => {
  const btn = document.getElementById('btnExecuteLogout');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Keluar...';
  }
  try {
    await supabase.auth.signOut();
    closeSheet();
    clearAllUserCaches();
    showToast('Anda berhasil keluar akun');
    render();
  } catch (err) {
    showToast('Gagal keluar: ' + (err.message || 'Terjadi kesalahan'), true);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Ya, Keluar';
    }
  }
};

App.confirmFactoryReset = () => {
  openSheet('Reset Data Akademik', `
    <div class="space-y-4 text-left py-1">
      <div class="flex items-center gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl">
        <div class="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
          <span class="w-5 h-5">${ICON.trash}</span>
        </div>
        <div>
          <h4 class="font-display font-bold text-xs text-rose-900 dark:text-rose-200">Penghapusan Permanen</h4>
          <p class="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">Tindakan ini menghapus seluruh data jadwal, tugas, ujian, catatan, nilai, dan mata kuliah.</p>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Ketik kata <strong class="text-rose-600 dark:text-rose-400">HAPUS</strong> untuk melanjutkan:
        </label>
        <input type="text" id="f_confirm_delete" 
          oninput="App.onFactoryResetInput(this.value)"
          placeholder="Ketik HAPUS"
          class="input input-bordered h-12 w-full text-center font-bold tracking-widest text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-xl" />
      </div>

      <div class="flex gap-2.5 pt-2">
        <button onclick="App.closeSheet()" class="btn btn-ghost bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[48px] rounded-xl flex-1 font-semibold text-xs">
          Batal
        </button>
        <button id="btnExecuteFactoryReset" disabled onclick="App.executeFactoryReset()" class="btn bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 dark:disabled:bg-rose-950 text-white min-h-[48px] rounded-xl flex-1 font-semibold text-xs border-none transition-all">
          Hapus Permanen
        </button>
      </div>
    </div>
  `);
};

App.onFactoryResetInput = (val) => {
  const btn = document.getElementById('btnExecuteFactoryReset');
  if (btn) {
    btn.disabled = val.trim().toUpperCase() !== 'HAPUS';
  }
};

App.executeFactoryReset = async () => {
  const btn = document.getElementById('btnExecuteFactoryReset');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Menghapus...';
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Pengguna tidak terautentikasi');

    const tables = ['schedules', 'tasks', 'exams', 'notes', 'grades', 'courses'];
    for (const table of tables) {
      await supabase.from(table).delete().eq('user_id', user.id);
    }

    closeSheet();
    showToast('Seluruh data akademik berhasil dihapus');
    render();
  } catch (err) {
    showToast('Gagal menghapus data: ' + (err.message || 'Terjadi kesalahan'), true);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Hapus Permanen';
    }
  }
};

// Backward-compatibility aliases
App.closeSheet = closeSheet;
window.openEditProfileForm = App.openEditProfileForm;
window.handleReminderToggle = App.handleReminderToggle;
window.exportBackup = App.exportBackup;
window.triggerImport = App.triggerImport;
window.importBackup = App.importBackup;
window.confirmLogout = App.confirmLogout;
window.confirmFactoryReset = App.confirmFactoryReset;
window.closeSheet = closeSheet;