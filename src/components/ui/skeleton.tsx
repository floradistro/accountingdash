'use client'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', className, style }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div
      style={{
        background: '#0f0f0f',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <Skeleton width="60px" height="11px" />
      <Skeleton width="120px" height="28px" style={{ marginTop: '8px' }} />
      <Skeleton width="80px" height="12px" style={{ marginTop: '4px' }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${100 / columns}%`} height="11px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: '12px' }}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} width={`${100 / columns}%`} height="13px" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px 0' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          width={`${100 / 12}%`}
          height={`${Math.random() * 60 + 40}%`}
          borderRadius="4px 4px 0 0"
        />
      ))}
    </div>
  )
}

// Global keyframe animation - add to globals.css
export const skeletonStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`
