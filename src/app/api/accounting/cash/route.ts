import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateAndFilterStores,
  createSuccessResponse,
  createErrorResponse,
  getDaysFromParams,
} from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { storeIds: storeFilter, error: authError } = await validateAndFilterStores(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'summary' // summary, by-location, by-payment-method, monthly
    const days = getDaysFromParams(searchParams, 30)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const supabase = await createClient()

    if (view === 'summary') {
      const { data, error } = await supabase
        .from('v_cash_summary')
        .select('*')
        .in('store_id', storeFilter)
        .gte('report_date', startDateStr)
        .order('report_date', { ascending: false })

      if (error) throw error

      // Aggregate daily data into summary
      const summary = data.reduce((acc, row) => ({
        total_days: (acc.total_days || 0) + 1,
        cash_transaction_count: (acc.cash_transaction_count || 0) + Number(row.cash_transaction_count || 0),
        cash_sales: (acc.cash_sales || 0) + Number(row.cash_sales || 0),
        card_transaction_count: (acc.card_transaction_count || 0) + Number(row.card_transaction_count || 0),
        card_sales: (acc.card_sales || 0) + Number(row.card_sales || 0),
        total_transaction_count: (acc.total_transaction_count || 0) + Number(row.total_transaction_count || 0),
        total_sales: (acc.total_sales || 0) + Number(row.total_sales || 0),
        total_tax: (acc.total_tax || 0) + Number(row.total_tax || 0),
        total_tips: (acc.total_tips || 0) + Number(row.total_tips || 0),
        refund_count: (acc.refund_count || 0) + Number(row.refund_count || 0),
        refund_amount: (acc.refund_amount || 0) + Number(row.refund_amount || 0),
      }), {} as Record<string, number>)

      return createSuccessResponse({
        summary,
        daily: data,
      }, 60)
    }

    if (view === 'by-location') {
      const { data, error } = await supabase
        .from('v_cash_by_location')
        .select('*')
        .in('store_id', storeFilter)
        .gte('report_date', startDateStr)
        .order('report_date', { ascending: false })

      if (error) throw error

      // Group by location
      const byLocation: Record<string, {
        location_id: string
        location_name: string
        cash_sales: number
        card_sales: number
        total_sales: number
        total_tax: number
        transaction_count: number
      }> = {}

      data.forEach(row => {
        const key = row.location_id
        if (!byLocation[key]) {
          byLocation[key] = {
            location_id: row.location_id,
            location_name: row.location_name || 'Unknown',
            cash_sales: 0,
            card_sales: 0,
            total_sales: 0,
            total_tax: 0,
            transaction_count: 0,
          }
        }
        byLocation[key].cash_sales += Number(row.cash_sales || 0)
        byLocation[key].card_sales += Number(row.card_sales || 0)
        byLocation[key].total_sales += Number(row.total_sales || 0)
        byLocation[key].total_tax += Number(row.total_tax || 0)
        byLocation[key].transaction_count += Number(row.total_transaction_count || 0)
      })

      return createSuccessResponse(
        Object.values(byLocation).sort((a, b) => b.total_sales - a.total_sales),
        60
      )
    }

    if (view === 'by-payment-method') {
      const { data, error } = await supabase
        .from('v_cash_by_payment_method')
        .select('*')
        .in('store_id', storeFilter)
        .gte('report_date', startDateStr)

      if (error) throw error

      // Aggregate by payment method
      const byMethod: Record<string, {
        payment_method: string
        transaction_count: number
        total_amount: number
        tax_amount: number
        tip_amount: number
      }> = {}

      data.forEach(row => {
        const key = row.payment_method || 'unknown'
        if (!byMethod[key]) {
          byMethod[key] = {
            payment_method: key,
            transaction_count: 0,
            total_amount: 0,
            tax_amount: 0,
            tip_amount: 0,
          }
        }
        byMethod[key].transaction_count += Number(row.transaction_count || 0)
        byMethod[key].total_amount += Number(row.total_amount || 0)
        byMethod[key].tax_amount += Number(row.tax_amount || 0)
        byMethod[key].tip_amount += Number(row.tip_amount || 0)
      })

      const result = Object.values(byMethod).sort((a, b) => b.total_amount - a.total_amount)
      const total = result.reduce((sum, r) => sum + r.total_amount, 0)

      return createSuccessResponse(
        result.map(r => ({
          ...r,
          percentage: total > 0 ? Math.round((r.total_amount / total) * 10000) / 100 : 0
        })),
        60
      )
    }

    if (view === 'monthly') {
      const { data, error } = await supabase
        .from('v_cash_monthly_summary')
        .select('*')
        .in('store_id', storeFilter)
        .order('month', { ascending: false })
        .limit(12)

      if (error) throw error

      // Aggregate if multiple stores
      const byMonth: Record<string, {
        month: string
        cash_sales: number
        card_sales: number
        other_sales: number
        total_sales: number
        transaction_count: number
        active_days: number
        total_tax_collected: number
        total_refunds: number
      }> = {}

      data.forEach(row => {
        const key = row.month
        if (!byMonth[key]) {
          byMonth[key] = {
            month: row.month,
            cash_sales: 0,
            card_sales: 0,
            other_sales: 0,
            total_sales: 0,
            transaction_count: 0,
            active_days: 0,
            total_tax_collected: 0,
            total_refunds: 0,
          }
        }
        byMonth[key].cash_sales += Number(row.cash_sales || 0)
        byMonth[key].card_sales += Number(row.card_sales || 0)
        byMonth[key].other_sales += Number(row.other_sales || 0)
        byMonth[key].total_sales += Number(row.total_sales || 0)
        byMonth[key].transaction_count += Number(row.transaction_count || 0)
        byMonth[key].active_days = Math.max(byMonth[key].active_days, Number(row.active_days || 0))
        byMonth[key].total_tax_collected += Number(row.total_tax_collected || 0)
        byMonth[key].total_refunds += Number(row.total_refunds || 0)
      })

      return createSuccessResponse(
        Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month)),
        60
      )
    }

    return createErrorResponse('Invalid view parameter', 400)
  } catch (error) {
    console.error('Error fetching cash data:', error)
    return createErrorResponse('Failed to fetch cash management data', 500)
  }
}
