import { NextRequest, NextResponse } from 'next/server'
import { getUserStore } from './get-user-store'

/**
 * Validates user access and returns filtered store IDs
 * Reusable across all accounting API routes
 */
export async function validateAndFilterStores(
  request: NextRequest
): Promise<{ storeIds: string[]; error?: NextResponse }> {
  const result = await getUserStore()

  if ('error' in result) {
    return {
      storeIds: [],
      error: NextResponse.json(
        { error: result.error },
        { status: result.status }
      ),
    }
  }

  if (!result.storeIds || result.storeIds.length === 0) {
    return {
      storeIds: [],
      error: NextResponse.json(
        { error: 'No stores assigned' },
        { status: 403 }
      ),
    }
  }

  const { searchParams } = new URL(request.url)
  const requestedStoreId = searchParams.get('storeId')

  let storeFilter: string[]

  if (requestedStoreId && requestedStoreId !== 'all') {
    // Validate user has access to requested store
    if (!result.storeIds.includes(requestedStoreId)) {
      return {
        storeIds: [],
        error: NextResponse.json(
          { error: 'Access denied to this store' },
          { status: 403 }
        ),
      }
    }
    storeFilter = [requestedStoreId]
  } else {
    storeFilter = result.storeIds
  }

  return { storeIds: storeFilter }
}

/**
 * Standard error response formatter
 */
export function createErrorResponse(message: string, status: number = 500): NextResponse {
  console.error(`API Error (${status}):`, message)
  return NextResponse.json({ error: message }, { status })
}

/**
 * Standard success response formatter with caching headers
 */
export function createSuccessResponse<T>(
  data: T,
  cacheSeconds: number = 0
): NextResponse {
  const response = NextResponse.json(data)

  if (cacheSeconds > 0) {
    response.headers.set(
      'Cache-Control',
      `private, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`
    )
  }

  return response
}

/**
 * Extract date range from query params with defaults
 */
export function getDateRangeFromParams(
  searchParams: URLSearchParams,
  defaultDays: number = 30
): { dateFrom: string; dateTo: string } {
  const today = new Date()
  const defaultFrom = new Date()
  defaultFrom.setDate(defaultFrom.getDate() - defaultDays)

  const dateFrom =
    searchParams.get('dateFrom') || defaultFrom.toISOString().split('T')[0]
  const dateTo = searchParams.get('dateTo') || today.toISOString().split('T')[0]

  return { dateFrom, dateTo }
}

/**
 * Extract days parameter with validation
 */
export function getDaysFromParams(
  searchParams: URLSearchParams,
  defaultDays: number = 30,
  maxDays: number = 365
): number {
  const daysParam = searchParams.get('days')
  if (!daysParam) return defaultDays

  const days = parseInt(daysParam, 10)
  if (isNaN(days) || days < 1) return defaultDays
  if (days > maxDays) return maxDays

  return days
}
