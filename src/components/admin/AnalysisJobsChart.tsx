import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const data = [
  { day: 'May 14', jobs: 120 },
  { day: 'May 15', jobs: 350 },
  { day: 'May 16', jobs: 180 },
  { day: 'May 17', jobs: 620 },
  { day: 'May 18', jobs: 410 },
  { day: 'May 19', jobs: 380 },
  { day: 'May 20', jobs: 710 },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px',
      padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5' }}>{payload[0].value.toLocaleString()} jobs</div>
    </div>
  )
}

export default function AnalysisJobsChart() {
  const [range] = useState('7 Days')
  const [dropHover, setDropHover] = useState(false)

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
      padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Analysis Jobs Over Time</h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>Total jobs processed per day</p>
        </div>
        <button
          onMouseEnter={() => setDropHover(true)}
          onMouseLeave={() => setDropHover(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: dropHover ? '#F8FAFC' : '#fff',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            fontSize: '13px', fontWeight: 500, color: '#374151',
            transition: 'background 0.12s',
          }}
        >
          {range}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="jobGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Inter, sans-serif' }}
            axisLine={false} tickLine={false}
            ticks={[0, 200, 400, 600, 800]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />
          <Area
            type="monotone" dataKey="jobs"
            stroke="#4F46E5" strokeWidth={2.5}
            fill="url(#jobGradient)"
            dot={{ fill: '#4F46E5', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
