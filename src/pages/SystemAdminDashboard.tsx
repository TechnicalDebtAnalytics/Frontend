import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Activity, Bell, Building2, GitBranch, LayoutDashboard, Search, Settings, Shield, Users } from 'lucide-react'
import SystemAdminCompanies from './SystemAdminCompanies'
import type { AdminCompany } from './SystemAdminCompanies'
import SystemAdminCompanyDetails from './SystemAdminCompanyDetails'
import SystemAdminUsers from './SystemAdminUsers'
import SystemAdminAnalysisJobs from './SystemAdminAnalysisJobs'
import './SystemAdminDashboard.css'

type AdminPage = 'dashboard' | 'companies' | 'users' | 'jobs'

export interface HealthItem {
  name: string
  key: string
  description: string
  status: 'UP' | 'DEGRADED' | 'DOWN'
  details?: string
}

export interface SystemHealth {
  overallStatus: 'UP' | 'DEGRADED' | 'DOWN'
  timestamp: string
  services: HealthItem[]
}

export default function SystemAdminDashboard() {
  const { getAccessTokenSilently } = useAuth0()

  const [activePage, setActivePage] = useState<AdminPage>(() => {
    try {
      const saved = sessionStorage.getItem('debtlens_admin_active_page')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.activePage) return parsed.activePage
      }
    } catch { }
    return 'dashboard'
  })

  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(() => {
    try {
      const saved = sessionStorage.getItem('debtlens_admin_active_page')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.selectedCompany) return parsed.selectedCompany
      }
    } catch { }
    return null
  })

  const handleNavigatePage = (page: AdminPage) => {
    setActivePage(page)
    setSelectedCompany(null)
    try {
      sessionStorage.setItem('debtlens_admin_active_page', JSON.stringify({ activePage: page, selectedCompany: null }))
    } catch { }
  }

  const handleSelectCompany = (company: AdminCompany | null) => {
    setSelectedCompany(company)
    try {
      sessionStorage.setItem('debtlens_admin_active_page', JSON.stringify({ activePage: 'companies', selectedCompany: company }))
    } catch { }
  }

  const [stats, setStats] = useState(() => {
    try {
      const saved = sessionStorage.getItem('debtlens_admin_cached_stats')
      if (saved) return JSON.parse(saved)
    } catch { }
    return {
      totalUsers: 0,
      totalCompanies: 0,
      totalRepositories: 0,
      totalAnalysisJobs: 0,
    }
  })

  const [statsLoading, setStatsLoading] = useState(true)
  const [health, setHealth] = useState<SystemHealth | null>(() => {
    try {
      const saved = sessionStorage.getItem('debtlens_admin_cached_health')
      if (saved) return JSON.parse(saved)
    } catch { }
    return null
  })
  const [healthLoading, setHealthLoading] = useState(true)

  const loadHealth = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetch('http://localhost:8080/api/admin/health', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to load system health: ${response.status}`)
      }
      const data: SystemHealth = await response.json()
      console.log('ADMIN DASHBOARD HEALTH:', data)
      setHealth(data)
      try {
        sessionStorage.setItem('debtlens_admin_cached_health', JSON.stringify(data))
      } catch { }
    } catch (error) {
      console.error('Failed to load system health:', error)
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = await getAccessTokenSilently()

        const response = await fetch(
          'http://localhost:8080/api/admin/stats',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load admin statistics: ${response.status}`
          )
        }

        const data = await response.json()

        console.log('ADMIN DASHBOARD STATS:', data)

        setStats(data)
        try {
          sessionStorage.setItem('debtlens_admin_cached_stats', JSON.stringify(data))
        } catch { }
      } catch (error) {
        console.error(
          'Failed to load admin dashboard statistics:',
          error
        )
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
    loadHealth()
  }, [getAccessTokenSilently])

  return (
    <div className="admin-layout">

      {/* ================= SIDEBAR ================= */}
      <aside className="admin-sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">
            <Shield size={21} aria-hidden="true" />
          </div>

          <div>
            <div className="brand-name">
              DebtLens
            </div>

            <div className="brand-subtitle">
              PLATFORM ADMIN
            </div>
          </div>
        </div>

        <div className="sidebar-section-title">
          ADMINISTRATION
        </div>

        <nav className="sidebar-nav">

          <button
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            aria-current={activePage === 'dashboard' ? 'page' : undefined}
            onClick={() => handleNavigatePage('dashboard')}
          >
            <span className="nav-icon"><LayoutDashboard size={18} aria-hidden="true" /></span>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activePage === 'companies' ? 'active' : ''}`}
            aria-current={activePage === 'companies' ? 'page' : undefined}
            onClick={() => handleNavigatePage('companies')}
          >
            <span className="nav-icon"><Building2 size={18} aria-hidden="true" /></span>
            <span>Companies</span>
          </button>

          <button
            className={`nav-item ${activePage === 'users' ? 'active' : ''}`}
            aria-current={activePage === 'users' ? 'page' : undefined}
            onClick={() => handleNavigatePage('users')}
          >
            <span className="nav-icon"><Users size={18} aria-hidden="true" /></span>
            <span>Users</span>
          </button>

          <button
            className={`nav-item ${activePage === 'jobs' ? 'active' : ''}`}
            aria-current={activePage === 'jobs' ? 'page' : undefined}
            onClick={() => handleNavigatePage('jobs')}
          >
            <span className="nav-icon"><Activity size={18} aria-hidden="true" /></span>
            <span>Analysis Jobs</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon"><Settings size={18} aria-hidden="true" /></span>
            <span>Settings</span>
          </button>

        </nav>

        {/* Sidebar user */}
        <div className="sidebar-user">

          <div className="user-avatar">
            SA
          </div>

          <div className="user-info">

            <div className="user-name">
              System Admin
            </div>

            <div className="user-role">
              Platform Administrator
            </div>

          </div>

        </div>

      </aside>


      {/* ================= MAIN AREA ================= */}
      <main className="admin-main">

        {/* ================= TOP BAR ================= */}
        <header className="admin-header">

          <div className="header-title">
            {activePage === 'companies'
              ? selectedCompany
                ? `Companies / ${selectedCompany.companyName}`
                : 'Companies'
              : activePage === 'users'
                ? 'Users'
                : activePage === 'jobs'
                  ? 'Analysis Jobs'
                  : 'Dashboard'}
          </div>

          <div className="header-actions">

            <div className="search-box">
              <Search size={16} aria-hidden="true" />

              <input
                type="text"
                aria-label="Search platform"
                placeholder="Search platform..."
              />
            </div>

            <button className="header-button" aria-label="Notifications">
              <Bell size={17} aria-hidden="true" />
            </button>

            <div className="header-avatar">
              SA
            </div>

          </div>

        </header>


        {/* ================= CONTENT ================= */}
        {/* ================= CONTENT AREA ================= */}
        {activePage === 'companies' ? (
          <section key={activePage} className="dashboard-content">
            {selectedCompany ? (
              <SystemAdminCompanyDetails
                companyId={selectedCompany.companyId}
                initialCompanyData={selectedCompany}
                onBack={() => handleSelectCompany(null)}
              />
            ) : (
              <SystemAdminCompanies
                onSelectCompany={(company) => handleSelectCompany(company)}
              />
            )}
          </section>
        ) : activePage === 'users' ? (
          <section key={activePage} className="dashboard-content">
            <SystemAdminUsers />
          </section>
        ) : activePage === 'jobs' ? (
          <section key={activePage} className="dashboard-content">
            <SystemAdminAnalysisJobs />
          </section>
        ) : (
        <section key={activePage} className="dashboard-content">

          {/* ================= PAGE HEADING ================= */}
          <div className="page-heading">

            <div>

              <h1>
                System Overview
              </h1>

              <p>
                Monitor and manage the DebtLens platform.
              </p>

            </div>

            <div className="system-status">
              <span className={`status-dot ${healthLoading ? 'checking' : health?.overallStatus === 'DEGRADED' ? 'degraded' : health?.overallStatus === 'UP' ? '' : 'down'}`} />
              {healthLoading
                ? 'Checking status...'
                : health?.overallStatus === 'UP'
                  ? 'All systems operational'
                  : health?.overallStatus === 'DEGRADED'
                    ? 'Systems degraded'
                    : 'System disruption'}
            </div>

          </div>


          {/* ================= STATISTICS ================= */}
          <div className="stats-grid dl-stagger">

            {/* TOTAL USERS */}
            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <Users size={19} aria-hidden="true" />
                </div>

                <span className="stat-growth">
                  +8.4%
                </span>

              </div>

              <div className="stat-value" aria-busy={statsLoading}>
                {statsLoading ? <span className="dl-skeleton" aria-label="Loading" /> : stats.totalUsers}
              </div>

              <div className="stat-title">
                Total Users
              </div>

              <div className="stat-description">
                Registered platform users
              </div>

            </div>


            {/* TOTAL COMPANIES */}
            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <Building2 size={19} aria-hidden="true" />
                </div>

                <span className="stat-growth">
                  +3.2%
                </span>

              </div>

              <div className="stat-value" aria-busy={statsLoading}>
                {statsLoading ? <span className="dl-skeleton" aria-label="Loading" /> : stats.totalCompanies}
              </div>

              <div className="stat-title">
                Companies
              </div>

              <div className="stat-description">
                Registered organizations
              </div>

            </div>


            {/* TOTAL REPOSITORIES */}
            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <GitBranch size={19} aria-hidden="true" />
                </div>

                <span className="stat-growth">
                  +5.7%
                </span>

              </div>

              <div className="stat-value" aria-busy={statsLoading}>
                {statsLoading
                  ? <span className="dl-skeleton" aria-label="Loading" />
                  : stats.totalRepositories}
              </div>

              <div className="stat-title">
                Repositories
              </div>

              <div className="stat-description">
                Connected repositories
              </div>

            </div>


            {/* TOTAL ANALYSIS JOBS */}
            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  <Activity size={19} aria-hidden="true" />
                </div>

                <span className="stat-growth">
                  +12.1%
                </span>

              </div>

              <div className="stat-value" aria-busy={statsLoading}>
                {statsLoading
                  ? <span className="dl-skeleton" aria-label="Loading" />
                  : stats.totalAnalysisJobs}
              </div>

              <div className="stat-title">
                Analysis Jobs
              </div>

              <div className="stat-description">
                Total analysis jobs
              </div>

            </div>

          </div>


          {/* ================= LOWER SECTION ================= */}
          <div className="dashboard-grid dl-stagger dl-scroll">


            {/* ================= SYSTEM HEALTH ================= */}
            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h2>
                    System Health
                  </h2>

                  <p>
                    Current status of platform services
                  </p>

                </div>

                <button
                  className="view-button"
                  onClick={() => {
                    setHealthLoading(true)
                    loadHealth()
                  }}
                >
                  Refresh
                </button>

              </div>


              <div className="health-list" aria-busy={healthLoading}>
                {healthLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Checking service health...
                  </div>
                ) : !health || !health.services || health.services.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Unable to fetch health status.
                  </div>
                ) : (
                  health.services.map((srv) => (
                    <div className="health-item" key={srv.key || srv.name}>
                      <div className="health-name">
                        <span
                          className={`health-dot ${
                            srv.status === 'DEGRADED'
                              ? 'degraded'
                              : srv.status === 'DOWN'
                              ? 'down'
                              : ''
                          }`}
                        />
                        <div>
                          <strong>{srv.name}</strong>
                          <small>{srv.description}</small>
                        </div>
                      </div>

                      <span
                        className={
                          srv.status === 'UP'
                            ? 'operational'
                            : srv.status === 'DEGRADED'
                            ? 'degraded'
                            : 'down'
                        }
                      >
                        {srv.status === 'UP'
                          ? 'Operational'
                          : srv.status === 'DEGRADED'
                          ? 'Degraded'
                          : 'Unavailable'}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>


            {/* ================= RECENT ACTIVITY ================= */}
            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h2>
                    Recent Activity
                  </h2>

                  <p>
                    Latest platform events
                  </p>

                </div>

                <button className="view-button">
                  View all
                </button>

              </div>


              <div className="activity-list">

                <div className="activity-item">

                  <div className="activity-icon">
                    +
                  </div>

                  <div className="activity-content">

                    <strong>
                      New company registered
                    </strong>

                    <span>
                      12 minutes ago
                    </span>

                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-icon">
                    ✓
                  </div>

                  <div className="activity-content">

                    <strong>
                      Repository analysis completed
                    </strong>

                    <span>
                      27 minutes ago
                    </span>

                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-icon">
                    ♙
                  </div>

                  <div className="activity-content">

                    <strong>
                      New user registered
                    </strong>

                    <span>
                      41 minutes ago
                    </span>

                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-icon warning">
                    !
                  </div>

                  <div className="activity-content">

                    <strong>
                      Analysis job failed
                    </strong>

                    <span>
                      1 hour ago
                    </span>

                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-icon">
                    ✓
                  </div>

                  <div className="activity-content">

                    <strong>
                      System health check completed
                    </strong>

                    <span>
                      2 hours ago
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>
        )}

      </main>

    </div>
  )
}
