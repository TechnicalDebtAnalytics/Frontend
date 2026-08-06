import { useState } from "react"
import Input from "../components/common/Input"
import Button from "../components/common/Button"
import Logo from "../components/common/Logo"

const PRIMARY = "#2563EB"
const PRIMARY_HOVER = "#1D4ED8"
const SHADOW = "rgba(37,99,235,0.25)"

// ── Icons ──────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}



// ── Left panel widgets ─────────────────────────────────────────────────────

function DebtScoreWidget() {
  return (
    <div
      className="float-b"
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "16px",
          padding: "20px 24px",
          minWidth: "220px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(251,191,36,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Technical Debt Score
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "36px",
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            72
          </span>
          <span style={{ color: "#FBBF24", fontSize: "14px", fontWeight: 600 }}>
            / 100
          </span>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "100px",
            height: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "72%",
              height: "100%",
              background: "linear-gradient(90deg, #FBBF24, #F97316)",
              borderRadius: "100px",
            }}
          />
        </div>
        <div
          style={{
            marginTop: "8px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "11px",
          }}
        >
          High priority — 14 issues detected
        </div>
      </div>
    </div>
  )
}

function CodeQualityWidget() {
  const metrics = [
    { label: "Maintainability", value: 84, color: "#34D399" },
    { label: "Test Coverage", value: 61, color: "#60A5FA" },
    { label: "Complexity", value: 43, color: "#F87171" },
  ]
  return (
    <div
      className="float-a"
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "16px",
          padding: "20px 24px",
          minWidth: "240px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(52,211,153,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34D399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Code Quality
          </span>
        </div>
        {metrics.map((m) => (
          <div key={m.label} style={{ marginBottom: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}
              >
                {m.label}
              </span>
              <span
                style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}
              >
                {m.value}%
              </span>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "100px",
                height: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${m.value}%`,
                  height: "100%",
                  background: m.color,
                  borderRadius: "100px",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIAnalysisWidget() {
  return (
    <div
      className="float-c"
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "16px",
          padding: "18px 22px",
          minWidth: "210px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(167,139,250,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A78BFA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2Z" />
            </svg>
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            AI Analysis
          </span>
          <span
            style={{
              marginLeft: "auto",
              background: "rgba(167,139,250,0.25)",
              color: "#A78BFA",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "100px",
            }}
          >
            LIVE
          </span>
        </div>
        {[
          "Refactor AuthService.ts — high complexity",
          "Add tests for PaymentModule",
          "Remove circular dependency in utils/",
        ].map((rec, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#A78BFA",
                marginTop: "5px",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "11px",
                lineHeight: 1.5,
              }}
            >
              {rec}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RepoWidget() {
  return (
    <div
      className="float-b"
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.2))" }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "14px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "200px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="rgba(255,255,255,0.9)"
          >
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
          </svg>
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>
            acme-corp/platform
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "11px",
              marginTop: "2px",
            }}
          >
            Last analyzed 2 hrs ago
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "2px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#34D399",
              boxShadow: "0 0 0 2px rgba(52,211,153,0.3)",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>
            Active
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Left panel ─────────────────────────────────────────────────────────────

function LeftPanel({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1E3A8A 0%, #2563EB 40%, #3B82F6 70%, #1D4ED8 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 48px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(96,165,250,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(30,58,138,0.5) 0%, transparent 50%), radial-gradient(ellipse at 60% 10%, rgba(167,139,250,0.15) 0%, transparent 40%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "540px",
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "100px",
              padding: "6px 16px 6px 10px",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Logo color={PRIMARY} size={13} />
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              DebtLens
            </span>
          </div>
        </div>

        <h1
          style={{
            color: "#fff",
            fontSize: "38px",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          AI-Powered Technical
          <br />
          <span style={{ color: "#93C5FD" }}>Debt Intelligence</span>
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "15px",
            lineHeight: 1.7,
            marginBottom: "52px",
            maxWidth: "420px",
          }}
        >
          Analyze repositories, predict defect-prone components,
          <br />
          and ship cleaner code with AI-guided recommendations.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <DebtScoreWidget />
            <RepoWidget />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              paddingTop: "32px",
            }}
          >
            <CodeQualityWidget />
            <AIAnalysisWidget />
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "32px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {[
            { value: "2,400+", label: "Repos Analyzed" },
            { value: "98%", label: "Detection Accuracy" },
            { value: "3.2x", label: "Faster Refactoring" },
          ].map((s) => (
            <div key={s.label}>
              <div
                style={{
                  color: "#fff",
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "12px",
                  marginTop: "2px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Right panel ────────────────────────────────────────────────────────────

function RightPanel({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignIn = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1800)
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}
          >
            <Logo color="#fff" size={18} />
          </div>
          <span
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            DebtLens
          </span>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Welcome back
          </h2>
          <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
            Sign in to access your Technical Debt
            <br />
            Analytics Dashboard.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "32px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              icon={<MailIcon />}
              value={email}
              onChange={setEmail}
              primaryColor={PRIMARY}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              icon={<LockIcon />}
              value={password}
              onChange={setPassword}
              primaryColor={PRIMARY}
              rightElement={
                <button
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9CA3AF",
                    padding: "4px",
                    display: "flex",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#9CA3AF")
                  }
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <div
                  onClick={() => setRememberMe((v) => !v)}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    border: `2px solid ${rememberMe ? PRIMARY : "#D1D5DB"}`,
                    background: rememberMe ? PRIMARY : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                  }}
                >
                  {rememberMe && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#6B7280",
                    fontWeight: 500,
                  }}
                >
                  Remember me
                </span>
              </label>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: PRIMARY,
                  padding: "0",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = PRIMARY_HOVER)
                }
                onMouseLeave={(e) => (e.currentTarget.style.color = PRIMARY)}
              >
                Forgot password?
              </button>
            </div>

            <Button
              onClick={handleSignIn}
              loading={loading}
              primaryColor={PRIMARY}
              primaryHover={PRIMARY_HOVER}
              shadowColor={SHADOW}
            >
              Sign In
            </Button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "2px 0",
              }}
            >
              
            </div>

            
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "13px",
            color: "#9CA3AF",
          }}
        >
          Don't have an account?{" "}
          <button
            onClick={() => onNavigate("register")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: PRIMARY,
              padding: "0",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.color = PRIMARY)}
          >
            Create Account
          </button>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "11px",
            color: "#D1D5DB",
            lineHeight: 1.6,
          }}
        >
          By signing in, you agree to our{" "}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              color: "#9CA3AF",
              fontFamily: "Inter, sans-serif",
              padding: 0,
            }}
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              color: "#9CA3AF",
              fontFamily: "Inter, sans-serif",
              padding: 0,
            }}
          >
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  )
}

// ── Page export ────────────────────────────────────────────────────────────

export default function LoginPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <style>{`
        @media (max-width: 900px) { .login-left { display: none !important; } }
      `}</style>
      <div
        className="login-left"
        style={{ flex: "0 0 55%", minWidth: 0, display: "flex" }}
      >
        <LeftPanel onNavigate={onNavigate} />
      </div>
      <div style={{ flex: "0 0 45%", minWidth: 0 }}>
        <RightPanel onNavigate={onNavigate} />
      </div>
    </div>
  )
}
