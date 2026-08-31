/**
 * sheet.js
 * Bottom sheet / modal generik yang dipakai semua form (tugas, jadwal,
 * matkul, catatan, nilai) — kontennya diisi lewat innerHTML per pemanggilan.
 */
// Di dalam file js/ui/sheet.js, pastikan mengekspor ke window seperti ini:
window.openSheet = openSheet;
window.closeSheet = closeSheet;

export function openSheet(title, bodyHtml) {
  document.getElementById('sheetTitle').textContent = title;
  document.getElementById('sheetBody').innerHTML = bodyHtml;
  document.getElementById('sheetModal').showModal();
}

export function closeSheet() {
  document.getElementById('sheetModal').close();
}
