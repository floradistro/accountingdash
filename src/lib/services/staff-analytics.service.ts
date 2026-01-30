import { BaseService, QueryFilters } from './base.service'
import { Result, success, failure } from '@/lib/result'
import { DatabaseError, NotFoundError } from '@/lib/errors'
import type { StaffPerformance, StaffDailyPerformance, StaffLeaderboard } from '@/lib/supabase'

/**
 * Staff Analytics Service
 * Oracle/Apple standard: Business logic separated from API routes
 */

export interface StaffPerformanceFilters extends QueryFilters {
  employeeId?: string
  minRevenue?: number
  minOrders?: number
}

export interface StaffLeaderboardOptions {
  limit?: number
  sortBy?: 'revenue' | 'orders' | 'profit' | 'aov'
}

export class StaffAnalyticsService extends BaseService {
  constructor() {
    super('StaffAnalyticsService')
  }

  /**
   * Get staff performance summary
   * Note: Uses v_staff_daily_performance view with date filtering
   */
  async getStaffPerformance(
    filters: StaffPerformanceFilters
  ): Promise<Result<StaffPerformance[], DatabaseError>> {
    this.logger.info({ filters }, 'Fetching staff performance')

    // Query v_staff_daily_performance and aggregate client-side
    // Use admin client to bypass RLS since we're filtering by storeIds at app layer
    const result = await this.executeQuery<StaffPerformance[]>(
      'v_staff_daily_performance',
      'aggregateStaffPerformance',
      async (client) => {
        let query = client
          .from('v_staff_daily_performance')
          .select('*')

        // Apply filters
        if (filters.storeIds && filters.storeIds.length > 0) {
          query = query.in('store_id', filters.storeIds)
        }
        if (filters.startDate) {
          query = query.gte('sale_date', filters.startDate)
        }
        if (filters.endDate) {
          query = query.lte('sale_date', filters.endDate)
        }
        if (filters.employeeId) {
          query = query.eq('employee_id', filters.employeeId)
        }

        // DEBUG: Log the actual filters being applied
        this.logger.debug({
          storeIds: filters.storeIds,
          startDate: filters.startDate,
          endDate: filters.endDate,
          employeeId: filters.employeeId
        }, 'Query filters before execution')

        const { data, error } = await query

        // DEBUG: Log what Supabase returned
        this.logger.debug({
          rawDataCount: data?.length || 0,
          firstRow: data?.[0],
          hasError: !!error,
          errorDetails: error
        }, 'Raw Supabase query result')

        if (error) return { data: null, error }

        // Client-side aggregation by employee
        const aggregated: Record<string, any> = {}

        data?.forEach(row => {
          const key = row.employee_id
          if (!aggregated[key]) {
            aggregated[key] = {
              store_id: row.store_id,
              employee_id: row.employee_id,
              employee_name: '', // Will be filled from users table
              employee_email: '',
              days_worked: new Set(),
              total_orders: 0,
              total_revenue: 0,
              total_profit: 0,
              sale_dates: [],
            }
          }
          aggregated[key].days_worked.add(row.sale_date)
          aggregated[key].total_orders += Number(row.total_orders || 0)
          aggregated[key].total_revenue += Number(row.total_revenue || 0)
          aggregated[key].total_profit += Number(row.total_profit || 0)
          aggregated[key].sale_dates.push(row.sale_date)
        })

        // Convert to array and calculate derived fields
        const result: StaffPerformance[] = Object.values(aggregated).map((agg: any) => ({
          store_id: agg.store_id,
          employee_id: agg.employee_id,
          employee_name: agg.employee_name,
          employee_email: agg.employee_email,
          days_worked: agg.days_worked.size,
          total_orders: agg.total_orders,
          total_revenue: agg.total_revenue,
          total_profit: agg.total_profit,
          avg_order_value: agg.total_orders > 0 ? agg.total_revenue / agg.total_orders : 0,
          avg_daily_revenue: agg.days_worked.size > 0 ? agg.total_revenue / agg.days_worked.size : 0,
          avg_daily_orders: agg.days_worked.size > 0 ? agg.total_orders / agg.days_worked.size : 0,
          first_sale_date: agg.sale_dates.sort()[0],
          last_sale_date: agg.sale_dates.sort()[agg.sale_dates.length - 1],
        }))

        // Get employee names from users table
        const employeeIds = result.map(r => r.employee_id)
        if (employeeIds.length > 0) {
          const { data: users } = await client
            .from('users')
            .select('id, first_name, last_name, email')
            .in('id', employeeIds)

          users?.forEach(user => {
            const staff = result.find(r => r.employee_id === user.id)
            if (staff) {
              staff.employee_name = `${user.first_name} ${user.last_name}`
              staff.employee_email = user.email
            }
          })
        }

        // Sort by revenue
        result.sort((a, b) => b.total_revenue - a.total_revenue)

        return { data: result, error: null }
      },
      true // Use admin client to bypass RLS
    )

    if (!result.success) {
      return result
    }

    // Apply additional filters
    let data = result.data

    if (filters.minRevenue) {
      data = data.filter(s => Number(s.total_revenue) >= filters.minRevenue!)
    }

    if (filters.minOrders) {
      data = data.filter(s => Number(s.total_orders) >= filters.minOrders!)
    }

    this.logger.info({ count: data.length }, 'Staff performance fetched')
    return success(data)
  }

