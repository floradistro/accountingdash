'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/stores/dashboard.store'
import { Play, FileDown, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import type { Dimension, Metric, DateGranularity, ReportQuery, DataSource } from '@/lib/reports/query-builder'
import { ReportQueryBuilder } from '@/lib/reports/query-builder'
import { ProfessionalPDFExporter } from '@/lib/reports/exporters/pdf-professional'

interface ReportResult {
  rows: Record<string, any>[]
  totals: Record<string, number>
  metadata: { rowCount: number; executionTime: number }
}

const SALES_DIMENSIONS: { value: Dimension; label: string }[] = [
  { value: 'date', label: 'Date' },
  { value: 'location', label: 'Location' },
  { value: 'store', label: 'Store' },
  { value: 'channel', label: 'Channel (Online/In-Store)' },
  { value: 'payment_method', label: 'Payment Method' },
  { value: 'order_type', label: 'Order Type' },
]

const PO_DIMENSIONS: { value: Dimension; label: string }[] = [
  { value: 'date', label: 'Order Date' },
  { value: 'location', label: 'Location' },
  { value: 'store', label: 'Store' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'po_status', label: 'PO Status' },
  { value: 'payment_status', label: 'Payment Status' },
]

const SALES_METRICS: { value: Metric; label: string }[] = [
  { value: 'orders', label: 'Orders' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'cost', label: 'Cost (COGS)' },
  { value: 'profit', label: 'Profit' },
  { value: 'margin', label: 'Margin %' },
  { value: 'tax', label: 'Tax' },
  { value: 'discounts', label: 'Discounts' },
  { value: 'net_revenue', label: 'Net Revenue' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'avg_order_value', label: 'Avg Order Value' },
]

const PO_METRICS: { value: Metric; label: string }[] = [
  { value: 'po_count', label: 'Purchase Orders' },
  { value: 'po_total', label: 'Total Amount' },
  { value: 'po_paid', label: 'Amount Paid' },
  { value: 'po_outstanding', label: 'Outstanding Balance' },
  { value: 'po_items', label: 'Total Items' },
]

const GRANULARITIES: { value: DateGranularity; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Yearly' },
]

export function ReportBuilder() {
  const { dateFrom, dateTo } = useDashboardStore()
  const [dataSource, setDataSource] = useState<DataSource>('sales')
  const [dimensions, setDimensions] = useState<Dimension[]>(['date'])
  const [metrics, setMetrics] = useState<Metric[]>(['orders', 'revenue', 'profit'])
  const [granularity, setGranularity] = useState<DateGranularity>('day')
  const [result, setResult] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Get current dimension and metric lists based on data source
  const DIMENSIONS = dataSource === 'purchase_orders' ? PO_DIMENSIONS : SALES_DIMENSIONS
  const METRICS = dataSource === 'purchase_orders' ? PO_METRICS : SALES_METRICS

  const toggleDimension = (dim: Dimension) => {
    setDimensions((prev) =>
      prev.includes(dim) ? prev.filter((d) => d !== dim) : [...prev, dim]
    )
  }

  const toggleMetric = (metric: Metric) => {
    setMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    )
  }

  const runReport = async () => {
    if (dimensions.length === 0) {
      toast.error('Select at least one dimension', 'Choose how to group your data')
      return
    }
    if (metrics.length === 0) {
      toast.error('Select at least one metric', 'Choose what to measure')
      return
    }

    setLoading(true)
    try {
      const query: ReportQuery = {
        dataSource,
        dimensions,
        metrics,
        dateGranularity: dimensions.includes('date') ? granularity : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }

      const response = await fetch('/api/reports/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to run report')
      }

      const data: ReportResult = await response.json()
      setResult(data)
      toast.success('Report generated', `${data.metadata.rowCount} rows in ${data.metadata.executionTime}ms`)
    } catch (error) {
      console.error('Report error:', error)
      toast.error('Failed to run report', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = async () => {
    if (!result) return

    const reportData = {
      title: 'Custom Analytics Report',
      subtitle: 'Enterprise Performance Analysis',
      dateRange: `${dateFrom || 'All time'} to ${dateTo || 'Present'}`,
      dimensions,
      metrics,
      rows: result.rows,
      totals: result.totals,
      metadata: result.metadata,
    }

    try {
      toast.info('Generating PDF...', 'Using React PDF renderer')

      // Use server-side React PDF generation
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast.success('PDF exported', 'Professional React PDF downloaded successfully')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('PDF export failed', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const exportCSV = () => {
    if (!result) return

    const headers = [...dimensions, ...metrics]
    const csv = [
      headers.join(','),
      ...result.rows.map((row) =>
        headers
          .map((h) => {
            const value = row[h]
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          })
          .join(',')
      ),
      '',
      'Totals',
      metrics.map((m) => result.totals[m] || 0).join(','),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported', 'Report downloaded successfully')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Data Source Selector */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', marginBottom: '12px' }}>
          Report Type
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              setDataSource('sales')
              setDimensions(['date'])
              setMetrics(['orders', 'revenue', 'profit'])
            }}
            style={{
              flex: 1,
              padding: '16px',
              background: dataSource === 'sales' ? 'rgba(255,255,255,0.06)' : '#0f0f0f',
              border: `2px solid ${dataSource === 'sales' ? '#737373' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '8px',
              color: dataSource === 'sales' ? '#e5e5e5' : '#737373',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Sales Reports</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Orders, revenue, COGS, profit</div>
          </button>
          <button
            onClick={() => {
              setDataSource('purchase_orders')
              setDimensions(['date'])
              setMetrics(['po_count', 'po_total', 'po_outstanding'])
            }}
            style={{
              flex: 1,
              padding: '16px',
              background: dataSource === 'purchase_orders' ? 'rgba(255,255,255,0.06)' : '#0f0f0f',
              border: `2px solid ${dataSource === 'purchase_orders' ? '#737373' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '8px',
              color: dataSource === 'purchase_orders' ? '#e5e5e5' : '#737373',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Purchase Order Reports</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>POs, spending, supplier tracking</div>
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Dimensions */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', marginBottom: '12px' }}>
            Dimensions (Group By)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DIMENSIONS.map((dim) => (
              <label key={dim.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px', background: dimensions.includes(dim.value) ? 'rgba(255,255,255,0.04)' : 'transparent', borderRadius: '6px' }}>
                <input
                  type="checkbox"
                  checked={dimensions.includes(dim.value)}
                  onChange={() => toggleDimension(dim.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#e5e5e5' }}>{dim.label}</span>
              </label>
            ))}
          </div>
          {dimensions.includes('date') && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#737373', marginBottom: '8px' }}>
                Date Granularity
              </label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as DateGranularity)}
                style={{ width: '100%', padding: '8px', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#e5e5e5', fontSize: '12px' }}
              >
                {GRANULARITIES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', marginBottom: '12px' }}>
            Metrics (Measure)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {METRICS.map((metric) => (
              <label key={metric.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px', background: metrics.includes(metric.value) ? 'rgba(255,255,255,0.04)' : 'transparent', borderRadius: '6px' }}>
                <input
                  type="checkbox"
                  checked={metrics.includes(metric.value)}
                  onChange={() => toggleMetric(metric.value)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#e5e5e5' }}>{metric.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={runReport}
          disabled={loading || dimensions.length === 0 || metrics.length === 0}
          style={{ padding: '12px 24px', background: loading ? '#404040' : '#e5e5e5', color: loading ? '#737373' : '#0a0a0a', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} />}
          {loading ? 'Running...' : 'Run Report'}
        </button>
        {result && (
          <>
            <button onClick={exportCSV} style={{ padding: '12px 20px', background: 'transparent', color: '#737373', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileDown size={16} />
              CSV
            </button>
            <button onClick={exportPDF} style={{ padding: '12px 20px', background: 'transparent', color: '#737373', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileDown size={16} />
              PDF
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {result && (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5' }}>
              Results ({result.metadata.rowCount} rows)
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#0f0f0f' }}>
                <tr>
                  {dimensions.map((dim) => (
                    <th key={dim} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {DIMENSIONS.find((d) => d.value === dim)?.label || dim}
                    </th>
                  ))}
                  {metrics.map((metric) => (
                    <th key={metric} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 500, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {METRICS.find((m) => m.value === metric)?.label || metric}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {dimensions.map((dim) => (
                      <td key={dim} style={{ padding: '12px 16px', fontSize: '12px', color: '#e5e5e5' }}>
                        {row[dim]}
                      </td>
                    ))}
                    {metrics.map((metric) => (
                      <td key={metric} style={{ padding: '12px 16px', fontSize: '12px', color: '#a3a3a3', textAlign: 'right' }}>
                        {ReportQueryBuilder.formatValue(metric, row[metric])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <tr>
                  <td colSpan={dimensions.length} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 500, color: '#e5e5e5' }}>
                    Total
                  </td>
                  {metrics.map((metric) => (
                    <td key={metric} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 500, color: '#e5e5e5', textAlign: 'right' }}>
                      {ReportQueryBuilder.formatValue(metric, result.totals[metric] || 0)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
