# Product Requirements Document (PRD)
## Fitur Admin CRUD Merchandise — HMPSTI-UB

**Versi:** 1.4
**Tanggal:** 25 Agustus 2026 (dibuat) — diperbarui 28 Agustus 2026
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
- Menyediakan jejak audit (audit trail) atas aktivitas CRUD admin, agar perubahan data produk/kategori/ukuran dapat ditelusuri.
- Memungkinkan beberapa kategori berbeda dikelompokkan di bawah satu **tipe/slug** yang sama, agar pembeli dapat memfilter produk secara lebih luas di halaman publik (lihat Bagian 5.1).
- Memungkinkan setiap produk memiliki **beberapa gambar** (galeri), agar pembeli dapat melihat produk dari beberapa sudut/variasi tampilan sebelum memutuskan membeli (lihat Bagian 5.4, baru di v1.4).

## 3. Aktor dan Hak Akses

| Aktor | Deskripsi | Hak Akses Utama |
|---|---|---|
| Guest / Pembeli | Pengunjung halaman publik `/merch` | Melihat katalog, detail produk (termasuk galeri gambar), filter kategori/tipe, search, memilih ukuran & menginput kuantitas preorder |
| Admin | Pengelola tunggal seluruh produk HMPSTI | Tambah, ubah, hapus produk (termasuk galeri gambar); kelola kategori; kelola size & kuota acuan per produk; melihat audit trail aktivitas CRUD |

**Catatan:** Tidak ada peran Merchant terpisah. Semua produk dimiliki dan dikelola oleh satu entitas (Admin HMPSTI), berbeda dari model multi-merchant di draf PRD Jelajah Teknologi.

## 4. Scope

### 4.1 Termasuk dalam scope
- CRUD produk merchandise (tambah, lihat, ubah, hapus/nonaktifkan).
- CRUD kategori produk oleh admin (nama unik & slug/tipe, dapat dibagi beberapa kategori — lihat Bagian 5.1), dapat ditambah kapan saja tanpa deployment.
- Dua tipe produk: **berukuran** (dengan daftar size & kuota acuan per size) dan **tanpa ukuran** (dengan stok tunggal).
- Logika status ketersediaan otomatis dan semi-manual (dijelaskan di Bagian 6).
- **Galeri gambar produk (2 sampai 4 gambar per produk)**, memakai komponen `image-upload-field.tsx` yang sudah ada (Cloudinary), reuse dari modul Pameran IoT — lihat Bagian 5.4 (baru di v1.4).
- Pencarian, filter kategori, dan pagination pada tabel admin — server-side, mengikuti pola `?page=&search=&category=` seperti pada perbaikan modul Tim IoT.
- Input ukuran pada form admin menggunakan pola **hybrid** (dropdown preset + opsi teks bebas) dan validasi larangan ukuran duplikat dalam satu produk (lihat Bagian 5.3).
- **Audit trail untuk aktivitas CRUD admin** (tambah/ubah/hapus produk, kategori, ukuran) — ditambahkan setelah UI utama admin selesai. Lihat Bagian 7.8 dan Bagian 15.

### 4.2 Tidak termasuk dalam scope (Out of Scope)
- Sistem multi-merchant (banyak penjual).
- **Sistem transaksi/pesanan pembeli** (checkout, penyimpanan data pembeli, upload bukti transfer, status pesanan). Investigasi kode mengonfirmasi bahwa halaman checkout di `feat/merch` saat ini **murni UI/mockup**, belum dibangun sama sekali — menjadi task/PRD terpisah di masa depan.
- **Audit trail untuk aktivitas pembeli** (checkout, preorder, konfirmasi pembayaran) — bergantung pada sistem transaksi di atas yang belum ada.
- Varian produk selain ukuran (misal varian warna) — dapat menjadi pengembangan lanjutan.
- Laporan penjualan/analitik produk.
- **Implementasi halaman detail produk publik (`/merch/[slug]`)** untuk alur preorder produk berukuran maupun tampilan galeri gambar di sisi pembeli — keputusan desainnya sudah dicatat di Bagian 7.7 dan 5.4, tetapi pembangunan UI publiknya berada di luar scope pekerjaan server actions & admin CRUD pada dokumen ini.
- Fitur pengurutan ulang gambar (drag-and-drop reorder) — urutan gambar mengikuti urutan upload secara default (lihat Bagian 5.4). Reorder manual dapat menjadi pengembangan lanjutan.

## 5. Modul Fitur

### 5.1 Manajemen Kategori (Admin)

