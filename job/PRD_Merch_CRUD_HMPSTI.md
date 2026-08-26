# Product Requirements Document (PRD)
## Fitur Admin CRUD Merchandise — HMPSTI-UB

**Versi:** Draft 1.1
**Tanggal:** 25 Agustus 2026 (dibuat) — diperbarui 26 Agustus 2026
**Branch:** `feat/merch-crud`
**Status:** Dalam pengembangan

---

## 1. Ringkasan Produk

Fitur Admin CRUD Merchandise adalah modul manajemen produk merchandise HMPSTI-UB yang memungkinkan admin untuk menambah, mengubah, menghapus, dan memantau produk yang ditampilkan di halaman katalog publik (`/merch`). Modul ini dibangun sebagai perluasan dari Admin Dashboard yang sudah ada, mengikuti pola arsitektur dan performa yang telah diverifikasi pada perbaikan modul Tim IoT (`fix/pameran-iot`).

Berbeda dengan model multi-merchant pada draf PRD "Jelajah Teknologi" sebelumnya, fitur ini dirancang untuk **single-store** — seluruh produk dikelola terpusat oleh Admin HMPSTI, tanpa konsep merchant/penjual independen.

## 2. Tujuan Produk

- Menyediakan antarmuka admin yang ringan dan cepat untuk mengelola katalog produk merchandise.
- Mendukung dua tipe produk: produk dengan variasi ukuran (preorder) dan produk tanpa ukuran (stok siap kirim).
- Memastikan status ketersediaan produk (`ready`, `out_of_stock`, `preorder`) selalu akurat dan minim campur tangan manual yang rawan human error.
- Menerapkan pola data-fetching yang sudah terbukti ringan (server-side pagination, query paralel, tanpa N+1 query) sejak awal pengembangan, mengacu pada hasil perbaikan performa Tim IoT.
- Memungkinkan admin menambah kategori produk baru tanpa perlu perubahan kode/deployment.

## 3. Aktor dan Hak Akses

| Aktor | Deskripsi | Hak Akses Utama |
|---|---|---|
| Guest / Pembeli | Pengunjung halaman publik `/merch` | Melihat katalog, detail produk, filter kategori, search, memilih ukuran & menginput kuantitas preorder |
| Admin | Pengelola tunggal seluruh produk HMPSTI | Tambah, ubah, hapus produk; kelola kategori; kelola size & kuota acuan per produk |

**Catatan:** Tidak ada peran Merchant terpisah. Semua produk dimiliki dan dikelola oleh satu entitas (Admin HMPSTI), berbeda dari model multi-merchant di draf PRD Jelajah Teknologi.

## 4. Scope

### 4.1 Termasuk dalam scope
- CRUD produk merchandise (tambah, lihat, ubah, hapus/nonaktifkan).
- CRUD kategori produk oleh admin (nama & slug), dapat ditambah kapan saja tanpa deployment.
- Dua tipe produk: **berukuran** (dengan daftar size & kuota acuan per size) dan **tanpa ukuran** (dengan stok tunggal).
- Logika status ketersediaan otomatis dan semi-manual (dijelaskan di Bagian 8).
- Upload gambar produk memakai komponen `image-upload-field.tsx` yang sudah ada (Cloudinary), reuse dari modul Pameran IoT.
- Pencarian, filter kategori, dan pagination pada tabel admin — server-side, mengikuti pola `?page=&search=&category=` seperti pada perbaikan modul Tim IoT.
- Input ukuran pada form admin menggunakan pola **hybrid** (dropdown preset + opsi teks bebas) dan validasi larangan ukuran duplikat dalam satu produk (lihat Bagian 5.3).

### 4.2 Tidak termasuk dalam scope (Out of Scope)
- Sistem multi-merchant (banyak penjual).
- Payment gateway otomatis, checkout, atau alur transaksi (sudah ditangani terpisah di `feat/merch`).
- Varian produk selain ukuran (misal varian warna) — dapat menjadi pengembangan lanjutan.
- Riwayat perubahan stok/audit trail otomatis.
- Laporan penjualan/analitik produk.
- **Implementasi halaman detail produk publik (`/merch/[slug]`)** untuk alur preorder produk berukuran — keputusan desainnya sudah dicatat di Bagian 7.7, tetapi pembangunan UI-nya berada di luar scope pekerjaan server actions & admin CRUD pada dokumen ini.

