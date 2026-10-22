import { Client } from '@notionhq/client';

/**
 * Interface untuk Post Blog MPASI
 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  excerpt: string;
  coverImage: string;
  status: 'Published' | 'Draft';
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  readingTime: string;
}

/**
 * Interface untuk Block Konten Notion
 */
export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

// Inisialisasi Notion Client
const NOTION_TOKEN = import.meta.env.NOTION_TOKEN || process.env.NOTION_TOKEN || '';
const DATABASE_ID = import.meta.env.NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID || '';

export const isNotionConfigured = Boolean(
  NOTION_TOKEN && 
  DATABASE_ID && 
  !NOTION_TOKEN.includes('xxxx') && 
  !DATABASE_ID.includes('xxxx')
);

export const notion = isNotionConfigured
  ? new Client({ auth: NOTION_TOKEN })
  : null;

/**
 * Fungsi pembantu untuk membuat slug URL yang rapi dari teks/judul
 * Contoh: "Tips Menghadapi GTM Bayi!" -> "tips-menghadapi-gtm-bayi"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Hapus aksen karakter jika ada
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '') // Hapus karakter spesial selain huruf, angka, spasi, dash
    .replace(/\s+/g, '-') // Ganti spasi dengan tanda dash (-)
    .replace(/-+/g, '-') // Ganti multiple dash jadi satu dash
    .replace(/^-+|-+$/g, ''); // Hapus dash di awal & akhir
}

/**
 * Estimasi waktu membaca berdasarkan jumlah kata
 */
