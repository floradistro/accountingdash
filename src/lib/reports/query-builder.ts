/**
 * Report Query Builder
 * Generates optimized SQL queries for custom reports
 */

import { SupabaseClient } from '@supabase/supabase-js'

export type Dimension =
  | 'date'
  | 'location'
  | 'store'
  | 'category'
  | 'product'
  | 'employee'
  | 'channel'
  | 'payment_method'
  | 'order_type'
  | 'supplier'
  | 'po_number'
  | 'po_status'
  | 'payment_status'

export type Metric =
  | 'orders'
  | 'revenue'
  | 'cost'
  | 'profit'
  | 'margin'
  | 'tax'
  | 'discounts'
  | 'net_revenue'
  | 'quantity'
  | 'avg_order_value'
  | 'po_count'
  | 'po_total'
  | 'po_paid'
  | 'po_outstanding'
  | 'po_items'

export type DateGranularity = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type DataSource = 'sales' | 'purchase_orders'

export interface ReportQuery {
  dataSource?: DataSource
  dimensions: Dimension[]
  metrics: Metric[]
  dateGranularity?: DateGranularity
  dateFrom?: string
  dateTo?: string
  storeId?: string
  locationId?: string
  limit?: number
}

export interface ReportResult {
  rows: Record<string, any>[]
  totals: Record<string, number>
  metadata: {
    rowCount: number
    executionTime: number
  }
}

