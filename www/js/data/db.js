/**
 * db.js
 * Storage layer LOKAL (khusus preferensi device, bukan data akademik).
 *
 * PERBAIKAN PENTING:
 * Sebelumnya modul ini juga menyimpan courses/tasks/notes/grades/schedules
 * di localStorage. Sejak aplikasi bermigrasi ke Supabase (lihat data/supabase.js),
 * SEMUA halaman (tasks.js, courses.js, notes.js, grades.js, schedule.js, exams.js,
 * home.js) sudah membaca-tulis langsung ke Supabase — bukan ke sini lagi.
 *
 * Menyisakan objek DB.courses/DB.tasks/dst di sini berbahaya karena:
 * - seed.js selalu mengosongkan localStorage tsb, jadi DATANYA SELALU KOSONG.
 * - Kalau ada halaman lain yang tanpa sadar membaca dari sini (seperti bug lama
 *   di pages/stats.js), datanya akan tampak kosong padahal user sudah mengisi
 *   banyak data di Supabase. Ini bug nyata yang sudah terjadi di versi sebelumnya.
 *
 * Karena itu, DB sekarang HANYA menyimpan preferensi lokal per-device:
 * pengaturan tema & nama tampilan. Semua data akademik wajib lewat Supabase.
 */

/** Generate id unik sederhana, contoh: "id-lz3f9k-a1b2c3d" (masih dipakai beberapa util lokal). */
export function uid() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

const KEYS = {
  settings: 'cm_settings',
  seeded: 'cm_seeded'
};

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const DB = {
  KEYS,
  get,
  set,

  settings: {
    get(userId = null) {
      const stored = JSON.parse(localStorage.getItem(KEYS.settings) || '{}');
      const defaults = {
        theme: stored.theme || (stored.dark !== undefined ? (stored.dark ? 'dark' : 'light') : 'system'),
        dark: false,
        name: 'Mahasiswa',
        major: '',
        campus: ''
      };
      const result = Object.assign(defaults, stored);
      if (userId) {
        try {
          const userKey = `cm_profile_${userId}`;
          const userStored = JSON.parse(localStorage.getItem(userKey) || '{}');
          if (userStored.name) result.name = userStored.name;
          if (userStored.major) result.major = userStored.major;
          if (userStored.campus) result.campus = userStored.campus;
        } catch (e) {}
      }
      return result;
    },
    save(s, userId = null) {
      localStorage.setItem(KEYS.settings, JSON.stringify(s));
      if (userId) {
        try {
          const userKey = `cm_profile_${userId}`;
          localStorage.setItem(userKey, JSON.stringify({
            name: s.name || '',
            major: s.major || '',
            campus: s.campus || ''
          }));
        } catch (e) {}
      }
    },
    getUserProfile(userId) {
      if (!userId) return { name: '', major: '', campus: '' };
      try {
        const userKey = `cm_profile_${userId}`;
        return JSON.parse(localStorage.getItem(userKey) || '{}');
      } catch (e) {
        return { name: '', major: '', campus: '' };
      }
    },
    saveUserProfile(userId, profile) {
      if (!userId || !profile) return;
      try {
        const userKey = `cm_profile_${userId}`;
        localStorage.setItem(userKey, JSON.stringify({
          name: profile.name || '',
          major: profile.major || '',
          campus: profile.campus || ''
        }));
      } catch (e) {}
    }
  }
};
