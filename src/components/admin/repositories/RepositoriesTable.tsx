import { useState } from 'react'

export type AnalysisStatus = 'Healthy' | 'Needs Attention' | 'High Debt' | 'Analyzing' | 'Failed' | 'Pending'
export type RepoStatus = 'Active' | 'Archived'

export type Repository = {
  id: number
  name: string
  fullName: string
  company: string
  companyKey: string
  language: string
  langColor: string
  lastAnalyzed: string
  debtScore: number | null
  analysisStatus: AnalysisStatus
  status: RepoStatus
  stars: number
}

export const allRepositories: Repository[] = [
  { id: 1,  name: 'backend-service',   fullName: 'acme/backend-service',      company: 'Acme Corp',         companyKey: 'acme',    language: 'java', langColor: '#3178C6', lastAnalyzed: 'May 20, 2026',  debtScore: 72,  analysisStatus: 'Needs Attention', status: 'Active',   stars: 24 },
  { id: 2,  name: 'web-app',           fullName: 'stellar/web-app',           company: 'Stellar Solutions',  companyKey: 'stellar', language: 'java',      langColor: '#61DAFB', lastAnalyzed: 'May 20, 2026',  debtScore: 31,  analysisStatus: 'Healthy',         status: 'Active',   stars: 18 },
  { id: 3,  name: 'api-gateway',       fullName: 'innovate/api-gateway',      company: 'Innovate Labs',      companyKey: 'innovate',language: 'java',         langColor: '#00ADD8', lastAnalyzed: 'May 19, 2026',  debtScore: 88,  analysisStatus: 'High Debt',       status: 'Active',   stars: 31 },
  { id: 4,  name: 'mobile-app',        fullName: 'zenith/mobile-app',         company: 'Zenith Tech',        companyKey: 'zenith',  language: 'java',      langColor: '#F05138', lastAnalyzed: 'May 19, 2026',  debtScore: 45,  analysisStatus: 'Healthy',         status: 'Active',   stars: 12 },
  { id: 5,  name: 'data-service',      fullName: 'penta/data-service',        company: 'Penta Systems',      companyKey: 'penta',   language: 'java',     langColor: '#3572A5', lastAnalyzed: 'May 18, 2026',  debtScore: null, analysisStatus: 'Analyzing',      status: 'Active',   stars: 9  },
  { id: 6,  name: 'ml-pipeline',       fullName: 'quantum/ml-pipeline',       company: 'Quantum Digital',    companyKey: 'quantum', language: 'java',     langColor: '#3572A5', lastAnalyzed: 'May 18, 2026',  debtScore: 55,  analysisStatus: 'Needs Attention', status: 'Active',   stars: 47 },
  { id: 7,  name: 'auth-service',      fullName: 'acme/auth-service',         company: 'Acme Corp',          companyKey: 'acme',   language: 'java', langColor: '#3178C6', lastAnalyzed: 'May 17, 2026',  debtScore: 91,  analysisStatus: 'High Debt',       status: 'Active',   stars: 16 },
  { id: 8,  name: 'infra-core',        fullName: 'nexus/infra-core',          company: 'Nexus Engineering',  companyKey: 'nexus',   language: 'java',  langColor: '#7B42BC', lastAnalyzed: 'May 17, 2026',  debtScore: null, analysisStatus: 'Failed',         status: 'Active',   stars: 8  },
  { id: 9,  name: 'payments-sdk',      fullName: 'stellar/payments-sdk',      company: 'Stellar Solutions',  companyKey: 'stellar', language: 'Java',       langColor: '#B07219', lastAnalyzed: 'May 16, 2026',  debtScore: 22,  analysisStatus: 'Healthy',         status: 'Active',   stars: 33 },
  { id: 10, name: 'legacy-portal',     fullName: 'acme/legacy-portal',        company: 'Acme Corp',          companyKey: 'acme',   language: 'java',        langColor: '#4F5D95', lastAnalyzed: 'Apr 30, 2026',  debtScore: 95,  analysisStatus: 'High Debt',       status: 'Archived', stars: 3  },
  { id: 11, name: 'notification-svc',  fullName: 'innovate/notification-svc', company: 'Innovate Labs',      companyKey: 'innovate',language: 'java',         langColor: '#00ADD8', lastAnalyzed: 'May 15, 2026',  debtScore: 38,  analysisStatus: 'Healthy',         status: 'Active',   stars: 21 },
  { id: 12, name: 'dashboard-ui',      fullName: 'zenith/dashboard-ui',       company: 'Zenith Tech',        companyKey: 'zenith',  language: 'java',      langColor: '#61DAFB', lastAnalyzed: 'May 14, 2026',  debtScore: null, analysisStatus: 'Pending',        status: 'Active',   stars: 14 },
]

