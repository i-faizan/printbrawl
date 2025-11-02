import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json')

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Middleware to check authentication
function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  const authHeader = request.headers.get('authorization')
  
  // Allow if token exists (simplified - in production, verify token properly)
  return !!(token || authHeader?.startsWith('Bearer '))
}

interface AnalyticsEvent {
  type: 'pageview' | 'click' | 'purchase'
  timestamp: string
  design?: 'A' | 'B'
  element?: string
  value?: number
}

// POST - Track analytics event
export async function POST(request: Request) {
  try {
    await ensureDataDir()
    const body: AnalyticsEvent = await request.json()
    
    // Validate event
    if (!body.type || !body.timestamp) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    // Read existing analytics
    let analytics: AnalyticsEvent[] = []
    try {
      const data = await fs.readFile(ANALYTICS_FILE, 'utf-8')
      analytics = JSON.parse(data)
    } catch {
      // File doesn't exist, start fresh
    }

    // Add new event
    analytics.push(body)

    // Keep only last 30 days of data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    analytics = analytics.filter(
      event => new Date(event.timestamp).getTime() > thirtyDaysAgo
    )

    // Save analytics
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

// GET - Retrieve analytics data
export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin access
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await ensureDataDir()
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    // Read analytics
    let analytics: AnalyticsEvent[] = []
    try {
      const data = await fs.readFile(ANALYTICS_FILE, 'utf-8')
      analytics = JSON.parse(data)
    } catch {
      return NextResponse.json({
        pageviews: [],
        clicks: [],
        purchases: [],
        summary: {
          totalPageviews: 0,
          totalClicks: 0,
          totalPurchases: 0,
          designAClicks: 0,
          designBClicks: 0,
          designAPurchases: 0,
          designBPurchases: 0
        },
        recent: {
          pageviews: [],
          clicks: [],
          purchases: []
        }
      })
    }

    // Filter by date range
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
    const filtered = analytics.filter(
      event => new Date(event.timestamp).getTime() > cutoffDate
    )

    // Separate by type
    const pageviews = filtered.filter(e => e.type === 'pageview')
    const clicks = filtered.filter(e => e.type === 'click')
    const purchases = filtered.filter(e => e.type === 'purchase')

    // Calculate summary
    const designAClicks = clicks.filter(e => e.design === 'A').length
    const designBClicks = clicks.filter(e => e.design === 'B').length
    const designAPurchases = purchases.filter(e => e.design === 'A').length
    const designBPurchases = purchases.filter(e => e.design === 'B').length

    // Group by date for charts
    const pageviewsByDate = groupByDate(pageviews, days)
    const clicksByDate = groupByDate(clicks, days)
    const purchasesByDate = groupByDate(purchases, days)

    return NextResponse.json({
      pageviews: pageviewsByDate,
      clicks: clicksByDate,
      purchases: purchasesByDate,
      summary: {
        totalPageviews: pageviews.length,
        totalClicks: clicks.length,
        totalPurchases: purchases.length,
        designAClicks,
        designBClicks,
        designAPurchases,
        designBPurchases
      },
      recent: {
        pageviews: pageviews.slice(-10).reverse() || [],
        clicks: clicks.slice(-10).reverse() || [],
        purchases: purchases.slice(-10).reverse() || []
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to retrieve analytics' }, { status: 500 })
  }
}

// DELETE - Clear all analytics data
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await ensureDataDir()
    
    // Clear analytics file
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify({
      pageviews: [],
      clicks: [],
      purchases: []
    }))
    
    return NextResponse.json({ success: true, message: 'All analytics data cleared' })
  } catch (error) {
    console.error('Clear analytics error:', error)
    return NextResponse.json({ error: 'Failed to clear analytics' }, { status: 500 })
  }
}

function groupByDate(events: AnalyticsEvent[], days: number): { date: string; count: number }[] {
  const grouped: { [key: string]: number } = {}
  const today = new Date()
  
  // Initialize all dates in range with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    grouped[dateStr] = 0
  }

  // Count events by date
  events.forEach(event => {
    const date = new Date(event.timestamp).toISOString().split('T')[0]
    if (grouped[date] !== undefined) {
      grouped[date]++
    }
  })

  // Convert to array and sort
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

