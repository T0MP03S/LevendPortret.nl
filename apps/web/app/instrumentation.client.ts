import * as Sentry from '@sentry/nextjs';

export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    debug: process.env.NODE_ENV === 'development',
  });
}
