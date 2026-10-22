import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Ganti dengan domain produksi Anda saat deploy ke Vercel (contoh: https://nutribayi.vercel.app atau domain custom)
  site: process.env.SITE_URL || 'https://nutribayi.vercel.app',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  compressHTML: true,
  build: {
    format: 'directory',
  },
});