- Melihat daftar kategori yang ada.
- Menambah kategori baru (nama + slug diisi manual oleh admin).
- Mengubah nama/slug kategori.
- Menghapus kategori — **dapat dihapus kapan saja**, termasuk saat masih memiliki produk aktif (lihat Bagian 7.5 untuk detail penanganan produk terkait).
- Kategori dipilih pada form produk melalui **dropdown** (bukan input teks bebas), karena `category_id` merupakan foreign key ke `merch_categories`.

**Revisi model kategori & slug (v1.3):**

- **`name` (nama kategori) WAJIB UNIK.** Tidak boleh ada dua kategori dengan nama yang sama persis.
- **`slug` TIDAK LAGI UNIK — berfungsi sebagai "tipe/grup produk".** Beberapa kategori yang berbeda boleh berbagi slug yang sama. Contoh: "Gantungan Kunci HMPSTI" (slug: `gantungan`) dan "Gantungan Kunci Vokasi" (slug: `gantungan`).
- **Tujuan desain:** di halaman publik `/merch`, filter berdasarkan slug menampilkan gabungan produk dari semua kategori yang berbagi slug tersebut.
- **Identitas unik produk tetap di level `id` produk** (`merch_products.id`), bukan di kategori atau slug.

### 5.2 Manajemen Produk (Admin)
- Melihat daftar seluruh produk dalam tabel dengan pagination server-side (default 10 data/halaman, opsi 5/10/20/Semua — mengikuti pola Tim IoT).
- Search produk berdasarkan nama (server-side, melalui parameter URL `?search=`).
- Filter berdasarkan kategori (`?category=`) dan status ketersediaan (`?availability=`).
- Menampilkan badge/indikator visual **"Tanpa Kategori"** pada baris produk yang `category_id`-nya `NULL`.
- Menambah produk baru dengan form yang menyesuaikan tipe produk (toggle "Punya Ukuran").
- Mengubah data produk (nama, deskripsi, harga, galeri gambar, kategori).
- Mengubah stok (khusus produk tanpa ukuran) — status ketersediaan menyesuaikan otomatis.
- Mengubah status ketersediaan secara manual ke `preorder` (khusus produk tanpa ukuran, opsional).
- Menghapus/menonaktifkan produk.

### 5.3 Manajemen Ukuran & Kuota (Admin, khusus produk berukuran)

- Admin mengelola ukuran produk melalui **daftar baris berulang** (repeatable rows).
- **Input ukuran per baris memakai pola hybrid** (dropdown preset S/M/L/XL/XXL + opsi "Lainnya...").
- **Validasi larangan ukuran duplikat** dalam satu produk yang sama, divalidasi di server action.
- Tidak ada batas minimum/maksimum jumlah baris ukuran per produk.
- Tidak ada input stok pada level produk induk untuk tipe ini.
- **Penegasan makna kolom kuota:** bersifat **acuan/rencana internal admin**, **bukan hard limit**.

### 5.4 Manajemen Galeri Gambar Produk (Admin) — **BARU, v1.4**

- Setiap produk **wajib memiliki minimal 2 dan maksimal 4 gambar**. Berlaku untuk **kedua tipe produk** (berukuran maupun tidak) — galeri gambar tidak terkait dengan `has_sizes`.
- Admin mengunggah gambar satu per satu melalui komponen `image-upload-field.tsx` yang sudah ada (Cloudinary), diulang hingga mencapai minimal 2 gambar sebelum produk dapat disimpan.
- **Tombol "Tambah Gambar" otomatis dinonaktifkan (disable)** setelah admin mencapai 4 gambar.
- Admin dapat menghapus salah satu gambar yang sudah diunggah, selama jumlah gambar tidak turun di bawah batas minimal (2) pada saat submit akhir.
- **Urutan tampil gambar mengikuti urutan unggah** (gambar pertama menjadi gambar utama/sampul). Reorder manual di luar scope rilis ini.
- **Validasi jumlah gambar (2-4) wajib ditegakkan di server action** sebagai sumber kebenaran akhir, tidak cukup hanya validasi UI.
- Di halaman publik, gambar pertama ditampilkan besar sebagai gambar utama, dengan thumbnail lainnya di bawah yang dapat diklik untuk mengganti gambar utama — mengikuti pola referensi visual Kabinet Innovara. **Implementasi tampilan galeri di sisi publik di luar scope dokumen ini**, hanya dicatat sebagai referensi agar struktur data admin kompatibel dengan kebutuhan tampilan ini nantinya.

