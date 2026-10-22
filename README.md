# 🥣 NutriBayi - Website & Digital Media MPASI Sehat

Website blog dan media digital profesional seputar MPASI sehat, praktis, bergizi, dan aman untuk bayi usia 6–24 bulan. Dibangun menggunakan teknologi modern **Astro v4**, **Tailwind CSS**, dan **Notion API** sebagai Headless CMS.

Website ini dirancang **100% SEO-Friendly**, memiliki skor performa Core Web Vitals optimal, ramah pengguna mobile, serta sangat mudah dikelola oleh non-IT.

---

## 🌟 Fitur Utama

1. **Astro v4 (SSG - Static Site Generation)**: Loading super cepat, menghasilkan HTML statis murni yang disukai Google.
2. **Notion Headless CMS**: Tulis artikel semudah mengetik di aplikasi Notion, dan otomatis muncul di website tanpa perlu edit kode!
3. **SEO Super Lengkap**:
   - Dynamic Meta Title & Description
   - Open Graph (Facebook, WhatsApp) & Twitter Card
   - Schema.org JSON-LD (Article, BreadcrumbList, Organization)
   - Otomatis membuat `sitemap-index.xml` dan `robots.txt`
   - Alt text gambar dan optimasi `loading="lazy"`
4. **Desain Modern & Ramah Ibu**:
   - Palet warna brand: Oranye `#f76806`, Biru `#0041c2`, Hijau `#0b6623`
   - Tipografi ramah: **Bubblegum Sans** untuk judul ceria dan **Plus Jakarta Sans** untuk kenyamanan membaca
   - 100% Responsif untuk layar smartphone, tablet, dan laptop
5. **Instant Article Search & Category Filter**: Pencarian artikel sekejap di halaman blog.

---

## 📁 Struktur Folder Project

```text
/
├── public/
│   ├── favicon.svg          # Ikon mangkuk & sendok bayi
│   └── robots.txt           # Konfigurasi perayapan mesin pencari
├── src/
│   ├── components/
│   │   ├── BlogCard.astro   # Kartu artikel responsif dengan badge & estimasi baca
│   │   ├── Breadcrumbs.astro# Navigasi remah roti + Schema.org
│   │   ├── Footer.astro     # Footer lengkap dengan disclaimer medis & sosial media
│   │   ├── Hero.astro       # Hero section dengan value proposition & CTA
│   │   ├── Navbar.astro     # Navigasi atas + menu mobile dropdown
│   │   └── SEO.astro        # Komponen meta tags & JSON-LD terpusat
│   ├── layouts/
│   │   └── Layout.astro     # Template dasar seluruh halaman
│   ├── lib/
│   │   └── notion.ts        # Logika koneksi Notion API, helper slugify, & fallback data
│   ├── pages/
│   │   ├── index.astro      # Halaman Beranda (Hero, 3 Keunggulan, Produk, Blog Terbaru, FAQ)
│   │   ├── about.astro      # Halaman Tentang Kami, Visi Misi & Profil Tim Ahli
│   │   └── blog/
│   │       ├── index.astro  # Halaman arsip blog dengan filter topik & search bar
│   │       └── [slug].astro # Halaman artikel detail dengan render Notion block lengkap
│   └── styles/
│       └── global.css       # Pengaturan Tailwind & custom typography
├── .env.example             # Contoh konfigurasi kredensial
├── astro.config.mjs         # Konfigurasi Astro, Tailwind, & Sitemap
├── tailwind.config.mjs      # Token warna dan font brand
└── package.json             # Daftar pustaka & skrip eksekusi
```

---

## 🚀 Panduan Setup Cepat untuk Pemula (Tanpa Background IT)

