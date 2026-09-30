import { useState } from 'react'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary'
  primaryColor?: string
  primaryHover?: string
  shadowColor?: string
  fullWidth?: boolean
}

export default function Button({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  primaryColor = '#196BDF',
  primaryHover = '#2B7AE9',
  shadowColor = 'rgba(37,99,235,0.25)',
  fullWidth = true,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false)

  if (variant === 'secondary') {
    return (
      <button
        className="dl-button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: fullWidth ? '100%' : 'auto',
          height: '50px',
          background: hovered ? 'var(--dl-raised)' : 'var(--dl-surface)',
          color: 'var(--dl-text)',
          border: `1px solid ${hovered ? 'var(--dl-accent)' : 'var(--dl-border)'}`,
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.15s ease',
          boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
          fontFamily: 'Inter, sans-serif',
          padding: '0 20px',
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className="dl-button"
      onClick={onClick}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: '50px',
        background: (disabled || loading) ? '#29466C' : hovered ? primaryHover : primaryColor,
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.15s ease',
        transform: hovered && !disabled && !loading ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered && !disabled && !loading
          ? `0 6px 20px ${shadowColor.replace('0.25', '0.4')}`
          : `0 2px 8px ${shadowColor}`,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.01em',
        padding: '0 20px',
      }}
    >
      {loading ? (
        <>
          <svg className="dl-spinner" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
            </path>
          </svg>
          {children}
        </>
      ) : children}
    </button>
  )
}
