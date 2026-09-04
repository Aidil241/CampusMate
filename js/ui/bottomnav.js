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

function openMoreSheet() {
  openSheet('Lainnya', `
    <div class="grid grid-cols-2 gap-3">
      <button data-go="courses" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-brand">${ICON.book}</div><span class="text-xs">Mata Kuliah</span>
      </button>
      <button data-go="notes" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-success">${ICON.note}</div><span class="text-xs">Catatan</span>
      </button>
      <button data-go="grades" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-warning">${ICON.award}</div><span class="text-xs">Nilai Akademik</span>
      </button>
      <button data-go="exams" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-error">📅</div><span class="text-xs">Jadwal Ujian</span>
      </button>
      
      <button data-go="stats" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
          </svg>
        </div>
        <span class="text-xs">Statistik</span>
      </button>

      <button data-go="settings" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-error">${ICON.settings}</div><span class="text-xs">Pengaturan</span>
      </button>
      <button data-go="pomodoro" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-secondary">🍅</div><span class="text-xs">Pomodoro</span>
      </button>
    </div>
  `);
  
  document.querySelectorAll('[data-go]').forEach(el => el.onclick = () => { closeSheet(); navigate(el.dataset.go); });
}