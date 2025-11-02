import { NextResponse, NextRequest } from 'next/server'
import clientPromise from '@/app/lib/mongodb'

const DB_NAME = 'printbrawl'
const ANALYTICS_COLLECTION = 'analytics'

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
  link?: string
  sessionId?: string
  userId?: string
  value?: number
}

// POST - Track analytics event
export async function POST(request: Request) {
  try {
    const body: AnalyticsEvent = await request.json()
    
    // Validate event
    if (!body.type || !body.timestamp) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(ANALYTICS_COLLECTION)
    
    // Insert event
    await collection.insertOne({
      ...body,
      createdAt: new Date(body.timestamp)
    })
    
    // Cleanup old events (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
    await collection.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    })
    
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
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(ANALYTICS_COLLECTION)
    
    // Calculate cutoff date
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
    
    // Get filtered events
    const events = await collection.find({
      createdAt: { $gte: cutoffDate }
    }).sort({ createdAt: -1 }).toArray()
    
    // Convert to AnalyticsEvent format
    const analytics: AnalyticsEvent[] = events.map((e: any) => {
      const { _id, createdAt, ...event } = e
      return {
        ...event,
        timestamp: event.timestamp || createdAt.toISOString()
      }
    })

    // Separate by type
    const pageviews = analytics.filter(e => e.type === 'pageview')
    const clicks = analytics.filter(e => e.type === 'click')
    const purchases = analytics.filter(e => e.type === 'purchase')

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
    
    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(ANALYTICS_COLLECTION)
    
    // Clear all analytics
    await collection.deleteMany({})
    
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
