'use client'

import { useState, useEffect } from 'react'
import { Save, Upload, TrendingUp, TrendingDown, Smartphone, DollarSign, FileText, BarChart3, Eye, MousePointerClick, ShoppingCart, Calendar, Users, Clock, Globe, Monitor, Tablet, Phone, ExternalLink, MapPin, RefreshCw, Lock, Trash2, AlertTriangle } from 'lucide-react'

interface Config {
  designA: {
    name: string
    image: string
    mockups: string[]
    purchases: number
    link: string
  }
  designB: {
    name: string
    image: string
    mockups: string[]
    purchases: number
    link: string
  }
  price: string
  heroText: string
  features: string[]
  nextDropDate?: string | null
}

interface AnalyticsData {
  pageviews: { date: string; count: number }[]
  clicks: { date: string; count: number }[]
  purchases: { date: string; count: number }[]
  summary: {
    totalPageviews: number
    totalClicks: number
    totalPurchases: number
    designAClicks: number
    designBClicks: number
    designAPurchases: number
    designBPurchases: number
  }
  recent: {
    pageviews: any[]
    clicks: any[]
    purchases: any[]
  }
}

export default function AdminPanel() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsDays, setAnalyticsDays] = useState(7)
  const [activeTab, setActiveTab] = useState<'config' | 'analytics' | 'users'>('config')
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showClearAnalyticsConfirm, setShowClearAnalyticsConfirm] = useState(false)
  const [clearingAnalytics, setClearingAnalytics] = useState(false)

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadConfig()
      loadAnalytics()
      loadSessions()
    }
  }, [analyticsDays, authenticated])

  const checkAuthentication = async () => {
    try {
      const res = await fetch('/api/admin/auth', {
        credentials: 'include'
      })
      const data = await res.json()
      setAuthenticated(data.authenticated === true)
    } catch (error) {
      setAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setAuthenticated(true)
        setPassword('')
        loadConfig()
        loadAnalytics()
        loadSessions()
      } else {
        setAuthError('Invalid password')
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.')
    }
  }

  const handleRefresh = () => {
    loadConfig()
    loadAnalytics()
    loadSessions()
  }

  const handleClearAnalytics = async () => {
    setClearingAnalytics(true)
    try {
      // Clear analytics data
      const analyticsRes = await fetch('/api/analytics', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (analyticsRes.status === 401) {
        setAuthenticated(false)
        return
      }
      
      // Clear sessions data
      const sessionsRes = await fetch('/api/analytics/sessions', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (sessionsRes.status === 401) {
        setAuthenticated(false)
        return
      }
      
      if (analyticsRes.ok && sessionsRes.ok) {
        setMessage({ type: 'success', text: 'All analytics data cleared successfully!' })
        setShowClearAnalyticsConfirm(false)
        // Refresh data
        loadAnalytics()
        loadSessions()
      } else {
        setMessage({ type: 'error', text: 'Failed to clear analytics data' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear analytics data' })
    } finally {
      setClearingAnalytics(false)
    }
  }

  const loadSessions = async () => {
    setSessionsLoading(true)
    try {
      const res = await fetch(`/api/analytics/sessions?days=${analyticsDays}&limit=100`, {
        credentials: 'include'
      })
      if (res.status === 401) {
        setAuthenticated(false)
        return
      }
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setSessionsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      const res = await fetch(`/api/analytics?days=${analyticsDays}`, {
        credentials: 'include'
      })
      if (res.status === 401) {
        setAuthenticated(false)
        return
      }
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config', {
        credentials: 'include'
      })
      if (res.status === 401) {
        setAuthenticated(false)
        return
      }
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load config' })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      })
      
      if (res.status === 401) {
        setAuthenticated(false)
        setMessage({ type: 'error', text: 'Session expired. Please login again.' })
        return
      }
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' })
    } finally {
      setSaving(false)
    }
  }

  // Show login screen if not authenticated
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Checking authentication...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-red-600">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black mb-2 text-center">Print Brawl Admin</h1>
            <p className="text-gray-400 text-center mb-6">Enter password to access admin panel</p>
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              
              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-sm text-red-400">
                  {authError}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-bold"
              >
                Login
              </button>
            </form>
            
            <p className="mt-4 text-xs text-gray-500 text-center">
              Set ADMIN_PASSWORD environment variable to secure the admin panel
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-500">Failed to load configuration</div>
      </div>
    )
  }

  const designAWinning = config.designA.purchases >= config.designB.purchases
  const designBWinning = config.designB.purchases >= config.designA.purchases
  const gap = Math.abs(config.designA.purchases - config.designB.purchases)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-700 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black mb-2">Print Brawl Admin Panel</h1>
              <p className="text-gray-400">Manage designs, prices, text, and purchase counts</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition flex items-center gap-2"
              title="Refresh all data"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              User Sessions
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Date Range Selector and Clear Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold">Time Period:</label>
                <select
                  value={analyticsDays}
                  onChange={(e) => setAnalyticsDays(parseInt(e.target.value))}
                  className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                </select>
              </div>
              <button
                onClick={() => setShowClearAnalyticsConfirm(true)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition flex items-center gap-2"
                title="Clear all analytics data"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </button>
            </div>

            {analyticsLoading ? (
              <div className="text-center py-12 text-gray-400">Loading analytics...</div>
            ) : analytics ? (
              <>
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Page Views</h3>
                    </div>
                    <div className="text-3xl font-black text-white">{analytics.summary.totalPageviews}</div>
                  </div>

                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MousePointerClick className="h-5 w-5 text-purple-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Total Clicks</h3>
                    </div>
                    <div className="text-3xl font-black text-white">{analytics.summary.totalClicks}</div>
                  </div>

                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ShoppingCart className="h-5 w-5 text-green-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Total Purchases</h3>
                    </div>
                    <div className="text-3xl font-black text-white">{analytics.summary.totalPurchases}</div>
                  </div>

                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Conversion Rate</h3>
                    </div>
                    <div className="text-3xl font-black text-white">
                      {analytics.summary.totalClicks > 0
                        ? ((analytics.summary.totalPurchases / analytics.summary.totalClicks) * 100).toFixed(1)
                        : '0'}%
                    </div>
                  </div>
                </div>

                {/* Design Performance */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-blue-400" />
                      Design A Performance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Clicks:</span>
                        <span className="font-bold text-white">{analytics.summary.designAClicks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Purchases:</span>
                        <span className="font-bold text-white">{analytics.summary.designAPurchases}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-700">
                        <span className="text-gray-400">Click Rate:</span>
                        <span className="font-bold text-blue-400">
                          {analytics.summary.totalClicks > 0
                            ? ((analytics.summary.designAClicks / analytics.summary.totalClicks) * 100).toFixed(1)
                            : '0'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-purple-400" />
                      Design B Performance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Clicks:</span>
                        <span className="font-bold text-white">{analytics.summary.designBClicks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Purchases:</span>
                        <span className="font-bold text-white">{analytics.summary.designBPurchases}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-700">
                        <span className="text-gray-400">Click Rate:</span>
                        <span className="font-bold text-purple-400">
                          {analytics.summary.totalClicks > 0
                            ? ((analytics.summary.designBClicks / analytics.summary.totalClicks) * 100).toFixed(1)
                            : '0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Page Views Over Time
                    </h3>
                    <div className="space-y-2">
                      {analytics.pageviews.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="text-xs text-gray-400 w-20">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
                            <div
                              className="bg-blue-500 h-4 rounded-full"
                              style={{
                                width: `${Math.max(5, (item.count / Math.max(...analytics.pageviews.map(p => p.count), 1)) * 100)}%`
                              }}
                            />
                            <span className="absolute right-2 top-0 text-xs text-white">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                      Clicks Over Time
                    </h3>
                    <div className="space-y-2">
                      {analytics.clicks.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="text-xs text-gray-400 w-20">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
                            <div
                              className="bg-purple-500 h-4 rounded-full"
                              style={{
                                width: `${Math.max(5, (item.count / Math.max(...analytics.clicks.map(c => c.count), 1)) * 100)}%`
                              }}
                            />
                            <span className="absolute right-2 top-0 text-xs text-white">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {((analytics.recent?.clicks || []).concat(analytics.recent?.purchases || [])).slice(0, 20).map((event, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-700 last:border-0">
                        <div className="flex items-center gap-2">
                          {event.type === 'click' && <MousePointerClick className="h-4 w-4 text-purple-400" />}
                          {event.type === 'purchase' && <ShoppingCart className="h-4 w-4 text-green-400" />}
                          <span className="text-gray-300">
                            {event.type === 'click' ? 'Click' : 'Purchase'} on Design {event.design}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {((analytics.recent?.clicks || []).concat(analytics.recent?.purchases || [])).length === 0 && (
                      <div className="text-center py-8 text-gray-500">No recent activity</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">No analytics data available</div>
            )}
          </div>
        )}

        {/* User Sessions Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            {sessionsLoading ? (
              <div className="text-center py-12 text-gray-400">Loading user sessions...</div>
            ) : sessions.length > 0 ? (
              <>
                {/* Summary Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Total Sessions</h3>
                    </div>
                    <div className="text-2xl font-black text-white">{sessions.length}</div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Unique Users</h3>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {new Set(sessions.map((s: any) => s.userId)).size}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-green-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Avg Time</h3>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {Math.round(sessions.reduce((sum: number, s: any) => sum + (s.timeOnPage || 0), 0) / sessions.length)}s
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MousePointerClick className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-sm font-semibold text-gray-400">Total Clicks</h3>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {sessions.reduce((sum: number, s: any) => sum + (s.clicks?.length || 0), 0)}
                    </div>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Recent User Sessions</h3>
                  {sessions.map((session: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSession(selectedSession?.sessionId === session.sessionId ? null : session)}
                      className="rounded-lg border border-gray-700 bg-gray-800 p-4 cursor-pointer hover:bg-gray-750 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {session.deviceType === 'mobile' && <Phone className="h-4 w-4 text-blue-400" />}
                              {session.deviceType === 'tablet' && <Tablet className="h-4 w-4 text-purple-400" />}
                              {session.deviceType === 'desktop' && <Monitor className="h-4 w-4 text-green-400" />}
                              <span className="font-semibold text-white">User {session.userId.substring(0, 8)}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(session.startTime).toLocaleString()}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Time on Page:</span>
                              <span className="ml-2 font-semibold text-white">{session.timeOnPage || 0}s</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Scroll Depth:</span>
                              <span className="ml-2 font-semibold text-white">{session.maxScrollDepth || 0}%</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Clicks:</span>
                              <span className="ml-2 font-semibold text-white">{session.clicks?.length || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Referrer:</span>
                              <span className="ml-2 font-semibold text-white truncate block">
                                {session.referrer ? new URL(session.referrer).hostname : 'Direct'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedSession?.sessionId === session.sessionId && (
                        <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-gray-400 mb-2">Session Info</h4>
                              <div className="space-y-1 text-sm">
                                <div><span className="text-gray-500">Session ID:</span> <span className="text-white">{session.sessionId}</span></div>
                                <div><span className="text-gray-500">User ID:</span> <span className="text-white">{session.userId}</span></div>
                                <div><span className="text-gray-500">Device:</span> <span className="text-white">{session.deviceType} ({session.screenWidth}x{session.screenHeight})</span></div>
                                <div><span className="text-gray-500">Language:</span> <span className="text-white">{session.language}</span></div>
                                <div><span className="text-gray-500">Timezone:</span> <span className="text-white">{session.timezone}</span></div>
                                {session.ipAddress && (
                                  <div><span className="text-gray-500">IP:</span> <span className="text-white">{session.ipAddress}</span></div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-400 mb-2">Behavior</h4>
                              <div className="space-y-1 text-sm">
                                <div><span className="text-gray-500">Page Views:</span> <span className="text-white">{session.pageViews || 1}</span></div>
                                <div><span className="text-gray-500">Max Scroll:</span> <span className="text-white">{session.maxScrollDepth || 0}%</span></div>
                                <div><span className="text-gray-500">Exit Intent:</span> <span className={`font-semibold ${session.exitIntent ? 'text-red-400' : 'text-green-400'}`}>{session.exitIntent ? 'Yes' : 'No'}</span></div>
                                <div><span className="text-gray-500">Last Activity:</span> <span className="text-white">{new Date(session.lastActivity).toLocaleString()}</span></div>
                              </div>
                            </div>
                          </div>

                          {session.clicks && session.clicks.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-400 mb-2">Clicks</h4>
                              <div className="space-y-2">
                                {session.clicks.map((click: any, cIdx: number) => (
                                  <div key={cIdx} className="flex items-center justify-between text-sm p-2 bg-gray-700 rounded">
                                    <div className="flex items-center gap-2">
                                      <MousePointerClick className="h-4 w-4 text-purple-400" />
                                      <span className="text-white">
                                        {click.design ? `Design ${click.design}` : 'Unknown'} - {click.element}
                                      </span>
                                      {click.link && (
                                        <a href={click.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                    <span className="text-gray-400 text-xs">{new Date(click.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {session.referrer && (
                            <div>
                              <h4 className="text-sm font-bold text-gray-400 mb-2">Referrer</h4>
                              <a href={session.referrer} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                {session.referrer}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">No user sessions found</div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <>
        {/* Current Status */}
        <div className="mb-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Current Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">{config.designA.name}:</span>
                <span className={`font-bold ${designAWinning ? 'text-green-400' : 'text-red-400'}`}>
                  {config.designA.purchases} {designAWinning ? '✓ WINNING' : '⚠ LOSING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{config.designB.name}:</span>
                <span className={`font-bold ${designBWinning ? 'text-green-400' : 'text-red-400'}`}>
                  {config.designB.purchases} {designBWinning ? '✓ WINNING' : '⚠ LOSING'}
                </span>
              </div>
              {gap > 0 && (
                <div className="pt-3 border-t border-gray-700 text-sm text-gray-400">
                  Gap: {gap} purchases • {designAWinning ? config.designB.name : config.designA.name} needs {gap + 1} more to survive
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
              Price
            </h3>
            <div className="text-3xl font-black text-blue-400">${config.price}</div>
            <p className="text-sm text-gray-400 mt-2">Same price for all models and designs</p>
          </div>
        </div>

        {/* Design A */}
        <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-blue-400" />
            Design A
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Design Name</label>
              <input
                type="text"
                value={config.designA.name}
                onChange={(e) => setConfig({ ...config, designA: { ...config.designA, name: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Purchase Count</label>
              <input
                type="number"
                value={config.designA.purchases}
                onChange={(e) => setConfig({ ...config, designA: { ...config.designA, purchases: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Image URL</label>
              <input
                type="url"
                value={config.designA.image}
                onChange={(e) => setConfig({ ...config, designA: { ...config.designA, image: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Checkout Link</label>
              <input
                type="url"
                value={config.designA.link}
                onChange={(e) => setConfig({ ...config, designA: { ...config.designA, link: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            {config.designA.image && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Main Image Preview</label>
                <img src={config.designA.image} alt="Design A" className="max-w-xs h-64 object-cover rounded-lg border border-gray-600" />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Additional Mockups (one URL per line)</label>
              <textarea
                value={(config.designA.mockups || []).join('\n')}
                onChange={(e) => setConfig({ 
                  ...config, 
                  designA: { 
                    ...config.designA, 
                    mockups: e.target.value.split('\n').filter(m => m.trim()) 
                  } 
                })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://example.com/mockup1.jpg&#10;https://example.com/mockup2.jpg"
              />
              <p className="mt-1 text-xs text-gray-400">These will appear in the image modal when users click on the design</p>
            </div>
          </div>
        </div>

        {/* Design B */}
        <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-purple-400" />
            Design B
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Design Name</label>
              <input
                type="text"
                value={config.designB.name}
                onChange={(e) => setConfig({ ...config, designB: { ...config.designB, name: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Purchase Count</label>
              <input
                type="number"
                value={config.designB.purchases}
                onChange={(e) => setConfig({ ...config, designB: { ...config.designB, purchases: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Image URL</label>
              <input
                type="url"
                value={config.designB.image}
                onChange={(e) => setConfig({ ...config, designB: { ...config.designB, image: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Checkout Link</label>
              <input
                type="url"
                value={config.designB.link}
                onChange={(e) => setConfig({ ...config, designB: { ...config.designB, link: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            {config.designB.image && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Main Image Preview</label>
                <img src={config.designB.image} alt="Design B" className="max-w-xs h-64 object-cover rounded-lg border border-gray-600" />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Additional Mockups (one URL per line)</label>
              <textarea
                value={(config.designB.mockups || []).join('\n')}
                onChange={(e) => setConfig({ 
                  ...config, 
                  designB: { 
                    ...config.designB, 
                    mockups: e.target.value.split('\n').filter(m => m.trim()) 
                  } 
                })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="https://example.com/mockup1.jpg&#10;https://example.com/mockup2.jpg"
              />
              <p className="mt-1 text-xs text-gray-400">These will appear in the image modal when users click on the design</p>
            </div>
          </div>
        </div>

        {/* Website Text */}
        <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-green-400" />
            Website Text
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Hero Text</label>
              <textarea
                value={config.heroText}
                onChange={(e) => setConfig({ ...config, heroText: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price</label>
              <input
                type="text"
                value={config.price}
                onChange={(e) => setConfig({ ...config, price: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="24.99"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Features (one per line)</label>
              <textarea
                value={config.features.join('\n')}
                onChange={(e) => setConfig({ ...config, features: e.target.value.split('\n').filter(f => f.trim()) })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Next Drop Date */}
        <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-yellow-400" />
            Next Drop Date
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Custom Next Drop Date & Time</label>
              <p className="text-xs text-gray-400 mb-3">
                Leave empty to use automatic calculation (12AM US Central Time every 2 days). 
                Set a custom date to override the automatic calculation.
              </p>
              <input
                type="datetime-local"
                value={config.nextDropDate ? new Date(config.nextDropDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const value = e.target.value
                  setConfig({ 
                    ...config, 
                    nextDropDate: value ? new Date(value).toISOString() : null 
                  })
                }}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-yellow-500 focus:outline-none"
              />
            </div>
            {config.nextDropDate && (
              <div className="p-4 rounded-lg bg-gray-700 border border-gray-600">
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Current Custom Date:</strong>
                </p>
                <p className="text-lg font-bold text-yellow-400">
                  {new Date(config.nextDropDate).toLocaleString('en-US', {
                    timeZone: 'America/Chicago',
                    dateStyle: 'full',
                    timeStyle: 'long'
                  })}
                </p>
                <button
                  onClick={() => setConfig({ ...config, nextDropDate: null })}
                  className="mt-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm"
                >
                  Clear Custom Date (Use Automatic)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <a
            href="/"
            className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            View Site
          </a>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
          </>
        )}

        {/* Clear Analytics Confirmation Modal */}
        {showClearAnalyticsConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowClearAnalyticsConfirm(false)}>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-red-600">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Clear All Analytics Data?</h3>
              </div>
              <p className="text-gray-400 mb-6">
                This will permanently delete all analytics data including:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All page views</li>
                  <li>All click events</li>
                  <li>All purchase events</li>
                  <li>All user sessions</li>
                </ul>
                <strong className="text-red-400 block mt-3">This action cannot be undone.</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAnalyticsConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  disabled={clearingAnalytics}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAnalytics}
                  disabled={clearingAnalytics}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {clearingAnalytics ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Clear All Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

