/**
 * pages/auth.js
 * Halaman Login, Register, dan Reset Password CampusMate
 * Focused Academic Login — Material 3 Design Direction
 */
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { applyTheme } from '../ui/theme.js';
import { getAuthRedirectUrl, openOAuthBrowser, initAuthDeepLinks, isNativePlatform } from '../utils/auth-redirect.js';

// State lokal mode: 'login' | 'register' | 'forgot' | 'reset-password'
let authMode = 'login';
let showPassword = false;

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

function setMessage(text, type = 'error') {
  const msgEl = document.getElementById('authMessage');
  if (!msgEl) return;
  if (!text) {
    msgEl.className = 'hidden';
    msgEl.innerHTML = '';
    return;
  }
  const isError = type === 'error';
  msgEl.className = isError
    ? 'flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-xl'
    : 'flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 rounded-xl';
  const iconSvg = isError ? ICON.alertTriangle : ICON.check;
  msgEl.innerHTML = `<span class="shrink-0 mt-0.5">${iconSvg}</span><span class="flex-1">${esc(text)}</span>`;
}

function setSubmitting(loading) {
  const btnSubmit = document.getElementById('authSubmit');
  const txtSubmit = document.getElementById('authSubmitText');
  const spinSubmit = document.getElementById('authSubmitSpinner');
  const googleBtn = document.getElementById('googleLoginBtn');
  if (btnSubmit) btnSubmit.disabled = loading;
  if (googleBtn) googleBtn.disabled = loading;
  if (txtSubmit) txtSubmit.textContent = loading
    ? (authMode === 'register' ? 'Mendaftarkan...' : authMode === 'forgot' ? 'Mengirim...' : authMode === 'reset-password' ? 'Menyimpan...' : 'Memproses...')
    : (authMode === 'register' ? 'Daftar sekarang' : authMode === 'forgot' ? 'Kirim Tautan Pemulihan' : authMode === 'reset-password' ? 'Simpan Kata Sandi Baru' : 'Masuk ke Akun');
  if (spinSubmit) {
    if (loading) spinSubmit.classList.remove('hidden');
    else spinSubmit.classList.add('hidden');
  }
}

export function pageAuth() {
  try {
    applyTheme();
  } catch (e) {
    // Fallback if theme helper not initialized
  }

  setTimeout(() => {
    bindAuthEvents();
  }, 50);

  return renderAuthHTML();
}

function renderAuthPage() {
  const page = document.getElementById('page');
  if (page) page.innerHTML = pageAuth();
}

export function setAuthMode(mode) {
  authMode = mode;
  setMessage('');
  renderAuthPage();
}

if (typeof window !== 'undefined') {
  window.openResetPasswordMode = () => {
    setAuthMode('reset-password');
  };
}

