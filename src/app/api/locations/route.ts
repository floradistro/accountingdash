import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserStore } from '@/lib/get-user-store'

export async function GET() {
  try {
    const result = await getUserStore()
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, slug, type, store_id, city, state')
      .in('store_id', result.storeIds)
      .eq('is_active', true)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}
