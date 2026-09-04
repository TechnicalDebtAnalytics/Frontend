import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import SystemAdminCompanies from './SystemAdminCompanies'
import type { AdminCompany } from './SystemAdminCompanies'
import SystemAdminCompanyDetails from './SystemAdminCompanyDetails'
import SystemAdminUsers from './SystemAdminUsers'
import SystemAdminAnalysisJobs from './SystemAdminAnalysisJobs'
import './SystemAdminDashboard.css'

type AdminPage = 'dashboard' | 'companies' | 'users' | 'jobs'

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

          <button className="nav-item">
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

              <span className="status-dot"></span>

              All systems operational

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

                <button className="view-button">
                  View details
                </button>

              </div>


              <div className="health-list">

                {/* APPLICATION SERVICE */}
                <div className="health-item">

                  <div className="health-name">

                    <span className="health-dot"></span>

                    <div>

                      <strong>
                        Application Service
                      </strong>

                      <small>
                        Spring Boot backend
                      </small>

                    </div>

                  </div>

                  <span className="operational">
                    Operational
                  </span>

                </div>


                {/* MACHINE LEARNING SERVICE */}
                <div className="health-item">

                  <div className="health-name">

                    <span className="health-dot"></span>

                    <div>

                      <strong>
                        Machine Learning Service
                      </strong>

                      <small>
                        SATD and defect prediction
                      </small>

                    </div>

                  </div>

                  <span className="operational">
                    Operational
                  </span>

                </div>


                {/* REPOSITORY ANALYSIS SERVICE */}
                <div className="health-item">

                  <div className="health-name">

                    <span className="health-dot"></span>

                    <div>

                      <strong>
                        Repository Analysis Service
                      </strong>

                      <small>
                        Static analysis worker
                      </small>

                    </div>

                  </div>

                  <span className="operational">
                    Operational
                  </span>

                </div>


                {/* RABBITMQ */}
                <div className="health-item">

                  <div className="health-name">

                    <span className="health-dot"></span>

                    <div>

                      <strong>
                        RabbitMQ
                      </strong>

                      <small>
                        Analysis message queue
                      </small>

                    </div>

                  </div>

                  <span className="operational">
                    Operational
                  </span>

                </div>


                {/* NEON DATABASE */}
                <div className="health-item">

                  <div className="health-name">

                    <span className="health-dot"></span>

                    <div>

                      <strong>
                        Neon Database
                      </strong>

                      <small>
                        PostgreSQL database
                      </small>

                    </div>

                  </div>

                  <span className="operational">
                    Operational
                  </span>

                </div>

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