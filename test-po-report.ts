import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testPOReport() {
  console.log('Testing Purchase Order Report...\n')

  // Test report: POs by date and supplier
  const reportQuery = {
    dataSource: 'purchase_orders',
    dimensions: ['date', 'supplier'],
    metrics: ['po_count', 'po_total', 'po_outstanding'],
    dateGranularity: 'day',
    dateFrom: '2026-02-01',
    dateTo: '2026-02-28',
  }

  console.log('Report Query:', JSON.stringify(reportQuery, null, 2))
  console.log('\nSending to API...\n')

  try {
    const response = await fetch('http://localhost:3000/api/reports/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportQuery),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('API Error:', error)
      return
    }

    const result = await response.json()

    console.log('✅ Report Generated Successfully!\n')
    console.log(`Rows: ${result.metadata.rowCount}`)
    console.log(`Execution Time: ${result.metadata.executionTime}ms\n`)

    console.log('Sample Data (first 10 rows):')
    console.log('─'.repeat(100))

    result.rows.slice(0, 10).forEach((row: any, idx: number) => {
      console.log(`${idx + 1}. ${row.date} | ${row.supplier}`)
      console.log(`   PO Count: ${row.po_count}`)
      console.log(`   Total: $${row.po_total.toFixed(2)}`)
      console.log(`   Outstanding: $${row.po_outstanding.toFixed(2)}`)
      console.log()
    })

    console.log('\nTotals:')
    console.log('─'.repeat(100))
    console.log(`Total POs: ${result.totals.po_count}`)
    console.log(`Total Amount: $${result.totals.po_total.toFixed(2)}`)
    console.log(`Total Outstanding: $${result.totals.po_outstanding.toFixed(2)}`)
    console.log(`Total Paid: $${result.totals.po_paid?.toFixed(2) || '0.00'}`)

    // Now generate PDF
    console.log('\n\nGenerating PDF...\n')

    const pdfData = {
      title: 'Purchase Order Report',
      subtitle: 'Daily PO Activity by Supplier',
      dateRange: 'Feb 1-29, 2026',
      dimensions: reportQuery.dimensions,
      metrics: reportQuery.metrics,
      rows: result.rows,
      totals: result.totals,
      metadata: result.metadata,
    }

    const pdfResponse = await fetch('http://localhost:3000/api/reports/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pdfData),
    })

    if (!pdfResponse.ok) {
      const error = await pdfResponse.json()
      console.error('PDF Error:', error)
      return
    }

    const fs = await import('fs')
    const buffer = await pdfResponse.arrayBuffer()
    const path = '/Users/f/Desktop/newdash/purchase-order-report.pdf'
    fs.writeFileSync(path, Buffer.from(buffer))

    console.log(`✅ PDF Generated: ${path}`)
    console.log(`File size: ${(buffer.byteLength / 1024).toFixed(1)} KB`)

    // Open the PDF
    const { exec } = await import('child_process')
    exec(`open "${path}"`)

  } catch (error) {
    console.error('Error:', error)
  }
}

testPOReport()
