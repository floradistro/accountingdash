/**
 * Report Generation Engine
 * Core logic for generating reports in multiple formats
 */

import { createClient } from '@/lib/supabase/server'
import { ReportRequest, ReportData, ReportTemplate, GeneratedReport } from './types'
import { getTemplate } from './templates'
import { Result, success, failure } from '@/lib/result'
import { reportError } from '@/lib/monitoring/error-reporter'

export class ReportGenerator {
  /**
   * Generate a report based on template and filters
   */
  static async generate(request: ReportRequest): Promise<Result<ReportData, Error>> {
    const startTime = Date.now()

    try {
      const template = getTemplate(request.templateId)
      if (!template) {
        return failure(new Error(`Template not found: ${request.templateId}`))
      }

      // Fetch data for each section
      const sections = await Promise.all(
        template.sections.map((section) =>
          this.fetchSectionData(section.dataSource, request.filters)
        )
      )

      const reportData: ReportData = {
        title: template.name,
        subtitle: `Generated on ${new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}`,
        generatedAt: new Date().toISOString(),
        filters: request.filters,
        sections: template.sections.map((section, idx) => ({
          title: section.title,
          data: sections[idx] || [],
          summary: this.calculateSummary(sections[idx] || [], section),
          chart: section.visualization ? {
            type: section.visualization.chartType || 'bar',
            data: sections[idx] || [],
          } : undefined,
        })),
        metadata: {
          totalRows: sections.reduce((sum, data) => sum + (data?.length || 0), 0),
          dateRange: `${request.filters.dateFrom} to ${request.filters.dateTo}`,
        },
      }

      const duration = Date.now() - startTime
      console.log(`Report generated in ${duration}ms`)

      return success(reportData)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      reportError(err, {
        feature: 'reports',
        action: 'generate',
        templateId: request.templateId,
      })
      return failure(err)
    }
  }

