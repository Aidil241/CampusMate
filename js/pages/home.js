/**
 * pages/home.js
 * Halaman Beranda: ringkasan jadwal hari ini, deadline terdekat, progres tugas.
 */
import { DB } from '../data/db.js';
import { ICON } from '../utils/icons.js';
import { esc, courseName, fmtTime, deadlineBadge, priorityBadgeClass } from '../utils/format.js';
import { todayDayName, fmtDateLong } from '../utils/date.js';
import { computeIPK } from '../utils/grades.js';

export function pageHome() {
  const s = DB.settings.get();
  const todayName = todayDayName();
  const todaySched = DB.schedules.all().filter(sc => sc.day === todayName);
  const tasks = DB.tasks.all();
  // Hanya ambil tugas yang belum selesai untuk ditampilkan di Home
  const pending = tasks.filter(t => t.status !== 'Selesai');
  const doneCount = tasks.filter(t => t.status === 'Selesai').length;
  const progressPct = tasks.length ? Math.round(doneCount / tasks.length * 100) : 0;
  const ipk = computeIPK();

  return `
    <!-- Hero Banner -->
    <div class="bg-gradient-to-br from-brand to-brand-dark text-white p-5 rounded-3xl shadow-lg mb-6">
      <p class="text-xs opacity-80 font-medium">Selamat Datang, ${esc(s.name)} 👋</p>
      <h1 class="text-xl font-bold mt-1">Yuk cek agenda kamu</h1>
      <p class="text-xs opacity-75 mt-1">${fmtDateLong(new Date())}</p>
      <div class="grid grid-cols-3 gap-2 mt-4 text-center">
        <div class="bg-white/10 backdrop-blur p-2 rounded-xl">
          <b class="text-lg block">${todaySched.length}</b><span class="text-[9px] uppercase tracking-wider opacity-80">Jadwal</span>
        </div>
        <div class="bg-white/10 backdrop-blur p-2 rounded-xl">
          <b class="text-lg block">${pending.length}</b><span class="text-[9px] uppercase tracking-wider opacity-80">Tugas Aktif</span>
        </div>
        <div class="bg-white/10 backdrop-blur p-2 rounded-xl">
          <b class="text-lg block">${ipk ? ipk : '-'}</b><span class="text-[9px] uppercase tracking-wider opacity-80">IPK</span>
        </div>
      </div>
    </div>

    <!-- Jadwal Hari Ini -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-bold text-sm">Jadwal Hari Ini</h2>
        <button onclick="App.navigate('schedule')" class="text-xs text-brand font-semibold">Lihat semua</button>
      </div>
      ${todaySched.length ? `<div class="space-y-2">${todaySched.map(sc => `
        <div class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <div class="text-center font-bold text-xs text-brand pr-3 border-r border-base-200">
            ${fmtTime(sc.start_time)}<small class="block text-[9px] text-base-content/50">${fmtTime(sc.end_time)}</small>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs truncate">${esc(courseName(sc.course_id))}</h4>
            <p class="text-[11px] text-base-content/60">${ICON.mapPin} ${esc(sc.room || '-')}</p>
          </div>
        </div>`).join('')}</div>` : `<div class="text-center p-6 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Tidak ada jadwal hari ini</div>`}
    </div>

    <!-- Deadline Terdekat -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-bold text-sm">Deadline Terdekat</h2>
        <button onclick="App.navigate('tasks')" class="text-xs text-brand font-semibold">Lihat semua</button>
      </div>
      ${pending.length ? `<div class="space-y-2">${pending.map(t => {
        const b = deadlineBadge(t.deadline, t.status);
        return `
        <div class="flex items-start gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <!-- Tombol Centang Langsung Selesai -->
          <input type="checkbox" onclick="App.toggleTask('${t.id}')" class="checkbox checkbox-sm checkbox-primary mt-0.5 cursor-pointer" />

          <!-- Area Teks Bisa Diklik Untuk Edit -->
          <div class="flex-1 min-w-0 cursor-pointer" onclick="App.editTask('${t.id}')">
            <h4 class="font-bold text-xs">${esc(t.title)}</h4>
            <div class="flex gap-1.5 mt-1 flex-wrap items-center">
              <span class="text-[10px] text-base-content/60 font-medium">${esc(courseName(t.course_id))}</span>
              <span class="badge ${b.cls} badge-xs font-semibold">${b.text}</span>
              <span class="badge ${priorityBadgeClass(t.priority)} badge-xs">${t.priority}</span>
            </div>
          </div>
        </div>`;
      }).join('')}</div>` : `<div class="text-center p-6 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Semua tugas beres! 🎉</div>`}
    </div>

    <!-- Progress Tugas -->
    <div class="card bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
      <div class="flex justify-between text-xs font-semibold mb-2">
        <span class="text-base-content/60">Penyelesaian Tugas</span>
        <span class="text-brand font-bold">${progressPct}%</span>
      </div>
      <progress class="progress progress-primary w-full" value="${progressPct}" max="100"></progress>
    </div>
  `;
}
