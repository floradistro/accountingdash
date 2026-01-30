/**
 * Pre-built Report Templates
 * Enterprise-ready templates for common reports
 */

import { ReportTemplate, ReportType } from './types'

export const REPORT_TEMPLATES: Record<string, ReportTemplate> = {
  revenue_summary: {
    id: 'revenue_summary',
    name: 'Revenue Summary Report',
    description: 'Comprehensive revenue analysis with trends and comparisons',
    type: 'revenue',
    format: ['pdf', 'excel', 'csv'],
    defaultFilters: {
      dateFrom: '',
      dateTo: '',
    },
    sections: [
      {
        id: 'metrics',
        title: 'Key Metrics',
        type: 'metrics',
        dataSource: 'v_daily_sales',
      },
      {
        id: 'trend_chart',
        title: 'Revenue Trend',
        type: 'chart',
        dataSource: 'v_daily_sales',
        visualization: {
          chartType: 'line',
          columns: ['sale_date', 'total_revenue'],
          aggregation: 'sum',
        },
      },
      {
        id: 'daily_breakdown',
        title: 'Daily Breakdown',
        type: 'table',
        dataSource: 'v_daily_sales',
        formatting: {
          numberFormat: 'currency',
        },
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      version: '1.0.0',
    },
  },

  pnl_statement: {
    id: 'pnl_statement',
    name: 'Profit & Loss Statement',
    description: 'Complete P&L with COGS, margins, and profitability analysis',
    type: 'pnl',
    format: ['pdf', 'excel'],
    defaultFilters: {
      dateFrom: '',
      dateTo: '',
    },
    sections: [
      {
        id: 'summary',
        title: 'P&L Summary',
        type: 'metrics',
        dataSource: 'v_daily_sales',
      },
      {
        id: 'profit_trend',
        title: 'Profit Trend',
        type: 'chart',
        dataSource: 'v_daily_sales',
        visualization: {
          chartType: 'area',
          columns: ['sale_date', 'total_revenue', 'total_profit'],
          aggregation: 'sum',
        },
      },
      {
        id: 'margin_analysis',
        title: 'Margin Analysis by Period',
        type: 'table',
        dataSource: 'v_daily_sales',
        formatting: {
          numberFormat: 'currency',
          conditionalFormatting: [
            {
              column: 'gross_margin',
              condition: 'less_than',
              value: 20,
              style: { color: '#F36368', fontWeight: 'bold' },
            },
          ],
        },
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      version: '1.0.0',
    },
  },

  staff_performance: {
    id: 'staff_performance',
    name: 'Staff Performance Report',
    description: 'Employee performance metrics, rankings, and productivity',
    type: 'staff',
    format: ['pdf', 'excel', 'csv'],
    defaultFilters: {
      dateFrom: '',
      dateTo: '',
    },
    sections: [
      {
        id: 'overview',
        title: 'Performance Overview',
        type: 'metrics',
        dataSource: 'v_staff_performance',
      },
      {
        id: 'leaderboard',
        title: 'Top Performers',
        type: 'table',
        dataSource: 'v_staff_leaderboard',
        formatting: {
          numberFormat: 'currency',
        },
      },
      {
        id: 'all_staff',
        title: 'All Staff Performance',
        type: 'table',
        dataSource: 'v_staff_performance',
        formatting: {
          numberFormat: 'currency',
        },
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      version: '1.0.0',
    },
  },

  inventory_valuation: {
    id: 'inventory_valuation',
    name: 'Inventory Valuation Report',
    description: 'Inventory levels, values, and slow-moving items',
    type: 'inventory',
    format: ['pdf', 'excel', 'csv'],
    defaultFilters: {
      dateFrom: '',
      dateTo: '',
    },
    sections: [
      {
        id: 'summary',
        title: 'Inventory Summary',
        type: 'metrics',
        dataSource: 'inventory_summary',
      },
      {
        id: 'by_location',
        title: 'Inventory by Location',
        type: 'table',
        dataSource: 'inventory_by_location',
        formatting: {
          numberFormat: 'currency',
        },
      },
      {
        id: 'slow_moving',
        title: 'Slow-Moving Items',
        type: 'table',
        dataSource: 'inventory_slow_moving',
        formatting: {
          numberFormat: 'currency',
          conditionalFormatting: [
            {
              column: 'days_since_last_sale',
              condition: 'greater_than',
              value: 60,
              style: { background: '#FEE', color: '#C00' },
            },
          ],
        },
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      version: '1.0.0',
    },
  },

  audit_summary: {
    id: 'audit_summary',
    name: 'Audit Summary Report',
    description: 'Cash audit results with discrepancies and trends',
    type: 'audit',
    format: ['pdf', 'excel'],
    defaultFilters: {
      dateFrom: '',
      dateTo: '',
    },
    sections: [
      {
        id: 'overview',
        title: 'Audit Overview',
        type: 'metrics',
        dataSource: 'v_audit_summary',
      },
      {
        id: 'audit_history',
        title: 'Audit History',
        type: 'table',
        dataSource: 'v_audit_summary',
        formatting: {
          numberFormat: 'currency',
          conditionalFormatting: [
            {
              column: 'total_discrepancies',
              condition: 'greater_than',
              value: 0,
              style: { color: '#F36368' },
            },
          ],
        },
      },
    ],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      version: '1.0.0',
    },
  },
}

export function getTemplate(templateId: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES[templateId]
}

export function getAllTemplates(): ReportTemplate[] {
  return Object.values(REPORT_TEMPLATES)
}

export function getTemplatesByType(type: ReportType): ReportTemplate[] {
  return Object.values(REPORT_TEMPLATES).filter((t) => t.type === type)
}
