# HMPSTI UB — Design System
## Kabinet Innovara

> Dokumentasi panduan desain resmi website HMPSTI UB Kabinet Innovara.
> Gunakan dokumen ini sebagai acuan tunggal saat membuat halaman, komponen, atau fitur baru.

---

## 1. Filosofi Desain

Website ini menggunakan pendekatan **"Dark Editorial"** — terinspirasi dari majalah teknologi premium dan portofolio kreatif modern. Prinsip utamanya:

- **Kontras Tinggi** — Latar belakang gelap pekat, teks putih tajam, aksen warna yang menonjol.
- **Tipografi sebagai Elemen Visual** — Heading besar, tracking ketat, dan outline text dipakai sebagai dekorasi.
- **Ruang Bernapas** — Padding besar (`py-24`, `py-32`), tidak padat, terasa premium.
- **Interaksi Halus** — Hover effect, animasi masuk dengan Framer Motion, transisi `duration-300`.
- **Minimalis tapi Berkarakter** — Tidak ada ornamen berlebih; setiap elemen punya tujuan.

---

## 2. Warna (Color Palette)

### 2.1 Warna Utama

| Token | Hex | Penggunaan |
|---|---|---|
| `primary` | `#87CEEB` / `#33A5D3` | Aksen utama, link aktif, highlight, border hover |
| `secondary` | `#F59E0B` (amber-400) | Aksen kedua, gradient di footer & judul besar |
| `dark` | `#0F1014` | Background utama body |
| `surface` | `#1E1E24` | Background komponen / card ringan |

> **Catatan**: Dalam praktik kode, `#33A5D3` lebih sering dipakai daripada `#87CEEB` (nilai dari `--color-primary`). Gunakan `#33A5D3` sebagai warna brand biru utama.

### 2.2 Background Berlapis

```
Layer 0 (body)     →  #0F1014  (bg-dark)
Layer 1 (section)  →  #050505  (bg-[#050505])
Layer 2 (section)  →  #020202  (bg-[#020202])
Layer 3 (card)     →  #0A0A0A  (bg-[#0A0A0A])
Layer 4 (surface)  →  white/5  (bg-white/5)
```

> Gunakan pelapisan ini untuk menciptakan kedalaman (depth) tanpa warna yang mencolok.

### 2.3 Teks

| Nama | Nilai | Penggunaan |
|---|---|---|
| **Utama** | `text-white` | Heading, label penting |
| **Sekunder** | `text-gray-400` | Paragraf deskripsi |
| **Tersier** | `text-gray-500` | Teks kecil, metadata, placeholder |
| **Muted** | `text-white/30` | Label dekoratif, "scroll down" |
| **Aksen Biru** | `text-[#33A5D3]` | Label section, state aktif, link hover |
| **Aksen Amber** | `text-[#F59E0B]` | Gradient akhir, aksen kedua |

### 2.4 Border & Divider

```css
border-white/[0.04]   /* Pemisah section, sangat subtle */
border-white/5        /* Border card, divider */
border-white/10       /* Border button outline, elemen medium */
border-[#33A5D3]/30   /* Border navbar saat di-scroll */
border-l-2 border-[#33A5D3]  /* Blockquote / highlight kiri */
```

### 2.5 Gradient

```css
/* Gradient Teks Utama (Footer INNOVARA) */
bg-gradient-to-br from-[#33A5D3] to-[#F59E0B]

/* Gradient Teks Horizontal */
bg-gradient-to-r from-[#33A5D3] via-white to-[#F59E0B]

/* Gradient Teks Navbar Logo */
bg-gradient-to-r from-white to-gray-400

/* Gradient Garis Dekoratif */
bg-gradient-to-r from-transparent via-[#33A5D3]/50 to-transparent

/* Background Blob / Glow */
bg-[#33A5D3]/20    /* Blob biru */
bg-[#F59E0B]/15    /* Blob amber */
bg-sky-500/[0.03]  /* Subtle glow background section */
```

---

## 3. Tipografi

### 3.1 Font Family

| Role | Font | Fallback |
|---|---|---|
| **Sans (body)** | Arial | Helvetica, sans-serif |
| **Mono** | `ui-monospace` | SFMono-Regular, Menlo, Consolas |

