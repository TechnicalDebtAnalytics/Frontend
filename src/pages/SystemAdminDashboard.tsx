import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Activity, Building2, GitBranch, LayoutDashboard, LogOut, Search, Shield, Users } from 'lucide-react'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAdminApi, queryString } from '../config/adminApi'
import SystemAdminCompanies from './SystemAdminCompanies'
import SystemAdminCompanyDetails from './SystemAdminCompanyDetails'
import SystemAdminUsers from './SystemAdminUsers'
import SystemAdminAnalysisJobs from './SystemAdminAnalysisJobs'
import SystemAdminJobDetails from './SystemAdminJobDetails'
import type { AdminActivity, AdminStats, SearchResult, SystemHealth } from './adminTypes'
import { formatDate } from './adminTypes'
import './SystemAdminDashboard.css'

function AdminOverview() {
  const api = useAdminApi()
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [activity, setActivity] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [healthLoading, setHealthLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHealth = useCallback(async () => {
    setHealthLoading(true)
    try { setHealth(await api<SystemHealth>('/admin/health')) }
    catch (err) { setHealth(null); setError(err instanceof Error ? err.message : 'Health check failed') }
    finally { setHealthLoading(false) }
  }, [api])

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError(null)
    const [statsResult, activityResult] = await Promise.allSettled([
      api<AdminStats>('/admin/stats'), api<AdminActivity[]>('/admin/activity?limit=8'),
    ])
    if (statsResult.status === 'fulfilled') setStats(statsResult.value)
    else setError(statsResult.reason instanceof Error ? statsResult.reason.message : 'Statistics failed to load')
    if (activityResult.status === 'fulfilled') setActivity(activityResult.value)
    setLoading(false)
  }, [api])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard()
    void loadHealth()
  }, [loadDashboard, loadHealth])

  const cards = [
    ['Total Users', stats?.totalUsers, Users], ['Companies', stats?.totalCompanies, Building2],
    ['Repositories', stats?.totalRepositories, GitBranch], ['Analysis Jobs', stats?.totalAnalysisJobs, Activity],
  ] as const

  return <section className="dashboard-content">
    <div className="page-heading"><div><h1>System Overview</h1><p>Monitor the DebtLens platform using live operational data.</p></div>
      <div className="system-status"><span className={`status-dot ${healthLoading ? 'checking' : health?.overallStatus === 'UP' ? '' : health?.overallStatus === 'DEGRADED' ? 'degraded' : 'down'}`} />
        {healthLoading ? 'Checking status…' : health?.overallStatus === 'UP' ? 'All systems operational' : health?.overallStatus === 'DEGRADED' ? 'Systems degraded' : 'System disruption'}
      </div>
    </div>
    {error && <div className="admin-inline-error" role="alert">{error}<button onClick={() => void loadDashboard()}>Retry</button></div>}
    <div className="stats-grid">{cards.map(([title, value, Icon]) => <div className="stat-card" key={title}>
      <div className="stat-card-top"><div className="stat-icon"><Icon size={19} /></div></div>
      <div className="stat-value" aria-busy={loading}>{loading ? <span className="dl-skeleton" aria-label="Loading" /> : value ?? 0}</div>
      <div className="stat-title">{title}</div>
    </div>)}</div>
    {stats && <div className="job-summary" aria-label="Analysis status summary">
      <span>Queued <strong>{stats.queuedJobs}</strong></span><span>Running <strong>{stats.runningJobs}</strong></span>
      <span>Completed <strong>{stats.completedJobs}</strong></span><span>Failed <strong>{stats.failedJobs}</strong></span>
      <span>Cancelled <strong>{stats.cancelledJobs}</strong></span>
    </div>}
    <div className="dashboard-grid">
      <div className="dashboard-card"><div className="card-header"><div><h2>System Health</h2><p>Independent dependency and worker checks</p></div>
        <button className="view-button" disabled={healthLoading} onClick={() => void loadHealth()}>Refresh</button></div>
        <div className="health-list" aria-busy={healthLoading}>{healthLoading ? <div className="admin-empty">Checking services…</div> : health?.services.map(service =>
          <div className="health-item" key={service.key}><div className="health-name"><span className={`health-dot ${service.status === 'UP' ? '' : service.status.toLowerCase()}`} />
            <div><strong>{service.name}</strong><small>{service.details} · {service.responseTimeMs} ms</small></div></div>
            <span className={service.status === 'UP' ? 'operational' : service.status.toLowerCase()}>{service.status}</span></div>) ?? <div className="admin-empty">Health unavailable.</div>}</div>
      </div>
      <div className="dashboard-card"><div className="card-header"><div><h2>Recent Activity</h2><p>Latest recorded platform events</p></div></div>
        <div className="activity-list">{activity.length === 0 ? <div className="admin-empty">No recent activity.</div> : activity.map((event, index) =>
          <button className="activity-item activity-link" key={`${event.type}-${event.targetId}-${index}`} onClick={() => {
            if (event.targetType === 'COMPANY' && event.targetId) navigate(`/admin/companies/${event.targetId}`)
            if (event.targetType === 'ANALYSIS_JOB' && event.targetId) navigate(`/admin/jobs/${event.targetId}`)
            if (event.targetType === 'USER') navigate(`/admin/users?q=${encodeURIComponent(event.description)}`)
          }}><div className="activity-icon"><Activity size={15} /></div><div className="activity-content"><strong>{event.title}</strong><span>{event.description} · {formatDate(event.occurredAt, true)}</span></div></button>)}</div>
      </div>
    </div>
  </section>
}

