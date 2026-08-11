import { useState, useMemo } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'
import UsersStats from '../components/admin/users/UsersStats'
import UserFilters from '../components/admin/users/UserFilters'
import UsersTable, { allUsers } from '../components/admin/users/UsersTable'

const SIDEBAR_W = 232
const PER_PAGE = 10

type Filters = { search: string; role: string; status: string; company: string }

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  const btnStyle = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    minWidth: '34px', height: '34px', padding: '0 10px',
    borderRadius: '8px', border: `1px solid ${active ? '#4F46E5' : '#E2E8F0'}`,
    background: active ? '#4F46E5' : '#fff',
    color: active ? '#fff' : disabled ? '#CBD5E1' : '#374151',
    fontSize: '13px', fontWeight: active ? 600 : 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'Inter, sans-serif',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
    transition: 'all 0.12s',
    opacity: disabled ? 0.5 : 1,
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <span style={{ fontSize: '13px', color: '#64748B' }}>
        Showing {start}–{end} of <strong style={{ color: '#374151' }}>{total.toLocaleString()}</strong> users
      </span>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button disabled={page === 1} onClick={() => onChange(page - 1)} style={btnStyle(false, page === 1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Prev
        </button>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#94A3B8', fontSize: '13px' }}>…</span>
            : <button key={p} onClick={() => onChange(p as number)} style={btnStyle(page === p)}
                onMouseEnter={e => { if (page !== p) (e.currentTarget.style.background = '#F8FAFC') }}
                onMouseLeave={e => { if (page !== p) (e.currentTarget.style.background = '#fff') }}
              >{p}</button>
        )}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} style={btnStyle(false, page === totalPages)}>
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [addHov, setAddHov] = useState(false)
  const [filters, setFilters] = useState<Filters>({ search: '', role: 'all', status: 'all', company: 'all' })

  const companyMap: Record<string, string> = {
    acme: 'Acme Corp', stellar: 'Stellar Solutions',
    innovate: 'Innovate Labs', zenith: 'Zenith Tech', penta: 'Penta Systems',
  }
  const roleMap: Record<string, string> = {
    system_admin: 'System Admin', company_admin: 'Company Admin', developer: 'Developer',
  }

  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      const q = filters.search.toLowerCase()
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      if (filters.role !== 'all' && u.role !== roleMap[filters.role]) return false
      if (filters.status !== 'all' && u.status.toLowerCase() !== filters.status) return false
      if (filters.company !== 'all' && u.company !== companyMap[filters.company]) return false
      return true
    })
  }, [filters])

  const handleFilterChange = (f: Filters) => { setFilters(f); setPage(1) }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(${mobileOpen ? '0' : '-100%'}); transition: transform 0.2s ease; }
          .users-main { margin-left: 0 !important; }
          .users-stat-grid { grid-template-columns: 1fr 1fr !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 480px) {
          .users-stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 39 }} />
      )}

      <div className="admin-sidebar" style={{ position: 'fixed', zIndex: 40 }}>
        <AdminSidebar activeItem="users" />
      </div>

      <div className="users-main" style={{ marginLeft: `${SIDEBAR_W}px`, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader
          title="Users"
          onMenuToggle={() => setMobileOpen(v => !v)}
        />

        <main style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                Manage users and their access across the DebtLens platform.
              </p>
            </div>
            <button
              onMouseEnter={() => setAddHov(true)}
              onMouseLeave={() => setAddHov(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                height: '40px', padding: '0 18px',
                background: addHov ? '#4338CA' : '#4F46E5',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em',
                boxShadow: addHov ? '0 6px 20px rgba(79,70,229,0.4)' : '0 2px 8px rgba(79,70,229,0.25)',
                transform: addHov ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add User
            </button>
          </div>

          {/* Stats */}
          <UsersStats />

          {/* Filters */}
          <UserFilters filters={filters} onChange={handleFilterChange} />

          {/* Table */}
          <UsersTable users={filtered} page={page} perPage={PER_PAGE} />

          {/* Pagination */}
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />

        </main>
      </div>
    </div>
  )
}
