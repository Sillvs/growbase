import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGSCMetrics, getGSCTimeSeriesData, getGSCTopPages } from '@/lib/gsc/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 })
    }

    // Fetch all GSC data in parallel
    const [metrics, timeSeries, topPages] = await Promise.all([
      getGSCMetrics(user.id, startDate, endDate),
      getGSCTimeSeriesData(user.id, startDate, endDate),
      getGSCTopPages(user.id, startDate, endDate, 10),
    ])

    return NextResponse.json({
      metrics,
      timeSeries,
      topPages,
    })
  } catch (error) {
    console.error('Error fetching GSC data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
