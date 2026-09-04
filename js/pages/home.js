/**
 * pages/home.js
 * Halaman utama / dashboard (Supabase Edition).
 */
import { App } from '../core/app-namespace.js';
import { supabase } from '../data/supabase.js';
import { ICON } from '../utils/icons.js';
import { esc, fmtTime } from '../utils/format.js';
import { todayDayName } from '../utils/date.js';
import { render } from '../core/render.js';

let homeData = {
  profile: null,
  schedules: [],
  courses: [],
  grades: [],
  tasks: [],
  exams: [],
  isFetching: false
};

// Ambil semua data yang diperlukan untuk Dashboard Home
async function fetchHomeData() {
  if (homeData.isFetching) return;
  homeData.isFetching = true;

  const [profRes, schRes, crsRes, grdRes, tskRes, exmRes] = await Promise.all([
    supabase.from('profiles').select('*').maybeSingle(),
    supabase.from('schedules').select('*'),
    supabase.from('courses').select('*'),
    supabase.from('grades').select('*'),
    supabase.from('tasks').select('*').eq('status', 'Belum dikerjakan'),
    supabase.from('exams').select('*').order('exam_date', { ascending: true })
  ]);

  if (!profRes.error) homeData.profile = profRes.data;
  if (!schRes.error && schRes.data) homeData.schedules = schRes.data;
  if (!crsRes.error && crsRes.data) homeData.courses = crsRes.data;
  if (!grdRes.error && grdRes.data) homeData.grades = grdRes.data;
  if (!tskRes.error && tskRes.data) homeData.tasks = tskRes.data;
  if (!exmRes.error && exmRes.data) homeData.exams = exmRes.data;

  homeData.isFetching = false;
  render();
}

// Panggil saat pertama kali dimuat
fetchHomeData();

// Helper hitung IPK ringkas
function computeIPK() {
  if (!homeData.courses.length) return '-';
  let totalPoints = 0;
  let totalCredits = 0;
  let hasValid = false;

  for (const c of homeData.courses) {
    const courseGrades = homeData.grades.filter(g => g.course_id === c.id);
    if (courseGrades.length === 0) continue;

    let weightedSum = 0;
    let weightTotal = 0;
    for (const g of courseGrades) {
      const w = Number(g.weight) || 0;
      const s = Number(g.score) || 0;
      weightedSum += s * (w / 100);
      weightTotal += w;
    }

    const fin = weightTotal > 0 ? weightedSum * (100 / weightTotal) : courseGrades.reduce((a, b) => a + Number(b.score), 0) / courseGrades.length;
    
    hasValid = true;
    let letter = 'E';
    let point = 0.0;
    if (fin >= 85) { letter = 'A'; point = 4.0; }
    else if (fin >= 80) { letter = 'A-'; point = 3.7; }
    else if (fin >= 75) { letter = 'B+'; point = 3.3; }
    else if (fin >= 70) { letter = 'B'; point = 3.0; }
    else if (fin >= 65) { letter = 'B-'; point = 2.7; }
    else if (fin >= 60) { letter = 'C+'; point = 2.3; }
    else if (fin >= 55) { letter = 'C'; point = 2.0; }
    else if (fin >= 40) { letter = 'D'; point = 1.0; }

    const cred = Number(c.credits) || 0;
    totalPoints += point * cred;
    totalCredits += cred;
  }

  if (!hasValid || totalCredits === 0) return '-';
  return (totalPoints / totalCredits).toFixed(2);
}

export function pageHome() {
  if (!homeData.profile && !homeData.isFetching) {
    fetchHomeData();
  }

  const name = homeData.profile ? homeData.profile.name : 'Mahasiswa';
  const ipk = computeIPK();
  const currentDay = todayDayName(); // Contoh: 'Senin', 'Selasa', dll.

  // Filter jadwal hari ini
  const todaySchedules = homeData.schedules.filter(s => s.day === currentDay);
  
  // Ambil ujian terdekat berikutnya
  const nextExam = homeData.exams.find(e => new Date(e.exam_date) >= new Date()) || homeData.exams[0];

  return `
    <div class="space-y-4">
      <!-- Welcome & IPK Card -->
      <div class="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 rounded-3xl flex justify-between items-center shadow-sm">
        <div>
          <span class="text-[11px] text-base-content/60 font-medium">Selamat Datang,</span>
          <h2 class="text-base font-bold text-primary">${esc(name)}</h2>
          <p class="text-[10px] text-base-content/50 mt-0.5">Semoga harimu menyenangkan!</p>
        </div>
        <div class="text-right bg-base-100 px-3 py-2 rounded-2xl border border-base-200 shadow-sm">
          <span class="text-[9px] uppercase tracking-wider text-base-content/50 block font-bold">IPK</span>
          <span class="text-lg font-extrabold text-warning">${ipk}</span>
        </div>
      </div>

      <!-- Jadwal Hari Ini -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/60">Jadwal Kuliah (${currentDay})</h3>
          <span class="text-[10px] text-primary font-semibold">${todaySchedules.length} Kelas</span>
        </div>
        <div class="space-y-2">
          ${todaySchedules.length ? todaySchedules.map(sc => {
            const courseObj = homeData.courses.find(c => c.id === sc.course_id);
            const courseName = courseObj ? courseObj.name : 'Mata Kuliah';
            return `
              <div class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
                <div class="text-center font-bold text-xs text-primary pr-3 border-r border-base-200">
                  ${fmtTime(sc.start_time)}<small class="block text-[9px] text-base-content/50">${fmtTime(sc.end_time)}</small>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-xs truncate">${esc(courseName)}</h4>
                  <p class="text-[11px] text-base-content/60">${esc(sc.room || '-')}</p>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="text-center p-6 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">
              Tidak ada jadwal kuliah hari ini 🎉
            </div>
          `}
        </div>
      </div>

      <!-- Ringkasan Tugas & Ujian Terdekat -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <span class="text-[10px] text-base-content/50 font-medium block">Tugas Belum Selesai</span>
          <span class="text-xl font-extrabold text-error">${homeData.tasks.length}</span>
          <span class="text-[10px] block text-base-content/60 mt-1">Item aktif</span>
        </div>
        <div class="p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <span class="text-[10px] text-base-content/50 font-medium block">Ujian Terdekat</span>
          <span class="text-xs font-bold truncate block mt-1">${nextExam ? esc(nextExam.title) : 'Tidak ada'}</span>
          <span class="text-[10px] block text-base-content/60 mt-0.5">${nextExam ? new Date(nextExam.exam_date).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : '-'}</span>
        </div>
      </div>
    </div>
  `;
}