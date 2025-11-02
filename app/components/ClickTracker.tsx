'use client'

interface ClickTrackerProps {
  design: 'A' | 'B'
  element: string
  link: string
  children: React.ReactNode
  className?: string
}

export default function ClickTracker({ design, element, link, children, className }: ClickTrackerProps) {
  const handleClick = () => {
    const sessionId = localStorage.getItem('pb_session_id') || ''
    const userId = localStorage.getItem('pb_user_id') || ''
    
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

    fetch('/api/analytics/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        type: 'click',
        data: { design, element, link, type: 'product-link' },
        timestamp: new Date().toISOString()
      })
    }).catch(() => {})
  }

  return (
    <a href={link} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}

