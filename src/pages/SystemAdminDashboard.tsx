import { useState } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'
import StatCard from '../components/admin/StatCard'
import AnalysisJobsChart from '../components/admin/AnalysisJobsChart'
import JobStatusChart from '../components/admin/JobStatusChart'
import RecentJobsTable from '../components/admin/RecentJobsTable'
import SystemComponents from '../components/admin/SystemComponents'

const SIDEBAR_W = 232

const stats = [
  {
    title: 'Total Users',
    value: '1,248',
    change: '12.5%',
    changeType: 'up' as const,
    subtitle: 'vs last 7 days',
    iconBg: 'rgba(79,70,229,0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    title: 'Companies',
    value: '54',
    change: '8.3%',
    changeType: 'up' as const,
    subtitle: 'vs last 7 days',
    iconBg: 'rgba(124,58,237,0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    title: 'Repositories',
    value: '320',
    change: '15.2%',
    changeType: 'up' as const,
    subtitle: 'vs last 7 days',
    iconBg: 'rgba(8,145,178,0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
  },
  {
    title: 'Analysis Jobs',
    value: '2,846',
    change: '18.7%',
    changeType: 'up' as const,
    subtitle: 'vs last 7 days',
    iconBg: 'rgba(5,150,105,0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    title: 'Active Jobs',
    value: '23',
    change: '+4',
    changeType: 'up' as const,
    subtitle: 'vs last hour',
    iconBg: 'rgba(217,119,6,0.08)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  },
  {
    title: 'System Health',
    value: '98.6%',
    subtitle: 'All systems operational',
    iconBg: 'rgba(22,163,74,0.08)',
    badge: { label: '● Healthy', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  },
]

export default function SystemAdminDashboard() {
  const activeNav = 'overview'
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(${mobileOpen ? '0' : '-100%'}); transition: transform 0.2s ease; }
          .main-content { margin-left: 0 !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .chart-row { flex-direction: column !important; }
          .bottom-row { flex-direction: column !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .mobile-overlay { display: none !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 39 }}
        />
      )}

      {/* Sidebar */}
      <div className="admin-sidebar" style={{ position: 'fixed', zIndex: 40 }}>
        <AdminSidebar activeItem={activeNav} />
      </div>

      {/* Main content */}
      <div className="main-content" style={{ marginLeft: `${SIDEBAR_W}px`, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader title="Overview" onMenuToggle={() => setMobileOpen(v => !v)} />

        <main style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', width: '100%' }}>

          {/* Stat cards */}
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {stats.map(s => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* Charts row */}
          <div className="chart-row" style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: '1 1 60%', minWidth: 0 }}>
              <AnalysisJobsChart />
            </div>RepositoriesPage.tsx
            <div style={{ flex: '1 1 36%', minWidth: '280px' }}>
              <JobStatusChart />
            </div>
          </div>

          {/* Bottom row */}
          <div className="bottom-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 60%', minWidth: 0 }}>
              <RecentJobsTable />
            </div>
            <div style={{ flex: '1 1 36%', minWidth: '260px' }}>
              <SystemComponents />
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