## 5. Modul Fitur

### 5.1 Manajemen Kategori (Admin)
- Melihat daftar kategori yang ada.
- Menambah kategori baru (nama + slug diisi manual oleh admin).
- Mengubah nama kategori.
- Menghapus kategori — **dapat dihapus kapan saja**, termasuk saat masih memiliki produk aktif (lihat Bagian 7.5 untuk detail penanganan produk terkait).
- Kategori dipilih pada form produk melalui **dropdown** (bukan input teks bebas), karena `category_id` merupakan foreign key ke `merch_categories`.

### 5.2 Manajemen Produk (Admin)
- Melihat daftar seluruh produk dalam tabel dengan pagination server-side (default 10 data/halaman, opsi 5/10/20/Semua — mengikuti pola Tim IoT).
- Search produk berdasarkan nama (server-side, melalui parameter URL `?search=`).
- Filter berdasarkan kategori (`?category=`) dan status ketersediaan (`?availability=`).
- Menampilkan badge/indikator visual **"Tanpa Kategori"** pada baris produk yang `category_id`-nya `NULL` (misal akibat kategori sebelumnya dihapus), agar admin mudah menemukan dan memperbaikinya satu per satu melalui form edit produk.
- Menambah produk baru dengan form yang menyesuaikan tipe produk:
  - **Toggle "Punya Ukuran"**: menentukan apakah form menampilkan input stok tunggal atau daftar baris ukuran+kuota.
- Mengubah data produk (nama, deskripsi, harga, gambar, kategori).
- Mengubah stok (khusus produk tanpa ukuran) — status ketersediaan menyesuaikan otomatis.
- Mengubah status ketersediaan secara manual ke `preorder` (khusus produk tanpa ukuran, opsional).
- Menghapus/menonaktifkan produk.

### 5.3 Manajemen Ukuran & Kuota (Admin, khusus produk berukuran)

- Admin mengelola ukuran produk melalui **daftar baris berulang** (repeatable rows) — satu baris merepresentasikan satu ukuran beserta kuota acuannya. Admin dapat menambah baris baru ("+ Tambah Ukuran") dan menghapus baris yang tidak diperlukan.
- **Input ukuran per baris memakai pola hybrid:**
  - Pilihan utama berupa **dropdown** berisi preset umum: `S`, `M`, `L`, `XL`, `XXL`.
  - Tersedia opsi **"Lainnya..."** pada dropdown yang, jika dipilih, membuka input teks bebas untuk ukuran non-standar (misal "One Size", "38", "42", dsb.).
  - Nilai akhir tetap disimpan sebagai teks bebas (`size_name` varchar) di database — pola hybrid ini murni peningkatan UX input pada form, tidak mengubah struktur data maupun sifat "tidak dibatasi" pada Bagian 12.
- **Validasi larangan ukuran duplikat:** dalam satu produk yang sama, tidak boleh ada dua baris dengan `size_name` yang identik (misal dua baris "L" pada produk yang sama tidak valid/tidak masuk akal secara data).
  - Divalidasi di server action (wajib, sebagai sumber kebenaran akhir) saat create/update.
  - Direkomendasikan juga dicegah di sisi UI form — opsi preset yang sudah dipakai pada baris lain sebaiknya di-disable/disembunyikan dari dropdown baris berikutnya, agar admin tidak perlu mengalami error setelah submit.
- Tidak ada batas minimum/maksimum jumlah baris ukuran per produk — admin bebas menambah sesuai kebutuhan produk.
- Tidak ada input stok pada level produk induk untuk tipe ini — field `stock` pada `merch_products` tidak ditampilkan/tidak dipakai sama sekali untuk produk `has_sizes = true` (lihat Bagian 6.2).
- **Penegasan makna kolom kuota:** angka pada kolom `stock` di `merch_product_sizes` bersifat **acuan/rencana internal admin** (misal estimasi kapasitas produksi per ukuran), **bukan hard limit** yang membatasi jumlah preorder yang dapat diminta pembeli. Lihat Bagian 7.7 untuk detail alur pembeli.

## 6. Logika Status Ketersediaan (Availability)

Ini adalah bagian krusial yang membedakan penanganan dua tipe produk.

