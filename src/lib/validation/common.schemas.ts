import { z } from 'zod'

/**
 * Common validation schemas
 * Oracle/Apple standard: Schema-based validation for all inputs
 */

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Date validation (YYYY-MM-DD)
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)')

// Store ID (optional, can be 'all')
export const storeIdSchema = z.union([
  z.literal('all'),
  uuidSchema,
]).optional()

// Days parameter (1-365)
export const daysSchema = z.number()
  .int('Days must be an integer')
  .min(1, 'Days must be at least 1')
  .max(365, 'Days cannot exceed 365')
  .default(30)

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).optional(),
})

// Sort options
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')

// Date range
export const dateRangeSchema = z.object({
  dateFrom: dateSchema,
  dateTo: dateSchema,
}).refine(
  (data) => new Date(data.dateFrom) <= new Date(data.dateTo),
  { message: 'dateFrom must be before or equal to dateTo' }
)

// Optional date range
export const optionalDateRangeSchema = z.object({
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
}).optional()

// View parameter (common pattern)
export const viewSchema = (allowedViews: string[]) =>
  z.enum(allowedViews as [string, ...string[]]).default(allowedViews[0])

/**
 * Base query parameters for analytics endpoints
 */
export const baseAnalyticsQuerySchema = z.object({
  storeId: storeIdSchema,
  days: daysSchema,
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
})

export type BaseAnalyticsQuery = z.infer<typeof baseAnalyticsQuerySchema>

/**
 * Helper to parse query params from URLSearchParams
 */
export function parseQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, any> = {}

  searchParams.forEach((value, key) => {
    // Parse numbers
    if (!isNaN(Number(value)) && value !== '') {
      params[key] = Number(value)
    } else {
      params[key] = value
    }
  })

  return schema.parse(params)
}

/**
 * Safe parse with detailed error messages
 */
export function safeParseQuery<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const data = parseQueryParams(schema, searchParams)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { success: false, error: `Validation failed: ${messages}` }
    }
    return { success: false, error: 'Invalid query parameters' }
  }
}
