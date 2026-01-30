/**
 * PDF Export Module
 * Generate professional PDF reports with tables and formatting
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ReportData } from '../types'

export class PDFExporter {
  /**
   * Export report data to PDF format
   */
  static export(data: ReportData, options?: { orientation?: 'portrait' | 'landscape'; includeRawData?: boolean; includeSummary?: boolean }): Blob {
    const doc = new jsPDF({
      orientation: options?.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // ===== HEADER =====
    doc.setFontSize(22)
    doc.setTextColor(10, 10, 10)
    doc.setFont('helvetica', 'bold')
    doc.text(data.title, 20, 25)

    doc.setFontSize(10)
    doc.setTextColor(82, 82, 82)
    doc.setFont('helvetica', 'normal')
    if (data.subtitle) {
      doc.text(data.subtitle, 20, 32)
    }

    // Date range
    if (data.metadata?.dateRange) {
      doc.setFontSize(9)
      doc.setTextColor(115, 115, 115)
      doc.text(`Period: ${data.metadata.dateRange}`, 20, 38)
    }

    // Divider line
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.5)
    doc.line(20, 42, pageWidth - 20, 42)

    let yPosition = 50

    // ===== EXECUTIVE SUMMARY (if includeSummary option is set) =====
    if (options?.includeSummary !== false) {
      doc.setFontSize(14)
      doc.setTextColor(10, 10, 10)
      doc.setFont('helvetica', 'bold')
      doc.text('Executive Summary', 20, yPosition)
      yPosition += 8

      // Calculate overall totals from all sections
      const overallMetrics = this.calculateOverallMetrics(data)

      doc.setFontSize(9)
      doc.setTextColor(82, 82, 82)
      doc.setFont('helvetica', 'normal')

      const summaryBoxes = [
        { label: 'Total Revenue', value: overallMetrics.revenue },
        { label: 'Total Profit', value: overallMetrics.profit },
        { label: 'Profit Margin', value: overallMetrics.profitMargin },
        { label: 'Data Points', value: overallMetrics.dataPoints },
      ]

      // Draw summary boxes
      const boxWidth = (pageWidth - 50) / 4
      const boxHeight = 20
      let xPos = 20

      summaryBoxes.forEach((box) => {
        // Box background
        doc.setFillColor(245, 245, 245)
        doc.rect(xPos, yPosition, boxWidth, boxHeight, 'F')

        // Box border
        doc.setDrawColor(225, 225, 225)
        doc.rect(xPos, yPosition, boxWidth, boxHeight, 'S')

        // Label
        doc.setFontSize(8)
        doc.setTextColor(115, 115, 115)
        doc.text(box.label, xPos + boxWidth / 2, yPosition + 7, { align: 'center' })

        // Value
        doc.setFontSize(11)
        doc.setTextColor(10, 10, 10)
        doc.setFont('helvetica', 'bold')
        doc.text(box.value, xPos + boxWidth / 2, yPosition + 15, { align: 'center' })
        doc.setFont('helvetica', 'normal')

        xPos += boxWidth + 5
      })

      yPosition += boxHeight + 15
    }

    // ===== SECTIONS =====
    data.sections.forEach((section) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 25
      }

      // Section title
      doc.setFontSize(13)
      doc.setTextColor(10, 10, 10)
      doc.setFont('helvetica', 'bold')
      doc.text(section.title, 20, yPosition)
      yPosition += 8

      if (section.data && section.data.length > 0) {
        // Get headers and limit rows for summary reports
        const headers = Object.keys(section.data[0])

        // For summary reports, limit to reasonable number of rows
        const maxRows = options?.includeRawData === false ? 15 : 50
        const displayData = section.data.slice(0, maxRows)
        const hasMore = section.data.length > maxRows

        const rows = displayData.map((row) =>
          headers.map((h) => {
            const value = row[h]
            // Keep formatting from aggregated data
            return String(value || '')
          })
        )

        // Calculate optimal column widths
        const availableWidth = pageWidth - 40
        const columnWidths = this.calculateColumnWidths(headers, rows, availableWidth)

        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: yPosition,
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 4,
            overflow: 'linebreak',
            cellWidth: 'wrap',
          },
          headStyles: {
            fillColor: [245, 245, 245],
            textColor: [10, 10, 10],
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [200, 200, 200],
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250],
          },
          columnStyles: this.createColumnStyles(headers, columnWidths),
          margin: { left: 20, right: 20 },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 5

        // Show "more rows" indicator
        if (hasMore) {
          doc.setFontSize(8)
          doc.setTextColor(115, 115, 115)
          doc.setFont('helvetica', 'italic')
          doc.text(
            `... and ${section.data.length - maxRows} more rows`,
            20,
            yPosition
          )
          yPosition += 5
          doc.setFont('helvetica', 'normal')
        }
      }

      // Section Summary (Key Metrics)
      if (section.summary && Object.keys(section.summary).length > 0) {
        yPosition += 3

        // Check if we need a new page for summary
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = 25
        }

        doc.setFontSize(10)
        doc.setTextColor(82, 82, 82)
        doc.setFont('helvetica', 'bold')
        doc.text('Key Metrics:', 20, yPosition)
        yPosition += 6

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')

        const summaryEntries = Object.entries(section.summary).slice(0, 8)
        summaryEntries.forEach(([key, value]) => {
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
          const formattedValue = typeof value === 'number'
            ? value.toLocaleString()
            : String(value)

          doc.text(`${formattedKey}: ${formattedValue}`, 25, yPosition)
          yPosition += 5
        })

        yPosition += 5
      }

      yPosition += 5
    })

    // ===== FOOTER ON ALL PAGES =====
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      // Footer divider
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.3)
      doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15)

      // Page number
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )

      // Generated timestamp
      doc.text(
        `Generated ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      )
    }

    return doc.output('blob')
  }

  /**
   * Calculate overall metrics from all sections
   */
  private static calculateOverallMetrics(data: ReportData): any {
    let totalRevenue = 0
    let totalProfit = 0
    let dataPoints = 0

    data.sections.forEach((section) => {
      if (section.summary) {
        totalRevenue += Number(section.summary.total_revenue || section.summary.total_total_revenue || 0)
        totalProfit += Number(section.summary.total_profit || section.summary.total_total_profit || 0)
      }
      dataPoints += section.data?.length || 0
    })

    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) + '%' : 'N/A'

    return {
      revenue: totalRevenue > 0 ? this.formatCurrency(totalRevenue) : 'N/A',
      profit: totalProfit !== 0 ? this.formatCurrency(totalProfit) : 'N/A',
      profitMargin,
      dataPoints: dataPoints.toLocaleString(),
    }
  }

  /**
   * Calculate optimal column widths
   */
  private static calculateColumnWidths(headers: string[], rows: string[][], availableWidth: number): number[] {
    const minWidth = 20
    const headerWidths = headers.map((h) => Math.max(minWidth, h.length * 2.5))

    // Distribute remaining space proportionally
    const totalHeaderWidth = headerWidths.reduce((sum, w) => sum + w, 0)
    const scaleFactor = availableWidth / totalHeaderWidth

    return headerWidths.map((w) => w * scaleFactor)
  }

  /**
   * Create column styles for autoTable
   */
  private static createColumnStyles(headers: string[], widths: number[]): any {
    const styles: any = {}
    headers.forEach((header, idx) => {
      styles[idx] = {
        cellWidth: widths[idx],
        halign: header.toLowerCase().includes('date') ? 'left' : 'left',
      }
    })
    return styles
  }

  /**
   * Format currency
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  /**
   * Download PDF file
   */
  static download(blob: Blob, filename: string) {
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