  /**
   * Fetch data for a report section
   */
  private static async fetchSectionData(
    dataSource: string,
    filters: any
  ): Promise<any[]> {
    const supabase = await createClient()

    // For reports, we need aggregated data, not raw rows
    // Fetch and aggregate based on data source
    if (dataSource === 'v_daily_sales') {
      return this.fetchDailySalesAggregated(supabase, filters)
    } else if (dataSource === 'v_cash_summary') {
      return this.fetchCashSummary(supabase, filters)
    } else if (dataSource === 'v_store_performance') {
      return this.fetchStorePerformance(supabase, filters)
    } else if (dataSource === 'v_inventory_valuation_summary') {
      return this.fetchInventorySummary(supabase, filters)
    } else if (dataSource === 'daily_audit_summary') {
      return this.fetchAuditSummary(supabase, filters)
    }

    // Fallback: fetch raw data
    let query = supabase.from(dataSource).select('*')

    if (filters.storeId && filters.storeId !== 'all') {
      query = query.eq('store_id', filters.storeId)
    }
    if (filters.locationId && filters.locationId !== 'all') {
      query = query.eq('location_id', filters.locationId)
    }
    if (filters.dateFrom) {
      query = query.gte('sale_date', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('sale_date', filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching section data:', error)
      return []
    }

    return data || []
  }

  /**
   * Fetch aggregated daily sales data with store/location names
   */
  private static async fetchDailySalesAggregated(supabase: any, filters: any) {
    let query = supabase
      .from('v_daily_sales')
      .select('sale_date, store_id, location_id, total_revenue, total_cogs, total_profit, order_count')

    if (filters.storeId && filters.storeId !== 'all') {
      query = query.eq('store_id', filters.storeId)
    }
    if (filters.locationId && filters.locationId !== 'all') {
      query = query.eq('location_id', filters.locationId)
    }
    if (filters.dateFrom) {
      query = query.gte('sale_date', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('sale_date', filters.dateTo)
    }

    const { data, error } = await query.order('sale_date', { ascending: false })

    if (error || !data) {
      console.error('Error fetching daily sales:', error)
      return []
    }

    // Fetch stores and locations to resolve names
    const storeIds = [...new Set(data.map((d: any) => d.store_id))]
    const locationIds = [...new Set(data.map((d: any) => d.location_id).filter(Boolean))]

    const { data: stores } = await supabase.from('stores').select('id, store_name').in('id', storeIds)
    const { data: locations } = locationIds.length > 0
      ? await supabase.from('locations').select('id, name').in('id', locationIds)
      : { data: [] }

    const storeMap = new Map(stores?.map((s: any) => [s.id, s.store_name]) || [])
    const locationMap = new Map(locations?.map((l: any) => [l.id, l.name]) || [])

    // Group by date and aggregate
    const grouped = new Map<string, any>()

    data.forEach((row: any) => {
      const date = row.sale_date
      if (!grouped.has(date)) {
        grouped.set(date, {
          date,
          revenue: 0,
          cogs: 0,
          profit: 0,
          orders: 0,
          stores: new Set(),
          locations: new Set(),
        })
      }

      const group = grouped.get(date)!
      group.revenue += Number(row.total_revenue || 0)
      group.cogs += Number(row.total_cogs || 0)
      group.profit += Number(row.total_profit || 0)
      group.orders += Number(row.order_count || 0)

      const storeName = storeMap.get(row.store_id) || 'Unknown'
      const locationName = row.location_id ? (locationMap.get(row.location_id) || 'Unknown') : 'All Locations'
      group.stores.add(storeName)
      group.locations.add(locationName)
    })

    // Convert to array and format
    return Array.from(grouped.values()).map(g => ({
      Date: new Date(g.date + 'T00:00:00').toLocaleDateString(),
      Revenue: this.formatCurrency(g.revenue),
      COGS: this.formatCurrency(g.cogs),
      Profit: this.formatCurrency(g.profit),
      'Profit Margin': `${((g.profit / g.revenue) * 100).toFixed(1)}%`,
      Orders: g.orders.toLocaleString(),
      Stores: Array.from(g.stores).join(', '),
      Locations: Array.from(g.locations).join(', '),
    }))
  }

  /**
   * Fetch cash summary with location names
   */
  private static async fetchCashSummary(supabase: any, filters: any) {
    let query = supabase.from('v_cash_summary').select('*')

    if (filters.storeId && filters.storeId !== 'all') {
      query = query.eq('store_id', filters.storeId)
    }
    if (filters.locationId && filters.locationId !== 'all') {
      query = query.eq('location_id', filters.locationId)
    }

    const { data, error } = await query

    if (error || !data) return []

    // Resolve location names
    const locationIds = [...new Set(data.map((d: any) => d.location_id))]
    const { data: locations } = await supabase.from('locations').select('id, name').in('id', locationIds)
    const locationMap = new Map(locations?.map((l: any) => [l.id, l.name]) || [])

    return data.map((row: any) => ({
      Location: locationMap.get(row.location_id) || 'Unknown',
      'Cash Balance': this.formatCurrency(row.cash_balance || 0),
      'Expected Balance': this.formatCurrency(row.expected_balance || 0),
      'Variance': this.formatCurrency((row.cash_balance || 0) - (row.expected_balance || 0)),
    }))
  }

  /**
   * Fetch store performance with store names
   */
  private static async fetchStorePerformance(supabase: any, filters: any) {
    let query = supabase.from('v_store_performance').select('*')

    if (filters.storeId && filters.storeId !== 'all') {
      query = query.eq('store_id', filters.storeId)
    }
    if (filters.dateFrom) {
      query = query.gte('period_start', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('period_end', filters.dateTo)
    }

    const { data, error } = await query

    if (error || !data) return []

    // Resolve store names
    const storeIds = [...new Set(data.map((d: any) => d.store_id))]
    const { data: stores } = await supabase.from('stores').select('id, name').in('id', storeIds)
    const storeMap = new Map(stores?.map((s: any) => [s.id, s.name]) || [])

    return data.map((row: any) => ({
      Store: storeMap.get(row.store_id) || 'Unknown',
      Revenue: this.formatCurrency(row.total_revenue || 0),
      Profit: this.formatCurrency(row.total_profit || 0),
      'Profit Margin': `${((row.total_profit / row.total_revenue) * 100 || 0).toFixed(1)}%`,
      'Avg Transaction': this.formatCurrency(row.avg_transaction_value || 0),
      Transactions: (row.transaction_count || 0).toLocaleString(),
    }))
  }

  /**
   * Fetch inventory summary with location names
   */
  private static async fetchInventorySummary(supabase: any, filters: any) {
    let query = supabase.from('v_inventory_valuation_summary').select('*')

    if (filters.locationId && filters.locationId !== 'all') {
      query = query.eq('location_id', filters.locationId)
    }

    const { data, error } = await query

    if (error || !data) return []

    // Resolve location names
    const locationIds = [...new Set(data.map((d: any) => d.location_id))]
    const { data: locations } = await supabase.from('locations').select('id, name').in('id', locationIds)
    const locationMap = new Map(locations?.map((l: any) => [l.id, l.name]) || [])

    return data.map((row: any) => ({
      Location: locationMap.get(row.location_id) || 'Unknown',
      'Total Value': this.formatCurrency(row.total_value || 0),
      'Item Count': (row.item_count || 0).toLocaleString(),
      'Avg Item Value': this.formatCurrency((row.total_value || 0) / (row.item_count || 1)),
    }))
  }

  /**
   * Fetch audit summary
   */
  private static async fetchAuditSummary(supabase: any, filters: any) {
    let query = supabase.from('daily_audit_summary').select('*')

    if (filters.dateFrom) {
      query = query.gte('audit_date', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('audit_date', filters.dateTo)
    }

    const { data, error } = await query.order('audit_date', { ascending: false })

    if (error || !data) return []

    return data.map((row: any) => ({
      Date: new Date(row.audit_date + 'T00:00:00').toLocaleDateString(),
      'Total Variance': this.formatCurrency(Math.abs(row.total_variance || 0)),
      'Items Audited': (row.items_audited || 0).toLocaleString(),
      'Issues Found': row.issues_found || 0,
      Status: row.status || 'N/A',
    }))
  }

  /**
   * Format currency values
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  /**
   * Calculate summary statistics for a section
   */
  private static calculateSummary(data: any[], section: any): Record<string, any> {
    if (!data || data.length === 0) return {}

    const summary: Record<string, any> = {}

    // For aggregated data with formatted values (like "$1,234.56")
    // we need to parse them back to numbers for summary calculations
    if (data[0]) {
      Object.keys(data[0]).forEach((key) => {
        const values = data.map((row) => {
          const value = row[key]
          // Handle currency formatted strings like "$1,234.56"
          if (typeof value === 'string' && value.startsWith('$')) {
            return Number(value.replace(/[$,]/g, ''))
          }
          // Handle percentage strings like "12.5%"
          if (typeof value === 'string' && value.endsWith('%')) {
            return Number(value.replace(/%/g, ''))
          }
          // Handle comma-separated numbers like "1,234"
          if (typeof value === 'string' && value.includes(',')) {
            return Number(value.replace(/,/g, ''))
          }
          return Number(value)
        }).filter((v) => !isNaN(v))

        if (values.length > 0) {
          const total = values.reduce((sum, v) => sum + v, 0)
          const avg = total / values.length

          // Only calculate totals for relevant fields
          if (key.toLowerCase().includes('revenue') ||
              key.toLowerCase().includes('profit') ||
              key.toLowerCase().includes('cost') ||
              key.toLowerCase().includes('value') ||
              key.toLowerCase().includes('balance')) {
            summary[`total_${key.toLowerCase().replace(/\s+/g, '_')}`] = total
            summary[`avg_${key.toLowerCase().replace(/\s+/g, '_')}`] = avg
          }
        }
      })
    }

    summary.row_count = data.length

    return summary
  }

  /**
   * Export report data to CSV format
   */
  static exportToCsv(data: ReportData): string {
    let csv = `${data.title}\n`
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`
    csv += `Date Range: ${data.metadata.dateRange}\n\n`

    data.sections.forEach((section) => {
      csv += `\n${section.title}\n`

      if (section.data.length > 0) {
        // Headers
        const headers = Object.keys(section.data[0])
        csv += headers.join(',') + '\n'

        // Data rows
        section.data.forEach((row) => {
          const values = headers.map((header) => {
            const value = row[header]
            // Escape commas and quotes
            const stringValue = String(value || '')
            return stringValue.includes(',') || stringValue.includes('"')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue
          })
          csv += values.join(',') + '\n'
        })

        // Summary
        if (section.summary) {
          csv += '\nSummary:\n'
          Object.entries(section.summary).forEach(([key, value]) => {
            csv += `${key},${value}\n`
          })
        }
      }

      csv += '\n'
    })

    return csv
  }

  /**
   * Export report data to JSON format
   */
  static exportToJson(data: ReportData): string {
    return JSON.stringify(data, null, 2)
  }

  /**
   * Download report as file
   */
  static download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
