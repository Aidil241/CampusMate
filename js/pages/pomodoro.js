/**
 * pages/pomodoro.js
 * Halaman Pomodoro Timer untuk produktivitas pengerjaan tugas
 */
import { state } from '../core/state.js';
import { render } from '../core/render.js';

// Inisialisasi state timer jika belum ada
if (state.pomodoro === undefined) {
  state.pomodoro = {
    timeLeft: 25 * 60, // 25 menit dalam detik
    isRunning: false,
    mode: 'focus', // 'focus' (25m) atau 'break' (5m)
    timerId: null
  };
}

export function pagePomodoro() {
  const p = state.pomodoro;
  
  // Format detik ke MM:SS
  const minutes = Math.floor(p.timeLeft / 60);
  const seconds = p.timeLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Hitung persentase untuk lingkaran progres
  const totalTime = p.mode === 'focus' ? 25 * 60 : 5 * 60;
  const progressPercent = Math.round(((totalTime - p.timeLeft) / totalTime) * 100);

  return `
    <div class="space-y-6 text-center max-w-sm mx-auto pt-2">
      
      <!-- Pemilih Mode (Fokus vs Istirahat) -->
      <div class="inline-flex bg-base-200 p-1 rounded-full">
        <button onclick="App.setPomodoroMode('focus')" class="btn btn-xs rounded-full px-4 ${p.mode === 'focus' ? 'btn-primary' : 'btn-ghost'}">Fokus (25m)</button>
        <button onclick="App.setPomodoroMode('break')" class="btn btn-xs rounded-full px-4 ${p.mode === 'break' ? 'btn-secondary' : 'btn-ghost'}">Istirahat (5m)</button>
      </div>

      <!-- Lingkaran Timer Utama -->
      <div class="relative flex items-center justify-center py-6">
        <div class="radial-progress bg-base-200 text-primary border-4 border-base-200 transition-all duration-500" style="--value:${progressPercent}; --size:12rem; --thickness: 8px;">
          <div class="flex flex-col items-center">
            <span class="text-4xl font-black tracking-wider">${timeString}</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mt-1">
              ${p.mode === 'focus' ? ' Waktu Fokus' : ' Waktu Istirahat'}
            </span>
          </div>
        </div>
      </div>

      <!-- Tombol Kontrol -->
      <div class="flex justify-center gap-3">
        <button onclick="App.togglePomodoro()" class="btn ${p.isRunning ? 'btn-warning' : 'btn-primary'} w-32 rounded-2xl shadow-sm font-bold">
          ${p.isRunning ? '⏸ Jeda' : '▶ Mulai'}
        </button>
        <button onclick="App.resetPomodoro()" class="btn btn-outline border-base-300 rounded-2xl">
           Reset
        </button>
      </div>

      <!-- Kartu Tips Singkat -->
      <div class="bg-base-100 border border-base-200 p-4 rounded-2xl text-left shadow-sm space-y-1">
        <div class="text-xs font-bold flex items-center gap-1.5">💡 Tips Produktivitas</div>
        <p class="text-[11px] text-base-content/60 leading-relaxed">
          ${p.mode === 'focus' 
            ? 'Singkirkan ponsel dan fokus pada satu tugas prioritas tinggi hingga waktu habis.' 
            : 'Gunakan waktu istirahat untuk merenggangkan otot atau minum air putih.'}
        </p>
      </div>

    </div>
  `;
}

// Logika / Kontrol Timer (Ditempel ke App namespace agar bisa dipanggil lewat onclick)
import { App } from '../core/app-namespace.js';

App.setPomodoroMode = (mode) => {
  if (state.pomodoro.timerId) clearInterval(state.pomodoro.timerId);
  state.pomodoro.isRunning = false;
  state.pomodoro.mode = mode;
  state.pomodoro.timeLeft = mode === 'focus' ? 25 * 60 : 5 * 60;
  state.pomodoro.timerId = null;
  render();
};

App.togglePomodoro = () => {
  const p = state.pomodoro;
  if (p.isRunning) {
    clearInterval(p.timerId);
    p.isRunning = false;
    p.timerId = null;
  } else {
    p.isRunning = true;
    p.timerId = setInterval(() => {
      if (state.pomodoro.timeLeft > 0) {
        state.pomodoro.timeLeft--;
        render();
      } else {
        clearInterval(state.pomodoro.timerId);
        state.pomodoro.isRunning = false;
        state.pomodoro.timerId = null;
        alert(state.pomodoro.mode === 'focus' ? 'Sesi fokus selesai! Waktunya istirahat ' : 'Waktu istirahat selesai! Siap fokus kembali? ');
        render();
      }
    }, 1000);
  }
  render();
};

App.resetPomodoro = () => {
  const p = state.pomodoro;
  if (p.timerId) clearInterval(p.timerId);
  p.isRunning = false;
  p.timerId = null;
  p.timeLeft = p.mode === 'focus' ? 25 * 60 : 5 * 60;
  render();
};