## 6. Logika Status Ketersediaan (Availability)

### 6.1 Produk TANPA ukuran (`has_sizes = false`)
| Kondisi | `availability_type` |
|---|---|
| Admin membuat produk baru dengan stok > 0 | `ready` (otomatis) |
| Stok berkurang hingga mencapai 0 | `out_of_stock` (otomatis) |
| Admin menambah kembali stok dari 0 menjadi > 0 | `ready` (otomatis) |
| Admin secara manual menandai produk sebagai pre-order | `preorder` (override manual) |

Field `stock` **wajib diisi** oleh admin.

### 6.2 Produk DENGAN ukuran (`has_sizes = true`)
| Kondisi | `availability_type` |
|---|---|
| Selalu, sejak produk dibuat | `preorder` (tetap, otomatis, tidak dapat diubah manual) |

Field `stock` pada level produk **tidak digunakan/tidak ditampilkan** di form.

### 6.3 Ringkasan Alasan Desain
Produk berukuran memerlukan penyesuaian ukuran pembeli sehingga secara alami bersifat pre-order. Produk tanpa ukuran merupakan barang jadi yang siap kirim, sehingga status dapat dihitung otomatis dari angka stok.

## 7. Flow Utama

### 7.1 Flow Admin — Tambah Produk Tanpa Ukuran
1. Admin membuka halaman Manajemen Produk, klik "Tambah Produk".
2. Admin mengisi nama, deskripsi, harga, kategori.
3. Admin mengunggah **2 sampai 4 gambar** produk (lihat Bagian 5.4) — **baru di v1.4**, sebelumnya hanya 1 gambar.
4. Admin memastikan toggle "Punya Ukuran" dalam kondisi OFF.
5. Admin mengisi jumlah stok aktual.
6. Sistem menyimpan produk dengan `availability_type` otomatis: `ready` jika stok > 0, `out_of_stock` jika stok = 0.
7. Produk tampil di katalog publik sesuai status, dengan galeri gambar.

### 7.2 Flow Admin — Tambah Produk Dengan Ukuran
1. Admin membuka halaman Manajemen Produk, klik "Tambah Produk".
2. Admin mengisi nama, deskripsi, harga, kategori.
3. Admin mengunggah **2 sampai 4 gambar** produk.
4. Admin mengaktifkan toggle "Punya Ukuran" (ON).
5. Form input stok tunggal disembunyikan; admin menambahkan baris ukuran satu per satu.
6. Sistem menyimpan produk dengan `availability_type` otomatis: `preorder`.
7. Produk tampil di katalog publik dengan label pre-order, pilihan ukuran, dan galeri gambar.

### 7.3 Flow Admin — Restock & Override Manual
1. Admin membuka produk tanpa ukuran yang berstatus `out_of_stock`.
2. Admin memperbarui angka stok menjadi > 0 → status otomatis kembali `ready`.
   **Atau**
2b. Admin menandai produk sebagai preorder secara manual → status menjadi `preorder`.

### 7.4 Flow Admin — Kelola Kategori
1. Admin membuka halaman Manajemen Kategori.
2. Admin menambah kategori baru (nama dan slug diisi manual).
   - **Nama kategori divalidasi harus unik.**
   - **Slug TIDAK divalidasi harus unik.**
3. Kategori baru langsung tersedia sebagai pilihan (dropdown) saat menambah/mengubah produk.

### 7.5 Flow Admin — Hapus Kategori yang Masih Memiliki Produk
1. Admin memilih hapus pada kategori yang masih memiliki produk aktif.
2. Sistem menampilkan **dialog konfirmasi/peringatan**, menyebutkan jumlah produk yang akan terdampak.
3. Jika admin mengonfirmasi, sistem tetap mengizinkan penghapusan (hard delete, tidak diblokir).
4. Produk yang terhubung ke kategori tersebut menjadi tanpa kategori (`category_id` menjadi `NULL`) — produk itu sendiri **tidak ikut terhapus**.
5. Produk-produk tersebut tampil dengan badge **"Tanpa Kategori"**.
6. Admin memperbaiki satu per satu.

### 7.6 Flow Admin — Hapus Produk (dengan Kegagalan Cloudinary) — **direvisi di v1.4 untuk multi-gambar**

