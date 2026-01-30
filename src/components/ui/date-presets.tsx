'use client'

const PRESET_RANGES = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: -1 },
  { label: 'Last month', days: -2 },
  { label: 'This year', days: -3 },
]

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getPresetRange(preset: typeof PRESET_RANGES[0]): { from: string; to: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (preset.days === 0) {
    return { from: formatDate(today), to: formatDate(today) }
  }

  if (preset.days === -1) {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: formatDate(from), to: formatDate(today) }
  }

  if (preset.days === -2) {
    const from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const to = new Date(today.getFullYear(), today.getMonth(), 0)
    return { from: formatDate(from), to: formatDate(to) }
  }

  if (preset.days === -3) {
    const from = new Date(today.getFullYear(), 0, 1)
    return { from: formatDate(from), to: formatDate(today) }
  }

  const from = new Date(today)
  from.setDate(from.getDate() - preset.days)
  return { from: formatDate(from), to: formatDate(today) }
}

interface DatePresetsProps {
  onPresetClick: (preset: typeof PRESET_RANGES[0]) => void
}

export function DatePresets({ onPresetClick }: DatePresetsProps) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      marginBottom: '12px',
      paddingBottom: '12px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {PRESET_RANGES.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onPresetClick(preset)}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: 'none',
            background: 'rgba(255,255,255,0.04)',
            color: '#737373',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
