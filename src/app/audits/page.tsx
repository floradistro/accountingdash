'use client'

import { useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { AnimatedPage, AnimatedMetricCard, StaggerContainer, FadeIn } from '@/components/ui/animated'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useDashboardStore } from '@/stores/dashboard.store'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function AuditsPage() {
  const pageSetup = usePageSetup()
  const { auditSummary, isLoading, fetchAuditSummary, dateFrom, dateTo } = useDashboardStore()

  useEffect(() => {
    fetchAuditSummary(pageSetup.selectedStore === 'all' ? undefined : pageSetup.selectedStore)
  }, [fetchAuditSummary, pageSetup.selectedStore])

  const dateRangeLabel = dateFrom && dateTo
    ? `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Last 30 days'

  const metrics = useMemo(() => {
    const totalAudits = auditSummary.reduce((sum, a) => sum + Number(a.audit_count || 0), 0)
    const totalDiscrepancies = auditSummary.reduce((sum, a) => sum + Number(a.total_discrepancies || 0), 0)
    const totalVariance = auditSummary.reduce((sum, a) => sum + Number(a.total_variance_value || 0), 0)
    const discrepancyRate = totalAudits > 0 ? (totalDiscrepancies / totalAudits) * 100 : 0

    return { totalAudits, totalDiscrepancies, totalVariance, discrepancyRate, accuracyRate: 100 - discrepancyRate }
  }, [auditSummary])

  const auditHistory = useMemo(() => {
    const grouped: Record<string, { audits: number; discrepancies: number; variance: number }> = {}
    auditSummary.forEach(a => {
      if (!grouped[a.audit_date]) {
        grouped[a.audit_date] = { audits: 0, discrepancies: 0, variance: 0 }
      }
      grouped[a.audit_date].audits += Number(a.audit_count || 0)
      grouped[a.audit_date].discrepancies += Number(a.total_discrepancies || 0)
      grouped[a.audit_date].variance += Number(a.total_variance_value || 0)
    })

    return Object.entries(grouped)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [auditSummary])

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <DashboardLayout {...pageSetup}>
      <AnimatedPage>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Audits</h1>
          <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>{dateRangeLabel}</p>
        </div>

        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <AnimatedMetricCard index={0}>
            <MetricCardSimple label="Total Audits" value={isLoading ? '—' : formatNumber(metrics.totalAudits)} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={1}>
            <MetricCardSimple label="Discrepancies" value={isLoading ? '—' : formatNumber(metrics.totalDiscrepancies)} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={2}>
            <MetricCardSimple label="Total Variance" value={isLoading ? '—' : formatCurrency(Math.abs(metrics.totalVariance))} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={3}>
            <MetricCardSimple label="Accuracy Rate" value={isLoading ? '—' : `${metrics.accuracyRate.toFixed(1)}%`} />
          </AnimatedMetricCard>
        </StaggerContainer>

        {/* Audit History Table */}
        <FadeIn delay={0.2}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Audit History</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Date</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Audits</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Discrepancies</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Variance</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditHistory.map((audit, i) => (
                <tr key={audit.date} style={{ borderBottom: i < auditHistory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#e5e5e5' }}>{formatDateDisplay(audit.date)}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#e5e5e5', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(audit.audits)}</td>
                  <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: audit.discrepancies > 0 ? '#a3a3a3' : '#525252' }}>{formatNumber(audit.discrepancies)}</td>
                  <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: audit.variance !== 0 ? '#a3a3a3' : '#404040' }}>{audit.variance !== 0 ? formatCurrency(Math.abs(audit.variance)) : '—'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: audit.discrepancies === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
                      color: audit.discrepancies === 0 ? '#525252' : '#a3a3a3',
                    }}>
                      {audit.discrepancies === 0 ? 'Clean' : 'Review'}
                    </span>
                  </td>
                </tr>
              ))}
              {auditHistory.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', fontSize: '13px', color: '#525252' }}>
                    No audit data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </FadeIn>
      </AnimatedPage>
    </DashboardLayout>
  )
}