> Font saat ini menggunakan sistem default. Jika ingin upgrade, gunakan **Inter** atau **Outfit** dari Google Fonts untuk tampilan lebih premium.

### 3.2 Skala Tipografi

#### Heading Display (Hero)
```css
/* Hero / Display besar */
text-[14vw] sm:text-[8rem] md:text-[10rem] lg:text-[12rem]
font-black tracking-tighter leading-[0.85] uppercase
```

#### Heading Section (H2)
```css
/* Section heading */
text-4xl sm:text-5xl md:text-6xl
font-black tracking-tighter leading-[0.95] uppercase
```

#### Heading Sub-section (H3)
```css
text-3xl sm:text-4xl font-black tracking-tight
```

#### Label Section (Eyebrow / Overline)
```css
font-mono text-xs uppercase tracking-[0.3em] text-[#33A5D3] font-bold
```

#### Label Muted
```css
font-mono text-[10px] uppercase tracking-widest text-white/30
```

#### Body Text
```css
/* Besar */
text-lg md:text-xl leading-relaxed font-light text-gray-400

/* Standar */
text-base leading-relaxed text-gray-400

/* Kecil */
text-sm leading-relaxed text-gray-500

/* Sangat Kecil */
text-xs leading-relaxed text-gray-500
```

#### Mono / Data / Badge
```css
font-mono text-xs uppercase tracking-wider text-white font-bold
```

### 3.3 Teknik Outline Text

Dipakai untuk heading display sebagai elemen dekoratif — terlihat di hero "VARA" dan "TI JAYA.":

```css
/* Outline tebal (hero) */
style={{ WebkitTextStroke: "2px rgba(255,255,255,0.8)" }}

/* Outline tipis berwarna (section) */
style={{ WebkitTextStroke: "1.5px #33A5D3" }}

/* Dikombinasikan dengan: */
className="text-transparent"
```

---

## 4. Spacing & Layout

### 4.1 Container

```css
/* Konten utama */
max-w-7xl mx-auto

/* Konten sedang */
max-w-4xl mx-auto

/* Narrow (teks center) */
max-w-2xl mx-auto
```

### 4.2 Padding Horizontal (Responsive)

```css
/* Standard section padding */
px-6 sm:px-12 md:px-20 lg:px-32

/* Compact */
px-6
```

### 4.3 Padding Vertikal Section

```css
py-16    /* Section ringkas (stats) */
py-20    /* Footer */
py-24    /* Section standar */
py-32    /* Section CTA / besar */
```

### 4.4 Grid System

```css
/* 12-kolom fleksibel */
grid lg:grid-cols-12 gap-8 items-start

/* Contoh pembagian umum */
lg:col-span-5   /* Sisi kiri (judul) */
lg:col-span-7   /* Sisi kanan (konten) */

/* Contoh pembagian lain */
lg:col-span-5   /* Sisi kiri */
lg:col-span-5 lg:col-start-8  /* Sisi kanan */
```

### 4.5 Gap Umum

```css
gap-4    /* Elemen dalam baris */
gap-6    /* Social icons */
gap-8    /* Grid section */
gap-12   /* Grid besar */
```

---

## 5. Komponen

### 5.1 Button — Primary (Solid)

```tsx
// Putih → Hover biru
className="group inline-flex items-center gap-3 px-8 py-4
  bg-white text-black
  hover:bg-[#33A5D3] hover:text-white
  rounded-full font-mono text-xs font-bold uppercase tracking-widest
  transition-all duration-300"
```

### 5.2 Button — Primary (Biru Solid)

```tsx
// Biru → Hover lebih terang (dengan shimmer)
className="group relative px-8 py-4
  bg-[#33A5D3] rounded-full text-black
  font-bold uppercase tracking-widest
  overflow-hidden hover:scale-105 transition-transform"

// Shimmer overlay di dalamnya:
// <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
```

### 5.3 Button — Ghost / Outline

```tsx
className="px-8 py-4
  bg-transparent hover:bg-white/5
  text-white rounded-full
  font-mono text-xs font-bold uppercase tracking-widest
  border border-white/10
  transition-all duration-300"
```

