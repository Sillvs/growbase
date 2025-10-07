import { createClient } from '@/lib/supabase/server'
import type { GSCMetrics, GSCTimeSeriesData, GSCPageData } from './types'

export type { GSCMetrics, GSCTimeSeriesData, GSCPageData }

interface GSCAPIRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  const data = await response.json()
  return data.access_token
}

async function getValidAccessToken(userId: string): Promise<{ accessToken: string; siteUrl: string } | null> {
  const supabase = await createClient()

  // Get the GSC connection for this user
  const { data: connection, error } = await supabase
    .from('gsc_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !connection) {
    console.error('No GSC connection found for user:', userId)
    return null
  }

  const now = new Date()
  const expiresAt = new Date(connection.expires_at)

  // If token is expired, refresh it
  if (now >= expiresAt) {
    try {
      const newAccessToken = await refreshAccessToken(connection.refresh_token)
      const newExpiresAt = new Date(Date.now() + 3600 * 1000).toISOString()

      // Update the token in database
      await supabase
        .from('gsc_connections')
        .update({
          access_token: newAccessToken,
          expires_at: newExpiresAt,
        })
        .eq('user_id', userId)

      return { accessToken: newAccessToken, siteUrl: connection.site_url }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return null
    }
  }

  return { accessToken: connection.access_token, siteUrl: connection.site_url }
}

export async function getGSCMetrics(userId: string, startDate: string, endDate: string): Promise<GSCMetrics | null> {
  try {
    const tokenData = await getValidAccessToken(userId)
    if (!tokenData) return null

    const { accessToken, siteUrl } = tokenData

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: [],
        }),
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch GSC metrics:', await response.text())
      return null
    }

    const data = await response.json()

    if (!data.rows || data.rows.length === 0) {
      return { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    }

    const row = data.rows[0]
    return {
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }
  } catch (error) {
    console.error('Error fetching GSC metrics:', error)
    return null
  }
}

export async function getGSCTimeSeriesData(
  userId: string,
  startDate: string,
  endDate: string
): Promise<GSCTimeSeriesData[]> {
  try {
    const tokenData = await getValidAccessToken(userId)
    if (!tokenData) return []

    const { accessToken, siteUrl } = tokenData

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['date'],
        }),
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch GSC time series:', await response.text())
      return []
    }

    const data = await response.json()

    if (!data.rows || data.rows.length === 0) {
      return []
    }

    return data.rows.map((row: GSCAPIRow) => ({
      date: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }))
  } catch (error) {
    console.error('Error fetching GSC time series:', error)
    return []
  }
}

export async function getGSCTopPages(
  userId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<GSCPageData[]> {
  try {
    const tokenData = await getValidAccessToken(userId)
    if (!tokenData) return []

    const { accessToken, siteUrl } = tokenData

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: limit,
        }),
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch GSC top pages:', await response.text())
      return []
    }

    const data = await response.json()

    if (!data.rows || data.rows.length === 0) {
      return []
    }

    return data.rows.map((row: GSCAPIRow) => ({
      page: row.keys[0],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }))
  } catch (error) {
    console.error('Error fetching GSC top pages:', error)
    return []
  }
}

export async function checkGSCConnection(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gsc_connections')
    .select('id')
    .eq('user_id', userId)
    .single()

  return !error && !!data
}
