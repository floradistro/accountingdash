import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserStore } from '@/lib/get-user-store'

export async function GET(request: NextRequest) {
  try {
    const result = await getUserStore()
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { searchParams } = new URL(request.url)
    const requestedStoreId = searchParams.get('storeId')

    // Determine which store(s) to query
    let storeFilter: string[]
    if (requestedStoreId && requestedStoreId !== 'all') {
      if (!result.storeIds.includes(requestedStoreId)) {
        return NextResponse.json({ error: 'Access denied to this store' }, { status: 403 })
      }
      storeFilter = [requestedStoreId]
    } else {
      storeFilter = result.storeIds
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('v_store_performance')
      .select('*')
      .in('store_id', storeFilter)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching store performance:', error)
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 })
  }
}
