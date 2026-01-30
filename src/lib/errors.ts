/**
 * Enterprise error handling system
 * Oracle/Apple standard: Typed errors with proper categorization
 */

export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL = 'INTERNAL',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly category: ErrorCategory
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly metadata?: Record<string, any>

  constructor(
    message: string,
    category: ErrorCategory,
    statusCode: number,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational = true,
    metadata?: Record<string, any>
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = this.constructor.name
    this.category = category
    this.severity = severity
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.metadata = metadata

    Error.captureStackTrace(this)
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', metadata?: Record<string, any>) {
    super(message, ErrorCategory.AUTHENTICATION, 401, ErrorSeverity.MEDIUM, true, metadata)
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied', metadata?: Record<string, any>) {
    super(message, ErrorCategory.AUTHORIZATION, 403, ErrorSeverity.MEDIUM, true, metadata)
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(message = 'Invalid input', metadata?: Record<string, any>) {
    super(message, ErrorCategory.VALIDATION, 400, ErrorSeverity.LOW, true, metadata)
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string, metadata?: Record<string, any>) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, ErrorCategory.NOT_FOUND, 404, ErrorSeverity.LOW, true, metadata)
  }
}

/**
 * Database errors (503)
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', metadata?: Record<string, any>) {
    super(message, ErrorCategory.DATABASE, 503, ErrorSeverity.HIGH, true, metadata)
  }
}

/**
 * External service errors (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, metadata?: Record<string, any>) {
    super(
      message || `External service '${service}' unavailable`,
      ErrorCategory.EXTERNAL_SERVICE,
      502,
      ErrorSeverity.HIGH,
      true,
      metadata
    )
  }
}

/**
 * Rate limit errors (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', metadata?: Record<string, any>) {
    super(message, ErrorCategory.RATE_LIMIT, 429, ErrorSeverity.LOW, true, metadata)
  }
}

/**
 * Internal server errors (500)
 */
export class InternalError extends AppError {
  constructor(message = 'Internal server error', metadata?: Record<string, any>) {
    super(message, ErrorCategory.INTERNAL, 500, ErrorSeverity.CRITICAL, false, metadata)
  }
}

/**
 * Convert unknown errors to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new InternalError(error.message, { originalError: error.name, stack: error.stack })
  }

  return new InternalError('Unknown error occurred', { error: String(error) })
}

/**
 * Check if error is operational (safe to expose to client)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}
