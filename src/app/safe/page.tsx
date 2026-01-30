'use client'

import { useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useDashboardStore } from '@/stores/dashboard.store'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Vault } from 'lucide-react'

export default function SafeBalancesPage() {
  const pageSetup = usePageSetup()
  const { safeBalances, isLoading, fetchSafeBalances, getLocationName } = useDashboardStore()

  useEffect(() => {
    fetchSafeBalances(pageSetup.selectedStore === 'all' ? undefined : pageSetup.selectedStore)
  }, [fetchSafeBalances, pageSetup.selectedStore])

  const filteredSafeBalances = useMemo(() => {
    if (pageSetup.selectedLocation === 'all') return safeBalances
    return safeBalances.filter(s => s.location_id === pageSetup.selectedLocation)
  }, [safeBalances, pageSetup.selectedLocation])

  const metrics = useMemo(() => {
    const totalBalance = filteredSafeBalances.reduce((sum, s) => sum + Number(s.current_balance || 0), 0)
    const totalDrops = filteredSafeBalances.reduce((sum, s) => sum + Number(s.total_drops || 0), 0)
    const totalDropAmount = filteredSafeBalances.reduce((sum, s) => sum + Number(s.total_drop_amount || 0), 0)
    const avgDropAmount = totalDrops > 0 ? totalDropAmount / totalDrops : 0

    return { totalBalance, totalDrops, totalDropAmount, avgDropAmount }
  }, [filteredSafeBalances])

  return (
    <DashboardLayout {...pageSetup}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Safe Balances</h1>
        <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>POS safe balances and drop history</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <MetricCardSimple label="Total Balance" value={isLoading ? '—' : formatCurrency(metrics.totalBalance)} />
        <MetricCardSimple label="Total Drops" value={isLoading ? '—' : formatNumber(metrics.totalDrops)} />
        <MetricCardSimple label="Total Drop Amount" value={isLoading ? '—' : formatCurrency(metrics.totalDropAmount)} />
        <MetricCardSimple label="Avg Drop Amount" value={isLoading ? '—' : formatCurrency(metrics.avgDropAmount)} />
      </div>

      {/* Safe Cards */}
      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373' }}>Safes by Location</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {filteredSafeBalances.map((safe, i) => (
            <div
              key={safe.location_id || i}
              style={{
                padding: '24px',
                borderRadius: '14px',
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Vault style={{ width: 20, height: 20, color: '#525252' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#a3a3a3' }}>
                  {getLocationName(safe.location_id || '')}
                </span>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 600, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>
                {formatCurrency(Number(safe.current_balance || 0))}
              </p>
              <p style={{ fontSize: '13px', color: '#525252' }}>Current Balance</p>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#404040' }}>Drops</p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(Number(safe.total_drops || 0))}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: '#404040' }}>Total Dropped</p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#a3a3a3', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(Number(safe.total_drop_amount || 0))}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredSafeBalances.length === 0 && (
            <div style={{ gridColumn: 'span 3', padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#525252' }}>No safe balance data available</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
