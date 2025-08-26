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

function App() {
  const [brand, setBrand] = useState('hotash')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [wow, setWow] = useState<WoWData | null>(null)
  const [mom, setMom] = useState<MoMData | null>(null)
  const [hotspots, setHotspots] = useState<HotspotData[]>([])
  const [autoRefresh, setAutoRefresh] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState('last_30_days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

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
  }, [])

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
    <div className="min-h-screen bg-marketing-charcoal text-marketing-text-light font-sans p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-marketing-cyan rounded-lg flex items-center justify-center">
              <span className="text-marketing-charcoal font-bold text-sm">HL</span>
            </div>
            <h1 className="text-3xl font-bold text-marketing-text-light">Marketing Console</h1>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="px-4 py-2 bg-marketing-navy border border-marketing-slate rounded-md text-marketing-text-light focus:ring-2 focus:ring-marketing-cyan focus:border-marketing-cyan"
            >
              <option value="hotash">Hot Ash</option>
              <option value="labessentials">Lab Essentials</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-marketing-navy border border-marketing-slate rounded-md text-marketing-text-light focus:ring-2 focus:ring-marketing-cyan focus:border-marketing-cyan"
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_14_days">Last 14 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            
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
    </div>
  )
}

export default App