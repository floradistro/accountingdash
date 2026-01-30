'use client'

import { useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { DataTable } from '@/components/ui/data-table'
import { AnimatedPage, AnimatedMetricCard, StaggerContainer, FadeIn } from '@/components/ui/animated'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useStaffStore } from '@/stores/staff.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Trophy } from 'lucide-react'

export default function StaffPerformancePage() {
  const pageSetup = usePageSetup()
  const { staffPerformance, staffLeaderboard, staffLoading, fetchAllStaff } = useStaffStore()
  const { dateFrom, dateTo, getDateRangeDays } = useDashboardStore()

  const days = dateFrom && dateTo ? Math.min(getDateRangeDays(), 365) : 365 // Cap at 365 days max

  useEffect(() => {
    fetchAllStaff(pageSetup.selectedStore === 'all' ? undefined : pageSetup.selectedStore, days)
  }, [fetchAllStaff, pageSetup.selectedStore, days, dateFrom, dateTo])

  const dateRangeLabel = dateFrom && dateTo
    ? `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Last 365 days'

  const metrics = useMemo(() => {
    const totalRevenue = staffPerformance.reduce((sum, s) => sum + Number(s.total_revenue || 0), 0)
    const totalOrders = staffPerformance.reduce((sum, s) => sum + Number(s.total_orders || 0), 0)
    const totalProfit = staffPerformance.reduce((sum, s) => sum + Number(s.total_profit || 0), 0)
    const activeStaff = staffPerformance.length
    const avgRevenuePerStaff = activeStaff > 0 ? totalRevenue / activeStaff : 0

    return { totalRevenue, totalOrders, totalProfit, activeStaff, avgRevenuePerStaff }
  }, [staffPerformance])

  const topPerformers = staffLeaderboard.slice(0, 5)

  return (
    <DashboardLayout {...pageSetup}>
      <AnimatedPage>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>
            Staff Performance
          </h1>
          <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>{dateRangeLabel}</p>
        </div>

        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <AnimatedMetricCard index={0}>
            <MetricCardSimple
              label="Active Staff"
              value={staffLoading ? '—' : formatNumber(metrics.activeStaff)}
            />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={1}>
            <MetricCardSimple
              label="Total Revenue"
              value={staffLoading ? '—' : formatCurrency(metrics.totalRevenue)}
              subtitle={`${formatNumber(metrics.totalOrders)} orders`}
            />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={2}>
            <MetricCardSimple
              label="Total Profit"
              value={staffLoading ? '—' : formatCurrency(metrics.totalProfit)}
            />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={3}>
            <MetricCardSimple
              label="Avg Revenue/Staff"
              value={staffLoading ? '—' : formatCurrency(metrics.avgRevenuePerStaff)}
            />
          </AnimatedMetricCard>
        </StaggerContainer>

        {/* Leaderboard */}
        <FadeIn delay={0.2}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={14} />
              Top Performers
            </h3>
            <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topPerformers.map((staff, idx) => {
            const rankColor = idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#737373'
            return (
              <div key={staff.employee_id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: idx < 3 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: `${rankColor}20`,
                    color: rankColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e5e5e5', fontWeight: 500 }}>
                      {staff.employee_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#525252' }}>
                      {formatNumber(staff.total_orders)} orders • {staff.days_worked} days
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(staff.total_revenue)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#737373' }}>
                    {formatCurrency(staff.avg_order_value)} AOV
                  </div>
                </div>
              </div>
            )
          })}
          {topPerformers.length === 0 && !staffLoading && (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: '#525252' }}>
              No staff performance data available
            </div>
          )}
            </StaggerContainer>
          </div>
        </FadeIn>

        {/* Staff Performance Table */}
        <FadeIn delay={0.3}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>
              All Staff Performance
        </h3>
        <DataTable
          loading={staffLoading}
          data={staffPerformance}
          columns={[
            { header: 'Employee', key: 'employee_name', render: (v) => <span style={{ fontWeight: 500, color: '#e5e5e5' }}>{v}</span> },
            { header: 'Revenue', key: 'total_revenue', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Orders', key: 'total_orders', align: 'right', render: (v) => formatNumber(v) },
            { header: 'Avg Order', key: 'avg_order_value', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Profit', key: 'total_profit', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Days Worked', key: 'days_worked', align: 'right', render: (v) => formatNumber(v) },
            { header: 'Daily Avg', key: 'avg_daily_revenue', align: 'right', render: (v) => formatCurrency(v) },
          ]}
        />
          </div>
        </FadeIn>
      </AnimatedPage>
    </DashboardLayout>
  )
}
