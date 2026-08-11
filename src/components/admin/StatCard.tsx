type StatCardProps = {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  subtitle?: string
  icon: React.ReactNode
  iconBg?: string
  badge?: { label: string; color: string; bg: string }
}

export default function StatCard({ title, value, change, changeType = 'up', subtitle, icon, iconBg = 'rgba(79,70,229,0.08)', badge }: StatCardProps) {
  const changeColor = changeType === 'up' ? '#16A34A' : changeType === 'down' ? '#DC2626' : '#64748B'
  const changeBg = changeType === 'up' ? 'rgba(22,163,74,0.08)' : changeType === 'down' ? 'rgba(220,38,38,0.08)' : '#F1F5F9'

  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      border: '1px solid #E2E8F0',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', gap: '12px',
      transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>{title}</span>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {badge ? (
            <span style={{ fontSize: '12px', fontWeight: 600, color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '100px' }}>{badge.label}</span>
          ) : change ? (
            <span style={{ fontSize: '12px', fontWeight: 600, color: changeColor, background: changeBg, padding: '2px 8px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
            </span>
          ) : null}
          {subtitle && <span style={{ fontSize: '12px', color: '#94A3B8' }}>{subtitle}</span>}
        </div>
      </div>
    </div>
  )
}
