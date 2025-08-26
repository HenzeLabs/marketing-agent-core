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
  }, [brand])

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

  const fetchSessions = async () => {
    const response = await fetch(`${API_BASE}/api/metrics/ga4-daily?brand=${brand}&days=28`)
    const data = await response.json()
    setSessions(data.series || [])
  }

  const fetchRevenue = async () => {
    const response = await fetch(`${API_BASE}/api/metrics/revenue?brand=${brand}&range=last_30_days`)
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
    const response = await fetch(`${API_BASE}/api/clarity/hotspots?brand=${brand}&range=last_7_days`)
    const data: HotspotsResponse = await response.json()
    setHotspots(data.items || [])
  }

  const renderSessionsChart = () => {
    if (!sessions.length) return <div className="text-gray-500">No data</div>
    
    const maxSessions = Math.max(...sessions.map(s => s.sessions))
    
    return (
      <div className="space-y-2">
        <svg width="100%" height="200" className="border rounded">
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
                fill="#3b82f6"
              />
            )
          })}
        </svg>
        <div className="text-sm text-gray-600">
          Total: {sessions.reduce((sum, s) => sum + s.sessions, 0)} sessions
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Marketing Console</h1>
          
          <div className="flex items-center gap-4">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hotash">Hot Ash</option>
              <option value="labessentials">Lab Essentials</option>
            </select>
            
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            
            {autoRefresh && (
              <span className="text-sm text-gray-600">
                Auto-refresh: {autoRefresh}s
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sessions Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Sessions (28d)</h2>
            {renderSessionsChart()}
          </div>

          {/* Revenue KPIs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Revenue KPIs</h2>
            <div className="space-y-4">
              {revenue && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${revenue.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {revenue.orders}
                    </div>
                    <div className="text-sm text-gray-600">Orders</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      ${revenue.aov.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">AOV</div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {wow && (
                  <div>
                    <div className={`text-lg font-semibold ${wow.percent_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {wow.percent_change >= 0 ? '+' : ''}{wow.percent_change}%
                    </div>
                    <div className="text-sm text-gray-600">WoW Change</div>
                  </div>
                )}
                
                {mom && (
                  <div>
                    <div className={`text-lg font-semibold ${mom.percent_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {mom.percent_change >= 0 ? '+' : ''}{mom.percent_change}%
                    </div>
                    <div className="text-sm text-gray-600">MoM Change</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Hotspots */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Hotspots (Last 7 Days)</h2>
          <div className="space-y-3">
            {hotspots.slice(0, 10).map((hotspot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {hotspot.title || 'Untitled Page'}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {hotspot.page_url}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-600">
                    {hotspot.attention_score}
                  </div>
                  <div className="text-sm text-gray-600">
                    {hotspot.sessions} sessions
                  </div>
                </div>
              </div>
            ))}
            {hotspots.length === 0 && (
              <div className="text-gray-500 text-center py-4">No hotspots data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App