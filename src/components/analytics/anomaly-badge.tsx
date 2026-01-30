'use client'

import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { Anomaly } from '@/lib/analytics/anomaly-detection'

interface AnomalyBadgeProps {
  anomaly: Anomaly
  showDetails?: boolean
}

export function AnomalyBadge({ anomaly, showDetails = false }: AnomalyBadgeProps) {
  const getColor = () => {
    if (anomaly.severity === 'critical') return '#F36368'
    if (anomaly.severity === 'warning') return '#F2C749'
    return '#56ADFF'
  }

  const getIcon = () => {
    if (anomaly.severity === 'critical') return AlertTriangle
    if (anomaly.severity === 'warning') return AlertCircle
    return Info
  }

  const Icon = getIcon()
  const color = getColor()

  return (
    <div
      role="alert"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '6px',
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon size={14} style={{ color }} />
      <span
        style={{
          fontSize: '11px',
          fontWeight: 500,
          color,
          textTransform: 'uppercase',
        }}
      >
        {anomaly.severity}
      </span>
      {showDetails && (
        <span style={{ fontSize: '10px', color: '#737373' }}>
          ({anomaly.deviation.toFixed(1)}σ)
        </span>
      )}
    </div>
  )
}

interface AnomalyAlertProps {
  anomalies: Anomaly[]
  dataValues: number[]
}

export function AnomalyAlert({ anomalies, dataValues }: AnomalyAlertProps) {
  if (anomalies.length === 0) return null

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length
  const warningCount = anomalies.filter((a) => a.severity === 'warning').length

  return (
    <div
      style={{
        background: '#0f0f0f',
        border: '1px solid rgba(255,100,100,0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <AlertTriangle size={16} style={{ color: '#F36368' }} />
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5' }}>
          Anomalies Detected
        </span>
      </div>
      <p style={{ fontSize: '12px', color: '#a3a3a3', marginBottom: '8px' }}>
        Found {anomalies.length} unusual data point{anomalies.length > 1 ? 's' : ''} out of{' '}
        {dataValues.length} total
        {criticalCount > 0 && ` (${criticalCount} critical)`}
        {warningCount > 0 && ` (${warningCount} warnings)`}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {anomalies.slice(0, 5).map((anomaly, idx) => (
          <AnomalyBadge key={idx} anomaly={anomaly} showDetails />
        ))}
        {anomalies.length > 5 && (
          <span style={{ fontSize: '11px', color: '#737373', padding: '6px 10px' }}>
            +{anomalies.length - 5} more
          </span>
        )}
      </div>
    </div>
  )
}