### 6.1 Produk TANPA ukuran (`has_sizes = false`)
| Kondisi | `availability_type` |
|---|---|
| Admin membuat produk baru dengan stok > 0 | `ready` (otomatis) |
| Stok berkurang hingga mencapai 0 (melalui pengurangan manual oleh admin) | `out_of_stock` (otomatis) |
| Admin menambah kembali stok dari 0 menjadi > 0 | `ready` (otomatis) |
| Admin secara manual ingin menandai produk sebagai pre-order (misal ada pembeli yang meminta produk saat stok kosong/menunggu restock) | `preorder` (override manual, dapat dilakukan kapan saja terlepas dari angka stok) |

Field `stock` **wajib diisi** oleh admin dan merepresentasikan jumlah fisik barang yang benar-benar tersedia.

### 6.2 Produk DENGAN ukuran (`has_sizes = true`)
| Kondisi | `availability_type` |
|---|---|
| Selalu, sejak produk dibuat | `preorder` (tetap, otomatis, tidak dapat diubah manual) |

Field `stock` pada level produk **tidak digunakan/tidak ditampilkan** di form. Setiap baris pada `merch_product_sizes` merepresentasikan **kuota acuan** per ukuran (lihat penegasan di Bagian 5.3), bukan stok fisik siap kirim, karena barang diproduksi/disiapkan sesuai pesanan pembeli.

### 6.3 Ringkasan Alasan Desain
Produk berukuran (pakaian, dsb.) memerlukan penyesuaian ukuran pembeli sehingga secara alami bersifat pre-order. Produk tanpa ukuran (gantungan kunci, stiker, mug, dsb.) merupakan barang jadi yang siap kirim, sehingga status dapat dihitung otomatis dari angka stok, dengan pengecualian override manual untuk kasus permintaan mendesak saat stok kosong.

## 7. Flow Utama

### 7.1 Flow Admin — Tambah Produk Tanpa Ukuran
1. Admin membuka halaman Manajemen Produk, klik "Tambah Produk".
2. Admin mengisi nama, deskripsi, harga, kategori, gambar.
3. Admin memastikan toggle "Punya Ukuran" dalam kondisi OFF.
4. Admin mengisi jumlah stok aktual.
5. Sistem menyimpan produk dengan `availability_type` otomatis: `ready` jika stok > 0, `out_of_stock` jika stok = 0.
6. Produk tampil di katalog publik sesuai status.

### 7.2 Flow Admin — Tambah Produk Dengan Ukuran
1. Admin membuka halaman Manajemen Produk, klik "Tambah Produk".
2. Admin mengisi nama, deskripsi, harga, kategori, gambar.
3. Admin mengaktifkan toggle "Punya Ukuran" (ON).
4. Form input stok tunggal disembunyikan; admin menambahkan baris ukuran (dropdown hybrid + kuota acuan) satu per satu, dengan validasi larangan ukuran duplikat (lihat Bagian 5.3).
5. Sistem menyimpan produk dengan `availability_type` otomatis: `preorder`, tidak dapat diubah.
6. Produk tampil di katalog publik dengan label pre-order dan pilihan ukuran.

### 7.3 Flow Admin — Restock & Override Manual
1. Admin membuka produk tanpa ukuran yang berstatus `out_of_stock`.
2. Admin memperbarui angka stok menjadi > 0 → status otomatis kembali `ready`.
   **Atau**
2b. Admin ingin menandai produk sebagai dapat dipesan meski stok masih kosong → admin memilih opsi manual "Tandai sebagai Pre-order" → status menjadi `preorder` terlepas dari angka stok saat itu.

### 7.4 Flow Admin — Kelola Kategori
1. Admin membuka halaman Manajemen Kategori.
2. Admin menambah kategori baru (nama dan slug diisi manual oleh admin).
3. Kategori baru langsung tersedia sebagai pilihan (dropdown) saat menambah/mengubah produk, tanpa perlu deployment kode.

### 7.5 Flow Admin — Hapus Kategori yang Masih Memiliki Produk
1. Admin memilih hapus pada kategori yang masih memiliki produk aktif.
2. Sistem menampilkan **dialog konfirmasi/peringatan**, menyebutkan jumlah produk yang akan terdampak (kehilangan kategori) jika penghapusan dilanjutkan.
3. Jika admin mengonfirmasi, sistem tetap mengizinkan penghapusan (hard delete, tidak diblokir).
4. Produk yang sebelumnya terhubung ke kategori tersebut menjadi tanpa kategori (`category_id` menjadi `NULL`) — produk itu sendiri **tidak ikut terhapus**.
5. Produk-produk tersebut tampil dengan badge **"Tanpa Kategori"** pada tabel Manajemen Produk, memudahkan admin menemukannya.
6. Admin memperbaiki satu per satu: membuka form edit produk, memilih kategori baru, menyimpan. Diulang untuk setiap produk terdampak hingga tidak ada lagi produk berstatus "Tanpa Kategori" (opsional — tidak wajib segera dilakukan, produk tetap tampil normal di katalog publik selama proses ini berlangsung).