  /**
   * Get daily staff performance (time series)
   */
  async getStaffDailyPerformance(
    filters: StaffPerformanceFilters
  ): Promise<Result<StaffDailyPerformance[], DatabaseError>> {
    this.logger.info({ filters }, 'Fetching staff daily performance')

    const result = await this.fetchFromView<StaffDailyPerformance>(
      'v_staff_daily_performance',
      filters,
      { orderBy: { column: 'sale_date', ascending: false } },
      true // Use admin client to bypass RLS
    )

    if (!result.success) {
      return result
    }

    this.logger.info({ count: result.data.length }, 'Staff daily performance fetched')
    return result
  }

  /**
   * Get staff leaderboard with rankings
   * Uses getStaffPerformance and adds rankings
   */
  async getStaffLeaderboard(
    filters: StaffPerformanceFilters,
    options: StaffLeaderboardOptions = {}
  ): Promise<Result<StaffLeaderboard[], DatabaseError>> {
    this.logger.info({ filters, options }, 'Fetching staff leaderboard')

    // Get staff performance data
    const perfResult = await this.getStaffPerformance(filters)
    if (!perfResult.success) {
      return perfResult
    }

    // Convert to leaderboard with rankings
    const data = perfResult.data

    // Sort and rank by different metrics
    const leaderboard: StaffLeaderboard[] = data.map((staff, idx) => ({
      ...staff,
      revenue_rank: 0,
      orders_rank: 0,
      aov_rank: 0,
      profit_rank: 0,
    }))

    // Calculate rankings
    const sortedByRevenue = [...leaderboard].sort((a, b) => b.total_revenue - a.total_revenue)
    sortedByRevenue.forEach((staff, idx) => {
      const original = leaderboard.find(s => s.employee_id === staff.employee_id)
      if (original) original.revenue_rank = idx + 1
    })

    const sortedByOrders = [...leaderboard].sort((a, b) => b.total_orders - a.total_orders)
    sortedByOrders.forEach((staff, idx) => {
      const original = leaderboard.find(s => s.employee_id === staff.employee_id)
      if (original) original.orders_rank = idx + 1
    })

    const sortedByAOV = [...leaderboard].sort((a, b) => b.avg_order_value - a.avg_order_value)
    sortedByAOV.forEach((staff, idx) => {
      const original = leaderboard.find(s => s.employee_id === staff.employee_id)
      if (original) original.aov_rank = idx + 1
    })

    const sortedByProfit = [...leaderboard].sort((a, b) => b.total_profit - a.total_profit)
    sortedByProfit.forEach((staff, idx) => {
      const original = leaderboard.find(s => s.employee_id === staff.employee_id)
      if (original) original.profit_rank = idx + 1
    })

    // Sort by requested metric
    if (options.sortBy === 'orders') {
      leaderboard.sort((a, b) => a.orders_rank - b.orders_rank)
    } else if (options.sortBy === 'profit') {
      leaderboard.sort((a, b) => a.profit_rank - b.profit_rank)
    } else if (options.sortBy === 'aov') {
      leaderboard.sort((a, b) => a.aov_rank - b.aov_rank)
    } else {
      leaderboard.sort((a, b) => a.revenue_rank - b.revenue_rank)
    }

    // Apply limit
    const limited = leaderboard.slice(0, options.limit || 20)

    this.logger.info({ count: limited.length }, 'Staff leaderboard fetched')
    return success(limited)
  }

