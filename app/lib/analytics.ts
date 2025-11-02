// Client-side analytics tracking utilities

export interface UserSession {
  sessionId: string
  userId: string
  startTime: string
  lastActivity: string
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
  }>
  pageViews: number
  exitIntent: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateUserId(): string {
  let userId = localStorage.getItem('pb_user_id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('pb_user_id', userId)
  }
  return userId
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

export function trackClick(design: 'A' | 'B', element: string, link: string) {
  const sessionId = localStorage.getItem('pb_session_id') || ''
  const userId = generateUserId()
  
  // Track the click
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'click',
      timestamp: new Date().toISOString(),
      design,
      element,
      link,
      sessionId,
      userId
    })
  }).catch(() => {})

  // Update session with click
  trackUserActivity('click', { design, element })
}

export function trackUserActivity(type: string, data?: any) {
  const sessionId = localStorage.getItem('pb_session_id') || ''
  if (!sessionId) return

  fetch('/api/analytics/sessions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      type,
      data,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {})
}

