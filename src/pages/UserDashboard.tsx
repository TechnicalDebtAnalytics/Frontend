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
  FileText,
  AlertTriangle,
  TrendingUp,
  Code2,
  Tag,
  CheckCheck,
  FileCode,
} from "lucide-react";

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

  // ── Company Repositories Viewer Modal State (for Members and Admins) ──
  const [viewingCompanyRepos, setViewingCompanyRepos] = useState<CompanyAdminItem | null>(null);
  const [activeCompanyRepos, setActiveCompanyRepos] = useState<CompanyRepoItem[]>([]);
  const [loadingActiveCompanyRepos, setLoadingActiveCompanyRepos] = useState(false);
  const [viewingAsRole, setViewingAsRole] = useState<"admin" | "member">("admin");

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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:8080/api/companies/my-admin", { headers });
      if (res.ok) {
        const data = await res.json();
        setAdminCompaniesList(data);
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/invitations/my-pending", { headers });
      if (res.ok) {
        const data = await res.json();
        setMyPendingInvitations(data);
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8080/api/companies/my-member", { headers });
      if (res.ok) {
        const data = await res.json();
        setMemberCompaniesList(data);
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/invitations/${invitation.invitationId}/accept`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to accept invitation");
      }

      setInvitationActionMsg({
        type: "success",
        text: `🎉 You have joined ${invitation.companyName} for repository ${invitation.repositoryName}!`,
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/invitations/${invitation.invitationId}/reject`, {
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

  // Fetch analysis history for a single repository
  const fetchAnalysisForRepo = async (repoId: number, tokenParam?: string) => {
    try {
      let token = tokenParam;
      if (!token) {
        try {
          token = await getAccessTokenSilently();
        } catch {}
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/repositories/${repoId}/analysis`, { headers });
      if (res.ok) {
        const jobs = await res.json();
        if (Array.isArray(jobs) && jobs.length > 0) {
          const latest = jobs[0];
          setAnalysisStatusMap((prev) => ({
            ...prev,
            [repoId]: {
              analysisId: latest.analysisId,
              status: latest.status,
              totalClasses: latest.totalClassesAnalyzed,
              startedAt: latest.startedAt,
              completedAt: latest.completedAt,
            },
          }));
        }
      }
    } catch (err) {
      console.warn("Could not fetch analysis history for repo:", repoId, err);
    }
  };

  // Open Repositories Modal (for Member or Admin)
  const openViewCompanyReposModal = async (company: CompanyAdminItem, role: "admin" | "member") => {
    setViewingCompanyRepos(company);
    setViewingAsRole(role);
    setLoadingActiveCompanyRepos(true);
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/companies/${company.companyId}/repositories`, { headers });
      if (res.ok) {
        const data: CompanyRepoItem[] = await res.json();
        setActiveCompanyRepos(data);
        // Load latest analysis status for each repo
        data.forEach((r) => {
          fetchAnalysisForRepo(r.repositoryId, token);
        });
      } else {
        setActiveCompanyRepos([]);
      }
    } catch (err) {
      console.warn("Could not fetch company repositories:", err);
      setActiveCompanyRepos([]);
    } finally {
      setLoadingActiveCompanyRepos(false);
    }
  };

  // Trigger analysis for a repository via RabbitMQ
  const handleStartAnalysis = async (repo: CompanyRepoItem) => {
    setAnalyzingRepoIds((prev) => ({ ...prev, [repo.repositoryId]: true }));
    try {
      let token = "";
      try {
        token = await getAccessTokenSilently();
      } catch {}

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const targetBranch = repo.defaultBranch || "main";
      const res = await fetch(
        `http://localhost:8080/api/repositories/${repo.repositoryId}/analysis?branch=${encodeURIComponent(targetBranch)}`,
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
          const pollRes = await fetch(`http://localhost:8080/api/repositories/${repo.repositoryId}/analysis`, { headers });
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/analysis/${analysisId}/report`, { headers });
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

  // Filtered lists
  const filteredAdmin = adminCompaniesList.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.githubOrganizationName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const displayMemberCompanies = memberCompaniesList.length > 0 ? memberCompaniesList : [];
  const filteredMember = displayMemberCompanies.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.githubOrganizationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAdminRepos = adminCompaniesList.reduce((s, c) => s + (c.totalRepositories || 0), 0);
  const totalMemberRepos = displayMemberCompanies.reduce((s, c) => s + (c.totalRepositories || 0), 0);
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
      const orgRes = await fetch(`http://localhost:8080/api/github/orgs/${encodeURIComponent(orgSlug)}`, { headers });
      if (!orgRes.ok) {
        const errData = await orgRes.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub Organization '${orgSlug}' not found`);
      }
      const orgData = await orgRes.json();

      // 2. Validate user membership in this org
      const memberRes = await fetch(
        `http://localhost:8080/api/github/orgs/${encodeURIComponent(orgSlug)}/validate-my-membership`,
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
      const res = await fetch(`http://localhost:8080/api/github/orgs/${orgName}/repos`, { headers });
      if (res.ok) {
        const repos: GithubRepo[] = await res.json();
        setAvailableRepos(repos);
        // Auto-select only valid Java repositories
        const javaRepoIds = repos
          .filter((r) => r.language && r.language.toLowerCase() === "java")
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `http://localhost:8080/api/github/repos/${orgLogin}/${repoName}/contributors`,
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
      // Validate Java repository
      if (!repo.language || repo.language.toLowerCase() !== "java") {
        setOrgError(
          `Cannot select '${repo.name}'. DebtLens currently only analyzes Java repositories (detected language: ${repo.language || "Unknown"}).`
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
      } catch {}

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

      const res = await fetch("http://localhost:8080/api/companies", {
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/companies/${company.companyId}/available-repositories`, { headers });
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
      if (!targetRepo?.language || targetRepo.language.toLowerCase() !== "java") {
        setAddReposError(
          `Cannot add '${repoName}'. DebtLens currently only analyzes Java repositories (detected language: ${targetRepo?.language || "Unknown"}).`
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
      } catch {}

      const selectedPayload = availableForCompany
        .filter((r) => newlySelectedRepoIds.includes(r.githubRepositoryId))
        .map((r) => ({
          githubRepositoryId: r.githubRepositoryId,
          repositoryName: r.name,
          repositoryUrl: r.htmlUrl,
          defaultBranch: r.defaultBranch || "main",
        }));

      const res = await fetch(`http://localhost:8080/api/companies/${manageCompany.companyId}/repositories`, {
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
      } catch {}

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/companies/${company.companyId}/repositories`, { headers });
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
        } catch {}
      }

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 1. Fetch live contributors from GitHub
      const contribsPromise = fetch(
        `http://localhost:8080/api/github/repos/${company.githubOrganizationName}/${repo.repositoryName}/contributors`,
        { headers }
      );

      // 2. Fetch existing invitations for this repository
      const invitesPromise = fetch(
        `http://localhost:8080/api/invitations/repository/${repo.repositoryId}`,
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
      } catch {}

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        repositoryId: selectedRepoForInvite.repositoryId,
        contributors: entries.map(([username, email]) => ({
          githubUsername: username,
          email: email.trim(),
        })),
      };

      const res = await fetch("http://localhost:8080/api/invitations", {
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
        `http://localhost:8080/api/invitations/repository/${selectedRepoForInvite.repositoryId}`,
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
    <div className="min-h-screen" style={{ background: "#F4F5F7", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-border" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#4361EE" }}>
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
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: "#4361EE" }}>3</span>
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #4361EE, #7C3AED)" }}>
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

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">My Companies</h1>
            <p className="text-sm text-muted-foreground">Manage organizations you administer and teams you belong to.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 w-fit"
            style={{ background: "#4361EE" }}
          >
            <Building2 size={16} />
            Create Company
          </button>
        </div>

        {/* ── Action Feedback Toast ── */}
        {invitationActionMsg && (
          <div
            className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
              invitationActionMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {invitationActionMsg.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 shrink-0" />
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
          <div className="mb-8 p-6 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/90 shadow-lg shadow-indigo-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-600 text-white shadow-md shadow-indigo-200">
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
              {myPendingInvitations.map((inv) => {
                const isProcessing = processingInvitationId === inv.invitationId;

                return (
                  <div
                    key={inv.invitationId}
                    className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{inv.companyName}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                            Repo: {inv.repositoryName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Invited as <span className="font-semibold text-foreground">@{inv.githubUsername || inv.email}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock size={11} className="text-amber-500" />
                          Expires {new Date(inv.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleAcceptInvitation(inv)}
                        disabled={isProcessing}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-sm shadow-emerald-200"
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
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-muted-foreground text-xs font-semibold transition-all disabled:opacity-50"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EEF2FF" }}>
              <Shield size={18} style={{ color: "#4361EE" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{adminCompaniesList.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Admin Orgs</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#D1FAE5" }}>
              <Users size={18} style={{ color: "#10B981" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{memberCompaniesList.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Member Orgs</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F3F0FF" }}>
              <GitBranch size={18} style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{totalRepos}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Repos</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEF3C7" }}>
              <Activity size={18} style={{ color: "#F59E0B" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{adminCompaniesList.length + memberCompaniesList.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Orgs</p>
            </div>
          </div>
        </div>

        {/* ── Tab Filter ── */}
        <div className="flex items-center gap-1 mb-6 bg-card border border-border rounded-xl p-1 w-fit" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          {(["all", "admin", "member"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
              style={activeTab === tab ? { background: "#4361EE", color: "#fff", boxShadow: "0 2px 8px rgba(67,97,238,0.3)" } : { color: "#6B7280" }}
            >
              {tab === "all" ? "All Companies" : tab === "admin" ? "Admin" : "Member"}
            </button>
          ))}
        </div>

        {/* ── Two Column Sections ── */}
        <div className="flex flex-col gap-10">

          {/* ════════════════════════════
              COMPANY ADMIN SECTION
          ════════════════════════════ */}
          {(activeTab === "all" || activeTab === "admin") && (
            <section className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF2FF" }}>
                    <Crown size={15} style={{ color: "#4361EE" }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-base leading-tight">Company Admin</h2>
                    <p className="text-xs text-muted-foreground">{filteredAdmin.length} organization{filteredAdmin.length !== 1 ? "s" : ""} you manage as Super Admin</p>
                  </div>
                </div>
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                  style={{ background: "#4361EE" }}
                >
                  <Building2 size={12} />
                  New Org
                </button>
              </div>

              <div className="h-0.5 rounded-full mb-5" style={{ background: "linear-gradient(to right, #4361EE, #7C3AED, transparent)" }} />

              {loadingCompanies ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={20} />
                  <span className="text-sm text-muted-foreground">Loading your companies...</span>
                </div>
              ) : filteredAdmin.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#EEF2FF" }}>
                    <Crown size={28} style={{ color: "#4361EE" }} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">No admin companies yet</h3>
                  <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                    Verify your GitHub organization to import repositories and create your first company.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-xl transition-all shadow"
                    style={{ background: "#4361EE" }}
                  >
                    <Building2 size={13} />
                    Register Your Organization
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAdmin.map((company) => (
                    <div
                      key={company.companyId}
                      onMouseEnter={() => setHoveredCard(company.companyId)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200"
                      style={{
                        boxShadow: hoveredCard === company.companyId ? "0 8px 30px rgba(67,97,238,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
                        transform: hoveredCard === company.companyId ? "translateY(-2px)" : "translateY(0)",
                      }}
                    >
                      {/* Card Top */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#4361EE" }}>
                            {company.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm leading-tight">{company.companyName}</h3>
                            <span className="text-xs text-muted-foreground">@{company.githubOrganizationName}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EEF2FF", color: "#4361EE" }}>
                          <Crown size={10} />
                          Super Admin
                        </span>
                      </div>

                      {/* Repos count & link */}
                      <div className="bg-muted rounded-xl p-3 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitBranch size={14} style={{ color: "#4361EE" }} />
                          <span className="text-xs font-semibold text-foreground">{company.totalRepositories} Repositories</span>
                        </div>
                        <a
                          href={company.githubOrganizationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-medium hover:underline flex items-center gap-1"
                          style={{ color: "#4361EE" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          GitHub Org <ExternalLink size={10} />
                        </a>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                        <span className="text-xs text-muted-foreground truncate">
                          Created {new Date(company.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openViewCompanyReposModal(company, "admin");
                            }}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shadow-sm"
                            title="View repositories & start analysis"
                          >
                            <Play size={10} className="fill-current" /> Analyze
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInviteModal(company);
                            }}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-sm"
                            title="Invite repository contributors"
                          >
                            <UserPlus size={12} /> Invite
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openManageModal(company);
                            }}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
            <section className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#D1FAE5" }}>
                    <Users size={15} style={{ color: "#10B981" }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-base leading-tight">Company Member</h2>
                    <p className="text-xs text-muted-foreground">{filteredMember.length} organization{filteredMember.length !== 1 ? "s" : ""} you belong to</p>
                  </div>
                </div>
              </div>

              <div className="h-0.5 rounded-full mb-5" style={{ background: "linear-gradient(to right, #10B981, #06B6D4, transparent)" }} />

              {loadingMemberCompanies ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-emerald-600" size={20} />
                  <span className="text-sm text-muted-foreground">Loading member organizations...</span>
                </div>
              ) : filteredMember.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "#D1FAE5" }}>
                    <Users size={24} style={{ color: "#10B981" }} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">No member organizations yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    When you accept an invitation to join another organization's repository, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMember.map((company) => (
                    <div
                      key={company.companyId}
                      onClick={() => openViewCompanyReposModal(company, "member")}
                      className="bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "#10B981" }}>
                            {company.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm leading-tight">{company.companyName}</h3>
                            <span className="text-xs text-muted-foreground">@{company.githubOrganizationName}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#065F46" }}>
                          <UserCheck size={10} />
                          Member
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs font-semibold text-emerald-700">
                          {company.totalRepositories} Assigned Repo{company.totalRepositories !== 1 ? "s" : ""}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewCompanyReposModal(company, "member");
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          View Repos <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </main>

      {/* ══════════════════════════════════════════════
          CREATE COMPANY MODAL (WIZARD)
      ══════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl border border-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            style={{ animation: "scaleUp 0.2s ease-out" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#4361EE" }}>
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
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      GitHub Organization URL
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Enter the URL of the GitHub organization you want to register (e.g. <code>https://github.com/TechnicalDebtAnalytics</code>).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. https://github.com/TechnicalDebtAnalytics"
                        value={orgInput}
                        onChange={(e) => {
                          setOrgInput(e.target.value);
                          setOrgError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyOrg()}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                      <button
                        onClick={handleVerifyOrg}
                        disabled={verifyingOrg || !orgInput.trim()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
                        style={{ background: "#4361EE" }}
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
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Verification Failed</p>
                        <p className="mt-0.5">{orgError}</p>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                    <p className="font-semibold mb-1 flex items-center gap-1.5 text-indigo-700">
                      <Sparkles size={14} /> How Verification Works
                    </p>
                    Our backend will verify that the organization exists on GitHub and confirm that your registered GitHub account is an authorized member or contributor before allowing repository import.
                  </div>
                </div>
              )}

              {/* ──── STEP 2: SELECT REPOSITORIES & CONTRIBUTORS ──── */}
              {step === 2 && verifiedOrg && (
                <div className="flex flex-col gap-4">
                  {/* Verified Org Header */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={verifiedOrg.avatar_url}
                        alt={verifiedOrg.login}
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-300"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-foreground">{verifiedOrg.name}</span>
                          <span className="text-xs text-muted-foreground">(@{verifiedOrg.login})</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                          <Check size={12} /> {verifiedOrg.message}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200">
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
                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                              isSelected ? "border-indigo-500 bg-indigo-50/20" : "border-border bg-card hover:border-slate-300"
                            }`}
                          >
                            {/* Repo Row */}
                            <div className="p-3.5 flex items-center justify-between gap-3">
                              <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleRepoSelection(repo)}
                                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-foreground truncate">{repo.name}</span>
                                    {repo.language?.toLowerCase() === "java" ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                        Java
                                      </span>
                                    ) : (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                                        {repo.language || "Unknown"} (Unsupported)
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
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyNameInput}
                      onChange={(e) => setCompanyNameInput(e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-border flex flex-col gap-3">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Configuration Summary</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">GitHub Organization:</span>
                        <p className="font-semibold text-foreground mt-0.5">@{verifiedOrg.login}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Selected Repositories:</span>
                        <p className="font-semibold text-indigo-600 mt-0.5">{selectedRepoIds.length} Repositories</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Super Admin:</span>
                        <p className="font-semibold text-foreground mt-0.5">{user.name} (You)</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Security Mapping:</span>
                        <p className="font-semibold text-emerald-600 mt-0.5">Verified Contributor</p>
                      </div>
                    </div>
                  </div>

                  {creationError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{creationError}</span>
                    </div>
                  )}

                  {creationSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <Check size={16} className="shrink-0" />
                      <span>Company created successfully! Refreshing dashboard...</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  disabled={creatingCompany || creationSuccess}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-border bg-white text-muted-foreground hover:text-foreground transition-all"
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
                  style={{ background: "#4361EE" }}
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
                  style={{ background: "#10B981" }}
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

      {/* ══════════════════════════════════════════════
          MANAGE COMPANY & ADD REPOSITORIES MODAL
      ══════════════════════════════════════════════ */}
      {manageCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#4361EE" }}>
                  <Layers size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">{manageCompany.companyName}</h3>
                  <p className="text-xs text-muted-foreground">Manage Repositories (@{manageCompany.githubOrganizationName})</p>
                </div>
              </div>
              <button
                onClick={() => setManageCompany(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Import Repositories from GitHub</h4>
                  <p className="text-xs text-muted-foreground">
                    Select additional repositories from <code>@{manageCompany.githubOrganizationName}</code> to add to this company.
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {newlySelectedRepoIds.length} new selected
                </span>
              </div>

              {loadingCompanyRepos ? (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <span className="text-xs text-muted-foreground">Fetching organization repositories from GitHub...</span>
                </div>
              ) : availableForCompany.length === 0 ? (
                <div className="p-8 text-center bg-muted/40 rounded-2xl border border-border text-xs text-muted-foreground">
                  No repositories found for this organization on GitHub.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {availableForCompany.map((repo) => {
                    const isAlreadyAdded = repo.alreadyAdded;
                    const isNewlySelected = newlySelectedRepoIds.includes(repo.githubRepositoryId);
                    const isInspecting = activeRepoForContributors === repo.name;
                    const contributors = contributorsMap[repo.name] || [];
                    const isLoadingContribs = loadingContributors[repo.name];

                    return (
                      <div
                        key={repo.githubRepositoryId}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isAlreadyAdded
                            ? "border-emerald-200 bg-emerald-50/20"
                            : isNewlySelected
                            ? "border-indigo-500 bg-indigo-50/20"
                            : "border-border bg-card hover:border-slate-300"
                        }`}
                      >
                        <div className="p-3.5 flex items-center justify-between gap-3">
                          <label className={`flex items-center gap-3 flex-1 min-w-0 ${isAlreadyAdded ? "cursor-default opacity-80" : "cursor-pointer"}`}>
                            <input
                              type="checkbox"
                              disabled={isAlreadyAdded}
                              checked={isAlreadyAdded || isNewlySelected}
                              onChange={() => toggleNewRepoSelection(repo.githubRepositoryId, repo.name)}
                              className={`w-4 h-4 rounded ${isAlreadyAdded ? "text-emerald-600" : "text-indigo-600 focus:ring-indigo-500"}`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-foreground truncate">{repo.name}</span>
                                {isAlreadyAdded ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 font-semibold text-emerald-700">
                                    ✓ Already Added
                                  </span>
                                ) : repo.language?.toLowerCase() === "java" ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                    Java
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                                    {repo.language || "Unknown"} (Unsupported)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {repo.description || "No description provided"}
                              </p>
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleInspectContributors(manageCompany.githubOrganizationName, repo.name)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
                              isInspecting
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-muted-foreground border-border hover:text-foreground"
                            }`}
                          >
                            <Users size={12} />
                            Contributors
                          </button>
                        </div>

                        {/* Contributors tray */}
                        {isInspecting && (
                          <div className="px-4 pb-3.5 pt-2 border-t border-indigo-100 bg-indigo-50/50">
                            <p className="text-[11px] font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                              <Users size={12} /> Live Repository Contributors:
                            </p>
                            {isLoadingContribs ? (
                              <div className="flex items-center gap-2 text-xs text-indigo-700 py-1">
                                <Loader2 size={14} className="animate-spin" />
                                Fetching contributors list from GitHub...
                              </div>
                            ) : contributors.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No public contributors found for this repo.</p>
                                ) : (
                              <div
                                className="flex flex-wrap content-start gap-2 max-h-32 overflow-y-auto pr-1"
                                style={{ scrollbarWidth: "thin" }}
                              >
                                {contributors.map((contrib) => (
                                  <a
                                    key={contrib.id}
                                    href={contrib.html_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-xs text-foreground hover:shadow-sm transition-all"
                                  >
                                    <img
                                      src={contrib.avatar_url}
                                      alt={contrib.login}
                                      className="w-4 h-4 rounded-full object-cover"
                                    />
                                    <span className="font-medium text-[11px]">@{contrib.login}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                      {contrib.contributions}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {addReposError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{addReposError}</span>
                </div>
              )}

              {addReposSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <Check size={16} className="shrink-0" />
                  <span>Repositories added successfully! Updating dashboard...</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setManageCompany(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-white text-muted-foreground hover:text-foreground"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleAddRepositoriesSubmit}
                disabled={addingRepos || addReposSuccess || newlySelectedRepoIds.length === 0}
                className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl text-white transition-all disabled:opacity-50"
                style={{ background: "#4361EE" }}
              >
                {addingRepos ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Adding Repositories...
                  </>
                ) : addReposSuccess ? (
                  <>
                    <Check size={14} /> Added!
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add {newlySelectedRepoIds.length} Repositories
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          INVITE CONTRIBUTORS MODAL
      ══════════════════════════════════════════════ */}
      {inviteCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-border w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-600 shadow-sm">
                  <UserPlus size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Invite Repository Contributors</h3>
                  <p className="text-xs text-muted-foreground">
                    {inviteCompany.companyName} (@{inviteCompany.githubOrganizationName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInviteCompany(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              {/* Repository Selector */}
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Select Repository
                </label>
                {loadingCompanyReposForInvite ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 size={14} className="animate-spin text-primary" />
                    Loading company repositories...
                  </div>
                ) : companyRepos.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    No repositories found for this company. Please add repositories first via "Manage Repos".
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {companyRepos.map((repo) => {
                      const isSelected = selectedRepoForInvite?.repositoryId === repo.repositoryId;
                      return (
                        <button
                          key={repo.repositoryId}
                          type="button"
                          onClick={() => loadRepoContributorsAndInvites(inviteCompany, repo)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 border ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                              : "bg-card text-foreground border-border hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <GitBranch size={13} />
                          <span>{repo.repositoryName}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? "bg-indigo-700 text-indigo-100" : "bg-muted text-muted-foreground"}`}>
                            {repo.defaultBranch}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contributors Section */}
              {selectedRepoForInvite && (
                <div className="flex flex-col gap-3 pt-2 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span>GitHub Contributors ({repoContributorsList.length})</span>
                        {existingInvitations.length > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                            {existingInvitations.filter(i => i.status === "PENDING").length} Pending Invite(s)
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select contributors and enter their email address to send an invitation.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Filter contributor..."
                          value={contributorSearchQuery}
                          onChange={(e) => setContributorSearchQuery(e.target.value)}
                          className="pl-8 pr-2.5 py-1.5 rounded-lg border border-border text-xs outline-none focus:border-indigo-600 w-44"
                        />
                      </div>
                      {repoContributorsList.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllContributors}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          {repoContributorsList.every((c) => c.login in selectedContributorsForInvite)
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contributors List */}
                  {loadingRepoContributors ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-2xl">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Fetching contributors from GitHub repository...</span>
                    </div>
                  ) : repoContributorsList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-border text-xs text-muted-foreground">
                      No public contributors found for this repository on GitHub.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
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
                              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                                isSelected
                                  ? "border-emerald-400 bg-emerald-50/20 shadow-sm"
                                  : pendingInvite
                                  ? "border-amber-200 bg-amber-50/30"
                                  : "border-border bg-card hover:border-slate-300"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                {/* Left: Contributor Info */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleInviteContributor(contrib.login)}
                                    disabled={!!pendingInvite}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  />
                                  <img
                                    src={contrib.avatar_url}
                                    alt={contrib.login}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={contrib.html_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold text-xs text-foreground hover:underline flex items-center gap-1 truncate"
                                      >
                                        @{contrib.login} <ExternalLink size={10} className="text-muted-foreground" />
                                      </a>
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700">
                                        {contrib.contributions} commits
                                      </span>
                                    </div>
                                    {pendingInvite && (
                                      <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                                        <Clock size={11} /> Invitation sent to <code>{pendingInvite.email}</code> (Status: Pending)
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Right: Email Input (if selected) or Pending Badge */}
                                {pendingInvite ? (
                                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 self-start sm:self-center shrink-0">
                                    <Clock size={12} /> Pending Invite
                                  </span>
                                ) : isSelected ? (
                                  <div className="flex items-center gap-2 flex-1 max-w-sm sm:ml-4">
                                    <div className="relative flex-1">
                                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                      <input
                                        type="email"
                                        placeholder={`Enter ${contrib.login}'s email`}
                                        value={currentEmail}
                                        onChange={(e) => handleEmailChange(contrib.login, e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-emerald-300 text-xs outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-white"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toggleInviteContributor(contrib.login)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-white text-muted-foreground hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center gap-1.5 self-start sm:self-center shrink-0"
                                  >
                                    <Plus size={12} /> Select
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback messages */}
              {inviteError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              {inviteSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{inviteSuccess}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {Object.keys(selectedContributorsForInvite).length > 0 ? (
                  <span className="font-semibold text-emerald-700">
                    {Object.keys(selectedContributorsForInvite).length} contributor(s) selected
                  </span>
                ) : (
                  <span>Select contributors above to send invitations</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInviteCompany(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-white text-muted-foreground hover:text-foreground hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSendInvitationsSubmit}
                  disabled={
                    sendingInvitations ||
                    !selectedRepoForInvite ||
                    Object.keys(selectedContributorsForInvite).length === 0
                  }
                  className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl text-white transition-all disabled:opacity-50 shadow-sm"
                  style={{ background: "#059669" }}
                >
                  {sendingInvitations ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending Invitations & Emails...
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Send {Object.keys(selectedContributorsForInvite).length > 0 ? `${Object.keys(selectedContributorsForInvite).length} ` : ""}Invitation{Object.keys(selectedContributorsForInvite).length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL: COMPANY REPOSITORIES VIEWER (Assigned Repos for Members & Admins)
      ═══════════════════════════════════════════ */}
      {viewingCompanyRepos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md shrink-0"
                  style={{
                    background:
                      viewingAsRole === "member"
                        ? "linear-gradient(135deg, #10B981, #059669)"
                        : "linear-gradient(135deg, #4361EE, #7C3AED)",
                  }}
                >
                  {viewingCompanyRepos.companyName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {viewingCompanyRepos.companyName}
                    </h2>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: viewingAsRole === "member" ? "#D1FAE5" : "#EEF2FF",
                        color: viewingAsRole === "member" ? "#065F46" : "#4361EE",
                      }}
                    >
                      {viewingAsRole === "member" ? "Assigned Member" : "Super Admin"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {viewingAsRole === "member"
                      ? "Repositories assigned to you by the organization administrator."
                      : "All repositories connected to this organization."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingCompanyRepos(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingActiveCompanyRepos ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span className="text-sm text-muted-foreground">
                    Loading your accessible repositories...
                  </span>
                </div>
              ) : activeCompanyRepos.length === 0 ? (
                <div className="p-10 rounded-2xl bg-muted/40 border border-border text-center">
                  <GitBranch size={28} className="mx-auto mb-2 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    No repositories assigned yet
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {viewingAsRole === "member"
                      ? "You do not have any repositories assigned to you in this company yet. Ask your Super Admin to assign repositories."
                      : "No repositories have been imported into this company yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                    <span>{activeCompanyRepos.length} accessible repository{activeCompanyRepos.length !== 1 ? "s" : ""}</span>
                    <span>Action</span>
                  </div>

                  {activeCompanyRepos.map((repo) => (
                    <div
                      key={repo.repositoryId}
                      className="p-4 rounded-2xl border border-border bg-card hover:border-emerald-300 hover:shadow-sm transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background:
                              viewingAsRole === "member" ? "#ECFDF5" : "#EEF2FF",
                            color:
                              viewingAsRole === "member" ? "#10B981" : "#4361EE",
                          }}
                        >
                          <GitBranch size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground truncate">
                              {repo.repositoryName}
                            </span>
                            {repo.defaultBranch && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                                {repo.defaultBranch}
                              </span>
                            )}
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background:
                                  viewingAsRole === "member" ? "#D1FAE5" : "#EEF2FF",
                                color:
                                  viewingAsRole === "member" ? "#065F46" : "#4361EE",
                              }}
                            >
                              {viewingAsRole === "member" ? "Assigned" : "Admin"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {repo.createdAt ? `Added ${new Date(repo.createdAt).toLocaleDateString()}` : "Active Repository"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {/* Analysis Status Badge */}
                        {analysisStatusMap[repo.repositoryId] && (
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border"
                            style={{
                              background:
                                analysisStatusMap[repo.repositoryId].status === "COMPLETED"
                                  ? "#ECFDF5"
                                  : analysisStatusMap[repo.repositoryId].status === "FAILED"
                                  ? "#FEF2F2"
                                  : "#EFF6FF",
                              borderColor:
                                analysisStatusMap[repo.repositoryId].status === "COMPLETED"
                                  ? "#A7F3D0"
                                  : analysisStatusMap[repo.repositoryId].status === "FAILED"
                                  ? "#FECACA"
                                  : "#BFDBFE",
                              color:
                                analysisStatusMap[repo.repositoryId].status === "COMPLETED"
                                  ? "#059669"
                                  : analysisStatusMap[repo.repositoryId].status === "FAILED"
                                  ? "#DC2626"
                                  : "#2563EB",
                            }}
                          >
                            {analysisStatusMap[repo.repositoryId].status === "COMPLETED" ? (
                              <CheckCircle2 size={12} className="text-emerald-600" />
                            ) : analysisStatusMap[repo.repositoryId].status === "FAILED" ? (
                              <AlertCircle size={12} className="text-red-600" />
                            ) : (
                              <Loader2 size={12} className="animate-spin text-blue-600" />
                            )}
                            <span>
                              {analysisStatusMap[repo.repositoryId].status === "COMPLETED"
                                ? `Analyzed (${analysisStatusMap[repo.repositoryId].totalClasses ?? 0} classes)`
                                : analysisStatusMap[repo.repositoryId].status === "FAILED"
                                ? "Analysis Failed"
                                : "Queued / Running..."}
                            </span>
                          </div>
                        )}

                        {/* View Report & Recommendations Button (When Completed) */}
                        {analysisStatusMap[repo.repositoryId]?.status === "COMPLETED" && analysisStatusMap[repo.repositoryId]?.analysisId && (
                          <button
                            type="button"
                            onClick={() => handleOpenReport(analysisStatusMap[repo.repositoryId].analysisId!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                            title="View Technical Debt Report & Prioritized Recommendations"
                          >
                            <Sparkles size={12} className="text-emerald-600" />
                            <span>View Recommendations</span>
                          </button>
                        )}

                        {/* Start Analysis Button */}
                        <button
                          type="button"
                          onClick={() => handleStartAnalysis(repo)}
                          disabled={analyzingRepoIds[repo.repositoryId]}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #4361EE, #7C3AED)" }}
                          title="Trigger code metrics & technical debt analysis"
                        >
                          {analyzingRepoIds[repo.repositoryId] ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              <span>Queueing...</span>
                            </>
                          ) : (
                            <>
                              <Play size={11} className="fill-current" />
                              <span>Start Analysis</span>
                            </>
                          )}
                        </button>

                        <a
                          href={repo.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                        >
                          GitHub <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Organization: @{viewingCompanyRepos.githubOrganizationName}
              </span>
              <button
                type="button"
                onClick={() => setViewingCompanyRepos(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-border text-foreground hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TECHNICAL DEBT REPORT & PRIORITIZED RECOMMENDATIONS MODAL ─────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {selectedReportAnalysisId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-border overflow-hidden flex flex-col my-8 max-h-[90vh]">

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
                  <Loader2 size={36} className="animate-spin text-indigo-600 mb-3" />
                  <p className="font-semibold text-foreground text-sm">Evaluating Technical Debt & Recommendations...</p>
                  <p className="text-xs text-muted-foreground mt-1">Aggregating 28 metrics, bug probabilities, and SATD comment classifications.</p>
                </div>
              )}

              {/* Error State */}
              {reportError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
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
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Overall Debt Score</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-foreground tracking-tight">
                          {activeReport.overallDebtScore}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                      <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, activeReport.overallDebtScore)}%`,
                            background:
                              activeReport.overallDebtScore < 25
                                ? "#10B981"
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
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Repository Health</span>
                      <div className="mt-2">
                        <span
                          className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider inline-block"
                          style={{
                            background:
                              activeReport.overallHealthScore === "EXCELLENT"
                                ? "#D1FAE5"
                                : activeReport.overallHealthScore === "GOOD"
                                ? "#DBEAFE"
                                : activeReport.overallHealthScore === "FAIR"
                                ? "#FEF3C7"
                                : "#FEE2E2",
                            color:
                              activeReport.overallHealthScore === "EXCELLENT"
                                ? "#065F46"
                                : activeReport.overallHealthScore === "GOOD"
                                ? "#1E40AF"
                                : activeReport.overallHealthScore === "FAIR"
                                ? "#92400E"
                                : "#991B1B",
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
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
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
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Admitted Technical Debt</span>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">
                          {activeReport.totalSatdComments}
                        </span>
                        <span className="text-xs text-muted-foreground">SATD comments</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 text-amber-700">
                        <Tag size={12} /> TODO/FIXME annotations
                      </span>
                    </div>
                  </div>

                  {/* Section Title & Filter Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div>
                      <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-600" />
                        Classes to Refactor First
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Ranked from highest technical debt & risk to lowest. Address top-ranked classes first to maximize code maintainability.
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSelectedClassFilter("ALL")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedClassFilter === "ALL"
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All ({activeReport.prioritizedRefactoringList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedClassFilter("CRITICAL")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedClassFilter === "CRITICAL"
                            ? "bg-red-50 text-red-700 shadow-sm"
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
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedClassFilter === "HIGH"
                            ? "bg-amber-50 text-amber-700 shadow-sm"
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
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Rank & Class Info */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Priority Rank Badge */}
                            <div
                              className="w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs"
                              style={{
                                background:
                                  cls.refactorPriorityRank === 1
                                    ? "#FEE2E2"
                                    : cls.refactorPriorityRank <= 3
                                    ? "#FEF3C7"
                                    : "#F1F5F9",
                                color:
                                  cls.refactorPriorityRank === 1
                                    ? "#991B1B"
                                    : cls.refactorPriorityRank <= 3
                                    ? "#92400E"
                                    : "#475569",
                              }}
                            >
                              #{cls.refactorPriorityRank}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-extrabold text-base text-foreground tracking-tight">
                                  {cls.className}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                                  {cls.numberOfLinesOfCode} LOC
                                </span>
                              </div>

                              {/* Highlighted File Path Location */}
                              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-semibold shadow-xs">
                                  <FileCode size={13} className="text-indigo-600 shrink-0" />
                                  <span className="font-mono tracking-tight">
                                    {cls.filePath
                                      ? cls.filePath.replace(/\\/g, "/").split(/analysis-repository-[^/]+\//)[1] ||
                                        cls.filePath.split("/").slice(-2).join("/") ||
                                        cls.filePath
                                      : "source file"}
                                  </span>
                                  <span className="text-indigo-500 font-medium text-[11px]">
                                    (lines {cls.startLine}–{cls.endLine})
                                  </span>
                                </div>

                                {cls.primaryDrivers && cls.primaryDrivers.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {cls.primaryDrivers.map((driver, dIdx) => (
                                      <span
                                        key={dIdx}
                                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200"
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
                            <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-center min-w-[90px]">
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
                                    ? "#FEE2E2"
                                    : cls.riskLevel === "HIGH"
                                    ? "#FEF3C7"
                                    : "#DBEAFE",
                                color:
                                  cls.riskLevel === "CRITICAL"
                                    ? "#991B1B"
                                    : cls.riskLevel === "HIGH"
                                    ? "#92400E"
                                    : "#1E40AF",
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
                                    ? "#991B1B"
                                    : cls.technicalDebtScore >= 50
                                    ? "#D97706"
                                    : cls.technicalDebtScore >= 25
                                    ? "#2563EB"
                                    : "#059669",
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
            <div className="px-6 py-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Technical Debt Analytics Engine • Continuous Code Health
              </span>
              <button
                type="button"
                onClick={() => setSelectedReportAnalysisId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-border text-foreground hover:bg-slate-100 transition-colors"
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