### 7.6 Flow Admin — Hapus Produk (dengan Kegagalan Cloudinary)
1. Admin memilih hapus pada suatu produk.
2. Sistem terlebih dahulu mencoba menghapus gambar terkait di Cloudinary.
3. **Jika penghapusan gambar di Cloudinary gagal (API error), proses hapus produk dibatalkan sepenuhnya** — data produk di database tidak ikut terhapus, untuk mencegah data tidak konsisten (gambar tersisa tanpa produk pemilik, atau produk hilang namun gambar masih tersimpan tanpa referensi).
4. Sistem menampilkan pesan error kepada admin, menyarankan untuk mencoba kembali.
5. **Alternatif sementara**: jika admin perlu segera menghentikan produk agar tidak dapat dibeli tanpa harus menunggu proses hapus berhasil, admin dapat mengubah stok produk menjadi `0` secara manual (untuk produk tanpa ukuran), yang otomatis mengubah status menjadi `out_of_stock`, tanpa perlu menghapus produk maupun gambarnya.

### 7.7 Flow Pembeli — Preorder Produk Berukuran (Catatan Desain, di Luar Scope Implementasi Saat Ini)

> **Catatan:** Bagian ini mendokumentasikan keputusan desain untuk halaman publik `/merch/[slug]` yang muncul selama diskusi PRD, agar tidak hilang. Pembangunan UI/logic-nya **tidak termasuk** dalam pekerjaan server actions & admin CRUD yang sedang dikerjakan pada branch `feat/merch-crud` saat dokumen ini ditulis (lihat Bagian 4.2).

1. Pembeli membuka halaman detail produk berukuran (`has_sizes = true`).
2. Pembeli memilih salah satu ukuran dari pilihan yang tersedia (bersumber dari baris-baris `merch_product_sizes` milik produk tersebut).
3. Pembeli **menginput sendiri jumlah barang yang ingin di-preorder** (field kuantitas bebas), **tidak dibatasi otomatis** oleh angka kuota acuan yang diisi admin — kuota tersebut bersifat catatan internal admin, bukan hard limit sistem (lihat penegasan Bagian 5.3).
4. Tampilan hanya menyediakan **satu tombol aksi: "Preorder"** — **tidak ada** label "Stock: Tersedia" maupun tombol "Checkout" langsung seperti pada referensi desain lama (halaman produk Kabinet Innovara) yang sempat dijadikan pembanding visual namun belum disesuaikan dengan aturan `preorder` pada PRD ini.
5. Alur ini berbeda dari produk tanpa ukuran (`has_sizes = false`), yang tampilannya dapat menunjukkan status stok riil (`ready`/`out_of_stock`) sesuai Bagian 6.1.

## 8. Data Model

| Tabel | Fungsi |
|---|---|
| `merch_categories` | Master kategori produk, dapat ditambah admin kapan saja. |
| `merch_products` | Data utama produk: nama, deskripsi, harga, gambar, kategori, tipe (berukuran/tidak), stok (jika tanpa ukuran), status ketersediaan. |
| `merch_product_sizes` | Daftar ukuran per produk beserta kuota acuan, hanya relevan untuk produk berukuran. |

### 8.1 Detail Kolom (rancangan awal, untuk didiskusikan lebih lanjut sebelum implementasi)

**`merch_categories`**
- `id`
- `name` (varchar)
- `slug` (varchar, unique, diisi manual oleh admin)
- `created_at`

**`merch_products`**
- `id`
- `category_id` (FK → `merch_categories`, **nullable**, `onDelete: "set null"` — menjadi `NULL` jika kategori terkait dihapus)
- `name` (varchar)
- `description` (text, nullable)
- `price` (**integer** — harga merchandise HMPSTI selalu bilangan bulat tanpa desimal)
- `image` (text, URL Cloudinary, **wajib diisi / Not Null**)
- `has_sizes` (boolean)
- `stock` (integer, nullable — diisi hanya jika `has_sizes = false`)
- `availability_type` (enum: `ready` | `out_of_stock` | `preorder`)
- `created_at`
- `updated_at`

