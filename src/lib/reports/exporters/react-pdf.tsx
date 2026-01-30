/**
 * React PDF Exporter
 * Professional PDF generation using @react-pdf/renderer
 * Server-side rendering for high-quality reports
 */

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Use system font - Helvetica (no custom fonts needed)
// Font.register removed to avoid loading issues

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    marginBottom: 30,
    borderBottom: '1 solid #e5e5e5',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: '#000000',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 9,
    color: '#000000',
    marginTop: 4,
  },

  // Executive Summary
  summarySection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#eeeeee',
    borderRadius: 4,
    border: '1 solid #333333',
  },
  metricLabel: {
    fontSize: 8,
    color: '#000000',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#000000',
  },

  // Table
  tableSection: {
    marginBottom: 20,
  },
  table: {
    border: '1 solid #e5e5e5',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dddddd',
    borderBottom: '2 solid #000000',
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #f0f0f0',
    padding: 10,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottom: '0.5 solid #f0f0f0',
    padding: 10,
  },
  tableTotalRow: {
    flexDirection: 'row',
    backgroundColor: '#dddddd',
    padding: 10,
    fontWeight: 700,
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 700,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableCell: {
    fontSize: 9,
    color: '#000000',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 700,
    color: '#000000',
  },
  cellLeft: {
    textAlign: 'left',
  },
  cellRight: {
    textAlign: 'right',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #e5e5e5',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#000000',
  },
})

export interface ReactPDFReportData {
  title: string
  subtitle?: string
  dateRange: string
  dimensions: string[]
  metrics: string[]
  rows: Record<string, any>[]
  totals: Record<string, number>
  metadata: {
    rowCount: number
    executionTime: number
  }
}

/**
 * Format metric label
 */
const formatLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    date: 'Date',
    location: 'Location',
    store: 'Store',
    channel: 'Channel',
    payment_method: 'Payment Method',
    order_type: 'Order Type',
    orders: 'Orders',
    revenue: 'Revenue',
    cost: 'Cost',
    profit: 'Profit',
    margin: 'Margin %',
    tax: 'Tax',
    discounts: 'Discounts',
    net_revenue: 'Net Revenue',
    quantity: 'Quantity',
    avg_order_value: 'Avg Order',
  }
  return labels[metric] || metric.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format metric value
 */
const formatValue = (metric: string, value: any): string => {
  if (value === null || value === undefined) return '—'

  const numValue = Number(value)

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
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numValue)

    case 'margin':
      return `${numValue.toFixed(2)}%`

    case 'orders':
    case 'quantity':
      return Math.round(numValue).toLocaleString()

    default:
      return typeof value === 'number' ? value.toLocaleString() : String(value)
  }
}

/**
 * Calculate column widths
 */
const calculateColumnWidths = (
  dimensionCount: number,
  metricCount: number,
  pageWidth: number
): number[] => {
  const availableWidth = pageWidth - 80 // Subtract margins
  const totalCols = dimensionCount + metricCount

  // Dimensions get 60% of space, metrics get 40%
  const dimensionWidth = (availableWidth * 0.6) / dimensionCount
  const metricWidth = (availableWidth * 0.4) / metricCount

  const widths: number[] = []
  for (let i = 0; i < dimensionCount; i++) {
    widths.push(dimensionWidth)
  }
  for (let i = 0; i < metricCount; i++) {
    widths.push(metricWidth)
  }

  return widths
}

/**
 * Professional Report PDF Document Component
 */
export const ReportDocument = ({ data }: { data: ReactPDFReportData }) => {
  const columnWidths = calculateColumnWidths(
    data.dimensions.length,
    data.metrics.length,
    595 // A4 width in points
  )

  // Extract top 4 metrics for summary
  const summaryMetrics = data.metrics.slice(0, 4).map((metric) => ({
    label: formatLabel(metric),
    value: formatValue(metric, data.totals[metric]),
  }))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          {data.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}
          <Text style={styles.metadata}>
            Period: {data.dateRange} | Generated in {data.metadata.executionTime}ms | {data.metadata.rowCount} rows
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.metricsGrid}>
            {summaryMetrics.map((metric, idx) => (
              <View key={idx} style={styles.metricBox}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Data Table */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Detailed Results</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              {[...data.dimensions, ...data.metrics].map((col, idx) => (
                <View key={idx} style={{ width: columnWidths[idx] }}>
                  <Text style={[
                    styles.headerCell,
                    idx < data.dimensions.length ? styles.cellLeft : styles.cellRight
                  ]}>
                    {formatLabel(col)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Table Rows */}
            {data.rows.map((row, rowIdx) => (
              <View key={rowIdx} style={rowIdx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                {[...data.dimensions, ...data.metrics].map((col, colIdx) => (
                  <View key={colIdx} style={{ width: columnWidths[colIdx] }}>
                    <Text style={[
                      styles.tableCell,
                      colIdx < data.dimensions.length ? styles.cellLeft : styles.cellRight
                    ]}>
                      {data.metrics.includes(col) ? formatValue(col, row[col]) : String(row[col] || '')}
                    </Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Totals Row */}
            <View style={styles.tableTotalRow}>
              {[...data.dimensions, ...data.metrics].map((col, idx) => (
                <View key={idx} style={{ width: columnWidths[idx] }}>
                  <Text style={[
                    styles.tableCellBold,
                    idx < data.dimensions.length ? styles.cellLeft : styles.cellRight
                  ]}>
                    {idx === 0 ? 'TOTAL' : (
                      idx < data.dimensions.length ? '' : formatValue(
                        data.metrics[idx - data.dimensions.length],
                        data.totals[data.metrics[idx - data.dimensions.length]]
                      )
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Powered by Analytics Dashboard</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          <Text>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </View>
      </Page>
    </Document>
  )
}
