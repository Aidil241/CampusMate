---
name: CampusMate
description: Pendamping akademik pribadi berbasis Android dengan presisi Material Design 3 dan fokus yang tenang
colors:
  primary: "#4F46E5"
  primary-container: "#EEF2FF"
  on-primary: "#FFFFFF"
  on-primary-container: "#312E81"
  surface: "#FFFFFF"
  surface-container: "#F8FAFC"
  surface-container-high: "#F1F5F9"
  on-surface: "#0F172A"
  on-surface-variant: "#475569"
  outline: "#E2E8F0"
  outline-variant: "#CBD5E1"
  warning: "#D97706"
  warning-container: "#FEF3C7"
  success: "#059669"
  success-container: "#D1FAE5"
  error: "#DC2626"
  error-container: "#FEE2E2"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "#4338CA"
  button-tonal:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
---

# Sistem Desain: CampusMate

## Ikhtisar

**Bintang Utara Kreatif: "Sang Cendekia yang Fokus"**

CampusMate dibangun di atas etos presisi akademik yang tenang. Alih-alih menyerupai alat manajemen proyek komersial yang penuh sesak atau etalase web yang berlebihan dekorasi, antarmukanya berperan sebagai pendamping saku yang kalem dan disiplin. Antarmuka ini menyeimbangkan kemudahan dilihat sekilas saat berpindah cepat di koridor antar kuliah dengan keterbacaan yang nyaman dan bebas gangguan selama sesi belajar Pomodoro mandiri yang panjang.

Estetikanya mengikuti Android Material Design 3 (M3) dan prinsip Material You: wadah permukaan bernada (*tonal*) menggantikan bayangan buatan yang berat; peran warna yang bertinta menyampaikan status tanpa kebisingan visual; dan lantai target sentuh ergonomis 48×48dp yang ketat menjamin pengoperasian genggam yang percaya diri di perangkat seluler.

**Karakteristik Utama:**
- **Nol Kebisingan Dekoratif:** Menghilangkan kartu bersarang, blur glassmorphism, gradien yang tidak perlu, dan bayangan sembarangan.
- **Hierarki Tonal:** Kedalaman dibentuk lewat nada wadah permukaan (`surface`, `surface-container`, `surface-container-high`), bukan bayangan melayang.
- **Kemudahan Dilihat Sekilas Secara Akademik:** Metrik akademik utama (kelas berikutnya hari ini, tenggat tugas yang mendekat, IPK saat ini, dan timer Pomodoro) menonjol dalam satu pandangan.
- **Target Sentuh Ergonomis:** Kotak sentuh minimum 48×48dp yang ketat dengan jarak minimal 8dp antar semua kontrol interaktif.

## Warna

Sistem warna ini mengadaptasi peran warna Material Design 3 yang berpusat pada Indigo Akademik Pekat, dipadukan dengan netral bertinta berkontras tinggi dan aksen semantik yang ketat.

