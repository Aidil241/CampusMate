/**
 * topbar.js
 * Header di atas tiap halaman (judul, subjudul, tombol toggle tema).
 * Halaman "home" sengaja tidak punya topbar (lihat pageHome / index.html).
 */
import { state } from '../core/state.js';
import { DB } from '../data/db.js';
import { ICON } from '../utils/icons.js';
import { esc } from '../utils/format.js';
import { applyTheme } from './theme.js';

const PAGE_TITLES = {
  home: { title: '', sub: '' },
  tasks: { title: 'Tugas', sub: 'Kelola semua tugas kuliahmu' },
  schedule: { title: 'Jadwal Kuliah', sub: 'Atur jadwal mingguanmu' },
  courses: { title: 'Mata Kuliah', sub: 'Daftar mata kuliah' },
  notes: { title: 'Catatan', sub: 'Catatan materi' },
  grades: { title: 'Nilai Akademik', sub: 'Pantau nilai & IPK' },
  settings: { title: 'Pengaturan', sub: 'Preferensi aplikasi' }
};

export function renderTopbar() {
  const bar = document.getElementById('topbar');
  if (state.route === 'home') {
    bar.innerHTML = '';
    bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');
  const info = PAGE_TITLES[state.route] || { title: '', sub: '' };

  bar.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div>
          <h1 class="font-bold text-base line-clamp-1">${esc(info.title)}</h1>
          ${info.sub ? `<p class="text-xs text-base-content/60">${esc(info.sub)}</p>` : ''}
        </div>
      </div>
      <button class="btn btn-ghost btn-sm btn-circle" id="btnTheme">${ICON.moon}</button>
    </div>
  `;
  document.getElementById('btnTheme').onclick = () => {
    const s = DB.settings.get();
    s.dark = !s.dark;
    DB.settings.save(s);
    applyTheme();
  };
}
