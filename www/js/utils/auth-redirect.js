/**
 * utils/auth-redirect.js
 * Manajemen Deep Link & Browser Redirect untuk Google OAuth dan Reset Password
 * Mendukung Android Native (Capacitor) via skema campusmate://auth-callback
 * serta mempertahankan alur web development (localhost).
 */
import { supabase } from '../data/supabase.js';
import { render } from '../core/render.js';
import { navigate } from '../core/router.js';
import { state } from '../core/state.js';
import { App } from '../core/app-namespace.js';
import { clearAllUserCaches, checkUserSessionChange } from '../core/session.js';

let isDeepLinkInitialized = false;
let isAuthStateListenerInitialized = false;
let isAuthExchangeInProgress = false;
let exchangePromise = null;
let lastProcessedCode = null;

/**
 * Menampilkan pesan toast di UI
 */
function showToast(message, isError = false) {
  if (typeof document === 'undefined') return;
  const toast = document.getElementById('toastStack');
  if (!toast) return;

  const el = document.createElement('div');
  el.className = isError
    ? 'alert alert-error text-xs shadow-none border border-rose-200 dark:border-rose-900 py-2.5 px-3.5 rounded-2xl flex items-center gap-2'
    : 'alert alert-success text-xs shadow-none border border-emerald-200 dark:border-emerald-900 py-2.5 px-3.5 rounded-2xl flex items-center gap-2';

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  el.appendChild(textSpan);

  toast.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/**
 * Cek apakah platform saat ini adalah mobile native (Android / iOS Capacitor)
 */
export function isNativePlatform() {
  try {
    if (typeof window !== 'undefined' && window.Capacitor) {
      if (typeof window.Capacitor.isNativePlatform === 'function') {
        return window.Capacitor.isNativePlatform();
      }
      if (typeof window.Capacitor.getPlatform === 'function') {
        return window.Capacitor.getPlatform() !== 'web';
      }
    }
  } catch (e) {
    console.warn('[AuthRedirect] Error checking native platform:', e);
  }
  return false;
}

/**
 * Menentukan redirect URL yang sesuai dengan platform.
 * Di mobile native: selalu gunakan URI deep-link "campusmate://auth-callback".
 * Di web browser (misal development): gunakan window.location.origin.
 */
export function getAuthRedirectUrl() {
  if (isNativePlatform()) {
    return 'campusmate://auth-callback';
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
}

/**
 * Membuka URL OAuth menggunakan browser sistem resmi via @capacitor/browser jika tersedia.
 * Ini mencegah error Google "disallowed_useragent" pada WebView Android.
 */
export async function openOAuthBrowser(url) {
  if (!url) return;
  try {
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
      await window.Capacitor.Plugins.Browser.open({ url });
      return;
    }
  } catch (err) {
    console.warn('[AuthRedirect] Gagal membuka via Capacitor Browser plugin, fallback ke window.location:', err);
  }
  
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Menutup browser in-app setelah deep link kembali ke aplikasi
 */
export async function closeOAuthBrowser() {
  try {
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
      await window.Capacitor.Plugins.Browser.close();
    }
  } catch (e) {
    // Abaikan jika browser tidak sedang terbuka
  }
}

/**
 * Helper untuk mem-parsing token/code dari string URL deep link secara aman
 */
export function parseAuthUrl(urlString) {
  if (!urlString) {
    return {
      params: {},
      hashParams: {},
      code: null,
      accessToken: null,
      refreshToken: null,
      error: null,
      errorDescription: null,
      type: null
    };
  }

  const params = {};
  const hashParams = {};

  try {
    let normalized = urlString.trim();
    if (normalized.startsWith('campusmate://')) {
      normalized = normalized.replace('campusmate://', 'https://campusmate.app/');
    } else if (normalized.startsWith('campusmate:/')) {
      normalized = normalized.replace('campusmate:/', 'https://campusmate.app/');
    }

    const url = new URL(normalized);

    for (const [k, v] of url.searchParams.entries()) {
      params[k] = v;
    }

    if (url.hash && url.hash.length > 1) {
      const hashStr = url.hash.startsWith('#') ? url.hash.substring(1) : url.hash;
      const searchLike = new URLSearchParams(hashStr);
      for (const [k, v] of searchLike.entries()) {
        hashParams[k] = v;
      }
    }
  } catch (e) {
    console.warn('[AuthRedirect] URL parsing warning:', e);
  }

  // Regex fallback untuk memastikan parameter tetap terbaca meskipun URL scheme tidak standar
  const extractParam = (key) => {
    const regex = new RegExp('(?:[?&#])' + key + '=([^&#]*)', 'i');
    const match = urlString.match(regex);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  };

  const code = params.code || hashParams.code || extractParam('code') || null;
  const accessToken = hashParams.access_token || params.access_token || extractParam('access_token') || null;
  const refreshToken = hashParams.refresh_token || params.refresh_token || extractParam('refresh_token') || null;
  const error = params.error || hashParams.error || extractParam('error') || null;
  const errorDescription = params.error_description || hashParams.error_description || extractParam('error_description') || null;
  const type = params.type || hashParams.type || extractParam('type') || null;

  return {
    params,
    hashParams,
    code,
    accessToken,
    refreshToken,
    error,
    errorDescription,
    type
  };
}

/**
 * Mengecek apakah proses OAuth code exchange sedang berjalan
 */
export function isOAuthExchangePending() {
  return isAuthExchangeInProgress;
}

/**
 * Menunggu penyelesaian pertukaran kode OAuth sebelum render/auth guard berjalan
 */
export function waitForOAuthExchange() {
  return exchangePromise || Promise.resolve();
}

/**
 * Memproses URL callback deep link dari Google OAuth atau Password Reset
 */
export async function handleAuthCallbackUrl(rawUrl) {
  if (!rawUrl) return false;

  const isAuthCallback = rawUrl.startsWith('campusmate://auth-callback') ||
    rawUrl.includes('code=') ||
    rawUrl.includes('access_token=') ||
    rawUrl.includes('error=');

  if (!isAuthCallback) return false;

  console.log('[Auth] CALLBACK_RECEIVED', { url: rawUrl });

  const parsed = parseAuthUrl(rawUrl);
  const { code, accessToken, refreshToken, error, errorDescription, type } = parsed;

  // Tangani error eksplisit jika Google / Supabase mengembalikan parameter error
  if (error) {
    console.error('[Auth] EXCHANGE_ERROR', { error, description: errorDescription });
    await closeOAuthBrowser();
    showToast(errorDescription || error || 'Otorisasi Google gagal.', true);
    return false;
  }

  // Tangani flow recovery (reset password)
  if (type === 'recovery') {
    await closeOAuthBrowser();
    if (typeof window.openResetPasswordMode === 'function') {
      window.openResetPasswordMode();
    } else {
      render();
    }
    return true;
  }

  // Cegah pertukaran ganda untuk kode otorisasi yang sama
  if (code && lastProcessedCode === code) {
    console.log('[Auth] Code already processed, skipping re-exchange');
    return true;
  }

  let resolveExchange;
  exchangePromise = new Promise((res) => { resolveExchange = res; });
  isAuthExchangeInProgress = true;

  try {
    if (code) {
      lastProcessedCode = code;
      console.log('[Auth] CODE_FOUND', { codeLength: code.length });
      console.log('[Auth] EXCHANGE_STARTED');

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('[Auth] EXCHANGE_ERROR', exchangeError);
        await closeOAuthBrowser();
        showToast(exchangeError.message || 'Gagal memproses kode otorisasi.', true);
        return false;
      }

      console.log('[Auth] EXCHANGE_SUCCESS', {
        hasSession: !!data?.session,
        userEmail: data?.session?.user?.email
      });
    } else if (accessToken && refreshToken) {
      console.log('[Auth] CODE_FOUND', { flow: 'tokens' });
      console.log('[Auth] EXCHANGE_STARTED', { flow: 'tokens' });

      const { data, error: setErr } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (setErr) {
        console.error('[Auth] EXCHANGE_ERROR', setErr);
        await closeOAuthBrowser();
        showToast(setErr.message || 'Gagal menyimpan sesi login.', true);
        return false;
      }

      console.log('[Auth] EXCHANGE_SUCCESS', { flow: 'tokens' });
    } else {
      console.error('[Auth] EXCHANGE_ERROR', new Error('Parameter code atau token tidak ditemukan dalam callback'));
      await closeOAuthBrowser();
      showToast('Tautan otorisasi tidak valid.', true);
      return false;
    }

    // Validasi session dan access token
    console.log('[Auth] SESSION_CHECK');
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();

    if (sessionErr || !sessionData?.session || !sessionData.session.access_token) {
      console.error('[Auth] EXCHANGE_ERROR', sessionErr || new Error('Sesi atau access token tidak tersedia'));
      await closeOAuthBrowser();
      showToast('Gagal memvalidasi sesi login Google.', true);
      return false;
    }

    const session = sessionData.session;
    console.log('[Auth] AUTHENTICATED', {
      user: session.user?.email,
      hasToken: !!session.access_token
    });

    // Tutup Browser Capacitor jika masih terbuka
    await closeOAuthBrowser();

    // Navigasi ke Home menggunakan router yang SUDAH ADA
    console.log('[Auth] NAVIGATE_HOME');
    showToast('Berhasil masuk dengan akun Google!');
    
    state.route = 'home';
    if (typeof App !== 'undefined' && typeof App.navigate === 'function') {
      App.navigate('home');
    } else {
      navigate('home');
    }
    return true;
  } catch (err) {
    console.error('[Auth] EXCHANGE_ERROR', err);
    await closeOAuthBrowser();
    showToast(err.message || 'Terjadi kesalahan sistem saat masuk.', true);
    return false;
  } finally {
    isAuthExchangeInProgress = false;
    if (resolveExchange) resolveExchange();
    exchangePromise = null;
  }
}

