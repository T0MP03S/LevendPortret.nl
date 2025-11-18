export default {
  reactStrictMode: true,
  transpilePackages: ['@levendportret/auth', '@levendportret/db'],
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const fontSrc = isProd ? "font-src 'self' data:" : "font-src 'self' data: https://fonts.gstatic.com";
    const scriptSrc = isProd ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:";
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https:",
              fontSrc,
              "style-src 'self' 'unsafe-inline' https:",
              scriptSrc,
              "frame-src 'self' https://player.vimeo.com https://www.google.com",
              isProd ? "connect-src 'self'" : "connect-src 'self' http://localhost:* ws: https:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains; preload' }] : []),
        ],
      },
    ];
  },
};
