import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateAndFilterStores, createErrorResponse, createSuccessResponse } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { storeIds: storeFilter, error } = await validateAndFilterStores(request)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'summary' // summary, by-customer, detail

    const supabase = await createClient()

    if (view === 'summary') {
      const { data, error } = await supabase
        .from('v_ar_summary')
        .select('*')
        .in('store_id', storeFilter)

      if (error) throw error

      // Aggregate if multiple stores
      if (data.length > 1) {
        const aggregated = data.reduce((acc, row) => ({
          store_id: 'all',
          open_invoice_count: (acc.open_invoice_count || 0) + Number(row.open_invoice_count || 0),
          total_billed: (acc.total_billed || 0) + Number(row.total_billed || 0),
          total_collected: (acc.total_collected || 0) + Number(row.total_collected || 0),
          total_outstanding: (acc.total_outstanding || 0) + Number(row.total_outstanding || 0),
          current_0_30: (acc.current_0_30 || 0) + Number(row.current_0_30 || 0),
          aging_31_60: (acc.aging_31_60 || 0) + Number(row.aging_31_60 || 0),
          aging_61_90: (acc.aging_61_90 || 0) + Number(row.aging_61_90 || 0),
          aging_over_90: (acc.aging_over_90 || 0) + Number(row.aging_over_90 || 0),
          overdue_count: (acc.overdue_count || 0) + Number(row.overdue_count || 0),
          overdue_amount: (acc.overdue_amount || 0) + Number(row.overdue_amount || 0),
        }), {} as Record<string, unknown>)
        return createSuccessResponse(aggregated, 60)
      }

      return createSuccessResponse(data[0] || {
        open_invoice_count: 0,
        total_billed: 0,
        total_collected: 0,
        total_outstanding: 0,
        current_0_30: 0,
        aging_31_60: 0,
        aging_61_90: 0,
        aging_over_90: 0,
        overdue_count: 0,
        overdue_amount: 0,
      }, 60)
    }

    if (view === 'by-customer') {
      const { data, error } = await supabase
        .from('v_ar_by_customer')
        .select('*')
        .in('store_id', storeFilter)
        .gt('balance_due', 0)
        .order('balance_due', { ascending: false })

      if (error) throw error
      return createSuccessResponse(data, 60)
    }

    if (view === 'detail') {
      const { data, error } = await supabase
        .from('v_ar_detail')
        .select('*')
        .in('store_id', storeFilter)
        .in('payment_status', ['pending', 'partial'])
        .order('created_at', { ascending: false })

      if (error) throw error
      return createSuccessResponse(data, 60)
    }

    return createErrorResponse('Invalid view parameter', 400)
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch accounts receivable data',
      500
    )
  }
}
