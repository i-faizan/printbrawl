import { NextResponse, NextRequest } from 'next/server'
import clientPromise from '@/app/lib/mongodb'

const DB_NAME = 'printbrawl'
const SESSIONS_COLLECTION = 'sessions'

// Middleware to check authentication
function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  const authHeader = request.headers.get('authorization')
  
  // Allow if token exists (simplified - in production, verify token properly)
  return !!(token || authHeader?.startsWith('Bearer '))
}

interface UserSession {
  sessionId: string
  userId: string
  startTime: string
  lastActivity: string
  endTime?: string
  referrer: string | null
  userAgent: string
  screenWidth: number
  screenHeight: number
  timezone: string
  language: string
  scrollDepth: number
  maxScrollDepth: number
  timeOnPage: number
  clicks: Array<{
    timestamp: string
    element: string
    design?: 'A' | 'B'
    type: string
    link?: string
  }>
  pageViews: number
  exitIntent: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  ipAddress?: string
  country?: string
  city?: string
}

// POST - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const session: UserSession = {
      sessionId: body.sessionId,
      userId: body.userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      referrer: body.referrer || null,
      userAgent: body.userAgent || '',
      screenWidth: body.screenWidth || 0,
      screenHeight: body.screenHeight || 0,
      timezone: body.timezone || '',
      language: body.language || '',
      scrollDepth: 0,
      maxScrollDepth: 0,
      timeOnPage: 0,
      clicks: [],
      pageViews: 1,
      exitIntent: false,
      deviceType: body.deviceType || 'desktop',
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                  request.headers.get('x-real-ip') || 'unknown',
      country: body.country || null,
      city: body.city || null
    }

    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(SESSIONS_COLLECTION)
    
    // Check if session already exists
    const existing = await collection.findOne({ sessionId: session.sessionId } as any)
    if (existing) {
      // Update existing session
      await collection.updateOne(
        { sessionId: session.sessionId } as any,
        { $set: { 
          lastActivity: session.lastActivity,
          pageViews: (existing as any).pageViews + 1
        } as any}
      )
      const { _id, createdAt, ...existingData } = existing as any
      return NextResponse.json({ success: true, session: existingData })
    }
    
    // Insert new session
    await collection.insertOne({
      ...session,
      createdAt: new Date(session.startTime)
    } as any)
    
    // Cleanup old sessions (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
    await collection.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    })
    
    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// PUT - Update existing session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(SESSIONS_COLLECTION)
    
    const session = await collection.findOne({ sessionId: body.sessionId } as any)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const update: any = {
      lastActivity: now
    }
    
    // Update session based on type
    if (body.type === 'scroll') {
      const scrollDepth = body.data.scrollDepth || 0
      update.scrollDepth = scrollDepth
      update.maxScrollDepth = Math.max(session.maxScrollDepth || 0, scrollDepth)
    } else if (body.type === 'click') {
      const newClick = {
        timestamp: body.timestamp || now,
        element: body.data.element || '',
        design: body.data.design,
        type: body.data.type || 'click',
        link: body.data.link
      }
      await collection.updateOne(
        { sessionId: body.sessionId } as any,
        { $push: { clicks: newClick } } as any
      )
      const updatedSession = await collection.findOne({ sessionId: body.sessionId } as any)
      const { _id: updatedId, createdAt: updatedCreatedAt, ...updatedSessionData } = updatedSession as any
      return NextResponse.json({ success: true, session: updatedSessionData })
    } else if (body.type === 'exit') {
      update.exitIntent = true
      update.endTime = now
      update.timeOnPage = Math.floor(
        (new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000
      )
    } else if (body.type === 'activity') {
      // Update time on page
      const timeDiff = Math.floor(
        (new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000
      )
      update.timeOnPage = timeDiff
    } else if (body.type === 'pageview') {
      update.pageViews = (session.pageViews || 1) + 1
    }

    await collection.updateOne(
      { sessionId: body.sessionId } as any,
      { $set: update } as any
    )
    
    const updatedSession = await collection.findOne({ sessionId: body.sessionId } as any)
    const { _id, createdAt, ...sessionData } = updatedSession as any
    
    return NextResponse.json({ success: true, session: sessionData })
  } catch (error) {
    console.error('Session update error:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

// GET - Retrieve sessions
export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin access
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(SESSIONS_COLLECTION)
    
    // Calculate cutoff date
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
    
    // Get filtered sessions
    const sessions = await collection.find({
      createdAt: { $gte: cutoffDate }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
    
    // Remove MongoDB _id and createdAt from response
    const filtered = sessions.map((s: any) => {
      const { _id, createdAt, ...session } = s
      return session
    })

    // Calculate summary statistics
    const summary = {
      totalSessions: filtered.length,
      uniqueUsers: new Set(filtered.map((s: UserSession) => s.userId)).size,
      avgTimeOnPage: filtered.length > 0
        ? Math.round(filtered.reduce((sum: number, s: UserSession) => sum + s.timeOnPage, 0) / filtered.length)
        : 0,
      avgScrollDepth: filtered.length > 0
        ? Math.round(filtered.reduce((sum: number, s: UserSession) => sum + s.maxScrollDepth, 0) / filtered.length)
        : 0,
      totalClicks: filtered.reduce((sum: number, s: UserSession) => sum + s.clicks.length, 0),
      exitIntentRate: filtered.length > 0
        ? Math.round((filtered.filter((s: UserSession) => s.exitIntent).length / filtered.length) * 100)
        : 0,
      deviceBreakdown: {
        mobile: filtered.filter((s: UserSession) => s.deviceType === 'mobile').length,
        tablet: filtered.filter((s: UserSession) => s.deviceType === 'tablet').length,
        desktop: filtered.filter((s: UserSession) => s.deviceType === 'desktop').length
      },
      referrerBreakdown: filtered.reduce((acc: { [key: string]: number }, s: UserSession) => {
        const ref = s.referrer || 'Direct'
        acc[ref] = (acc[ref] || 0) + 1
        return acc
      }, {}),
      designAClicks: filtered.reduce((sum: number, s: UserSession) => 
        sum + s.clicks.filter(c => c.design === 'A').length, 0
      ),
      designBClicks: filtered.reduce((sum: number, s: UserSession) => 
        sum + s.clicks.filter(c => c.design === 'B').length, 0
      )
    }

    return NextResponse.json({ sessions: filtered, summary })
  } catch (error) {
    console.error('Sessions retrieval error:', error)
    return NextResponse.json({ error: 'Failed to retrieve sessions' }, { status: 500 })
  }
}

// DELETE - Clear all sessions data
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const client = await clientPromise()
    const db = client.db(DB_NAME)
    const collection = db.collection(SESSIONS_COLLECTION)
    
    // Clear all sessions
    await collection.deleteMany({})
    
    return NextResponse.json({ success: true, message: 'All sessions data cleared' })
  } catch (error) {
    console.error('Clear sessions error:', error)
    return NextResponse.json({ error: 'Failed to clear sessions' }, { status: 500 })
  }
}
