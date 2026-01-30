import pino from 'pino'

/**
 * Enterprise-grade structured logging
 * Oracle/Apple standard: Structured logs for observability
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info')

export const logger = pino({
  level: logLevel,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
  ...(!isDevelopment && {
    // Production: JSON format for log aggregation
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
  }),
})

/**
 * Create a child logger with context
 * Usage: const log = createLogger('StaffService')
 */
export function createLogger(context: string) {
  return logger.child({ context })
}

/**
 * Log API request
 */
export function logAPIRequest(params: {
  method: string
  path: string
  userId?: string
  storeIds?: string[]
  duration?: number
  status?: number
}) {
  logger.info({
    type: 'api_request',
    method: params.method,
    path: params.path,
    userId: params.userId,
    storeIds: params.storeIds,
    duration: params.duration,
    status: params.status,
  })
}

/**
 * Log database query
 */
export function logDBQuery(params: {
  table: string
  operation: string
  duration: number
  rowCount?: number
  filters?: Record<string, any>
}) {
  logger.debug({
    type: 'db_query',
    table: params.table,
    operation: params.operation,
    duration: params.duration,
    rowCount: params.rowCount,
    filters: params.filters,
  })
}

/**
 * Log error with context
 */
export function logError(params: {
  context: string
  error: Error | unknown
  userId?: string
  metadata?: Record<string, any>
}) {
  logger.error({
    type: 'error',
    context: params.context,
    error: params.error instanceof Error ? {
      message: params.error.message,
      stack: params.error.stack,
      name: params.error.name,
    } : params.error,
    userId: params.userId,
    metadata: params.metadata,
  })
}

/**
 * Log cache operation
 */
export function logCache(params: {
  operation: 'hit' | 'miss' | 'set' | 'invalidate'
  key: string
  duration?: number
}) {
  logger.debug({
    type: 'cache',
    operation: params.operation,
    key: params.key,
    duration: params.duration,
  })
}
