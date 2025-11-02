'use client'

import { useEffect } from 'react'

export default function AnalyticsTracker() {
  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem('pb_session_id')
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pb_session_id', sessionId)
    }

    // Generate or retrieve user ID
    let userId = localStorage.getItem('pb_user_id')
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('pb_user_id', userId)
    }

    // Create or update session
    fetch('/api/analytics/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userId,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
      })
    }).catch(() => {})

    // Track page view
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pageview',
        timestamp: new Date().toISOString(),
        sessionId,
        userId
      })
    }).catch(() => {})

    // Update session activity
    fetch('/api/analytics/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        type: 'pageview',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {})

    // Track scroll depth
    let maxScroll = 0
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
      
      if (scrollDepth > maxScroll) {
        maxScroll = scrollDepth
        fetch('/api/analytics/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            type: 'scroll',
            data: { scrollDepth },
            timestamp: new Date().toISOString()
          })
        }).catch(() => {})
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Track time on page every 10 seconds
    const timeInterval = setInterval(() => {
      fetch('/api/analytics/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type: 'activity',
          timestamp: new Date().toISOString()
        })
      }).catch(() => {})
    }, 10000)

    // Track exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        fetch('/api/analytics/sessions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            type: 'exit',
            timestamp: new Date().toISOString()
          })
        }).catch(() => {})
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    // Track before unload
    const handleBeforeUnload = () => {
      fetch('/api/analytics/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type: 'exit',
          timestamp: new Date().toISOString()
        }),
        keepalive: true
      }).catch(() => {})
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(timeInterval)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}

