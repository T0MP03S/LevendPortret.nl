import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@levendportret/auth', '@levendportret/db'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Dev-friendly CSP (relaxes for Next dev tooling)
          {
            key: 'Content-Security-Policy',
            value: (
              process.env.NODE_ENV === 'production'
                ? [
                    "default-src 'self'",
                    "img-src 'self' data: https:",
                    "font-src 'self' data:",
                    "style-src 'self' 'unsafe-inline'",
                    "script-src 'self' 'unsafe-inline' https://plausible.io",
                    "frame-src 'self' https://player.vimeo.com",
                    "connect-src 'self' https://plausible.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                  ]
                : [
                    "default-src 'self'",
                    "img-src 'self' data: blob: https:",
                    "font-src 'self' data: https://fonts.gstatic.com https://use.typekit.net",
                    "style-src 'self' 'unsafe-inline' https:",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https:",
                    "frame-src 'self' https://player.vimeo.com https://www.google.com",
                    "connect-src 'self' http://localhost:* ws: https:",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                  ]
            ).join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=15552000; includeSubDomains; preload' }]
            : []),
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, { silent: true });
