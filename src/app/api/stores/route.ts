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
      .from('stores')
      .select('id, store_name, slug, status, city, state, logo_url')
      .in('id', result.storeIds)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
  }
}
