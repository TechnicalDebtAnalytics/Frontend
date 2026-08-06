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
  primaryColor = '#2563EB',
  primaryHover = '#1D4ED8',
  shadowColor = 'rgba(37,99,235,0.25)',
  fullWidth = true,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false)

  if (variant === 'secondary') {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: fullWidth ? '100%' : 'auto',
          height: '44px',
          background: hovered ? '#F9FAFB' : '#fff',
          color: '#374151',
          border: `1.5px solid ${hovered ? '#D1D5DB' : '#E5E7EB'}`,
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
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: '44px',
        background: (disabled || loading) ? '#C7D2FE' : hovered ? primaryHover : primaryColor,
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
            </path>
          </svg>
          {children}
        </>
      ) : children}
    </button>
  )
}
