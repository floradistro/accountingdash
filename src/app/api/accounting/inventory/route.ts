import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateAndFilterStores,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { storeIds: storeFilter, error: authError } = await validateAndFilterStores(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'summary' // summary, by-location, by-category, detail, slow-moving

    const supabase = await createClient()

    if (view === 'summary') {
      const { data, error } = await supabase
        .from('v_inventory_valuation_summary')
        .select('*')
        .in('store_id', storeFilter)

      if (error) throw error

      // Aggregate if multiple stores
      if (data.length > 1) {
        const aggregated = data.reduce((acc, row) => ({
          store_id: 'all',
          total_products: (acc.total_products || 0) + Number(row.total_products || 0),
          total_locations: (acc.total_locations || 0) + Number(row.total_locations || 0),
          total_units: (acc.total_units || 0) + Number(row.total_units || 0),
          total_value_at_cost: (acc.total_value_at_cost || 0) + Number(row.total_value_at_cost || 0),
          units_in_stock: (acc.units_in_stock || 0) + Number(row.units_in_stock || 0),
          units_low_stock: (acc.units_low_stock || 0) + Number(row.units_low_stock || 0),
          units_out_of_stock: (acc.units_out_of_stock || 0) + Number(row.units_out_of_stock || 0),
          products_low_stock: (acc.products_low_stock || 0) + Number(row.products_low_stock || 0),
          products_out_of_stock: (acc.products_out_of_stock || 0) + Number(row.products_out_of_stock || 0),
          value_in_stock: (acc.value_in_stock || 0) + Number(row.value_in_stock || 0),
          value_low_stock: (acc.value_low_stock || 0) + Number(row.value_low_stock || 0),
        }), {} as Record<string, unknown>)
        return createSuccessResponse(aggregated, 60)
      }

      return createSuccessResponse(data[0] || {
        total_products: 0,
        total_locations: 0,
        total_units: 0,
        total_value_at_cost: 0,
        units_in_stock: 0,
        units_low_stock: 0,
        units_out_of_stock: 0,
        products_low_stock: 0,
        products_out_of_stock: 0,
        value_in_stock: 0,
        value_low_stock: 0,
      }, 60)
    }

    if (view === 'by-location') {
      const { data, error } = await supabase
        .from('v_inventory_by_location')
        .select('*')
        .in('store_id', storeFilter)
        .order('total_value', { ascending: false })

      if (error) throw error
      return createSuccessResponse(data, 60)
    }

    if (view === 'by-category') {
      const { data, error } = await supabase
        .from('v_inventory_by_category')
        .select('*')
        .in('store_id', storeFilter)
        .order('total_value', { ascending: false })

      if (error) throw error
      return createSuccessResponse(data, 60)
    }

    if (view === 'detail') {
      const limit = parseInt(searchParams.get('limit') || '100')
      const status = searchParams.get('status') // 'low_stock', 'out_of_stock', 'in_stock'

      let query = supabase
        .from('v_inventory_detail')
        .select('*')
        .in('store_id', storeFilter)
        .gt('quantity', 0)
        .order('total_value', { ascending: false })
        .limit(limit)

      if (status) {
        query = query.eq('stock_status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return createSuccessResponse(data, 60)
    }

    if (view === 'slow-moving') {
      const { data, error } = await supabase
        .from('v_inventory_slow_moving')
        .select('*')
        .in('store_id', storeFilter)
        .order('inventory_value', { ascending: false })
        .limit(50)

      if (error) throw error
      return createSuccessResponse(data, 60)
    }

    return createErrorResponse('Invalid view parameter', 400)
  } catch (error) {
    console.error('Error fetching inventory data:', error)
    return createErrorResponse('Failed to fetch inventory valuation data', 500)
  }
}
