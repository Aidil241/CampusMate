/**
 * pages/pomodoro.js
 * Halaman Pomodoro Focus Timer untuk produktivitas pengerjaan tugas akademik.
 * Standard: CampusMate M3 / Android-first / The Focused Scholar.
 */
import { App } from '../core/app-namespace.js';
import { state } from '../core/state.js';
import { render } from '../core/render.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';

// Inisialisasi state timer jika belum ada
if (state.pomodoro === undefined) {
  state.pomodoro = {
    timeLeft: 25 * 60, // 25 menit dalam detik
    isRunning: false,
    mode: 'focus', // 'focus' (25m) atau 'break' (5m)
    timerId: null
  };
}

// Konstanta geometris lingkaran progress SVG (radius = 84, circumference = 2 * PI * 84 ≈ 528)
const CIRCUMFERENCE = 528;

/**
 * Format total detik ke representasi MM:SS
 */
function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Mendapatkan total durasi standar per mode (dalam detik)
 */
export function getTotalTime(mode) {
  return mode === 'focus' ? 25 * 60 : 5 * 60;
}

/**
 * Helper informasi konteks Pomodoro untuk konsumsi Top App Bar
 */
export function getPomodoroContext() {
  const p = state.pomodoro;
  if (!p) return 'Fokus belajar tanpa distraksi';

  const totalTime = getTotalTime(p.mode);
  if (p.timeLeft === 0) {
    return p.mode === 'focus' ? 'Sesi fokus selesai' : 'Waktu istirahat selesai';
  }
  if (p.isRunning) {
    return p.mode === 'focus' ? 'Sesi fokus sedang berjalan' : 'Waktu istirahat sejenak';
  }
  if (p.timeLeft < totalTime && p.timeLeft > 0) {
    return 'Sesi belajar dijeda';
  }
  return 'Fokus belajar tanpa distraksi';
}

/**
 * Menghitung persentase progres (0 - 100)
 */
function getProgressPercent(timeLeft, mode) {
  const totalTime = getTotalTime(mode);
  return Math.min(100, Math.max(0, Math.round(((totalTime - timeLeft) / totalTime) * 100)));
}

/**
 * Helper notifikasi toast konsisten CampusMate
 */
function showToast(message, isError = false) {
  const toast = document.getElementById('toastStack');
  if (!toast) return;
  const el = document.createElement('div');
  el.className = isError
    ? 'alert alert-error text-xs shadow-none border border-rose-200 dark:border-rose-900 py-2.5 px-3.5 rounded-2xl flex items-center gap-2'
    : 'alert alert-info text-xs shadow-none border border-brand/20 dark:border-indigo-900/60 bg-brand/10 dark:bg-indigo-950/60 text-brand-dark dark:text-indigo-200 py-2.5 px-3.5 rounded-2xl flex items-center gap-2';
  el.innerHTML = `<span>${esc(message)}</span>`;
  toast.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/**
 * Audio chime lembut saat sesi selesai (Web Audio API + Vibrate)
 */
function playCompletionChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // Nada D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3); // Meluncur ke A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    // Abaikan jika AudioContext diblokir policy browser
  }

  if (navigator.vibrate) {
    try { navigator.vibrate([120, 80, 120]); } catch (e) {}
  }
}

/**
 * Pembaruan lokal DOM Pomodoro setiap detik (ringan, tanpa memicu render() global)
 */
function updatePomodoroDOM() {
  if (state.route !== 'pomodoro') return;

  const p = state.pomodoro;
  const timeEl = document.getElementById('pomodoroTime');
  const ringEl = document.getElementById('pomodoroRing');
  const percentEl = document.getElementById('pomodoroPercent');
  const subtitleEl = document.getElementById('pomodoroSubtitle');

  if (timeEl) {
    timeEl.textContent = formatTime(p.timeLeft);
  }

  const progressPercent = getProgressPercent(p.timeLeft, p.mode);
  if (percentEl) {
    percentEl.textContent = `${progressPercent}%`;
  }

  if (ringEl) {
    const offset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;
    ringEl.style.strokeDashoffset = String(offset);
  }

  if (subtitleEl) {
    if (p.timeLeft === 0) {
      subtitleEl.textContent = p.mode === 'focus' ? 'Sesi Selesai' : 'Istirahat Selesai';
    } else if (p.isRunning) {
      subtitleEl.textContent = p.mode === 'focus' ? 'Fokus Penuh' : 'Istirahat Santai';
    } else {
      subtitleEl.textContent = 'Dijeda';
    }
  }

  const topbarContextEl = document.getElementById('pomodoroTopbarContext');
  if (topbarContextEl) {
    topbarContextEl.textContent = getPomodoroContext();
  }
}

