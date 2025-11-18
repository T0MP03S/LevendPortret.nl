export default {
  reactStrictMode: true,
  transpilePackages: ['@levendportret/auth', '@levendportret/db', '@levendportret/ui'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: (
              process.env.NODE_ENV === 'production'
                ? [
                    "default-src 'self'",
                    "img-src 'self' data: https:",
                    "font-src 'self' data:",
                    "style-src 'self' 'unsafe-inline'",
                    "script-src 'self' 'unsafe-inline'",
                    "connect-src 'self'",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                  ]
                : [
                    "default-src 'self'",
                    "img-src 'self' data: blob: https:",
                    "font-src 'self' data: https://fonts.gstatic.com",
                    "style-src 'self' 'unsafe-inline' https:",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:",
                    "connect-src 'self' http://localhost:* ws: https:",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                  ]
            ).join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ];
  },
};
