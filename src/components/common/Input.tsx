import { useState } from 'react'

type InputProps = {
  label: string
  type?: string
  placeholder: string
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  rightElement?: React.ReactNode
  primaryColor?: string
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  rightElement,
  primaryColor = '#2563EB',
}: InputProps) {
  const [focused, setFocused] = useState(false)

  const focusRing = primaryColor === '#4F46E5'
    ? 'rgba(79,70,229,0.12)'
    : 'rgba(37,99,235,0.12)'

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '6px',
        letterSpacing: '0.01em',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          color: focused ? primaryColor : '#9CA3AF',
          transition: 'color 0.15s ease',
          pointerEvents: 'none',
        }}>
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '44px',
            paddingLeft: '42px',
            paddingRight: rightElement ? '48px' : '14px',
            background: '#fff',
            border: `1.5px solid ${focused ? primaryColor : '#E5E7EB'}`,
            borderRadius: '10px',
            fontSize: '14px',
            color: '#0F172A',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            boxShadow: focused
              ? `0 0 0 3px ${focusRing}`
              : '0 1px 2px rgba(0,0,0,0.04)',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        {rightElement && (
          <div style={{
            position: 'absolute', right: '14px', top: '50%',
            transform: 'translateY(-50%)',
          }}>
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}
