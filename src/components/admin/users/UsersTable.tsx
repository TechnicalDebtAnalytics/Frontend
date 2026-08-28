import { useState } from 'react'

export type UserRole = 'System Admin' | 'Company Admin' | 'Developer'
export type UserStatus = 'Active' | 'Inactive'

export type User = {
  id: number
  name: string
  email: string
  company: string
  role: UserRole
  status: UserStatus
  joined: string
  initials: string
  avatarColor: string
}

export const allUsers: User[] = [
  { id: 1,  name: 'Alex Johnson',   email: 'alex.johnson@acme.com',     company: 'Acme Corp',        role: 'Company Admin', status: 'Active',   joined: 'May 12, 2026', initials: 'AJ', avatarColor: '#4F46E5' },
  { id: 2,  name: 'Sarah Wilson',   email: 'sarah.wilson@stellar.com',  company: 'Stellar Solutions', role: 'Developer',     status: 'Active',   joined: 'May 10, 2026', initials: 'SW', avatarColor: '#7C3AED' },
  { id: 3,  name: 'John Smith',     email: 'john.smith@innovate.com',   company: 'Innovate Labs',     role: 'Developer',     status: 'Inactive', joined: 'Apr 28, 2026', initials: 'JS', avatarColor: '#64748B' },
  { id: 4,  name: 'Emily Davis',    email: 'emily.davis@zenith.com',    company: 'Zenith Tech',       role: 'Developer',     status: 'Active',   joined: 'Apr 24, 2026', initials: 'ED', avatarColor: '#0891B2' },
  { id: 5,  name: 'Michael Brown',  email: 'michael.brown@penta.com',   company: 'Penta Systems',     role: 'Company Admin', status: 'Active',   joined: 'Apr 20, 2026', initials: 'MB', avatarColor: '#059669' },
  { id: 6,  name: 'Lisa Martinez',  email: 'lisa.martinez@acme.com',    company: 'Acme Corp',         role: 'Developer',     status: 'Active',   joined: 'Apr 15, 2026', initials: 'LM', avatarColor: '#D97706' },
  { id: 7,  name: 'David Lee',      email: 'david.lee@stellar.com',     company: 'Stellar Solutions', role: 'Developer',     status: 'Active',   joined: 'Apr 10, 2026', initials: 'DL', avatarColor: '#4F46E5' },
  { id: 8,  name: 'Rachel Kim',     email: 'rachel.kim@innovate.com',   company: 'Innovate Labs',     role: 'Company Admin', status: 'Active',   joined: 'Apr 05, 2026', initials: 'RK', avatarColor: '#DC2626' },
  { id: 9,  name: 'Thomas Clark',   email: 'thomas.clark@zenith.com',   company: 'Zenith Tech',       role: 'Developer',     status: 'Inactive', joined: 'Mar 30, 2026', initials: 'TC', avatarColor: '#64748B' },
  { id: 10, name: 'Amanda Foster',  email: 'amanda.foster@penta.com',   company: 'Penta Systems',     role: 'Developer',     status: 'Active',   joined: 'Mar 22, 2026', initials: 'AF', avatarColor: '#7C3AED' },
]

const roleConfig: Record<UserRole, { color: string; bg: string }> = {
  'System Admin':  { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  'Company Admin': { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
  'Developer':     { color: '#0891B2', bg: 'rgba(8,145,178,0.08)' },
}

const statusConfig: Record<UserStatus, { color: string; bg: string }> = {
  Active:   { color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
  Inactive: { color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
}

type ActionMenuProps = { user: User; onClose: () => void }

function ActionMenu({ user, onClose }: ActionMenuProps) {
  const items = user.status === 'Active'
    ? ['View User', 'Edit User', 'Change Role', 'Deactivate User', 'Delete User']
    : ['View User', 'Edit User', 'Change Role', 'Activate User', 'Delete User']

  return (
    <div
      style={{
        position: 'absolute', right: '0', top: '36px', zIndex: 50,
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '6px',
        minWidth: '168px',
      }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) => {
        const isDelete = item === 'Delete User'
        const isDeactivate = item === 'Deactivate User'
        const isDanger = isDelete || isDeactivate
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
                fontFamily: 'Inter, sans-serif',
                transition: 'background 0.1s',
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

type Props = { users: User[]; page: number; perPage: number }

export default function UsersTable({ users, page, perPage }: Props) {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const slice = users.slice((page - 1) * perPage, page * perPage)
  const cols = ['User', 'Company', 'Role', 'Status', 'Joined', 'Actions']

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
    }}
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
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((user, i) => {
              const r = roleConfig[user.role]
              const s = statusConfig[user.status]
              return (
                <tr
                  key={user.id}
                  style={{ borderBottom: i < slice.length - 1 ? '1px solid #F8FAFC' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* User */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: user.avatarColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>{user.initials}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '1px' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{user.company}</span>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: r.color, background: r.bg, padding: '3px 10px', borderRadius: '100px' }}>
                      {user.role}
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
                      {user.status}
                    </span>
                  </td>

                  {/* Joined */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{user.joined}</span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id) }}
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
                      {openMenu === user.id && <ActionMenu user={user} onClose={() => setOpenMenu(null)} />}
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
