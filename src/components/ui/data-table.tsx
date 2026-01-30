'use client'

import { motion } from 'framer-motion'

interface Column {
  header: string
  key: string
  align?: 'left' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
}

function SkeletonRow({ columns }: { columns: Column[] }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
      {columns.map((col, idx) => (
        <td
          key={idx}
          style={{
            padding: '16px 20px',
            textAlign: col.align || 'left',
          }}
        >
          <motion.div
            style={{
              height: '16px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%)',
              backgroundSize: '200% 100%',
              borderRadius: '4px',
              width: col.align === 'right' ? '80px' : idx === 0 ? '140px' : '100px',
              marginLeft: col.align === 'right' ? 'auto' : 0,
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </td>
      ))}
    </tr>
  )
}

export function DataTable({ columns, data, loading }: DataTableProps) {
  if (loading) {
    return (
      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '12px 20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#525252',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonRow key={idx} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '13px', color: '#525252', textAlign: 'center' }}>No data available</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 20px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#525252',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: idx < data.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none' }}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '16px 20px',
                    fontSize: '13px',
                    color: '#a3a3a3',
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
