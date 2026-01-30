/**
 * Excel Export Module
 * Generate professional Excel reports with formatting
 */

import * as XLSX from 'xlsx'
import { ReportData } from '../types'

export class ExcelExporter {
  /**
   * Export report data to Excel format
   */
  static export(data: ReportData): Blob {
    const workbook = XLSX.utils.book_new()

    // Add metadata sheet
    const metadataSheet = XLSX.utils.aoa_to_sheet([
      ['Report', data.title],
      ['Generated', new Date(data.generatedAt).toLocaleString()],
      ['Date Range', data.metadata.dateRange],
      ['Total Rows', data.metadata.totalRows],
      [],
    ])
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Summary')

    // Add each section as a separate sheet
    data.sections.forEach((section, idx) => {
      if (section.data.length === 0) return

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(section.data)

      // Add summary at the bottom if available
      if (section.summary && Object.keys(section.summary).length > 0) {
        const summaryData = [
          [],
          ['Summary'],
          ...Object.entries(section.summary).map(([key, value]) => [key, value]),
        ]

        XLSX.utils.sheet_add_aoa(worksheet, summaryData, {
          origin: -1,
        })
      }

      // Auto-size columns
      const cols = this.getColumnWidths(section.data)
      worksheet['!cols'] = cols

      // Add sheet with sanitized name (max 31 chars, no special chars)
      const sheetName = section.title
        .replace(/[\\/?*\[\]]/g, '')
        .substring(0, 31)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || `Sheet${idx + 1}`)
    })

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    return new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  }

  /**
   * Calculate optimal column widths
   */
  private static getColumnWidths(data: any[]): { wch: number }[] {
    if (data.length === 0) return []

    const headers = Object.keys(data[0])
    const widths = headers.map((header) => {
      const maxLength = Math.max(
        header.length,
        ...data.map((row) => String(row[header] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) } // Max 50 chars
    })

    return widths
  }

  /**
   * Download Excel file
   */
  static download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