  /**
   * Get individual staff member performance
   */
  async getEmployeePerformance(
    employeeId: string,
    filters: StaffPerformanceFilters
  ): Promise<Result<StaffPerformance, DatabaseError | NotFoundError>> {
    this.logger.info({ employeeId, filters }, 'Fetching employee performance')

    // Use getStaffPerformance with employee filter for proper date range handling
    const allFilters = { ...filters, employeeId }
    const result = await this.getStaffPerformance(allFilters)

    if (!result.success) {
      return result
    }

    if (result.data.length === 0) {
      return failure(new NotFoundError('Employee performance', employeeId))
    }

    return success(result.data[0])
  }

  /**
   * Get staff performance metrics (aggregated)
   */
  async getStaffMetrics(
    filters: StaffPerformanceFilters
  ): Promise<Result<{
    totalStaff: number
    totalRevenue: number
    totalOrders: number
    totalProfit: number
    avgRevenuePerStaff: number
    avgOrdersPerStaff: number
    avgOrderValue: number
  }, DatabaseError>> {
    this.logger.info({ filters }, 'Calculating staff metrics')

    const result = await this.getStaffPerformance(filters)

    if (!result.success) {
      return result
    }

    const data = result.data

    const metrics = {
      totalStaff: data.length,
      totalRevenue: data.reduce((sum, s) => sum + Number(s.total_revenue || 0), 0),
      totalOrders: data.reduce((sum, s) => sum + Number(s.total_orders || 0), 0),
      totalProfit: data.reduce((sum, s) => sum + Number(s.total_profit || 0), 0),
      avgRevenuePerStaff: 0,
      avgOrdersPerStaff: 0,
      avgOrderValue: 0,
    }

    if (metrics.totalStaff > 0) {
      metrics.avgRevenuePerStaff = metrics.totalRevenue / metrics.totalStaff
      metrics.avgOrdersPerStaff = metrics.totalOrders / metrics.totalStaff
    }

    if (metrics.totalOrders > 0) {
      metrics.avgOrderValue = metrics.totalRevenue / metrics.totalOrders
    }

    this.logger.info({ metrics }, 'Staff metrics calculated')
    return success(metrics)
  }

  /**
   * Get staff performance trend (comparing periods)
   */
  async getStaffPerformanceTrend(
    employeeId: string,
    currentPeriodFilters: StaffPerformanceFilters,
    previousPeriodFilters: StaffPerformanceFilters
  ): Promise<Result<{
    current: StaffPerformance
    previous: StaffPerformance
    revenueChange: number
    revenueChangePercent: number
    ordersChange: number
    ordersChangePercent: number
  }, DatabaseError | NotFoundError>> {
    this.logger.info({ employeeId }, 'Calculating staff performance trend')

    const [currentResult, previousResult] = await Promise.all([
      this.getEmployeePerformance(employeeId, currentPeriodFilters),
      this.getEmployeePerformance(employeeId, previousPeriodFilters),
    ])

    if (!currentResult.success) return currentResult
    if (!previousResult.success) return previousResult

    const current = currentResult.data
    const previous = previousResult.data

    const revenueChange = Number(current.total_revenue) - Number(previous.total_revenue)
    const revenueChangePercent = Number(previous.total_revenue) > 0
      ? (revenueChange / Number(previous.total_revenue)) * 100
      : 0

    const ordersChange = Number(current.total_orders) - Number(previous.total_orders)
    const ordersChangePercent = Number(previous.total_orders) > 0
      ? (ordersChange / Number(previous.total_orders)) * 100
      : 0

    return success({
      current,
      previous,
      revenueChange,
      revenueChangePercent,
      ordersChange,
      ordersChangePercent,
    })
  }
}

// Singleton instance
export const staffAnalyticsService = new StaffAnalyticsService()
