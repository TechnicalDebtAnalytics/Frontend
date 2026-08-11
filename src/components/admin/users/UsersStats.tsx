import StatCard from '../StatCard'

const stats = [
  {
    title: 'Total Users',
    value: '1,248',
    subtitle: 'All registered users',
    iconBg: 'rgba(79,70,229,0.08)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Active Users',
    value: '1,186',
    subtitle: 'Currently active',
    iconBg: 'rgba(22,163,74,0.08)',
    badge: { label: '● Active', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <polyline points="16 11 18 13 22 9"/>
      </svg>
    ),
  },
  {
    title: 'Inactive Users',
    value: '62',
    subtitle: 'Currently inactive',
    iconBg: 'rgba(100,116,139,0.08)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <line x1="17" y1="11" x2="23" y2="17"/><line x1="23" y1="11" x2="17" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'System Admins',
    value: '12',
    subtitle: 'System administrators',
    iconBg: 'rgba(124,58,237,0.08)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
]

export default function UsersStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="users-stat-grid">
      {stats.map(s => <StatCard key={s.title} {...s} />)}
    </div>
  )
}
