export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rotaract.sltc.ac.lk';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
