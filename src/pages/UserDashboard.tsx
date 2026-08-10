import { useState } from "react";
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
  Star,
  MoreHorizontal,
  ExternalLink,
  Shield,
  UserCheck,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function App() {
  const { user: authUser, logout } = useAuth0();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "admin" | "member">("all");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const user = {
    name: authUser?.name ?? authUser?.nickname ?? "User",
    email: authUser?.email ?? "",
    avatar:
      authUser?.picture ? "" : (authUser?.name ?? authUser?.nickname ?? "User").slice(0, 2).toUpperCase(),
    role: authUser?.email ? authUser.email : "Authenticated account",
  };

  const adminCompanies = [
    { id: 1, name: "Acme Corp", industry: "Software", members: 24, repos: 18, debtScore: 72, status: "active", color: "#4361EE", initials: "AC", lastActivity: "2 hrs ago", plan: "Enterprise" },
    { id: 2, name: "BuildStack Inc", industry: "DevTools", members: 11, repos: 9, debtScore: 88, status: "active", color: "#10B981", initials: "BS", lastActivity: "5 hrs ago", plan: "Pro" },
    { id: 3, name: "NovaSystems", industry: "Fintech", members: 38, repos: 31, debtScore: 54, status: "warning", color: "#F59E0B", initials: "NS", lastActivity: "1 day ago", plan: "Enterprise" },
  ];

  const memberCompanies = [
    { id: 4, name: "CloudPeak Labs", industry: "Cloud", members: 55, repos: 44, debtScore: 91, status: "active", color: "#8B5CF6", initials: "CP", lastActivity: "30 min ago", memberRole: "Contributor" },
    { id: 5, name: "DataForge", industry: "Analytics", members: 17, repos: 12, debtScore: 67, status: "active", color: "#EF4444", initials: "DF", lastActivity: "3 hrs ago", memberRole: "Reviewer" },
    { id: 6, name: "Itereon", industry: "Consulting", members: 9, repos: 7, debtScore: 79, status: "active", color: "#14B8A6", initials: "IT", lastActivity: "2 days ago", memberRole: "Developer" },
    { id: 7, name: "Patchwork AI", industry: "AI/ML", members: 22, repos: 15, debtScore: 83, status: "active", color: "#F97316", initials: "PA", lastActivity: "6 hrs ago", memberRole: "Contributor" },
  ];

  const filteredAdmin = adminCompanies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMember = memberCompanies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRepos = [...adminCompanies, ...memberCompanies].reduce((s, c) => s + c.repos, 0);
  const totalActive = [...adminCompanies, ...memberCompanies].filter((c) => c.status === "active").length;

  return (
    <div className="min-h-screen" style={{ background: "#F4F5F7", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#4361EE" }}>
              <Search size={16} className="text-white" />
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">My Companies</h1>
          <p className="text-sm text-muted-foreground">Manage organizations you administer and teams you belong to.</p>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EEF2FF" }}>
              <Shield size={18} style={{ color: "#4361EE" }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{adminCompanies.length}</p>
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
              <p className="text-2xl font-bold text-foreground leading-none">{totalActive}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Now</p>
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
                    <p className="text-xs text-muted-foreground">{filteredAdmin.length} organization{filteredAdmin.length !== 1 ? "s" : ""} you manage</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "#4361EE" }}>
                  <Building2 size={12} />
                  New Org
                </button>
              </div>

              <div className="h-0.5 rounded-full mb-5" style={{ background: "linear-gradient(to right, #4361EE, #7C3AED, transparent)" }} />

              {filteredAdmin.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center">
                  <Crown size={28} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No admin companies found</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredAdmin.map((company) => (
                    <div
                      key={company.id}
                      onMouseEnter={() => setHoveredCard(company.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200"
                      style={{
                        boxShadow: hoveredCard === company.id ? "0 8px 30px rgba(67,97,238,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
                        transform: hoveredCard === company.id ? "translateY(-2px)" : "translateY(0)",
                      }}
                    >
                      {/* Card Top */}
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
                        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                          <MoreHorizontal size={15} />
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#EEF2FF", color: "#4361EE" }}>
                          <Crown size={10} />
                          Admin
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: company.plan === "Enterprise" ? "#F3F0FF" : "#EFF6FF", color: company.plan === "Enterprise" ? "#7C3AED" : "#2563EB" }}>
                          <Star size={9} />
                          {company.plan}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground leading-tight">{company.members}</p>
                          <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground leading-tight">{company.repos}</p>
                          <p className="text-xs text-muted-foreground">Repos</p>
                        </div>
                        <div className="text-center">
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              color: company.debtScore >= 80 ? "#10B981" : company.debtScore >= 60 ? "#F59E0B" : "#EF4444",
                              background: company.debtScore >= 80 ? "#D1FAE5" : company.debtScore >= 60 ? "#FEF3C7" : "#FEE2E2",
                            }}
                          >
                            <TrendingUp size={10} />
                            {company.debtScore}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">Debt Score</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{
                              background: company.status === "active" ? "#10B981" : "#F59E0B",
                              boxShadow: company.status === "active" ? "0 0 0 3px #D1FAE5" : "0 0 0 3px #FEF3C7",
                            }}
                          />
                          <span className="text-xs text-muted-foreground">{company.lastActivity}</span>
                        </div>
                        <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#4361EE" }}>
                          Manage <ChevronRight size={12} />
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
                <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors" style={{ color: "#374151" }}>
                  Browse Orgs <ChevronRight size={12} />
                </button>
              </div>

              <div className="h-0.5 rounded-full mb-5" style={{ background: "linear-gradient(to right, #10B981, #06B6D4, transparent)" }} />

              {filteredMember.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center">
                  <Users size={28} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No member companies found</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredMember.map((company) => (
                    <div
                      key={company.id}
                      onMouseEnter={() => setHoveredCard(company.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="bg-card rounded-2xl border border-border p-6 cursor-pointer transition-all duration-200"
                      style={{
                        boxShadow: hoveredCard === company.id ? "0 8px 30px rgba(16,185,129,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
                        transform: hoveredCard === company.id ? "translateY(-2px)" : "translateY(0)",
                      }}
                    >
                      {/* Card Top */}
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
                        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                          <MoreHorizontal size={15} />
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#D1FAE5", color: "#065F46" }}>
                          <UserCheck size={10} />
                          {company.memberRole}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground leading-tight">{company.members}</p>
                          <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground leading-tight">{company.repos}</p>
                          <p className="text-xs text-muted-foreground">Repos</p>
                        </div>
                        <div className="text-center">
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              color: company.debtScore >= 80 ? "#10B981" : company.debtScore >= 60 ? "#F59E0B" : "#EF4444",
                              background: company.debtScore >= 80 ? "#D1FAE5" : company.debtScore >= 60 ? "#FEF3C7" : "#FEE2E2",
                            }}
                          >
                            <TrendingUp size={10} />
                            {company.debtScore}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">Debt Score</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{
                              background: company.status === "active" ? "#10B981" : "#F59E0B",
                              boxShadow: company.status === "active" ? "0 0 0 3px #D1FAE5" : "0 0 0 3px #FEF3C7",
                            }}
                          />
                          <span className="text-xs text-muted-foreground">{company.lastActivity}</span>
                        </div>
                        <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#4361EE" }}>
                          View <ExternalLink size={11} />
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
    </div>
  );
}
