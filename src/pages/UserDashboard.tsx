import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Building2,
  Users,
  Crown,
  ChevronRight,
  Bell,
  Search,
  Settings,
  LogOut,
  GitBranch,
  ExternalLink,
  Shield,
  UserCheck,
  Activity,
  X,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Layers,
  UserPlus,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  Inbox,
  Play,
  TrendingUp,
  Code2,
  Tag,
  FileCode,
  History,
  RotateCw,
  Maximize2,
  Minimize2,
  Radio,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

interface RefactoringAction {
  type: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  title: string;
  description: string;
  suggestedRefactoring: string;
}

interface ClassRecommendation {
  classId: number;
  className: string;
  filePath: string;
  startLine: number;
  endLine: number;
  numberOfLinesOfCode: number;
  technicalDebtScore: number;
  healthScore: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
  bugProbability: number;
  refactorPriorityRank: number;
  primaryDrivers: string[];
  recommendedActions: RefactoringAction[];
}

interface TechnicalDebtReport {
  reportId: number;
  analysisId: number;
  repositoryId: number;
  repositoryName: string;
  branch: string;
  generatedAt: string;
  overallDebtScore: number;
  overallHealthScore: string;
  overallRiskLevel: string;
  totalClasses: number;
  defectiveClassesCount: number;
  totalSatdComments: number;
  prioritizedRefactoringList: ClassRecommendation[];
}

interface RepoContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  description: string;
  private: boolean;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

interface CompanyAvailableRepo {
  githubRepositoryId: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string;
  description: string;
  alreadyAdded: boolean;
  language: string;
  stargazersCount: number;
}

interface CompanyAdminItem {
  companyId: number;
  companyName: string;
  githubOrganizationName: string;
  githubOrganizationUrl: string;
  totalRepositories: number;
  repositories?: {
    repositoryId: number;
    githubRepositoryId: number;
    repositoryName: string;
    repositoryUrl: string;
    defaultBranch: string;
  }[];
  createdAt: string;
}

interface CompanyRepoItem {
  repositoryId: number;
  githubRepositoryId: number;
  repositoryName: string;
  repositoryUrl: string;
  defaultBranch: string;
  createdAt?: string;
}

interface InvitationResponse {
  invitationId: number;
  email: string;
  githubUsername: string;
  repositoryId: number;
  repositoryName: string;
  companyId: number;
  companyName: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface PastAnalysisJob {
  analysisId: number;
  repositoryId: number;
  repositoryName: string;
  repositoryUrl: string;
  companyId: number;
  companyName: string;
  branch: string;
  startedByUserId: number | null;
  startedByUserName: string | null;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | string;
  startedAt: string;
  completedAt: string | null;
  totalClassesAnalyzed?: number;
  totalClasses?: number;
}

export default function UserDashboard() {
  const { user: authUser, logout, getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "admin" | "member">("all");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Live admin companies from backend
  const [adminCompaniesList, setAdminCompaniesList] = useState<CompanyAdminItem[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // ── Create Company Modal State ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Org & Membership Verification
  const [orgInput, setOrgInput] = useState("");
  const [verifyingOrg, setVerifyingOrg] = useState(false);
  const [orgError, setOrgError] = useState("");
  const [verifiedOrg, setVerifiedOrg] = useState<{
    login: string;
    name?: string;
    avatar_url: string;
    public_repos: number;
    message: string;
  } | null>(null);

  // Step 2: Repositories & Contributors
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [availableRepos, setAvailableRepos] = useState<GithubRepo[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<number[]>([]);
  const [repoSearch, setRepoSearch] = useState("");

  // Live Contributors inspection
  const [activeRepoForContributors, setActiveRepoForContributors] = useState<string | null>(null);
  const [contributorsMap, setContributorsMap] = useState<Record<string, RepoContributor[]>>({});
  const [loadingContributors, setLoadingContributors] = useState<Record<string, boolean>>({});

  // Step 3: Company Submission
  const [companyNameInput, setCompanyNameInput] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [creationError, setCreationError] = useState("");
  const [creationSuccess, setCreationSuccess] = useState(false);

  // ── Manage Company Repositories Modal State ──
  const [manageCompany, setManageCompany] = useState<CompanyAdminItem | null>(null);
  const [availableForCompany, setAvailableForCompany] = useState<CompanyAvailableRepo[]>([]);
  const [loadingCompanyRepos, setLoadingCompanyRepos] = useState(false);
  const [newlySelectedRepoIds, setNewlySelectedRepoIds] = useState<number[]>([]);
  const [addingRepos, setAddingRepos] = useState(false);
  const [addReposError, setAddReposError] = useState("");
  const [addReposSuccess, setAddReposSuccess] = useState(false);

  // ── Invite Contributors Modal State ──
  const [inviteCompany, setInviteCompany] = useState<CompanyAdminItem | null>(null);
  const [companyRepos, setCompanyRepos] = useState<CompanyRepoItem[]>([]);
  const [selectedRepoForInvite, setSelectedRepoForInvite] = useState<CompanyRepoItem | null>(null);
  const [loadingCompanyReposForInvite, setLoadingCompanyReposForInvite] = useState(false);
  const [loadingRepoContributors, setLoadingRepoContributors] = useState(false);
  const [repoContributorsList, setRepoContributorsList] = useState<RepoContributor[]>([]);
  const [existingInvitations, setExistingInvitations] = useState<InvitationResponse[]>([]);
  const [selectedContributorsForInvite, setSelectedContributorsForInvite] = useState<Record<string, string>>({});
  const [contributorSearchQuery, setContributorSearchQuery] = useState("");
  const [sendingInvitations, setSendingInvitations] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // ── My Pending Invitations & Member Companies State ──
  const [myPendingInvitations, setMyPendingInvitations] = useState<InvitationResponse[]>([]);
  const [processingInvitationId, setProcessingInvitationId] = useState<number | null>(null);
  const [memberCompaniesList, setMemberCompaniesList] = useState<CompanyAdminItem[]>([]);
  const [loadingMemberCompanies, setLoadingMemberCompanies] = useState(false);
  const [invitationActionMsg, setInvitationActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Full Page Workspace States ──
  const [analysisPageCompany, setAnalysisPageCompany] = useState<CompanyAdminItem | null>(null);
  const [analysisPageRole, setAnalysisPageRole] = useState<"admin" | "member">("admin");
  const [analysisRepoSearch, setAnalysisRepoSearch] = useState("");
  const [manageRepoSearch, setManageRepoSearch] = useState("");
  const [pastAnalysesCompany, setPastAnalysesCompany] = useState<CompanyAdminItem | null>(null);
  const [pastAnalysesRole, setPastAnalysesRole] = useState<"admin" | "member">("admin");
  const [pastAnalysesRepos, setPastAnalysesRepos] = useState<CompanyRepoItem[]>([]);
  const [selectedPastRepoId, setSelectedPastRepoId] = useState<number | "ALL">("ALL");
  const [pastAnalysesList, setPastAnalysesList] = useState<PastAnalysisJob[]>([]);
  const [loadingPastAnalyses, setLoadingPastAnalyses] = useState<boolean>(false);
  const [pastAnalysesError, setPastAnalysesError] = useState<string>("");
  const [pastAnalysesSearch, setPastAnalysesSearch] = useState<string>("");
  const [pastAnalysesStatusFilter, setPastAnalysesStatusFilter] = useState<string>("ALL");

  // ── Company Repositories Active State ──
  const [activeCompanyRepos, setActiveCompanyRepos] = useState<CompanyRepoItem[]>([]);
  const [loadingActiveCompanyRepos, setLoadingActiveCompanyRepos] = useState(false);

  // ── Analysis Execution State ──
  const [analyzingRepoIds, setAnalyzingRepoIds] = useState<Record<number, boolean>>({});
  const [analysisStatusMap, setAnalysisStatusMap] = useState<Record<number, {
    analysisId?: number;
    status?: string;
    totalClasses?: number;
    completedAt?: string;
    startedAt?: string;
  }>>({});

  // ── Technical Debt Report & Recommendations Modal State ──
  const [selectedReportAnalysisId, setSelectedReportAnalysisId] = useState<number | null>(null);
  const [activeReport, setActiveReport] = useState<TechnicalDebtReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<"ALL" | "CRITICAL" | "HIGH">("ALL");

  // ── WebSocket Live Analysis & Maximized Window States ──
  const [wsConnected, setWsConnected] = useState(false);
  const [maximizedSection, setMaximizedSection] = useState<"admin" | "member" | null>(null);
  const [liveToast, setLiveToast] = useState<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    analysisId?: number;
    timestamp: string;
  } | null>(null);

  const user = {
    name: authUser?.name ?? authUser?.nickname ?? "User",
    email: authUser?.email ?? "",
    avatar:
      authUser?.picture ? "" : (authUser?.name ?? authUser?.nickname ?? "User").slice(0, 2).toUpperCase(),
    role: authUser?.email ? authUser.email : "Authenticated account",
  };

  // Fetch real admin companies from backend
  const fetchAdminCompanies = async () => {
    try {
      setLoadingCompanies(true);
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/companies/my-admin`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAdminCompaniesList(Array.isArray(data) ? data.filter(Boolean) : []);
      }
    } catch (err) {
      console.warn("Could not fetch admin companies:", err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Fetch pending invitations for current user
  const fetchMyPendingInvitations = async () => {
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/invitations/my-pending`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMyPendingInvitations(Array.isArray(data) ? data.filter(Boolean) : []);
      }
    } catch (err) {
      console.warn("Could not fetch my pending invitations:", err);
    }
  };

  // Fetch real member companies
  const fetchMemberCompanies = async () => {
    try {
      setLoadingMemberCompanies(true);
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/companies/my-member`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMemberCompaniesList(Array.isArray(data) ? data.filter(Boolean) : []);
      }
    } catch (err) {
      console.warn("Could not fetch member companies:", err);
    } finally {
      setLoadingMemberCompanies(false);
    }
  };

  // Accept pending invitation
  const handleAcceptInvitation = async (invitation: InvitationResponse) => {
    setProcessingInvitationId(invitation.invitationId);
    setInvitationActionMsg(null);
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/invitations/${invitation.invitationId}/accept`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to accept invitation");
      }

      setInvitationActionMsg({
        type: "success",
        text: `🎉 You have joined ${invitation?.companyName || "the organization"} for repository ${invitation?.repositoryName || "the repository"}!`,
      });

      await Promise.all([fetchMyPendingInvitations(), fetchMemberCompanies()]);
    } catch (err: any) {
      setInvitationActionMsg({
        type: "error",
        text: err.message || "Failed to accept invitation",
      });
    } finally {
      setProcessingInvitationId(null);
    }
  };

  // Reject pending invitation
  const handleRejectInvitation = async (invitation: InvitationResponse) => {
    setProcessingInvitationId(invitation.invitationId);
    setInvitationActionMsg(null);
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/invitations/${invitation.invitationId}/reject`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to decline invitation");
      }

      setInvitationActionMsg({
        type: "success",
        text: `Invitation for ${invitation.repositoryName} declined.`,
      });

      await fetchMyPendingInvitations();
    } catch (err: any) {
      setInvitationActionMsg({
        type: "error",
        text: err.message || "Failed to decline invitation",
      });
    } finally {
      setProcessingInvitationId(null);
    }
  };

  // Open Full Page Analysis Workspace (do NOT preload previous old jobs results)
  const openAnalysisPage = async (company: CompanyAdminItem, role: "admin" | "member") => {
    setAnalysisPageCompany(company);
    setAnalysisPageRole(role);
    setAnalysisRepoSearch("");
    // Clear analysis status map so previous historical results are not shown
    setAnalysisStatusMap({});
    setLoadingActiveCompanyRepos(true);
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/companies/${company.companyId}/repositories`, { headers });
      if (res.ok) {
        const data: CompanyRepoItem[] = await res.json();
        setActiveCompanyRepos(data);
      } else {
        setActiveCompanyRepos([]);
      }
    } catch (err) {
      console.warn("Could not fetch company repositories for analysis workspace:", err);
      setActiveCompanyRepos([]);
    } finally {
      setLoadingActiveCompanyRepos(false);
    }
  };

  const closeAnalysisPage = () => {
    setAnalysisPageCompany(null);
    setAnalysisRepoSearch("");
  };

