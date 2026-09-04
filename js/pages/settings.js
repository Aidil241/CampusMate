/**
 * pages/settings.js
 * Halaman pengaturan akun, profil mahasiswa, dan logout (Supabase Edition).
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { render } from '../core/render.js';

let profileCache = { name: '', nim: '', prodi: '' };
let userEmail = '';
let isFetchingProfile = false;

async function fetchProfileData() {
  if (isFetchingProfile) return;
  isFetchingProfile = true;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userEmail = user.email;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!error && data) {
      profileCache = data;
      render();
    }
  }
  isFetchingProfile = false;
}

fetchProfileData();

export function pageSettings() {
  return `
    <div class="space-y-4 text-xs max-w-lg mx-auto pb-10">
      <!-- Kartu Profil Pengguna -->
      <div class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-3">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-brand/10 text-brand rounded-2xl">👤</div>
          <div>
            <h3 class="font-bold text-sm">${esc(profileCache.name || 'Mahasiswa CampusMate')}</h3>
            <p class="text-[11px] text-base-content/60">${esc(userEmail || 'Memuat akun...')}</p>
          </div>
        </div>

        <div class="divider my-1"></div>

        <div class="space-y-2">
          <div>
            <label class="label label-text font-bold">Nama Lengkap</label>
            <input id="set_name" class="input input-bordered input-sm w-full" value="${esc(profileCache.name || '')}" placeholder="Masukkan nama lengkap" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="label label-text font-bold">NIM</label>
              <input id="set_nim" class="input input-bordered input-sm w-full" value="${esc(profileCache.nim || '')}" placeholder="Nomor Induk" />
            </div>
            <div>
              <label class="label label-text font-bold">Program Studi / Jurusan</label>
              <input id="set_prodi" class="input input-bordered input-sm w-full" value="${esc(profileCache.prodi || '')}" placeholder="Contoh: Informatika" />
            </div>
          </div>
          <button onclick="App.saveProfile()" class="btn btn-primary btn-sm w-full mt-2">Simpan Profil</button>
        </div>
      </div>

      <!-- Tombol Logout -->
      <div class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
        <button onclick="App.handleLogout()" class="btn btn-error btn-outline btn-sm w-full">
          🚪 Keluar Akun (Logout)
        </button>
      </div>
    </div>
  `;
}

// Fungsi Simpan Profil ke Supabase
App.saveProfile = async () => {
  const name = document.getElementById('set_name').value.trim();
  const nim = document.getElementById('set_nim').value.trim();
  const prodi = document.getElementById('set_prodi').value.trim();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('profiles').update({
    name,
    nim,
    prodi,
    updated_at: new Date()
  }).eq('id', user.id);

  if (!error) {
    profileCache = { name, nim, prodi };
    alert('Profil berhasil disimpan ke cloud!');
    render();
  } else {
    alert('Gagal menyimpan profil: ' + error.message);
  }
};

// Fungsi Logout
App.handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.reload();
};