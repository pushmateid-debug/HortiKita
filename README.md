# HortiKita

Komunitas digital untuk mahasiswa, angkatan, alumni, organisasi, dan pelaku usaha hortikultura.

## Menjalankan secara lokal

1. Gunakan Node.js 20 atau lebih baru.
2. Pasang dependensi: `npm install`.
3. Salin `.env.example` menjadi `.env.local`.
4. Jalankan `npm run dev`, lalu buka `http://localhost:3000`.

Tanpa konfigurasi Firebase, halaman publik memakai konten contoh yang ditandai sebagai **DEMO**. Login, kelas privat, dashboard, dan unggah media tidak berpura-pura berhasil tanpa layanan yang dikonfigurasi.

## Firebase Authentication dan Firestore

1. Buat proyek Firebase dan aplikasi Web; isi `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, serta variabel publik opsional lain di `.env.local`.
2. Aktifkan metode **Email/Password** dan **Google** di Firebase Authentication. Login Google tidak membatasi domain email; akun pribadi dan email kampus dapat digunakan.
3. Buat database Firestore dan terapkan `firebase/firestore.rules` serta indeks dari `firebase/firestore.indexes.json`.
4. Jika memakai Firebase Admin di server, berikan service account dengan hak minimum yang diperlukan dan isi `FIREBASE_SERVICE_ACCOUNT_JSON` dengan JSON service-account di environment server. Alternatifnya, siapkan Application Default Credentials dan `FIREBASE_PROJECT_ID`. Jangan pernah menambahkan kunci service account ke Git atau variabel `NEXT_PUBLIC_*`.
5. Setiap akun memakai UID Firebase Authentication sebagai ID dokumen `users/{uid}`. Profil menyimpan `displayName`, `username`, `photoURL`, dan `bio`; email tetap berasal dari sesi Authentication. Profil baru selalu berperan `member`.
6. Pengguna mengajukan keanggotaan melalui `membershipRequests/{uid}_{cohortId}` dengan status awal `pending`. Pengurus yang berwenang untuk angkatan terkait atau `platformAdmin` dapat menyetujui/menolak; hanya status `approved` yang menjadi keanggotaan terverifikasi dan dapat membuka akses kelas terkait. Memilih angkatan saat membuat akun tidak memberikan keanggotaan.
7. Tetapkan `cohortAdmin` beserta `cohortId` atau `platformAdmin` hanya melalui proses tepercaya/server menggunakan Firebase Admin SDK atau konsol proyek yang aksesnya dibatasi. Firestore Rules mencegah pemilik akun mengubah peran/cakupan angkatannya sendiri; cohort admin hanya mengelola angkatan yang ditugaskan.
8. Untuk membuka ruang privat, buat dokumen `classes/{classId}` dengan `cohortId`, `memberIds`, dan `adminIds` yang dikelola pengurus. Subkoleksi yang didukung: `announcements`, `transactions`, `rules`, `schedules`, dan `documents`. Marketplace tetap dapat dibaca secara publik.

Untuk menerapkan konfigurasi Firestore, pasang Firebase CLI dan jalankan `firebase deploy --only firestore:rules,firestore:indexes` setelah memilih proyek Firebase yang benar.

## Cloudinary

Isi `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, dan `CLOUDINARY_UPLOAD_PRESET` pada environment server. Buat preset unggah **signed**, batasi format ke JPG/PNG/WebP/MP4/WebM dan ukuran maksimum 50 MB di Cloudinary. Endpoint HortiKita hanya mengeluarkan tanda tangan setelah memverifikasi Firebase ID token; unggahan sampul angkatan/organisasi juga memerlukan keanggotaan pengurus pada dokumen tepercaya. Secret Cloudinary hanya digunakan di server.

Antarmuka membatasi gambar hingga 10 MB dan video hingga 50 MB serta memvalidasi MIME type sebelum mengunggah. Batas maksimum preset Cloudinary tetap menjadi pengaman ukuran di sisi penyedia, karena deklarasi ukuran browser tidak dapat dipercaya.

## Deployment Vercel

Hubungkan repository GitHub ke Vercel, pilih proyek Next.js, tambahkan konfigurasi Firebase publik dan secret server di **Project Settings → Environment Variables**, lalu deploy. Daftarkan domain deployment di Firebase Authentication (Authorized domains) dan pastikan Firebase Security Rules sudah diterapkan sebelum menyediakan data pengguna.

## Pemeriksaan lokal

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:rules` (pasang Java versi yang didukung Firebase Emulator, lalu jalankan `firebase emulators:start --only firestore` di terminal lain)

Kredensial produksi, proyek Firebase, Cloudinary, dan akses deployment belum disediakan; integrasi eksternal harus dikonfigurasi dan diuji pada proyek milik pengelola sebelum dipakai pengguna.
