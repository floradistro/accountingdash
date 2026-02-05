import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkPurchaseOrders() {
  console.log('Checking for purchase order tables...\n')

  // Try to query purchase_orders table
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .select('*')
    .limit(1)

  if (!poError && po) {
    console.log('✓ purchase_orders table exists')
    if (po.length > 0) {
      console.log('Sample columns:', Object.keys(po[0]).join(', '))
      console.log('Sample record:', po[0])
    }
  } else {
    console.log('✗ purchase_orders table:', poError?.message || 'Not found')
  }

  // Check for purchase_order_items
  const { data: poItems, error: poItemsError } = await supabase
    .from('purchase_order_items')
    .select('*')
    .limit(1)

  if (!poItemsError && poItems) {
    console.log('\n✓ purchase_order_items table exists')
    if (poItems.length > 0) {
      console.log('Sample columns:', Object.keys(poItems[0]).join(', '))
    }
  } else {
    console.log('\n✗ purchase_order_items table:', poItemsError?.message || 'Not found')
  }

  // Check for views
  const { data: views, error: viewsError } = await supabase
    .from('information_schema.views')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%purchase%')

  if (!viewsError && views && views.length > 0) {
    console.log('\nPurchase-related views:', views.map((v: any) => v.table_name).join(', '))
  } else {
    console.log('\n✗ No purchase-related views found')
  }

  // Get count if table exists
  if (!poError) {
    const { count } = await supabase
      .from('purchase_orders')
      .select('*', { count: 'exact', head: true })

    console.log(`\nTotal purchase orders: ${count || 0}`)
  }
}

checkPurchaseOrders().catch(console.error)