const analysisConfig: Record<AnalysisStatus, { color: string; bg: string; dot?: string }> = {
  'Healthy':         { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',    dot: '#16A34A' },
  'Needs Attention': { color: '#D97706', bg: 'rgba(245,158,11,0.08)',   dot: '#F59E0B' },
  'High Debt':       { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',    dot: '#DC2626' },
  'Analyzing':       { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',    dot: '#4F46E5' },
  'Failed':          { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',    dot: '#DC2626' },
  'Pending':         { color: '#64748B', bg: 'rgba(100,116,139,0.08)',  dot: '#94A3B8' },
}

function DebtBar({ score }: { score: number }) {
  const color = score >= 80 ? '#DC2626' : score >= 50 ? '#D97706' : '#16A34A'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '64px', height: '5px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '100px' }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color, minWidth: '28px' }}>{score}</span>
    </div>
  )
}

function ActionMenu({ repo, onClose }: { repo: Repository; onClose: () => void }) {
  const archiveItem = repo.status === 'Active' ? 'Archive Repository' : 'Unarchive Repository'
  const items = ['View Details', 'Run Analysis', 'View Analysis History', 'Edit Settings', archiveItem, 'Delete Repository']
  return (
    <div
      style={{
        position: 'absolute', right: 0, top: '36px', zIndex: 50,
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '6px', minWidth: '192px',
      }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) => {
        const isDanger = item === 'Delete Repository' || item === 'Archive Repository'
        const isDivider = i === items.length - 2
        return (
          <div key={item}>
            {isDivider && <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />}
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: '8px', border: 'none',
                background: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500,
                color: isDanger ? '#DC2626' : '#374151',
                fontFamily: 'Inter, sans-serif', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isDanger ? '#FEF2F2' : '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {item === 'Run Analysis' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              )}
              {item}
            </button>
          </div>
        )
      })}
    </div>
  )
}

const COLS = ['Repository', 'Company', 'Language', 'Last Analyzed', 'Technical Debt', 'Analysis Status', 'Actions']

type Props = { repos: Repository[]; page: number; perPage: number }

export default function RepositoriesTable({ repos, page, perPage }: Props) {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const slice = repos.slice((page - 1) * perPage, page * perPage)

  return (
    <div
      style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}
      onClick={() => setOpenMenu(null)}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {COLS.map(col => (
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
            {slice.map((repo, i) => {
              const ac = analysisConfig[repo.analysisStatus]
              return (
                <tr
                  key={repo.id}
                  style={{ borderBottom: i < slice.length - 1 ? '1px solid #F8FAFC' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Repository */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        background: '#F1F5F9', border: '1px solid #E2E8F0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{repo.name}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px', fontFamily: 'monospace' }}>{repo.fullName}</div>
                      </div>
                      {repo.status === 'Archived' && (
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', background: '#F1F5F9', padding: '2px 7px', borderRadius: '100px', marginLeft: '2px' }}>
                          Archived
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Company */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{repo.company}</span>
                  </td>

                  {/* Language */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: repo.langColor, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{repo.language}</span>
                    </div>
                  </td>

                  {/* Last Analyzed */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{repo.lastAnalyzed}</span>
                  </td>

                  {/* Technical Debt */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    {repo.debtScore !== null
                      ? <DebtBar score={repo.debtScore} />
                      : <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>—</span>
                    }
                  </td>

                  {/* Analysis Status */}
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      fontSize: '12px', fontWeight: 600, color: ac.color,
                      background: ac.bg, padding: '3px 10px', borderRadius: '100px',
                    }}>
                      {repo.analysisStatus === 'Analyzing' ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ac.dot} strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                          </path>
                        </svg>
                      ) : (
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ac.dot, flexShrink: 0 }} />
                      )}
                      {repo.analysisStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === repo.id ? null : repo.id) }}
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
                      {openMenu === repo.id && <ActionMenu repo={repo} onClose={() => setOpenMenu(null)} />}
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
