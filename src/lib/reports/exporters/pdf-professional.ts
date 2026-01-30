/**
 * Professional PDF Exporter
 * Enterprise-quality PDF generation with polished formatting
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PDFReportData {
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

export class ProfessionalPDFExporter {
  private static readonly COLORS = {
    primary: [229, 229, 229] as [number, number, number],
    secondary: [115, 115, 115] as [number, number, number],
    tertiary: [82, 82, 82] as [number, number, number],
    background: [15, 15, 15] as [number, number, number],
    border: [38, 38, 38] as [number, number, number],
    text: [229, 229, 229] as [number, number, number],
    textMuted: [163, 163, 163] as [number, number, number],
    headerBg: [245, 245, 245] as [number, number, number],
    headerText: [10, 10, 10] as [number, number, number],
  }

  private static readonly FONTS = {
    title: 24,
    heading: 14,
    subheading: 11,
    body: 9,
    caption: 8,
  }

  /**
   * Generate professional PDF report
   */
  static generate(data: PDFReportData): Blob {
    const doc = new jsPDF({
      orientation: data.dimensions.length > 3 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20

    let yPos = margin

    // ===== HEADER =====
    yPos = this.drawHeader(doc, data, yPos, pageWidth, margin)

    // ===== EXECUTIVE SUMMARY =====
    yPos = this.drawExecutiveSummary(doc, data, yPos, pageWidth, margin)

    // ===== DATA TABLE =====
    yPos = this.drawDataTable(doc, data, yPos, pageWidth, pageHeight, margin)

    // ===== FOOTER ON ALL PAGES =====
    this.drawFooter(doc, pageWidth, pageHeight)

    return doc.output('blob')
  }

  /**
   * Draw professional header
   */
  private static drawHeader(
    doc: jsPDF,
    data: PDFReportData,
    yPos: number,
    pageWidth: number,
    margin: number
  ): number {
    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(this.FONTS.title)
    doc.setTextColor(...this.COLORS.text)
    doc.text(data.title, margin, yPos)
    yPos += 10

    // Subtitle
    if (data.subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(this.FONTS.body)
      doc.setTextColor(...this.COLORS.textMuted)
      doc.text(data.subtitle, margin, yPos)
      yPos += 6
    }

    // Date Range
    doc.setFontSize(this.FONTS.caption)
    doc.setTextColor(...this.COLORS.secondary)
    doc.text(`Period: ${data.dateRange}`, margin, yPos)
    yPos += 4

    // Execution Info
    doc.text(
      `Generated in ${data.metadata.executionTime}ms | ${data.metadata.rowCount} rows`,
      margin,
      yPos
    )
    yPos += 8

    // Divider
    doc.setDrawColor(...this.COLORS.border)
    doc.setLineWidth(0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 12

    return yPos
  }

  /**
   * Draw executive summary with key metrics
   */
  private static drawExecutiveSummary(
    doc: jsPDF,
    data: PDFReportData,
    yPos: number,
    pageWidth: number,
    margin: number
  ): number {
    // Section Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(this.FONTS.heading)
    doc.setTextColor(...this.COLORS.text)
    doc.text('Executive Summary', margin, yPos)
    yPos += 10

    // Key Metrics Boxes
    const metrics = this.extractKeyMetrics(data)
    const boxWidth = (pageWidth - margin * 2 - 15) / 4
    const boxHeight = 22
    let xPos = margin

    metrics.forEach((metric, idx) => {
      if (idx === 4) {
        // New row
        yPos += boxHeight + 5
        xPos = margin
      }

      // Box background
      doc.setFillColor(248, 248, 248)
      doc.rect(xPos, yPos, boxWidth, boxHeight, 'F')

      // Box border
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.3)
      doc.rect(xPos, yPos, boxWidth, boxHeight, 'S')

      // Label
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(this.FONTS.caption)
      doc.setTextColor(...this.COLORS.secondary)
      doc.text(metric.label, xPos + boxWidth / 2, yPos + 8, { align: 'center' })

      // Value
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(this.FONTS.subheading)
      doc.setTextColor(...this.COLORS.headerText)
      doc.text(metric.value, xPos + boxWidth / 2, yPos + 16, { align: 'center' })

      xPos += boxWidth + 5
    })

    yPos += boxHeight + 15

    return yPos
  }

  /**
   * Extract key metrics for summary
   */
  private static extractKeyMetrics(data: PDFReportData): Array<{ label: string; value: string }> {
    const metrics: Array<{ label: string; value: string }> = []

    // Always show row count
    metrics.push({
      label: 'Data Points',
      value: data.metadata.rowCount.toLocaleString(),
    })

    // Add metrics based on what's in the report
    data.metrics.forEach((metric) => {
      const total = data.totals[metric]
      if (total !== undefined && total !== null) {
        const formatted = this.formatMetricValue(metric, total)
        metrics.push({
          label: this.formatMetricLabel(metric),
          value: formatted,
        })
      }
    })

    // Limit to 4 most important metrics
    return metrics.slice(0, 4)
  }

  /**
   * Draw professional data table
   */
  private static drawDataTable(
    doc: jsPDF,
    data: PDFReportData,
    yPos: number,
    pageWidth: number,
    pageHeight: number,
    margin: number
  ): number {
    // Section Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(this.FONTS.heading)
    doc.setTextColor(...this.COLORS.text)
    doc.text('Detailed Results', margin, yPos)
    yPos += 10

    // Prepare table data
    const headers = [...data.dimensions, ...data.metrics].map((h) =>
      this.formatMetricLabel(h)
    )

    const rows = data.rows.map((row) => {
      return [...data.dimensions, ...data.metrics].map((key) => {
        const value = row[key]
        // If it's a metric, format it
        if (data.metrics.includes(key)) {
          return this.formatMetricValue(key, value)
        }
        return String(value || '')
      })
    })

    // Add totals row
    const totalsRow = [...data.dimensions, ...data.metrics].map((key, idx) => {
      if (idx === 0) return 'TOTAL'
      if (idx < data.dimensions.length) return ''
      // It's a metric
      const metricKey = data.metrics[idx - data.dimensions.length]
      const total = data.totals[metricKey]
      return this.formatMetricValue(metricKey, total)
    })

    // Calculate optimal column widths
    const availableWidth = pageWidth - margin * 2
    const columnWidths = this.calculateColumnWidths(
      headers,
      rows,
      availableWidth,
      data.dimensions.length
    )

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: [...rows, totalsRow],
      startY: yPos,
      theme: 'plain',
      styles: {
        fontSize: this.FONTS.body,
        cellPadding: 4,
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: this.COLORS.headerBg,
        textColor: this.COLORS.headerText,
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle',
        lineWidth: 0.3,
        lineColor: [200, 200, 200],
      },
      bodyStyles: {
        textColor: [60, 60, 60],
        lineWidth: 0.1,
        lineColor: [240, 240, 240],
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
      columnStyles: this.createColumnStyles(
        data.dimensions.length,
        data.metrics.length,
        columnWidths
      ),
      didParseCell: (data) => {
        // Style the totals row
        if (data.row.index === rows.length) {
          data.cell.styles.fillColor = [245, 245, 245]
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = [10, 10, 10]
        }
      },
      margin: { left: margin, right: margin },
    })

    return (doc as any).lastAutoTable.finalY + 10
  }

  /**
   * Calculate optimal column widths
   */
  private static calculateColumnWidths(
    headers: string[],
    rows: string[][],
    availableWidth: number,
    dimensionCount: number
  ): number[] {
    const baseWidths = headers.map((header, idx) => {
      // Dimensions get more space
      if (idx < dimensionCount) {
        return Math.max(header.length * 2.5, 30)
      }
      // Metrics get less space
      return Math.max(header.length * 2, 25)
    })

    const totalWidth = baseWidths.reduce((sum, w) => sum + w, 0)
    const scaleFactor = availableWidth / totalWidth

    return baseWidths.map((w) => w * scaleFactor)
  }

  /**
   * Create column styles
   */
  private static createColumnStyles(
    dimensionCount: number,
    metricCount: number,
    widths: number[]
  ): any {
    const styles: any = {}

    for (let i = 0; i < dimensionCount + metricCount; i++) {
      styles[i] = {
        cellWidth: widths[i],
        halign: i < dimensionCount ? 'left' : 'right',
        valign: 'middle',
      }
    }

    return styles
  }

  /**
   * Draw footer on all pages
   */
  private static drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    const pageCount = doc.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      // Footer divider
      doc.setDrawColor(...this.COLORS.border)
      doc.setLineWidth(0.3)
      doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15)

      // Page number
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(this.FONTS.caption)
      doc.setTextColor(...this.COLORS.secondary)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
        align: 'center',
      })

      // Timestamp
      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      doc.text(`Generated ${timestamp}`, pageWidth - 20, pageHeight - 10, {
        align: 'right',
      })

      // Branding
      doc.text('Powered by Analytics Dashboard', 20, pageHeight - 10)
    }
  }

  /**
   * Format metric label for display
   */
  private static formatMetricLabel(metric: string): string {
    const labels: Record<string, string> = {
      date: 'Date',
      location: 'Location',
      store: 'Store',
      channel: 'Channel',
      payment_method: 'Payment Method',
      order_type: 'Order Type',
      orders: 'Orders',
      revenue: 'Revenue',
      cost: 'Cost (COGS)',
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
   * Format metric value for display
   */
  private static formatMetricValue(metric: string, value: any): string {
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
   * Download PDF
   */
  static download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
