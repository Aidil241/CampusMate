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
export function deadlineBadge(deadlineDate, status) {
  // Jika parameter yang dikirim berupa objek tugas (antisipasi beda penamaan properti)
  const dateStr = typeof deadlineDate === 'object' ? (deadlineDate.due || deadlineDate.deadline) : deadlineDate;

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
    return { cls: 'badge-success', text: 'Selesai' };
  }

  if (diffDays < 0) {
    return { cls: 'bg-base-300 text-base-content/70 border-none', text: 'Terlambat' };
  } else if (diffDays === 0) {
    return { cls: 'badge-error animate-pulse', text: 'HARI INI!' };
  } else if (diffDays <= 3) {
    return { cls: 'badge-error', text: `${diffDays} Hari Lagi` };
  } else {
    return { cls: 'badge-warning', text: `${diffDays} Hari Lagi` };
  }
}

export function priorityBadgeClass(p) {
  return p === 'Tinggi' ? 'badge-error' : (p === 'Sedang' ? 'badge-warning' : 'badge-success');
}
