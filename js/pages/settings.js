/**
 * pages/settings.js
 * Halaman pengaturan: mode gelap & nama mahasiswa.
 * Event handler-nya dipasang di core/render.js (bindEvents), karena
 * elemen ini dirender ulang setiap kali halaman ini dibuka.
 */
import { DB } from '../data/db.js';
import { esc } from '../utils/format.js';

export function pageSettings() {
  const s = DB.settings.get();
  return `
    <div class="space-y-4">
      <div class="p-3 bg-base-100 border border-base-200 rounded-2xl flex justify-between items-center">
        <div><b class="text-xs block">Mode Gelap</b><span class="text-[10px] text-base-content/60">Ubah tema tampilan</span></div>
        <input type="checkbox" ${s.dark ? 'checked' : ''} id="toggleDark" class="toggle toggle-primary toggle-sm" />
      </div>
      <div class="p-3 bg-base-100 border border-base-200 rounded-2xl space-y-2">
        <b class="text-xs block">Nama Mahasiswa</b>
        <input id="f_name" class="input input-bordered input-sm w-full text-xs" value="${esc(s.name)}" />
      </div>
    </div>
  `;
}
