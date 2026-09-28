/**
 * core/session.js
 * Manajemen Siklus Sesi Pengguna & Invalidation Cache Terpadu
 *
 * Memastikan data pengguna (tasks, profile, schedules, exams, notes, grades, courses)
 * terisolasi secara ketat per user ID dan langsung dibersihkan saat logout atau
 * pergantian akun (User A -> User B).
 */
import { resetProfileCache } from '../data/profile.js';
import { resetTasksCache } from '../pages/tasks.js';
import { resetCoursesCache } from '../data/courses.js';
import { resetGradesCache } from '../data/grades.js';
import { resetExamsCache } from '../pages/exams.js';
import { resetSchedulesCache } from '../pages/schedule.js';
import { resetNotesCache } from '../pages/notes.js';
import { resetHomeData } from '../pages/home.js';
import { resetSettingsProfileCache } from '../pages/settings.js';

let lastActiveUserId = null;

/**
 * Membersihkan seluruh cache in-memory data pengguna
 */
export function clearAllUserCaches() {
  console.log('[Session] Invalidate & membersihkan seluruh cache pengguna');
  try { resetProfileCache(); } catch (e) { console.warn('[Session] resetProfileCache error:', e); }
  try { resetTasksCache(); } catch (e) { console.warn('[Session] resetTasksCache error:', e); }
  try { resetCoursesCache(); } catch (e) { console.warn('[Session] resetCoursesCache error:', e); }
  try { resetGradesCache(); } catch (e) { console.warn('[Session] resetGradesCache error:', e); }
  try { resetExamsCache(); } catch (e) { console.warn('[Session] resetExamsCache error:', e); }
  try { resetSchedulesCache(); } catch (e) { console.warn('[Session] resetSchedulesCache error:', e); }
  try { resetNotesCache(); } catch (e) { console.warn('[Session] resetNotesCache error:', e); }
  try { resetHomeData(); } catch (e) { console.warn('[Session] resetHomeData error:', e); }
  try { resetSettingsProfileCache(); } catch (e) { console.warn('[Session] resetSettingsProfileCache error:', e); }
}

/**
 * Memeriksa apakah user ID yang aktif telah berubah.
 * Jika berubah (misal A -> B, atau A -> null), seluruh cache langsung di-invalidate.
 * @param {string|null} currentUserId - ID user yang sedang aktif
 * @returns {boolean} True jika terjadi pergantian user
 */
export function checkUserSessionChange(currentUserId) {
  if (lastActiveUserId !== null && lastActiveUserId !== currentUserId) {
    console.log(`[Session] User ID berubah dari ${lastActiveUserId} ke ${currentUserId}`);
    clearAllUserCaches();
    lastActiveUserId = currentUserId;
    return true;
  }
  lastActiveUserId = currentUserId;
  return false;
}
