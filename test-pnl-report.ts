/**
 * Test P&L Report Generation with All Data
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function generatePnLReport() {
  console.log('Fetching all daily sales data...')

  // Fetch all data from v_daily_sales (no limit)
  const { data, error } = await supabase
    .from('v_daily_sales')
    .select('sale_date, order_count, total_revenue, total_cogs, total_profit')
    .gte('sale_date', '2026-01-01')
    .order('sale_date', { ascending: false })

  if (error) {
    console.error('Error fetching data:', error)
    return
  }

  console.log(`Fetched ${data.length} days of data`)

  // Calculate totals
  const totals = data.reduce((acc, row) => ({
    orders: acc.orders + Number(row.order_count || 0),
    revenue: acc.revenue + Number(row.total_revenue || 0),
    cost: acc.cost + Number(row.total_cogs || 0),
    profit: acc.profit + Number(row.total_profit || 0),
  }), { orders: 0, revenue: 0, cost: 0, profit: 0 })

  const margin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0

  console.log('\nTotals:')
  console.log(`Orders: ${totals.orders}`)
  console.log(`Revenue: $${totals.revenue.toFixed(2)}`)
  console.log(`COGS: $${totals.cost.toFixed(2)}`)
  console.log(`Profit: $${totals.profit.toFixed(2)}`)
  console.log(`Margin: ${margin.toFixed(1)}%`)

  // Format rows for PDF
  const rows = data.map(row => ({
    date: new Date(row.sale_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    orders: Number(row.order_count || 0),
    revenue: Number(row.total_revenue || 0),
    cost: Number(row.total_cogs || 0),
    profit: Number(row.total_profit || 0),
    margin: Number(row.total_revenue) > 0
      ? ((Number(row.total_profit) / Number(row.total_revenue)) * 100)
      : 0
  }))

  // Generate PDF
  const pdfData = {
    title: 'Profit & Loss Report',
    subtitle: 'Complete Financial Analysis',
    dateRange: `Jan 1 - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    dimensions: ['date'],
    metrics: ['orders', 'revenue', 'cost', 'profit', 'margin'],
    rows,
    totals: {
      orders: totals.orders,
      revenue: totals.revenue,
      cost: totals.cost,
      profit: totals.profit,
      margin,
    },
    metadata: {
      rowCount: rows.length,
      executionTime: 0,
    },
  }

  console.log('\nGenerating PDF...')

  const response = await fetch('http://localhost:3001/api/reports/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pdfData),
  })

  if (!response.ok) {
    console.error('PDF generation failed:', await response.text())
    return
  }

  const buffer = await response.arrayBuffer()
  const fs = await import('fs')
  const path = '/Users/f/Desktop/newdash/pnl-report-COMPLETE.pdf'
  fs.writeFileSync(path, Buffer.from(buffer))

  console.log(`\nPDF saved to: ${path}`)
  console.log(`File size: ${(buffer.byteLength / 1024).toFixed(1)} KB`)

  // Open the PDF
  const { exec } = await import('child_process')
  exec(`open "${path}"`)
}

generatePnLReport().catch(console.error)
