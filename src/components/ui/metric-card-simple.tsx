'use client'

import { motion } from 'framer-motion'

interface MetricCardSimpleProps {
  label: string
  value: string | number
  subtitle?: string
}

export function MetricCardSimple({ label, value, subtitle }: MetricCardSimpleProps) {
  return (
    <motion.div
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', cursor: 'default' }}
      whileHover={{
        scale: 1.02,
        borderColor: 'rgba(255,255,255,0.1)',
        transition: { duration: 0.2 }
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <p style={{ fontSize: '28px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums', marginTop: '8px', letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: '12px', color: '#404040', marginTop: '4px' }}>{subtitle}</p>
      )}
    </motion.div>
  )
}
