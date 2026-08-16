type JobStatus = 'Completed' | 'Running' | 'Failed' | 'Queued'

type Job = {
  id: string
  repo: string
  company: string
  status: JobStatus
  startedAt: string
  duration: string
}

const jobs: Job[] = [
  { id: '#AI-2046', repo: 'acme/backend-service',    company: 'Acme Corp',         status: 'Completed', startedAt: 'May 20, 2026 10:24 AM', duration: '4m 37s' },
  { id: '#AI-2045', repo: 'stellar/web-app',         company: 'Stellar Solutions',  status: 'Running',   startedAt: 'May 20, 2026 10:20 AM', duration: '2m 15s' },
  { id: '#AI-2044', repo: 'innovate/api-gateway',    company: 'Innovate Labs',      status: 'Failed',    startedAt: 'May 20, 2026 10:10 AM', duration: '1m 06s' },
  { id: '#AI-2043', repo: 'zenith/mobile-app',       company: 'Zenith Tech',        status: 'Completed', startedAt: 'May 20, 2026 09:58 AM', duration: '3m 45s' },
  { id: '#AI-2042', repo: 'penta/data-service',      company: 'Penta Systems',      status: 'Queued',    startedAt: 'May 20, 2026 09:50 AM', duration: '—' },
]

const statusConfig: Record<JobStatus, { color: string; bg: string; dot: string }> = {
  Completed: { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   dot: '#16A34A' },
  Running:   { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',   dot: '#4F46E5' },
  Failed:    { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   dot: '#DC2626' },
  Queued:    { color: '#D97706', bg: 'rgba(245,158,11,0.08)',  dot: '#F59E0B' },
}

const cols = ['Job ID', 'Repository', 'Company', 'Status', 'Started At', 'Duration']

export default function RecentJobsTable() {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden', flex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Recent Analysis Jobs</h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>Latest jobs across all organizations</p>
        </div>
        <button style={{
          background: 'none', border: '1px solid #E2E8F0', borderRadius: '8px',
          padding: '6px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          fontSize: '13px', fontWeight: 500, color: '#4F46E5',
          transition: 'all 0.12s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,229,0.06)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          View All
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {cols.map(col => (
                <th key={col} style={{
                  padding: '10px 24px', textAlign: 'left',
                  fontSize: '11px', fontWeight: 600,
                  color: '#94A3B8', letterSpacing: '0.05em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => {
              const s = statusConfig[job.status]
              return (
                <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? '1px solid #F8FAFC' : 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFF'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#4F46E5', fontFamily: 'monospace' }}>{job.id}</span>
                  </td>
                  <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{job.repo}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{job.company}</span>
                  </td>
                  <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '12px', fontWeight: 600, color: s.color,
                      background: s.bg, padding: '3px 10px', borderRadius: '100px',
                    }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.dot }} />
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{job.startedAt}</span>
                  </td>
                  <td style={{ padding: '14px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'monospace', fontWeight: 500 }}>{job.duration}</span>
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
