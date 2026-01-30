import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions (adjust in production)

  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'nighteye',
    // Network errors
    'NetworkError',
    'Failed to fetch',
  ],

  // Filter breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Don't log console messages in production
    if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
      return null
    }
    return breadcrumb
  },

  // Enhanced error context
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
