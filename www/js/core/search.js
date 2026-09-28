/**
 * search.js
 * Pencarian real-time generik: sembunyikan elemen yang tidak cocok
 * dengan keyword, dipakai oleh halaman Tugas & Mata Kuliah.
 */
import { App } from './app-namespace.js';

App.searchData = (keyword, selector) => {
  const q = keyword.toLowerCase();
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = el.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
};
