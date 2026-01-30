import { NextRequest, NextResponse } from 'next/server'
import { staffAnalyticsService } from '@/lib/services/staff-analytics.service'
import { staffPerformanceQuerySchema } from '@/lib/validation/staff.schemas'
import { safeParseQuery } from '@/lib/validation/common.schemas'
import { validateAndFilterStores, createSuccessResponse, createErrorResponse } from '@/lib/api-helpers'
import { logAPIRequest, logError } from '@/lib/logger'
import { ValidationError, normalizeError } from '@/lib/errors'

/**
 * Staff Performance Analytics API
 * Oracle/Apple Enterprise Standard: Service layer + validation + logging
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)

  try {
    // 1. Validate authentication and authorization
    const { storeIds: storeFilter, error: authError } = await validateAndFilterStores(request)
    if (authError) return authError

    // 2. Validate and parse query parameters
    const queryResult = safeParseQuery(staffPerformanceQuerySchema, searchParams)

    if (!queryResult.success) {
      throw new ValidationError(queryResult.error)
    }

    const query = queryResult.data

    // 3. Get date range
    const { startDate, endDate } = staffAnalyticsService['getDateRangeFilter'](query.days)

    // 4. Build filters
    const filters = {
      storeIds: storeFilter,
      startDate,
      endDate,
      employeeId: query.employeeId,
      minRevenue: query.minRevenue,
      minOrders: query.minOrders,
    }

    // 5. Route to appropriate service method based on view
    let result

    if (query.view === 'summary') {
      result = await staffAnalyticsService.getStaffPerformance(filters)
    } else if (query.view === 'daily') {
      result = await staffAnalyticsService.getStaffDailyPerformance(filters)
    } else if (query.view === 'leaderboard') {
      result = await staffAnalyticsService.getStaffLeaderboard(filters, {
        limit: query.limit,
        sortBy: query.sortBy,
      })
    } else if (query.view === 'employee' && query.employeeId) {
      const employeeResult = await staffAnalyticsService.getEmployeePerformance(
        query.employeeId,
        filters
      )
      result = employeeResult.success
        ? { success: true, data: [employeeResult.data] }
        : employeeResult
    } else {
      throw new ValidationError('Invalid view parameter or missing employeeId for employee view')
    }

    // 6. Handle service result
    if (!result.success) {
      throw result.error
    }

    // 7. Log successful request
    const duration = Date.now() - startTime
    logAPIRequest({
      method: 'GET',
      path: '/api/staff',
      storeIds: storeFilter,
      duration,
      status: 200,
    })

    // 8. Return success response with caching
    return createSuccessResponse(result.data, 60)

  } catch (error) {
    // Error handling
    const appError = normalizeError(error)
    const duration = Date.now() - startTime

    logError({
      context: 'StaffAPI.GET',
      error: appError,
      metadata: {
        duration,
        view: searchParams.get('view'),
      },
    })

    logAPIRequest({
      method: 'GET',
      path: '/api/staff',
      duration,
      status: appError.statusCode,
    })

    return createErrorResponse(appError.message, appError.statusCode)
  }
}