**Catatan penghapusan (delete):** Seluruh operasi hapus pada modul ini (produk, kategori, baris ukuran) menggunakan **hard delete** — data dihapus permanen dari database, bukan ditandai nonaktif (soft delete). Ini berlaku juga untuk gambar produk di Cloudinary, yang idealnya turut dihapus saat produk dihapus (lihat Bagian 10).

**`merch_product_sizes`**
- `id`
- `product_id` (FK → `merch_products`, Not Null, `onDelete: "cascade"` — baris ukuran ikut terhapus otomatis saat produk induk dihapus)
- `size_name` (varchar, misal "S", "M", "L", "XL" — **harus unik dalam lingkup satu `product_id` yang sama**, lihat Bagian 5.3 & 12)
- `stock` (integer — merepresentasikan **kuota acuan** admin, bukan stok fisik maupun hard limit bagi input kuantitas pembeli)

## 9. Status Ketersediaan (Ringkasan)

| Status | Deskripsi | Berlaku untuk |
|---|---|---|
| `ready` | Barang fisik tersedia, siap kirim langsung. | Produk tanpa ukuran, stok > 0 |
| `out_of_stock` | Barang fisik habis, belum tersedia untuk dibeli. | Produk tanpa ukuran, stok = 0 (dan belum di-override manual) |
| `preorder` | Barang dipesan terlebih dahulu, menunggu produksi/restock. | Produk berukuran (selalu), atau produk tanpa ukuran (override manual) |

## 10. Non-Functional Requirements

- Query data admin **wajib** menggunakan server-side pagination (`LIMIT`/`OFFSET`) sejak awal implementasi — tidak menarik seluruh data lalu memotong di client.
- Perhitungan agregasi (jika diperlukan di kemudian hari, misal jumlah terjual) menggunakan `JOIN` + `GROUP BY`, bukan subquery per baris.
- Query data dan query total count dijalankan paralel (`Promise.all()`).
- Endpoint/server action admin dilindungi autentikasi & otorisasi (mengikuti pola `requireUser()` yang sudah ada).
- Upload gambar dibatasi format dan ukuran (mengikuti konfigurasi Cloudinary yang sudah ada).
- Perubahan status ketersediaan dihitung di level server action (bukan trigger database), agar mudah ditelusuri dan diuji.
- Penghapusan produk menggunakan hard delete. Server action penghapusan produk **wajib** menghapus file gambar terkait di Cloudinary **sebelum** menghapus baris data produk. Jika penghapusan gambar di Cloudinary gagal, seluruh proses hapus produk dibatalkan (rollback) — data produk tetap utuh di database.
- Penghapusan kategori tidak diblokir oleh keberadaan produk terkait, namun UI **wajib** menampilkan dialog konfirmasi yang menyebutkan jumlah produk terdampak sebelum penghapusan dieksekusi. Server action wajib menangani pelepasan relasi (`category_id` → `NULL`) sebelum/bersamaan dengan proses hapus, agar tidak melanggar foreign key constraint.
- Server action create/update pada `merch_product_sizes` **wajib** memvalidasi tidak ada `size_name` duplikat dalam satu `product_id` yang sama, sebelum data disimpan.

## 11. Out of Scope untuk Rilis Ini