export class ReportQueryBuilder {
  /**
   * Build and execute a custom report query
   */
  static async execute(
    supabase: SupabaseClient,
    query: ReportQuery
  ): Promise<ReportResult> {
    const startTime = Date.now()

    // Select base view based on data source
    const dataSource = query.dataSource || 'sales'
    const baseView = dataSource === 'purchase_orders'
      ? 'v_purchase_order_detail'
      : 'v_daily_sales_detail'

    const dateColumn = dataSource === 'purchase_orders' ? 'order_date' : 'sale_date'

    let sqlQuery = supabase.from(baseView).select('*')

    // Apply date filters
    if (query.dateFrom) {
      sqlQuery = sqlQuery.gte(dateColumn, query.dateFrom)
    }
    if (query.dateTo) {
      sqlQuery = sqlQuery.lte(dateColumn, query.dateTo)
    }

    // Apply store filter
    if (query.storeId && query.storeId !== 'all') {
      sqlQuery = sqlQuery.eq('store_id', query.storeId)
    }

    // Apply location filter
    if (query.locationId && query.locationId !== 'all') {
      sqlQuery = sqlQuery.eq('location_id', query.locationId)
    }

    // Apply limit
    const limit = Math.min(query.limit || 10000, 10000)
    sqlQuery = sqlQuery.limit(limit)

    // Execute query
    const { data, error } = await sqlQuery

    if (error) {
      throw new Error(`Query failed: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return {
        rows: [],
        totals: {},
        metadata: {
          rowCount: 0,
          executionTime: Date.now() - startTime,
        },
      }
    }

    // Process and aggregate results based on dimensions
    const aggregated = await this.aggregateData(
      supabase,
      data,
      query.dimensions,
      query.metrics,
      query.dateGranularity
    )

    const executionTime = Date.now() - startTime

    return {
      rows: aggregated.rows,
      totals: aggregated.totals,
      metadata: {
        rowCount: aggregated.rows.length,
        executionTime,
      },
    }
  }

  /**
   * Aggregate raw data based on dimensions and metrics
   */
  private static async aggregateData(
    supabase: SupabaseClient,
    data: any[],
    dimensions: Dimension[],
    metrics: Metric[],
    dateGranularity?: DateGranularity
  ): Promise<{ rows: Record<string, any>[]; totals: Record<string, number> }> {
    // Fetch lookup data for dimension resolution
    const lookups = await this.fetchLookupData(supabase, data, dimensions)

    // Group data by dimensions
    const grouped = new Map<string, any[]>()

    for (const row of data) {
      const key = this.buildGroupKey(row, dimensions, dateGranularity, lookups)
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(row)
    }

    // Calculate metrics for each group
    const rows: Record<string, any>[] = []
    const totals: Record<string, number> = {}

    // Initialize totals
    metrics.forEach((metric) => {
      totals[metric] = 0
    })

    for (const [key, groupData] of grouped.entries()) {
      const row: Record<string, any> = {}

      // Parse key back to dimension values
      const keyParts = key.split('|')
      dimensions.forEach((dim, idx) => {
        row[dim] = keyParts[idx] || 'Unknown'
      })

      // Calculate metrics
      metrics.forEach((metric) => {
        const value = this.calculateMetric(metric, groupData)
        row[metric] = value
        totals[metric] += value
      })

      rows.push(row)
    }

    // Sort rows by first dimension
    rows.sort((a, b) => {
      const firstDim = dimensions[0]
      const aVal = a[firstDim]
      const bVal = b[firstDim]

      // If first dimension is date, parse and sort chronologically (descending)
      if (firstDim === 'date') {
        const aDate = new Date(aVal)
        const bDate = new Date(bVal)
        return bDate.getTime() - aDate.getTime() // Descending (newest first)
      }

      // Otherwise, sort alphabetically
      return String(aVal || '').localeCompare(String(bVal || ''))
    })

    return { rows, totals }
  }

  /**
   * Build a group key from dimension values
   */
  private static buildGroupKey(
    row: any,
    dimensions: Dimension[],
    dateGranularity: DateGranularity | undefined,
    lookups: Map<string, Map<string, string>>
  ): string {
    return dimensions
      .map((dim) => {
        if (dim === 'date') {
          // Support both sale_date and order_date
          const dateField = row.sale_date || row.order_date
          return this.formatDateByGranularity(dateField, dateGranularity || 'day')
        } else if (dim === 'location') {
          return lookups.get('locations')?.get(row.location_id) || row.location_name || 'Unknown'
        } else if (dim === 'store') {
          return lookups.get('stores')?.get(row.store_id) || row.store_name || 'Unknown'
        } else if (dim === 'supplier') {
          return row.supplier_name || 'Unknown'
        } else if (dim === 'po_number') {
          return row.po_number || 'Unknown'
        } else if (dim === 'po_status') {
          return row.status || 'Unknown'
        } else if (dim === 'payment_status') {
          return row.payment_status || 'Unknown'
        } else if (dim === 'channel') {
          return row.pickup_location_id ? 'In-Store' : 'Online'
        } else {
          return row[dim] || 'Unknown'
        }
      })
      .join('|')
  }

  /**
   * Format date by granularity
   */
  private static formatDateByGranularity(
    dateStr: string,
    granularity: DateGranularity
  ): string {
    const date = new Date(dateStr + 'T00:00:00')

    switch (granularity) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      case 'week': {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return `Week of ${weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`
      }
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'quarter': {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        return `Q${quarter} ${date.getFullYear()}`
      }
      case 'year':
        return date.getFullYear().toString()
      default:
        return dateStr
    }
  }

  /**
   * Calculate a specific metric from grouped data
   */
  private static calculateMetric(metric: Metric, data: any[]): number {
    switch (metric) {
      case 'orders':
        return data.reduce((sum, row) => sum + Number(row.order_count || 1), 0)

      case 'revenue':
        // Try multiple possible column names
        return data.reduce((sum, row) => {
          return sum + Number(row.total_revenue || row.revenue || row.total_amount || 0)
        }, 0)

      case 'cost':
        return data.reduce((sum, row) => {
          return sum + Number(row.total_cogs || row.total_cost || row.cost || 0)
        }, 0)

      case 'profit': {
        const revenue = this.calculateMetric('revenue', data)
        const cost = this.calculateMetric('cost', data)
        return revenue - cost
      }

      case 'margin': {
        const revenue = this.calculateMetric('revenue', data)
        const profit = this.calculateMetric('profit', data)
        return revenue > 0 ? (profit / revenue) * 100 : 0
      }

      case 'tax':
        return data.reduce((sum, row) => {
          return sum + Number(row.total_tax || row.tax_amount || row.tax || 0)
        }, 0)

      case 'discounts':
        return data.reduce((sum, row) => {
          return sum + Number(row.total_discounts || row.discount_amount || row.discounts || 0)
        }, 0)

      case 'net_revenue': {
        const revenue = this.calculateMetric('revenue', data)
        const discounts = this.calculateMetric('discounts', data)
        return revenue - discounts
      }

      case 'quantity':
        return data.reduce((sum, row) => {
          return sum + Number(row.quantity_sold || row.quantity || row.qty || 0)
        }, 0)

      case 'avg_order_value': {
        const revenue = this.calculateMetric('revenue', data)
        const orders = this.calculateMetric('orders', data)
        return orders > 0 ? revenue / orders : 0
      }

      case 'po_count':
        return data.reduce((sum, row) => sum + Number(row.order_count || 1), 0)

      case 'po_total':
        return data.reduce((sum, row) => {
          return sum + Number(row.total_amount || 0)
        }, 0)

      case 'po_paid':
        return data.reduce((sum, row) => {
          return sum + Number(row.amount_paid || 0)
        }, 0)

      case 'po_outstanding':
        return data.reduce((sum, row) => {
          return sum + Number(row.amount_outstanding || 0)
        }, 0)

      case 'po_items':
        return data.reduce((sum, row) => {
          return sum + Number(row.total_quantity || row.item_count || 0)
        }, 0)

      default:
        return 0
    }
  }

  /**
   * Fetch lookup data for dimension resolution
   */
  private static async fetchLookupData(
    supabase: SupabaseClient,
    data: any[],
    dimensions: Dimension[]
  ): Promise<Map<string, Map<string, string>>> {
    const lookups = new Map<string, Map<string, string>>()

    // Fetch stores if needed
    if (dimensions.includes('store')) {
      const storeIds = [...new Set(data.map((d) => d.store_id))]
      const { data: stores } = await supabase
        .from('stores')
        .select('id, name')
        .in('id', storeIds)

      const storeMap = new Map(stores?.map((s) => [s.id, s.name]) || [])
      lookups.set('stores', storeMap)
    }

    // Fetch locations if needed
    if (dimensions.includes('location')) {
      const locationIds = [...new Set(data.map((d) => d.location_id))]
      const { data: locations } = await supabase
        .from('locations')
        .select('id, name')
        .in('id', locationIds)

      const locationMap = new Map(locations?.map((l) => [l.id, l.name]) || [])
      lookups.set('locations', locationMap)
    }

    return lookups
  }

  /**
   * Format a value for display
   */
  static formatValue(metric: Metric, value: number): string {
    switch (metric) {
      case 'revenue':
      case 'cost':
      case 'profit':
      case 'tax':
      case 'discounts':
      case 'net_revenue':
      case 'avg_order_value':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value)

      case 'margin':
        return `${value.toFixed(2)}%`

      case 'orders':
      case 'quantity':
        return Math.round(value).toLocaleString()

      default:
        return value.toLocaleString()
    }
  }
}
