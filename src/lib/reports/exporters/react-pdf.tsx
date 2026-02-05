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
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },

  // Company Header
  companyHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #2d5f3f',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5f3f',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 9,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Report Header
  reportHeader: {
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: '#4a4a4a',
    marginBottom: 6,
  },
  metadata: {
    fontSize: 9,
    color: '#666666',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1 solid #e5e5e5',
  },

  // Executive Summary
  summarySection: {
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d5f3f',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    border: '1 solid #d0d0d0',
  },
  metricLabel: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5f3f',
  },

  // Table
  tableSection: {
    marginBottom: 20,
  },
  table: {
    border: '1 solid #d0d0d0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2d5f3f',
    padding: 12,
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
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 9,
    color: '#1a1a1a',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
    bottom: 40,
    left: 50,
    right: 50,
    borderTop: '2 solid #2d5f3f',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
  },
  footerBrand: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2d5f3f',
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
    tax_rate: 'Tax Rate %',
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
        {/* Company Branding */}
        <View style={styles.companyHeader}>
          <Text style={styles.companyName}>FLORA DISTRO</Text>
          <Text style={styles.companyTagline}>Enterprise Analytics & Reporting</Text>
        </View>

        {/* Report Header */}
        <View style={styles.reportHeader}>
          <Text style={styles.title}>{data.title}</Text>
          {data.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}
          <Text style={styles.metadata}>
            Report Period: {data.dateRange} • {data.metadata.rowCount} Records • Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
          <Text style={styles.footerBrand}>FLORA DISTRO</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          <Text style={styles.footerText}>Confidential</Text>
        </View>
      </Page>
    </Document>
  )
}