/**
 * Inisialisasi auth state change listener tunggal
 */
export function initAuthStateListener() {
  if (isAuthStateListenerInitialized) return;
  isAuthStateListenerInitialized = true;

  try {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange:', event, { hasSession: !!session });
      
      // Jika sedang ada proses OAuth exchange di handleAuthCallbackUrl,
      // jangan mendahului agar tidak terjadi duplicate toast atau render race
      if (isOAuthExchangePending()) {
        return;
      }

      if (event === 'SIGNED_IN' && session) {
        checkUserSessionChange(session.user?.id || null);
        if (state.route === 'auth') {
          state.route = 'home';
          if (typeof App !== 'undefined' && typeof App.navigate === 'function') {
            App.navigate('home');
          } else {
            navigate('home');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        clearAllUserCaches();
        if (state.route !== 'auth') {
          state.route = 'auth';
          render();
        }
      }
    });
  } catch (e) {
    console.warn('[AuthRedirect] Error setting up onAuthStateChange listener:', e);
  }
}

/**
 * Inisialisasi listener deep-link untuk menangkap alur kembalian OAuth dan Password Reset.
 * Mendukung warm start (appUrlOpen) dan cold start (getLaunchUrl).
 */
export async function initAuthDeepLinks() {
  if (isDeepLinkInitialized) return;
  if (typeof window === 'undefined' || !window.Capacitor || !window.Capacitor.Plugins) return;

  const CapApp = window.Capacitor.Plugins.App;
  if (!CapApp || typeof CapApp.addListener !== 'function') return;

  isDeepLinkInitialized = true;

  // Pasang listener tunggal appUrlOpen untuk warm start
  try {
    CapApp.addListener('appUrlOpen', async (data) => {
      if (!data || !data.url) return;
      await handleAuthCallbackUrl(data.url);
    });
  } catch (err) {
    console.warn('[AuthRedirect] Gagal memasang listener appUrlOpen:', err);
  }

  // Cek apakah aplikasi dibuka melalui deep link pada startup (cold start)
  if (typeof CapApp.getLaunchUrl === 'function') {
    try {
      const launchData = await CapApp.getLaunchUrl();
      if (launchData && launchData.url) {
        await handleAuthCallbackUrl(launchData.url);
      }
    } catch (launchErr) {
      console.warn('[AuthRedirect] Gagal membaca getLaunchUrl:', launchErr);
    }
  }

  // Inisialisasi auth state listener tunggal
  initAuthStateListener();
}