function bindAuthEvents() {
  const btnSubmit = document.getElementById('authSubmit');
  const switchBtn = document.getElementById('switchModeBtn');
  const forgotBtn = document.getElementById('forgotPasswordBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const googleBtn = document.getElementById('googleLoginBtn');
  const emailInput = document.getElementById('authEmail');
  const passInput = document.getElementById('authPassword');
  const passConfirmInput = document.getElementById('authPasswordConfirm');
  const eyeSpan = document.getElementById('eyeIcon');

  // Keyboard navigation & Enter key handling
  if (emailInput) {
    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (authMode !== 'forgot' && passInput) {
          passInput.focus();
        } else if (btnSubmit) {
          btnSubmit.click();
        }
      }
    });
  }

  if (passInput) {
    passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (authMode === 'reset-password' && passConfirmInput) {
          passConfirmInput.focus();
        } else if (btnSubmit) {
          btnSubmit.click();
        }
      }
    });
  }

  if (passConfirmInput) {
    passConfirmInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (btnSubmit) btnSubmit.click();
      }
    });
  }

  // Toggle show/hide password
  if (togglePassBtn && passInput && eyeSpan) {
    togglePassBtn.onclick = () => {
      showPassword = !showPassword;
      passInput.type = showPassword ? 'text' : 'password';
      eyeSpan.innerHTML = showPassword ? ICON.eyeOff : ICON.eye;
      togglePassBtn.setAttribute('aria-label', showPassword ? 'Sembunyikan password' : 'Lihat password');
    };
  }

  // Tombol beralih ke Mode Forgot Password
  if (forgotBtn) {
    forgotBtn.onclick = () => {
      authMode = 'forgot';
      setMessage('');
      renderAuthPage();
    };
  }

  // Tombol kembali ke Login dari Mode Forgot atau Reset Password
  if (backToLoginBtn) {
    backToLoginBtn.onclick = () => {
      authMode = 'login';
      setMessage('');
      renderAuthPage();
    };
  }

  // Tombol beralih antara Login dan Register
  if (switchBtn) {
    switchBtn.onclick = () => {
      authMode = authMode === 'login' ? 'register' : 'login';
      setMessage('');
      renderAuthPage();
    };
  }

  // Google OAuth Login
  if (googleBtn) {
    googleBtn.onclick = async () => {
      setMessage('');
      setSubmitting(true);
      try {
        // Pastikan listener callback dipasang sebelum OAuth dimulai
        await initAuthDeepLinks();

        const redirectTo = getAuthRedirectUrl();
        const isNative = isNativePlatform();

        console.log('[Auth] OAUTH_STARTED', { provider: 'google', redirectTo, isNative });

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: isNative
          }
        });

        if (error) {
          console.error('[Auth] EXCHANGE_ERROR', error);
          setMessage(error.message || 'Gagal menghubungkan akun Google.');
          setSubmitting(false);
          return;
        }

        if (isNative && data && data.url) {
          await openOAuthBrowser(data.url);
          setSubmitting(false);
        } else if (!isNative && data && data.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error('[Auth] EXCHANGE_ERROR', err);
        setMessage(err.message || 'Terjadi kesalahan saat masuk dengan Google.');
        setSubmitting(false);
      }
    };
  }

  // Submit Form (Login / Register / Forgot Password / Reset Password)
  if (btnSubmit) {
    btnSubmit.onclick = async () => {
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value.trim() : '';

      setMessage('');

      // Form Reset Password Mode
      if (authMode === 'reset-password') {
        const passConfirm = passConfirmInput ? passConfirmInput.value.trim() : '';

        if (!password) {
          setMessage('Kata sandi baru wajib diisi.');
          if (passInput) passInput.focus();
          return;
        }

        if (password.length < 6) {
          setMessage('Kata sandi minimal terdiri dari 6 karakter.');
          if (passInput) passInput.focus();
          return;
        }

        if (password !== passConfirm) {
          setMessage('Konfirmasi kata sandi tidak cocok.');
          if (passConfirmInput) passConfirmInput.focus();
          return;
        }

        setSubmitting(true);
        try {
          const { error } = await supabase.auth.updateUser({ password });
          setSubmitting(false);
          if (error) {
            setMessage(error.message || 'Gagal memperbarui kata sandi.');
          } else {
            showToast('Kata sandi berhasil diperbarui! Silakan masuk.');
            authMode = 'login';
            renderAuthPage();
            setTimeout(() => {
              setMessage('Kata sandi berhasil diperbarui! Silakan masuk menggunakan kata sandi baru.', 'success');
            }, 100);
          }
        } catch (err) {
          setSubmitting(false);
          setMessage(err.message || 'Terjadi kesalahan jaringan.');
        }
        return;
      }

      // Validasi Email untuk login, register, dan forgot
      if (!email) {
        setMessage('Email wajib diisi.');
        if (emailInput) emailInput.focus();
        return;
      }

      // Validasi format email sederhana
      if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(email)) {
        setMessage('Format email tidak valid.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (authMode === 'forgot') {
        setSubmitting(true);
        try {
          const redirectTo = getAuthRedirectUrl();
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo
          });
          setSubmitting(false);
          if (error) {
            setMessage(error.message || 'Gagal mengirim instruksi pemulihan.');
          } else {
            setMessage('Tautan pemulihan kata sandi berhasil dikirim! Silakan periksa kotak masuk atau spam email Anda.', 'success');
            showToast('Email pemulihan terkirim');
          }
        } catch (err) {
          setSubmitting(false);
          setMessage(err.message || 'Terjadi gangguan jaringan saat menghubungi server.');
        }
        return;
      }

      if (!password) {
        setMessage('Password wajib diisi.');
        if (passInput) passInput.focus();
        return;
      }

      if (password.length < 6) {
        setMessage('Password minimal terdiri dari 6 karakter.');
        if (passInput) passInput.focus();
        return;
      }

      setSubmitting(true);

      if (authMode === 'register') {
        try {
          const { error } = await supabase.auth.signUp({ email, password });
          setSubmitting(false);
          if (error) {
            const isRegistered = /already registered|already exists|user_already_exists/i.test(error.message);
            setMessage(isRegistered ? 'Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.' : (error.message || 'Gagal mendaftarkan akun baru.'));
          } else {
            showToast('Pendaftaran akun berhasil! Silakan masuk.');
            authMode = 'login';
            renderAuthPage();
            setTimeout(() => {
              setMessage('Akun berhasil dibuat! Silakan masuk menggunakan akun Anda.', 'success');
            }, 100);
          }
        } catch (err) {
          setSubmitting(false);
          setMessage(err.message || 'Terjadi kesalahan jaringan.');
        }
      } else {
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            setSubmitting(false);
            const isInvalidCreds = /invalid login credentials|invalid_grant|invalid credentials/i.test(error.message);
            const msg = isInvalidCreds
              ? 'Email atau password tidak sesuai. Periksa kembali data Anda.'
              : (error.message || 'Gagal masuk ke akun.');
            setMessage(msg);
          } else {
            showToast('Berhasil masuk! Menyiapkan data akademik...');
            setTimeout(() => {
              window.location.reload();
            }, 400);
          }
        } catch (err) {
          setSubmitting(false);
          setMessage(err.message || 'Terjadi kesalahan saat masuk.');
        }
      }
    };
  }
}