### Primer
- **Indigo Akademik Pekat** (#4F46E5): Jangkar merek utama yang digunakan untuk aksi utama, indikator navigasi aktif, dan FAB yang menonjol.
- **Indigo Container** (#EEF2FF): Isian tonal bertinta untuk lencana status aktif dan chip filter terpilih.
- **On Primary** (#FFFFFF): Teks dan glif berkontras tinggi di atas tombol dan lencana primer.

### Netral
- **Kanvas Surface** (#FFFFFF): Latar bersih dan tajam untuk konten layar utama pada mode terang.
- **Surface Container** (#F8FAFC): Isian tonal rendah yang halus untuk membingkai layar dan latar kartu sekunder.
- **Surface Container High** (#F1F5F9): Isian tonal yang lebih jelas untuk kolom input, bilah filter, dan pil tidak aktif.
- **On Surface** (#0F172A): Warna teks slate pekat (menghindari #000000 murni) yang menjamin keterbacaan tinggi dengan kontras yang lembut.
- **On Surface Variant** (#475569): Teks sekunder untuk metadata, subjudul, stempel waktu, dan nama dosen.
- **Outline** (#E2E8F0): Nada garis pemisah dan batas setipis rambut (1px) yang digunakan seperlunya untuk pemisahan visual.

### Aksen Semantik
- **Peringatan Akademik (Amber)** (#D97706): Dicadangkan untuk lencana IPK dan peringatan tenggat yang mendekat.
- **Keberhasilan Akademik (Zamrud)** (#059669): Dicadangkan untuk tugas selesai dan status mata kuliah aktif.
- **Urgensi Akademik (Merah)** (#DC2626): Dicadangkan untuk tugas terlambat dan peringatan ujian.

### Aturan Bernama
**Aturan Kelangkaan.** Aksen primer (#4F46E5) menempati tidak lebih dari 10% permukaan layar mana pun. Ketika semuanya berteriak minta perhatian, tidak ada yang selesai dikerjakan.

**Aturan Tanpa Hitam Murni.** Teks dan permukaan tidak pernah menggunakan `#000000` atau `#808080` yang tidak dikalibrasi. Semua nada gelap diberi tinta slate atau indigo yang halus agar kedalaman material terasa alami.

## Tipografi

**Font Display:** Plus Jakarta Sans (dengan cadangan system-ui, sans-serif)  
**Font Isi:** Inter (dengan cadangan Roboto, sans-serif)  
**Font Label:** Inter (dengan cadangan Roboto, sans-serif)  

**Karakter:** Perpaduan judul struktural geometris yang percaya diri (Plus Jakarta Sans) dengan teks yang sangat mudah dibaca dan berirama disiplin (Inter), dikalibrasi untuk pembacaan di layar seluler.

### Hierarki
- **Display** (Bold 700, 1.75rem / 28px, line-height 1.2): Dicadangkan untuk angka tonggak (mis. hitung mundur Pomodoro yang besar, ringkasan skor IPK).
- **Headline** (Bold 700, 1.25rem / 20px, line-height 1.3): Digunakan untuk header halaman utama dan judul bagian.
- **Title** (SemiBold 600, 1.0rem / 16px, line-height 1.4): Digunakan untuk judul tugas, nama kartu mata kuliah, dan header modal sheet.
- **Body** (Regular 400 & Medium 500, 0.875rem / 14px, line-height 1.5): Teks bacaan standar untuk deskripsi, catatan, dan input formulir.
- **Label** (SemiBold 600, 0.75rem / 12px, line-height 1.3, letter-spacing 0.02em): Digunakan untuk chip filter, lencana status, stempel waktu, dan label navigasi bawah.

### Aturan Bernama
**Aturan Batas Dua Keluarga Font.** Plus Jakarta Sans dibatasi ketat pada judul, judul layar, dan penghitung yang menonjol; semua daftar padat, kolom input, label, dan teks isi wajib menggunakan Inter.

## Tata Letak

CampusMate dirancang untuk ergonomi satu tangan di seluler dalam kontainer selebar maksimum 480px.

- **Ritme Vertikal:** Padding halaman 16px (`p-4`), jarak 12px antar item daftar, jarak 8px antar chip metadata sebaris.
- **Inset Area Aman:** Top bar dan navigasi bawah yang tetap menghormati inset perangkat keras seluler (takik status bar dan bilah gestur sistem Android).
- **Bilah Navigasi:** Bilah navigasi bawah kompak yang tetap (tinggi 56px–64px) dengan 4 tujuan utama (Home, Tugas, Jadwal, Lainnya) dan area ketuk 48×48dp.
- **Bottom Sheet Drawer:** Digunakan untuk navigasi fitur sekunder ("Lainnya") dan formulir pembuatan entitas, meluncur mulus ke atas pada viewport seluler.

## Elevasi & Kedalaman

CampusMate menggunakan **Elevasi Tonal Material 3**, bukan bayangan buatan.

- **Kondisi Diam:** Permukaan dan kartu diam rata terhadap latar (`box-shadow: none`), dipisahkan oleh nilai permukaan tonal (`surface-container` terhadap `surface`) atau outline halus 1px (`#E2E8F0`).
- **Kontrol Interaktif yang Terangkat:** Floating Action Button (FAB) menggunakan elevasi ambien M3 yang halus (`0 4px 8px rgba(0,0,0,0.12)`) untuk menandakan kesan melayang yang taktil.
- **Modal Sheet:** Dialog bawah menggunakan elevasi ambien (`0 -4px 16px rgba(0,0,0,0.1)`) disertai tirai latar gelap 40%.

### Aturan Bernama
**Aturan Nol Bayangan Sembarangan.** Kartu standar, baris tugas, dan item jadwal tidak boleh memakai bayangan CSS yang berat dan sembarangan (mis. `shadow-xl`, `shadow-2xl`). Kedalaman diungkapkan sepenuhnya lewat kontras tonal latar dan batas setipis rambut.

## Bentuk

- **Bahasa Bentuk:** Membulat, ramah, dan taktil tanpa melenceng ke proporsi kartun.
- **Kontainer Kartu:** Radius 16px (`rounded-2xl` / `16px`) untuk kartu utama dan blok jadwal.
- **Tombol & Chip Interaktif:** Radius pil penuh (`rounded-full` / `9999px`) untuk chip aksi, pil filter, dan tombol aksi utama.
- **Floating Action Button (FAB):** Lingkaran 56×56px (`rounded-full`) dengan ikon di tengah.
- **Dialog & Bottom Sheet:** Radius atas 24px (`rounded-t-3xl` / `24px`) pada bottom sheet seluler.

## Komponen

### Tombol
- **Bentuk:** Pil penuh (`rounded-full`).
- **Primer:** Latar `#4F46E5`, teks `#FFFFFF`, padding `10px 20px`, font-weight 600. Ketukan aktif memicu mikro-kompresi skala 0,98.
- **Tonal / Netral:** Latar `#F1F5F9`, teks `#4F46E5`, tanpa border, padding `10px 20px`.
- **Tombol Ikon / Ghost:** Kotak batas melingkar 48×48dp, latar transparan, hover `#F1F5F9`.

### Chip & Pil Filter
- **Gaya:** Pil kompak (`rounded-full`), tinggi 32px, padding `4px 12px`.
- **Kondisi Terpilih:** Latar `#EEF2FF`, border `1px solid #4F46E5`, teks `#4F46E5`, font-weight 600.
- **Kondisi Tidak Terpilih:** Latar `#F1F5F9`, border `1px solid transparent`, teks `#475569`, font-weight 500.

### Kartu Tugas & Jadwal
- **Gaya Sudut:** Radius 16px (`rounded-2xl`).
- **Latar:** `#FFFFFF` di atas kanvas `#F8FAFC`.
- **Border:** Border setipis rambut 1px `#E2E8F0`.
- **Padding Dalam:** 14px–16px.
- **Target Sentuh:** Seluruh baris kartu dapat diketuk untuk mengedit atau memperluas, dengan area sentuh 48×48dp tersendiri untuk kotak centang penyelesaian.

### Floating Action Button (FAB)
- **Bentuk:** Lingkaran 56×56dp (`rounded-full`).
- **Penempatan:** Tertambat di kanan bawah (16px dari kanan, 80px dari bawah agar melewati bilah navigasi bawah).
- **Latar:** `#4F46E5`, teks/ikon `#FFFFFF`.
- **Perilaku:** Menampung satu aksi utama dari halaman aktif (mis. Tambah Tugas, Tambah Jadwal).

### Bilah Navigasi
- **Gaya:** Bilah tertambat di bawah setinggi 64px, latar `#FFFFFF` dengan border atas 1px `#E2E8F0`.
- **Item:** 4 tujuan yang tersebar merata dengan area ketuk minimal 48×48dp. Item aktif menampilkan pil indikator dan ikon `#4F46E5`.

## Yang Harus dan Tidak Boleh Dilakukan

### Lakukan:
- **Pertahankan** target sentuh minimum 48×48dp pada semua elemen yang dapat disentuh.
- **Sampaikan** elevasi lewat kontras tonal M3 (`surface-container-high`), bukan bayangan melayang.
- **Jaga** kontras tinggi antara label teks dan chip latarnya (sesuai WCAG AA).
- **Biarkan** kartu tetap rata saat diam dengan border setipis rambut 1px yang bersih (`#E2E8F0`).
- **Gunakan** mikrokopi bahasa Indonesia ("id") secara konsisten di semua label aksi dan keadaan kosong.

### Jangan:
- **Jangan** memakai gradien ungu-ke-biru multi-titik atau blur glassmorphism pada kartu.
- **Jangan** menyarangkan kartu di dalam kartu lain (mis. kartu tugas di dalam kartu luar di dalam kartu bagian).
- **Jangan** memakai hitam murni yang tidak dikalibrasi (`#000000`) untuk teks atau latar.
- **Jangan** mengecilkan target sentuh di bawah 48dp demi menjejalkan lebih banyak tombol di layar.
- **Jangan** mengubah skema database Supabase, siklus autentikasi, atau logika status rute saat menyempurnakan komponen UI.
- **Jangan** memakai dialog bawaan browser/sistem (`<select>`, `<input type="datetime-local">`, `alert()`, `confirm()`); gunakan picker M3 bersama.

## Standar Global Overlay & Picker M3 CampusMate

Semua sheet formulir, picker, dan overlay modal harus mematuhi standar terpadu yang didokumentasikan di [`COMPONENTS.md`](COMPONENTS.md) dan diimplementasikan di [`www/js/ui/picker.js`](www/js/ui/picker.js):
- **Pemilihan Mata Kuliah:** Gunakan `renderCourseTrigger` dan `openCoursePicker`. Jangan pernah memakai `<select>` HTML bawaan.
- **Pemilihan Tanggal & Waktu:** Gunakan `renderDateTimeTrigger` dan `openDateTimePicker`. Jangan pernah memakai `<input type="datetime-local">` bawaan. Kontrak serialisasi `YYYY-MM-DDTHH:mm` tetap dipertahankan.
- **Pemilihan Opsi:** Gunakan `openSelectionSubSheet` dengan kartu tonal M3 dan indikator centang.
- **Konfirmasi Hapus:** Gunakan `openDeleteConfirmation` dengan pelestarian status di dalam sheet. Mengetuk "Batal" tidak boleh menghapus hasil editan formulir pengguna.
- **Kemurnian Navigasi Shell:** Tepat satu `#bottomnav` dan satu `#topbar` yang disediakan oleh shell aplikasi. Halaman tidak boleh merender header halaman ganda yang bersaing atau navigasi bawah lokal.
