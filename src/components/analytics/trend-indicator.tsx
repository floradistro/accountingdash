'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TrendResult } from '@/lib/analytics/trend-analysis'

interface TrendIndicatorProps {
  trend: TrendResult
  showDetails?: boolean
}

export function TrendIndicator({ trend, showDetails = false }: TrendIndicatorProps) {
  const getColor = () => {
    if (trend.direction === 'up') return '#59C76F'
    if (trend.direction === 'down') return '#F36368'
    return '#737373'
  }

  const getIcon = () => {
    if (trend.direction === 'up') return TrendingUp
    if (trend.direction === 'down') return TrendingDown
    return Minus
  }

  const Icon = getIcon()
  const color = getColor()

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '6px',
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon size={14} style={{ color }} />
      <span
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color,
          textTransform: 'capitalize',
        }}
      >
        {trend.strength} {trend.direction}
      </span>
      {showDetails && (
        <span
          style={{
            fontSize: '11px',
            color: '#737373',
            marginLeft: '4px',
          }}
        >
          ({trend.slope.toFixed(1)}%)
        </span>
      )}
    </div>
  )
}
