import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateAndFilterStores } from '@/lib/api-helpers'

/**
 * Week-over-Week Metrics API
 * Returns pre-calculated rolling 7-day comparison metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { storeIds: storeFilter, error: authError } = await validateAndFilterStores(request)
    if (authError) return authError

    const supabase = await createClient()

    // Get rolling 7-day metrics from view, filtered by stores
    const { data, error } = await supabase
      .from('v_rolling_7day_metrics')
      .select('*')
      .in('store_id', storeFilter)

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json({
        current: { startDate: '', endDate: '', orders: 0, revenue: 0, profit: 0 },
        previous: { startDate: '', endDate: '', orders: 0, revenue: 0, profit: 0 },
        comparison: { revenueChange: 0, revenueChangePercent: 0, ordersChange: 0 },
      })
    }

    // Aggregate across all user's stores
    const aggregated = data.reduce((acc, row) => ({
      current_orders: acc.current_orders + Number(row.current_orders || 0),
      current_revenue: acc.current_revenue + Number(row.current_revenue || 0),
      current_profit: acc.current_profit + Number(row.current_profit || 0),
      previous_orders: acc.previous_orders + Number(row.previous_orders || 0),
      previous_revenue: acc.previous_revenue + Number(row.previous_revenue || 0),
      previous_profit: acc.previous_profit + Number(row.previous_profit || 0),
      current_start: row.current_start || acc.current_start,
      current_end: row.current_end || acc.current_end,
      previous_start: row.previous_start || acc.previous_start,
      previous_end: row.previous_end || acc.previous_end,
    }), {
      current_orders: 0,
      current_revenue: 0,
      current_profit: 0,
      previous_orders: 0,
      previous_revenue: 0,
      previous_profit: 0,
      current_start: data[0].current_start,
      current_end: data[0].current_end,
      previous_start: data[0].previous_start,
      previous_end: data[0].previous_end,
    })

    const revenueChange = aggregated.current_revenue - aggregated.previous_revenue
    const revenueChangePercent = aggregated.previous_revenue > 0
      ? (revenueChange / aggregated.previous_revenue) * 100
      : 0

    // Format response
    const response = {
      current: {
        startDate: aggregated.current_start,
        endDate: aggregated.current_end,
        orders: aggregated.current_orders,
        revenue: aggregated.current_revenue,
        profit: aggregated.current_profit,
      },
      previous: {
        startDate: aggregated.previous_start,
        endDate: aggregated.previous_end,
        orders: aggregated.previous_orders,
        revenue: aggregated.previous_revenue,
        profit: aggregated.previous_profit,
      },
      comparison: {
        revenueChange,
        revenueChangePercent,
        ordersChange: aggregated.current_orders - aggregated.previous_orders,
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': process.env.NODE_ENV === 'development'
          ? 'no-store, no-cache, must-revalidate'
          : 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching WoW metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch week-over-week metrics' },
      { status: 500 }
    )
  }
}