1. Admin memilih hapus pada suatu produk.
2. Sistem terlebih dahulu mencoba menghapus **seluruh gambar** produk tersebut (2 sampai 4 gambar, dari tabel `merch_product_images`) satu per satu di Cloudinary.
3. **Jika penghapusan salah satu saja dari gambar-gambar tersebut gagal di Cloudinary (API error), proses hapus produk dibatalkan sepenuhnya** — data produk di database (beserta seluruh baris `merch_product_images` miliknya) tidak ikut terhapus, untuk mencegah data tidak konsisten.
4. Sistem menampilkan pesan error kepada admin, menyarankan untuk mencoba kembali.
5. **Alternatif sementara**: admin dapat mengubah stok produk menjadi `0` secara manual (untuk produk tanpa ukuran) tanpa perlu menghapus produk maupun gambarnya.

### 7.7 Flow Pembeli — Preorder Produk Berukuran (Catatan Desain, di Luar Scope Implementasi Saat Ini)

> **Catatan:** Bagian ini mendokumentasikan keputusan desain untuk halaman publik `/merch/[slug]`, agar tidak hilang. Pembangunan UI/logic-nya **tidak termasuk** dalam pekerjaan server actions & admin CRUD pada branch `feat/merch-crud` (lihat Bagian 4.2).

1. Pembeli membuka halaman detail produk berukuran (`has_sizes = true`).
2. Pembeli memilih salah satu ukuran dari pilihan yang tersedia.
3. Pembeli **menginput sendiri jumlah barang yang ingin di-preorder**, tidak dibatasi otomatis oleh kuota acuan.
4. Tampilan hanya menyediakan **satu tombol aksi: "Preorder"** — tidak ada label stok maupun tombol "Checkout" langsung.
5. Filter berdasarkan slug/tipe di halaman katalog publik menampilkan gabungan produk dari seluruh kategori yang berbagi slug yang sama.
6. **Catatan tambahan (v1.4):** halaman detail produk publik menampilkan galeri gambar (2-4 gambar) dengan gambar utama besar dan thumbnail dapat diklik di bawahnya (lihat Bagian 5.4).

### 7.8 Flow Admin — Melihat Audit Trail Aktivitas Merch
1. Admin membuka menu "Audit Log" pada bagian Merch di sidebar.
2. Sistem menampilkan daftar aktivitas CRUD yang tercatat: waktu, admin pelaku, jenis aksi (CREATE/UPDATE/DELETE), entitas terkait, dan ringkasan pesan.
3. Admin dapat memfilter berdasarkan entitas dan/atau jenis aksi.
4. Admin dapat melihat detail lengkap satu entri log.

## 8. Data Model

| Tabel | Fungsi |
|---|---|
| `merch_categories` | Master kategori produk, dapat ditambah admin kapan saja. |
| `merch_products` | Data utama produk: nama, deskripsi, harga, kategori, tipe (berukuran/tidak), stok (jika tanpa ukuran), status ketersediaan. |
| `merch_product_images` | **(Baru, v1.4)** Daftar gambar (2-4) per produk, menggantikan kolom `image` tunggal sebelumnya. |
| `merch_product_sizes` | Daftar ukuran per produk beserta kuota acuan, hanya relevan untuk produk berukuran. |
| `merch_audit_logs` | Mencatat aktivitas CRUD admin pada produk, kategori, dan ukuran, untuk keperluan audit trail. |

### 8.1 Detail Kolom (rancangan awal, untuk didiskusikan lebih lanjut sebelum implementasi)

**`merch_categories`**
- `id`
- `name` (varchar, **unique**)
- `slug` (varchar, **TIDAK unique**)
- `created_at`

**`merch_products`**
- `id`
- `category_id` (FK → `merch_categories`, **nullable**, `onDelete: "set null"`)
- `name` (varchar)
- `description` (text, nullable)
- `price` (**integer**)
- ~~`image` (text, URL Cloudinary, wajib diisi)~~ **DIHAPUS di v1.4** — digantikan sepenuhnya oleh relasi ke tabel `merch_product_images`.
- `has_sizes` (boolean)
- `stock` (integer, nullable — diisi hanya jika `has_sizes = false`)
- `availability_type` (enum: `ready` | `out_of_stock` | `preorder`)
- `created_at`
- `updated_at`

**Catatan penghapusan (delete):** Seluruh operasi hapus pada modul ini menggunakan **hard delete**, termasuk gambar produk di Cloudinary (lihat Bagian 10).

**`merch_product_images`** — **BARU, v1.4**
- `id`
- `product_id` (FK → `merch_products`, Not Null, `onDelete: "cascade"` — baris ikut terhapus otomatis di level database saat produk induk dihapus; namun penghapusan file aktual di Cloudinary tetap harus ditangani eksplisit di server action **sebelum** proses hapus produk, lihat Bagian 7.6)
- `image_url` (text, Not Null — URL Cloudinary)
- `display_order` (integer, Not Null — menentukan urutan tampil, gambar pertama sebagai gambar utama/sampul; lihat Bagian 5.4)
- `created_at`

