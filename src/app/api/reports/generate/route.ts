import { NextRequest, NextResponse } from 'next/server'
import { ReportGenerator } from '@/lib/reports/generator'
import { ReportRequest } from '@/lib/reports/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReportRequest

    // Generate report data
    const result = await ReportGenerator.generate(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    // Return report data
    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    )
  }
}
