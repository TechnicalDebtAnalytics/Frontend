import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Building2, Search } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { queryString, useAdminApi } from '../config/adminApi'
import type { PagedResponse } from '../config/adminApi'
import type { AdminCompany } from './adminTypes'
import { formatDate } from './adminTypes'

export type { AdminCompany } from './adminTypes'

export default function SystemAdminCompanies() {
  const api = useAdminApi(); const navigate = useNavigate(); const [params, setParams] = useSearchParams()
  const [data, setData] = useState<PagedResponse<AdminCompany> | null>(null)
  const [input, setInput] = useState(params.get('q') || '')
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  const page = Math.max(0, Number(params.get('page') || 0)); const q = params.get('q') || ''

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await api<PagedResponse<AdminCompany>>(`/admin/companies?${queryString({ q, page, size: 20, sort: 'createdAt,desc' })}`)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load companies') }
    finally { setLoading(false) }
  }, [api, page, q])
  useEffect(() => {
    // Loading is intentionally triggered when the URL-backed query changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const submit = (event: FormEvent) => { event.preventDefault(); setParams(input.trim() ? { q: input.trim(), page: '0' } : {}) }
  const setPage = (next: number) => { const copy = new URLSearchParams(params); copy.set('page', String(next)); setParams(copy) }

  return <section className="dashboard-content companies-content">
    <div className="page-heading"><div><h1>Companies</h1><p>Inspect registered organizations and their platform usage.</p></div>
      <div className="companies-count"><span className="count-badge">{data?.totalElements ?? 0}</span>Total Companies</div></div>
    <form className="admin-filter-bar" onSubmit={submit}><Search size={16} /><input aria-label="Search companies" value={input} onChange={e => setInput(e.target.value)} placeholder="Search company or GitHub organization" /><button type="submit">Search</button>{q && <button type="button" onClick={() => { setInput(''); setParams({}) }}>Clear</button>}</form>
    {loading ? <div className="companies-loading" role="status"><div className="loading-spinner" /><p>Loading companies…</p></div>
      : error ? <div className="companies-error" role="alert"><h3>Failed to Load Companies</h3><p>{error}</p><button className="retry-button" onClick={() => void load()}>Retry</button></div>
      : !data?.content.length ? <div className="companies-empty"><Building2 size={32} /><h3>No Companies Found</h3><p>Try a different search.</p></div>
      : <div className="dashboard-card"><div className="companies-table-wrapper" tabIndex={0} role="region" aria-label="Companies table"><table className="companies-table"><thead><tr><th>Company</th><th>GitHub Organization</th><th>Owner</th><th>Repositories</th><th>Users</th><th>Created</th></tr></thead><tbody>
        {data.content.map(company => <tr key={company.companyId} className="clickable-row" tabIndex={0} onClick={() => navigate(`/admin/companies/${company.companyId}`)} onKeyDown={e => { if (e.key === 'Enter') navigate(`/admin/companies/${company.companyId}`) }}>
          <td><div className="company-name-cell"><div className="company-avatar">{company.companyName?.[0]?.toUpperCase() || 'C'}</div><strong>{company.companyName}</strong></div></td>
          <td><span className="org-badge">{company.githubOrganizationUrl?.split('/').filter(Boolean).pop() || '—'}</span></td>
          <td><div className="owner-cell"><strong>{company.superAdminName || '—'}</strong><small>{company.superAdminEmail || '—'}</small></div></td>
          <td><span className="count-pill">{company.totalRepositories}</span></td><td><span className="count-pill">{company.totalUsers}</span></td><td>{formatDate(company.createdAt)}</td>
        </tr>)}</tbody></table></div></div>}
    {data && data.totalPages > 1 && <div className="admin-pagination"><button disabled={data.page === 0} onClick={() => setPage(data.page - 1)}>Previous</button><span>Page {data.page + 1} of {data.totalPages}</span><button disabled={data.page + 1 >= data.totalPages} onClick={() => setPage(data.page + 1)}>Next</button></div>}
  </section>
}
