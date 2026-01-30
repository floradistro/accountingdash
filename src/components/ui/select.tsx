'use client'

import { ChevronDown } from 'lucide-react'

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ value, onChange, options, placeholder }: SelectProps) {
  return (
    <div style={{ position: 'relative', width: '192px' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: 'none',
          width: '100%',
          padding: '10px 40px 10px 16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#fafafa',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ background: '#18181b' }}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#71717a', pointerEvents: 'none' }} />
    </div>
  )
}
