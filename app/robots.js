export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rotaractsltc.vercel.app';

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
