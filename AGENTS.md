<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Konteks Fitur Pameran IoT (Voting System)

## Stack & Konvensi
- **Next.js 16.2.9** (App Router, Turbopack), **React 19**, **Tailwind CSS v4**, **Drizzle ORM** + **Neon PostgreSQL**
- Auth: `next-auth` v5 beta (JWT strategy). Admin routes di `app/dashboard/`, public routes di `app/(public)/`
- UI: **Shadcn UI** (dark mode). Dialog/AlertDialog sudah dihapus class `slide-in/out` karena bentrok Tailwind v4 → animasi pakai fade/zoom dari tengah saja
- Semua server actions di `features/pameran-iot/actions/`
- Semua komponen client di `features/pameran-iot/components/`
- Semua page wrapper di `features/pameran-iot/pages/`

## Schema DB (`db/schema.ts`)
- `vote_sessions` → id (serial PK), name, start_time (timestamp), end_time (timestamp)
- `iot_teams` → id, code (unique), class_name, group_number, title, team_members, banner_image_url, project_image_url, session_id (FK → vote_sessions)
- `votes` → id, team_id (FK → iot_teams), session_id (FK → vote_sessions), voter_name (nullable), message (nullable), voted_at

## Fitur yang Sudah Selesai

### 1. CRUD Tim IoT (Admin)
- `session-actions.ts`: CRUD sesi (create/update/delete) + `startSessionNow`, `endSessionNow`, `resetSessionVotes`
- `team-manager.tsx`: Tabel tim dengan pagination + filter (kelas & sesi)
- Upload gambar via Cloudinary (`next-cloudinary`)

### 2. Manajemen Sesi (Admin) — `session-manager.tsx`
- Tabel sesi dengan status otomatis (Belum Mulai / Aktif / Selesai) berdasarkan waktu
- Tombol cepat per sesi:
  - ▶ **Play** (hijau): Mulai sesi sekarang — set startTime=now, endTime=now+durasi awal. Muncul jika status ≠ Aktif
  - ⬛ **Stop** (kuning): Akhiri sesi sekarang — set endTime=now. Muncul hanya jika Aktif
  - 🔄 **Reset** (oranye): Hapus semua vote sesi. Disabled jika voteCount=0
  - ✏️ Edit, 🗑️ Delete (dengan proteksi jika ada tim)
- Semua konfirmasi pakai **AlertDialog** Shadcn (BUKAN native `confirm()`)

### 3. Voting Publik (Tanpa Login, Tanpa Batas)
- `vote.ts` (`submitVote`): Public (tanpa `auth()`), validasi waktu sesi via SQL `CURRENT_TIMESTAMP`
- `get-teams.ts` → `getActiveSession()`: Deteksi sesi aktif pakai `CURRENT_TIMESTAMP` (bukan `new Date()`) untuk menghindari mismatch timezone
- `app/(public)/pameran-iot/vote/page.tsx`: `dynamic = "force-dynamic"`, `revalidate = 0` untuk mematikan cache
- `vote-page.tsx`: UI voting publik, judul "VOTE KARYA FAVORIT", filter kelas, search, sort
- `no-active-session.tsx`: Fallback UI jika tidak ada sesi aktif

### 4. Monitoring Vote (Admin) — `vote-monitor.tsx`
- Tabel ranking tim berdasarkan jumlah vote, filter per sesi
- Detail vote per tim (dialog popup)
- **Ekspor Excel**: Tombol "Ekspor Excel (.xlsx)" → download file `.xlsx` dengan format formal akademik (Header, Bold, Borders) berisi No, Kode, Judul Karya, Kelas, Anggota, Hasil Vote. Menggunakan library `exceljs`.

### 5. Live Leaderboard — `live-page.tsx`
- Halaman publik real-time (polling 5 detik), bar chart animasi
- **Status: belum di-polish, fitur live voting ditunda**

## Catatan Penting
- Tailwind CSS v4: Jangan pakai class `data-[state=open]:slide-in-from-*` pada Dialog/AlertDialog, bentrok → efek loncat ke pojok kiri atas
- Halaman vote HARUS `force-dynamic` + `revalidate = 0` agar tidak ter-cache
- Query waktu sesi HARUS pakai `CURRENT_TIMESTAMP` SQL, bukan `new Date()` JavaScript
- Voting bersifat **tanpa batas** (tidak ada rate limit per IP/perangkat) — keputusan user
