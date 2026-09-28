/**
 * bottomnav.js
 * Navigasi bawah aplikasi.
 */
import { state } from '../core/state.js';
import { ICON } from '../utils/icons.js';
import { openSheet, closeSheet } from './sheet.js';
import { navigate } from '../core/router.js';

export function renderBottomNav() {
  const nav = document.getElementById('bottomnav');
  if (!nav) return;
  
  const items = [
    { key: 'home', label: 'Home', icon: ICON.home },
    { key: 'tasks', label: 'Tugas', icon: ICON.tasks },
    { key: 'schedule', label: 'Jadwal', icon: ICON.calendar },
    { key: 'more', label: 'Lainnya', icon: ICON.grid }
  ];
  
  const moreActive = ['courses', 'notes', 'grades', 'exams', 'settings', 'stats', 'pomodoro'].includes(state.route);

  nav.innerHTML = items.map(it => {
    const active = it.key === 'more' ? moreActive : state.route === it.key;
    return `<button data-nav="${it.key}" class="${active ? 'active text-brand font-bold' : 'text-base-content/60'}">
      ${it.icon}<span class="btm-nav-label text-[10px]">${it.label}</span>
    </button>`;
  }).join('');

  nav.querySelectorAll('[data-nav]').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.nav;
      if (key === 'more') openMoreSheet();
      else navigate(key);
    };
  });
}

const MORE_ITEMS = [
  { key: 'courses', label: 'Mata Kuliah', icon: ICON.book },
  { key: 'notes', label: 'Catatan', icon: ICON.note },
  { key: 'grades', label: 'Nilai Akademik', icon: ICON.award },
  { key: 'exams', label: 'Jadwal Ujian', icon: ICON.exam },
  { key: 'stats', label: 'Statistik', icon: ICON.chart },
  { key: 'pomodoro', label: 'Pomodoro', icon: ICON.timer },
  { key: 'settings', label: 'Pengaturan', icon: ICON.settings }
];

function openMoreSheet() {
  const currentRoute = state.route;

  const buttonsHtml = MORE_ITEMS.map(item => {
    const isCurrent = currentRoute === item.key;
    const isSpan2 = item.key === 'settings';

    const cardClasses = isCurrent
      ? 'bg-brand/10 dark:bg-indigo-950/40 border border-brand/30 dark:border-indigo-800/60 hover:bg-brand/15 dark:hover:bg-indigo-950/60'
      : 'bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800/80';

    const iconBoxClasses = isCurrent
      ? 'bg-brand/15 dark:bg-indigo-900/50 text-brand dark:text-indigo-300'
      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300';

    const labelClasses = isCurrent
      ? 'text-brand dark:text-indigo-300 font-bold'
      : 'text-slate-700 dark:text-slate-300 font-medium';

    return `
      <button 
        type="button"
        data-go="${item.key}"
        class="${isSpan2 ? 'col-span-2 min-h-[64px]' : 'min-h-[76px]'} p-3 rounded-2xl ${cardClasses} flex flex-col items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer select-none">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5 ${iconBoxClasses}">
          ${item.icon}
        </div>
        <span class="font-display text-xs text-center leading-tight tracking-tight truncate w-full ${labelClasses}">
          ${item.label}
        </span>
      </button>
    `;
  }).join('');

  openSheet('Lainnya', `
    <div class="grid grid-cols-2 gap-2.5 sm:gap-3 py-1">
      ${buttonsHtml}
    </div>
  `);

  document.querySelectorAll('[data-go]').forEach(el => {
    el.onclick = () => {
      closeSheet();
      navigate(el.dataset.go);
    };
  });
}