function renderAuthHTML() {
  const isRegister = authMode === 'register';
  const isForgot = authMode === 'forgot';
  const isResetPassword = authMode === 'reset-password';

  let title = 'Masuk ke CampusMate';
  let subtitle = 'Teman setia perjalanan akademikmu';
  let submitBtnText = 'Masuk ke Akun';

  if (isRegister) {
    title = 'Daftar Akun Baru';
    subtitle = 'Mulai kelola jadwal, tugas, dan nilai akademikmu';
    submitBtnText = 'Daftar sekarang';
  } else if (isForgot) {
    title = 'Lupa Sandi';
    subtitle = 'Masukkan email untuk menerima tautan pemulihan kata sandi';
    submitBtnText = 'Kirim Tautan Pemulihan';
  } else if (isResetPassword) {
    title = 'Atur Kata Sandi Baru';
    subtitle = 'Masukkan kata sandi baru untuk mengamankan akunmu';
    submitBtnText = 'Simpan Kata Sandi Baru';
  }

  return `
    <div class="min-h-full py-6 px-4 flex flex-col justify-center items-center max-w-sm sm:max-w-md mx-auto w-full my-auto animate-fadeIn">
      
      <!-- Clean Brand Mark & Header -->
      <div class="flex flex-col items-center text-center mb-6">
        <img src="login-logo.png" alt="CampusMate Logo" class="w-16 h-16 object-contain mb-3 select-none pointer-events-none" />
        <h1 id="authTitle" class="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">${title}</h1>
        <p id="authSubTitle" class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal max-w-xs">${subtitle}</p>
      </div>

      <!-- Surface Card -->
      <div class="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm transition-colors">
        
        <form onsubmit="return false;" class="space-y-4">
          
          <!-- Input Email (disembunyikan saat mode reset-password) -->
          ${!isResetPassword ? `
            <div class="space-y-1.5">
              <label for="authEmail" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
              <input 
                type="email" 
                id="authEmail" 
                placeholder="nama@email.com" 
                autocomplete="email" 
                inputmode="email"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                required
                class="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition" 
              />
            </div>
          ` : ''}

          <!-- Input Password & Lupa Sandi -->
          ${!isForgot ? `
            <div class="space-y-1.5">
              <label for="authPassword" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ${isResetPassword ? 'Kata Sandi Baru' : 'Password'}
              </label>
              <div class="relative">
                <input 
                  type="${showPassword ? 'text' : 'password'}" 
                  id="authPassword" 
                  placeholder="${isResetPassword ? 'Minimal 6 karakter' : '••••••••'}" 
                  autocomplete="${isRegister || isResetPassword ? 'new-password' : 'current-password'}" 
                  autocapitalize="off"
                  autocorrect="off"
                  spellcheck="false"
                  required
                  class="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition" 
                />
                <button 
                  type="button" 
                  id="togglePasswordBtn" 
                  class="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer" 
                  aria-label="${showPassword ? 'Sembunyikan password' : 'Lihat password'}"
                >
                  <span id="eyeIcon">${showPassword ? ICON.eyeOff : ICON.eye}</span>
                </button>
              </div>
              ${!isRegister && !isResetPassword ? `
                <div class="flex justify-end -mt-1 -mb-1">
                  <button type="button" id="forgotPasswordBtn" class="min-h-[48px] px-1 inline-flex items-center text-xs font-medium text-brand hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-lg">Lupa sandi?</button>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Input Konfirmasi Password Baru (Khusus Mode Reset Password) -->
          ${isResetPassword ? `
            <div class="space-y-1.5">
              <label for="authPasswordConfirm" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Konfirmasi Kata Sandi Baru
              </label>
              <input 
                type="${showPassword ? 'text' : 'password'}" 
                id="authPasswordConfirm" 
                placeholder="Ulangi kata sandi baru" 
                autocomplete="new-password" 
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                required
                class="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition" 
              />
            </div>
          ` : ''}

          <!-- Pesan Error / Status Inline -->
          <div id="authMessage" class="hidden"></div>

          <!-- Tombol Aksi Utama [ Masuk / Daftar / Kirim / Simpan ] -->
          <div class="pt-1">
            <button 
              type="button" 
              id="authSubmit" 
              class="w-full h-12 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-none transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
            >
              <span id="authSubmitText">${submitBtnText}</span>
              <span id="authSubmitSpinner" class="loading loading-spinner loading-sm hidden"></span>
            </button>
          </div>

          <!-- OAuth Provider: ─── atau masuk dengan ─── [ Lanjutkan dengan Google ] -->
          ${!isRegister && !isForgot && !isResetPassword ? `
            <div id="oauthDivider" class="relative my-4 flex items-center justify-center">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
              <span class="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 dark:text-slate-500">atau masuk dengan</span>
            </div>

            <button 
              type="button" 
              id="googleLoginBtn" 
              class="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center justify-center gap-2.5 transition active:scale-[0.99] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>
          ` : ''}

        </form>

        <!-- Mode Navigation Footer: Belum memiliki akun? Daftar sekarang / Kembali ke Masuk -->
        <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center flex-wrap text-xs">
          ${isForgot || isResetPassword ? `
            <button type="button" id="backToLoginBtn" class="min-h-[48px] px-3 text-brand font-semibold hover:underline inline-flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-lg">
              ← Kembali ke Masuk
            </button>
          ` : `
            <span id="switchModeText" class="text-slate-500 dark:text-slate-400">
              ${isRegister ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'}
            </span>
            <button type="button" id="switchModeBtn" class="min-h-[48px] px-1.5 inline-flex items-center text-brand font-semibold hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-lg">
              ${isRegister ? 'Masuk sekarang' : 'Daftar sekarang'}
            </button>
          `}
        </div>

      </div>

    </div>
  `;
}