- Varian produk selain ukuran (warna, bahan, dsb.).
- Sistem multi-merchant/multi-penjual.
- Payment gateway otomatis (checkout tetap manual, ditangani di modul terpisah).
- Riwayat/audit trail perubahan stok dan aktivitas CRUD (tambah/ubah/hapus produk, kategori, ukuran), termasuk audit trail untuk konfirmasi pembayaran terkait transaksi merchandise. **Referensi pola untuk pengembangan lanjutan**: project SAMBA-TI-Vokasi telah memiliki modul Log Aktivitas dengan struktur `entity`, `aksi` (CREATE/UPDATE/DELETE), `waktu`, `pesan` (deskriptif, misal "Nama User (Role) mengubah submission"), dan tautan detail. Pola ini dapat dijadikan acuan apabila audit trail dibangun di masa depan, dengan penyesuaian pada entity yang relevan (`produk`, `kategori`, `ukuran`, `pembayaran`).
- Laporan analitik penjualan produk.
- Notifikasi otomatis saat stok menipis.
- Indikator/highlight "produk baru" pada katalog publik — dipertimbangkan sebagai pengembangan lanjutan (next scope), belum menjadi bagian rilis ini.
- **Fitur pemindahan kategori secara massal (bulk re-categorize)** untuk produk-produk yang `category_id`-nya menjadi `NULL` akibat kategori terhapus. Pada rilis ini, produk yang kehilangan kategori diperbaiki satu per satu secara manual melalui form edit produk (dibantu badge "Tanpa Kategori" untuk memudahkan menemukannya). Fitur bulk dicatat di sini sebagai kandidat pengembangan lanjutan apabila jumlah produk bertambah signifikan di kemudian hari — dapat langsung dirujuk tanpa perlu didiskusikan ulang dari awal.
- **Implementasi/perbaikan halaman detail produk publik (`/merch/[slug]`)**, termasuk alur pemilihan ukuran, input kuantitas preorder, dan tombol aksi "Preorder" untuk produk berukuran. Keputusan desainnya sudah dicatat di Bagian 7.7 agar tidak hilang, namun pembangunan UI publik ini adalah pekerjaan terpisah dari server actions & admin CRUD pada dokumen ini.

## 12. Keputusan Desain (Sebelumnya Open Questions)

Poin-poin berikut telah didiskusikan dan diputuskan sebelum implementasi dimulai:

| Pertanyaan | Keputusan |
|---|---|
| Slug kategori digenerate otomatis atau manual? | **Diisi manual oleh admin.** |
| Hard delete atau soft delete untuk produk? | **Hard delete.** |
| Batas jumlah ukuran per produk berukuran? | **Tidak dibatasi.** Admin memasukkan ukuran secara manual (umumnya mengikuti pola S/M/L/XL/XXL, namun bebas isi teks). |
| Kategori dengan produk aktif boleh dihapus? | **Boleh, tidak diblokir** (hard delete). Produk terkait tidak ikut terhapus — `category_id` produk tersebut menjadi `NULL` (lihat Bagian 7.5). |
| Perlu validasi/warning saat menghapus kategori yang masih dipakai? | **Perlu.** Dialog konfirmasi wajib menampilkan jumlah produk yang akan terdampak. |
| Penghapusan gambar Cloudinary gagal saat hapus produk — dilanjutkan atau dibatalkan? | **Dibatalkan** (rollback penuh). Sebagai alternatif sementara, admin dapat mengubah stok produk menjadi `0` untuk membuatnya `out_of_stock` tanpa perlu menghapus produk (lihat Bagian 7.6). |
| Perlu badge/indikator visual untuk produk "Tanpa Kategori"? | **Perlu.** Ditampilkan di tabel Manajemen Produk agar admin mudah menemukan dan memperbaiki produk yang kehilangan kategorinya (lihat Bagian 7.5). |
| Perlu fitur pemindahan kategori secara massal (bulk)? | **Tidak untuk rilis ini** (out of scope). Produk diperbaiki satu per satu secara manual, dibantu badge "Tanpa Kategori". Dicatat sebagai kandidat pengembangan lanjutan (lihat Bagian 11). |
| Indikator "produk baru" di katalog publik? | **Out of scope** untuk rilis ini, dipertimbangkan sebagai pengembangan lanjutan. |
| Tipe data kolom `price`? | **`integer`** (bukan `numeric`) — harga merchandise HMPSTI selalu bilangan bulat tanpa desimal. |
| Kolom `image` bersifat nullable (mendukung draft produk tanpa gambar)? | **Tidak.** Bersifat wajib diisi (`Not Null`). Konsep "draft produk" bukan bagian dari scope PRD ini; jika diperlukan di masa depan, akan dibahas sebagai keputusan desain terpisah. |
| Relasi `product_id` pada `merch_product_sizes` saat produk induk dihapus? | **`onDelete: "cascade"`** — baris ukuran ikut terhapus otomatis bersama produk induknya, karena data ukuran tidak memiliki arti tanpa produk induk. |
| Kategori dipilih di form produk lewat dropdown atau input bebas? | **Dropdown.** `category_id` adalah foreign key ke `merch_categories`, sehingga admin memilih dari kategori yang sudah ada, bukan mengetik bebas — mencegah duplikasi kategori akibat variasi penulisan. |
| Mekanisme input ukuran pada form admin — teks bebas polos atau ada bantuan preset? | **Hybrid.** Dropdown berisi preset umum (`S`/`M`/`L`/`XL`/`XXL`) + opsi **"Lainnya..."** yang membuka input teks bebas untuk ukuran non-standar. Nilai tetap tersimpan sebagai teks bebas di database — tidak mengubah sifat "tidak dibatasi" pada baris di atas, hanya meningkatkan efisiensi UX input. |
| Boleh ada `size_name` duplikat dalam satu produk yang sama (misal dua baris "L")? | **Tidak boleh.** Divalidasi di server action (wajib) dan direkomendasikan dicegah juga di UI (disable opsi yang sudah dipakai pada dropdown baris lain). |
| Kuota (`stock`) pada `merch_product_sizes` bersifat hard limit bagi kuantitas preorder pembeli? | **Tidak.** Bersifat acuan/catatan internal admin saja (misal estimasi kapasitas produksi). Pembeli menginput kuantitas preorder secara bebas di halaman publik (lihat Bagian 7.7), tidak dibatasi otomatis oleh angka ini. |
| Tampilan halaman publik produk berukuran — status stok + checkout langsung, atau preorder saja? | **Preorder saja.** Satu tombol aksi "Preorder", tanpa label status stok maupun tombol checkout langsung. Berbeda dari referensi desain lama (Kabinet Innovara) yang belum disesuaikan dengan aturan `preorder` di PRD ini (lihat Bagian 7.7). Implementasi UI-nya di luar scope dokumen ini (lihat Bagian 4.2 & 11). |

