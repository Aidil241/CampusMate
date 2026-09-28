/**
 * data/profile.js
 * Centralized Profile Service & Single Source of Truth
 *
 * Mengelola cache profil mahasiswa aktif, sinkronisasi dengan Supabase profiles,
 * isolasi profil berdasarkan user ID, serta pub-sub pembaruan profil ke Home,
 * Settings, dan Topbar secara real-time tanpa full reload.
 */
import { supabase } from './supabase.js';
import { DB } from './db.js';

let sharedProfileCache = null;
let currentProfileUserId = null;
let activeFetchPromise = null;
const profileListeners = new Set();

/**
 * Beri tahu semua subscriber bahwa data profil telah berubah
 */
function notifyProfileListeners(profile) {
  for (const fn of profileListeners) {
    try {
      fn(profile);
    } catch (err) {
      console.error('Error in profile subscriber:', err);
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('cm:profile-updated', {
      detail: { profile }
    }));
  }
}

/**
 * Berlangganan perubahan profil
 * @param {Function} fn - Callback menerima data profil terbaru
 * @returns {Function} Unsubscribe function
 */
export function subscribeProfile(fn) {
  profileListeners.add(fn);
  return () => profileListeners.delete(fn);
}

/**
 * Mendapatkan profil aktif saat ini dari cache
 */
export function getCachedProfile() {
  return sharedProfileCache;
}

/**
 * Helper untuk mengekstrak nama tampilan yang benar dengan fallback 'Mahasiswa'
 */
export function getProfileDisplayName(profile) {
  if (!profile) return 'Mahasiswa';
  const name = profile.name || profile.full_name || '';
  const trimmed = String(name).trim();
  return (trimmed && trimmed !== 'Mahasiswa') ? trimmed : 'Mahasiswa';
}

/**
 * Ambil data profil dari Supabase & penyimpanan lokal yang terisolasi per user ID
 * @param {boolean} forceRefresh - Paksa fetch ulang dari Supabase
 */
export async function fetchSharedProfile(forceRefresh = false) {
  let user = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    user = session ? session.user : null;
  } catch (err) {
    console.warn('[Profile] Error getting session:', err);
  }

  // Jika tidak ada user login, reset cache
  if (!user) {
    resetProfileCache();
    return null;
  }

  // Jika user ID berubah (misal logout A -> login B), bersihkan cache lama
  if (currentProfileUserId && currentProfileUserId !== user.id) {
    resetProfileCache();
  }
  currentProfileUserId = user.id;

  // Jika cache sudah ada untuk user ini dan tidak dipaksa refresh, gunakan cache
  if (!forceRefresh && sharedProfileCache && sharedProfileCache.id === user.id) {
    return sharedProfileCache;
  }

  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const userScopedSettings = DB.settings.getUserProfile(user.id);
      const metaName = user.user_metadata?.full_name || user.user_metadata?.name || '';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      let resolvedName = '';
      let resolvedMajor = '';
      let resolvedCampus = '';

      if (!error && data) {
        resolvedName = data.name || data.full_name || userScopedSettings.name || metaName || '';
        resolvedMajor = data.major || data.prodi || userScopedSettings.major || '';
        resolvedCampus = data.campus || userScopedSettings.campus || '';
      } else {
        // Fallback jika baris di cloud belum dibuat
        resolvedName = userScopedSettings.name || metaName || '';
        resolvedMajor = userScopedSettings.major || '';
        resolvedCampus = userScopedSettings.campus || '';
      }

      sharedProfileCache = {
        id: user.id,
        email: user.email || '',
        name: resolvedName,
        full_name: resolvedName,
        major: resolvedMajor,
        campus: resolvedCampus
      };

      // Simpan juga ke cache user lokal
      DB.settings.saveUserProfile(user.id, {
        name: resolvedName,
        major: resolvedMajor,
        campus: resolvedCampus
      });

      notifyProfileListeners(sharedProfileCache);
      return sharedProfileCache;
    } catch (err) {
      console.error('[Profile] Exception fetching shared profile:', err);
      return sharedProfileCache;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

/**
 * Memperbarui data profil secara lokal dan di Supabase
 * @param {Object} updates - { name, major, campus }
 */
export async function updateSharedProfile(updates) {
  let user = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    user = session ? session.user : null;
  } catch (err) {
    console.warn('[Profile] Error getting session for update:', err);
  }

  const userId = user ? user.id : currentProfileUserId;
  const newName = updates.name ? String(updates.name).trim() : '';
  const newMajor = updates.major ? String(updates.major).trim() : '';
  const newCampus = updates.campus ? String(updates.campus).trim() : '';

  sharedProfileCache = {
    ...(sharedProfileCache || {}),
    id: userId,
    name: newName,
    full_name: newName,
    major: newMajor,
    campus: newCampus
  };

  if (userId) {
    DB.settings.saveUserProfile(userId, {
      name: newName,
      major: newMajor,
      campus: newCampus
    });
  }

  // Notifikasi subscriber seketika agar UI (Home, Settings, dll.) langsung update
  notifyProfileListeners(sharedProfileCache);

  // Sinkronkan ke Supabase profiles jika user aktif
  if (userId) {
    try {
      const cloudPayload = {
        id: userId,
        name: newName,
        full_name: newName,
        major: newMajor,
        prodi: newMajor,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('profiles')
        .upsert(cloudPayload, { onConflict: 'id' });

      if (error) {
        console.warn('[Profile] Supabase profile upsert warning:', error);
      }
    } catch (cloudErr) {
      console.warn('[Profile] Cloud sync exception:', cloudErr);
    }
  }

  return sharedProfileCache;
}

/**
 * Reset cache profil saat logout atau saat user ID berganti
 */
export function resetProfileCache() {
  sharedProfileCache = null;
  currentProfileUserId = null;
  activeFetchPromise = null;
  notifyProfileListeners(null);
}
