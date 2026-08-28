import { useState } from 'react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Logo from '../components/common/Logo'

const PRIMARY = '#4F46E5'
const PRIMARY_HOVER = '#4338CA'
const SHADOW = 'rgba(79,70,229,0.25)'

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

function GithubIcon() {
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function UserIcon() {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CodeWidget() {
  const lines = [
    { indent: 0, color: '#C084FC', text: 'class', rest: ' DebtAnalyzer {' },
    { indent: 1, color: '#67E8F9', text: 'async', rest: ' analyze(repo) {' },
    { indent: 2, color: '#86EFAC', text: 'const', rest: ' debt = await' },
    { indent: 2, color: '#FCA5A5', text: 'ai', rest: '.detectIssues(repo)' },
    { indent: 2, color: '#86EFAC', text: 'return', rest: ' debt.score' },
    { indent: 1, color: 'rgba(255,255,255,0.3)', text: '}', rest: '' },
    { indent: 0, color: 'rgba(255,255,255,0.3)', text: '}', rest: '' },
  ]

  return (
    <div
      style={{
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
      }}
    >
      <div
        style={{
          background: 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '20px 24px',
          minWidth: '280px',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '16px',
          }}
        >
          {['#F87171', '#FBBF24', '#34D399'].map((c) => (
            <div
              key={c}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: c,
              }}
            />
          ))}

          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '11px',
              marginLeft: '8px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            debt-analyzer.ts
          </span>
        </div>

        {lines.map((line, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '3px',
              paddingLeft: `${line.indent * 16}px`,
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.2)',
                fontSize: '11px',
                minWidth: '16px',
                textAlign: 'right',
                marginRight: '8px',
              }}
            >
              {index + 1}
            </span>

            <span
              style={{
                color: line.color,
                fontSize: '12px',
              }}
            >
              {line.text}
            </span>

            <span
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '12px',
              }}
            >
              {line.rest}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsWidget() {
  const bars = [65, 82, 48, 91, 73, 56, 88]
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div
      style={{
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '16px',
          padding: '20px 24px',
          minWidth: '240px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div>
            <div
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '11px',
                marginBottom: '4px',
              }}
            >
              Debt Resolved
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              247{' '}
              <span
                style={{
                  color: '#86EFAC',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                ↑ 18%
              </span>
            </div>
          </div>

          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(134,239,172,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#86EFAC"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            height: '56px',
          }}
        >
          {bars.map((height, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${height * 0.56}px`,
                  background:
                    index === 4
                      ? '#A78BFA'
                      : 'rgba(255,255,255,0.2)',
                  borderRadius: '4px 4px 0 0',
                }}
              />

              <span
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '9px',
                }}
              >
                {days[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AIBadgeWidget() {
  return (
    <div
      style={{
        filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.2))',
      }}
    >
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.4))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '220px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
          </svg>
        </div>

        <div>
          <div
            style={{
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            AI Insight Ready
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '11px',
            }}
          >
            3 refactoring suggestions
          </div>
        </div>
      </div>
    </div>
  )
}

function LeftPanel() {
  const features = [
    'AI Technical Debt Analysis',
    'Repository Insights',
    'Smart Refactoring Suggestions',
  ]

  return (
    <div
      style={{
        flex: 1,
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 45%, #7C3AED 80%, #6D28D9 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '540px',
        }}
      >
        <div style={{ marginBottom: '44px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '100px',
              padding: '6px 16px 6px 10px',
            }}
          >
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Logo color={PRIMARY} size={13} />
            </div>

            <span
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              DebtLens
            </span>
          </div>
        </div>

        <h1
          style={{
            color: '#fff',
            fontSize: '38px',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '16px',
          }}
        >
          Build Better Software
          <br />
          <span style={{ color: '#C4B5FD' }}>with AI</span>
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '15px',
            lineHeight: 1.7,
            marginBottom: '36px',
            maxWidth: '420px',
          }}
        >
          Create your account and start analyzing technical debt,
          code quality, and engineering insights.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '44px',
          }}
        >
          {features.map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(134,239,172,0.2)',
                  border: '1px solid rgba(134,239,172,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✓
              </div>

              <span
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <CodeWidget />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              paddingTop: '24px',
            }}
          >
            <AnalyticsWidget />
            <AIBadgeWidget />
          </div>
        </div>
      </div>
    </div>
  )
}

function RightPanel({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordMismatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword

  const handleCreate = async () => {
    if (
      !agreed ||
      passwordMismatch ||
      loading ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !githubUsername.trim() ||
      !password
    ) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/registration/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            githubUsername: githubUsername.trim(),
            password: password,
            role: 'MEMBER',
          }),
        }
      )

      const responseText = await response.text()

      let data: any = {}

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {}
      } catch {
        data = {
          message: responseText,
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Registration failed (${response.status})`
        )
      }

      console.log('Registration successful')
      console.log('Backend response:', data)
      console.log('Auth0 User ID:', data.auth0UserId)

      /*
       * Registration has now completed successfully.
       *
       * The backend has:
       * 1. Created the user in Auth0.
       * 2. Created/saved the user in PostgreSQL.
       *
       * We DO NOT call loginWithRedirect() here.
       */

      setSuccess(
        'Registration successful! Redirecting to login...'
      )

      /*
       * Give the user a moment to see the success message,
       * then navigate to our normal LoginPage.
       */
      setTimeout(() => {
        onNavigate('login')
      }, 1200)

    } catch (err) {
      console.error('Registration failed:', err)

      if (err instanceof TypeError) {
        setError(
          'Unable to connect to the backend. Make sure Spring Boot is running on http://localhost:8080.'
        )
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Registration failed'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        background: '#F8FAFC',
        minHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: PRIMARY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 4px 12px rgba(79,70,229,0.35)',
            }}
          >
            <Logo color="#fff" size={18} />
          </div>

          <span
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            DebtLens
          </span>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h2
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: '6px',
            }}
          >
            Create Account
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: 1.6,
            }}
          >
            Start your free workspace today.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px 32px',
            boxShadow:
              '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <Input
              label="First Name"
              placeholder="Alex"
              icon={<UserIcon />}
              value={firstName}
              onChange={setFirstName}
              primaryColor={PRIMARY}
            />

            <Input
              label="Last Name"
              placeholder="Johnson"
              icon={<UserIcon />}
              value={lastName}
              onChange={setLastName}
              primaryColor={PRIMARY}
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="alex@company.com"
              icon={<MailIcon />}
              value={email}
              onChange={setEmail}
              primaryColor={PRIMARY}
            />

            <Input
              label="GitHub Username"
              placeholder="octocat"
              icon={<GithubIcon />}
              value={githubUsername}
              onChange={setGithubUsername}
              primaryColor={PRIMARY}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              icon={<LockIcon />}
              value={password}
              onChange={setPassword}
              primaryColor={PRIMARY}
              rightElement={
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm your password"
              icon={<LockIcon />}
              value={confirmPassword}
              onChange={setConfirmPassword}
              primaryColor={
                passwordMismatch ? '#EF4444' : PRIMARY
              }
              rightElement={
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm((value) => !value)
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              }
            />

            {passwordMismatch && (
              <p
                style={{
                  marginTop: '-10px',
                  fontSize: '12px',
                  color: '#EF4444',
                }}
              >
                Passwords do not match.
              </p>
            )}

            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  fontSize: '13px',
                }}
              >
                {success}
              </div>
            )}

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) =>
                  setAgreed(event.target.checked)
                }
                style={{
                  marginTop: '3px',
                }}
              />

              <span
                style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  lineHeight: 1.5,
                }}
              >
                I agree to the Terms of Service and Privacy Policy.
              </span>
            </label>

            <Button
              onClick={handleCreate}
              loading={loading}
              disabled={
                !agreed ||
                passwordMismatch ||
                loading ||
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim() ||
                !githubUsername.trim() ||
                !password
              }
              primaryColor={PRIMARY}
              primaryHover={PRIMARY_HOVER}
              shadowColor={SHADOW}
            >
              Create Account
            </Button>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '13px',
            color: '#9CA3AF',
          }}
        >
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              color: PRIMARY,
              padding: 0,
            }}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <style>{`
  frontend@0.0.0 build
> tsc -b && vite build

src/pages/UserDashboard.tsx:33:3 - error TS6133: 'FileText' is declared but its value is never read.

33   FileText,
     ~~~~~~~~

src/pages/UserDashboard.tsx:34:3 - error TS6133: 'AlertTriangle' is declared but its value is never read.

34   AlertTriangle,
     ~~~~~~~~~~~~~

src/pages/UserDashboard.tsx:38:3 - error TS6133: 'CheckCheck' is declared but its value is never read.

38   CheckCheck,
     ~~~~~~~~~~


Found 3 errors.

PS C:\Users\Muditha\Documents\GitHub\Frontend>        @media (max-width: 900px) {
          .register-left {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="register-left"
        style={{
          flex: '0 0 55%',
          minWidth: 0,
          display: 'flex',
        }}
      >
        <LeftPanel />
      </div>

      <div
        style={{
          flex: '0 0 45%',
          minWidth: 0,
          overflowY: 'auto',
        }}
      >
        <RightPanel onNavigate={onNavigate} />
      </div>
    </div>
  )
}