function CompanyRoute() {
  const { companyId } = useParams()
  const id = Number(companyId)
  return Number.isFinite(id) ? <SystemAdminCompanyDetails companyId={id} /> : <Navigate to="/admin/companies" replace />
}

function JobRoute() {
  const { analysisId } = useParams()
  const id = Number(analysisId)
  return Number.isFinite(id) ? <SystemAdminJobDetails analysisId={id} /> : <Navigate to="/admin/jobs" replace />
}

export default function SystemAdminDashboard() {
  const { user, logout } = useAuth0()
  const api = useAdminApi()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const initials = useMemo(() => (user?.name || user?.email || 'System Admin').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), [user])

  useEffect(() => {
    if (search.trim().length < 2) return
    const timer = window.setTimeout(async () => {
      setSearching(true)
      try { setResults(await api<SearchResult[]>(`/admin/search?${queryString({ q: search.trim(), limit: 5 })}`)) }
      catch { setResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [api, search])

  const title = location.pathname.includes('/companies/') ? 'Company Details'
    : location.pathname.endsWith('/companies') ? 'Companies' : location.pathname.includes('/jobs/') ? 'Analysis Job'
      : location.pathname.endsWith('/jobs') ? 'Analysis Jobs' : location.pathname.endsWith('/users') ? 'Users' : 'Dashboard'

  const openResult = (result: SearchResult) => {
    if (result.type === 'COMPANY') navigate(`/admin/companies/${result.id}`)
    else if (result.type === 'ANALYSIS_JOB') navigate(`/admin/jobs/${result.id}`)
    else if (result.type === 'REPOSITORY' && result.parentId) navigate(`/admin/companies/${result.parentId}?tab=repositories&repo=${result.id}`)
    else navigate(`/admin/users?q=${encodeURIComponent(result.label)}`)
    setSearch(''); setResults([])
  }

  return <div className="admin-layout">
    <aside className="admin-sidebar"><div className="sidebar-brand"><div className="brand-icon"><Shield size={21} /></div><div><div className="brand-name">DebtLens</div><div className="brand-subtitle">PLATFORM ADMIN</div></div></div>
      <div className="sidebar-section-title">ADMINISTRATION</div><nav className="sidebar-nav">
        <NavLink end to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><LayoutDashboard size={18} /><span>Dashboard</span></NavLink>
        <NavLink to="/admin/companies" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Building2 size={18} /><span>Companies</span></NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Users size={18} /><span>Users</span></NavLink>
        <NavLink to="/admin/jobs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Activity size={18} /><span>Analysis Jobs</span></NavLink>
      </nav>
      <div className="sidebar-user">{user?.picture ? <img className="user-avatar" src={user.picture} alt="" /> : <div className="user-avatar">{initials}</div>}
        <div className="user-info"><div className="user-name">{user?.name || user?.email || 'System Admin'}</div><div className="user-role">Platform Administrator</div></div>
        <button className="logout-button" aria-label="Log out" title="Log out" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}><LogOut size={17} /></button>
      </div>
    </aside>
    <main className="admin-main"><header className="admin-header"><div className="header-title">{title}</div><div className="header-actions"><div className="global-search">
      <div className="search-box"><Search size={16} /><input value={search} onChange={event => { setSearch(event.target.value); if (event.target.value.trim().length < 2) { setResults([]); setSearching(false) } }} aria-label="Search platform" placeholder="Search platform…" /></div>
      {(searching || results.length > 0) && <div className="search-results" role="listbox">{searching ? <div className="search-result-muted">Searching…</div> : results.map(result =>
        <button key={`${result.type}-${result.id}`} role="option" aria-selected="false" onClick={() => openResult(result)}><strong>{result.label}</strong><span>{result.type.replace('_', ' ')} · {result.description}</span></button>)}</div>}
    </div></div></header>
      <Routes><Route index element={<AdminOverview />} /><Route path="companies" element={<SystemAdminCompanies />} /><Route path="companies/:companyId" element={<CompanyRoute />} />
        <Route path="users" element={<SystemAdminUsers />} /><Route path="jobs" element={<SystemAdminAnalysisJobs />} /><Route path="jobs/:analysisId" element={<JobRoute />} />
        <Route path="*" element={<Navigate to="/admin" replace />} /></Routes>
    </main>
  </div>
}
