type Component = {
  name: string
  status: 'Healthy' | 'Degraded' | 'Down'
  uptime: string
  icon: React.ReactNode
}

const components: Component[] = [
  {
    name: 'Backend API', status: 'Healthy', uptime: '99.8%',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
  {
    name: 'ML Service', status: 'Healthy', uptime: '98.2%',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>,
  },
  {
    name: 'Worker Service', status: 'Healthy', uptime: '97.6%',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    name: 'Database', status: 'Healthy', uptime: '100%',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  },
  {
    name: 'Redis Cache', status: 'Healthy', uptime: '99.1%',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  },
  {
    name: 'File Storage', status: 'Healthy', uptime: '98.5%',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  },
]

const statusConfig = {
  Healthy:  { color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
  Degraded: { color: '#D97706', bg: 'rgba(245,158,11,0.08)' },
  Down:     { color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
}

export default function SystemComponents() {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden', minWidth: '260px',
    }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>System Components</h3>
        <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>Real-time service health</p>
      </div>

      <div style={{ padding: '8px 0' }}>
        {components.map((c, i) => {
          const s = statusConfig[c.status]
          const pct = parseFloat(c.uptime)
          return (
            <div key={c.name} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px',
              borderBottom: i < components.length - 1 ? '1px solid #F8FAFC' : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#FAFBFF'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{c.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{c.uptime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '4px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: '100px' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: s.color, background: s.bg, padding: '1px 7px', borderRadius: '100px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
