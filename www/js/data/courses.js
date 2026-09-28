/**
 * data/courses.js
 * Centralized Courses Data Service & Single Source of Truth
 *
 * Mengelola cache terpadu data Mata Kuliah (Courses) untuk seluruh aplikasi,
 * menangani pengambilan data dari Supabase, dan menyiarkan pembaruan (invalidation)
 * secara real-time ke semua modul (Schedule, Tasks, Grades, Home, Notes, Exams)
 * tanpa memerlukan full page reload.
 */
import { supabase } from './supabase.js';

let sharedCoursesCache = [];
let activeFetchPromise = null;
let hasLoaded = false;
const listeners = new Set();

/**
 * Beri tahu semua listener dan dispatch CustomEvent global
 */
function notifyListeners() {
  for (const fn of listeners) {
    try {
      fn(sharedCoursesCache);
    } catch (err) {
      console.error('Error in course subscriber:', err);
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('cm:courses-updated', {
      detail: { courses: sharedCoursesCache }
    }));
  }
}

/**
 * Ambil data courses terbaru dari Supabase.
 * @param {boolean} forceRefresh - jika true, paksa re-fetch walau sudah ada di cache
 * @returns {Promise<Array>}
 */
export async function fetchSharedCourses(forceRefresh = false) {
  if (!forceRefresh && hasLoaded && sharedCoursesCache.length > 0) {
    return sharedCoursesCache;
  }

  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Gagal memuat mata kuliah dari Supabase:', error);
        return sharedCoursesCache;
      }

      sharedCoursesCache = Array.isArray(data) ? data : [];
      hasLoaded = true;
      notifyListeners();
      return sharedCoursesCache;
    } catch (err) {
      console.error('Exception saat mengambil mata kuliah:', err);
      return sharedCoursesCache;
    } finally {
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}

/**
 * Akses sinkron ke cache mata kuliah terbaru
 */
export function getCachedCourses() {
  return sharedCoursesCache;
}

/**
 * Status apakah data mata kuliah sudah selesai dimuat dari Supabase
 */
export function hasCoursesLoaded() {
  return hasLoaded;
}

/**
 * Setel isi cache secara langsung dan siarkan perubahannya
 */
export function setSharedCourses(courses) {
  sharedCoursesCache = Array.isArray(courses) ? courses : [];
  hasLoaded = true;
  notifyListeners();
}

/**
 * Paksa re-fetch dari cloud dan siarkan ke seluruh aplikasi
 */
export async function invalidateCoursesCache() {
  if (activeFetchPromise) {
    try {
      await activeFetchPromise;
    } catch (e) {
      // Abaikan error sebelumnya
    }
  }
  return await fetchSharedCourses(true);
}

/**
 * Subscribe callback untuk menerima pembaruan setiap kali daftar mata kuliah berubah.
 * Mengembalikan fungsi unsubscribe.
 */
export function subscribeCourses(callback) {
  if (typeof callback !== 'function') return () => {};
  listeners.add(callback);

  // Jika sudah ada data, panggil segera
  if (hasLoaded) {
    try {
      callback(sharedCoursesCache);
    } catch (e) {
      console.error(e);
    }
  }

  return () => {
    listeners.delete(callback);
  };
}

export function resetCoursesCache() {
  sharedCoursesCache = [];
  hasLoaded = false;
  activeFetchPromise = null;
  notifyListeners();
}

// Inisialisasi pengambilan data saat modul pertama kali di-load
fetchSharedCourses();
