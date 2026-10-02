export interface UserAffiliation { companyId: number; companyName: string; role: string }
export interface AdminUser {
  userId: number; firstName: string; lastName: string; email: string; githubUsername: string
  emailVerified: boolean; affiliations: UserAffiliation[]; createdAt: string
}
export interface AdminCompany {
  companyId: number; companyName: string; githubOrganizationUrl: string; superAdminName: string
  superAdminEmail: string; totalRepositories: number; totalUsers: number; createdAt: string
}
export interface AnalysisJob {
  analysisId: number; repositoryId?: number; repositoryName?: string; repositoryUrl?: string
  companyId?: number; companyName?: string; branch: string; startedByUserId?: number
  startedByName?: string; status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  startedAt: string; completedAt?: string; totalClassesAnalyzed?: number
}
export interface HealthItem {
  name: string; key: string; description: string; status: 'UP' | 'DEGRADED' | 'DOWN'
  details: string; responseTimeMs: number; checkedAt: string
}
export interface SystemHealth { overallStatus: 'UP' | 'DEGRADED' | 'DOWN'; timestamp: string; services: HealthItem[] }
export interface AdminStats {
  totalUsers: number; totalCompanies: number; totalRepositories: number; totalAnalysisJobs: number
  queuedJobs: number; runningJobs: number; completedJobs: number; failedJobs: number; cancelledJobs: number
}
export interface AdminActivity {
  type: string; title: string; description: string; targetType: string; targetId?: number; occurredAt: string
}
export interface SearchResult { type: 'USER' | 'COMPANY' | 'REPOSITORY' | 'ANALYSIS_JOB'; id: number; parentId?: number; label: string; description: string }
export interface JobHistory { status: AnalysisJob['status']; message: string; timestamp: string }
export interface JobDetail { job: AnalysisJob; history: JobHistory[] }

export const parseUtcDate = (value?: string | number | null): Date | null => {
  if (!value) return null
  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const trimmed = String(value).trim()
  if (!trimmed) return null

  // If the date string already contains a timezone (Z, z, +HH:MM, -HH:MM), parse directly
  if (trimmed.endsWith('Z') || trimmed.endsWith('z') || /[+-]\d{2}(?::?\d{2})?$/.test(trimmed)) {
    const d = new Date(trimmed)
    return Number.isNaN(d.getTime()) ? null : d
  }

  // If it is an ISO string without offset (e.g. "2026-10-02T07:09:00" or "2026-10-02 07:09:00"), treat as UTC
  const normalized = trimmed.includes('T')
    ? `${trimmed}Z`
    : `${trimmed.replace(' ', 'T')}Z`

  const d = new Date(normalized)
  if (!Number.isNaN(d.getTime())) return d

  const fallback = new Date(trimmed)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export const formatDate = (value?: string | number | null, includeTime = false) => {
  const date = parseUtcDate(value)
  if (!date) return '—'
  return includeTime
    ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

