<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# Project Rules for Agents

Every agent working in this repo MUST follow these rules. When they conflict with your habits or training data, **these rules win**.

## 0. Language

- Communicate with the user in **English** — including technical conventions, explanations, and any discussion. Code, comments, and identifiers stay in English too.
- The existing project-context section below is in Indonesian (author's original notes); leave it as-is unless asked to translate.

## 1. Read first, then write

- This is a **modified Next.js 16.2.9** — many APIs differ from public Next.js. Before writing Next.js code, **read `node_modules/next/dist/docs/01-app/`** for the relevant feature. Do not rely on memory.
- Local skills live in `.claude/skills/` (`nextjs-16`, `drizzle-orm`, `next-auth-v5`) — use them as a quick guide, but still verify against the docs.
- Before editing a file, read it and its surrounding context. Match the existing code style.

## 2. Structure & Conventions (required)

- Split features by folder: server actions → `features/<feature>/actions/`, client components → `features/<feature>/components/`, page wrappers → `features/<feature>/pages/`.
- Admin routes in `app/dashboard/`, public routes in `app/(public)/`.
- Import DB from `@/db`, tables/columns from `@/db/schema`. Import `auth`/`signIn`/`signOut` from `@/auth`.
- Use **Shadcn AlertDialog** for destructive confirmations, NOT native `confirm()`.

## 3. Hard Rules (do not break)

- **Next.js 16 async APIs**: `params`, `searchParams`, `cookies()`, `headers()` are Promises → always `await`.
- **Session time**: check with SQL `CURRENT_TIMESTAMP`, NOT JavaScript `new Date()` (avoids timezone mismatch).
- **Public vote pages**: must `export const dynamic = "force-dynamic"` + `revalidate = 0`.
- **Tailwind v4**: do NOT use `data-[state=open]:slide-in-from-*` on Dialog/AlertDialog (jumps to top-left). Use fade/zoom only.
- **Server action = public POST endpoint** → always `await auth()` + check authorization inside every action that needs protection. (Public voting intentionally has no `auth()` — a deliberate decision.)
- **DB driver (node-postgres)**: `db` is `drizzle-orm/node-postgres` (Pool). Interactive transactions (`db.transaction`) ARE supported — use them for multi-statement atomicity. `db.batch()` is NOT available on this driver. Local dev DB = Docker Postgres (`docker compose up -d`, see `DATABASE_URL`); production = Neon via Vercel env.
- After a mutation that affects rendered pages, call `revalidatePath()`.

## 4. DB Migrations

- Edit `db/schema.ts` → `npx drizzle-kit generate` → `npx drizzle-kit migrate`. `push` is dev-only, never against a shared/prod DB. Don't hand-edit generated migration SQL without a clear reason.

## 5. Action Limits

- **Do not commit / push** unless the user explicitly asks. If on `main`, create a branch first.
- Don't run destructive operations (`reset --hard`, drop table, delete data) without confirmation.
- The `.claude/` folder is local (gitignored) — don't assume it exists in CI/production.
- Secrets only in `.env` (already gitignored). Never hardcode credentials.

## 6. After Changes

- Verify non-trivial changes (run/trace the affected flow, not just assume). Report results honestly — if something failed or was skipped, say so.

---

# Project Structure

Feature-first layout. Routes in `app/` stay thin (auth + data fetch + render a
page wrapper); real UI/logic lives under `features/<feature>/`. Shared, cross-feature
code lives in the top-level `lib/`, `hooks/`, `components/`, `types/`, `constant/`.

```
hmpsti-app/
├── app/                          # Next.js App Router (thin route layer)
│   ├── (public)/                 # Public routes (no auth)
│   │   ├── page.tsx              #   landing
│   │   ├── departemen/ struktur/ kalender/ merch/
│   │   └── pameran/             #   catalog, [id] detail, vote/, live/
│   ├── dashboard/                # Admin routes (auth-gated)
│   │   ├── teams/ vote-sessions/ vote-monitor/ site-settings/ settings/
│   │   └── layout.tsx
│   ├── auth/                     # NextAuth route handler + auth UI
│   │   ├── [...nextauth]/  login/  redirect/
│   └── layout.tsx
│
├── features/                     # Feature-first modules — the real code
│   └── <feature>/
│       ├── actions/              #   "use server" server actions (mutations/queries)
│       ├── components/           #   client components for this feature
│       ├── pages/                #   page wrappers rendered by app/ routes
│       ├── hooks/                #   feature-scoped hooks (e.g. use-pagination)
│       ├── types.ts              #   domain types derived from action return types
│       └── schemas.ts            #   zod schemas (where used, e.g. auth)
│   # existing features: pameran, merch, auth, landing, departments,
│   #   organization, calendar, announcement, not-found, site-settings
│
├── components/                   # Shared/global components
│   ├── ui/                       #   Shadcn UI primitives (button, dialog, table…)
│   └── Navbar / Footer / Header / SidebarNav / AspirasiFab …
│
├── db/                           # Drizzle + Postgres (node-postgres driver)
│   ├── index.ts                  #   db client (pg Pool, drizzle-orm/node-postgres)
│   ├── schema.ts                 #   tables: users, vote_sessions, teams, votes, site_settings
│   ├── migrations/               #   drizzle-kit generated SQL (don't hand-edit)
│   └── seed.ts / seed-teams.ts
│
├── lib/                          # Shared helpers (global, cross-feature)
│   ├── utils.ts                  #   cn(), theme helpers
│   └── handle-action.ts          #   getErrorMessage(unknown)
├── hooks/                        # Shared hooks (use-mobile, use-toast)
├── types/                        # Shared types (data.ts)
├── constant/                     # Static data (data.ts)
│
├── auth.ts                       # NextAuth v5 config (handlers, auth, signIn/out)
├── drizzle.config.ts             # drizzle-kit config
├── next.config.ts  proxy.ts      # Next config + proxy
└── AGENTS.md / CLAUDE.md         # these rules
```

**Where does new code go?**

- New mutation/query → `features/<feature>/actions/`. Guard with `requireUser()` from that feature's `actions/_guards.ts` (pameran has one; add per feature or promote to `lib/` if shared).
- New client UI for a feature → `features/<feature>/components/`. A route renders it via a wrapper in `features/<feature>/pages/`.
- Reusable across features → `lib/` (functions), `hooks/` (hooks), `components/` (UI), `types/` (types).
- New DB table/column → `db/schema.ts`, then generate + migrate (§4).

---

# Konteks Fitur Pameran IoT (Voting System)

## Stack & Konvensi

- **Next.js 16.2.9** (App Router, Turbopack), **React 19**, **Tailwind CSS v4**, **Drizzle ORM** + **Neon PostgreSQL**
- Auth: `next-auth` v5 beta (JWT strategy). Admin routes di `app/dashboard/`, public routes di `app/(public)/`
- UI: **Shadcn UI** (dark mode). Dialog/AlertDialog sudah dihapus class `slide-in/out` karena bentrok Tailwind v4 → animasi pakai fade/zoom dari tengah saja
- Semua server actions di `features/pameran/actions/`
- Semua komponen client di `features/pameran/components/`
- Semua page wrapper di `features/pameran/pages/`

## Schema DB (`db/schema.ts`)

- `vote_sessions` → id (serial PK), name, start_time (timestamp), end_time (timestamp)
- `teams` → id, code (unique), class_name, group_number, title, team_members, banner_image_url, project_image_url, session_id (FK → vote_sessions)
- `votes` → id, team_id (FK → teams), session_id (FK → vote_sessions), voter_name (nullable), message (nullable), voted_at
- `site_settings` → id (serial PK), show_pameran (boolean, default true), updated_at (timestamp) — **single-row**; toggle publish Pameran. Admin UI di `features/site-settings/` (`app/dashboard/site-settings/page.tsx`). Ketika `show_pameran=false`: halaman publik `/pameran`, `/pameran/[id]`, `/pameran/vote`, `/pameran/live` → `notFound()`; Navbar menyembunyikan link via `getPublicSiteSettings()` (server action publik, dipanggil client-side agar landing tetap `force-static`); modul admin tetap tampil. Setelah toggle → `revalidatePath` semua route pameran.

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
