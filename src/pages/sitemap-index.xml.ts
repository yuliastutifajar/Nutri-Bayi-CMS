import type { APIRoute } from 'astro';
import { getPosts } from '../lib/notion';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const siteUrl = (site?.toString() || 'https://nutribayi.vercel.app').replace(/\/$/, '');

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'weekly' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
  ];

  const staticEntries = staticPages
    .map(
      (page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n');

  const postEntries = posts
    .map((post) => {
      let lastmod = '';
      try {
        lastmod = `\n    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>`;
      } catch {
        lastmod = '';
      }
      return `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>${lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${postEntries}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
