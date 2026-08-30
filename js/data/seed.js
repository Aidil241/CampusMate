/**
 * seed.js
 * Inisialisasi data awal. Saat ini disetel untuk selalu mulai dari kosong
 * (lihat SEED_VERSION) — dulu dipakai untuk memaksa localStorage lama
 * dibersihkan sekali saat rilis versi baru.
 */
import { DB } from './db.js';

// Naikkan versi ini kalau suatu saat perlu memaksa reset data user lama lagi.
const SEED_VERSION = 'clean_v2';

export function seedIfEmpty() {
  if (localStorage.getItem(DB.KEYS.seeded) === SEED_VERSION) return;

  DB.set(DB.KEYS.courses, []);
  DB.set(DB.KEYS.schedules, []);
  DB.set(DB.KEYS.tasks, []);
  DB.set(DB.KEYS.notes, []);
  DB.set(DB.KEYS.grades, []);

  localStorage.setItem(DB.KEYS.seeded, SEED_VERSION);
}
