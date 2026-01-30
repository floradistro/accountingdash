import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions (adjust in production)

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Server-specific options
  debug: false,

  // Enhanced error context
  integrations: [
    Sentry.httpIntegration(),
  ],

  // Filter sensitive data
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(hint.originalException || hint.syntheticException)
      return null
    }

    // Remove sensitive data from error context
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }

    return event
  },
})
