/**
 * grades.js
 * Semua rumus/kalkulasi terkait nilai & IPK dikumpulkan di sini,
 * terpisah dari kode tampilan (pages/grades.js).
 */
import { DB } from '../data/db.js';

export function scoreToIP(score) {
  if (score >= 80) return 4;
  if (score >= 75) return 3.5;
  if (score >= 70) return 3;
  if (score >= 65) return 2.5;
  if (score >= 60) return 2;
  if (score >= 50) return 1;
  return 0;
}

export function scoreToLetter(score) {
  if (score >= 80) return 'A';
  if (score >= 75) return 'AB';
  if (score >= 70) return 'B';
  if (score >= 65) return 'BC';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'E';
}

/** Nilai akhir satu mata kuliah dari rata-rata tertimbang komponen nilainya, atau null jika belum ada. */
export function courseFinalScore(courseId) {
  const items = DB.grades.all().filter(g => g.course_id === courseId);
  const totalWeight = items.reduce((a, g) => a + Number(g.weight || 0), 0);
  if (!items.length || totalWeight === 0) return null;
  return items.reduce((a, g) => a + (Number(g.weight || 0) * Number(g.score || 0)), 0) / totalWeight;
}

/** IPK berjalan berdasarkan mata kuliah yang sudah punya nilai akhir. */
export function computeIPK() {
  const courses = DB.courses.all();
  let totalCredits = 0, totalPoints = 0, counted = 0;
  courses.forEach(c => {
    const fin = courseFinalScore(c.id);
    if (fin !== null) {
      totalCredits += Number(c.credits || 0);
      totalPoints += scoreToIP(fin) * Number(c.credits || 0);
      counted++;
    }
  });
  return (counted === 0 || totalCredits === 0) ? null : (totalPoints / totalCredits).toFixed(2);
}
