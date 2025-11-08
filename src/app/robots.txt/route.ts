export async function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: https://mvp.pennysia.com/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}
