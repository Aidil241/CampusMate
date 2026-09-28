# CampusMate → Android App (Capacitor)

Folder ini adalah scaffold Capacitor. Semua kode web CampusMate (yang sudah diperbaiki) ada di `www/` dan akan dibundel langsung ke dalam APK — app-nya jalan offline untuk bagian UI/shell, dan tetap online untuk data (Supabase), persis seperti dijelaskan sebelumnya.

Perintah `npm install` dan `npx cap add android` butuh koneksi internet dan Android SDK, jadi harus dijalankan **di komputer Anda sendiri**, bukan di sini. Ikuti langkah di bawah persis urutannya.

## Prasyarat (install dulu kalau belum ada)

1. **Node.js** (versi LTS terbaru) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio (sudah termasuk Android SDK & Java/JDK yang dibutuhkan)
3. Buka Android Studio minimal sekali setelah install, biarkan dia selesai download SDK component default-nya.

## Langkah 1 — Install dependency

Buka terminal, masuk ke folder `campusmate-android` ini, lalu:

```bash
npm install
```

## Langkah 2 — Tambahkan platform Android

```bash
npx cap add android
```

Ini akan membuat folder `android/` baru berisi project native Android lengkap (Gradle, dsb), dikonfigurasi otomatis dari `capacitor.config.json`.

## Langkah 3 — Sinkronkan aset web ke project native

```bash
npx cap sync android
```

**Jalankan ulang perintah ini setiap kali Anda mengubah isi folder `www/`** (misalnya setelah edit `js/pages/tasks.js`) — supaya perubahan ikut masuk ke project Android.

## Langkah 4 — Coba jalankan di emulator/HP

Sambungkan HP Android (mode USB debugging aktif) atau jalankan emulator dari Android Studio, lalu:

```bash
npx cap run android
```

Atau buka project-nya langsung di Android Studio untuk debug lebih leluasa:

```bash
npx cap open android
```

## Langkah 5 — Build APK untuk testing

Cara cepat lewat terminal (hasil di `android/app/build/outputs/apk/debug/app-debug.apk`):

```bash
cd android
./gradlew assembleDebug
```

Atau di Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

## Langkah 6 — Build rilis untuk Play Store (AAB tersigning)

1. **Ganti `appId`** di `capacitor.config.json` dari `com.campusmate.app` jadi milik Anda sendiri (format kebalikan-domain, misal `id.ac.kampusanda.campusmate`). **Ini wajib diganti SEBELUM publish pertama kali** — Play Store tidak mengizinkan appId diubah setelah live.
2. Jalankan `npx cap sync android` lagi supaya perubahan appId ikut.
3. Di Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**, lalu ikuti wizard untuk bikin keystore baru (simpan file `.keystore` dan passwordnya baik-baik — **kalau hilang, Anda tidak bisa update app yang sama lagi selamanya**).
4. Upload file `.aab` yang dihasilkan ke [Google Play Console](https://play.google.com/console).

## Icon aplikasi

`icon.png` yang ada sekarang dipakai sebagai fallback, tapi untuk hasil rapi di semua ukuran (adaptive icon Android), sebaiknya generate set ikon resmi:

```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --android
```
(butuh source icon minimal 1024×1024px — kalau `icon.png` Anda lebih kecil dari itu, siapkan versi resolusi lebih tinggi dulu.)

## Catatan penting

- **Izin internet** sudah otomatis ditambahkan Capacitor ke `AndroidManifest.xml` — tidak perlu dikonfigurasi manual, karena app tetap butuh internet untuk Supabase (login, data).
- **Reminder/notifikasi** yang sekarang pakai Web Notification API (`js/utils/reminder.js`) hanya jalan kalau app sedang dibuka. Untuk notifikasi background yang benar-benar jalan walau app ditutup, perlu upgrade ke plugin `@capacitor/local-notifications` — ini pekerjaan terpisah, bisa dikerjakan setelah app native-nya jalan dulu.
- Setiap kali edit kode di `www/`, jangan lupa `npx cap sync android` sebelum build ulang.
