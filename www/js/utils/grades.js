/**
 * grades.js
 * Semua rumus/kalkulasi terkait nilai & IPK dikumpulkan di sini,
 * terpisah dari kode tampilan (pages/grades.js, pages/home.js).
 *
 * PERBAIKAN:
 * - Sebelumnya file ini membaca DB.grades/DB.courses dari localStorage
 *   (yang selalu kosong), sementara pages/grades.js dan pages/home.js
 *   masing-masing menulis ULANG fungsi IPK versi sendiri di atas data
 *   Supabase — dan skala nilainya BERBEDA satu sama lain (80/75/70... vs
 *   85/80/75...). Sekarang hanya ada SATU skala (skala yang sudah dipakai
 *   di UI grades.js & home.js), dan fungsi di sini murni menerima data
 *   sebagai parameter — tidak bergantung pada sumber data manapun, jadi
 *   bisa dipanggil ulang dari halaman manapun tanpa duplikasi logika.
 */

export function scoreToLetter(score) {
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

export function letterToPoint(letter) {
  switch (letter) {
    case 'A': return 4.0;
    case 'A-': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'B-': return 2.7;
    case 'C+': return 2.3;
    case 'C': return 2.0;
    case 'D': return 1.0;
    default: return 0.0;
  }
}

/** Nilai akhir satu mata kuliah dari rata-rata tertimbang komponen nilainya, atau null jika belum ada. */
export function courseFinalScore(gradesList, courseId) {
  const items = (gradesList || []).filter(g => g.course_id != null && courseId != null && String(g.course_id) === String(courseId));
  if (items.length === 0) return null;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const g of items) {
    const weight = Number(g.weight) || 0;
    const score = Number(g.score) || 0;
    totalWeightedScore += score * (weight / 100);
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    return totalWeightedScore * (100 / totalWeight);
  }
  const sum = items.reduce((acc, curr) => acc + Number(curr.score), 0);
  return sum / items.length;
}

/** IPK berjalan berdasarkan mata kuliah yang sudah punya nilai akhir. */
export function computeIPK(coursesList, gradesList) {
  const courses = coursesList || [];
  if (courses.length === 0) return '-';

  let totalPoints = 0;
  let totalCredits = 0;
  let hasValidGrade = false;

  for (const c of courses) {
    const fin = courseFinalScore(gradesList, c.id);
    if (fin !== null) {
      hasValidGrade = true;
      const point = letterToPoint(scoreToLetter(fin));
      const credits = Number(c.credits ?? c.sks ?? 0);
      totalPoints += point * credits;
      totalCredits += credits;
    }
  }

  if (!hasValidGrade || totalCredits === 0) return '-';
  return (totalPoints / totalCredits).toFixed(2);
}

/**
 * Kelas badge Material 3 tonal semantic berdasarkan nilai angka atau huruf.
 */
export function getGradeBadgeClass(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return 'bg-base-200 border-base-300 text-base-content/70';
  }
  const num = Number(score);
  if (num >= 80) {
    return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300';
  }
  if (num >= 65) {
    return 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300';
  }
  if (num >= 55) {
    return 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300';
  }
  return 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300';
}

/** Ringkasan total bobot komponen yang sudah diinput untuk satu mata kuliah. */
export function courseWeightSummary(gradesList, courseId) {
  const items = (gradesList || []).filter(g => g.course_id != null && courseId != null && String(g.course_id) === String(courseId));
  const totalWeight = items.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);
  return {
    totalWeight,
    isComplete: totalWeight === 100,
    isOver: totalWeight > 100,
    count: items.length
  };
}

/** Ringkasan SKS yang sudah dinilai vs total SKS terdaftar. */
export function computeCreditsSummary(coursesList, gradesList) {
  const courses = coursesList || [];
  let totalCredits = 0;
  let gradedCredits = 0;
  let gradedCoursesCount = 0;

  for (const c of courses) {
    const credits = Number(c.credits ?? c.sks ?? 0);
    totalCredits += credits;
    const items = (gradesList || []).filter(g => g.course_id != null && c.id != null && String(g.course_id) === String(c.id));
    if (items.length > 0) {
      gradedCredits += credits;
      gradedCoursesCount++;
    }
  }

  return {
    totalCredits,
    gradedCredits,
    totalCourses: courses.length,
    gradedCourses: gradedCoursesCount
  };
}
