import { useState } from 'react'

export type CompanyFilters = {
  search: string
  status: string
  plan: string
  sort: string
}

type Props = {
  filters: CompanyFilters
  onChange: (f: CompanyFilters) => void
}

const SELECT_STYLE: React.CSSProperties = {
  height: '38px',
  padding: '0 32px 0 12px',
  border: '1px solid #E2E8F0',
  borderRadius: '9px',
  background: '#fff',
  fontSize: '13px',
  color: '#374151',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  minWidth: '140px',
}

export default function CompanyFilters({ filters, onChange }: Props) {
  const [focused, setFocused] = useState(false)
  const [clearHov, setClearHov] = useState(false)

  const set = (key: keyof CompanyFilters, val: string) => onChange({ ...filters, [key]: val })
  const hasFilters = filters.search || filters.status !== 'all' || filters.plan !== 'all' || filters.sort !== 'recent'

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
      padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 220px' }}>
        <div style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#4F46E5' : '#9CA3AF', transition: 'color 0.15s', pointerEvents: 'none',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search companies..."
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', height: '38px',
            paddingLeft: '38px', paddingRight: '12px',
            border: `1.5px solid ${focused ? '#4F46E5' : '#E2E8F0'}`,
            borderRadius: '9px', fontSize: '13px', color: '#111827',
            outline: 'none', fontFamily: 'Inter, sans-serif',
            boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filters.status} onChange={e => set('status', e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select value={filters.plan} onChange={e => set('plan', e.target.value)} style={SELECT_STYLE}>
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select value={filters.sort} onChange={e => set('sort', e.target.value)} style={SELECT_STYLE}>
          <option value="recent">Recently Added</option>
          <option value="name">Company Name</option>
          <option value="users">Most Users</option>
          <option value="repos">Most Repositories</option>
        </select>

        {hasFilters && (
          <button
            onMouseEnter={() => setClearHov(true)}
            onMouseLeave={() => setClearHov(false)}
            onClick={() => onChange({ search: '', status: 'all', plan: 'all', sort: 'recent' })}
            style={{
              height: '38px', padding: '0 14px',
              border: `1px solid ${clearHov ? '#FECACA' : '#E2E8F0'}`,
              borderRadius: '9px',
              background: clearHov ? '#FEF2F2' : '#fff',
              color: clearHov ? '#DC2626' : '#64748B',
              fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.12s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
