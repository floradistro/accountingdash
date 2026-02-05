import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function listTables() {
  // Try to query some known tables to test access
  const tables = [
    'orders',
    'order_items',
    'purchase_orders',
    'po',
    'inventory',
    'products',
    'suppliers',
    'vendors',
    'stores',
    'locations'
  ]

  console.log('Testing table access:\n')

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (!error && data !== null) {
      const cols = data.length > 0 ? Object.keys(data[0]) : []
      console.log(`✓ ${table}`, cols.length > 0 ? `(${cols.slice(0, 5).join(', ')}${cols.length > 5 ? '...' : ''})` : '')
    } else if (error?.message.includes('does not exist')) {
      console.log(`✗ ${table} - does not exist`)
    } else {
      console.log(`✗ ${table} - ${error?.message || 'unknown error'}`)
    }
  }
}

listTables().catch(console.error)
