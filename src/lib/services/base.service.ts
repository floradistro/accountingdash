import { createClient } from '@/lib/supabase/server'
import { createLogger, logDBQuery } from '@/lib/logger'
import { DatabaseError } from '@/lib/errors'
import { Result, success, failure } from '@/lib/result'
import { reportError, addBreadcrumb } from '@/lib/monitoring/error-reporter'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Base service class for data access
 * Oracle/Apple standard: Abstracted data layer with observability
 */

export interface QueryFilters {
  storeIds?: string[]
  locationIds?: string[]
  startDate?: string
  endDate?: string
  [key: string]: any
}

export interface QueryOptions {
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
}

export abstract class BaseService {
  protected logger: ReturnType<typeof createLogger>
  protected serviceName: string

  constructor(serviceName: string) {
    this.serviceName = serviceName
    this.logger = createLogger(serviceName)
  }

  /**
   * Get Supabase client (async because it uses server-side auth)
   */
  protected async getClient(): Promise<SupabaseClient> {
    return await createClient()
  }

  /**
   * Get Supabase admin client (bypasses RLS for analytics)
   * Use this for aggregated analytics queries where RLS is already
   * enforced at the application layer via store filtering
   */
  protected async getAdminClient(): Promise<SupabaseClient> {
    this.logger.debug({
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20)
    }, 'Creating admin client')

    const { createClient } = await import('@supabase/supabase-js')
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  /**
   * Execute a query with observability
   */
  protected async executeQuery<T>(
    table: string,
    operation: string,
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
    useAdminClient = false
  ): Promise<Result<T, DatabaseError>> {
    const startTime = Date.now()

    this.logger.debug({ table, operation, useAdminClient }, 'executeQuery called')

    try {
      const client = useAdminClient ? await this.getAdminClient() : await this.getClient()
      const { data, error } = await queryFn(client)

      const duration = Date.now() - startTime

      if (error) {
        this.logger.error({
          operation: `${this.serviceName}.${operation}`,
          table,
          error: error.message,
          duration,
        })

        const dbError = new DatabaseError(`Failed to ${operation} from ${table}`, {
          table,
          operation,
          error: error.message,
          code: error.code,
        })

        // Report to Sentry with context
        reportError(dbError, {
          feature: this.serviceName,
          action: operation,
          table,
          duration,
        })

        return failure(dbError)
      }

      logDBQuery({
        table,
        operation,
        duration,
        rowCount: Array.isArray(data) ? data.length : data ? 1 : 0,
      })

      if (data === null) {
        return failure(
          new DatabaseError(`No data returned from ${table}`, {
            table,
            operation,
          })
        )
      }

      return success(data)
    } catch (error) {
      const duration = Date.now() - startTime

      this.logger.error({
        operation: `${this.serviceName}.${operation}`,
        table,
        error: error instanceof Error ? error.message : String(error),
        duration,
      })

      return failure(
        new DatabaseError(`Database operation failed: ${operation}`, {
          table,
          operation,
          error: error instanceof Error ? error.message : String(error),
        })
      )
    }
  }

  /**
   * Fetch from a view with filters
   */
  protected async fetchFromView<T>(
    viewName: string,
    filters: QueryFilters = {},
    options: QueryOptions = {},
    useAdminClient = false
  ): Promise<Result<T[], DatabaseError>> {
    return this.executeQuery<T[]>(
      viewName,
      'fetch',
      async (client) => {
        let query = client.from(viewName).select('*')

        // Apply store filter
        if (filters.storeIds && filters.storeIds.length > 0) {
          query = query.in('store_id', filters.storeIds)
        }

        // Apply location filter
        if (filters.locationIds && filters.locationIds.length > 0) {
          query = query.in('location_id', filters.locationIds)
        }

        // Apply date filters
        // Different views have different date column names:
        // - v_staff_daily_performance has 'sale_date'
        // - v_staff_performance and v_staff_leaderboard have 'last_sale_date' (aggregated)
        const isAggregatedView = viewName.includes('performance') && !viewName.includes('daily')
        const dateColumn = isAggregatedView || viewName.includes('leaderboard')
          ? 'last_sale_date'
          : 'sale_date'

        if (filters.startDate) {
          query = query.gte(dateColumn, filters.startDate)
        }
        if (filters.endDate) {
          query = query.lte(dateColumn, filters.endDate)
        }

        // Apply custom filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && !['storeIds', 'locationIds', 'startDate', 'endDate'].includes(key)) {
            query = query.eq(key, value)
          }
        })

        // Apply ordering
        if (options.orderBy) {
          query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false })
        }

        // Apply pagination
        if (options.limit) {
          query = query.limit(options.limit)
        }
        if (options.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 100) - 1)
        }

        return await query
      },
      useAdminClient
    )
  }

  /**
   * Fetch a single record by ID
   */
  protected async fetchById<T>(
    viewName: string,
    id: string,
    idColumn = 'id'
  ): Promise<Result<T, DatabaseError>> {
    return this.executeQuery<T>(
      viewName,
      'fetchById',
      async (client) => {
        const { data, error } = await client
          .from(viewName)
          .select('*')
          .eq(idColumn, id)
          .single()

        return { data, error }
      }
    )
  }

  /**
   * Aggregate data (sum, avg, etc.)
   */
  protected async aggregate<T>(
    viewName: string,
    filters: QueryFilters = {},
    aggregations: Record<string, string> = {}
  ): Promise<Result<T, DatabaseError>> {
    // Supabase doesn't support aggregations directly in the client
    // This would require either a database function or client-side aggregation
    // For now, fetch data and aggregate client-side
    const result = await this.fetchFromView<any>(viewName, filters)

    if (!result.success) {
      return result
    }

    // Client-side aggregation
    const aggregated: any = {}
    const data = result.data

    Object.entries(aggregations).forEach(([key, operation]) => {
      if (operation === 'sum') {
        aggregated[key] = data.reduce((sum: number, row: any) => sum + Number(row[key] || 0), 0)
      } else if (operation === 'avg') {
        const sum = data.reduce((sum: number, row: any) => sum + Number(row[key] || 0), 0)
        aggregated[key] = data.length > 0 ? sum / data.length : 0
      } else if (operation === 'count') {
        aggregated[key] = data.length
      } else if (operation === 'max') {
        aggregated[key] = Math.max(...data.map((row: any) => Number(row[key] || 0)))
      } else if (operation === 'min') {
        aggregated[key] = Math.min(...data.map((row: any) => Number(row[key] || 0)))
      }
    })

    return success(aggregated as T)
  }

  /**
   * Get date range filter
   */
  protected getDateRangeFilter(days: number): { startDate: string; endDate: string } {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }
}
