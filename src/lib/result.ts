/**
 * Result type for railway-oriented programming
 * Oracle/Apple standard: Explicit error handling without exceptions
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Create a success result
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data }
}

/**
 * Create an error result
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * Check if result is success
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success
}

/**
 * Check if result is failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success
}

/**
 * Unwrap result or throw error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data
  }
  throw result.error
}

/**
 * Unwrap result or return default value
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.success ? result.data : defaultValue
}

/**
 * Map success value
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  return result.success
    ? success(fn(result.data))
    : result
}

/**
 * Map error value
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  return result.success
    ? result
    : failure(fn(result.error))
}

/**
 * Chain results (flatMap)
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  return result.success ? fn(result.data) : result
}

/**
 * Combine multiple results
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = []

  for (const result of results) {
    if (!result.success) {
      return result
    }
    values.push(result.data)
  }

  return success(values)
}

/**
 * Execute async function and return Result
 */
export async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const data = await fn()
    return success(data)
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Execute sync function and return Result
 */
export function tryCatchSync<T>(
  fn: () => T
): Result<T, Error> {
  try {
    const data = fn()
    return success(data)
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)))
  }
}
