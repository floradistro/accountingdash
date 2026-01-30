import * as Sentry from '@sentry/nextjs'

export interface ErrorContext {
  userId?: string
  storeId?: string
  locationId?: string
  feature?: string
  action?: string
  [key: string]: any
}

/**
 * Reports errors to Sentry with enriched context
 */
export function reportError(error: Error, context?: ErrorContext) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error)
    console.error('Context:', context)
    return
  }

  Sentry.withScope((scope) => {
    if (context) {
      // Add user context
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }

      // Add tags for filtering
      if (context.feature) {
        scope.setTag('feature', context.feature)
      }
      if (context.action) {
        scope.setTag('action', context.action)
      }
      if (context.storeId) {
        scope.setTag('storeId', context.storeId)
      }
      if (context.locationId) {
        scope.setTag('locationId', context.locationId)
      }

      // Add all context as extra data
      scope.setContext('error_context', context)
    }

    Sentry.captureException(error)
  })
}

/**
 * Reports a message to Sentry (for non-error issues)
 */
export function reportMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level}]`, message, context)
    return
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('message_context', context)
    }
    Sentry.captureMessage(message, level)
  })
}

/**
 * Sets user context for all future events
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

/**
 * Clears user context (e.g., on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null)
}

/**
 * Adds a breadcrumb for debugging context
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
  })
}
