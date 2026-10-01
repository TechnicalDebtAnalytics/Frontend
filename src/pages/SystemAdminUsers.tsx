import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Search, Users } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { queryString, useAdminApi } from '../config/adminApi'
import type { PagedResponse } from '../config/adminApi'
import type { AdminUser } from './adminTypes'
import { formatDate } from './adminTypes'

export default function SystemAdminUsers() {
  const api = useAdminApi(); const [params, setParams] = useSearchParams()
  const [data, setData] = useState<PagedResponse<AdminUser> | null>(null)
  const [input, setInput] = useState(params.get('q') || ''); const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const page = Math.max(0, Number(params.get('page') || 0)); const q = params.get('q') || ''
  const role = params.get('role') || ''; const verified = params.get('verified') || ''

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setData(await api<PagedResponse<AdminUser>>(`/admin/users?${queryString({ q, role, emailVerified: verified, page, size: 20, sort: 'createdAt,desc' })}`)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load users') }
    finally { setLoading(false) }
  }, [api, page, q, role, verified])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const update = (key: string, value: string) => { const copy = new URLSearchParams(params); if (value) copy.set(key, value); else copy.delete(key); copy.set('page', '0'); setParams(copy) }
  const setPage = (value: number) => { const copy = new URLSearchParams(params); copy.set('page', String(value)); setParams(copy) }
  const submit = (event: FormEvent) => { event.preventDefault(); update('q', input.trim()) }

  return <section className="dashboard-content companies-content">
    <div className="page-heading"><div><h1>Users</h1><p>Inspect registered users and all company affiliations.</p></div><div className="companies-count"><span className="count-badge">{data?.totalElements ?? 0}</span>Total Users</div></div>
    <form className="admin-filter-bar" onSubmit={submit}><Search size={16} /><input aria-label="Search users" value={input} onChange={e => setInput(e.target.value)} placeholder="Search name, email, or GitHub username" />
      <select aria-label="Filter role" value={role} onChange={e => update('role', e.target.value)}><option value="">All roles</option><option value="SUPER_ADMIN">Super Admin</option><option value="MEMBER">Member</option></select>
      <select aria-label="Filter verification" value={verified} onChange={e => update('verified', e.target.value)}><option value="">All verification states</option><option value="true">Verified</option><option value="false">Unverified</option></select><button type="submit">Search</button></form>
    {loading ? <div className="companies-loading" role="status"><div className="loading-spinner" /><p>Loading users…</p></div>
      : error ? <div className="companies-error" role="alert"><h3>Failed to Load Users</h3><p>{error}</p><button className="retry-button" onClick={() => void load()}>Retry</button></div>
      : !data?.content.length ? <div className="companies-empty"><Users size={32} /><h3>No Users Found</h3><p>Try different filters.</p></div>
      : <div className="dashboard-card"><div className="companies-table-wrapper" tabIndex={0} role="region" aria-label="Users table"><table className="companies-table"><thead><tr><th>User</th><th>Email</th><th>GitHub</th><th>Affiliations</th><th>Status</th><th>Joined</th></tr></thead><tbody>
        {data.content.map(user => <tr key={user.userId}><td><div className="company-name-cell"><div className="user-avatar-cell">{`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'}</div><div className="owner-cell"><strong>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}</strong><small>ID: {user.userId}</small></div></div></td>
          <td>{user.email}</td><td><span className="org-badge">{user.githubUsername ? `@${user.githubUsername}` : '—'}</span></td>
          <td><div className="affiliation-list">{user.affiliations.length ? user.affiliations.map(item => <span key={item.companyId} className={`role-badge ${item.role === 'Super Admin' ? 'role-super-admin' : 'role-member'}`}>{item.companyName} · {item.role}</span>) : <span>—</span>}</div></td>
          <td><span className={`status-badge ${user.emailVerified ? 'status-verified' : 'status-unverified'}`}>{user.emailVerified ? 'Verified' : 'Unverified'}</span></td><td>{formatDate(user.createdAt)}</td></tr>)}</tbody></table></div></div>}
    {data && data.totalPages > 1 && <div className="admin-pagination"><button disabled={data.page === 0} onClick={() => setPage(data.page - 1)}>Previous</button><span>Page {data.page + 1} of {data.totalPages}</span><button disabled={data.page + 1 >= data.totalPages} onClick={() => setPage(data.page + 1)}>Next</button></div>}
  </section>
}
