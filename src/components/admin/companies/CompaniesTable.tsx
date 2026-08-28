import { useState } from 'react'

export type CompanyPlan = 'Free' | 'Professional' | 'Enterprise'
export type CompanyStatus = 'Active' | 'Inactive'

export type Company = {
  id: number
  name: string
  domain: string
  users: number
  repos: number
  plan: CompanyPlan
  status: CompanyStatus
  created: string
  initials: string
  avatarColor: string
}

export const allCompanies: Company[] = [
  { id: 1,  name: 'Acme Corp',          domain: 'acme.com',         users: 42, repos: 18, plan: 'Enterprise',   status: 'Active',   created: 'May 12, 2026', initials: 'AC', avatarColor: '#4F46E5' },
  { id: 2,  name: 'Stellar Solutions',  domain: 'stellar.io',       users: 28, repos: 12, plan: 'Professional', status: 'Active',   created: 'May 10, 2026', initials: 'SS', avatarColor: '#7C3AED' },
  { id: 3,  name: 'Innovate Labs',      domain: 'innovate.io',      users: 35, repos: 21, plan: 'Enterprise',   status: 'Active',   created: 'Apr 28, 2026', initials: 'IL', avatarColor: '#0891B2' },
  { id: 4,  name: 'Zenith Tech',        domain: 'zenithtech.com',   users: 16, repos: 8,  plan: 'Professional', status: 'Active',   created: 'Apr 24, 2026', initials: 'ZT', avatarColor: '#059669' },
  { id: 5,  name: 'Penta Systems',      domain: 'penta.io',         users: 9,  repos: 4,  plan: 'Free',         status: 'Inactive', created: 'Apr 20, 2026', initials: 'PS', avatarColor: '#64748B' },
  { id: 6,  name: 'Quantum Digital',    domain: 'quantumdigital.io',users: 31, repos: 14, plan: 'Enterprise',   status: 'Active',   created: 'Apr 15, 2026', initials: 'QD', avatarColor: '#D97706' },
  { id: 7,  name: 'Nexus Engineering',  domain: 'nexuseng.com',     users: 22, repos: 9,  plan: 'Professional', status: 'Active',   created: 'Apr 10, 2026', initials: 'NE', avatarColor: '#DC2626' },
  { id: 8,  name: 'Apex Software',      domain: 'apexsoftware.dev', users: 18, repos: 7,  plan: 'Professional', status: 'Active',   created: 'Apr 05, 2026', initials: 'AS', avatarColor: '#4F46E5' },
  { id: 9,  name: 'Orbit Dynamics',     domain: 'orbitdynamics.io', users: 7,  repos: 3,  plan: 'Free',         status: 'Inactive', created: 'Mar 30, 2026', initials: 'OD', avatarColor: '#64748B' },
  { id: 10, name: 'Vortex Labs',        domain: 'vortexlabs.ai',    users: 44, repos: 23, plan: 'Enterprise',   status: 'Active',   created: 'Mar 22, 2026', initials: 'VL', avatarColor: '#7C3AED' },
]

const planConfig: Record<CompanyPlan, { color: string; bg: string }> = {
  Enterprise:   { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  Professional: { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)'  },
  Free:         { color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
}

const statusConfig: Record<CompanyStatus, { color: string; bg: string }> = {
  Active:   { color: '#16A34A', bg: 'rgba(22,163,74,0.08)'   },
  Inactive: { color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
}

function ActionMenu({ company, onClose }: { company: Company; onClose: () => void }) {
  const toggleItem = company.status === 'Active' ? 'Deactivate Company' : 'Activate Company'
  const items = ['View Company', 'Edit Company', 'View Users', 'View Repositories', 'Change Plan', toggleItem, 'Delete Company']

  return (
    <div
      style={{
        position: 'absolute', right: 0, top: '36px', zIndex: 50,
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '6px', minWidth: '180px',
      }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) => {
        const isDanger = item === 'Delete Company' || item === 'Deactivate Company'
        const isDivider = i === items.length - 2
        return (
          <div key={item}>
            {isDivider && <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />}
            <button
              onClick={onClose}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: '8px', border: 'none',
                background: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500,
                color: isDanger ? '#DC2626' : '#374151',
                fontFamily: 'Inter, sans-serif', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isDanger ? '#FEF2F2' : '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {item}
            </button>
          </div>
        )
      })}
    </div>
  )
}

const cols = ['Company', 'Users', 'Repositories', 'Plan', 'Status', 'Created', 'Actions']

type Props = { companies: Company[]; page: number; perPage: number }

export default function CompaniesTable({ companies, page, perPage }: Props) {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const slice = companies.slice((page - 1) * perPage, page * perPage)

  return (
    <div
      style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}
      onClick={() => setOpenMenu(null)}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {cols.map(col => (
                <th key={col} style={{
                  padding: '11px 20px', textAlign: 'left',
                  fontSize: '11px', fontWeight: 600, color: '#94A3B8',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  borderBottom: '1px solid #F1F5F9', whiteSpace: 'nowrap',
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((company, i) => {
              const p = planConfig[company.plan]
              const s = statusConfig[company.status]
              return (
                <tr
                  key={company.id}
                  style={{ borderBottom: i < slice.length - 1 ? '1px solid #F8FAFC' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Company */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: company.avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                        boxShadow: `0 2px 8px ${company.avatarColor}40`,
                      }}>{company.initials}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{company.name}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '1px' }}>{company.domain}</div>
                      </div>
                    </div>
                  </td>

                  {/* Users */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{company.users}</span>
                    </div>
                  </td>

                  {/* Repositories */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                      </svg>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{company.repos}</span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: p.color, background: p.bg, padding: '3px 10px', borderRadius: '100px' }}>
                      {company.plan}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '12px', fontWeight: 600, color: s.color,
                      background: s.bg, padding: '3px 10px', borderRadius: '100px',
                    }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color }} />
                      {company.status}
                    </span>
                  </td>

                  {/* Created */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{company.created}</span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === company.id ? null : company.id) }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid #E2E8F0', background: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#64748B', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { (e.currentTarget.style.background = '#F8FAFC'); (e.currentTarget.style.color = '#374151') }}
                        onMouseLeave={e => { (e.currentTarget.style.background = 'none'); (e.currentTarget.style.color = '#64748B') }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                        </svg>
                      </button>
                      {openMenu === company.id && <ActionMenu company={company} onClose={() => setOpenMenu(null)} />}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
