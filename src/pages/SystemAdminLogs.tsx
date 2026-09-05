import { useState, useEffect, useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import './SystemAdminDashboard.css'

export interface SystemLogDTO {
  statusHistoryId: number
  analysisId: number
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  message: string
  timestamp: string
  repositoryId: number | null
  repositoryName: string | null
  companyId: number | null
  companyName: string | null
  startedByUserId: number | null
  startedByUserName: string | null
}

type LogStatusFilter = 'ALL' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export default function SystemAdminLogs() {
  const { getAccessTokenSilently } = useAuth0()

  const [logs, setLogs] = useState<SystemLogDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<LogStatusFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getAccessTokenSilently()

      const url = statusFilter === 'ALL'
        ? 'http://localhost:8080/api/admin/logs'
        : `http://localhost:8080/api/admin/logs?status=${statusFilter}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch system logs (${response.status})`)
      }

      const data: SystemLogDTO[] = await response.json()
      setLogs(data)
    } catch (err) {
      console.error('Failed to load system logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load system logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [getAccessTokenSilently, statusFilter])

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs

    const query = searchQuery.toLowerCase().trim()
    return logs.filter((log) => {
      const logIdStr = String(log.statusHistoryId || '')
      const analysisIdStr = String(log.analysisId || '')
      const msgStr = (log.message || '').toLowerCase()
      const repoStr = (log.repositoryName || '').toLowerCase()
      const compStr = (log.companyName || '').toLowerCase()
      const userStr = (log.startedByUserName || '').toLowerCase()

      return (
        logIdStr.includes(query) ||
        analysisIdStr.includes(query) ||
        msgStr.includes(query) ||
        repoStr.includes(query) ||
        compStr.includes(query) ||
        userStr.includes(query)
      )
    })
  }, [logs, searchQuery])

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return

    const headers = [
      'Log ID',
      'Analysis ID',
      'Timestamp',
      'Status',
      'Company',
      'Repository',
      'Started By',
      'Message',
    ]

    const escapeCSV = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""'
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }

    const rows = filteredLogs.map((log) => [
      escapeCSV(log.statusHistoryId),
      escapeCSV(log.analysisId),
      escapeCSV(log.timestamp ? new Date(log.timestamp).toLocaleString() : ''),
      escapeCSV(log.status),
      escapeCSV(log.companyName || 'N/A'),
      escapeCSV(log.repositoryName || 'N/A'),
      escapeCSV(log.startedByUserName || 'System'),
      escapeCSV(log.message || ''),
    ])

    const csvContent =
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-')
    link.setAttribute('download', `debtlens_system_logs_${timestampStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'operational'
      case 'FAILED':
        return 'down'
      case 'RUNNING':
      case 'QUEUED':
        return 'degraded'
      default:
        return 'count-badge'
    }
  }

  return (
    <div className="companies-content">
      {/* Header section */}
      <div className="page-heading" style={{ marginBottom: '20px' }}>
        <div>
          <h1>System Logs</h1>
          <p>
            Platform-wide repository analysis lifecycle and execution status logs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="view-button"
            style={{ background: '#5b5ce2', color: '#fff', border: 'none' }}
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '20px',
          background: '#fff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e0e1e6',
        }}
      >
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['ALL', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as LogStatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: statusFilter === status ? '1px solid #5b5ce2' : '1px solid #e0e1e6',
                  background: statusFilter === status ? '#5b5ce2' : '#fff',
                  color: statusFilter === status ? '#fff' : '#4b4e6d',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: '0.15s ease',
                }}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search logs, repos, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '6px',
              border: '1px solid #e0e1e6',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '14px',
            }}
          >
            ⌕
          </span>
        </div>
      </div>

      {/* Main Content / Table Area */}
      {loading ? (
        <div
          style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '12px',
            border: '1px solid #e0e1e6',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          Loading system logs...
        </div>
      ) : error ? (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>{error}</p>
          <button
            onClick={fetchLogs}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: '50px 20px',
            borderRadius: '12px',
            border: '1px solid #e0e1e6',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
          <h3 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>No system logs found</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            {searchQuery
              ? `No logs match "${searchQuery}" under ${statusFilter} filter.`
              : `No logs recorded for status ${statusFilter}.`}
          </p>
        </div>
      ) : (
        <div
          className="companies-table-wrapper"
          style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e0e1e6',
          }}
        >
          <table className="companies-table">
            <thead>
              <tr>
                <th>LOG ID</th>
                <th>ANALYSIS ID</th>
                <th>STATUS</th>
                <th>COMPANY</th>
                <th>REPOSITORY</th>
                <th>MESSAGE</th>
                <th>STARTED BY</th>
                <th>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.statusHistoryId}>
                  <td>
                    <strong style={{ color: '#475569' }}>#{log.statusHistoryId}</strong>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>
                      #{log.analysisId}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(log.status)}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <strong>{log.companyName || '—'}</strong>
                  </td>
                  <td>{log.repositoryName || '—'}</td>
                  <td style={{ maxWidth: '340px', wordBreak: 'break-word' }}>
                    {log.message}
                  </td>
                  <td>{log.startedByUserName || 'System'}</td>
                  <td style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
