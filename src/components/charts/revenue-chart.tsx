'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface RevenueChartProps {
  data: {
    date: string
    revenue: number
    profit?: number
    orders?: number
  }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          padding: '10px 12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>
            {formatDateShort(label || '')}
          </p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginTop: index > 0 ? '4px' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: entry.color }} />
                <span style={{ fontSize: '12px', color: '#a1a1aa', textTransform: 'capitalize' }}>{entry.dataKey}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fafafa', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#737373" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#737373" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#525252" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#525252" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fill: '#52525b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`}
            tick={{ fill: '#52525b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#a3a3a3"
            strokeWidth={1.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 3, fill: '#e5e5e5', stroke: '#0f0f0f', strokeWidth: 2 }}
          />
          {data[0]?.profit !== undefined && (
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#525252"
              strokeWidth={1.5}
              fill="url(#profitGradient)"
              dot={false}
              activeDot={{ r: 3, fill: '#737373', stroke: '#0f0f0f', strokeWidth: 2 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
