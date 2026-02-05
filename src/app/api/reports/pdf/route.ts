import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportDocument, type ReactPDFReportData } from '@/lib/reports/exporters/react-pdf'

export async function POST(request: NextRequest) {
  try {
    const data: ReactPDFReportData = await request.json()

    console.log(`[PDF Export] Generating PDF with ${data.rows?.length || 0} rows`)

    // Validate data
    if (!data.dimensions || data.dimensions.length === 0) {
      return NextResponse.json(
        { error: 'At least one dimension is required' },
        { status: 400 }
      )
    }

    if (!data.metrics || data.metrics.length === 0) {
      return NextResponse.json(
        { error: 'At least one metric is required' },
        { status: 400 }
      )
    }

    // Limit rows to prevent timeout (max 1000 rows in PDF)
    if (data.rows && data.rows.length > 1000) {
      console.warn(`[PDF Export] Truncating ${data.rows.length} rows to 1000 for PDF`)
      data.rows = data.rows.slice(0, 1000)
    }

    // Render React PDF to buffer (server-side)
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, { data }) as any
    )

    console.log(`[PDF Export] Generated PDF buffer: ${pdfBuffer.length} bytes`)

    // Return PDF with proper headers
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[PDF Export] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
