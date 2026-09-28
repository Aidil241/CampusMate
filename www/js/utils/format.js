/**
 * format.js
 * Helper untuk menyiapkan data agar aman & rapi ditampilkan di template HTML.
 */
import { daysDiff } from './date.js';

/** Escape karakter HTML berbahaya supaya aman disisipkan ke innerHTML (cegah XSS). */
export function esc(str) {
  return (str || '').toString().replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/**
 * Cari nama mata kuliah dari daftar courses yang sudah di-fetch dari Supabase.
 * PERBAIKAN: sebelumnya fungsi ini membaca DB.courses (localStorage) yang
 * selalu kosong karena data mata kuliah asli tersimpan di Supabase. Sekarang
 * caller wajib mengoper array `courses` miliknya sendiri (hasil fetch).
 */
export function courseName(courses, id) {
  const c = (courses || []).find(c => c.id === id);
  return c ? c.name : 'Umum';
}

export function fmtTime(t) {
  return t || '--:--';
}

/** Badge status deadline (warna + teks) berdasarkan tanggal & status tugas. */
export function deadlineBadge(deadlineDate, status) {
  if (!deadlineDate) {
    return { cls: 'badge-ghost', text: 'Tanpa Deadline' };
  }

  // Jika parameter yang dikirim berupa objek tugas (antisipasi beda penamaan properti)
  const dateStr = (typeof deadlineDate === 'object' && deadlineDate !== null) 
    ? (deadlineDate.due || deadlineDate.deadline) 
    : deadlineDate;

  if (!dateStr) {
    return { cls: 'badge-ghost', text: 'Tanpa Deadline' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (isNaN(diffDays)) {
    return { cls: 'badge-ghost', text: '-' };
  }

  if (status === 'Selesai') {
    return { cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 font-semibold', text: 'Selesai' };
  }

  if (diffDays < 0) {
    return { cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 font-bold', text: `Terlambat ${Math.abs(diffDays)}h` };
  } else if (diffDays === 0) {
    return { cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 font-bold', text: 'Hari Ini' };
  } else if (diffDays <= 3) {
    return { cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 font-semibold', text: `${diffDays} Hari Lagi` };
  } else {
    return { cls: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium', text: `${diffDays} Hari Lagi` };
  }
}

export function priorityBadgeClass(p) {
  if (p === 'Tinggi') return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60 font-semibold';
  if (p === 'Sedang') return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 font-medium';
  return 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium';
}