> **Catatan implementasi:** jumlah baris per `product_id` (2-4) divalidasi di level server action, bukan lewat constraint database.

**`merch_product_sizes`**
- `id`
- `product_id` (FK → `merch_products`, Not Null, `onDelete: "cascade"`)
- `size_name` (varchar — **harus unik dalam lingkup satu `product_id` yang sama**)
- `stock` (integer — kuota acuan admin)

**`merch_audit_logs`** (detail lengkap di Bagian 15.1)
- `id`
- `admin_id` (FK → `users.id`)
- `entity` (varchar: `"product"` | `"category"` | `"product_size"` | `"product_image"`)
- `entity_id` (integer, nullable)
- `action` (enum: `CREATE` | `UPDATE` | `DELETE`)
- `message` (text)
- `created_at`

## 9. Status Ketersediaan (Ringkasan)

| Status | Deskripsi | Berlaku untuk |
|---|---|---|
| `ready` | Barang fisik tersedia, siap kirim langsung. | Produk tanpa ukuran, stok > 0 |
| `out_of_stock` | Barang fisik habis, belum tersedia untuk dibeli. | Produk tanpa ukuran, stok = 0 |
| `preorder` | Barang dipesan terlebih dahulu. | Produk berukuran (selalu), atau produk tanpa ukuran (override manual) |

## 10. Non-Functional Requirements

- Query data admin **wajib** menggunakan server-side pagination sejak awal implementasi.
- Perhitungan agregasi menggunakan `JOIN` + `GROUP BY`, bukan subquery per baris.
- Query data dan query total count dijalankan paralel (`Promise.all()`).
- Endpoint/server action admin dilindungi autentikasi & otorisasi (`requireUser()`).
- Upload gambar dibatasi format dan ukuran. **(v1.4)** Batas ukuran payload Server Actions untuk upload gambar dinaikkan ke `5mb` (`experimental.serverActions.bodySizeLimit` di `next.config.ts`) — ditemukan sebagai kebutuhan saat verifikasi manual Sub-tahap 4B, karena limit default Next.js (1mb) terlalu kecil untuk foto produk dari perangkat modern. Berlaku secara global untuk seluruh server action di aplikasi; risiko keamanan dinilai kecil karena seluruh server action yang menerima payload besar sudah dilindungi otorisasi admin.
- Perubahan status ketersediaan dihitung di level server action (bukan trigger database).
- Penghapusan produk menggunakan hard delete. Server action penghapusan produk **wajib** menghapus **seluruh** file gambar terkait (2-4 gambar) di Cloudinary **sebelum** menghapus baris data produk. Jika penghapusan salah satu gambar gagal, seluruh proses hapus produk dibatalkan (rollback) — **(v1.4)**.
- Penghapusan kategori tidak diblokir oleh keberadaan produk terkait, namun UI **wajib** menampilkan dialog konfirmasi.
- Server action create/update pada `merch_product_sizes` **wajib** memvalidasi tidak ada `size_name` duplikat.
- Pencatatan audit log dilakukan di level server action untuk setiap operasi CREATE/UPDATE/DELETE pada produk, kategori, ukuran, **dan gambar produk (v1.4)**.
- **Server action create/update pada `merch_categories` wajib memvalidasi `name` unik**, dengan pesan error yang jelas dan ramah (bukan raw database error).
- **`slug` pada `merch_categories` TIDAK divalidasi unik.**
- Penanganan error validasi **wajib** mengembalikan (`return`) objek berisi pesan error ramah, bukan melempar (`throw`) raw error dari driver database.
- **(Baru, v1.4) Server action create/update produk wajib memvalidasi jumlah gambar (`merch_product_images`) berada dalam rentang 2 sampai 4** sebelum data disimpan — sebagai sumber kebenaran akhir, terlepas dari validasi UI.

## 11. Out of Scope untuk Rilis Ini