### Langkah 1: Pasang Node.js di Komputer Anda
1. Kunjungi situs resmi: [https://nodejs.org/](https://nodejs.org/)
2. Unduh versi **LTS (Long Term Support)** yang direkomendasikan.
3. Jalankan file installer hingga selesai (klik Next-Next-Finish).

### Langkah 2: Buka Terminal / Command Prompt
Buka folder project ini di terminal atau VS Code, lalu ketik perintah berikut:

```bash
# 1. Pasang seluruh dependensi project
npm install

# 2. Buat file .env dari contoh yang disediakan
# Di Windows PowerShell:
Copy-Item .env.example .env

# Di Linux / MacOS / Git Bash:
cp .env.example .env
```

### Langkah 3: Jalankan Website di Komputer Anda
```bash
npm run dev
```
Buka peramban (Google Chrome/Edge) dan akses alamat:
👉 **`http://localhost:4321`**

> **Catatan:** Jika Anda belum mengisi Token Notion, website akan **tetap berjalan mulus** menggunakan data demo artikel MPASI berkualitas tinggi yang sudah kami sediakan di `src/lib/notion.ts`!

---

## 📝 Panduan Setup Database Notion CMS (Lengkap Langkah-demi-Langkah)

Anda dapat menulis semua artikel blog langsung dari Notion. Ikuti langkah mudah berikut:

### 1. Buat Integrasi Notion (Mendapatkan NOTION_TOKEN)
1. Buka browser dan kunjungi: [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Klik tombol **"+ New integration"**.
3. Isi kolom:
   - **Name**: `NutriBayi Blog CMS`
   - **Associated workspace**: Pilih workspace Notion Anda.
   - **Type**: Pilih `Internal`.
4. Klik **Save** / **Submit**.
5. Pada bagian **Internal Integration Secret**, klik **Show** lalu **Copy**. Token ini berawalan `ntn_...` atau `secret_...`.
6. Buka file `.env` di project Anda dan tempelkan token tersebut:
   ```env
   NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 2. Buat Database di Notion
1. Buka halaman baru di aplikasi Notion Anda.
2. Ketik `/database` lalu pilih **Database - Full page** (atau **Table view**).
3. Beri judul database Anda: `Database Artikel NutriBayi`.
4. Buat 7 kolom (Properties) dengan nama dan tipe data **persis** seperti tabel di bawah ini:

| Nama Properti | Tipe Properti di Notion | Keterangan / Contoh Nilai |
|---|---|---|
| **Title** | `Title` *(Bawaan)* | Judul artikel (Contoh: *Tips Menghadapi GTM*) |
| **Slug** | `Text` *(Rich text)* | URL artikel (Contoh: *tips-menghadapi-gtm*). *Jika dikosongkan, kode otomatis membuatnya dari Title!* |
| **Status** | `Select` | Berikan pilihan: `Draft` dan `Published` *(Hanya artikel bertatus Published yang tampil di web)* |
| **Date** | `Date` | Tanggal publikasi artikel |
| **Tags** | `Multi-select` | Kategori topik MPASI (Lihat daftar topik di bawah) |
| **Excerpt** | `Text` *(Rich text)* | Ringkasan singkat 1-2 kalimat untuk kartu preview |
| **Cover** | `Files & media` | Upload gambar sampul artikel (atau bisa gunakan Page Cover Notion) |

#### 🏷️ Rekomendasi Pilihan Opsi pada Tags (Multi-select):
- `MPASI Sehat & Tumbuh Kembang Bayi`
- `Panduan MPASI sesuai usia`
- `Ide menu MPASI`
- `Nutrisi dan kebutuhan bayi`
- `Tips memilih bahan makanan`
- `Resep MPASI praktis`
- `Tips menghadapi GTM (Gerakan Tutup Mulut)`
- `Tips menyimpan dan menyiapkan MPASI`

### 3. Hubungkan Database ke Integrasi Anda
*Langkah ini sangat penting agar website diizinkan membaca database Notion Anda:*
1. Di halaman Database Notion yang baru Anda buat, klik ikon titik tiga `...` di pojok kanan atas.
2. Gulir ke bawah dan klik **"Connections"** (atau **"Connect to"**).
3. Cari nama integrasi yang Anda buat di Langkah 1 (`NutriBayi Blog CMS`) lalu klik.
4. Klik **Confirm**. Sekarang database Anda sudah terhubung!

### 4. Dapatkan NOTION_DATABASE_ID
1. Klik tombol **Share** di pojok kanan atas database Notion, lalu klik **Copy link**.
2. Link tersebut akan terlihat seperti ini:
   ```text
   https://www.notion.so/workspace/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p?v=987654321
   ```
3. ID Database adalah kombinasi **32 karakter** antara nama workspace dan tanda tanya `?`:
   `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`
4. Tempelkan ke file `.env`:
   ```env
   NOTION_DATABASE_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
   ```

---

## 🌐 Panduan Deploy ke Vercel (Gratis & Siap Online)

Website ini siap dideploy ke **Vercel** hanya dalam beberapa klik:

### Langkah A: Simpan Kode ke GitHub Otomatis
Cukup jalankan satu perintah di terminal:
```bash
npm run deploy
```
Atau jika ingin menambahkan pesan perubahan kustom:
```bash
npm run deploy -- "pesan perubahan kustom"
```
Skrip ini akan secara otomatis menambahkan semua file yang diubah (`git add .`), membuat commit, dan mengunggahnya langsung ke GitHub (`git push origin main`).

---

### Langkah B: Hubungkan ke Vercel (Otomatis Deploy saat Push)
1. Buka [https://vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Pilih repository `Nutri-Bayi-CMS` lalu klik **Import**.
4. Di bagian **Environment Variables**, tambahkan 2 variabel berikut:
   - `NOTION_TOKEN`: Masukkan token integrasi Notion Anda.
   - `NOTION_DATABASE_ID`: Masukkan database ID Notion Anda.
   - `SITE_URL`: Masukkan URL domain Anda nantinya (misal: `https://nutribayi.vercel.app`).
5. Klik **Deploy**!
6. Setiap kali Anda mengetik `npm run deploy` di terminal, Vercel akan otomatis mendeteksi pembaruan di GitHub dan langsung memperbarui website Anda secara live!

---

## 🔍 Checklist SEO & Best Practice yang Sudah Diterapkan

- [x] **Canonical URLs**: Mencegah konten duplikat di mesin pencari.
- [x] **Schema.org Structured Data**:
  - `Article` pada halaman detail blog (mendukung Google Rich Snippets).
  - `BreadcrumbList` pada navigasi artikel.
  - `Organization` pada brand profile.
- [x] **OpenGraph & Twitter Card**: Tampilan kartu pratinjau yang memikat saat link dibagikan di WhatsApp, Facebook, dan Twitter.
- [x] **Sitemap Otomatis**: Menghasilkan `/sitemap-index.xml` otomatis saat build.
- [x] **Robots.txt**: Mengarahkan bot mesin pencari ke sitemap resmi.
- [x] **Fast Image Loading**: Gambar dilengkapi atribut `loading="lazy"` dan `decoding="async"`.

---

## 📄 Lisensi
Dibuat dengan ❤️ untuk seluruh keluarga dan bayi sehat di Indonesia.
