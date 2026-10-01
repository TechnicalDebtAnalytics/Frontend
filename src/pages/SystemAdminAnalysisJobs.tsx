import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Activity, RefreshCw, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { queryString, useAdminApi } from '../config/adminApi'
import type { PagedResponse } from '../config/adminApi'
import type { AnalysisJob } from './adminTypes'
import { formatDate } from './adminTypes'

export type { AnalysisJob } from './adminTypes'

export default function SystemAdminAnalysisJobs() {
  const api = useAdminApi(); const navigate = useNavigate(); const [params, setParams] = useSearchParams()
  const [data, setData] = useState<PagedResponse<AnalysisJob> | null>(null); const [input, setInput] = useState(params.get('q') || '')
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const page = Math.max(0, Number(params.get('page') || 0)); const q = params.get('q') || ''; const status = params.get('status') || ''

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); setError(null)
    try { setData(await api<PagedResponse<AnalysisJob>>(`/admin/analysis-jobs?${queryString({ q, status, page, size: 20, sort: 'startedAt,desc' })}`)); setUpdatedAt(new Date()) }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load analysis jobs') }
    finally { if (!quiet) setLoading(false) }
  }, [api, page, q, status])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])
  useEffect(() => {
    if (!data?.content.some(job => job.status === 'QUEUED' || job.status === 'RUNNING')) return
    const timer = window.setInterval(() => void load(true), 10_000)
    return () => window.clearInterval(timer)
  }, [data?.content, load])

  const update = (key: string, value: string, resetPage = true) => { const copy = new URLSearchParams(params); if (value) copy.set(key, value); else copy.delete(key); if (resetPage) copy.set('page', '0'); setParams(copy) }
  const submit = (event: FormEvent) => { event.preventDefault(); update('q', input.trim()) }
  return <section className="dashboard-content companies-content">
    <div className="page-heading"><div><h1>Analysis Jobs</h1><p>Monitor analysis execution across the platform.</p></div><div className="heading-actions"><span className="last-updated">{updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : 'Not updated'}</span><button className="view-button" onClick={() => void load()}><RefreshCw size={14} /> Refresh</button></div></div>
    <form className="admin-filter-bar" onSubmit={submit}><Search size={16} /><input aria-label="Search analysis jobs" value={input} onChange={e => setInput(e.target.value)} placeholder="Search company or repository" />
      <select aria-label="Filter status" value={status} onChange={e => update('status', e.target.value)}><option value="">All statuses</option>{['QUEUED','RUNNING','COMPLETED','FAILED','CANCELLED'].map(value => <option key={value}>{value}</option>)}</select><button type="submit">Search</button></form>
    {loading ? <div className="companies-loading" role="status"><div className="loading-spinner" /><p>Loading analysis jobs…</p></div>
      : error ? <div className="companies-error" role="alert"><h3>Failed to Load Analysis Jobs</h3><p>{error}</p><button className="retry-button" onClick={() => void load()}>Retry</button></div>
      : !data?.content.length ? <div className="companies-empty"><Activity size={32} /><h3>No Analysis Jobs Found</h3><p>Try different filters.</p></div>
      : <div className="dashboard-card"><div className="companies-table-wrapper" tabIndex={0} role="region" aria-label="Analysis jobs table"><table className="companies-table"><thead><tr><th>Job</th><th>Company</th><th>Repository</th><th>Branch</th><th>Status</th><th>Started By</th><th>Started</th><th>Completed</th><th>Classes</th></tr></thead><tbody>
        {data.content.map(job => <tr key={job.analysisId} className="clickable-row" tabIndex={0} onClick={() => navigate(`/admin/jobs/${job.analysisId}`)} onKeyDown={e => { if (e.key === 'Enter') navigate(`/admin/jobs/${job.analysisId}`) }}><td><strong>#{job.analysisId}</strong></td><td>{job.companyName || '—'}</td><td>{job.repositoryName || '—'}</td><td><span className="org-badge">{job.branch || 'main'}</span></td><td><span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span></td><td>{job.startedByName || 'System'}</td><td>{formatDate(job.startedAt, true)}</td><td>{formatDate(job.completedAt, true)}</td><td><span className="count-pill">{job.totalClassesAnalyzed ?? 0}</span></td></tr>)}</tbody></table></div></div>}
    {data && data.totalPages > 1 && <div className="admin-pagination"><button disabled={data.page === 0} onClick={() => update('page', String(data.page - 1), false)}>Previous</button><span>Page {data.page + 1} of {data.totalPages}</span><button disabled={data.page + 1 >= data.totalPages} onClick={() => update('page', String(data.page + 1), false)}>Next</button></div>}
  </section>
}
