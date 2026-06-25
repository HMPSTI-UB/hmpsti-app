<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project Rules

## 1. Baca Design System Sebelum Ngoding

**WAJIB**: Sebelum menulis atau mengubah kode yang berhubungan dengan UI, styling, komponen, atau halaman baru, **baca `design.md` terlebih dahulu**.

File `design.md` berisi panduan resmi untuk:
- Color palette & gradient
- Tipografi (heading, body, label, mono)
- Spacing & layout (container, padding, grid)
- Komponen (button, card, badge, navbar, dll.)
- Animasi (Framer Motion patterns)
- Background effects (blob, noise, glow)
- Z-index hierarchy
- Responsivitas

**Jangan** membuat warna, font, spacing, atau pola komponen baru yang tidak ada di `design.md` tanpa alasan yang jelas dan persetujuan user.

## 2. Planning Sebelum Perubahan Besar

**WAJIB**: Untuk setiap perubahan besar, **buat plan terlebih dahulu** sebelum mulai mengubah kode.

Perubahan yang dianggap "besar":
- Membuat halaman atau fitur baru
- Refactor arsitektur atau struktur folder
- Mengubah design system atau tema global
- Menambah/menghapus dependensi utama
- Mengubah layout, navigasi, atau routing
- Perubahan yang menyentuh lebih dari 3 file

Format plan minimal:
1. **Tujuan** — Apa yang ingin dicapai
2. **File yang terdampak** — Daftar file yang akan dibuat/diubah/dihapus
3. **Pendekatan** — Langkah-langkah teknis yang akan dilakukan
4. **Risiko** — Hal yang mungkin break atau perlu diperhatikan

**Jangan langsung ngoding** tanpa plan yang disetujui user untuk perubahan besar.

Untuk perubahan kecil (fix typo, adjust padding, tambah comment, dll.) boleh langsung dikerjakan tanpa plan.