## 13. Open Questions (Tersisa)

Tidak ada pertanyaan terbuka tersisa saat ini. Bagian ini akan diperbarui apabila muncul pertanyaan baru selama proses implementasi.

## 13.1 Catatan Technical Debt

- **Riwayat migrasi Drizzle di database Neon (lokal development) belum sepenuhnya sinkron.** Saat implementasi skema Bagian 8 (25 Agustus 2026), `npx drizzle-kit migrate` gagal karena migrasi awal (`0000_...`) belum tercatat di riwayat migrasi Neon — sisa dari setup awal project yang menggunakan `drizzle-kit push`. Sebagai solusi sementara, skema Merch CRUD diterapkan kembali menggunakan `drizzle-kit push`, bukan `generate` + `migrate` sesuai aturan Bagian 14.2/AGENTS.md.
  - **Dampak saat ini:** Tidak ada, karena masih di lingkungan development lokal.
  - **Risiko ke depan:** Percobaan `drizzle-kit migrate` berikutnya kemungkinan akan mengalami error yang sama sampai riwayat migrasi disinkronkan (misal melalui `drizzle-kit migrate --baseline` atau pendekatan serupa).
  - **Tindak lanjut:** Perlu diselesaikan sebelum Pull Request `feat/merch-crud` diajukan ke `dev`, agar riwayat migrasi tetap konsisten untuk anggota tim lain yang melakukan `git pull`.

## 14. Aturan Kerja (Development Workflow)

Bagian ini mengikat siapa pun yang mengerjakan fitur pada branch `feat/merch-crud` (termasuk AI coding agent), agar proses kerja konsisten, dapat ditelusuri, dan minim risiko regresi.

### 14.1 Sebelum Menulis Kode — Implementation Plan Wajib
- Setiap task/perubahan signifikan (skema baru, server action baru, perubahan komponen besar) **wajib** didahului dengan Implementation Plan tertulis, mencakup:
  - Daftar file yang akan diubah/dibuat, beserta ringkasan perubahan per file.
  - Identifikasi breaking change dan dampaknya ke bagian lain sistem.
  - Urutan pengerjaan yang mencegah error sementara antar file.
  - Potensi risiko dan hal yang perlu diperhatikan.
- Kode **tidak ditulis** sebelum Implementation Plan direview dan disetujui.

### 14.2 Standar Kualitas Data & Performa
- Query admin wajib menggunakan server-side pagination sejak awal (lihat Bagian 10).
- Tidak menggunakan pola subquery per baris (N+1) — gunakan `JOIN` + `GROUP BY` bila memerlukan agregasi.
- Query independen dijalankan paralel (`Promise.all()`), bukan sequential, kecuali ada dependensi eksplisit antar query.

