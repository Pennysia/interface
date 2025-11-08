export async function GET() {
  const baseUrl = 'https://mvp.pennysia.com'
  const currentDate = new Date().toISOString()

  const staticPages = [
    '',
    '/liquidity', 
    '/swap',
    '/market',
    '/brand-kit',
    '/terms',
    '/privacy'
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
