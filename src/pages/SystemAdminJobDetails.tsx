import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FileText, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminApi } from '../config/adminApi'
import type { JobDetail } from './adminTypes'
import { formatDate, parseUtcDate } from './adminTypes'

interface ReportSummary {
  analysisId: number; repositoryName: string; overallDebtScore: number; overallHealthScore: string
  overallRiskLevel: string; totalClasses: number; defectiveClassesCount: number; totalSatdComments: number
}

export default function SystemAdminJobDetails({ analysisId }: { analysisId: number }) {
  const api = useAdminApi(); const navigate = useNavigate(); const [detail, setDetail] = useState<JobDetail | null>(null)
  const [report, setReport] = useState<ReportSummary | null>(null); const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false); const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState(0)
  const load = useCallback(async () => { setLoading(true); setError(null); try { setDetail(await api<JobDetail>(`/admin/analysis-jobs/${analysisId}`)); setFetchedAt(Date.now()) } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load analysis job') } finally { setLoading(false) } }, [analysisId, api])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])
  const duration = useMemo(() => {
    if (!detail?.job.startedAt) return 'Not available'
    const startDate = parseUtcDate(detail.job.startedAt)
    if (!startDate) return 'Not available'
    const start = startDate.getTime()
    const endDate = detail.job.completedAt ? parseUtcDate(detail.job.completedAt) : null
    const end = endDate ? endDate.getTime() : fetchedAt
    if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Not available'
    const seconds = Math.max(0, Math.round((end - start) / 1000)); return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }, [detail, fetchedAt])
  const openReport = async () => { setReportLoading(true); setError(null); try { setReport(await api<ReportSummary>(`/analysis/${analysisId}/report`)) } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load report') } finally { setReportLoading(false) } }

  if (loading) return <section className="dashboard-content"><div className="companies-loading" role="status"><div className="loading-spinner" /><p>Loading analysis job...</p></div></section>
  if (error && !detail) return <section className="dashboard-content"><button className="back-button" onClick={() => navigate('/admin/jobs')}><ArrowLeft size={15} /> Back to Jobs</button><div className="companies-error"><h3>Failed to Load Job</h3><p>{error}</p><button className="retry-button" onClick={() => void load()}>Retry</button></div></section>
  if (!detail) return null
  const job = detail.job
  const failureMessage = [...detail.history].reverse().find((event) => event.status === 'FAILED')?.message
  return <section className="dashboard-content companies-content"><div className="details-header-nav"><button className="back-button" onClick={() => navigate('/admin/jobs')}><ArrowLeft size={15} /> Back to Jobs</button><button className="view-button" onClick={() => void load()}><RefreshCw size={14} /> Refresh</button></div>
    <div className="page-heading"><div><h1>Analysis #{job.analysisId}</h1><p>{job.companyName || 'Unknown company'} / {job.repositoryName || 'Unknown repository'} / {job.branch || 'main'}</p></div><span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span></div>
    {error && <div className="admin-inline-error" role="alert">{error}</div>}
    {job.status === 'FAILED' && <div className="admin-inline-error" role="alert"><strong>Failure:</strong> {failureMessage || 'No failure details were provided.'}</div>}
    <div className="stats-grid"><Metric label="Started By" value={job.startedByName || 'System'} /><Metric label="Duration" value={duration} /><Metric label="Classes" value={String(job.totalClassesAnalyzed ?? 0)} /><Metric label="Completed" value={formatDate(job.completedAt, true)} /></div>
    <div className="dashboard-grid"><div className="dashboard-card"><div className="card-header"><div><h2>Status Timeline</h2><p>Chronological worker events</p></div></div><ol className="status-timeline">{detail.history.map((event, index) => <li key={`${event.timestamp}-${index}`}><span className={`health-dot ${event.status === 'COMPLETED' ? '' : event.status === 'FAILED' ? 'down' : 'degraded'}`} /><div><strong>{event.status}</strong><p>{event.message || 'No details provided'}</p><small>{formatDate(event.timestamp, true)}</small></div></li>)}</ol></div>
      <div className="dashboard-card"><div className="card-header"><div><h2>Analysis Report</h2><p>Technical debt result summary</p></div>{job.status === 'COMPLETED' && <button className="view-button" disabled={reportLoading} onClick={() => void openReport()}><FileText size={14} /> {reportLoading ? 'Loading...' : report ? 'Refresh' : 'Open report'}</button>}</div>
        {report ? <div className="report-summary"><Metric label="Debt Score" value={String(report.overallDebtScore ?? 'Not available')} /><Metric label="Health" value={report.overallHealthScore || 'Not available'} /><Metric label="Risk" value={report.overallRiskLevel || 'Not available'} /><Metric label="Defective Classes" value={`${report.defectiveClassesCount}/${report.totalClasses}`} /><Metric label="SATD Comments" value={String(report.totalSatdComments)} /></div> : <div className="admin-empty">{job.status === 'COMPLETED' ? 'Open the report to inspect its summary.' : 'A report is available after successful completion.'}</div>}</div>
    </div>
  </section>
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="stat-card"><div className="stat-value stat-value-text">{value}</div><div className="stat-title">{label}</div></div> }