  // Open Full Page Past Analyses Workspace
  const openPastAnalysesPage = async (company: CompanyAdminItem, role: "admin" | "member" = "admin", initialRepoId?: number) => {
    setPastAnalysesCompany(company);
    setPastAnalysesRole(role);
    setLoadingPastAnalyses(true);
    setPastAnalysesError("");
    setPastAnalysesSearch("");
    setSelectedPastRepoId(initialRepoId ?? "ALL");
    setPastAnalysesStatusFilter("ALL");

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [reposRes, analysisRes] = await Promise.all([
        fetch(`${API_BASE_URL}/companies/${company.companyId}/repositories`, { headers }),
        fetch(`${API_BASE_URL}/companies/${company.companyId}/analysis`, { headers }),
      ]);

      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setPastAnalysesRepos(Array.isArray(reposData) ? reposData.filter(Boolean) : []);
      } else {
        setPastAnalysesRepos([]);
      }

      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        setPastAnalysesList(Array.isArray(analysisData) ? analysisData.filter(Boolean) : []);
      } else {
        setPastAnalysesList([]);
      }
    } catch (err: any) {
      console.error("Failed to load past analyses:", err);
      setPastAnalysesError(err.message || "Could not fetch past analyses.");
      setPastAnalysesRepos([]);
      setPastAnalysesList([]);
    } finally {
      setLoadingPastAnalyses(false);
    }
  };

  const closePastAnalysesPage = () => {
    setPastAnalysesCompany(null);
    setPastAnalysesList([]);
    setPastAnalysesRepos([]);
    setSelectedPastRepoId("ALL");
    setPastAnalysesError("");
  };

  // Trigger analysis for a repository via RabbitMQ
  const handleStartAnalysis = async (repo: CompanyRepoItem) => {
    setAnalyzingRepoIds((prev) => ({ ...prev, [repo.repositoryId]: true }));
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const targetBranch = repo.defaultBranch || "main";
      const res = await fetch(
        `${API_BASE_URL}/repositories/${repo.repositoryId}/analysis?branch=${encodeURIComponent(targetBranch)}`,
        {
          method: "POST",
          headers,
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to start analysis job");
      }

      const data = await res.json();
      // Immediately reset status to QUEUED so old completed state and button disappear
      setAnalysisStatusMap((prev) => ({
        ...prev,
        [repo.repositoryId]: {
          analysisId: data.analysisId,
          status: "QUEUED",
          startedAt: data.startedAt,
        },
      }));

      setInvitationActionMsg({
        type: "success",
        text: `Analysis job #${data.analysisId} started for '${repo.repositoryName}' (${targetBranch})! Running metrics extraction and ML models...`,
      });

      // Active polling every 2.5 seconds until entire ML pipeline is COMPLETED
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch(`${API_BASE_URL}/repositories/${repo.repositoryId}/analysis`, { headers });
          if (pollRes.ok) {
            const jobs = await pollRes.json();
            if (Array.isArray(jobs) && jobs.length > 0) {
              const latest = jobs[0];
              setAnalysisStatusMap((prev) => ({
                ...prev,
                [repo.repositoryId]: {
                  analysisId: latest.analysisId,
                  status: latest.status,
                  totalClasses: latest.totalClassesAnalyzed,
                  startedAt: latest.startedAt,
                  completedAt: latest.completedAt,
                },
              }));
              if (latest.status === "COMPLETED" || latest.status === "FAILED" || attempts >= 40) {
                clearInterval(pollInterval);
              }
            }
          }
        } catch (e) {
          if (attempts >= 40) clearInterval(pollInterval);
        }
      }, 2500);
    } catch (err: any) {
      setInvitationActionMsg({
        type: "error",
        text: err.message || `Failed to start analysis for ${repo.repositoryName}`,
      });
    } finally {
      setAnalyzingRepoIds((prev) => ({ ...prev, [repo.repositoryId]: false }));
    }
  };

  const handleOpenReport = async (analysisId: number) => {
    setSelectedReportAnalysisId(analysisId);
    setLoadingReport(true);
    setReportError("");
    setActiveReport(null);

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/report`, { headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to load technical debt report");
      }

      const data: TechnicalDebtReport = await res.json();
      setActiveReport(data);
    } catch (err: any) {
      setReportError(err.message || "Failed to load report");
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchAdminCompanies();
      fetchMyPendingInvitations();
      fetchMemberCompanies();
    }
  }, [isLoading, isAuthenticated]);

  // ── WebSocket Listener for Live Analysis Progress ──
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;
    let retryDelay = 5000;

    const connectWebSocket = () => {
      if (isUnmounted) return;
      try {
        let wsUrl: string;
        if (API_BASE_URL.startsWith("http")) {
          wsUrl = API_BASE_URL.replace(/^http/, "ws").replace(/\/api\/?$/, "") + "/ws/analysis";
        } else {
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          wsUrl = `${protocol}//${window.location.host}/ws/analysis`;
        }

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isUnmounted) {
            setWsConnected(true);
            retryDelay = 5000; // Reset retry delay on successful connection
            console.log("[WebSocket] Connected to analysis progress feed:", wsUrl);
          }
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const data = JSON.parse(event.data);
            if (!data || !data.jobId) return;

            const { jobId, repositoryId, repositoryName, branch, status, totalClasses, message } = data;

            // 1. Update analysis status map
            if (repositoryId) {
              setAnalysisStatusMap((prev) => ({
                ...prev,
                [repositoryId]: {
                  analysisId: jobId,
                  status: status,
                  totalClasses: totalClasses,
                  completedAt: status === "COMPLETED" || status === "FAILED" ? new Date().toISOString() : prev[repositoryId]?.completedAt,
                  startedAt: prev[repositoryId]?.startedAt || new Date().toISOString(),
                },
              }));

              // 2. Update analyzing spinner state
              if (status === "COMPLETED" || status === "FAILED") {
                setAnalyzingRepoIds((prev) => ({ ...prev, [repositoryId]: false }));
              } else if (status === "RUNNING" || status === "QUEUED") {
                setAnalyzingRepoIds((prev) => ({ ...prev, [repositoryId]: true }));
              }
            }

            // 3. Live update past analyses list if open
            setPastAnalysesList((prev) => {
              const existingIdx = prev.findIndex((j) => j.analysisId === jobId);
              if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = {
                  ...updated[existingIdx],
                  status: status,
                  totalClassesAnalyzed: totalClasses,
                  totalClasses: totalClasses,
                  completedAt: status === "COMPLETED" || status === "FAILED" ? new Date().toISOString() : updated[existingIdx].completedAt,
                };
                return updated;
              } else if (repositoryId) {
                const newJob: PastAnalysisJob = {
                  analysisId: jobId,
                  repositoryId: repositoryId,
                  repositoryName: repositoryName || "Repository",
                  repositoryUrl: "",
                  companyId: 0,
                  companyName: "",
                  branch: branch || "main",
                  startedByUserId: null,
                  startedByUserName: "You",
                  status: status,
                  startedAt: new Date().toISOString(),
                  completedAt: status === "COMPLETED" || status === "FAILED" ? new Date().toISOString() : null,
                  totalClassesAnalyzed: totalClasses,
                  totalClasses: totalClasses,
                };
                return [newJob, ...prev];
              }
              return prev;
            });

            // 4. Trigger live toast notification
            const toastType = status === "COMPLETED" ? "success" : status === "FAILED" ? "error" : status === "RUNNING" ? "info" : "warning";
            const toastTitle = `Analysis #${jobId} ${status}`;
            const toastMsg = message || `Repository '${repositoryName || repositoryId}' (${branch || "main"}) is now ${status}.`;
            setLiveToast({
              id: `${jobId}-${status}-${Date.now()}`,
              type: toastType,
              title: toastTitle,
              message: toastMsg,
              analysisId: jobId,
              timestamp: new Date().toLocaleTimeString(),
            });
          } catch (err) {
            console.warn("[WebSocket] Error processing message:", err);
          }
        };

        ws.onerror = () => {
          if (!isUnmounted) {
            setWsConnected(false);
          }
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            setWsConnected(false);
            // Exponential backoff retry (up to 60s)
            const currentDelay = retryDelay;
            retryDelay = Math.min(retryDelay * 1.5, 60000);
            reconnectTimeout = setTimeout(connectWebSocket, currentDelay);
          }
        };
      } catch {
        if (!isUnmounted) {
          setWsConnected(false);
          const currentDelay = retryDelay;
          retryDelay = Math.min(retryDelay * 1.5, 60000);
          reconnectTimeout = setTimeout(connectWebSocket, currentDelay);
        }
      }
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Auto-dismiss live toast after 7 seconds
  useEffect(() => {
    if (!liveToast) return;
    const t = setTimeout(() => {
      setLiveToast(null);
    }, 7000);
    return () => clearTimeout(t);
  }, [liveToast]);

  // Filtered lists
  const filteredAdmin = (Array.isArray(adminCompaniesList) ? adminCompaniesList : [])
    .filter((c) => Boolean(c && typeof c === "object"))
    .filter((c) =>
      (c.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.githubOrganizationName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const displayMemberCompanies = Array.isArray(memberCompaniesList) ? memberCompaniesList : [];
  const filteredMember = displayMemberCompanies
    .filter((c) => Boolean(c && typeof c === "object"))
    .filter((c) =>
      (c.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.githubOrganizationName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalAdminRepos = (Array.isArray(adminCompaniesList) ? adminCompaniesList : []).reduce(
    (s, c) => s + (c?.totalRepositories || 0),
    0
  );
  const totalMemberRepos = displayMemberCompanies.reduce(
    (s, c) => s + (c?.totalRepositories || 0),
    0
  );
  const totalRepos = totalAdminRepos + totalMemberRepos;

  // ── Create Modal Actions ──
  const openCreateModal = () => {
    setIsModalOpen(true);
    setStep(1);
    setOrgInput("");
    setOrgError("");
    setVerifiedOrg(null);
    setAvailableRepos([]);
    setSelectedRepoIds([]);
    setRepoSearch("");
    setActiveRepoForContributors(null);
    setContributorsMap({});
    setCompanyNameInput("");
    setCreationError("");
    setCreationSuccess(false);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
  };

  // Helper: Extract organization login slug STRICTLY from a GitHub URL
  const extractOrgNameFromUrl = (input: string): string | null => {
    const cleaned = input.trim().split("?")[0].split("#")[0].replace(/\/+$/, "");
    // Strictly require a GitHub URL format (e.g., https://github.com/orgName or github.com/orgName)
    const githubUrlRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/?$/i;
    const match = cleaned.match(githubUrlRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  };

  // Step 1: Verify Org & Membership
  const handleVerifyOrg = async () => {
    const trimmedInput = orgInput.trim();
    if (!trimmedInput) {
      setOrgError("Please enter a GitHub organization URL (e.g. https://github.com/TechnicalDebtAnalytics)");
      return;
    }

    const orgSlug = extractOrgNameFromUrl(trimmedInput);
    if (!orgSlug) {
      setOrgError("Invalid input: Please enter the full GitHub organization URL (e.g. https://github.com/TechnicalDebtAnalytics). Plain organization names are not accepted.");
      return;
    }

    setVerifyingOrg(true);
    setOrgError("");
    setVerifiedOrg(null);

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch (err) {
        console.warn("No Auth0 token available, trying without auth", err);
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 1. Check organization info
      const orgRes = await fetch(`${API_BASE_URL}/github/orgs/${encodeURIComponent(orgSlug)}`, { headers });
      if (!orgRes.ok) {
        const errData = await orgRes.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub Organization '${orgSlug}' not found`);
      }
      const orgData = await orgRes.json();

      // 2. Validate user membership in this org
      const memberRes = await fetch(
        `${API_BASE_URL}/github/orgs/${encodeURIComponent(orgSlug)}/validate-my-membership`,
        { headers }
      );

      let validationMessage = "You are a verified member/contributor of this organization.";
      if (memberRes.ok) {
        const memberData = await memberRes.json();
        if (!memberData.isMember) {
          throw new Error(memberData.message || "You are not a public member of this organization.");
        }
        validationMessage = memberData.message;
      }

      setVerifiedOrg({
        login: orgData.login,
        name: orgData.name || orgData.login,
        avatar_url: orgData.avatar_url,
        public_repos: orgData.public_repos,
        message: validationMessage,
      });

      setCompanyNameInput(orgData.name || orgData.login);

      // Load repos for step 2
      fetchOrgRepos(orgData.login, token);
      setStep(2);
    } catch (err: any) {
      setOrgError(err.message || "Failed to verify organization. Please check the organization URL and try again.");
    } finally {
      setVerifyingOrg(false);
    }
  };

  // Step 2: Fetch Org Repositories
  const fetchOrgRepos = async (orgName: string, token?: string) => {
    setLoadingRepos(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/github/orgs/${orgName}/repos`, { headers });
      if (res.ok) {
        const repos: GithubRepo[] = await res.json();
        setAvailableRepos(repos);
        // Auto-select Java repositories and newly forked/unindexed repositories
        const javaRepoIds = repos
          .filter((r) => !r.language || r.language.toLowerCase() === "java")
          .map((r) => r.id);
        setSelectedRepoIds(javaRepoIds);
      }
    } catch (err) {
      console.error("Failed to load repositories:", err);
    } finally {
      setLoadingRepos(false);
    }
  };

  // Step 2: Fetch Contributors for a specific repo
  const handleInspectContributors = async (orgLogin: string, repoName: string) => {
    if (activeRepoForContributors === repoName) {
      setActiveRepoForContributors(null);
      return;
    }

    setActiveRepoForContributors(repoName);

    if (contributorsMap[repoName]) {
      return; // already cached
    }

    setLoadingContributors((prev) => ({ ...prev, [repoName]: true }));
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${API_BASE_URL}/github/repos/${orgLogin}/${repoName}/contributors`,
        { headers }
      );

      if (res.ok) {
        const data: RepoContributor[] = await res.json();
        setContributorsMap((prev) => ({ ...prev, [repoName]: data }));
      }
    } catch (err) {
      console.error("Failed to fetch contributors for", repoName, err);
    } finally {
      setLoadingContributors((prev) => ({ ...prev, [repoName]: false }));
    }
  };

  const toggleRepoSelection = (repo: GithubRepo) => {
    if (selectedRepoIds.includes(repo.id)) {
      setSelectedRepoIds(selectedRepoIds.filter((id) => id !== repo.id));
      setOrgError("");
    } else {
      // Validate Java repository (only block explicitly non-Java repositories)
      if (repo.language && repo.language.toLowerCase() !== "java") {
        setOrgError(
          `Cannot select '${repo.name}'. DebtLens currently only analyzes Java repositories (detected language: ${repo.language}).`
        );
        return;
      }
      setOrgError("");
      setSelectedRepoIds([...selectedRepoIds, repo.id]);
    }
  };

  // Step 3: Create Company Submit
  const handleCreateCompanySubmit = async () => {
    if (!companyNameInput.trim()) {
      setCreationError("Please enter a company name");
      return;
    }
    if (selectedRepoIds.length === 0) {
      setCreationError("Please select at least one repository");
      return;
    }

    setCreatingCompany(true);
    setCreationError("");

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const selectedReposPayload = availableRepos
        .filter((r) => selectedRepoIds.includes(r.id))
        .map((r) => ({
          githubRepositoryId: r.id,
          repositoryName: r.name,
          repositoryUrl: r.html_url,
          defaultBranch: r.default_branch || "main",
        }));

      const payload = {
        companyName: companyNameInput.trim(),
        githubOrganizationName: verifiedOrg!.login,
        selectedRepositories: selectedReposPayload,
      };

      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create company");
      }

      setCreationSuccess(true);
      await fetchAdminCompanies();

      setTimeout(() => {
        setIsModalOpen(false);
      }, 1400);
    } catch (err: any) {
      setCreationError(err.message || "Failed to create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  // ── Manage Existing Company Repositories ──
  const openManageModal = async (company: CompanyAdminItem) => {
    setManageCompany(company);
    setNewlySelectedRepoIds([]);
    setAddReposError("");
    setAddReposSuccess(false);
    setActiveRepoForContributors(null);
    setLoadingCompanyRepos(true);

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/companies/${company.companyId}/available-repositories`, { headers });
      if (res.ok) {
        const data: CompanyAvailableRepo[] = await res.json();
        setAvailableForCompany(data);
      }
    } catch (err) {
      console.error("Failed to load company available repos:", err);
    } finally {
      setLoadingCompanyRepos(false);
    }
  };

  const toggleNewRepoSelection = (repoId: number, repoName: string) => {
    if (newlySelectedRepoIds.includes(repoId)) {
      setNewlySelectedRepoIds(newlySelectedRepoIds.filter((id) => id !== repoId));
      setAddReposError("");
    } else {
      const targetRepo = availableForCompany.find((r) => r.githubRepositoryId === repoId);
      // Validate Java repository (only block explicitly non-Java repositories)
      if (targetRepo?.language && targetRepo.language.toLowerCase() !== "java") {
        setAddReposError(
          `Cannot add '${repoName}'. DebtLens currently only analyzes Java repositories (detected language: ${targetRepo.language}).`
        );
        return;
      }
      setAddReposError("");
      setNewlySelectedRepoIds([...newlySelectedRepoIds, repoId]);
      if (manageCompany) {
        handleInspectContributors(manageCompany.githubOrganizationName, repoName);
      }
    }
  };

  const handleAddRepositoriesSubmit = async () => {
    if (!manageCompany || newlySelectedRepoIds.length === 0) return;

    setAddingRepos(true);
    setAddReposError("");

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const selectedPayload = availableForCompany
        .filter((r) => newlySelectedRepoIds.includes(r.githubRepositoryId))
        .map((r) => ({
          githubRepositoryId: r.githubRepositoryId,
          repositoryName: r.name,
          repositoryUrl: r.htmlUrl,
          defaultBranch: r.defaultBranch || "main",
        }));

      const res = await fetch(`${API_BASE_URL}/companies/${manageCompany.companyId}/repositories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ repositories: selectedPayload }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add repositories");
      }

      setAddReposSuccess(true);
      await fetchAdminCompanies();

      setTimeout(() => {
        setManageCompany(null);
      }, 1200);
    } catch (err: any) {
      setAddReposError(err.message || "Failed to add repositories");
    } finally {
      setAddingRepos(false);
    }
  };

  // ── Invite Contributors Modal Actions ──
  const openInviteModal = async (company: CompanyAdminItem) => {
    setInviteCompany(company);
    setCompanyRepos([]);
    setSelectedRepoForInvite(null);
    setRepoContributorsList([]);
    setExistingInvitations([]);
    setSelectedContributorsForInvite({});
    setContributorSearchQuery("");
    setInviteError("");
    setInviteSuccess(null);
    setLoadingCompanyReposForInvite(true);

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/companies/${company.companyId}/repositories`, { headers });
      if (res.ok) {
        const repos: CompanyRepoItem[] = await res.json();
        setCompanyRepos(repos);
        if (repos.length > 0) {
          loadRepoContributorsAndInvites(company, repos[0], token);
        }
      }
    } catch (err) {
      console.error("Failed to load company repositories for invite:", err);
    } finally {
      setLoadingCompanyReposForInvite(false);
    }
  };

  const loadRepoContributorsAndInvites = async (
    company: CompanyAdminItem,
    repo: CompanyRepoItem,
    tokenParam?: string
  ) => {
    setSelectedRepoForInvite(repo);
    setSelectedContributorsForInvite({});
    setInviteError("");
    setInviteSuccess(null);
    setLoadingRepoContributors(true);

    try {
      let token = tokenParam;
      if (!token) {
        try {
          token = await getAccessTokenSilently();
        } catch { }
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 1. Fetch live contributors from GitHub
      const contribsPromise = fetch(
        `${API_BASE_URL}/github/repos/${company.githubOrganizationName}/${repo.repositoryName}/contributors`,
        { headers }
      );

      // 2. Fetch existing invitations for this repository
      const invitesPromise = fetch(
        `${API_BASE_URL}/invitations/repository/${repo.repositoryId}`,
        { headers }
      );

      const [contribsRes, invitesRes] = await Promise.all([contribsPromise, invitesPromise]);

      if (contribsRes.ok) {
        const contribsData: RepoContributor[] = await contribsRes.json();
        setRepoContributorsList(contribsData);
      } else {
        setRepoContributorsList([]);
      }

      if (invitesRes.ok) {
        const invitesData: InvitationResponse[] = await invitesRes.json();
        setExistingInvitations(invitesData);
      } else {
        setExistingInvitations([]);
      }
    } catch (err) {
      console.error("Failed to load contributors or invitations:", err);
    } finally {
      setLoadingRepoContributors(false);
    }
  };

  const toggleInviteContributor = (username: string) => {
    setSelectedContributorsForInvite((prev) => {
      const copy = { ...prev };
      if (username in copy) {
        delete copy[username];
      } else {
        copy[username] = "";
      }
      return copy;
    });
    setInviteError("");
  };

  const handleEmailChange = (username: string, email: string) => {
    setSelectedContributorsForInvite((prev) => ({
      ...prev,
      [username]: email,
    }));
    setInviteError("");
  };

  const handleSelectAllContributors = () => {
    const uninvited = repoContributorsList.filter((c) => !existingInvitations.some((inv) => inv.githubUsername === c.login && inv.status === "PENDING"));
    const allSelected = uninvited.every((c) => c.login in selectedContributorsForInvite);

    if (allSelected) {
      setSelectedContributorsForInvite({});
    } else {
      const newMap: Record<string, string> = { ...selectedContributorsForInvite };
      uninvited.forEach((c) => {
        if (!(c.login in newMap)) {
          newMap[c.login] = "";
        }
      });
      setSelectedContributorsForInvite(newMap);
    }
  };

  const handleSendInvitationsSubmit = async () => {
    if (!selectedRepoForInvite || !inviteCompany) return;

    const entries = Object.entries(selectedContributorsForInvite);
    if (entries.length === 0) {
      setInviteError("Please select at least one contributor and enter their email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEntries = entries.filter(([_, email]) => !email.trim() || !emailRegex.test(email.trim()));
    if (invalidEntries.length > 0) {
      setInviteError(`Please enter a valid email address for all selected contributors (${invalidEntries.map(([u]) => "@" + u).join(", ")})`);
      return;
    }

    setSendingInvitations(true);
    setInviteError("");
    setInviteSuccess(null);

    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch { }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        repositoryId: selectedRepoForInvite.repositoryId,
        contributors: entries.map(([username, email]) => ({
          githubUsername: username,
          email: email.trim(),
        })),
      };

      const res = await fetch(`${API_BASE_URL}/invitations`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to send invitations");
      }

      const created: InvitationResponse[] = await res.json();
      setInviteSuccess(`Successfully sent ${created.length} invitation${created.length > 1 ? "s" : ""}! Invitation email(s) dispatched.`);
      setSelectedContributorsForInvite({});

      // Refresh invitations list
      const invitesRes = await fetch(
        `${API_BASE_URL}/invitations/repository/${selectedRepoForInvite.repositoryId}`,
        { headers }
      );
      if (invitesRes.ok) {
        const invitesData: InvitationResponse[] = await invitesRes.json();
        setExistingInvitations(invitesData);
      }
    } catch (err: any) {
      setInviteError(err.message || "Failed to send invitations");
    } finally {
      setSendingInvitations(false);
    }
  };

  const filteredRepos = availableRepos.filter((r) =>
    r.name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <div className="user-dashboard min-h-screen" style={{ background: "#080f1b", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 bg-card border-b border-border" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#196bdf" }}>
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">DebtLens</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-muted rounded-full px-5 py-2 mx-8">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Live WebSocket Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                wsConnected
                  ? "bg-emerald-500/10 border-emerald-400/25 text-emerald-300"
                  : "bg-amber-500/10 border-amber-400/25 text-amber-300"
              }`}
              title={wsConnected ? "WebSocket live analysis stream active" : "Reconnecting to live analysis stream..."}
            >
              <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <Radio size={12} className={wsConnected ? "animate-pulse text-emerald-400" : "text-amber-400"} />
              <span className="text-[11px]">{wsConnected ? "Live WS" : "Connecting..."}</span>
            </div>

            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: "#196bdf" }}>3</span>
            </button>
            <button className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Settings size={18} />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-2.5">
              {authUser?.picture ? (
                <img
                  src={authUser.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #196bdf, #7C3AED)" }}>
                  {user.avatar}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-foreground leading-tight">{user.name}</p>
                <p className="text-[10px] text-muted-foreground">{user.role}</p>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                aria-label="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Live WebSocket Notification Toast ── */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300 shadow-2xl">
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col gap-2.5 relative overflow-hidden ${
              liveToast.type === "success"
                ? "bg-emerald-950/95 border-emerald-400/40 text-emerald-100 shadow-emerald-950/50"
                : liveToast.type === "error"
                ? "bg-red-950/95 border-red-400/40 text-red-100 shadow-red-950/50"
                : liveToast.type === "info"
                ? "bg-indigo-950/95 border-indigo-400/40 text-indigo-100 shadow-indigo-950/50"
                : "bg-amber-950/95 border-amber-400/40 text-amber-100 shadow-amber-950/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {liveToast.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : liveToast.type === "error" ? (
                  <AlertCircle size={18} className="text-red-400 shrink-0" />
                ) : liveToast.type === "info" ? (
                  <Activity size={18} className="text-indigo-400 shrink-0 animate-pulse" />
                ) : (
                  <Clock size={18} className="text-amber-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-xs leading-tight tracking-wide">{liveToast.title}</h4>
                  <span className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                    <Radio size={9} className="animate-pulse text-emerald-400" />
                    Live WebSocket • {liveToast.timestamp}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLiveToast(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Dismiss toast"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{liveToast.message}</p>
            {liveToast.type === "success" && liveToast.analysisId && (
              <button
                type="button"
                onClick={() => {
                  if (liveToast.analysisId) handleOpenReport(liveToast.analysisId);
                  setLiveToast(null);
                }}
                className="mt-1 self-start inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <Sparkles size={13} />
                <span>View Recommendations</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {analysisPageCompany ? (
          /* ════════════════════════════════════════════════════════════════
             FULL PAGE ANALYSIS WORKSPACE
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Back Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeAnalysisPage}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <ArrowLeft size={14} /> Back to Companies
                </button>
                <div className="h-5 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Companies</span>
                  <ChevronRight size={12} />
                  <span className="font-semibold text-foreground">{analysisPageCompany?.companyName || "Organization"}</span>
                  <ChevronRight size={12} />
                  <span className="text-indigo-400 font-medium">Code Analysis Workspace</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: analysisPageRole === "member" ? "#12382e" : "#182e46",
                    color: analysisPageRole === "member" ? "#7de3b2" : "#65d8f5",
                  }}
                >
                  {analysisPageRole === "member" ? <UserCheck size={12} /> : <Crown size={12} />}
                  {analysisPageRole === "member" ? "Member Workspace" : "Super Admin"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const comp = analysisPageCompany;
                    const r = analysisPageRole;
                    closeAnalysisPage();
                    if (comp) openPastAnalysesPage(comp, r);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-sm"
                  title="View previous analysis execution history and reports"
                >
                  <History size={13} className="text-amber-400" />
                  <span>Past Analyses</span>
                </button>
                <a
                  href={analysisPageCompany?.githubOrganizationUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  @{analysisPageCompany?.githubOrganizationName || "org"} <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Analysis Workspace Hero Banner */}
            <div className="p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-card to-purple-950/20 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    <Activity size={13} />
                    <span>Deep Code Analytics & SATD Pipeline</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {analysisPageCompany?.companyName || "Organization"} Analysis Hub
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Select any repository below to trigger on-demand Java AST metrics analysis, Self-Admitted Technical Debt (SATD) detection, and Random Forest bug prediction. Results appear once the analysis completes.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border">
                  <div className="text-center px-3 border-r border-border">
                    <p className="text-2xl font-bold text-white">{activeCompanyRepos.length}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Repositories</p>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-2xl font-bold text-emerald-400">
                      {Object.values(analysisStatusMap).filter(s => s.status === "COMPLETED").length}
                    </p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Completed Runs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Repositories Filter and Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Available Repositories</h2>
                  <p className="text-xs text-muted-foreground">Select a repository to initiate code analysis</p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 w-full sm:w-72">
                  <Search size={14} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={analysisRepoSearch}
                    onChange={(e) => setAnalysisRepoSearch(e.target.value)}
                    className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                  />
                </div>
              </div>

              {/* Repos Grid */}
              {loadingActiveCompanyRepos ? (
                <div className="bg-card rounded-2xl border border-border p-16 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-indigo-400" />
                  <span className="text-sm text-muted-foreground font-medium">Fetching repository list...</span>
                </div>
              ) : activeCompanyRepos.filter(r => r.repositoryName.toLowerCase().includes(analysisRepoSearch.toLowerCase())).length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <GitBranch size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-base font-semibold text-foreground mb-1">No repositories found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {analysisRepoSearch ? "No repositories match your search filter." : "No repositories have been connected to this company yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeCompanyRepos
                    .filter(r => r.repositoryName.toLowerCase().includes(analysisRepoSearch.toLowerCase()))
                    .map((repo) => {
                      const isAnalyzing = !!analyzingRepoIds[repo.repositoryId];
                      const currentStatus = analysisStatusMap[repo.repositoryId];
                      const isCompleted = currentStatus?.status === "COMPLETED";
                      const isFailed = currentStatus?.status === "FAILED";
                      const isQueuedOrRunning = isAnalyzing || (currentStatus && (currentStatus.status === "QUEUED" || currentStatus.status === "PROCESSING" || currentStatus.status === "RUNNING"));

                      return (
                        <div
                          key={repo.repositoryId}
                          className={`bg-card rounded-2xl border p-6 transition-all duration-200 flex flex-col justify-between gap-5 relative overflow-hidden ${isCompleted
                              ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5 bg-gradient-to-b from-card to-emerald-950/10"
                              : isQueuedOrRunning
                                ? "border-indigo-500/40 shadow-lg shadow-indigo-500/5 bg-gradient-to-b from-card to-indigo-950/10"
                                : "border-border hover:border-slate-700 shadow-sm"
                            }`}
                        >
                          {/* Repo Top */}
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                                  <Code2 size={20} />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-base text-foreground truncate">{repo.repositoryName}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                                      branch: {repo.defaultBranch || "main"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <a
                                href={repo.repositoryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                title="View on GitHub"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>

                            {/* Dynamic State Info Area */}
                            {isQueuedOrRunning ? (
                              <div className="my-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs space-y-2 animate-pulse">
                                <div className="flex items-center gap-2 font-semibold">
                                  <Loader2 size={14} className="animate-spin text-indigo-400" />
                                  <span>Analysis Pipeline in Progress...</span>
                                </div>
                                <p className="text-[11px] text-indigo-300">
                                  Running JGit clone, JavaParser AST metric calculations, SATD comment classifiers, and Random Forest bug prediction models.
                                </p>
                              </div>
                            ) : isCompleted ? (
                              <div className="my-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                  <div>
                                    <p className="font-semibold text-white">Analysis Succeeded</p>
                                    <p className="text-[11px] text-emerald-300">
                                      {currentStatus?.totalClasses ?? 0} classes analyzed successfully.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : isFailed ? (
                              <div className="my-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0" />
                                <span>Analysis failed to complete. You can retry starting the job.</span>
                              </div>
                            ) : (
                              <div className="my-3 p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
                                <Activity size={14} className="text-slate-400 shrink-0" />
                                <span>Ready to start analysis. Click Start Analysis to begin.</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                            {isCompleted && currentStatus?.analysisId && (
                              <button
                                type="button"
                                onClick={() => handleOpenReport(currentStatus.analysisId!)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-95"
                              >
                                <Sparkles size={14} />
                                View Recommendations
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleStartAnalysis(repo)}
                              disabled={isQueuedOrRunning}
                              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50 ${isCompleted
                                  ? "bg-card border border-border hover:bg-muted text-foreground"
                                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-95"
                                }`}
                            >
                              {isQueuedOrRunning ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Analyzing...</span>
                                </>
                              ) : isCompleted ? (
                                <>
                                  <Play size={12} className="fill-current" />
                                  <span>Re-Analyze</span>
                                </>
                              ) : isFailed ? (
                                <>
                                  <Play size={12} className="fill-current" />
                                  <span>Retry Analysis</span>
                                </>
                              ) : (
                                <>
                                  <Play size={12} className="fill-current" />
                                  <span>Start Analysis</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : manageCompany ? (
          /* ════════════════════════════════════════════════════════════════
             FULL PAGE REPOSITORY MANAGEMENT WORKSPACE
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Back Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setManageCompany(null)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <ArrowLeft size={14} /> Back to Companies
                </button>
                <div className="h-5 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Companies</span>
                  <ChevronRight size={12} />
                  <span className="font-semibold text-foreground">{manageCompany?.companyName || "Organization"}</span>
                  <ChevronRight size={12} />
                  <span className="text-indigo-400 font-medium">Manage Repositories</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-400/25">
                  <Layers size={12} />
                  <span>GitHub Repository Import</span>
                </span>
                <a
                  href={manageCompany?.githubOrganizationUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  @{manageCompany?.githubOrganizationName || "org"} <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Hero Banner */}
            <div className="p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-card to-purple-950/20 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    <Building2 size={13} />
                    <span>Organization Repositories</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {manageCompany?.companyName || "Organization"} Repository Manager
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Import and link Java repositories from GitHub organization <strong>@{manageCompany?.githubOrganizationName}</strong> into your DebtLens company for automated metric evaluations and bug prediction.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border">
                  <div className="text-center px-3 border-r border-border">
                    <p className="text-2xl font-bold text-white">{availableForCompany.length}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Org Repos</p>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-2xl font-bold text-indigo-400">{newlySelectedRepoIds.length}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">New Selected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Banners */}
            {addReposError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-400/25 text-red-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{addReposError}</span>
                </div>
                <button onClick={() => setAddReposError("")} className="p-1 rounded-lg hover:bg-black/5 text-muted-foreground">
                  <X size={14} />
                </button>
              </div>
            )}

            {addReposSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-xs flex items-center gap-2">
                <Check size={16} className="shrink-0" />
                <span>Repositories successfully added to {manageCompany?.companyName || "the organization"}! Redirecting...</span>
              </div>
            )}

            {/* Repositories Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Organization Repositories</h2>
                  <p className="text-xs text-muted-foreground">Select repositories to add to this company</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 w-full sm:w-72">
                    <Search size={14} className="text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={manageRepoSearch}
                      onChange={(e) => setManageRepoSearch(e.target.value)}
                      className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRepositoriesSubmit}
                    disabled={addingRepos || addReposSuccess || newlySelectedRepoIds.length === 0}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2 rounded-xl text-white transition-all disabled:opacity-50 shadow-md shrink-0"
                    style={{ background: "#196bdf" }}
                  >
                    {addingRepos ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Adding Repos...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>Add {newlySelectedRepoIds.length} Repositories</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grid of Available Repos */}
              {loadingCompanyRepos ? (
                <div className="bg-card rounded-2xl border border-border p-16 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-indigo-400" />
                  <span className="text-sm text-muted-foreground font-medium">Fetching GitHub organization repositories...</span>
                </div>
              ) : availableForCompany.filter(r => r.name.toLowerCase().includes(manageRepoSearch.toLowerCase())).length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <GitBranch size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-base font-semibold text-foreground mb-1">No repositories found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {manageRepoSearch ? "No repositories match your search query." : "No repositories found for this organization on GitHub."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {availableForCompany
                    .filter(r => r.name.toLowerCase().includes(manageRepoSearch.toLowerCase()))
                    .map((repo) => {
                      const isAlreadyAdded = repo.alreadyAdded;
                      const isNewlySelected = newlySelectedRepoIds.includes(repo.githubRepositoryId);
                      const isInspecting = activeRepoForContributors === repo.name;
                      const contributors = contributorsMap[repo.name] || [];
                      const isLoadingContribs = loadingContributors[repo.name];

                      return (
                        <div
                          key={repo.githubRepositoryId}
                          className={`bg-card rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between gap-4 ${isAlreadyAdded
                              ? "border-emerald-500/20 bg-emerald-950/5 opacity-80"
                              : isNewlySelected
                                ? "border-indigo-500/50 bg-indigo-950/10 shadow-md shadow-indigo-950/10"
                                : "border-border hover:border-slate-700 shadow-sm"
                            }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <label className={`flex items-start gap-3 flex-1 min-w-0 ${isAlreadyAdded ? "cursor-default" : "cursor-pointer"}`}>
                                <input
                                  type="checkbox"
                                  disabled={isAlreadyAdded}
                                  checked={isAlreadyAdded || isNewlySelected}
                                  onChange={() => toggleNewRepoSelection(repo.githubRepositoryId, repo.name)}
                                  className={`w-4 h-4 mt-0.5 rounded cursor-pointer ${isAlreadyAdded ? "text-emerald-400" : "text-indigo-400 focus:ring-indigo-500"
                                    }`}
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-foreground truncate">{repo.name}</span>
                                    {isAlreadyAdded ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-400/25">
                                        ✓ Already Added
                                      </span>
                                    ) : repo.language?.toLowerCase() === "java" ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-400/25">
                                        Java
                                      </span>
                                    ) : !repo.language ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border">
                                        Java / Unindexed
                                      </span>
                                    ) : (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-400/25">
                                        {repo.language} (Unsupported)
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {repo.description || "No repository description provided on GitHub."}
                                  </p>
                                </div>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleInspectContributors(manageCompany?.githubOrganizationName || "", repo.name)}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 ${isInspecting
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                                  }`}
                              >
                                <Users size={12} /> Contributors
                              </button>
                            </div>

                            {/* Contributors Drawer */}
                            {isInspecting && (
                              <div className="mt-4 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-2 animate-in fade-in duration-150">
                                <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <Users size={12} /> Live Repository Contributors:
                                </p>
                                {isLoadingContribs ? (
                                  <div className="flex items-center gap-2 text-xs text-indigo-200 py-1">
                                    <Loader2 size={13} className="animate-spin text-indigo-400" />
                                    <span>Fetching contributors list from GitHub...</span>
                                  </div>
                                ) : contributors.length === 0 ? (
                                  <p className="text-xs text-muted-foreground italic">No public contributors found for this repository.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                                    {contributors.map((contrib) => (
                                      <a
                                        key={contrib.id}
                                        href={contrib.html_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border text-xs text-foreground hover:border-indigo-400/30 transition-all shadow-sm"
                                      >
                                        <img src={contrib.avatar_url} alt={contrib.login} className="w-4 h-4 rounded-full object-cover" />
                                        <span className="font-medium text-[11px]">@{contrib.login}</span>
                                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-300 font-bold">
                                          {contrib.contributions}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                            <span className="font-mono text-[11px]">branch: {repo.defaultBranch || "main"}</span>
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                            >
                              GitHub <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : inviteCompany ? (
          /* ════════════════════════════════════════════════════════════════
             FULL PAGE INVITATION WORKSPACE
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Back Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInviteCompany(null)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <ArrowLeft size={14} /> Back to Companies
                </button>
                <div className="h-5 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Companies</span>
                  <ChevronRight size={12} />
                  <span className="font-semibold text-foreground">{inviteCompany?.companyName || "Organization"}</span>
                  <ChevronRight size={12} />
                  <span className="text-emerald-400 font-medium">Team & Contributor Invitations</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/25">
                  <UserPlus size={12} />
                  <span>Contributor Invitations</span>
                </span>
                <a
                  href={inviteCompany?.githubOrganizationUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  @{inviteCompany?.githubOrganizationName || "org"} <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Hero Banner */}
            <div className="p-6 md:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-card to-teal-950/20 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    <Users size={13} />
                    <span>Contributor Onboarding</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {inviteCompany?.companyName || "Organization"} Contributor Invitations
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Select a repository below, then invite repository contributors directly by entering their email address to grant them access to technical debt metrics and refactoring insights.
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border">
                  <div className="text-center px-3 border-r border-border">
                    <p className="text-2xl font-bold text-white">{companyRepos.length}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Repositories</p>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-2xl font-bold text-emerald-400">{Object.keys(selectedContributorsForInvite).length}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Selected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Repository Selector Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                1. Select Target Repository:
              </label>
              {loadingCompanyReposForInvite ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                  <span>Loading company repositories...</span>
                </div>
              ) : companyRepos.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25 text-xs text-amber-300">
                  No repositories found for this company. Please add repositories first via "Manage Repos".
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {companyRepos.map((repo) => {
                    const isSelected = selectedRepoForInvite?.repositoryId === repo.repositoryId;
                    return (
                      <button
                        key={repo.repositoryId}
                        type="button"
                        onClick={() => inviteCompany && loadRepoContributorsAndInvites(inviteCompany, repo)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 border shadow-sm ${isSelected
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/20 scale-105"
                            : "bg-card text-foreground border-border hover:border-slate-700 hover:bg-muted"
                          }`}
                      >
                        <GitBranch size={13} />
                        <span>{repo.repositoryName}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isSelected ? "bg-emerald-700 text-emerald-100" : "bg-muted text-muted-foreground"}`}>
                          {repo.defaultBranch || "main"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Feedback Banners */}
            {inviteError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-400/25 text-red-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{inviteError}</span>
                </div>
                <button onClick={() => setInviteError("")} className="p-1 rounded-lg hover:bg-black/5 text-muted-foreground">
                  <X size={14} />
                </button>
              </div>
            )}

            {inviteSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-300" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            {/* Contributors List & Invite Form */}
            {selectedRepoForInvite && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span>2. Repository Contributors ({repoContributorsList.length})</span>
                      {existingInvitations.filter(i => i.status === "PENDING").length > 0 && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/25 font-semibold">
                          {existingInvitations.filter(i => i.status === "PENDING").length} Pending
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground">Select contributors and enter their email address to send invitation</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 w-full sm:w-56">
                      <Search size={14} className="text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        placeholder="Filter contributor..."
                        value={contributorSearchQuery}
                        onChange={(e) => setContributorSearchQuery(e.target.value)}
                        className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                      />
                    </div>

                    {repoContributorsList.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllContributors}
                        className="text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap shadow-sm"
                      >
                        {repoContributorsList.every((c) => c.login in selectedContributorsForInvite) ? "Deselect All" : "Select All"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSendInvitationsSubmit}
                      disabled={sendingInvitations || Object.keys(selectedContributorsForInvite).length === 0}
                      className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md disabled:opacity-50 shrink-0"
                    >
                      {sendingInvitations ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Send {Object.keys(selectedContributorsForInvite).length > 0 ? `${Object.keys(selectedContributorsForInvite).length} ` : ""}Invites</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Contributors Grid */}
                {loadingRepoContributors ? (
                  <div className="bg-card rounded-2xl border border-border p-16 text-center flex flex-col items-center justify-center gap-3">
                    <Loader2 size={28} className="animate-spin text-emerald-400" />
                    <span className="text-sm text-muted-foreground font-medium">Fetching contributors from GitHub...</span>
                  </div>
                ) : repoContributorsList.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <Users size={32} className="mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-base font-semibold text-foreground mb-1">No contributors found</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      No public contributors found for this repository on GitHub.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repoContributorsList
                      .filter((c) => c.login.toLowerCase().includes(contributorSearchQuery.toLowerCase()))
                      .map((contrib) => {
                        const isSelected = contrib.login in selectedContributorsForInvite;
                        const currentEmail = selectedContributorsForInvite[contrib.login] ?? "";
                        const pendingInvite = existingInvitations.find(
                          (i) => i.githubUsername?.toLowerCase() === contrib.login.toLowerCase() && i.status === "PENDING"
                        );

                        return (
                          <div
                            key={contrib.id}
                            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${isSelected
                                ? "border-emerald-500/50 bg-emerald-950/10 shadow-md shadow-emerald-950/10"
                                : pendingInvite
                                  ? "border-amber-500/30 bg-amber-950/10"
                                  : "border-border bg-card hover:border-slate-700 shadow-sm"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleInviteContributor(contrib.login)}
                                  disabled={!!pendingInvite}
                                  className="w-4 h-4 rounded text-emerald-400 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                                />
                                <img src={contrib.avatar_url} alt={contrib.login} className="w-9 h-9 rounded-xl object-cover border border-border shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={contrib.html_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-bold text-sm text-foreground hover:underline flex items-center gap-1 truncate"
                                    >
                                      @{contrib.login} <ExternalLink size={11} className="text-muted-foreground" />
                                    </a>
                                  </div>
                                  <span className="text-[11px] font-semibold text-emerald-400">
                                    {contrib.contributions} commits
                                  </span>
                                </div>
                              </div>

                              {pendingInvite ? (
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/25 flex items-center gap-1 shrink-0">
                                  <Clock size={11} /> Pending
                                </span>
                              ) : isSelected ? (
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-400/25 shrink-0">
                                  ✓ Selected
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleInviteContributor(contrib.login)}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-all shrink-0"
                                >
                                  + Select
                                </button>
                              )}
                            </div>

                            {isSelected && (
                              <div className="pt-2 border-t border-emerald-500/20">
                                <div className="relative">
                                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                  <input
                                    type="email"
                                    placeholder={`Enter email address for @${contrib.login}`}
                                    value={currentEmail}
                                    onChange={(e) => handleEmailChange(contrib.login, e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-emerald-500/30 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 bg-card text-foreground"
                                    autoFocus
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : pastAnalysesCompany ? (
          /* ════════════════════════════════════════════════════════════════
             FULL PAGE PAST ANALYSES & EXECUTION HISTORY WORKSPACE
             ════════════════════════════════════════════════════════════════ */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Back Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closePastAnalysesPage}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <ArrowLeft size={14} /> Back to Companies
                </button>
                <div className="h-5 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Companies</span>
                  <ChevronRight size={12} />
                  <span className="font-semibold text-foreground">{pastAnalysesCompany?.companyName || "Organization"}</span>
                  <ChevronRight size={12} />
                  <span className="text-amber-400 font-medium">Past Analyses & History</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: pastAnalysesRole === "member" ? "#12382e" : "#182e46",
                    color: pastAnalysesRole === "member" ? "#7de3b2" : "#65d8f5",
                  }}
                >
                  {pastAnalysesRole === "member" ? <UserCheck size={12} /> : <Crown size={12} />}
                  {pastAnalysesRole === "member" ? "Member Workspace" : "Super Admin"}
                </span>
                <button
                  type="button"
                  onClick={() => openPastAnalysesPage(pastAnalysesCompany, pastAnalysesRole, selectedPastRepoId === "ALL" ? undefined : selectedPastRepoId)}
                  disabled={loadingPastAnalyses}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-sm disabled:opacity-50"
                  title="Reload analysis jobs history"
                >
                  <RotateCw size={13} className={loadingPastAnalyses ? "animate-spin text-amber-400" : "text-amber-400"} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const comp = pastAnalysesCompany;
                    const r = pastAnalysesRole;
                    closePastAnalysesPage();
                    if (comp) openAnalysisPage(comp, r);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:shadow hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #196bdf, #7C3AED)" }}
                >
                  <Play size={12} className="fill-current" />
                  <span>Run New Analysis</span>
                </button>
                <a
                  href={pastAnalysesCompany?.githubOrganizationUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  @{pastAnalysesCompany?.githubOrganizationName || "org"} <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Workspace Hero Banner */}
            <div className="p-6 md:p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-card to-indigo-950/20 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                    <History size={13} />
                    <span>Technical Debt Execution Logs</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {pastAnalysesCompany?.companyName || "Organization"} Past Analyses
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    View comprehensive audit trails of previous code analysis jobs, inspect historical metrics, and open prioritized refactoring recommendations for any completed run.
                  </p>
                </div>

                {/* Stats Counter Cards */}
                <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-border/80 text-center min-w-[100px] backdrop-blur-sm">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Runs</span>
                    <span className="text-xl font-black text-foreground">{pastAnalysesList.length}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-center min-w-[100px] backdrop-blur-sm">
                    <span className="block text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Completed</span>
                    <span className="text-xl font-black text-emerald-300">
                      {pastAnalysesList.filter((j) => j.status === "COMPLETED").length}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-center min-w-[100px] backdrop-blur-sm">
                    <span className="block text-[10px] uppercase font-bold text-indigo-400 tracking-wider">In Progress</span>
                    <span className="text-xl font-black text-indigo-300">
                      {pastAnalysesList.filter((j) => j.status === "RUNNING" || j.status === "QUEUED").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Repository Selection Tabs (Repository-Wise Filter) ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <GitBranch size={13} className="text-amber-400" />
                  Select Repository to View History
                </span>
                <span className="text-xs text-muted-foreground">
                  {pastAnalysesRepos.length} repository{pastAnalysesRepos.length !== 1 ? "s" : ""} available
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {/* "All Repositories" Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedPastRepoId("ALL")}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shrink-0 transition-all border ${
                    selectedPastRepoId === "ALL"
                      ? "bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-sm ring-1 ring-amber-400/20"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Layers size={13} />
                  <span>All Repositories</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      selectedPastRepoId === "ALL"
                        ? "bg-amber-500/30 text-amber-200"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pastAnalysesList.length}
                  </span>
                </button>

                {/* Individual Repository Tabs */}
                {pastAnalysesRepos.map((repo) => {
                  const runsForRepo = pastAnalysesList.filter(
                    (j) => j.repositoryId === repo.repositoryId || (j.repositoryName && j.repositoryName.toLowerCase() === repo.repositoryName.toLowerCase())
                  );
                  const isSelected = selectedPastRepoId === repo.repositoryId;
                  const latestRun = runsForRepo[0];

                  return (
                    <button
                      key={repo.repositoryId}
                      type="button"
                      onClick={() => setSelectedPastRepoId(repo.repositoryId)}
                      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold shrink-0 transition-all border ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-sm ring-1 ring-amber-400/20"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      <GitBranch size={13} />
                      <span className="truncate max-w-[160px]">{repo.repositoryName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-amber-500/30 text-amber-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {runsForRepo.length}
                      </span>
                      {latestRun && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            latestRun.status === "COMPLETED"
                              ? "bg-emerald-400 ring-2 ring-emerald-400/20"
                              : latestRun.status === "FAILED"
                              ? "bg-red-400 ring-2 ring-red-400/20"
                              : "bg-blue-400 animate-ping"
                          }`}
                          title={`Latest run: ${latestRun.status}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── If a Specific Repository is Selected ── */}
            {selectedPastRepoId !== "ALL" && (() => {
              const currentRepo = pastAnalysesRepos.find((r) => r.repositoryId === selectedPastRepoId);
              const repoRuns = pastAnalysesList.filter(
                (j) => j.repositoryId === selectedPastRepoId || (currentRepo && j.repositoryName && j.repositoryName.toLowerCase() === currentRepo.repositoryName.toLowerCase())
              );
              const completedRepoRuns = repoRuns.filter((j) => j.status === "COMPLETED");

              return (
                <div className="p-6 rounded-3xl border border-border bg-card/60 backdrop-blur-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
                        <GitBranch size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground">{currentRepo?.repositoryName || "Repository"}</h3>
                          {currentRepo?.defaultBranch && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium">
                              {currentRepo.defaultBranch}
                            </span>
                          )}
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-300 border border-amber-400/20">
                            {repoRuns.length} Total Run{repoRuns.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {completedRepoRuns.length} completed evaluation{completedRepoRuns.length !== 1 ? "s" : ""} with prioritized technical debt scores.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {currentRepo && (
                        <button
                          type="button"
                          onClick={() => handleStartAnalysis(currentRepo)}
                          disabled={analyzingRepoIds[currentRepo.repositoryId]}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #196bdf, #7C3AED)" }}
                        >
                          {analyzingRepoIds[currentRepo.repositoryId] ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Queueing...</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} className="fill-current" />
                              <span>Run Analysis</span>
                            </>
                          )}
                        </button>
                      )}
                      {currentRepo?.repositoryUrl && (
                        <a
                          href={currentRepo.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                        >
                          GitHub <ExternalLink size={12} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedPastRepoId("ALL")}
                        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                      >
                        View All Repos
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search repository, branch, or requester..."
                  value={pastAnalysesSearch}
                  onChange={(e) => setPastAnalysesSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPastAnalysesStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pastAnalysesStatusFilter === "ALL"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  All (
                  {
                    pastAnalysesList.filter((job) => {
                      if (selectedPastRepoId === "ALL") return true;
                      const selectedRepo = pastAnalysesRepos.find((r) => r.repositoryId === selectedPastRepoId);
                      return job.repositoryId === selectedPastRepoId || (selectedRepo && job.repositoryName && job.repositoryName.toLowerCase() === selectedRepo.repositoryName.toLowerCase());
                    }).length
                  }
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setPastAnalysesStatusFilter("COMPLETED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pastAnalysesStatusFilter === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-300 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Completed (
                  {
                    pastAnalysesList.filter((job) => {
                      if (selectedPastRepoId !== "ALL") {
                        const selectedRepo = pastAnalysesRepos.find((r) => r.repositoryId === selectedPastRepoId);
                        const matchRepo = job.repositoryId === selectedPastRepoId || (selectedRepo && job.repositoryName && job.repositoryName.toLowerCase() === selectedRepo.repositoryName.toLowerCase());
                        if (!matchRepo) return false;
                      }
                      return job.status === "COMPLETED";
                    }).length
                  }
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setPastAnalysesStatusFilter("RUNNING")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pastAnalysesStatusFilter === "RUNNING"
                      ? "bg-indigo-500/10 text-indigo-300 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Running (
                  {
                    pastAnalysesList.filter((job) => {
                      if (selectedPastRepoId !== "ALL") {
                        const selectedRepo = pastAnalysesRepos.find((r) => r.repositoryId === selectedPastRepoId);
                        const matchRepo = job.repositoryId === selectedPastRepoId || (selectedRepo && job.repositoryName && job.repositoryName.toLowerCase() === selectedRepo.repositoryName.toLowerCase());
                        if (!matchRepo) return false;
                      }
                      return job.status === "RUNNING" || job.status === "QUEUED";
                    }).length
                  }
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setPastAnalysesStatusFilter("FAILED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pastAnalysesStatusFilter === "FAILED"
                      ? "bg-red-500/10 text-red-300 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Failed (
                  {
                    pastAnalysesList.filter((job) => {
                      if (selectedPastRepoId !== "ALL") {
                        const selectedRepo = pastAnalysesRepos.find((r) => r.repositoryId === selectedPastRepoId);
                        const matchRepo = job.repositoryId === selectedPastRepoId || (selectedRepo && job.repositoryName && job.repositoryName.toLowerCase() === selectedRepo.repositoryName.toLowerCase());
                        if (!matchRepo) return false;
                      }
                      return job.status === "FAILED";
                    }).length
                  }
                  )
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {pastAnalysesError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-400/25 text-red-300 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{pastAnalysesError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openPastAnalysesPage(pastAnalysesCompany, pastAnalysesRole, selectedPastRepoId === "ALL" ? undefined : selectedPastRepoId)}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Past Analyses Content */}
            {loadingPastAnalyses ? (
              <div className="p-16 rounded-3xl border border-border bg-card text-center flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="animate-spin text-amber-400" />
                <p className="font-semibold text-sm text-foreground">Loading repository past analyses...</p>
                <p className="text-xs text-muted-foreground">Fetching job logs, timing metrics, and completed reports.</p>
              </div>
            ) : (() => {
              const filteredJobs = pastAnalysesList.filter((job) => {
                // Repository filter
                if (selectedPastRepoId !== "ALL") {
                  const selectedRepo = pastAnalysesRepos.find((r) => r.repositoryId === selectedPastRepoId);
                  const matchRepo = job.repositoryId === selectedPastRepoId || (selectedRepo && job.repositoryName && job.repositoryName.toLowerCase() === selectedRepo.repositoryName.toLowerCase());
                  if (!matchRepo) return false;
                }

                // Search query filter
                if (pastAnalysesSearch) {
                  const q = pastAnalysesSearch.toLowerCase();
                  const matchRepo = (job.repositoryName || "").toLowerCase().includes(q);
                  const matchBranch = (job.branch || "").toLowerCase().includes(q);
                  const matchUser = (job.startedByUserName || "").toLowerCase().includes(q);
                  if (!matchRepo && !matchBranch && !matchUser) return false;
                }

                // Status filter
                if (pastAnalysesStatusFilter === "COMPLETED") return job.status === "COMPLETED";
                if (pastAnalysesStatusFilter === "RUNNING") return job.status === "RUNNING" || job.status === "QUEUED";
                if (pastAnalysesStatusFilter === "FAILED") return job.status === "FAILED";
                return true;
              });

              if (filteredJobs.length === 0) {
                const selectedRepo = pastAnalysesRepos.find((r) => r.repositoryId === selectedPastRepoId);

                return (
                  <div className="p-16 rounded-3xl border border-border bg-card text-center flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <History size={28} />
                    </div>
                    <div className="max-w-md space-y-1">
                      <h3 className="font-bold text-base text-foreground">
                        {selectedPastRepoId !== "ALL"
                          ? `No Analysis History for ${selectedRepo?.repositoryName || "this repository"}`
                          : "No Analysis History Found"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedPastRepoId !== "ALL"
                          ? `No past analysis jobs have been executed yet for repository ${selectedRepo?.repositoryName || ""}.`
                          : `No code metrics analysis jobs have been executed for ${pastAnalysesCompany?.companyName || "this organization"} yet.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedRepo) {
                          handleStartAnalysis(selectedRepo);
                        } else {
                          const comp = pastAnalysesCompany;
                          const r = pastAnalysesRole;
                          closePastAnalysesPage();
                          if (comp) openAnalysisPage(comp, r);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all hover:scale-105 active:scale-95"
                      style={{ background: "linear-gradient(135deg, #196bdf, #7C3AED)" }}
                    >
                      <Play size={13} className="fill-current" />
                      <span>{selectedRepo ? `Start Analysis on ${selectedRepo.defaultBranch || "main"}` : "Start First Analysis"}</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filteredJobs.map((job) => {
                    const isCompleted = job.status === "COMPLETED";
                    const isFailed = job.status === "FAILED";
                    const isRunning = job.status === "RUNNING" || job.status === "QUEUED";
                    const classCount = job.totalClassesAnalyzed ?? job.totalClasses ?? 0;

                    return (
                      <div
                        key={job.analysisId}
                        className="p-5 rounded-2xl border border-border bg-card hover:border-amber-400/25 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Left: Job Meta & Repo */}
                        <div className="flex items-start gap-4 min-w-0">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
                            style={{
                              background: isCompleted ? "#12382e" : isFailed ? "#3a202b" : "#1b293d",
                              color: isCompleted ? "#7de3b2" : isFailed ? "#fca5a5" : "#65d8f5",
                            }}
                          >
                            #{job.analysisId}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => setSelectedPastRepoId(job.repositoryId)}
                                className="font-bold text-base text-foreground hover:text-amber-400 cursor-pointer transition-colors truncate"
                                title="Click to filter runs for this repository"
                              >
                                {job.repositoryName || "Repository"}
                              </span>
                              <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono font-medium">
                                {job.branch || "main"}
                              </span>
                              {/* Status Badge */}
                              <span
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                                style={{
                                  background: isCompleted ? "#12382e" : isFailed ? "#3a202b" : "#172e49",
                                  borderColor: isCompleted ? "#366753" : isFailed ? "#704352" : "#3c5d7f",
                                  color: isCompleted ? "#7de3b2" : isFailed ? "#ff9ca6" : "#79beff",
                                }}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={11} className="text-emerald-300" />
                                ) : isFailed ? (
                                  <AlertCircle size={11} className="text-red-300" />
                                ) : (
                                  <Loader2 size={11} className="animate-spin text-blue-300" />
                                )}
                                <span>{job.status}</span>
                              </span>
                            </div>

                            {/* Details Row */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={12} />
                                {job.startedAt ? new Date(job.startedAt).toLocaleString() : "Date unavailable"}
                              </span>
                              {job.startedByUserName && (
                                <>
                                  <span>•</span>
                                  <span>Triggered by <strong className="text-foreground font-medium">{job.startedByUserName}</strong></span>
                                </>
                              )}
                              {isCompleted && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-300 font-semibold">{classCount} classes evaluated</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2.5 shrink-0 flex-wrap md:justify-end">
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleOpenReport(job.analysisId)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/25 transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                              <Sparkles size={13} className="text-emerald-300" />
                              <span>View Recommendations</span>
                            </button>
                          )}

                          {isRunning && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
                              <Loader2 size={13} className="animate-spin" />
                              <span>Analyzing code AST & SATD...</span>
                            </div>
                          )}

                          <a
                            href={job.repositoryUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                          >
                            GitHub <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             DEFAULT MY COMPANIES DASHBOARD
             ════════════════════════════════════════════════════════════════ */
          <>
            {/* Page Header */}
            <div className="dl-page-heading mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">My Companies</h1>
                <p className="text-sm text-muted-foreground">Manage organizations you administer and teams you belong to.</p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 w-fit"
                style={{ background: "#196bdf" }}
              >
                <Building2 size={16} />
                Create Company
              </button>
            </div>

            {/* ── Action Feedback Toast ── */}
            {invitationActionMsg && (
              <div
                className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 animate-in fade-in duration-200 ${invitationActionMsg.type === "success"
                    ? "bg-emerald-500/10 border-emerald-400/25 text-emerald-300"
                    : "bg-red-500/10 border-red-400/25 text-red-300"
                  }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  {invitationActionMsg.type === "success" ? (
                    <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-red-300 shrink-0" />
                  )}
                  <span>{invitationActionMsg.text}</span>
                </div>
                <button
                  onClick={() => setInvitationActionMsg(null)}
                  className="p-1 rounded-lg hover:bg-black/5 text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ── Pending Invitations Banner ── */}
            {myPendingInvitations.length > 0 && (
              <div className="mb-8 p-6 rounded-3xl border border-indigo-400/25 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 shadow-lg shadow-black/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-600 text-white shadow-md shadow-black/10">
                      <Inbox size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span>Pending Invitations</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold">
                          {myPendingInvitations.length}
                        </span>
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        You have been invited to join the following repository collaborations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPendingInvitations.filter(Boolean).map((inv) => {
                    const isProcessing = processingInvitationId === inv.invitationId;

                    return (
                      <div
                        key={inv.invitationId}
                        className="p-4 rounded-2xl bg-card border border-indigo-400/25 shadow-sm flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{inv?.companyName || "Company"}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-400/25">
                                Repo: {inv?.repositoryName || ""}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Invited as <span className="font-semibold text-foreground">@{inv?.githubUsername || inv?.email}</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock size={11} className="text-amber-300" />
                              Expires {inv?.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <button
                            onClick={() => handleAcceptInvitation(inv)}
                            disabled={isProcessing}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-sm shadow-black/10"
                          >
                            {isProcessing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            Accept & Join
                          </button>

                          <button
                            onClick={() => handleRejectInvitation(inv)}
                            disabled={isProcessing}
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border bg-card hover:bg-red-500/10 hover:text-red-300 hover:border-red-400/25 text-muted-foreground text-xs font-semibold transition-all disabled:opacity-50"
                          >
                            <X size={13} />
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Stats Row ── */}
            <div className="dl-stats dl-stagger grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#182e46" }}>
                  <Shield size={18} style={{ color: "#65d8f5" }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{adminCompaniesList.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Admin Orgs</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#12382e" }}>
                  <Users size={18} style={{ color: "#10B981" }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{memberCompaniesList.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Member Orgs</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#29243f" }}>
                  <GitBranch size={18} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{totalRepos}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Repos</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#392d1e" }}>
                  <Activity size={18} style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{adminCompaniesList.length + memberCompaniesList.length}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Active Orgs</p>
                </div>
              </div>
            </div>

            {/* ── Tab Filter ── */}
            <div className="dl-tabs flex items-center gap-1 mb-6 bg-card border border-border rounded-xl p-1 w-fit" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              {(["all", "admin", "member"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
                  style={activeTab === tab ? { background: "#196bdf", color: "#fff", boxShadow: "0 2px 8px rgba(67,97,238,0.3)" } : { color: "#a1b1c8" }}
                >
                  {tab === "all" ? "All Companies" : tab === "admin" ? "Admin" : "Member"}
                </button>
              ))}
            </div>

            {/* ── Maximized or Two-Column Views ── */}
            {maximizedSection === "admin" ? (
              /* ════════════════════════════════════════════════════════════════
                 MAXIMIZED COMPANY ADMIN WINDOW
                 ════════════════════════════════════════════════════════════════ */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Window Top Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMaximizedSection(null)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                      title="Restore standard dashboard layout"
                    >
                      <Minimize2 size={14} className="text-cyan-400" /> Restore View
                    </button>
                    <div className="h-5 w-px bg-border hidden sm:block" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Dashboard</span>
                      <ChevronRight size={12} />
                      <span className="text-cyan-400 font-semibold">Company Admin (Super Admin Workspace)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={openCreateModal}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-2 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                      style={{ background: "#196bdf" }}
                    >
                      <Building2 size={13} />
                      <span>Create Company</span>
                    </button>
                  </div>
                </div>

                {/* Maximized Banner */}
                <div className="p-6 md:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-card to-indigo-950/20 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                        <Crown size={13} />
                        <span>Super Administrator Organizations</span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Administered Organizations ({filteredAdmin.length})
                      </h1>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Full window view of all organizations you administer. Trigger automated code metrics analysis, inspect SATD and AST technical debt, invite contributors, and manage organization repositories.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border text-center min-w-[120px]">
                        <p className="text-2xl font-bold text-cyan-400">{filteredAdmin.length}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Organizations</p>
                      </div>
                      <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border text-center min-w-[120px]">
                        <p className="text-2xl font-bold text-indigo-400">{totalAdminRepos}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Repositories</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Quick Actions */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 w-full sm:w-80 shadow-sm">
                    <Search size={14} className="text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search admin companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaximizedSection(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-sm"
                  >
                    <Minimize2 size={13} />
                    <span>Exit Full Window</span>
                  </button>
                </div>

                {/* Maximized Grid */}
                {filteredAdmin.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-16 text-center">
                    <Crown size={32} className="mx-auto mb-3 text-cyan-400" />
                    <h3 className="text-base font-bold text-foreground mb-1">No admin organizations match your filter</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                      Try adjusting your search terms or create a new organization.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-xl"
                      style={{ background: "#196bdf" }}
                    >
                      <Building2 size={13} /> Create Organization
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredAdmin.map((company) => (
                      <div
                        key={company.companyId}
                        onMouseEnter={() => setHoveredCard(company.companyId)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="dl-company-card bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                        style={{
                          boxShadow: hoveredCard === company.companyId ? "0 8px 30px rgba(67,97,238,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
                          transform: hoveredCard === company.companyId ? "translateY(-2px)" : "translateY(0)",
                        }}
                      >
                        <div>
                          {/* Card Top */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#196bdf" }}>
                                {(company?.companyName || "CO").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-sm leading-tight">{company?.companyName || "Organization"}</h3>
                                <span className="text-xs text-muted-foreground">@{company?.githubOrganizationName || "organization"}</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#182e46", color: "#65d8f5" }}>
                              <Crown size={10} />
                              Super Admin
                            </span>
                          </div>

                          {/* Repos count & link */}
                          <div className="bg-muted rounded-xl p-3 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GitBranch size={14} style={{ color: "#65d8f5" }} />
                              <span className="text-xs font-semibold text-foreground">{company?.totalRepositories || 0} Repositories</span>
                            </div>
                            <a
                              href={company?.githubOrganizationUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-medium hover:underline flex items-center gap-1"
                              style={{ color: "#65d8f5" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              GitHub Org <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-2 pt-3 border-t border-border">
                          <span className="text-[11px] text-muted-foreground truncate">
                            Created {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : ""}
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAnalysisPage(company, "admin");
                              }}
                              className="flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors shadow-sm"
                              title="Open full page analysis workspace"
                            >
                              <Play size={10} className="fill-current" /> Analyze
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPastAnalysesPage(company, "admin");
                              }}
                              className="flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors shadow-sm"
                              title="View past analysis history & reports"
                            >
                              <History size={11} /> History
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openInviteModal(company);
                              }}
                              className="flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors shadow-sm"
                              title="Invite repository contributors"
                            >
                              <UserPlus size={12} /> Invite
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openManageModal(company);
                              }}
                              className="flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-muted hover:bg-border text-foreground transition-colors"
                              title="Add more repos to company"
                            >
                              <Layers size={12} /> Repos
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : maximizedSection === "member" ? (
              /* ════════════════════════════════════════════════════════════════
                 MAXIMIZED COMPANY MEMBER WINDOW
                 ════════════════════════════════════════════════════════════════ */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Window Top Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMaximizedSection(null)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                      title="Restore standard dashboard layout"
                    >
                      <Minimize2 size={14} className="text-emerald-400" /> Restore View
                    </button>
                    <div className="h-5 w-px bg-border hidden sm:block" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Dashboard</span>
                      <ChevronRight size={12} />
                      <span className="text-emerald-400 font-semibold">Company Member (Collaborations Workspace)</span>
                    </div>
                  </div>
                </div>

                {/* Maximized Banner */}
                <div className="p-6 md:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-card to-teal-950/20 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                        <Users size={13} />
                        <span>Member Organizations & Collaborations</span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Member Organizations ({filteredMember.length})
                      </h1>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Full window view of all organizations and repositories you have been invited to collaborate on. Trigger on-demand code analysis and inspect technical debt metrics.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border text-center min-w-[120px]">
                        <p className="text-2xl font-bold text-emerald-400">{filteredMember.length}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Organizations</p>
                      </div>
                      <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border text-center min-w-[120px]">
                        <p className="text-2xl font-bold text-teal-400">{totalMemberRepos}</p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Assigned Repos</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Quick Actions */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 w-full sm:w-80 shadow-sm">
                    <Search size={14} className="text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search member companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-full"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaximizedSection(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-sm"
                  >
                    <Minimize2 size={13} />
                    <span>Exit Full Window</span>
                  </button>
                </div>

                {/* Maximized Grid */}
                {filteredMember.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-16 text-center">
                    <Users size={32} className="mx-auto mb-3 text-emerald-400" />
                    <h3 className="text-base font-bold text-foreground mb-1">No member organizations match your filter</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      When you accept repository collaboration invitations, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredMember.map((company) => (
                      <div
                        key={company.companyId}
                        onClick={() => openAnalysisPage(company, "member")}
                        className="dl-company-card bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-400/25 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#137756" }}>
                                {(company?.companyName || "CO").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-sm leading-tight">{company?.companyName || "Organization"}</h3>
                                <span className="text-xs text-muted-foreground">@{company?.githubOrganizationName || "organization"}</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#12382e", color: "#7de3b2" }}>
                              <UserCheck size={10} />
                              Member
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="text-xs font-semibold text-emerald-300">
                            {company?.totalRepositories || 0} Assigned Repo{(company?.totalRepositories || 0) !== 1 ? "s" : ""}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAnalysisPage(company, "member");
                              }}
                              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors shadow-sm"
                            >
                              <Play size={10} className="fill-current" /> Analyze
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPastAnalysesPage(company, "member");
                              }}
                              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors shadow-sm"
                              title="View past analysis history"
                            >
                              <History size={11} /> Past Analyses
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ════════════════════════════════════════════════════════════════
                 STANDARD TWO-COLUMN DASHBOARD SECTIONS
                 ════════════════════════════════════════════════════════════════ */
              <div className="flex flex-col gap-10">

                {/* ════════════════════════════
                    COMPANY ADMIN SECTION
                ════════════════════════════ */}
                {(activeTab === "all" || activeTab === "admin") && (
                  <section className="dl-company-section dl-scroll w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#182e46" }}>
                          <Crown size={15} style={{ color: "#65d8f5" }} />
                        </div>
                        <div>
                          <h2 className="font-semibold text-foreground text-base leading-tight">Company Admin</h2>
                          <p className="text-xs text-muted-foreground">{filteredAdmin.length} organization{filteredAdmin.length !== 1 ? "s" : ""} you manage as Super Admin</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMaximizedSection("admin")}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
                          title="Maximize Company Admin window to full width"
                        >
                          <Maximize2 size={12} className="text-cyan-400" />
                          <span>Maximize</span>
                        </button>
                        <button
                          onClick={openCreateModal}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                          style={{ background: "#196bdf" }}
                        >
                          <Building2 size={12} />
                          New Org
                        </button>
                      </div>
                    </div>

                    <div className="h-0.5 rounded-full mb-5" style={{ background: "linear-gradient(to right, #196bdf, #7C3AED, transparent)" }} />

                    {loadingCompanies ? (
                      <div className="bg-card rounded-xl border border-border p-10 text-center flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <span className="text-sm text-muted-foreground">Loading your companies...</span>
                      </div>
                    ) : filteredAdmin.length === 0 ? (
                      <div className="bg-card rounded-2xl border border-border p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#182e46" }}>
                          <Crown size={28} style={{ color: "#65d8f5" }} />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">No admin companies yet</h3>
                        <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                          Verify your GitHub organization to import repositories and create your first company.
                        </p>
                        <button
                          onClick={openCreateModal}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-xl transition-all shadow"
                          style={{ background: "#196bdf" }}
                        >
                          <Building2 size={13} />
                          Register Your Organization
                        </button>
                      </div>
                    ) : (
                      <div className="dl-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredAdmin.map((company) => (
                          <div
                            key={company.companyId}
                            onMouseEnter={() => setHoveredCard(company.companyId)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className="dl-company-card bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200"
                            style={{
                              boxShadow: hoveredCard === company.companyId ? "0 8px 30px rgba(67,97,238,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
                              transform: hoveredCard === company.companyId ? "translateY(-2px)" : "translateY(0)",
                            }}
                          >
                            {/* Card Top */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#196bdf" }}>
                                  {(company?.companyName || "CO").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-sm leading-tight">{company?.companyName || "Organization"}</h3>
                                  <span className="text-xs text-muted-foreground">@{company?.githubOrganizationName || "organization"}</span>
                                </div>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#182e46", color: "#65d8f5" }}>
                                <Crown size={10} />
                                Super Admin
                              </span>
                            </div>

                            {/* Repos count & link */}
                            <div className="bg-muted rounded-xl p-3 mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GitBranch size={14} style={{ color: "#65d8f5" }} />
                                <span className="text-xs font-semibold text-foreground">{company?.totalRepositories || 0} Repositories</span>
                              </div>
                              <a
                                href={company?.githubOrganizationUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-medium hover:underline flex items-center gap-1"
                                style={{ color: "#65d8f5" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                GitHub Org <ExternalLink size={10} />
                              </a>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                              <span className="text-xs text-muted-foreground truncate">
                                Created {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : ""}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAnalysisPage(company, "admin");
                                  }}
                                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition-colors shadow-sm"
                                  title="Open full page analysis workspace"
                                >
                                  <Play size={10} className="fill-current" /> Analyze
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPastAnalysesPage(company, "admin");
                                  }}
                                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors shadow-sm"
                                  title="View past analysis history & reports"
                                >
                                  <History size={11} /> Past Analyses
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openInviteModal(company);
                                  }}
                                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors shadow-sm"
                                  title="Invite repository contributors"
                                >
                                  <UserPlus size={12} /> Invite
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openManageModal(company);
                                  }}
                                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted hover:bg-border text-foreground transition-colors"
                                  title="Add more repos to company"
                                >
                                  <Layers size={12} /> Repos
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* ════════════════════════════
                    COMPANY MEMBER SECTION
                ════════════════════════════ */}
                {(activeTab === "all" || activeTab === "member") && (
                  <section className="dl-company-section dl-scroll w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#12382e" }}>
                          <Users size={15} style={{ color: "#10B981" }} />
                        </div>
                        <div>
                          <h2 className="font-semibold text-foreground text-base leading-tight">Company Member</h2>
                          <p className="text-xs text-muted-foreground">{filteredMember.length} organization{filteredMember.length !== 1 ? "s" : ""} you belong to</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMaximizedSection("member")}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
                        title="Maximize Company Member window to full width"
                      >
                        <Maximize2 size={12} className="text-emerald-400" />
                        <span>Maximize</span>
                      </button>
                    </div>

                    <div className="h-0.5 rounded-full mb-5" style={{ background: "linear-gradient(to right, #10B981, #06B6D4, transparent)" }} />

                    {loadingMemberCompanies ? (
                      <div className="bg-card rounded-xl border border-border p-10 text-center flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-emerald-300" size={20} />
                        <span className="text-sm text-muted-foreground">Loading member organizations...</span>
                      </div>
                    ) : filteredMember.length === 0 ? (
                      <div className="bg-card rounded-2xl border border-border p-10 text-center">
                        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "#12382e" }}>
                          <Users size={24} style={{ color: "#10B981" }} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">No member organizations yet</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          When you accept an invitation to join another organization's repository, it will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="dl-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredMember.map((company) => (
                          <div
                            key={company.companyId}
                            onClick={() => openAnalysisPage(company, "member")}
                            className="dl-company-card bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-400/25"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#137756" }}>
                                  {(company?.companyName || "CO").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-sm leading-tight">{company?.companyName || "Organization"}</h3>
                                  <span className="text-xs text-muted-foreground">@{company?.githubOrganizationName || "organization"}</span>
                                </div>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#12382e", color: "#7de3b2" }}>
                                <UserCheck size={10} />
                                Member
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <span className="text-xs font-semibold text-emerald-300">
                                {company?.totalRepositories || 0} Assigned Repo{(company?.totalRepositories || 0) !== 1 ? "s" : ""}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAnalysisPage(company, "member");
                                  }}
                                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors shadow-sm"
                                >
                                  <Play size={10} className="fill-current" /> Analyze
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPastAnalysesPage(company, "member");
                                  }}
                                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors shadow-sm"
                                  title="View past analysis history"
                                >
                                  <History size={11} /> Past Analyses
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

              </div>
            )}
          </>
        )}
      </main>

      {/* ══════════════════════════════════════════════
          CREATE COMPANY MODAL (WIZARD)
      ══════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="dl-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-card rounded-3xl border border-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            style={{ animation: "scaleUp 0.2s ease-out" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#196bdf" }}>
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Create New Company</h3>
                  <p className="text-xs text-muted-foreground">
                    {step === 1 && "Step 1 of 3: Verify GitHub Organization & Membership"}
                    {step === 2 && "Step 2 of 3: Select Repositories"}
                    {step === 3 && "Step 3 of 3: Confirm & Launch Company"}
                  </p>
                </div>
              </div>
              <button
                aria-label="Close create company"
                onClick={closeCreateModal}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper progress indicator */}
            <div className="w-full bg-muted h-1.5 flex">
              <div className={`h-full transition-all duration-300 ${step === 1 ? "w-1/3 bg-indigo-600" : step === 2 ? "w-2/3 bg-indigo-600" : "w-full bg-emerald-500"}`} />
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* ──── STEP 1: VERIFY ORG ──── */}
              {step === 1 && (
                <div className="dl-step flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      GitHub Organization URL
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Enter the URL of the GitHub organization you want to register (e.g. <code>https://github.com/TechnicalDebtAnalytics</code>).
                    </p>
                    <div className="dl-form-row flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. https://github.com/TechnicalDebtAnalytics"
                        value={orgInput}
                        onChange={(e) => {
                          setOrgInput(e.target.value);
                          setOrgError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyOrg()}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                      />
                      <button
                        onClick={handleVerifyOrg}
                        disabled={verifyingOrg || !orgInput.trim()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                        style={{ background: "#196bdf" }}
                      >
                        {verifyingOrg ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Org URL
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {orgError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-400/25 text-red-300 text-xs flex items-start gap-2.5">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Verification Failed</p>
                        <p className="mt-0.5">{orgError}</p>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-400/25 text-xs text-indigo-300 leading-relaxed">
                    <p className="font-semibold mb-1 flex items-center gap-1.5 text-indigo-300">
                      <Sparkles size={14} /> How Verification Works
                    </p>
                    Our backend will verify that the organization exists on GitHub and confirm that your registered GitHub account is an authorized member or contributor before allowing repository import.
                  </div>
                </div>
              )}

              {/* ──── STEP 2: SELECT REPOSITORIES & CONTRIBUTORS ──── */}
              {step === 2 && verifiedOrg && (
                <div className="dl-step flex flex-col gap-4">
                  {/* Verified Org Header */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/25">
                    <div className="flex items-center gap-3">
                      <img
                        src={verifiedOrg.avatar_url}
                        alt={verifiedOrg.login}
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-400/25"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-foreground">{verifiedOrg.name}</span>
                          <span className="text-xs text-muted-foreground">(@{verifiedOrg.login})</span>
                        </div>
                        <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1 mt-0.5">
                          <Check size={12} /> {verifiedOrg.message}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card text-emerald-300 border border-emerald-400/25">
                      {verifiedOrg.public_repos} Repos
                    </span>
                  </div>

                  {/* Repo search & Selection header */}
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Filter repositories..."
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-xs outline-none focus:border-indigo-600"
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                      {selectedRepoIds.length} of {availableRepos.length} selected
                    </span>
                  </div>

                  {/* Repositories List */}
                  {loadingRepos ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      <span className="text-xs text-muted-foreground">Loading repositories...</span>
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="p-8 text-center bg-muted/40 rounded-2xl border border-border text-xs text-muted-foreground">
                      No matching repositories found in this organization.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {filteredRepos.map((repo) => {
                        const isSelected = selectedRepoIds.includes(repo.id);

                        return (
                          <div
                            key={repo.id}
                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isSelected ? "border-indigo-500 bg-indigo-500/10" : "border-border bg-card hover:border-border"
                              }`}
                          >
                            {/* Repo Row */}
                            <div className="p-3.5 flex items-center justify-between gap-3">
                              <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleRepoSelection(repo)}
                                  className="w-4 h-4 rounded border-gray-300 text-indigo-300 focus:ring-indigo-500"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-foreground truncate">{repo.name}</span>
                                    {repo.language?.toLowerCase() === "java" ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-400/25">
                                        Java
                                      </span>
                                    ) : !repo.language ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                                        Java / Unindexed
                                      </span>
                                    ) : (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                                        {repo.language} (Unsupported)
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {repo.description || "No description provided"}
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ──── STEP 3: CONFIRMATION & SETUP ──── */}
              {step === 3 && verifiedOrg && (
                <div className="dl-step flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyNameInput}
                      onChange={(e) => setCompanyNameInput(e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-400/20"
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl bg-muted border border-border flex flex-col gap-3">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Configuration Summary</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">GitHub Organization:</span>
                        <p className="font-semibold text-foreground mt-0.5">@{verifiedOrg.login}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Selected Repositories:</span>
                        <p className="font-semibold text-indigo-300 mt-0.5">{selectedRepoIds.length} Repositories</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Super Admin:</span>
                        <p className="font-semibold text-foreground mt-0.5">{user.name} (You)</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Security Mapping:</span>
                        <p className="font-semibold text-emerald-300 mt-0.5">Verified Contributor</p>
                      </div>
                    </div>
                  </div>

                  {creationError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-400/25 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{creationError}</span>
                    </div>
                  )}

                  {creationSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-xs flex items-center gap-2">
                      <Check size={16} className="shrink-0" />
                      <span>Company created successfully! Refreshing dashboard...</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  disabled={creatingCompany || creationSuccess}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <div />
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedRepoIds.length === 0}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-xl text-white transition-all disabled:opacity-50"
                  style={{ background: "#196bdf" }}
                >
                  Next: Confirm Setup <ArrowRight size={14} />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleCreateCompanySubmit}
                  disabled={creatingCompany || creationSuccess || !companyNameInput.trim() || selectedRepoIds.length === 0}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-6 py-2.5 rounded-xl text-white transition-all disabled:opacity-50"
                  style={{ background: "#137756" }}
                >
                  {creatingCompany ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating Company...
                    </>
                  ) : creationSuccess ? (
                    <>
                      <Check size={14} />
                      Created!
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Create Company
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TECHNICAL DEBT REPORT & PRIORITIZED RECOMMENDATIONS MODAL ─────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {selectedReportAnalysisId !== null && (
        <div className="dl-modal fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl w-full max-w-5xl shadow-2xl border border-border overflow-hidden flex flex-col my-8 max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1E1B4B, #312E81)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Technical Debt & Refactoring Report
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Analysis Job #{selectedReportAnalysisId} {activeReport ? `• ${activeReport.repositoryName} (${activeReport.branch})` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close report"
                onClick={() => setSelectedReportAnalysisId(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-indigo-200 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* Loading State */}
              {loadingReport && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Loader2 size={36} className="animate-spin text-indigo-300 mb-3" />
                  <p className="font-semibold text-foreground text-sm">Evaluating Technical Debt & Recommendations...</p>
                  <p className="text-xs text-muted-foreground mt-1">Aggregating 28 metrics, bug probabilities, and SATD comment classifications.</p>
                </div>
              )}

              {/* Error State */}
              {reportError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/25 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{reportError}</span>
                </div>
              )}

              {/* Report Content */}
              {!loadingReport && activeReport && (
                <>
                  {/* Top Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Overall Debt Score */}
                    <div className="p-4 rounded-2xl border border-border bg-muted flex flex-col justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Overall Debt Score</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-foreground tracking-tight">
                          {activeReport.overallDebtScore}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                      <div className="mt-2 w-full bg-border h-1.5 rounded-full overflow-hidden">
                        <div
                          className="dl-meter h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, activeReport.overallDebtScore)}%`,
                            background:
                              activeReport.overallDebtScore < 25
                                ? "#137756"
                                : activeReport.overallDebtScore < 50
                                  ? "#3B82F6"
                                  : activeReport.overallDebtScore < 75
                                    ? "#F59E0B"
                                    : "#EF4444",
                          }}
                        />
                      </div>
                    </div>

                    {/* Health Score */}
                    <div className="p-4 rounded-2xl border border-border bg-muted flex flex-col justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Repository Health</span>
                      <div className="mt-2">
                        <span
                          className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider inline-block"
                          style={{
                            background:
                              activeReport.overallHealthScore === "EXCELLENT"
                                ? "#12382e"
                                : activeReport.overallHealthScore === "GOOD"
                                  ? "#172e49"
                                  : activeReport.overallHealthScore === "FAIR"
                                    ? "#392d1e"
                                    : "#3a202b",
                            color:
                              activeReport.overallHealthScore === "EXCELLENT"
                                ? "#7de3b2"
                                : activeReport.overallHealthScore === "GOOD"
                                  ? "#8ccaff"
                                  : activeReport.overallHealthScore === "FAIR"
                                    ? "#f6ce7a"
                                    : "#fca5a5",
                          }}
                        >
                          {activeReport.overallHealthScore}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-2">
                        Risk: <span className="font-semibold">{activeReport.overallRiskLevel}</span>
                      </span>
                    </div>

                    {/* Classes Analyzed */}
                    <div className="p-4 rounded-2xl border border-border bg-muted flex flex-col justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Classes Analyzed</span>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-foreground">
                          {activeReport.totalClasses}
                        </span>
                        <span className="text-xs text-muted-foreground">total classes</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                        <Code2 size={12} /> {activeReport.defectiveClassesCount} high bug-risk classes
                      </span>
                    </div>

                    {/* SATD Comments */}
                    <div className="p-4 rounded-2xl border border-border bg-muted flex flex-col justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Admitted Technical Debt</span>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-300">
                          {activeReport.totalSatdComments}
                        </span>
                        <span className="text-xs text-muted-foreground">SATD comments</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 text-amber-300">
                        <Tag size={12} /> TODO/FIXME annotations
                      </span>
                    </div>
                  </div>

                  {/* Section Title & Filter Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div>
                      <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-300" />
                        Classes to Refactor First
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Ranked from highest technical debt & risk to lowest. Address top-ranked classes first to maximize code maintainability.
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="dl-report-filters flex items-center gap-1 bg-muted p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSelectedClassFilter("ALL")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedClassFilter === "ALL"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        All ({activeReport.prioritizedRefactoringList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedClassFilter("CRITICAL")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedClassFilter === "CRITICAL"
                            ? "bg-red-500/10 text-red-300 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Critical (
                        {
                          activeReport.prioritizedRefactoringList.filter(
                            (c) => c.riskLevel === "CRITICAL" || (c.technicalDebtScore ?? 0) >= 75
                          ).length
                        }
                        )
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedClassFilter("HIGH")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedClassFilter === "HIGH"
                            ? "bg-amber-500/10 text-amber-300 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        High Debt (
                        {
                          activeReport.prioritizedRefactoringList.filter(
                            (c) => (c.technicalDebtScore ?? 0) >= 50
                          ).length
                        }
                        )
                      </button>
                    </div>
                  </div>

                  {/* Prioritized Class Cards List */}
                  <div className="space-y-3">
                    {activeReport.prioritizedRefactoringList
                      .filter((c) => {
                        if (selectedClassFilter === "CRITICAL")
                          return c.riskLevel === "CRITICAL" || (c.technicalDebtScore ?? 0) >= 75;
                        if (selectedClassFilter === "HIGH")
                          return (c.technicalDebtScore ?? 0) >= 50;
                        return true;
                      })
                      .map((cls) => (
                        <div
                          key={cls.classId}
                          className="dl-report-card dl-scroll rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Rank & Class Info */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Priority Rank Badge */}
                            <div
                              className="w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs"
                              style={{
                                background:
                                  cls.refactorPriorityRank === 1
                                    ? "#3a202b"
                                    : cls.refactorPriorityRank <= 3
                                      ? "#392d1e"
                                      : "#1b293d",
                                color:
                                  cls.refactorPriorityRank === 1
                                    ? "#fca5a5"
                                    : cls.refactorPriorityRank <= 3
                                      ? "#f6ce7a"
                                      : "#b3c4d9",
                              }}
                            >
                              #{cls.refactorPriorityRank}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-extrabold text-base text-foreground tracking-tight">
                                  {cls.className}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-md">
                                  {cls.numberOfLinesOfCode} LOC
                                </span>
                              </div>

                              {/* Highlighted File Path Location */}
                              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-xs font-semibold shadow-xs">
                                  <FileCode size={13} className="text-indigo-300 shrink-0" />
                                  <span className="font-mono tracking-tight">
                                    {cls.filePath
                                      ? cls.filePath.replace(/\\/g, "/").split(/analysis-repository-[^/]+\//)[1] ||
                                      cls.filePath.split("/").slice(-2).join("/") ||
                                      cls.filePath
                                      : "source file"}
                                  </span>
                                  <span className="text-indigo-300 font-medium text-[11px]">
                                    (lines {cls.startLine}–{cls.endLine})
                                  </span>
                                </div>

                                {cls.primaryDrivers && cls.primaryDrivers.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {cls.primaryDrivers.map((driver, dIdx) => (
                                      <span
                                        key={dIdx}
                                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium border border-border"
                                      >
                                        {driver}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Scores & Risk Badges */}
                          <div className="flex items-center gap-3 shrink-0 flex-wrap md:justify-end">
                            {/* Bug Risk Pill */}
                            <div className="px-3 py-1.5 rounded-xl border border-border bg-muted text-center min-w-[90px]">
                              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Bug Risk</span>
                              <span className="text-xs font-extrabold text-foreground">
                                {cls.bugProbability != null ? `${Math.round(cls.bugProbability * 100)}%` : "0%"}
                              </span>
                            </div>

                            {/* Risk Level */}
                            <div
                              className="px-3 py-1.5 rounded-xl text-center min-w-[85px]"
                              style={{
                                background:
                                  cls.riskLevel === "CRITICAL"
                                    ? "#3a202b"
                                    : cls.riskLevel === "HIGH"
                                      ? "#392d1e"
                                      : "#172e49",
                                color:
                                  cls.riskLevel === "CRITICAL"
                                    ? "#fca5a5"
                                    : cls.riskLevel === "HIGH"
                                      ? "#f6ce7a"
                                      : "#8ccaff",
                              }}
                            >
                              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">Risk</span>
                              <span className="text-xs font-black">{cls.riskLevel}</span>
                            </div>

                            {/* Technical Debt Score */}
                            <div
                              className="px-4 py-2 rounded-2xl text-center shadow-sm min-w-[100px]"
                              style={{
                                background:
                                  cls.technicalDebtScore >= 75
                                    ? "#922e3b"
                                    : cls.technicalDebtScore >= 50
                                      ? "#926017"
                                      : cls.technicalDebtScore >= 25
                                        ? "#2563EB"
                                        : "#137756",
                                color: "#FFFFFF",
                              }}
                            >
                              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-90">Debt Score</span>
                              <span className="text-base font-black tracking-tight">{cls.technicalDebtScore}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Technical Debt Analytics Engine • Continuous Code Health
              </span>
              <button
                type="button"
                aria-label="Close report"
                onClick={() => setSelectedReportAnalysisId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
