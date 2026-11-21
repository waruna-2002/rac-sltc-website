/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;",
              "style-src 'self' 'unsafe-inline' https:;",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https:;",
              "font-src 'self' data: https:;",
              "connect-src 'self' https: wss:;",
              "media-src 'self' data: blob: https:;",
              "worker-src 'self' blob:;",
              "form-action 'self';",
              "frame-ancestors 'none';",
              "base-uri 'self';",
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
