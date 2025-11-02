import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json')

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
    await ensureDataDir()
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

    let sessions: UserSession[] = []
    try {
      const data = await fs.readFile(SESSIONS_FILE, 'utf-8')
      sessions = JSON.parse(data)
    } catch {
      // File doesn't exist, start fresh
    }

    // Remove old sessions (older than 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    sessions = sessions.filter(
      s => new Date(s.startTime).getTime() > thirtyDaysAgo
    )

    sessions.push(session)
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
    
    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// PUT - Update existing session
export async function PUT(request: NextRequest) {
  try {
    await ensureDataDir()
    const body = await request.json()
    
    let sessions: UserSession[] = []
    try {
      const data = await fs.readFile(SESSIONS_FILE, 'utf-8')
      sessions = JSON.parse(data)
    } catch {
      return NextResponse.json({ error: 'No sessions found' }, { status: 404 })
    }

    const sessionIndex = sessions.findIndex(s => s.sessionId === body.sessionId)
    if (sessionIndex === -1) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const session = sessions[sessionIndex]
    const now = new Date().toISOString()
    
    // Update session based on type
    if (body.type === 'scroll') {
      session.scrollDepth = body.data.scrollDepth || 0
      session.maxScrollDepth = Math.max(session.maxScrollDepth, session.scrollDepth)
    } else if (body.type === 'click') {
      session.clicks.push({
        timestamp: body.timestamp || now,
        element: body.data.element || '',
        design: body.data.design,
        type: body.data.type || 'click',
        link: body.data.link
      })
    } else if (body.type === 'exit') {
      session.exitIntent = true
      session.endTime = now
      session.timeOnPage = Math.floor(
        (new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000
      )
    } else if (body.type === 'activity') {
      // Update time on page
      const timeDiff = Math.floor(
        (new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000
      )
      session.timeOnPage = timeDiff
      session.lastActivity = now
    } else if (body.type === 'pageview') {
      session.pageViews++
    }

    session.lastActivity = now

    sessions[sessionIndex] = session
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
    
    return NextResponse.json({ success: true, session })
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
    
    await ensureDataDir()
    
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let sessions: UserSession[] = []
    try {
      const data = await fs.readFile(SESSIONS_FILE, 'utf-8')
      sessions = JSON.parse(data)
    } catch {
      return NextResponse.json({ sessions: [], summary: getEmptySummary() })
    }

    // Filter by date range
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
    let filtered = sessions.filter(
      s => new Date(s.startTime).getTime() > cutoffDate
    )

    // Sort by start time (newest first) and limit
    filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
    filtered = filtered.slice(0, limit)

    // Calculate summary statistics
    const summary = {
      totalSessions: filtered.length,
      uniqueUsers: new Set(filtered.map(s => s.userId)).size,
      avgTimeOnPage: filtered.length > 0
        ? Math.round(filtered.reduce((sum, s) => sum + s.timeOnPage, 0) / filtered.length)
        : 0,
      avgScrollDepth: filtered.length > 0
        ? Math.round(filtered.reduce((sum, s) => sum + s.maxScrollDepth, 0) / filtered.length)
        : 0,
      totalClicks: filtered.reduce((sum, s) => sum + s.clicks.length, 0),
      exitIntentRate: filtered.length > 0
        ? Math.round((filtered.filter(s => s.exitIntent).length / filtered.length) * 100)
        : 0,
      deviceBreakdown: {
        mobile: filtered.filter(s => s.deviceType === 'mobile').length,
        tablet: filtered.filter(s => s.deviceType === 'tablet').length,
        desktop: filtered.filter(s => s.deviceType === 'desktop').length
      },
      referrerBreakdown: filtered.reduce((acc: { [key: string]: number }, s) => {
        const ref = s.referrer || 'Direct'
        acc[ref] = (acc[ref] || 0) + 1
        return acc
      }, {}),
      designAClicks: filtered.reduce((sum, s) => 
        sum + s.clicks.filter(c => c.design === 'A').length, 0
      ),
      designBClicks: filtered.reduce((sum, s) => 
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
    
    await ensureDataDir()
    
    // Clear sessions file
    await fs.writeFile(SESSIONS_FILE, JSON.stringify([]))
    
    return NextResponse.json({ success: true, message: 'All sessions data cleared' })
  } catch (error) {
    console.error('Clear sessions error:', error)
    return NextResponse.json({ error: 'Failed to clear sessions' }, { status: 500 })
  }
}

function getEmptySummary() {
  return {
    totalSessions: 0,
    uniqueUsers: 0,
    avgTimeOnPage: 0,
    avgScrollDepth: 0,
    totalClicks: 0,
    exitIntentRate: 0,
    deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
    referrerBreakdown: {},
    designAClicks: 0,
    designBClicks: 0
  }
}