### 5.4 Badge / Chip

```tsx
// Badge kecil (header section)
className="inline-flex items-center gap-2 px-4 py-2
  rounded-full border border-white/10 bg-white/5
  backdrop-blur-md"

// Teks dalam badge:
className="text-xs font-mono uppercase tracking-widest text-gray-300"
```

### 5.5 Card

```tsx
// Card Departemen
className="group relative h-[420px] w-full
  rounded-[2.5rem] bg-[#0A0A0A]
  border border-white/5 p-8
  flex flex-col justify-between overflow-hidden
  transition-all duration-500 hover:-translate-y-2 cursor-pointer"

// Card Member (Leader)
className="group relative flex flex-col items-center text-center
  p-6 rounded-3xl border
  transition-all duration-500
  bg-white/[0.02] border-white/5"
```

### 5.6 Navbar

- **Transparant saat top**: `bg-transparent border-transparent py-5`
- **Frosted saat scroll**: `bg-black/80 backdrop-blur-md border-b border-[#1D77BF]/30 py-3`
- **Link aktif**: `text-[#33A5D3]` + underline `w-full`
- **Link normal**: `text-white/70 hover:text-[#33A5D3]` + underline `w-0 → w-full`

### 5.7 Social Link Icon

```tsx
className="group relative p-3 bg-white/5 rounded-full
  border border-white/10
  hover:border-[#33A5D3]/50
  hover:bg-[#33A5D3]/10
  hover:-translate-y-1
  transition-all duration-300"

// Icon di dalamnya:
className="w-5 h-5 text-gray-400 group-hover:text-[#33A5D3] transition-colors"
```

### 5.8 Divider / Garis Dekoratif

```tsx
// Horizontal divider tipis
<div className="h-px bg-white/10 w-24" />

// Garis bawah full-width dengan gradient
<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#33A5D3]/50 to-transparent" />

// Blockquote border kiri
<blockquote className="pl-6 border-l-2 border-[#33A5D3]">
```

### 5.9 Background Effects

```tsx
// Blob / Glow ambient
<div className="absolute top-0 right-[-10%] w-[60vw] h-[60vw]
  bg-sky-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

// Blob biru (kiri atas)
<div className="absolute top-0 left-0 w-[500px] h-[500px]
  bg-[#33A5D3]/20 blur-[150px] rounded-full
  pointer-events-none mix-blend-screen opacity-60" />

// Blob amber (kanan bawah)
<div className="absolute bottom-0 right-0 w-[500px] h-[500px]
  bg-[#F59E0B]/15 blur-[150px] rounded-full
  pointer-events-none mix-blend-screen opacity-60" />

// Noise texture overlay
<div className="absolute inset-0 opacity-[0.04] pointer-events-none"
  style={{ backgroundImage: DEPARTMENT_NOISE_TEXTURE }} />
```

---

## 6. Animasi & Motion

Proyek menggunakan **Framer Motion** sebagai library animasi utama.

### 6.1 Pola Fade In (Stagger / Group)

```tsx
// Container stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

// Item individual
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 14 },
  },
};
```

### 6.2 Fade In saat Scroll (whileInView)

```tsx
// Standar masuk saat terlihat
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.5, delay: index * 0.08 }}

// Masuk dari Card
initial={{ opacity: 0, y: 50 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-50px" }}
transition={{ duration: 0.5, delay: index * 0.08 }}
```

### 6.3 FadeIn Utility Component

```tsx
// Wrapper sederhana untuk animasi masuk
const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
```

### 6.4 Animasi Hover

```tsx
// Scale on hover
whileHover={{ scale: 1.05 }}

// Translate up card
hover:-translate-y-2

// Icon rotate
group-hover:rotate-[-45deg] group-hover:scale-125

// Social icon naik
hover:-translate-y-1

// Foto zoom
group-hover:scale-110
```

### 6.5 Mobile Menu (AnimatePresence)

```tsx
// Overlay mobile menu fade in/out
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-[#050505]/95 backdrop-blur-xl
        flex flex-col justify-center items-center gap-8"
    />
  )}
</AnimatePresence>
```

