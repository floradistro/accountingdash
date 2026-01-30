'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { PeriodComparison } from '@/lib/analytics/comparisons'
import { formatCurrency } from '@/lib/utils'

interface ComparisonCardProps {
  comparison: PeriodComparison
  compact?: boolean
}

export function ComparisonCard({ comparison, compact = false }: ComparisonCardProps) {
  const { metric, current, previous, comparison: comp } = comparison

  const getColor = () => {
    if (comp.direction === 'up') return '#59C76F'
    if (comp.direction === 'down') return '#F36368'
    return '#737373'
  }

  const getIcon = () => {
    if (comp.direction === 'up') return ArrowUp
    if (comp.direction === 'down') return ArrowDown
    return Minus
  }

  const Icon = getIcon()
  const color = getColor()

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: `${color}10`,
          border: `1px solid ${color}20`,
        }}
      >
        <Icon size={12} style={{ color }} />
        <span style={{ fontSize: '11px', fontWeight: 500, color }}>
          {comp.changePercent > 0 ? '+' : ''}
          {comp.changePercent.toFixed(1)}%
        </span>
        <span style={{ fontSize: '10px', color: '#737373' }}>vs {metric.toLowerCase()}</span>
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#0f0f0f',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', color: '#737373', fontWeight: 500, textTransform: 'uppercase' }}>
          {metric}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '4px',
            background: `${color}15`,
          }}
        >
          <Icon size={14} style={{ color }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color }}>
            {comp.changePercent > 0 ? '+' : ''}
            {comp.changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', color: '#525252', marginBottom: '4px' }}>Current</p>
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(current.value)}
          </p>
          <p style={{ fontSize: '10px', color: '#404040', marginTop: '2px' }}>{current.period}</p>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', color: '#525252', marginBottom: '4px' }}>Previous</p>
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#737373', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(previous.value)}
          </p>
          <p style={{ fontSize: '10px', color: '#404040', marginTop: '2px' }}>{previous.period}</p>
        </div>
      </div>

      {comp.isSignificant && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            borderRadius: '4px',
            background: `${color}08`,
            border: `1px solid ${color}15`,
          }}
        >
          <p style={{ fontSize: '11px', color: '#a3a3a3' }}>
            {comp.direction === 'up' ? '📈' : '📉'} Significant {comp.direction === 'up' ? 'growth' : 'decline'} of{' '}
            {formatCurrency(Math.abs(comp.change))}
          </p>
        </div>
      )}
    </div>
  )
}
