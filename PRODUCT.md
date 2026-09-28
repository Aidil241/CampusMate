# Produk



## Platform

android

## Pengguna

Utama: Mahasiswa universitas yang mengelola beban kerja semester, jadwal kuliah, tenggat waktu tugas, persiapan ujian, target IPK, dan sesi fokus belajar harian.

## Tujuan Produk

Aplikasi pendamping akademik pribadi serbaguna yang ringan untuk membantu mahasiswa tetap terorganisir, mengurangi kecemasan akademik, serta memastikan jadwal belajar dan tugas-tugas penting selalu berada dalam jangkauan langsung, dengan akses lokal yang cepat dan sinkronisasi awan (*cloud sync*).

## Posisioning

Sebuah pengatur khusus kehidupan mahasiswa Indonesia yang fokus, ringan, dan kohesif (mata kuliah, SKS, IPK, jadwal, tugas) yang menggabungkan pelacakan tugas harian, jadwal kuliah, hitung mundur ujian, kalkulator IPK, dan pengatur waktu (*timer*) fokus Pomodoro bawaan ke dalam satu pendamping seluler tunggal berbasis *offline-first* tanpa kerumitan SaaS yang membengkak atau kompleksitas korporat.

## Konteks Operasional

- Penggunaan genggam seluler di seluruh area kampus (ruang kuliah, perpustakaan, kamar asrama, transit).
- Kemudahan melihat informasi sekilas (*glanceability*) di antara kelas-kelas (memeriksa nomor ruangan, waktu kuliah berikutnya, dan tenggat waktu tugas).
- Sesi belajar mandiri yang fokus menggunakan timer Pomodoro.
- Pemeriksaan pencapaian semester (jadwal ujian UTS/UAS, pelacakan IPK).

## Kemampuan dan Batasan

- Kemampuan:
  - Manajemen tugas (prioritas, tanggal jatuh tempo, kategori, status).
  - Jadwal kuliah (jadwal kuliah lengkap dengan hari, waktu, ruangan, dan dosen).
  - Repositori mata kuliah (mata kuliah dengan SKS, catatan/informasi).
  - Catatan (catatan ringkas per mata kuliah).
  - Pelacakan nilai & kalkulator IPK (nilai semester, bobot, target IPK).
  - Hitung mundur ujian (jadwal UTS/UAS).
  - Timer fokus Pomodoro (interval kerja/istirahat, pelacakan sesi).
  - Notifikasi pengingat latar belakang/lokal.
  - Autentikasi Supabase & sinkronisasi data awan dengan cadangan penyimpanan lokal (*local storage fallback*).
- Batasan Teknis:
  - Kontainer Capacitor Android yang membungkus HTML/Tailwind/DaisyUI/ES module JavaScript di dalam folder `www/`.
  - Harus menjaga alur kerja UX yang ada, navigasi bawah, perutean, struktur data, integrasi Supabase, dan logika bisnis agar tetap utuh.
  - Penyempurnaan UI harus mematuhi konvensi Android Material Design 3 (M3) (target sentuh yang tepat, peran warna M3, elevasi tonal, pertimbangan bilah navigasi & status bar Android).
  - Batasan anti-pola yang ketat: hindari gaya AI generik, hindari gradien berlebihan, hindari kartu bertumpuk, hindari glassmorphism, hindari warna hitam/abu-abu murni tanpa rona warna, hindari kartu/bayangan dekoratif yang tidak perlu.

## Komitmen Merek

- Nama: CampusMate ("Pendamping Akademik").
- Identitas: Modern, bersih, profesional, fokus, dan berorientasi khusus pada mahasiswa.
- Suara: Ramah, mendukung, dan menggunakan bahasa Indonesia ("id") yang jelas.
- Identitas visual: Selaras dengan Material Design 3 / Material You, tipografi yang bermakna, kejernihan tinggi, dan fokus akademik yang tenang.

## Bukti yang Tersedia

- Basis kode web/Capacitor fungsional yang ada di dalam `www/` (`js/pages/`, `js/data/`, `js/core/`, `js/ui/`).
- Ikon aplikasi: `www/icon.png`.
- Manifest dan konfigurasi: `www/manifest.json`, `capacitor.config.json`.
- Proyek Android: `android/`.

## Prinsip Produk

1. **Ergonomi Mahasiswa yang Utama**: Memprioritaskan jadwal yang mudah dilihat sekilas dan penyelesaian tugas satu ketukan untuk interaksi seluler yang cepat dan bebas gesekan saat bepergian.
2. **Afinitas Asli Material 3**: Mengikuti token desain M3 Android, skala tipografi, kontainer permukaan, dan ritme spasi alih-alih templat SaaS web generik.
3. **Kejelasan yang Tenang di atas Kekacauan Visual**: Menekankan keterbacaan konten, hierarki tipografi yang kuat, dan aksen halus yang bermakna di atas wadah bertumpuk, bayangan yang tidak perlu, dan gradien yang mengalihkan perhatian.
4. **Jaga Integritas**: Setiap penyempurnaan visual atau UI harus menjaga fungsionalitas yang mendasari, rute, ketahanan offline, dan integrasi database agar tetap utuh sepenuhnya.

## Aksesibilitas & Inklusi

- Mematuhi standar kontras warna WCAG AA (terutama pada chip berwarna, lencana, dan indikator status).
- Mempertahankan target sentuh minimum 48x48dp untuk tombol, item navigasi bawah, dan elemen daftar interaktif.
- Keterbacaan tipografi yang bersih dengan teks cair yang dapat diskalakan.
