/**
 * format.js
 * Helper untuk menyiapkan data agar aman & rapi ditampilkan di template HTML.
 */
import { DB } from '../data/db.js';
import { daysDiff } from './date.js';

/** Escape karakter HTML berbahaya supaya aman disisipkan ke innerHTML (cegah XSS). */
export function esc(str) {
  return (str || '').toString().replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export function courseName(id) {
  const c = DB.courses.find(id);
  return c ? c.name : 'Umum';
}

export function fmtTime(t) {
  return t || '--:--';
}

/** Badge status deadline (warna + teks) berdasarkan tanggal & status tugas. */
export function deadlineBadge(dateStr, status) {
  if (status === 'Selesai') return { cls: 'badge-success', text: 'Selesai' };
  const diff = daysDiff(dateStr);
  if (diff < 0) return { cls: 'badge-error', text: 'Terlambat ' + Math.abs(diff) + ' hr' };
  if (diff === 0) return { cls: 'badge-error', text: 'Hari ini' };
  if (diff === 1) return { cls: 'badge-warning', text: 'Besok' };
  if (diff <= 3) return { cls: 'badge-warning', text: 'H-' + diff };
  return { cls: 'badge-ghost', text: 'H-' + diff };
}

export function priorityBadgeClass(p) {
  return p === 'Tinggi' ? 'badge-error' : (p === 'Sedang' ? 'badge-warning' : 'badge-success');
}