### 14.3 Verifikasi Sebelum Push — Wajib Lulus Berurutan
Sebelum perubahan di-push ke GitHub, wajib dijalankan secara berurutan di lingkungan lokal:
1. `npm run lint` — tidak ada error atau warning baru.
2. `npm run build` — build production berhasil tanpa error (termasuk memastikan tidak ada type error akibat perubahan signature/return type).
3. `npm run dev` — verifikasi manual di browser sesuai skenario yang relevan dengan perubahan (mengacu pada Verification Plan yang disusun bersama Implementation Plan).

Jika salah satu langkah gagal, perbaikan dilakukan terlebih dahulu sebelum melanjutkan ke langkah berikutnya atau melakukan push.

**Catatan penting soal lingkungan pengujian:** verifikasi manual wajib dilakukan di `localhost` (branch kerja aktif), **bukan** di domain production (`hmpstiub.vercel.app`), karena production mencerminkan kondisi branch `main` yang belum tentu memiliki perubahan yang sedang diuji. Basis data lokal juga perlu dipastikan memiliki data yang representatif (melalui seed script) agar pengujian skenario seperti pagination dan filter bermakna.

### 14.4 Setelah Menyelesaikan Task — Walkthrough
- Setiap task yang selesai dan lulus verifikasi (Bagian 14.3) didokumentasikan dalam bentuk walkthrough singkat, mencakup:
  - Latar belakang/masalah yang diselesaikan.
  - Perubahan yang dilakukan per file.
  - Hasil verifikasi (tabel lint/build/manual check).
  - Catatan teknis tambahan yang relevan untuk pengembangan lanjutan.

### 14.5 Push ke GitHub — Aman dan Terarah
- Branch kerja dibuat dari `dev` yang sudah diperbarui (`git pull origin dev`) sebelum memulai task baru, bukan dari branch fitur lama yang berpotensi kedaluwarsa.
- Staging perubahan (`git add`) dilakukan secara eksplisit per file yang relevan — **hindari** `git add .` tanpa pengecekan `git status` terlebih dahulu, untuk mencegah file yang tidak diinginkan (misal konfigurasi lokal agent) ikut ter-commit.
- File/folder yang bersifat konfigurasi lokal (bukan bagian dari kode aplikasi) didaftarkan pada `.gitignore`, bukan di-commit lalu diabaikan secara manual berulang kali.
- Pesan commit mengikuti konvensi [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `perf:`, `refactor:`, `chore:`, dst.) agar riwayat commit mudah dipahami tanpa membuka diff.
- Perubahan besar (skema database, server action inti, halaman baru) diajukan melalui Pull Request ke `dev` — **bukan** langsung ke `main` — untuk memberi ruang review sebelum masuk ke branch yang terhubung dengan deployment production.

---

## 15. Referensi Teknis

Implementasi mengacu pada pola yang telah diverifikasi bekerja dengan baik pada perbaikan performa modul Tim IoT (branch `fix/pameran-iot`, merged ke `dev` pada 25 Agustus 2026):
- `features/pameran-iot/actions/team-actions.ts` — pola query dengan pagination server-side.
- `features/pameran-iot/components/team-manager.tsx` — pola state management berbasis URL searchParams.
- `features/pameran-iot/components/image-upload-field.tsx` — direncanakan untuk digunakan ulang pada upload gambar produk.

---

## 16. Riwayat Perubahan Dokumen

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 25 Agustus 2026 | Draft awal PRD. |
| 1.1 | 26 Agustus 2026 | Menambahkan keputusan desain: (1) kategori dipilih via dropdown pada form produk (Bagian 5.1, 12); (2) input ukuran pada form admin memakai pola hybrid dropdown+teks bebas (Bagian 5.3, 12); (3) validasi larangan `size_name` duplikat dalam satu produk (Bagian 5.3, 10, 12); (4) penegasan bahwa kuota pada `merch_product_sizes` bukan hard limit bagi kuantitas preorder pembeli (Bagian 5.3, 12); (5) catatan alur & tampilan halaman publik untuk preorder produk berukuran, di luar scope implementasi saat ini (Bagian 7.7, 4.2, 11, 12). |

---

*Dokumen ini adalah dokumentasi hidup (living document) untuk branch `feat/merch-crud`. Perubahan pada dokumen ini sebaiknya di-commit bersamaan dengan perubahan skema/logic terkait, agar riwayat keputusan desain tetap tertaut dengan riwayat kode.*