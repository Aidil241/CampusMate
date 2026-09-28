/**
 * sheet.js
 * Bottom sheet / modal generik yang dipakai semua form (tugas, jadwal,
 * matkul, catatan, nilai) — kontennya diisi lewat innerHTML per pemanggilan.
 */
// Di dalam file js/ui/sheet.js, pastikan mengekspor ke window seperti ini:
window.openSheet = openSheet;
window.closeSheet = closeSheet;

export function openSheet(title, bodyHtml) {
  const titleEl = document.getElementById('sheetTitle');
  if (titleEl) {
    titleEl.style.color = '';
    titleEl.className = 'font-display font-bold text-base mb-4 text-base-content dark:text-slate-100';
    titleEl.textContent = title;
  }
  document.getElementById('sheetBody').innerHTML = bodyHtml;
  document.getElementById('sheetModal').showModal();
}

export function closeSheet() {
  document.getElementById('sheetModal').close();
}
