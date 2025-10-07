import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?gsc_error=access_denied', request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard?gsc_error=invalid_request', request.url))
    }

    // Decode state to get user ID
    const { userId } = JSON.parse(Buffer.from(state, 'base64url').toString())

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user || user.id !== userId) {
      return NextResponse.redirect(new URL('/dashboard?gsc_error=unauthorized', request.url))
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/gsc/callback`

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/dashboard?gsc_error=token_exchange_failed', request.url))
    }

    const tokens = await tokenResponse.json()
    const { access_token, refresh_token, expires_in, scope, token_type } = tokens

    // Get list of GSC sites for this user
    const sitesResponse = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!sitesResponse.ok) {
      console.error('Failed to fetch GSC sites')
      return NextResponse.redirect(new URL('/dashboard?gsc_error=fetch_sites_failed', request.url))
    }

    const sitesData = await sitesResponse.json()
    const sites = sitesData.siteEntry || []

    // Use the first verified site, or the first site if none are verified
    const verifiedSite = sites.find((site: any) => site.permissionLevel === 'siteOwner')
    const siteUrl = verifiedSite?.siteUrl || sites[0]?.siteUrl

    if (!siteUrl) {
      console.error('No GSC sites found')
      return NextResponse.redirect(new URL('/dashboard?gsc_error=no_sites_found', request.url))
    }

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    // Store tokens in gsc_connections table
    const { error: insertError } = await supabase
      .from('gsc_connections')
      .upsert({
        user_id: user.id,
        site_url: siteUrl,
        access_token,
        refresh_token,
        token_type: token_type || 'Bearer',
        expires_at: expiresAt,
        scope: scope || 'https://www.googleapis.com/auth/webmasters.readonly',
      }, {
        onConflict: 'user_id,site_url'
      })

    if (insertError) {
      console.error('Error storing GSC tokens:', insertError)
      return NextResponse.redirect(new URL('/dashboard?gsc_error=storage_failed', request.url))
    }

    // Success - redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard?gsc_success=true', request.url))
  } catch (error) {
    console.error('Error in GSC callback:', error)
    return NextResponse.redirect(new URL('/dashboard?gsc_error=internal_error', request.url))
  }
}
