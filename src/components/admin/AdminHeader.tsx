import { useState } from 'react'

type Props = {
  title?: string
  onMenuToggle?: () => void
}

export default function AdminHeader({ title = 'Overview', onMenuToggle }: Props) {
  const [notifHover, setNotifHover] = useState(false)
  const [dateHover, setDateHover] = useState(false)

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
      height: '64px',
      background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748B' }}
          className="mobile-menu-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, marginTop: '1px' }}>System Administration</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Date range */}
        <button
          onMouseEnter={() => setDateHover(true)}
          onMouseLeave={() => setDateHover(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 14px',
            borderRadius: '9px',
            border: '1px solid #E2E8F0',
            background: dateHover ? '#F8FAFC' : '#fff',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px', fontWeight: 500, color: '#374151',
            transition: 'all 0.12s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>May 14 – May 20, 2026</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Notification bell */}
        <button
          onMouseEnter={() => setNotifHover(true)}
          onMouseLeave={() => setNotifHover(false)}
          style={{
            position: 'relative',
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '9px',
            border: '1px solid #E2E8F0',
            background: notifHover ? '#F8FAFC' : '#fff',
            cursor: 'pointer',
            transition: 'all 0.12s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#DC2626',
            border: '2px solid #fff',
          }} />
        </button>
      </div>
    </header>
  )
}
