/**
 * Enterprise Report Generation System
 * Types and interfaces for report configuration
 */

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json'
export type ReportType = 'revenue' | 'pnl' | 'staff' | 'inventory' | 'audit' | 'custom'
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once'
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed'

export interface ReportFilter {
  storeId?: string
  locationId?: string
  dateFrom: string
  dateTo: string
  employeeId?: string
  productId?: string
  categoryId?: string
  [key: string]: any
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: ReportType
  format: ReportFormat[]
  defaultFilters: Partial<ReportFilter>
  sections: ReportSection[]
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    version: string
  }
}

export interface ReportSection {
  id: string
  title: string
  type: 'table' | 'chart' | 'metrics' | 'text' | 'image'
  dataSource: string // SQL query or view name
  visualization?: {
    chartType?: 'bar' | 'line' | 'pie' | 'area'
    columns?: string[]
    groupBy?: string
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  }
  formatting?: {
    numberFormat?: 'currency' | 'number' | 'percent'
    dateFormat?: string
    conditionalFormatting?: ConditionalFormat[]
  }
}

export interface ConditionalFormat {
  column: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'between'
  value: any
  style: {
    background?: string
    color?: string
    fontWeight?: string
  }
}

export interface ReportRequest {
  templateId: string
  filters: ReportFilter
  format: ReportFormat
  options?: {
    includeCharts?: boolean
    includeRawData?: boolean
    includeSummary?: boolean
    pageSize?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
  }
}

export interface ReportSchedule {
  id: string
  name: string
  templateId: string
  frequency: ReportFrequency
  filters: ReportFilter
  format: ReportFormat[]
  recipients: string[] // Email addresses
  enabled: boolean
  nextRun: string
  lastRun?: string
  createdBy: string
  createdAt: string
}

export interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  format: ReportFormat
  status: ReportStatus
  fileUrl?: string
  fileSize?: number
  generatedAt: string
  generatedBy: string
  filters: ReportFilter
  error?: string
  metadata: {
    rowCount?: number
    pageCount?: number
    duration?: number
  }
}

export interface ReportData {
  title: string
  subtitle?: string
  generatedAt: string
  filters: ReportFilter
  sections: {
    title: string
    data: any[]
    summary?: Record<string, any>
    chart?: {
      type: string
      data: any[]
    }
  }[]
  metadata: {
    totalRows: number
    dateRange: string
    storeNames?: string[]
  }
}
