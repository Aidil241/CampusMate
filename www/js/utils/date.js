/**
 * date.js
 * Helper terkait tanggal & hari (locale Indonesia).
 */
export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/** Nama hari ini dalam Bahasa Indonesia, mengikuti urutan DAYS (Senin..Minggu). */
export function todayDayName() {
  const jsDay = new Date().getDay(); // 0 = Minggu di JS
  return DAYS[(jsDay + 6) % 7];
}

/** Format tanggal panjang, contoh: "Senin, 1 Januari 2026". */
export function fmtDateLong(d) {
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function toDateOnly(str) {
  return new Date(str + 'T00:00:00');
}

/** Selisih hari antara dateStr dan hari ini (positif = di masa depan). */
export function daysDiff(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((toDateOnly(dateStr) - today) / 86400000);
}