function estimateReadingTime(text: string): string {
  const wordsPerMinute = 180;
  const wordCount = text.split(/\s+/g).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${Math.max(1, minutes)} menit baca`;
}

/**
 * Ekstrak Plain Text dari Rich Text Notion
 */
export function getPlainText(richTextArray: any[]): string {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map((t) => t.plain_text || '').join('');
}

/**
 * Ekstrak URL Gambar Cover dari Halaman Notion
 */
function extractCoverImage(page: any): string {
  // Cek properti Files & Media "Cover"
  const coverProp = page.properties?.Cover?.files?.[0];
  if (coverProp) {
    if (coverProp.type === 'external') return coverProp.external?.url || '';
    if (coverProp.type === 'file') return coverProp.file?.url || '';
  }

  // Cek Cover bawaan Halaman Notion (Page Cover)
  if (page.cover) {
    if (page.cover.type === 'external') return page.cover.external?.url || '';
    if (page.cover.type === 'file') return page.cover.file?.url || '';
  }

  // Fallback gambar MPASI berkualitas tinggi dari Unsplash
  return 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80';
}

/**
 * Mengambil semua artikel blog yang berstatus 'Published' dari Notion Database
 */
export async function getPosts(): Promise<BlogPost[]> {
  if (!isNotionConfigured || !notion) {
    console.warn('⚠️ [NutriBayi] NOTION_TOKEN atau NOTION_DATABASE_ID belum diatur. Menggunakan data demo MPASI default.');
    return MOCK_POSTS;
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: 'Published',
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts: BlogPost[] = response.results.map((page: any) => {
      const props = page.properties;

      // Ambil Title
      const rawTitle = getPlainText(props.Title?.title) || 'Tanpa Judul';
      
      // Ambil Slug (jika kosong, generate dari Title)
      const rawSlug = getPlainText(props.Slug?.rich_text) || slugify(rawTitle);

      // Ambil Tanggal
      const rawDate = props.Date?.date?.start || page.created_time || new Date().toISOString();

      // Ambil Tags
      const tags = (props.Tags?.multi_select || []).map((t: any) => t.name);

      // Ambil Excerpt / Ringkasan
      const excerpt = getPlainText(props.Excerpt?.rich_text) || 'Panduan nutrisi MPASI sehat dan tips praktis tumbuh kembang bayi.';

      // Ambil Cover Image
      const coverImage = extractCoverImage(page);

      return {
        id: page.id,
        title: rawTitle,
        slug: rawSlug,
        date: rawDate,
        tags: tags.length > 0 ? tags : ['MPASI Sehat'],
        excerpt,
        coverImage,
        status: 'Published',
        author: {
          name: 'Tim Ahli NutriBayi',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          role: 'Nutritionist & Mom of 2',
        },
        readingTime: estimateReadingTime(excerpt + ' ' + rawTitle),
      };
    });

    return posts.length > 0 ? posts : MOCK_POSTS;
  } catch (error) {
    console.error('❌ Gagal mengambil database Notion:', error);
    // Kembalikan mock posts agar website tetap berjalan
    return MOCK_POSTS;
  }
}

/**
 * Mengambil satu artikel berdasarkan slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getPosts();
  const matched = allPosts.find((p) => p.slug === slug);
  return matched || null;
}

/**
 * Mengambil daftar blocks Notion dari sebuah halaman (page ID)
 */
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  if (!isNotionConfigured || !notion) {
    return MOCK_BLOCKS[pageId] || DEFAULT_MOCK_BLOCKS;
  }

  try {
    const blocks: NotionBlock[] = [];
    let cursor: string | undefined = undefined;

    while (true) {
      const { results, next_cursor, has_more } = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      blocks.push(...(results as NotionBlock[]));

      if (!has_more) break;
      cursor = next_cursor || undefined;
    }

    return blocks.length > 0 ? blocks : DEFAULT_MOCK_BLOCKS;
  } catch (error) {
    console.error(`❌ Gagal mengambil block halaman (${pageId}):`, error);
    return MOCK_BLOCKS[pageId] || DEFAULT_MOCK_BLOCKS;
  }
}

// =========================================================================
// DATA DUMMY / MOCK DEFAULT (Sangat berguna saat pengguna pemula pertama kali menjalankan web)
// =========================================================================

export const MOCK_POSTS: BlogPost[] = [
  {
    id: 'mock-1',
    title: 'Panduan MPASI Sesuai Usia: Tahapan Lengkap Tekstur 6 hingga 24 Bulan',
    slug: 'panduan-mpasi-sesuai-usia-tahapan-lengkap',
    date: '2026-02-10',
    tags: ['Panduan MPASI sesuai usia', 'MPASI Sehat & Tumbuh Kembang Bayi'],
    excerpt: 'Ketahui panduan lengkap tahapan tekstur, frekuensi makan, dan porsi MPASI si kecil dari usia 6 bulan hingga 2 tahun agar tumbuh kembangnya optimal.',
    coverImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    author: {
      name: 'dr. Sarah Amanda, Sp.A',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
      role: 'Dokter Spesialis Anak & Konsultan Nutrisi',
    },
    readingTime: '5 menit baca',
  },
  {
    id: 'mock-2',
    title: 'Tips Menghadapi GTM (Gerakan Tutup Mulut) Tanpa Stres untuk Ibu Muda',
    slug: 'tips-menghadapi-gtm-gerakan-tutup-mulut',
    date: '2026-02-05',
    tags: ['Tips menghadapi GTM (Gerakan Tutup Mulut)', 'Ide menu MPASI'],
    excerpt: 'Si kecil tiba-tiba mogok makan? Jangan panik, Bun! Simak 6 tips efektif feeding rules dan trik variasi rasa agar anak lahap makan kembali.',
    coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    author: {
      name: 'Nadia Safira, S.Gz',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      role: 'Ahli Gizi Anak & Ibu 2 Balita',
    },
    readingTime: '4 menit baca',
  },
  {
    id: 'mock-3',
    title: '7 Ide Menu MPASI 4 Bintang Praktis & Bergizi untuk Berat Badan Ideal',
    slug: 'ide-menu-mpasi-4-bintang-praktis-bergizi',
    date: '2026-01-28',
    tags: ['Ide menu MPASI', 'Resep MPASI praktis', 'Nutrisi dan kebutuhan bayi'],
    excerpt: 'Kumpulan inspirasi resep MPASI dengan gizi seimbang: karbohidrat, protein hewani, protein nabati, dan serat yang mudah dimasak setiap hari.',
    coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    author: {
      name: 'Chef Maya Pratiwi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      role: 'Kuliner Sehat Keluarga & MPASI Maker',
    },
    readingTime: '6 menit baca',
  },
  {
    id: 'mock-4',
    title: 'Nutrisi dan Kebutuhan Zat Besi Bayi: Mengapa Sangat Kritis Mulai 6 Bulan?',
    slug: 'nutrisi-dan-kebutuhan-zat-besi-bayi-usia-6-bulan',
    date: '2026-01-20',
    tags: ['Nutrisi dan kebutuhan bayi', 'Tips memilih bahan makanan'],
    excerpt: 'Setelah usia 6 bulan, cadangan zat besi dari lahir mulai menipis. Pahami sumber protein hewani terbaik pencegah stunting dan anemia pada bayi.',
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    author: {
      name: 'dr. Sarah Amanda, Sp.A',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
      role: 'Dokter Spesialis Anak & Konsultan Nutrisi',
    },
    readingTime: '5 menit baca',
  },
  {
    id: 'mock-5',
    title: 'Tips Memilih Bahan Makanan Segar & Organik untuk Menu Harian MPASI',
    slug: 'tips-memilih-bahan-makanan-mpasi-segar',
    date: '2026-01-15',
    tags: ['Tips memilih bahan makanan', 'MPASI Sehat & Tumbuh Kembang Bayi'],
    excerpt: 'Cara cerdas memilih daging sapi, ayam kampung, ikan lokal kaya omega-3, serta sayuran bebas pestisida di pasar tradisional maupun supermarket.',
    coverImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    author: {
      name: 'Nadia Safira, S.Gz',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      role: 'Ahli Gizi Anak & Ibu 2 Balita',
    },
    readingTime: '4 menit baca',
  },
  {
    id: 'mock-6',
    title: 'Panduan Food Prep: Tips Menyimpan & Menyiapkan MPASI Freezer Tanpa Hilang Gizi',
    slug: 'tips-menyimpan-dan-menyiapkan-mpasi-food-prep',
    date: '2026-01-10',
    tags: ['Tips menyimpan dan menyiapkan MPASI', 'Resep MPASI praktis'],
    excerpt: 'Panduan steril wadah kaca, batas waktu simpan di chiller & freezer, serta cara mencairkan (thawing) MPASI yang higienis untuk ibu bekerja.',
    coverImage: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80',
    status: 'Published',
    author: {
      name: 'Chef Maya Pratiwi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      role: 'Kuliner Sehat Keluarga & MPASI Maker',
    },
    readingTime: '5 menit baca',
  },
];

export const DEFAULT_MOCK_BLOCKS: NotionBlock[] = [
  {
    id: 'b-1',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Memulai masa Makanan Pendamping ASI (MPASI) adalah tonggak bersejarah dalam perjalanan tumbuh kembang si kecil. Pada periode emas ini, asupan nutrisi yang tepat bukan hanya sekadar membuat anak kenyang, namun juga membentuk sistem imun, kecerdasan otak, dan kebiasaan makan sehat seumur hidupnya.',
          },
        },
      ],
    },
  },
  {
    id: 'b-2',
    type: 'heading_2',
    heading_2: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: '1. Kapan Waktu Terbaik Memulai MPASI?',
          },
        },
      ],
    },
  },
  {
    id: 'b-3',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Organisasi Kesehatan Dunia (WHO) dan Ikatan Dokter Anak Indonesia (IDAI) merekomendasikan bayi mulai diberikan MPASI tepat saat berusia 6 bulan (180 hari). Tanda-tanda kesiapan bayi antara lain: kepala sudah tegak mandiri, refleks menjulurkan lidah berkurang, dan mulai tertarik pada makanan yang dimakan orang tua.',
          },
        },
      ],
    },
  },
  {
    id: 'b-4',
    type: 'callout',
    callout: {
      icon: { emoji: '💡' },
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Penting! Jangan menunda MPASI melebihi usia 6 bulan karena cadangan zat besi (iron) bawaan lahir bayi sudah mulai menurun drastis dan ASI saja tidak lagi mencukupi kebutuhan kalori hariannya.',
          },
        },
      ],
    },
  },
  {
    id: 'b-5',
    type: 'heading_2',
    heading_2: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: '2. Komposisi MPASI Menu Lengkap (Gizi Seimbang)',
          },
        },
      ],
    },
  },
  {
    id: 'b-6',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Hindari memberikan menu tunggal hanya buah atau sayur selama berhari-hari. Bayi membutuhkan menu lengkap setiap kali makan yang terdiri dari:',
          },
        },
      ],
    },
  },
  {
    id: 'b-7',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Karbohidrat Utama: Beras putih, beras merah, kentang, ubi, atau oat sebagai sumber energi aktif.',
          },
        },
      ],
    },
  },
  {
    id: 'b-8',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Protein Hewani (Prioritas Utama): Hati ayam, daging sapi cincang, telur, ikan kembung/salmon, dan ayam untuk mencegah stunting dan anemia.',
          },
        },
      ],
    },
  },
  {
    id: 'b-9',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Lemak Tambahan: Minyak kelapa, unsalted butter, minyak zaitun (EVOO), atau santan untuk menambah kalori dan penyerapan vitamin larut lemak.',
          },
        },
      ],
    },
  },
  {
    id: 'b-10',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Sayur & Buah secukupnya: Wortel, labu siam, bayam, brokoli sebagai perkenalan rasa dan mikronutrien (jangan berlebihan agar bayi tidak sembelit).',
          },
        },
      ],
    },
  },
  {
    id: 'b-11',
    type: 'quote',
    quote: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: '“Nutrisi di 1000 Hari Pertama Kehidupan (HPK) adalah investasi termahal yang orang tua berikan untuk kecerdasan masa depan anak.”',
          },
        },
      ],
    },
  },
  {
    id: 'b-12',
    type: 'heading_2',
    heading_2: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: '3. Aturan Makan yang Menyenangkan (Feeding Rules)',
          },
        },
      ],
    },
  },
  {
    id: 'b-13',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: {
            content: 'Untuk mencegah Gerakan Tutup Mulut (GTM), terapkan 3 pilar feeding rules: Jadwal teratur (makan maksimal 30 menit), Lingkungan netral tanpa gadget/distraksi, dan Prosedur yang konsisten tanpa paksaan saat anak kenyang.',
          },
        },
      ],
    },
  },
];

export const MOCK_BLOCKS: Record<string, NotionBlock[]> = {
  'mock-1': DEFAULT_MOCK_BLOCKS,
};
