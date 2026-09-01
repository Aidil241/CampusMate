/**
 * pages/auth.js
 * Halaman Login dan Register Terpisah
 */
import { supabase } from '../data/supabase.js';

// State lokal untuk menentukan sedang berada di mode 'login' atau 'register'
let authMode = 'login'; // 'login' atau 'register'

export function pageAuth() {
  // Jalankan bind event setelah elemen HTML dirender
  setTimeout(() => {
    const btnSubmit = document.getElementById('authSubmit');
    const msgEl = document.getElementById('authMessage');
    const switchText = document.getElementById('switchModeText');
    const titleEl = document.getElementById('authTitle');
    const subTitleEl = document.getElementById('authSubTitle');
    const switchBtn = document.getElementById('switchModeBtn');

    // Ubah teks UI sesuai mode aktif
    if (authMode === 'register') {
      titleEl.textContent = 'Daftar Akun';
      subTitleEl.textContent = 'Buat akun baru untuk sinkronisasi cloud';
      btnSubmit.textContent = 'Daftar Akun Baru';
      switchText.textContent = 'Sudah punya akun?';
      switchBtn.textContent = 'Masuk di sini';
    } else {
      titleEl.textContent = 'CampusMate';
      subTitleEl.textContent = 'Masuk untuk sinkronisasi data lintas perangkat';
      btnSubmit.textContent = 'Masuk (Login)';
      switchText.textContent = 'Belum punya akun?';
      switchBtn.textContent = 'Daftar di sini';
    }

    // Aksi Tombol Utama (Login / Register)
    if (btnSubmit) {
      btnSubmit.onclick = async () => {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value.trim();

        if (!email || !password) {
          msgEl.textContent = 'Email dan password wajib diisi!';
          return;
        }

        if (authMode === 'register') {
          msgEl.textContent = 'Mendaftarkan akun...';
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) {
            msgEl.textContent = error.message;
          } else {
            alert('Pendaftaran berhasil! Silakan masuk menggunakan akun tersebut.');
            authMode = 'login';
            renderAuthPage();
          }
        } else {
          msgEl.textContent = 'Memproses masuk...';
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            msgEl.textContent = error.message;
          } else {
            alert('Berhasil masuk! 🎉');
            window.location.reload();
          }
        }
      };
    }

    // Aksi Tombol Ganti Mode (Login <-> Register)
    if (switchBtn) {
      switchBtn.onclick = () => {
        authMode = authMode === 'login' ? 'register' : 'login';
        renderAuthPage();
      };
    }
  }, 50);

  return renderAuthHTML();
}

// Helper untuk merender ulang tampilan lokal tanpa reload seluruh halaman
function renderAuthPage() {
  const page = document.getElementById('page');
  if (page) page.innerHTML = pageAuth();
}

function renderAuthHTML() {
  return `
    <div class="min-h-[80vh] flex items-center justify-center p-4">
      <div class="bg-base-100 border border-base-200 p-6 rounded-3xl shadow-sm max-w-sm w-full space-y-5">
        
        <div class="text-center space-y-1">
          <div id="authTitle" class="text-3xl font-black text-primary">CampusMate</div>
          <p id="authSubTitle" class="text-xs text-base-content/60">Masuk untuk sinkronisasi data lintas perangkat</p>
        </div>

        <div class="space-y-3">
          <div class="form-control">
            <label class="label text-xs font-medium">Email</label>
            <input type="email" id="authEmail" placeholder="nama@email.com" class="input input-bordered input-sm bg-base-100" />
          </div>

          <div class="form-control">
            <label class="label text-xs font-medium">Password</label>
            <input type="password" id="authPassword" placeholder="••••••••" class="input input-bordered input-sm bg-base-100" />
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button id="authSubmit" class="btn btn-primary btn-sm w-full font-bold">Masuk (Login)</button>
        </div>

        <div class="text-center text-xs space-x-1 pt-1">
          <span id="switchModeText" class="text-base-content/60">Belum punya akun?</span>
          <button id="switchModeBtn" class="text-primary font-semibold hover:underline">Daftar di sini</button>
        </div>

        <div id="authMessage" class="text-[11px] text-center text-error min-h-[16px]"></div>

      </div>
    </div>
  `;
}