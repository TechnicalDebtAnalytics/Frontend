import { useState } from 'react'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Logo from '../components/common/Logo'

const PRIMARY = '#4F46E5'
const PRIMARY_HOVER = '#4338CA'
const SHADOW = 'rgba(79,70,229,0.25)'

// ── Icons ──────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ── Left panel illustration widgets ───────────────────────────────────────

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
    <div className="float-a" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}>
      <div style={{
        background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
        padding: '20px 24px', minWidth: '280px', fontFamily: 'monospace',
      }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {['#F87171', '#FBBF24', '#34D399'].map(c => (
            <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
          ))}
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginLeft: '8px', fontFamily: 'Inter, sans-serif' }}>debt-analyzer.ts</span>
        </div>
        {lines.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '3px', paddingLeft: `${l.indent * 16}px` }}>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', minWidth: '16px', textAlign: 'right', marginRight: '8px' }}>{i + 1}</span>
            <span style={{ color: l.color, fontSize: '12px' }}>{l.text}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{l.rest}</span>
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
    <div className="float-b" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))' }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)', borderRadius: '16px',
        padding: '20px 24px', minWidth: '240px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '4px' }}>Debt Resolved</div>
            <div style={{ color: '#fff', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              247 <span style={{ color: '#86EFAC', fontSize: '12px', fontWeight: 500 }}>↑ 18%</span>
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(134,239,172,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '56px' }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '100%', height: `${h * 0.56}px`, background: i === 4 ? '#A78BFA' : 'rgba(255,255,255,0.2)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AIBadgeWidget() {
  return (
    <div className="float-c" style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.2))' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.4))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(167,139,250,0.3)',
        borderRadius: '14px', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
        minWidth: '220px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" />
          </svg>
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>AI Insight Ready</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>3 refactoring suggestions</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A78BFA', animation: 'pulse-ring 1.5s ease-out infinite' }} />
        </div>
      </div>
    </div>
  )
}

function GitWidget() {
  const commits = [
    { hash: 'a3f2c1', msg: 'fix: reduce AuthService complexity', time: '2m ago', color: '#86EFAC' },
    { hash: 'b9e4d2', msg: 'refactor: extract PaymentUtils', time: '1h ago', color: '#67E8F9' },
    { hash: 'c1a8f3', msg: 'test: add coverage for UserModule', time: '3h ago', color: '#FCA5A5' },
  ]
  return (
    <div className="float-a" style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.2))' }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '18px 20px', minWidth: '260px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500 }}>Recent Commits</span>
          <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>main</span>
        </div>
        {commits.map(c => (
          <div key={c.hash} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px', fontFamily: 'monospace' }}>{c.hash}</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.msg}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', flexShrink: 0 }}>{c.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Left panel ─────────────────────────────────────────────────────────────

function LeftPanel() {
  const features = [
    'AI Technical Debt Analysis',
    'Repository Insights',
    'Smart Refactoring Suggestions',
  ]

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 45%, #7C3AED 80%, #6D28D9 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 48px',
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse at 15% 25%, rgba(124,58,237,0.35) 0%, transparent 50%), radial-gradient(ellipse at 85% 75%, rgba(30,27,75,0.6) 0%, transparent 50%), radial-gradient(ellipse at 70% 10%, rgba(6,182,212,0.12) 0%, transparent 40%)` }} />
      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '540px' }}>
        {/* Logo badge */}
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', padding: '6px 16px 6px 10px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Logo color={PRIMARY} size={13} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em' }}>DebtLens</span>
          </div>
        </div>

        <h1 style={{ color: '#fff', fontSize: '38px', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Build Better Software<br />
          <span style={{ color: '#C4B5FD' }}>with AI</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.7, marginBottom: '36px', maxWidth: '420px' }}>
          Create your organization account and start analyzing technical debt, code quality, and engineering insights.
        </p>

        {/* Feature highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '44px' }}>
          {features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(134,239,172,0.2)', border: '1px solid rgba(134,239,172,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Widget grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <CodeWidget />
            <GitWidget />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '24px' }}>
            <AnalyticsWidget />
            <AIBadgeWidget />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Right panel ────────────────────────────────────────────────────────────

function RightPanel({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [org, setOrg] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordMismatch = confirm.length > 0 && password !== confirm

  const handleCreate = () => {
    if (!agreed || passwordMismatch) return
    setLoading(true)
    setTimeout(() => setLoading(false), 1800)
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', background: '#F8FAFC', minHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '8px 0' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }}>
            <Logo color="#fff" size={18} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>DebtLens</span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>Create Account</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>Start your free workspace today.</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <Input label="Organization Name" placeholder="Acme Corp" icon={<BuildingIcon />} value={org} onChange={setOrg} primaryColor={PRIMARY} />
            <Input label="Full Name" placeholder="Alex Johnson" icon={<UserIcon />} value={name} onChange={setName} primaryColor={PRIMARY} />
            <Input label="Work Email" type="email" placeholder="alex@company.com" icon={<MailIcon />} value={email} onChange={setEmail} primaryColor={PRIMARY} />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              icon={<LockIcon />}
              value={password}
              onChange={setPassword}
              primaryColor={PRIMARY}
              rightElement={
                <button onClick={() => setShowPassword(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            <div>
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm your password"
                icon={<LockIcon />}
                value={confirm}
                onChange={setConfirm}
                primaryColor={passwordMismatch ? '#EF4444' : PRIMARY}
                rightElement={
                  <button onClick={() => setShowConfirm(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showConfirm} />
                  </button>
                }
              />
              {passwordMismatch && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <div onClick={() => setAgreed(v => !v)} style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${agreed ? PRIMARY : '#D1D5DB'}`, background: agreed ? PRIMARY : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0, marginTop: '1px' }}>
                {agreed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                I agree to the{' '}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: PRIMARY, padding: 0, fontFamily: 'Inter, sans-serif' }}>Terms of Service</button>
                {' '}and{' '}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: PRIMARY, padding: 0, fontFamily: 'Inter, sans-serif' }}>Privacy Policy</button>
              </span>
            </label>

            <Button
              onClick={handleCreate}
              loading={loading}
              disabled={!agreed || passwordMismatch}
              primaryColor={PRIMARY}
              primaryHover={PRIMARY_HOVER}
              shadowColor={SHADOW}
            >
              Create Account
            </Button>

           

            

          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#9CA3AF' }}>
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: PRIMARY, padding: '0', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.color = PRIMARY_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.color = PRIMARY)}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

// ── Page export ────────────────────────────────────────────────────────────

export default function RegisterPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <style>{`
        @media (max-width: 900px) { .register-left { display: none !important; } }
      `}</style>
      <div className="register-left" style={{ flex: '0 0 55%', minWidth: 0, display: 'flex' }}>
        <LeftPanel />
      </div>
      <div style={{ flex: '0 0 45%', minWidth: 0, overflowY: 'auto' }}>
        <RightPanel onNavigate={onNavigate} />
      </div>
    </div>
  )
}