### 6.6 CSS Animations

```css
/* Bounce (scroll indicator) */
animate-bounce  /* Tailwind built-in */
```

---

## 7. Iconografi

Library ikon: **Lucide React**

### Ikon yang Digunakan

| Ikon | Konteks |
|---|---|
| `Menu`, `X` | Toggle navbar mobile |
| `ArrowUpRight` | CTA button, card link |
| `ArrowRight` | CTA section button |
| `ChevronDown` | Scroll indicator |
| `ShoppingBag` | Halaman Merch badge |
| `User` | Fallback foto member |

### Ikon Custom (SVG)

- `Instagram`, `Linkedin` — dari `@/components/social-icons`
- `TikTokIcon`, `WhatsAppIcon` — SVG inline di `Footer.tsx`

---

## 8. Z-Index (Layering)

```
z-[101]  →  Logo & tombol menu mobile (di atas navbar)
z-[100]  →  Navbar
z-[90]   →  Mobile menu overlay
z-10     →  Konten utama (relatif terhadap background effects)
z-0      →  Background blobs, noise texture
```

---

## 9. Tema Departemen (Department Themes)

Setiap departemen punya tema warna sendiri via fungsi `getDepartmentThemeColors(theme)` di `@/lib/utils`.

Dua tema tersedia:
- **`sky` (default)** — berbasis `#33A5D3` (sky/biru)
- **`amber`** — berbasis `#F59E0B` (amber/kuning)

Token yang dihasilkan per tema:
```ts
{
  accent: string,           // text color class
  accentBg: string,         // background class
  accentBorder: string,     // border class
  accentBorderHover: string,// hover border class
  accentShadow: string,     // box-shadow class
  accentGlow: string,       // raw CSS gradient string untuk glow blob
  isAmber: boolean,         // flag untuk kondisional
}
```

---

## 10. Border Radius

```css
rounded-full     /* Button, badge, avatar, social icon */
rounded-[2.5rem] /* Card departemen */
rounded-3xl      /* Card member */
rounded-2xl      /* Icon container, foto member */
rounded-xl       /* Row hover (mission list) */
```

---

## 11. Pola Struktur Section

Setiap section umumnya mengikuti pola ini:

```tsx
<section className="relative z-10 py-24 [border] [bg]">
  <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-32">

    {/* --- HEADER SECTION --- */}
    <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#33A5D3] font-bold mb-4 block">
      Label Eyebrow
    </span>
    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none tracking-tighter">
      Judul Section
    </h2>

    {/* --- KONTEN --- */}
    {/* ... */}

  </div>
</section>
```

---

## 12. Responsivitas

Breakpoint Tailwind yang dipakai (standar):

| Breakpoint | Nilai |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

### Pola Mobile-first Umum

```css
/* Tipografi display */
text-[14vw] sm:text-[8rem] md:text-[10rem] lg:text-[12rem]

/* Heading section */
text-4xl sm:text-5xl md:text-6xl

/* Grid */
grid-cols-1 sm:grid-cols-2 md:grid-cols-4

/* Padding horizontal */
px-6 sm:px-12 md:px-20 lg:px-32

/* Flex direction */
flex-col sm:flex-row
```

---

## 13. Checklist Saat Membuat Halaman/Komponen Baru

- [ ] Background: gunakan `bg-[#050505]` atau `bg-[#0F1014]`, bukan warna lain
- [ ] Ada `relative overflow-hidden` untuk efek blob/glow
- [ ] Tambahkan blob ambient jika halaman penting (biru kiri, amber kanan)
- [ ] Semua teks heading pakai `font-black tracking-tighter`
- [ ] Label/eyebrow pakai `font-mono text-xs uppercase tracking-[0.3em] text-[#33A5D3]`
- [ ] Gunakan `motion.div` + `whileInView` untuk animasi masuk
- [ ] Button primary pakai pola `rounded-full` + `font-mono text-xs uppercase tracking-widest`
- [ ] Hover efek pakai `transition-all duration-300`
- [ ] Tidak ada hardcode warna di luar palette yang sudah ditentukan
- [ ] Z-index mengikuti hirarki yang sudah ada
