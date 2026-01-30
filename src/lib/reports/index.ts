/**
 * Report System Entry Point
 * Unified API for report generation and export
 */

export * from './types'
export * from './templates'
export { ExcelExporter } from './exporters/excel'
export { PDFExporter } from './exporters/pdf'

import { ExcelExporter } from './exporters/excel'
import { PDFExporter } from './exporters/pdf'
import { ReportRequest, ReportData } from './types'
import { toast } from '@/components/ui/toast'

/**
 * Generate and export a report (client-side)
 */
export async function generateAndExport(
  request: ReportRequest
): Promise<void> {
  try {
    // Generate report data via API
    toast.info('Generating report...', 'This may take a moment')

    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      toast.error('Failed to generate report', error.error || 'Unknown error')
      return
    }

    const reportData: ReportData = await response.json()

    // Export based on format
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${request.templateId}_${timestamp}`

    switch (request.format) {
      case 'pdf':
        const pdfBlob = PDFExporter.export(reportData, {
          orientation: request.options?.orientation,
          includeRawData: request.options?.includeRawData,
          includeSummary: request.options?.includeSummary,
        })
        downloadBlob(pdfBlob, `${filename}.pdf`)
        toast.success('PDF exported successfully!', `Downloaded ${filename}.pdf`)
        break

      case 'excel':
        const excelBlob = ExcelExporter.export(reportData)
        downloadBlob(excelBlob, `${filename}.xlsx`)
        toast.success('Excel exported successfully!', `Downloaded ${filename}.xlsx`)
        break

      case 'csv':
        const csv = exportToCsv(reportData)
        downloadText(csv, `${filename}.csv`, 'text/csv')
        toast.success('CSV exported successfully!', `Downloaded ${filename}.csv`)
        break

      case 'json':
        const json = exportToJson(reportData)
        downloadText(json, `${filename}.json`, 'application/json')
        toast.success('JSON exported successfully!', `Downloaded ${filename}.json`)
        break
    }
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Export failed', error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Export to CSV
 */
function exportToCsv(data: ReportData): string {
  let csv = `${data.title}\n`
  csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`
  csv += `Date Range: ${data.metadata.dateRange}\n\n`

  data.sections.forEach((section) => {
    csv += `\n${section.title}\n`

    if (section.data.length > 0) {
      const headers = Object.keys(section.data[0])
      csv += headers.join(',') + '\n'

      section.data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header]
          const stringValue = String(value || '')
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue
        })
        csv += values.join(',') + '\n'
      })

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
 * Export to JSON
 */
function exportToJson(data: ReportData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download text as file
 */
function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}
