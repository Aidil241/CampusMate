# Produk
## Platform

Android

## Pengguna

Mahasiswa universitas yang mengelola beban kerja semester, jadwal kuliah, tenggat tugas, persiapan ujian, target IPK, dan sesi fokus belajar harian.

## Tujuan Produk

Aplikasi pendamping akademik pribadi yang ringan agar mahasiswa tetap terorganisir dan tidak cemas soal kuliah. Jadwal belajar dan tugas penting selalu dalam jangkauan, dengan akses lokal yang cepat dan sinkronisasi awan (*cloud sync*).

## Posisi Produk

Pengatur kehidupan mahasiswa Indonesia yang fokus, ringan, dan kohesif (mata kuliah, SKS, IPK, jadwal, tugas). Pelacakan tugas, jadwal kuliah, hitung mundur ujian, kalkulator IPK, dan timer fokus Pomodoro digabung dalam satu aplikasi seluler berbasis *offline-first*, tanpa kerumitan SaaS yang membengkak atau kompleksitas korporat.

## Konteks Penggunaan

- Dipakai satu tangan di seluruh area kampus: ruang kuliah, perpustakaan, kamar asrama, dan saat transit.
- Informasi harus terbaca sekilas di antara kelas: nomor ruangan, waktu kuliah berikutnya, dan tenggat tugas.
- Sesi belajar mandiri yang fokus dengan timer Pomodoro.
- Pemeriksaan pencapaian semester: jadwal ujian UTS/UAS dan pelacakan IPK.

## Kemampuan

- **Manajemen tugas:** prioritas, tanggal jatuh tempo, kategori, status.
- **Jadwal kuliah:** hari, waktu, ruangan, dan dosen.
- **Repositori mata kuliah:** mata kuliah dengan SKS dan catatan/informasi.
- **Catatan:** catatan ringkas per mata kuliah.
- **Nilai & kalkulator IPK:** nilai semester, bobot, target IPK.
- **Hitung mundur ujian:** jadwal UTS/UAS.
- **Timer fokus Pomodoro:** interval kerja/istirahat dan pelacakan sesi.
- **Notifikasi pengingat** lokal/latar belakang.
- **Autentikasi Supabase & sinkronisasi awan** dengan cadangan penyimpanan lokal (*local storage fallback*).

## Batasan Teknis

- Kontainer Capacitor Android yang membungkus HTML/Tailwind/DaisyUI/ES module JavaScript di folder `www/`.
- Alur kerja UX, navigasi bawah, perutean, struktur data, integrasi Supabase, dan logika bisnis yang sudah ada harus tetap utuh.
- Penyempurnaan UI mengikuti konvensi Android Material Design 3 sebagaimana dirinci di `DESIGN.md`.

## Komitmen Merek

- **Nama:** CampusMate ("Pendamping Akademik").
- **Identitas:** modern, bersih, profesional, fokus, dan khusus untuk mahasiswa.
- **Suara:** ramah, mendukung, dan berbahasa Indonesia ("id") yang jelas.
- **Visual:** selaras dengan Material Design 3 / Material You dan bernuansa akademik yang tenang (rincian di `DESIGN.md`).

## Prinsip Produk

1. **Ergonomi mahasiswa lebih dulu.** Utamakan jadwal yang mudah dilihat sekilas dan penyelesaian tugas dengan satu ketukan, agar interaksi cepat dan tanpa hambatan saat bepergian.
2. **Asli Material 3.** Ikuti token, skala tipografi, dan ritme spasi M3 Android, bukan templat SaaS web generik.
3. **Tenang, bukan ramai.** Keterbacaan konten dan hierarki yang kuat lebih penting daripada dekorasi.
4. **Jaga integritas.** Setiap penyempurnaan UI harus mempertahankan fungsionalitas, rute, ketahanan offline, dan integrasi database.

## Aksesibilitas & Inklusi

Standar aksesibilitas (kontras WCAG AA, target sentuh minimum 48×48dp, teks yang dapat diskalakan) berlaku di seluruh aplikasi. Angka dan aturan lengkapnya ada di `DESIGN.md`.

## Bukti yang Tersedia

- Basis kode web/Capacitor yang berfungsi di `www/` (`js/pages/`, `js/data/`, `js/core/`, `js/ui/`).
- Ikon aplikasi: `www/icon.png`.
- Manifest dan konfigurasi: `www/manifest.json`, `capacitor.config.json`.
- Proyek Android: `android/`.
