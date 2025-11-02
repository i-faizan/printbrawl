import { NextResponse, NextRequest } from 'next/server'

// POST - Authenticate admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123' // Default for development
    
    if (password === adminPassword) {
      // Generate a simple session token
      const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
      
      const response = NextResponse.json({ success: true, token })
      
      // Set HTTP-only cookie (more secure)
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })
      
      return response
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

// GET - Verify authentication
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    const authHeader = request.headers.get('authorization')
    
    if (token || authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ authenticated: true })
    }
    
    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

