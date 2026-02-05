import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReportQueryBuilder, type ReportQuery } from '@/lib/reports/query-builder'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const query: ReportQuery = await request.json()

    // Debug logging
    console.log('Report Query Received:', JSON.stringify(query, null, 2))

    // Validate query
    if (!query.dimensions || query.dimensions.length === 0) {
      return NextResponse.json(
        { error: 'At least one dimension is required' },
        { status: 400 }
      )
    }

    if (!query.metrics || query.metrics.length === 0) {
      return NextResponse.json(
        { error: 'At least one metric is required' },
        { status: 400 }
      )
    }

    // Execute query
    const result = await ReportQueryBuilder.execute(supabase, query)

    // Debug logging
    console.log('Report Result:', {
      rowCount: result.metadata.rowCount,
      totalMetrics: result.totals,
      executionTime: result.metadata.executionTime
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Report query error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute report query' },
      { status: 500 }
    )
  }
}
