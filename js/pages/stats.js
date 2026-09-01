/**
 * pages/stats.js
 * Halaman Statistik Akademik (V2 - Diperkaya Analisis & Rincian)
 */
import { DB } from '../data/db.js';
import { esc, courseName } from '../utils/format.js';

export function pageStats() {
  // Ambil data dari database
  const tasks = DB.tasks ? DB.tasks.all() : [];
  const courses = DB.courses ? DB.courses.all() : [];
  const schedules = DB.schedules ? DB.schedules.all() : [];

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Selesai').length;
  const activeTasks = totalTasks - doneTasks;
  
  // Hitung persentase progres
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // Analisis Prioritas Tugas
  const highPriority = tasks.filter(t => t.priority === 'Tinggi' && t.status !== 'Selesai').length;
  const mediumPriority = tasks.filter(t => t.priority === 'Sedang' && t.status !== 'Selesai').length;
  const lowPriority = tasks.filter(t => t.priority === 'Rendah' && t.status !== 'Selesai').length;

  // Kelompokkan tugas aktif berdasarkan Mata Kuliah
  const tasksPerCourse = {};
  tasks.forEach(t => {
    if (t.status !== 'Selesai' && t.course_id) {
      tasksPerCourse[t.course_id] = (tasksPerCourse[t.course_id] || 0) + 1;
    }
  });

  return `
    <div class="space-y-4">
      
      <!-- Kartu Utama: Progres Tugas (Radial Progress) -->
      <div class="bg-primary text-primary-content p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold opacity-80 uppercase tracking-wider">Performa Akademik</h2>
          <div class="text-2xl font-black mt-1">${progressPercent}% Selesai</div>
          <p class="text-xs opacity-90 mt-0.5">${doneTasks} dari ${totalTasks} total tugas telah beres</p>
        </div>
        <div class="radial-progress bg-primary-focus border-4 border-primary-focus text-primary-content" style="--value:${progressPercent}; --size:4rem; --thickness: 5px;">
          <span class="text-xs font-bold">${progressPercent}%</span>
        </div>
      </div>

      <!-- Grid Statistik Cepat -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-base-100 p-4 border border-base-200 rounded-2xl shadow-sm flex items-center gap-3">
          <div class="p-3 bg-brand/10 text-brand rounded-xl text-lg font-bold">📚</div>
          <div>
            <div class="text-lg font-black">${courses.length}</div>
            <div class="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">Mata Kuliah</div>
          </div>
        </div>
        <div class="bg-base-100 p-4 border border-base-200 rounded-2xl shadow-sm flex items-center gap-3">
          <div class="p-3 bg-secondary/10 text-secondary rounded-xl text-lg font-bold">🗓️</div>
          <div>
            <div class="text-lg font-black">${schedules.length}</div>
            <div class="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">Jadwal Kelas</div>
          </div>
        </div>
      </div>

      <!-- Analisis Beban Tugas Berdasarkan Prioritas -->
      <div class="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-4">
        <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/50 mb-3">Beban Tugas Aktif (Belum Selesai)</h3>
        
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-error/10 border border-error/20 p-3 rounded-xl">
            <div class="text-base font-black text-error">${highPriority}</div>
            <div class="text-[10px] font-bold text-error/80 mt-0.5">Tinggi</div>
          </div>
          <div class="bg-warning/10 border border-warning/20 p-3 rounded-xl">
            <div class="text-base font-black text-warning">${mediumPriority}</div>
            <div class="text-[10px] font-bold text-warning/80 mt-0.5">Sedang</div>
          </div>
          <div class="bg-info/10 border border-info/20 p-3 rounded-xl">
            <div class="text-base font-black text-info">${lowPriority}</div>
            <div class="text-[10px] font-bold text-info/80 mt-0.5">Rendah</div>
          </div>
        </div>
      </div>

      <!-- Rincian Tugas per Mata Kuliah -->
      <div class="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-4">
        <h3 class="font-bold text-xs uppercase tracking-wider text-base-content/50 mb-3">Tugas Aktif per Mata Kuliah</h3>
        
        <div class="space-y-2">
          ${Object.keys(tasksPerCourse).length > 0 ? Object.entries(tasksPerCourse).map(([courseId, count]) => `
            <div class="flex items-center justify-between text-xs py-1.5 border-b border-base-100 last:border-0">
              <span class="font-medium truncate pr-2">${esc(courseName(courseId))}</span>
              <span class="badge badge-sm badge-outline font-bold">${count} tugas</span>
            </div>
          `).join('') : `
            <div class="text-center py-4 text-xs text-base-content/40 italic">Tidak ada tugas aktif saat ini. Mantap! 🎉</div>
          `}
        </div>
      </div>

    </div>
  `;
}