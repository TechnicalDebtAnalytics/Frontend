import { useId, useState } from 'react'

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
  primaryColor = '#65D8F5',
}: InputProps) {
  const inputId = useId()
  const [focused, setFocused] = useState(false)

  const focusRing = `color-mix(in srgb, ${primaryColor} 22%, transparent)`

  return (
    <div className="dl-field">
      <label htmlFor={inputId} style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--dl-text)',
        marginBottom: '9px',
        letterSpacing: '0.01em',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          color: focused ? primaryColor : 'var(--dl-text-subtle)',
          transition: 'color 0.15s ease',
          pointerEvents: 'none',
        }}>
          {icon}
        </div>
        <input
          id={inputId}
          className="dl-input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '50px',
            paddingLeft: '42px',
            paddingRight: rightElement ? '48px' : '14px',
            background: 'var(--dl-inset)',
            border: `1px solid ${focused ? primaryColor : 'var(--dl-border)'}`,
            borderRadius: '12px',
            fontSize: '14px',
            color: 'var(--dl-text)',
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
