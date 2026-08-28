import StatCard from '../StatCard'

const stats = [
  {
    title: 'Total Companies',
    value: '54',
    subtitle: 'Registered organizations',
    iconBg: 'rgba(79,70,229,0.08)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    title: 'Active Companies',
    value: '48',
    subtitle: 'Currently active',
    iconBg: 'rgba(22,163,74,0.08)',
    badge: { label: '● Active', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        <polyline points="17 8 19 10 23 6"/>
      </svg>
    ),
  },
  {
    title: 'Inactive Companies',
    value: '6',
    subtitle: 'Currently inactive',
    iconBg: 'rgba(100,116,139,0.08)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        <line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/>
      </svg>
    ),
  },
  {
    title: 'New This Month',
    value: '8',
    change: '14.3%',
    changeType: 'up' as const,
    subtitle: 'New organizations',
    iconBg: 'rgba(8,145,178,0.08)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
  },
]

export default function CompaniesStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="companies-stat-grid">
      {stats.map(s => <StatCard key={s.title} {...s} />)}
    </div>
  )
}
