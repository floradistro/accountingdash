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

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('pos_safe_balances')
      .select('*')
      .in('store_id', storeFilter)

    if (error) throw error

    return createSuccessResponse(data, 60)
  } catch (error) {
    console.error('Error fetching safe balances:', error)
    return createErrorResponse('Failed to fetch safe balances', 500)
  }
}
