import { useState, useEffect } from 'react'

interface SessionData {
  date: string
  sessions: number
}

interface RevenueData {
  total: number
  orders: number
  aov: number
}

interface WoWData {
  current: number
  previous: number
  percent_change: number
}

interface MoMData {
  current: number
  previous: number
  percent_change: number
}

interface HotspotData {
  page_url: string
  title: string
  attention_score: number
  sessions: number
}

interface HotspotsResponse {
  items: HotspotData[]
}

interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}

interface ScoreCard {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  color: string
}

function App() {
  const [brand, setBrand] = useState('hotash')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [wow, setWow] = useState<WoWData | null>(null)
  const [mom, setMom] = useState<MoMData | null>(null)
  const [hotspots, setHotspots] = useState<HotspotData[]>([])
  const [autoRefresh, setAutoRefresh] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState('')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const autoRefreshParam = params.get('autorefresh')
    if (autoRefreshParam) {
      const seconds = parseInt(autoRefreshParam)
      if (seconds > 0) {
        setAutoRefresh(seconds)
      }
    }
    // Set brand-specific defaults
    const defaultRange = brand === 'labessentials' ? 'last_7_days' : 'last_30_days'
    setDateRange(defaultRange)
  }, [])

  useEffect(() => {
    // Update date range when brand changes
    const defaultRange = brand === 'labessentials' ? 'last_7_days' : 'last_30_days'
    setDateRange(defaultRange)
  }, [brand])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, autoRefresh * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, brand])

  useEffect(() => {
    fetchData()
  }, [brand, dateRange, customStartDate, customEndDate])

  const fetchData = async () => {
    if (!dateRange) return // Wait for brand-specific default to be set
    
    setLoading(true)
    try {
      await Promise.all([
        fetchSessions(),
        fetchRevenue(),
        fetchWoW(),
        fetchMoM(),
        fetchHotspots()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRangeParams = () => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return `start_date=${customStartDate}&end_date=${customEndDate}`
    }
    return `range=${dateRange}`
  }

  const getDaysFromRange = () => {
    if (dateRange === 'last_7_days') return 7
    if (dateRange === 'last_14_days') return 14
    if (dateRange === 'last_30_days') return 30
    if (dateRange === 'last_90_days') return 90
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate)
      const end = new Date(customEndDate)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }
    return 30
  }

  const fetchSessions = async () => {
    const days = getDaysFromRange()
    const response = await fetch(`${API_BASE}/api/metrics/ga4-daily?brand=${brand}&days=${days}`)
    const data = await response.json()
    setSessions(data.series || [])
  }

  const fetchRevenue = async () => {
    const params = getDateRangeParams()
    const response = await fetch(`${API_BASE}/api/metrics/revenue?brand=${brand}&${params}`)
    const data = await response.json()
    setRevenue(data)
  }

  const fetchWoW = async () => {
    const response = await fetch(`${API_BASE}/api/summary/wow?brand=${brand}`)
    const data = await response.json()
    setWow(data)
  }

  const fetchMoM = async () => {
    const response = await fetch(`${API_BASE}/api/summary/mom?brand=${brand}`)
    const data = await response.json()
    setMom(data)
  }

  const fetchHotspots = async () => {
    const params = getDateRangeParams()
    const response = await fetch(`${API_BASE}/api/clarity/hotspots?brand=${brand}&${params}`)
    const data: HotspotsResponse = await response.json()
    setHotspots(data.items || [])
  }

  const getScoreCards = (): ScoreCard[] => {
    const cards: ScoreCard[] = []
    
    if (revenue) {
      cards.push({
        title: 'Revenue',
        value: `$${revenue.total.toLocaleString()}`,
        color: 'text-marketing-cyan'
      })
      cards.push({
        title: 'Orders',
        value: revenue.orders,
        color: 'text-marketing-orange'
      })
      cards.push({
        title: 'AOV',
        value: `$${revenue.aov.toFixed(2)}`,
        color: 'text-marketing-slate'
      })
    }
    
    if (wow) {
      cards.push({
        title: 'WoW Growth',
        value: `${wow.percent_change >= 0 ? '+' : ''}${wow.percent_change}%`,
        trend: wow.percent_change >= 0 ? 'up' : 'down',
        color: wow.percent_change >= 0 ? 'text-marketing-cyan' : 'text-marketing-orange'
      })
    }
    
    if (sessions.length > 0) {
      const totalSessions = sessions.reduce((sum, s) => sum + s.sessions, 0)
      cards.push({
        title: 'Total Sessions',
        value: totalSessions.toLocaleString(),
        color: 'text-marketing-slate'
      })
    }
    
    return cards
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)
    
    try {
      // TODO: Replace with actual agent API call
      const response = await fetch(`${API_BASE}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          brand,
          dateRange,
          context: { revenue, sessions: sessions.length, hotspots: hotspots.length }
        })
      })
      
      const data = await response.json()
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.response || 'I can help you analyze your marketing data. What would you like to know?',
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, agentMessage])
    } catch (error) {
      // Fallback response for demo
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `I can see you're looking at ${brand} data for ${dateRange.replace('last_', '').replace('_', ' ')}. I can help analyze trends, compare metrics, or explain what the data means. What specific question do you have?`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, agentMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const renderSessionsChart = () => {
    if (!sessions.length) return <div className="text-marketing-gray-light">No data</div>
    
    const maxSessions = Math.max(...sessions.map(s => s.sessions))
    
    return (
      <div className="space-y-2">
        <svg width="100%" height="200" className="border border-marketing-slate/30 rounded bg-marketing-charcoal/20">
          {sessions.map((session, index) => {
            const x = (index / (sessions.length - 1)) * 90 + 5
            const height = (session.sessions / maxSessions) * 160
            const y = 180 - height
            
            return (
              <rect
                key={index}
                x={`${x}%`}
                y={y}
                width="2"
                height={height}
                fill="#00C7C7"
              />
            )
          })}
        </svg>
        <div className="text-sm text-marketing-gray-light">
          Total: {sessions.reduce((sum, s) => sum + s.sessions, 0)} sessions
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-marketing-charcoal text-marketing-text-light font-sans">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-marketing-cyan rounded-lg flex items-center justify-center">
                <span className="text-marketing-charcoal font-bold text-sm">HL</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-marketing-text-light">Marketing Console</h1>
                <p className="text-marketing-gray-light text-sm">Internal team dashboard • {brand === 'labessentials' ? 'Lab Essentials' : 'Hot Ash'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-marketing-gray-light">Last updated</div>
              <div className="text-marketing-text-light font-mono text-sm">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-marketing-gray-light">Brand:</span>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="px-3 py-2 bg-marketing-navy border border-marketing-slate rounded-md text-marketing-text-light focus:ring-2 focus:ring-marketing-cyan focus:border-marketing-cyan"
              >
                <option value="hotash">Hot Ash</option>
                <option value="labessentials">Lab Essentials</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-marketing-gray-light">Period:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-marketing-navy border border-marketing-slate rounded-md text-marketing-text-light focus:ring-2 focus:ring-marketing-cyan focus:border-marketing-cyan"
              >
                <option value="last_7_days">Last 7 Days {brand === 'labessentials' ? '(default)' : ''}</option>
                <option value="last_14_days">Last 14 Days</option>
                <option value="last_30_days">Last 30 Days {brand === 'hotash' ? '(default)' : ''}</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 bg-marketing-navy border border-marketing-slate rounded-md text-marketing-text-light focus:ring-2 focus:ring-marketing-cyan focus:border-marketing-cyan"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 bg-marketing-navy border border-marketing-slate rounded-md text-marketing-text-light focus:ring-2 focus:ring-marketing-cyan focus:border-marketing-cyan"
                  placeholder="End Date"
                />
              </>
            )}
            
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-6 py-2 bg-marketing-cyan text-marketing-charcoal font-semibold rounded-md hover:bg-marketing-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            
            {autoRefresh && (
              <span className="text-sm text-marketing-gray-light">
                Auto-refresh: {autoRefresh}s
              </span>
            )}
          </div>
        </header>

        {/* Scorecards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {getScoreCards().map((card, index) => (
            <div key={index} className="bg-marketing-navy/50 border border-marketing-slate/30 p-4 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-marketing-gray-light mb-1">{card.title}</div>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              {card.trend && (
                <div className={`text-xs ${card.color} flex items-center gap-1 mt-1`}>
                  {card.trend === 'up' ? '↗' : '↘'} {card.trend}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sessions Chart */}
          <div className="bg-marketing-navy/50 border border-marketing-slate/30 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-marketing-text-light">
              Sessions ({dateRange === 'custom' ? `${getDaysFromRange()}d` : dateRange.replace('last_', '').replace('_', ' ')})
            </h2>
            {renderSessionsChart()}
          </div>

          {/* Revenue KPIs */}
          <div className="bg-marketing-navy/50 border border-marketing-slate/30 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-marketing-text-light">Revenue KPIs</h2>
            <div className="space-y-4">
              {revenue && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-marketing-cyan">
                      ${revenue.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-marketing-gray-light">Total Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-marketing-orange">
                      {revenue.orders}
                    </div>
                    <div className="text-sm text-marketing-gray-light">Orders</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-marketing-slate">
                      ${revenue.aov.toFixed(2)}
                    </div>
                    <div className="text-sm text-marketing-gray-light">AOV</div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-marketing-slate/30">
                {wow && (
                  <div>
                    <div className={`text-lg font-semibold ${wow.percent_change >= 0 ? 'text-marketing-cyan' : 'text-marketing-orange'}`}>
                      {wow.percent_change >= 0 ? '+' : ''}{wow.percent_change}%
                    </div>
                    <div className="text-sm text-marketing-gray-light">WoW Change</div>
                  </div>
                )}
                
                {mom && (
                  <div>
                    <div className={`text-lg font-semibold ${mom.percent_change >= 0 ? 'text-marketing-cyan' : 'text-marketing-orange'}`}>
                      {mom.percent_change >= 0 ? '+' : ''}{mom.percent_change}%
                    </div>
                    <div className="text-sm text-marketing-gray-light">MoM Change</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Hotspots */}
        <div className="bg-marketing-navy/50 border border-marketing-slate/30 p-6 rounded-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-marketing-text-light">
            Top Hotspots ({dateRange === 'custom' ? 'Custom Range' : dateRange.replace('last_', '').replace('_', ' ')})
          </h2>
          <div className="space-y-3">
            {hotspots.slice(0, 10).map((hotspot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-marketing-charcoal/30 border border-marketing-slate/20 rounded">
                <div className="flex-1">
                  <div className="font-medium text-marketing-text-light">
                    {hotspot.title || 'Untitled Page'}
                  </div>
                  <div className="text-sm text-marketing-gray-light truncate">
                    {hotspot.page_url}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-marketing-orange">
                    {hotspot.attention_score}
                  </div>
                  <div className="text-sm text-marketing-gray-light">
                    {hotspot.sessions} sessions
                  </div>
                </div>
              </div>
            ))}
            {hotspots.length === 0 && (
              <div className="text-marketing-gray-light text-center py-4">No hotspots data available</div>
            )}
          </div>
        </div>
        </div>

        {/* Agent Chat Sidebar */}
        <div className="w-80 bg-marketing-navy/30 border-l border-marketing-slate/30 flex flex-col">
          <div className="p-4 border-b border-marketing-slate/30">
            <h3 className="text-lg font-semibold text-marketing-text-light flex items-center gap-2">
              <div className="w-2 h-2 bg-marketing-cyan rounded-full animate-pulse"></div>
              Marketing Agent
            </h3>
            <p className="text-sm text-marketing-gray-light mt-1">Ask me about your data</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-marketing-gray-light py-8">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm">Hi! I'm ready to help you analyze your {brand} data.</p>
                <p className="text-xs mt-2">Try asking: "What's driving our revenue growth?"</p>
              </div>
            )}
            
            {chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-marketing-cyan text-marketing-charcoal' 
                    : 'bg-marketing-charcoal/50 border border-marketing-slate/30 text-marketing-text-light'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-marketing-charcoal/50 border border-marketing-slate/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-marketing-gray-light">
                    <div className="w-2 h-2 bg-marketing-cyan rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-marketing-cyan rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-marketing-cyan rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-marketing-slate/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask about your data..."
                className="flex-1 px-3 py-2 bg-marketing-charcoal/50 border border-marketing-slate/30 rounded-md text-marketing-text-light placeholder-marketing-gray-light focus:ring-2 focus:ring-marketing-cyan focus:border-marketing-cyan text-sm"
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="px-3 py-2 bg-marketing-cyan text-marketing-charcoal rounded-md hover:bg-marketing-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App