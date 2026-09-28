/**
 * data/grades.js
 * Centralized Grades Data Service & Single Source of Truth
 *
 * Mengelola cache terpadu data Nilai Komponen (Grades) untuk seluruh aplikasi,
 * menangani sinkronisasi dengan Supabase, dan menyiarkan pembaruan (invalidation)
 * secara real-time ke modul terkait (Grades, Home, Stats) tanpa full page reload.
 */
import { supabase } from './supabase.js';

let sharedGradesCache = [];
let activeFetchPromise = null;
let hasLoaded = false;
const listeners = new Set();

/**
 * Beri tahu semua listener dan dispatch CustomEvent global
 */
function notifyListeners() {
  for (const fn of listeners) {
    try {
      fn(sharedGradesCache);
    } catch (err) {
      console.error('Error in grades subscriber:', err);
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('cm:grades-updated', {
      detail: { grades: sharedGradesCache }
    }));
  }
}

/**
 * Ambil data nilai terbaru dari Supabase.
 * @param {boolean} forceRefresh - jika true, paksa re-fetch walau sudah ada di cache
 * @returns {Promise<Array>}
 */
export async function fetchSharedGrades(forceRefresh = false) {
  if (!forceRefresh && hasLoaded && sharedGradesCache.length > 0) {
    return sharedGradesCache;
  }

  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal memuat nilai dari Supabase:', error);
        return sharedGradesCache;
      }

      sharedGradesCache = Array.isArray(data) ? data : [];
      hasLoaded = true;
      notifyListeners();
      return sharedGradesCache;
    } catch (err) {
      console.error('Exception saat mengambil nilai:', err);
      return sharedGradesCache;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

/**
 * Akses sinkron ke cache nilai terbaru
 */
export function getCachedGrades() {
  return sharedGradesCache;
}

/**
 * Setel isi cache secara langsung dan siarkan perubahannya
 */
export function setSharedGrades(grades) {
  sharedGradesCache = Array.isArray(grades) ? grades : [];
  hasLoaded = true;
  notifyListeners();
}

/**
 * Paksa re-fetch dari cloud dan siarkan ke seluruh aplikasi
 */
export async function invalidateGradesCache() {
  if (activeFetchPromise) {
    try {
      await activeFetchPromise;
    } catch (e) {
      // Abaikan error sebelumnya
    }
  }
  return await fetchSharedGrades(true);
}

/**
 * Subscribe callback untuk menerima pembaruan setiap kali daftar nilai berubah.
 * Mengembalikan fungsi unsubscribe.
 */
export function subscribeGrades(callback) {
  if (typeof callback !== 'function') return () => {};
  listeners.add(callback);

  // Jika sudah ada data, panggil segera
  if (hasLoaded) {
    try {
      callback(sharedGradesCache);
    } catch (e) {
      console.error(e);
    }
  }

  return () => {
    listeners.delete(callback);
  };
}

export function resetGradesCache() {
  sharedGradesCache = [];
  hasLoaded = false;
  activeFetchPromise = null;
  notifyListeners();
}

// Inisialisasi pengambilan data saat modul pertama kali di-load
fetchSharedGrades();
