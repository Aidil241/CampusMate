/**
 * seed.js
 * Pembersihan data lama (migrasi satu-kali).
 *
 * PERBAIKAN: sejak courses/tasks/notes/grades/schedules pindah ke Supabase,
 * fungsi ini tidak lagi "menyeeed" apa pun. Tugasnya sekarang cuma satu kali:
 * membuang sisa-sisa key localStorage dari versi lama aplikasi (sebelum
 * migrasi ke Supabase), supaya tidak ada data usang yang nyangkut di device.
 * Preferensi (cm_settings) sengaja TIDAK dihapus.
 */
import { DB } from './db.js';

// Naikkan versi ini kalau suatu saat perlu memaksa pembersihan ulang.
const SEED_VERSION = 'migrated_to_supabase_v1';

const LEGACY_KEYS = ['cm_courses', 'cm_tasks', 'cm_notes', 'cm_grades', 'cm_schedules', 'cm_exams'];

export function seedIfEmpty() {
  if (localStorage.getItem(DB.KEYS.seeded) === SEED_VERSION) return;

  LEGACY_KEYS.forEach(key => localStorage.removeItem(key));

  localStorage.setItem(DB.KEYS.seeded, SEED_VERSION);
}