/**
 * Penanganan saat timer mencapai 00:00
 */
function onPomodoroComplete() {
  const p = state.pomodoro;
  playCompletionChime();

  const msg = p.mode === 'focus'
    ? 'Sesi fokus selesai! Waktunya istirahat sejenak.'
    : 'Waktu istirahat selesai! Siap untuk fokus kembali?';
  showToast(msg);

  if (state.route === 'pomodoro') {
    render();
  }
}

/**
 * Halaman Pomodoro (Template View)
 */
export function pagePomodoro() {
  const p = state.pomodoro;
  const totalTime = getTotalTime(p.mode);
  const timeString = formatTime(p.timeLeft);
  const progressPercent = getProgressPercent(p.timeLeft, p.mode);
  const offset = CIRCUMFERENCE - (progressPercent / 100) * CIRCUMFERENCE;

  // Visual label & icon per mode
  const isFocus = p.mode === 'focus';
  const modeBadgeText = isFocus ? 'Waktu Fokus' : 'Waktu Istirahat';
  const modeIcon = isFocus ? ICON.target : ICON.coffee;
  const badgeClass = isFocus
    ? 'bg-brand/10 dark:bg-indigo-950/60 text-brand dark:text-indigo-300 border border-brand/20 dark:border-indigo-800/60'
    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60';

  // Subtitle status
  let subtitleText = 'Siap Dimulai';
  if (p.timeLeft === 0) {
    subtitleText = isFocus ? 'Sesi Selesai' : 'Istirahat Selesai';
  } else if (p.isRunning) {
    subtitleText = isFocus ? 'Fokus Penuh' : 'Istirahat Santai';
  } else if (p.timeLeft < totalTime) {
    subtitleText = 'Dijeda';
  }

  // Tombol aksi utama (Mulai / Jeda / Lanjutkan)
  let primaryBtnText = 'Mulai';
  let primaryBtnIcon = ICON.play;
  let primaryBtnClass = 'bg-brand hover:bg-brand-dark dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white';

  if (p.isRunning) {
    primaryBtnText = 'Jeda';
    primaryBtnIcon = ICON.pause;
    primaryBtnClass = 'bg-amber-500 hover:bg-amber-600 text-white';
  } else if (p.timeLeft < totalTime && p.timeLeft > 0) {
    primaryBtnText = 'Lanjutkan';
    primaryBtnIcon = ICON.play;
    primaryBtnClass = 'bg-brand hover:bg-brand-dark dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white';
  }

  return `
    <div class="space-y-6 max-w-sm mx-auto pt-1 pb-8 px-1">
      
      <!-- Pemilih Mode (Fokus vs Istirahat) - M3 Segmented Pill Container -->
      <div class="bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 p-1.5 rounded-full flex items-center justify-center gap-1.5">
        <button onclick="App.setPomodoroMode('focus')" 
          class="min-h-[48px] flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            isFocus 
              ? 'bg-brand text-white dark:bg-indigo-600 shadow-none' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }">
          <span class="w-4 h-4">${ICON.target}</span>
          <span>Fokus (25m)</span>
        </button>
        <button onclick="App.setPomodoroMode('break')" 
          class="min-h-[48px] flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            !isFocus 
              ? 'bg-emerald-600 text-white dark:bg-emerald-600 shadow-none' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }">
          <span class="w-4 h-4">${ICON.coffee}</span>
          <span>Istirahat (5m)</span>
        </button>
      </div>

      <!-- Lingkaran Timer Utama (M3 Vector SVG Tonal Card) -->
      <div class="relative flex flex-col items-center justify-center py-6 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
        <div class="relative flex items-center justify-center">
          <svg class="w-60 h-60 -rotate-90 transform" viewBox="0 0 200 200" aria-hidden="true">
            <!-- Background Track -->
            <circle
              cx="100" cy="100" r="84"
              class="stroke-slate-100 dark:stroke-slate-800"
              stroke-width="8"
              fill="none"
            />
            <!-- Progress Arc -->
            <circle
              id="pomodoroRing"
              cx="100" cy="100" r="84"
              class="${isFocus ? 'stroke-brand dark:stroke-indigo-400' : 'stroke-emerald-500 dark:stroke-emerald-400'} transition-all duration-300"
              stroke-width="8"
              stroke-linecap="round"
              fill="none"
              stroke-dasharray="${CIRCUMFERENCE}"
              style="stroke-dashoffset: ${offset};"
            />
          </svg>

          <!-- Konten di Tengah Lingkaran -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none" role="timer" aria-live="polite" aria-label="Waktu tersisa: ${timeString}">
            <!-- Mode Badge -->
            <div class="mb-1.5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeClass}">
                <span class="w-3.5 h-3.5">${modeIcon}</span>
                <span>${modeBadgeText}</span>
              </span>
            </div>

            <!-- Time Display -->
            <span id="pomodoroTime" class="font-display font-bold text-4xl sm:text-5xl tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              ${timeString}
            </span>

            <!-- Subtitle & Progress Text -->
            <div class="flex items-center gap-2 mt-2">
              <span id="pomodoroSubtitle" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ${subtitleText}
              </span>
              <span class="text-slate-300 dark:text-slate-600">·</span>
              <span id="pomodoroPercent" class="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                ${progressPercent}%
              </span>
            </div>
          </div>
        </div>

        <!-- Tombol Kontrol Utama (Touch Target ≥ 48dp) -->
        <div class="flex items-center justify-center gap-3 pt-6 w-full">
          <button onclick="App.togglePomodoro()" 
            class="min-h-[48px] flex-1 max-w-[170px] py-3 px-6 rounded-full font-display font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${primaryBtnClass}">
            <span class="w-4 h-4">${primaryBtnIcon}</span>
            <span>${primaryBtnText}</span>
          </button>
          
          <button onclick="App.resetPomodoro()" 
            class="min-h-[48px] px-5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.98] font-display font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            title="Reset Timer">
            <span class="w-4 h-4 text-slate-500 dark:text-slate-400">${ICON.rotateCcw}</span>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- State Notifikasi Tenang Saat Sesi Selesai -->
      ${p.timeLeft === 0 ? `
        <div class="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center gap-3 text-left">
          <div class="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
            ${ICON.check}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-display font-bold text-xs text-emerald-900 dark:text-emerald-200">
              ${isFocus ? 'Sesi Fokus Selesai' : 'Waktu Istirahat Selesai'}
            </h4>
            <p class="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
              ${isFocus ? 'Bagus! Ambil waktu sejenak untuk istirahat atau minum air.' : 'Pikiran segar, siap untuk sesi fokus berikutnya.'}
            </p>
          </div>
        </div>
      ` : ''}

      <!-- Kartu Tips Produktivitas (Material 3 Tonal Surface) -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl text-left space-y-1.5">
        <div class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span class="text-brand dark:text-indigo-400 w-4 h-4">${ICON.lightbulb}</span>
          <span>Tips Produktivitas</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          ${isFocus 
            ? 'Singkirkan ponsel dan fokus pada satu tugas prioritas tinggi hingga waktu habis.' 
            : 'Gunakan waktu istirahat untuk merenggangkan otot atau minum air putih.'}
        </p>
      </div>

    </div>
  `;
}

