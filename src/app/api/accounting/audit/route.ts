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
    const days = getDaysFromParams(searchParams, 30)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('daily_audit_summary')
      .select('*')
      .in('store_id', storeFilter)
      .gte('audit_date', startDate.toISOString().split('T')[0])
      .order('audit_date', { ascending: false })

    if (error) throw error

    return createSuccessResponse(data, 60)
  } catch (error) {
    console.error('Error fetching audit data:', error)
    return createErrorResponse('Failed to fetch audit data', 500)
  }
}
