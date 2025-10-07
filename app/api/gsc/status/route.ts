import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ connected: false }, { status: 401 })
    }

    // Check if user has GSC connection
    const { data, error } = await supabase
      .from('gsc_connections')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const connected = !error && !!data

    return NextResponse.json({ connected })
  } catch (error) {
    console.error('Error checking GSC status:', error)
    return NextResponse.json({ connected: false }, { status: 500 })
  }
}
