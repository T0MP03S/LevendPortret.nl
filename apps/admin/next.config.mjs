export default {
  reactStrictMode: true,
  env: {
    AUTH_MODE: 'admin',
  },
  transpilePackages: ['@levendportret/auth', '@levendportret/db'],
  async headers() {
    const r2Host = (() => {
      try {
        return new URL(process.env.R2_ENDPOINT || '').host;
      } catch {
        return '';
      }
    })();
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
                    "img-src 'self' data: blob: https:",
                    "font-src 'self' data: https://fonts.gstatic.com",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "script-src 'self' 'unsafe-inline'",
                    (r2Host ? `connect-src 'self' https://${r2Host}` : "connect-src 'self'"),
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
