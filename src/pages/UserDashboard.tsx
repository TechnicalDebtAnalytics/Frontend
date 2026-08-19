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
} from "lucide-react";

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

export default function UserDashboard() {
  const { user: authUser, logout, getAccessTokenSilently } = useAuth0();
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

  const user = {
    name: authUser?.name ?? authUser?.nickname ?? "User",
    email: authUser?.email ?? "",
    avatar:
      authUser?.picture ? "" : (authUser?.name ?? authUser?.nickname ?? "User").slice(0, 2).toUpperCase(),
    role: authUser?.email ? authUser.email : "Authenticated account",
  };

  // Static member companies placeholder for member orgs
  const memberCompanies = [
    { id: 101, name: "CloudPeak Labs", industry: "Cloud", members: 55, repos: 44, debtScore: 91, status: "active", color: "#8B5CF6", initials: "CP", lastActivity: "30 min ago", memberRole: "Contributor" },
    { id: 102, name: "DataForge", industry: "Analytics", members: 17, repos: 12, debtScore: 67, status: "active", color: "#EF4444", initials: "DF", lastActivity: "3 hrs ago", memberRole: "Reviewer" },
  ];

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

  useEffect(() => {
    fetchAdminCompanies();
  }, []);

  // Filtered lists
  const filteredAdmin = adminCompaniesList.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.githubOrganizationName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMember = memberCompanies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAdminRepos = adminCompaniesList.reduce((s, c) => s + (c.totalRepositories || 0), 0);
  const totalRepos = totalAdminRepos + memberCompanies.reduce((s, c) => s + c.repos, 0);

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

  // Step 1: Verify Org & Membership
  const handleVerifyOrg = async () => {
    if (!orgInput.trim()) {
      setOrgError("Please enter a GitHub organization name");
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
      const orgRes = await fetch(`http://localhost:8080/api/github/orgs/${orgInput.trim()}`, { headers });
      if (!orgRes.ok) {
        const errData = await orgRes.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub Organization '${orgInput.trim()}' not found`);
      }
      const orgData = await orgRes.json();

      // 2. Validate user membership in this org
      const memberRes = await fetch(
        `http://localhost:8080/api/github/orgs/${orgInput.trim()}/validate-my-membership`,
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
      setOrgError(err.message || "Failed to verify organization");
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
        setSelectedRepoIds(repos.map((r) => r.id));
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
    } else {
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
    } else {
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
              <p className="text-2xl font-bold text-foreground leading-none">{memberCompanies.length}</p>
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
              <p className="text-2xl font-bold text-foreground leading-none">{adminCompaniesList.length + memberCompanies.length}</p>
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
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          Created {new Date(company.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => openManageModal(company)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          style={{ color: "#4361EE" }}
                        >
                          Manage Repos <ChevronRight size={12} />
                        </button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMember.map((company) => (
                  <div
                    key={company.id}
                    className="bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: company.color }}>
                          {company.initials}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm leading-tight">{company.name}</h3>
                          <span className="text-xs text-muted-foreground">{company.industry}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#065F46" }}>
                        <UserCheck size={10} />
                        {company.memberRole}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{company.repos} Repos</span>
                      <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#10B981" }}>
                        View <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                      GitHub Organization Name
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Enter the name of the GitHub organization you want to register (e.g. <code>TechnicalDebtAnalytics</code>).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. TechnicalDebtAnalytics"
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
                            Verify Org
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
                                    {repo.language && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">
                                        {repo.language}
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
                                ) : (
                                  repo.language && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">
                                      {repo.language}
                                    </span>
                                  )
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

    </div>
  );
}
