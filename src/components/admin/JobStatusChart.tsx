import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const statuses = [
  { label: 'Completed', value: 2134, pct: 75.0, color: '#16A34A' },
  { label: 'Queued',    value: 377,  pct: 13.2, color: '#F59E0B' },
  { label: 'Failed',    value: 312,  pct: 11.0, color: '#DC2626' },
  { label: 'Running',   value: 23,   pct: 0.8,  color: '#4F46E5' },
]

const TOTAL = 2846

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  const d = statuses.find(s => s.label === payload[0].name)
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px',
      padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px' }}>{payload[0].name}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: d?.color }}>{payload[0].value.toLocaleString()}</div>
      <div style={{ fontSize: '12px', color: '#64748B' }}>{d?.pct}% of total</div>
    </div>
  )
}

export default function JobStatusChart() {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
      padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: '20px',
    }}>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Job Status Distribution</h3>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>Current period breakdown</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Donut */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={statuses} dataKey="value" nameKey="label"
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={72}
                strokeWidth={0} paddingAngle={2}
              >
                {statuses.map(s => <Cell key={s.label} fill={s.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
              {TOTAL.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>Total</div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {statuses.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{s.label}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{s.value.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{s.pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