- Varian produk selain ukuran (warna, bahan, dsb.).
- Sistem multi-merchant/multi-penjual.
- **Sistem transaksi/pesanan pembeli beserta audit trail-nya**. Task/PRD terpisah di masa depan.
- Laporan analitik penjualan produk.
- Notifikasi otomatis saat stok menipis.
- Indikator/highlight "produk baru" pada katalog publik.
- **Fitur pemindahan kategori secara massal (bulk re-categorize)**.
- **Implementasi/perbaikan halaman detail produk publik (`/merch/[slug]`)**, termasuk galeri gambar sisi pembeli, alur pemilihan ukuran, input kuantitas preorder, filter berdasarkan slug/tipe, dan tombol aksi "Preorder".
- **(Baru, v1.4) Fitur pengurutan ulang gambar (reorder) secara manual** oleh admin — urutan tampil mengikuti urutan unggah secara default.

## 12. Keputusan Desain (Sebelumnya Open Questions)

| Pertanyaan | Keputusan |
|---|---|
| Slug kategori digenerate otomatis atau manual? | **Diisi manual oleh admin.** |
| Hard delete atau soft delete untuk produk? | **Hard delete.** |
| Batas jumlah ukuran per produk berukuran? | **Tidak dibatasi.** |
| Kategori dengan produk aktif boleh dihapus? | **Boleh, tidak diblokir.** `category_id` produk menjadi `NULL`. |
| Perlu validasi/warning saat menghapus kategori yang masih dipakai? | **Perlu.** |
| Penghapusan gambar Cloudinary gagal saat hapus produk — dilanjutkan atau dibatalkan? | **Dibatalkan** (rollback penuh), sekarang mencakup seluruh gambar dalam galeri (v1.4). |
| Perlu badge/indikator visual untuk produk "Tanpa Kategori"? | **Perlu.** |
| Perlu fitur pemindahan kategori secara massal (bulk)? | **Tidak untuk rilis ini.** |
| Indikator "produk baru" di katalog publik? | **Out of scope.** |
| Tipe data kolom `price`? | **`integer`.** |
| ~~Kolom `image` bersifat nullable?~~ | **(v1.4) Tidak lagi relevan** — kolom `image` tunggal dihapus, digantikan tabel `merch_product_images` dengan minimal 2 gambar wajib. |
| Relasi `product_id` pada `merch_product_sizes` saat produk induk dihapus? | **`onDelete: "cascade"`.** |
| Kategori dipilih di form produk lewat dropdown atau input bebas? | **Dropdown.** |
| Mekanisme input ukuran pada form admin? | **Hybrid** (dropdown preset + "Lainnya..."). |
| Boleh ada `size_name` duplikat dalam satu produk yang sama? | **Tidak boleh.** |
| Kuota (`stock`) pada `merch_product_sizes` bersifat hard limit bagi kuantitas preorder pembeli? | **Tidak.** |
| Tampilan halaman publik produk berukuran? | **Preorder saja**, satu tombol aksi. Implementasi di luar scope dokumen ini. |
| Audit trail aktivitas CRUD admin — termasuk scope atau tidak? | **Termasuk scope rilis ini.** |
| Audit trail aktivitas pembeli — termasuk scope? | **Tidak termasuk.** |
| Kolom `name` pada `merch_categories` — perlu unik atau boleh duplikat? | **Wajib unik** (v1.3). |
| Kolom `slug` pada `merch_categories` — tetap unik atau boleh dipakai beberapa kategori? | **Tidak lagi unik** — berfungsi sebagai tipe/grup produk (v1.3). |
| **(v1.4)** Berapa jumlah gambar yang boleh diunggah per produk? | **Minimal 2, maksimal 4.** Berlaku untuk kedua tipe produk. Tombol "Tambah Gambar" di-disable otomatis setelah 4. Divalidasi wajib di server action. |
| **(v1.4)** Struktur data untuk multi-gambar — kolom array, atau tabel terpisah? | **Tabel terpisah** (`merch_product_images`), mengikuti pola relasi yang sama dengan `merch_product_sizes`. |
| **(v1.4)** Bagaimana urutan tampil gambar ditentukan? | **Mengikuti urutan unggah** (gambar pertama = gambar utama/sampul). Reorder manual di luar scope. |
| **(v1.4)** Apa yang terjadi pada logic rollback hapus produk dengan multi-gambar? | **Diperluas**: hapus seluruh gambar (2-4) di Cloudinary; jika salah satu gagal, seluruh proses dibatalkan (rollback total). |
| **(v1.4)** Kapan revisi multi-gambar dikerjakan — sebelum atau sesudah Sub-tahap 4C? | **Sebelum** — lebih efisien mengubah fondasi sekarang sebelum lapisan berikutnya dibangun di atasnya. |

## 13. Open Questions (Tersisa)

Tidak ada pertanyaan terbuka tersisa saat ini.

