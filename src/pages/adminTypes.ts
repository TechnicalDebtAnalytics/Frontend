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

export const formatDate = (value?: string, includeTime = false) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return includeTime
    ? date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}