// Logika / Kontrol Timer (Ditempel ke App namespace agar bisa dipanggil lewat onclick)
App.setPomodoroMode = (mode) => {
  if (state.pomodoro.timerId) {
    clearInterval(state.pomodoro.timerId);
  }
  state.pomodoro.isRunning = false;
  state.pomodoro.mode = mode;
  state.pomodoro.timeLeft = getTotalTime(mode);
  state.pomodoro.timerId = null;
  render();
};

App.togglePomodoro = () => {
  const p = state.pomodoro;
  if (p.isRunning) {
    // JEDA
    if (p.timerId) {
      clearInterval(p.timerId);
    }
    p.isRunning = false;
    p.timerId = null;
    render();
  } else {
    // MULAI / LANJUTKAN
    if (p.timeLeft <= 0) {
      p.timeLeft = getTotalTime(p.mode);
    }
    p.isRunning = true;
    
    // Interval 1 detik: update DOM lokal secara halus tanpa full app re-render
    p.timerId = setInterval(() => {
      if (state.pomodoro.timeLeft > 0) {
        state.pomodoro.timeLeft--;
        updatePomodoroDOM();
      } else {
        clearInterval(state.pomodoro.timerId);
        state.pomodoro.isRunning = false;
        state.pomodoro.timerId = null;
        onPomodoroComplete();
      }
    }, 1000);
    render();
  }
};

App.resetPomodoro = () => {
  const p = state.pomodoro;
  if (p.timerId) {
    clearInterval(p.timerId);
  }
  p.isRunning = false;
  p.timerId = null;
  p.timeLeft = getTotalTime(p.mode);
  render();
};