import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import SystemAdminCompanies from './SystemAdminCompanies'
import type { AdminCompany } from './SystemAdminCompanies'
import SystemAdminCompanyDetails from './SystemAdminCompanyDetails'
import SystemAdminUsers from './SystemAdminUsers'
import SystemAdminAnalysisJobs from './SystemAdminAnalysisJobs'
import SystemAdminLogs from './SystemAdminLogs'
import './SystemAdminDashboard.css'

type AdminPage = 'dashboard' | 'companies' | 'users' | 'jobs' | 'logs'

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

  const [activePage, setActivePage] = useState<AdminPage>('dashboard')
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null)

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalRepositories: 0,
    totalAnalysisJobs: 0,
  })

  const [statsLoading, setStatsLoading] = useState(true)
  const [health, setHealth] = useState<SystemHealth | null>(null)
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
            ◇
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
            onClick={() => setActivePage('dashboard')}
          >
            <span className="nav-icon">▦</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activePage === 'companies' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('companies')
              setSelectedCompany(null)
            }}
          >
            <span className="nav-icon">□</span>
            <span>Companies</span>
          </button>

          <button
            className={`nav-item ${activePage === 'users' ? 'active' : ''}`}
            onClick={() => setActivePage('users')}
          >
            <span className="nav-icon">♙</span>
            <span>Users</span>
          </button>

          <button
            className={`nav-item ${activePage === 'jobs' ? 'active' : ''}`}
            onClick={() => setActivePage('jobs')}
          >
            <span className="nav-icon">◌</span>
            <span>Analysis Jobs</span>
          </button>

          <button
            className={`nav-item ${activePage === 'logs' ? 'active' : ''}`}
            onClick={() => setActivePage('logs')}
          >
            <span className="nav-icon">☰</span>
            <span>System Logs</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">⚙</span>
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
                  : activePage === 'logs'
                    ? 'System Logs'
                    : 'Dashboard'}
          </div>

          <div className="header-actions">

            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search platform..."
              />
            </div>

            <button className="header-button">
              🔔
            </button>

            <div className="header-avatar">
              SA
            </div>

          </div>

        </header>


        {/* ================= CONTENT ================= */}
        {/* ================= CONTENT AREA ================= */}
        {activePage === 'companies' ? (
          <section className="dashboard-content">
            {selectedCompany ? (
              <SystemAdminCompanyDetails
                companyId={selectedCompany.companyId}
                initialCompanyData={selectedCompany}
                onBack={() => setSelectedCompany(null)}
              />
            ) : (
              <SystemAdminCompanies
                onSelectCompany={(company) => setSelectedCompany(company)}
              />
            )}
          </section>
        ) : activePage === 'users' ? (
          <section className="dashboard-content">
            <SystemAdminUsers />
          </section>
        ) : activePage === 'jobs' ? (
          <section className="dashboard-content">
            <SystemAdminAnalysisJobs />
          </section>
        ) : activePage === 'logs' ? (
          <section className="dashboard-content">
            <SystemAdminLogs />
          </section>
        ) : (
        <section className="dashboard-content">

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
              <span className={`status-dot ${health?.overallStatus === 'DEGRADED' ? 'degraded' : health?.overallStatus === 'DOWN' ? 'down' : ''}`} />
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
          <div className="stats-grid">

            {/* TOTAL USERS */}
            <div className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon">
                  ♙
                </div>

                <span className="stat-growth">
                  +8.4%
                </span>

              </div>

              <div className="stat-value">
                {statsLoading ? '...' : stats.totalUsers}
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
                  ▣
                </div>

                <span className="stat-growth">
                  +3.2%
                </span>

              </div>

              <div className="stat-value">
                {statsLoading ? '...' : stats.totalCompanies}
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
                  ⌘
                </div>

                <span className="stat-growth">
                  +5.7%
                </span>

              </div>

              <div className="stat-value">
                {statsLoading
                  ? '...'
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
                  ◌
                </div>

                <span className="stat-growth">
                  +12.1%
                </span>

              </div>

              <div className="stat-value">
                {statsLoading
                  ? '...'
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
          <div className="dashboard-grid">


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


              <div className="health-list">
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