## 13.1 Catatan Technical Debt

- **Riwayat migrasi Drizzle di database Neon (lokal development) belum sepenuhnya sinkron.** Sisa dari setup awal project yang menggunakan `drizzle-kit push`. Perlu diselesaikan sebelum PR `feat/merch-crud` ke `dev`.
- **(v1.3) Perubahan constraint kolom `merch_categories`** — drop unique dari `slug`, tambah unique pada `name`. Diterapkan lewat `ALTER TABLE` manual. File migrasi `0002_hard_stephen_strange.sql` sudah dibuat via `drizzle-kit generate`, namun database lokal **belum mencatat migrasi 0002 sebagai sudah dijalankan**. Perlu diperhatikan saat baseline/sinkronisasi migrasi di Tahap 7.
- **(Baru, v1.4) Penghapusan kolom `image` dari `merch_products` dan penambahan tabel `merch_product_images`** menambah cakupan perubahan skema yang perlu disinkronkan pada Tahap 7. Karena kolom `image` sebelumnya `NOT NULL` dan sudah terisi data pada produk uji coba (misal "Gantungan HMPSTI", "Jaket HMPSTI" dari verifikasi manual 4B), penerapan skema baru perlu memperhitungkan data lama tersebut — mengingat ini masih data uji coba di lingkungan development, cukup dihapus dan diinput ulang manual oleh admin melalui UI setelah skema baru diterapkan.

## 14. Aturan Kerja (Development Workflow)

### 14.1 Sebelum Menulis Kode — Implementation Plan Wajib
Setiap task/perubahan signifikan **wajib** didahului Implementation Plan tertulis (file yang diubah, breaking change, urutan pengerjaan, risiko). Kode **tidak ditulis** sebelum plan direview dan disetujui secara eksplisit oleh Jonathan — **termasuk saat agent diminta "menjelaskan dulu" atau "jangan tulis kode dulu", agent wajib berhenti dan menunggu balasan berikutnya sebelum melakukan perubahan kode apapun**, tanpa terkecuali.

### 14.2 Standar Kualitas Data & Performa
Query admin wajib server-side pagination sejak awal. Tidak ada pola subquery N+1. Query independen dijalankan paralel (`Promise.all()`).

### 14.3 Verifikasi Sebelum Push — Wajib Lulus Berurutan
1. `npm run lint`
2. `npm run build`
3. `npm run dev` — verifikasi manual di browser, di `localhost` (bukan domain production).

### 14.4 Setelah Menyelesaikan Task — Walkthrough
Latar belakang, perubahan per file, hasil verifikasi, catatan teknis tambahan.

### 14.5 Push ke GitHub — Aman dan Terarah
Branch dari `dev` terbaru. Staging eksplisit per file. File konfigurasi lokal di `.gitignore`. Commit **dalam Bahasa Indonesia**, format Conventional Commits. Perubahan besar via PR ke `dev`, bukan langsung ke `main`.

### 14.6 Protokol Referensi PRD untuk Setiap Task Baru
Sebutkan bagian PRD yang relevan sebelum menyusun plan. Pastikan tidak bertentangan dengan Bagian 12. Jika belum diatur di PRD, tanyakan dulu, jangan asumsi sendiri.

---

## 15. Audit Trail Aktivitas Admin & Roadmap Tahapan `feat/merch-crud`

### 15.1 Struktur Tabel Audit Log

**`merch_audit_logs`**
- `id`, `admin_id`, `entity`, `entity_id`, `action`, `message`, `created_at`

### 15.2 Cakupan Pencatatan
CREATE/UPDATE/DELETE pada produk, kategori, ukuran, dan gambar produk (v1.4). Dicatat di level server action.

### 15.3 Tampilan Admin
Halaman terpisah, filter entitas & jenis aksi, gaya UI Log Aktivitas SAMBA-TI.

### 15.4 Roadmap Tahapan (Urutan Pengerjaan `feat/merch-crud`)

Status per 28 Agustus 2026:

