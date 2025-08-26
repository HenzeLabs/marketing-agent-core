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
    const defaultRange = 'last_30_days'
    setDateRange(defaultRange)
  }, [])

  useEffect(() => {
    const defaultRange = 'last_30_days'
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
    if (!dateRange) return
    
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
    if (dateRange === 'last_1_year') return 365
    if (dateRange === 'last_2_years') return 730
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
    const mappedSessions = (data.series || []).map((item: any) => ({
      date: item.date,
      sessions: item.value || item.sessions || 0
    }))
    setSessions(mappedSessions)
  }

  const fetchRevenue = async () => {
    const params = getDateRangeParams()
    const response = await fetch(`${API_BASE}/api/metrics/revenue?brand=${brand}&${params}`)
    const data = await response.json()
    setRevenue(data)
  }

  const fetchWoW = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/summary/wow?brand=${brand}`)
      if (response.ok) {
        const data = await response.json()
        if (data && typeof data.percent_change === 'number') {
          setWow(data)
        }
      }
    } catch (error) {
      console.log('WoW data not available')
    }
  }

  const fetchMoM = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/summary/mom?brand=${brand}`)
      if (response.ok) {
        const data = await response.json()
        if (data && typeof data.percent_change === 'number') {
          setMom(data)
        }
      }
    } catch (error) {
      console.log('MoM data not available')
    }
  }

  const fetchHotspots = async () => {
    try {
      const params = getDateRangeParams()
      const response = await fetch(`${API_BASE}/api/clarity/hotspots?brand=${brand}&${params}`)
      if (response.ok) {
        const data: HotspotsResponse = await response.json()
        setHotspots(data.items || [])
      }
    } catch (error) {
      console.log('Hotspots data not available')
    }
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
    if (!sessions.length) return <div className="text-marketing-gray-light text-center py-8">No data available</div>
    
    const maxSessions = Math.max(...sessions.map(s => s.sessions))
    const totalSessions = sessions.reduce((sum, s) => sum + s.sessions, 0)
    
    return (
      <div className="space-y-4">
        {/* Chart */}
        <div className="relative">
          <svg width="100%" height="240" className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <g key={i}>
                <line
                  x1="40"
                  y1={200 - (ratio * 160)}
                  x2="100%"
                  y2={200 - (ratio * 160)}
                  stroke="#4A6C9B"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <text
                  x="35"
                  y={205 - (ratio * 160)}
                  textAnchor="end"
                  className="text-xs fill-marketing-gray-light"
                >
                  {Math.round(maxSessions * ratio)}
                </text>
              </g>
            ))}
            
            {/* Area chart */}
            <defs>
              <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C7C7" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#00C7C7" stopOpacity="0"/>
              </linearGradient>
            </defs>
            
            {sessions.length > 1 && (
              <>
                {/* Area fill */}
                <path
                  d={`M 40 200 ${sessions.map((session, index) => {
                    const x = 40 + (index / (sessions.length - 1)) * (100 - 40) + '%'
                    const y = 200 - (session.sessions / maxSessions) * 160
                    return `L ${x} ${y}`
                  }).join(' ')} L ${40 + ((sessions.length - 1) / (sessions.length - 1)) * (100 - 40)}% 200 Z`}
                  fill="url(#sessionGradient)"
                />
                
                {/* Line */}
                <path
                  d={`M ${sessions.map((session, index) => {
                    const x = 40 + (index / (sessions.length - 1)) * 60
                    const y = 200 - (session.sessions / maxSessions) * 160
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                  }).join(' ')}`}
                  stroke="#00C7C7"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Data points */}
                {sessions.map((session, index) => {
                  const x = 40 + (index / (sessions.length - 1)) * 60
                  const y = 200 - (session.sessions / maxSessions) * 160
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#00C7C7"
                      className="hover:r-4 transition-all cursor-pointer"
                    >
                      <title>{session.date}: {session.sessions} sessions</title>
                    </circle>
                  )
                })}
              </>
            )}
          </svg>
        </div>
        
        {/* Summary stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-marketing-gray-light">Total sessions: <span className="font-semibold text-marketing-text-light">{totalSessions.toLocaleString()}</span></span>
          <span className="text-marketing-gray-light">Avg per day: <span className="font-semibold text-marketing-text-light">{Math.round(totalSessions / sessions.length)}</span></span>
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
                  <p className="text-marketing-gray-light text-sm">{brand === 'labessentials' ? 'Lab Essentials' : 'Hot Ash'} • Last updated {new Date().toLocaleTimeString()}</p>
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
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_14_days">Last 14 Days</option>
                  <option value="last_30_days">Last 30 Days (default)</option>
                  <option value="last_90_days">Last 90 Days</option>
                  <option value="last_1_year">Last 1 Year</option>
                  <option value="last_2_years">Last 2 Years (full history)</option>
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

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {getScoreCards().map((card, index) => (
              <div 
                key={index} 
                className="bg-marketing-navy/50 border border-marketing-slate/30 rounded-lg p-4 backdrop-blur-sm hover:bg-marketing-navy/60 transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-xs font-medium text-marketing-gray-light uppercase tracking-wide mb-2">{card.title}</div>
                <div className="flex items-baseline justify-between">
                  <div className={`text-2xl font-semibold ${card.color}`}>{card.value}</div>
                  {card.trend && (
                    <div className={`flex items-center text-sm font-medium ${
                      card.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <span className="mr-1">{card.trend === 'up' ? '↗' : '↘'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sessions Chart */}
            <div className="bg-marketing-navy/50 border border-marketing-slate/30 rounded-lg p-6 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-marketing-text-light">
                  Sessions Overview
                </h3>
                <span className="text-sm text-marketing-gray-light">
                  {dateRange === 'custom' ? `${getDaysFromRange()} days` : dateRange.replace('last_', '').replace('_', ' ')}
                </span>
              </div>
              {renderSessionsChart()}
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-marketing-navy/50 border border-marketing-slate/30 rounded-lg p-6 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '700ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-marketing-text-light">Revenue Breakdown</h3>
                <span className="text-sm text-marketing-gray-light">{dateRange.replace('last_', '').replace('_', ' ')}</span>
              </div>
              <div className="space-y-6">
                {revenue && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-marketing-slate/30">
                      <span className="text-sm font-medium text-marketing-gray-light">Total sales</span>
                      <span className="text-lg font-semibold text-marketing-cyan">${revenue.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-marketing-slate/30">
                      <span className="text-sm font-medium text-marketing-gray-light">Orders</span>
                      <span className="text-lg font-semibold text-marketing-orange">{revenue.orders}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-marketing-slate/30">
                      <span className="text-sm font-medium text-marketing-gray-light">Average order value</span>
                      <span className="text-lg font-semibold text-marketing-text-light">${revenue.aov.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {(wow || mom) && (
                  <div className="pt-4 border-t border-marketing-slate/30">
                    <div className="text-sm font-medium text-marketing-gray-light mb-3">Growth metrics</div>
                    <div className="space-y-2">
                      {wow && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-marketing-gray-light">Week over week</span>
                          <span className={`text-sm font-medium ${
                            wow.percent_change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {wow.percent_change >= 0 ? '+' : ''}{wow.percent_change}%
                          </span>
                        </div>
                      )}
                      {mom && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-marketing-gray-light">Month over month</span>
                          <span className={`text-sm font-medium ${
                            mom.percent_change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {mom.percent_change >= 0 ? '+' : ''}{mom.percent_change}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Analytics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Page analytics</h3>
              <span className="text-sm text-gray-500">
                {dateRange === 'custom' ? 'Custom range' : dateRange.replace('last_', '').replace('_', ' ')}
              </span>
            </div>
            <div className="space-y-3">
              {(() => {
                // Check if data is synthetic/placeholder (all unknown URLs)
                const isSyntheticData = hotspots.length > 0 && hotspots.every(h => h.page_url === 'unknown' || h.title === 'Page')
                
                if (isSyntheticData) {
                  return (
                    <div className="text-center py-8 text-marketing-gray-light">
                      <div className="text-4xl mb-3">🔧</div>
                      <p className="text-sm mb-2">Clarity Integration In Progress</p>
                      <p className="text-xs opacity-70">Real page hotspots will appear here once Microsoft Clarity is fully connected.</p>
                    </div>
                  )
                }
                
                if (hotspots.length === 0) {
                  return (
                    <div className="text-marketing-gray-light text-center py-4">No hotspots data available</div>
                  )
                }
                
                return hotspots.slice(0, 10).map((hotspot, index) => (
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
                ))
              })()}
            </div>
          </div>
        </div>

        {/* Agent Chat Sidebar */}
        <div className="w-80 bg-marketing-navy/30 border-l border-marketing-slate/30 flex flex-col backdrop-blur-lg">
          <div className="p-6 border-b border-marketing-slate/30">
            <div className="w-12 h-12 bg-marketing-cyan-10 text-marketing-cyan rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-marketing-text-light mb-2">
              AI Agent Mode
            </h3>
            <p className="text-marketing-gray-light">Ask natural-language questions about your data and get instant answers with insights.</p>
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
                <div className={`max-w-[80%] p-3 rounded-lg transition-all duration-300 ${
                  message.type === 'user' 
                    ? 'bg-marketing-cyan text-marketing-charcoal' 
                    : 'bg-marketing-charcoal/50 border border-marketing-slate/30 text-marketing-text-light backdrop-blur-sm'
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