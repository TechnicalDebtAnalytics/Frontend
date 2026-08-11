import { useState } from 'react'
import Logo from '../common/Logo'

import { useNavigate } from 'react-router-dom'

type NavItem = {
  id: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    id: 'overview', label: 'Overview',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    id: 'users', label: 'Users',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    id: 'companies', label: 'Companies',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    id: 'repositories', label: 'Repositories',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
  },
  {
    id: 'jobs', label: 'Analysis Jobs',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    id: 'ml', label: 'ML Models',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>,
  },
  {
    id: 'health', label: 'System Health',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
  {
    id: 'audit', label: 'Audit Logs',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    id: 'settings', label: 'Settings',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
]

type Props = {
  activeItem?: string
  collapsed?: boolean
}

export default function AdminSidebar({ activeItem = 'overview', collapsed = false }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [profileHover, setProfileHover] = useState(false)
    const navigate = useNavigate()

  return (
    <aside style={{
      width: collapsed ? '64px' : '232px',
      minHeight: '100vh',
      background: '#fff',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 40,
      transition: 'width 0.2s ease',
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: collapsed ? 0 : '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
          }}>
            <Logo color="#fff" size={16} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>DebtLens</span>
          )}
        </div>
        {!collapsed && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: 'rgba(79,70,229,0.08)', borderRadius: '6px',
            padding: '3px 8px', marginLeft: '2px',
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4F46E5' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#4F46E5', letterSpacing: '0.08em' }}>SYSTEM ADMIN</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const isActive = activeItem === item.id
          const isHov = hovered === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'overview') {
                    navigate('/systemDashboard')
                }

                if (item.id === 'users') {
                    navigate('/systemDashboard/users')
                }

                if (item.id === 'companies'){
                  navigate('/systemDashboard/companies')
                }
                }}
                onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '9px',
                border: 'none',
                background: isActive ? 'rgba(79,70,229,0.09)' : isHov ? '#F8FAFC' : 'transparent',
                color: isActive ? '#4F46E5' : '#64748B',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                marginBottom: '2px',
                transition: 'all 0.12s ease',
                textAlign: 'left',
              }}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : isHov ? 0.8 : 0.6 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
                <div style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: '#4F46E5' }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Profile */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #F1F5F9' }}>
        <button
          onMouseEnter={() => setProfileHover(true)}
          onMouseLeave={() => setProfileHover(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '9px', border: 'none',
            background: profileHover ? '#F8FAFC' : 'transparent',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'background 0.12s ease',
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: '#fff',
          }}>SA</div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>System Admin</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Administrator</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