| Tahap | Deskripsi | Status |
|---|---|---|
| 1 | PRD final | ✅ Selesai |
| 2 | Skema database dasar + migration | ✅ Selesai (revisi berkelanjutan, lihat Bagian 13.1) |
| 3 | Server actions CRUD (kategori, produk, ukuran) | ✅ Selesai |
| 4A | Halaman Kategori | ✅ Selesai (termasuk revisi unique name / non-unique slug, v1.3) |
| 4B | Halaman Produk (tabel, form dengan toggle ukuran) | 🔧 Selesai, sedang direvisi untuk galeri multi-gambar (v1.4) |
| 4B.1 | **(Baru, v1.4)** Revisi galeri multi-gambar produk (skema `merch_product_images`, server action, UI upload 2-4 gambar) | ⬜ Belum |
| 4C | Integrasi Ukuran ke Form Produk | ⬜ Belum |
| 5 | Sidebar — tambah menu "Merch" ke `SidebarNav.tsx` | ⬜ Belum |
| 6 | Verifikasi manual di localhost | ⬜ Belum |
| 7 | Selesaikan technical debt migrasi (Bagian 13.1) | ⬜ Belum |
| 8 | Audit trail admin | ⬜ Belum |
| 9 | Sidebar — tambah menu "Audit Log" | ⬜ Belum |
| 10 | Walkthrough akhir lengkap + Pull Request `feat/merch-crud` → `dev` | ⬜ Belum |

**Catatan urutan:** Tahap 4B.1 (galeri multi-gambar) disisipkan sebelum Tahap 4C, sesuai keputusan 28 Agustus 2026 bahwa revisi fondasi sebaiknya dilakukan sebelum lapisan berikutnya (integrasi ukuran) dibangun di atasnya.

### 15.5 Penempatan Menu Sidebar
- Menu **"Merch"** pada Tahap 5.
- Menu **"Audit Log"** pada Tahap 9, di bagian paling bawah, sebelum menu "Pengaturan".

### 15.6 Pertimbangan Risiko Waktu
Target waktu 1 minggu sejak 25 Agustus 2026 bersifat **perkiraan longgar, bukan tenggat mengikat** (dikonfirmasi 28 Agustus 2026). Penambahan cakupan kerja boleh memperpanjang waktu pengerjaan tanpa masalah, selama kualitas dan proses verifikasi tetap dijaga.

## 16. Referensi Teknis

- `features/pameran-iot/actions/team-actions.ts` — pola query dengan pagination server-side.
- `features/pameran-iot/components/team-manager.tsx` — pola state management berbasis URL searchParams.
- `features/pameran-iot/components/image-upload-field.tsx` — direuse untuk upload gambar produk (termasuk galeri multi-gambar, v1.4).

---

## 17. Riwayat Perubahan Dokumen

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 25 Agustus 2026 | Draft awal PRD. |
| 1.1 | 26 Agustus 2026 | Dropdown kategori; input ukuran hybrid; validasi larangan `size_name` duplikat; penegasan kuota bukan hard limit; catatan alur preorder publik. |
| 1.2 | 26 Agustus 2026 | Audit trail admin masuk scope; koreksi checkout ternyata belum dibangun; roadmap tahapan resmi; protokol referensi PRD (14.6). |
| 1.3 | 28 Agustus 2026 | Revisi model kategori: `name` wajib unik, `slug` tidak lagi unik (berfungsi sebagai tipe/grup produk); standar penanganan error validasi (return object, bukan throw). |
| **1.4** | **28 Agustus 2026** | **Galeri multi-gambar produk**, ditemukan sebagai kebutuhan setelah verifikasi manual Sub-tahap 4B: (1) **Tabel baru `merch_product_images`** menggantikan kolom `image` tunggal yang dihapus dari `merch_products` — setiap produk wajib memiliki **2 sampai 4 gambar** (lihat Bagian 5.4, 8.1, 12); (2) Tombol "Tambah Gambar" di UI otomatis nonaktif setelah 4 gambar; validasi jumlah gambar wajib ditegakkan juga di server action; (3) Flow hapus produk (Bagian 7.6) diperluas untuk menghapus seluruh gambar dalam galeri sebelum menghapus produk, dengan rollback total jika salah satu gagal; (4) Roadmap (Bagian 15.4) disisipi Tahap 4B.1 untuk revisi ini, dikerjakan sebelum Tahap 4C; (5) Mendokumentasikan kenaikan `serverActions.bodySizeLimit` ke `5mb` di `next.config.ts` (Bagian 10); (6) Menegaskan ulang protokol wajib menunggu konfirmasi eksplisit sebelum coding (Bagian 14.1), setelah dua kali pelanggaran oleh agent selama Sub-tahap 4A dan 4B. |

---

*Dokumen ini adalah dokumentasi hidup (living document) untuk branch `feat/merch-crud`. Perubahan pada dokumen ini sebaiknya di-commit bersamaan dengan perubahan skema/logic terkait, agar riwayat keputusan desain tetap tertaut dengan riwayat kode.*