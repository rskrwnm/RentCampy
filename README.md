# RentCampy

Aplikasi penyewaan perlengkapan camping dengan katalog produk, akun pengguna, dashboard admin, dan pencatatan transaksi peminjaman.

## Menjalankan aplikasi

1. Siapkan Node.js, PostgreSQL, dan database kosong bernama `rentcampy`.
2. Install dependency:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`, lalu isi koneksi PostgreSQL, `JWT_SECRET` acak yang kuat, serta email dan password admin awal.
4. Buat/perbarui tabel database dan admin awal:

   ```bash
   npm run db:init
   ```

   Perintah ini aman dijalankan kembali. Untuk mengisi katalog contoh, jalankan `npm run db:seed`.
5. Jalankan API dan frontend pada terminal terpisah:

   ```bash
   npm run server
   npm run dev
   ```

Frontend Vite meneruskan request `/api` ke API lokal di port 5000.

## Deploy ke Vercel dan Neon

Frontend Vite dan API Express dapat dideploy dalam satu project Vercel; database PostgreSQL tetap berada di Neon.

1. Import repository GitHub ini ke Vercel. Gunakan root directory project, build command `npm run build`, dan output directory `dist`.
2. Di **Project Settings → Environment Variables**, tambahkan `DATABASE_URL` (connection string Neon), `DATABASE_SSL=true`, `JWT_SECRET` yang acak dan rahasia, `ADMIN_EMAIL`, serta `ADMIN_PASSWORD`.
3. Jalankan `npm run db:init` satu kali terhadap database Neon menggunakan environment variables production agar tabel dan admin dibuat.
4. Deploy/redeploy project. API tersedia di origin yang sama pada path `/api`; jangan set `VITE_API_URL` untuk deploy ini karena nilai default `/api` sudah benar.

Jangan menaruh `DATABASE_URL`, `JWT_SECRET`, atau password admin pada variabel `VITE_*`, karena nilai tersebut dapat dimasukkan ke bundle browser. Jika connection string pernah dibagikan atau masuk ke repository, reset password role Neon dan perbarui `DATABASE_URL`.

## Alur penyewaan

- Pengunjung maupun pengguna yang masuk dapat menambahkan perlengkapan ke keranjang. Login baru diminta saat mengirim pesanan; setelah login, pengguna kembali ke checkout dengan keranjang tetap tersedia.
- Pengguna memilih perlengkapan di katalog, lalu checkout seluruh keranjang sebagai satu pesanan dengan alamat dan rentang tanggal.
- Durasi menghitung tanggal mulai **dan** tanggal kembali. Total dikalkulasi server dari harga harian yang tersimpan, jumlah unit, dan jumlah hari.
- Permohonan berstatus **Menunggu persetujuan** langsung menyimpan detail pesanan dan menahan stok untuk rentang tanggal tersebut. Pemeriksaan stok dan penyimpanan pesanan dilakukan dalam transaksi database.
- Pengguna melihat riwayat/status di menu **Pesanan Saya** dan dapat membatalkan permohonan yang belum diproses.
- Admin meninjau menu **Peminjaman**, melihat email peminjam, item, tanggal, alamat, dan total. Admin dapat menyetujui atau menolak permohonan, menandai barang dipinjam, lalu menandai pengembalian.
- Permohonan yang ditolak/dibatalkan atau barang yang sudah dikembalikan tidak lagi menahan stok. Pemesanan dengan tanggal yang bertumpang tindih hanya diterima jika jumlah stok mencukupi.
- Harga, nama produk, kategori, jumlah, dan tanggal dicatat sebagai snapshot transaksi; perubahan katalog berikutnya tidak mengubah riwayat pesanan.

## Stok produk

Stok diatur oleh admin pada menu **Kelola Produk**. Saat kolom stok ditambahkan ke database lama, nilai awalnya `0` karena jumlah barang fisik tidak bisa ditebak; masukkan jumlah stok aktual sebelum menerima permohonan sewa.

## Validasi

```bash
npm run build
npm run lint
```
