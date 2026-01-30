import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportDocument, type ReactPDFReportData } from '@/lib/reports/exporters/react-pdf'

export async function POST(request: NextRequest) {
  try {
    const data: ReactPDFReportData = await request.json()

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

    // Render React PDF to buffer (server-side)
    const pdfBuffer = await renderToBuffer(
      React.createElement(ReportDocument, { data }) as any
    )

    // Return PDF with proper headers
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
