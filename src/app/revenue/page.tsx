'use client'

import { useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { DataTable } from '@/components/ui/data-table'
import { TrendIndicator } from '@/components/analytics/trend-indicator'
import { ComparisonCard } from '@/components/analytics/comparison-card'
import { AnimatedPage, AnimatedMetricCard, AnimatedChart, StaggerContainer, FadeIn } from '@/components/ui/animated'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useDashboardStore } from '@/stores/dashboard.store'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { analyzeTrend } from '@/lib/analytics/trend-analysis'
import { compareWoW, compareMoM, compareYoY } from '@/lib/analytics/comparisons'

export default function RevenuePage() {
  const pageSetup = usePageSetup()
  const { dailySales, isLoading, fetchDailySales, getFilteredDailySales, dateFrom, dateTo } = useDashboardStore()

  const filteredSales = getFilteredDailySales()

  useEffect(() => {
    fetchDailySales(pageSetup.selectedStore === 'all' ? undefined : pageSetup.selectedStore)
  }, [fetchDailySales, pageSetup.selectedStore])

  const dateRangeLabel = dateFrom && dateTo
    ? `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Last 30 days'

  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total_revenue || 0), 0)
    const totalTax = filteredSales.reduce((sum, s) => sum + Number(s.total_tax || 0), 0)
    const totalDiscounts = filteredSales.reduce((sum, s) => sum + Number(s.total_discounts || 0), 0)
    const totalOrders = filteredSales.reduce((sum, s) => sum + Number(s.order_count || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const discountRate = totalRevenue > 0 ? (totalDiscounts / (totalRevenue + totalDiscounts)) * 100 : 0

    return { totalRevenue, totalTax, totalDiscounts, avgOrderValue, discountRate, totalOrders }
  }, [filteredSales])

  const chartData = useMemo(() => {
    const grouped: Record<string, { revenue: number; profit: number }> = {}
    filteredSales.forEach(s => {
      if (!grouped[s.sale_date]) grouped[s.sale_date] = { revenue: 0, profit: 0 }
      grouped[s.sale_date].revenue += Number(s.total_revenue || 0)
      grouped[s.sale_date].profit += Number(s.total_profit || 0)
    })
    return Object.entries(grouped).map(([date, values]) => ({ date, ...values })).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSales])

  const recentDays = useMemo(() => {
    const grouped: Record<string, { revenue: number; orders: number; tax: number; discounts: number }> = {}
    filteredSales.forEach(s => {
      if (!grouped[s.sale_date]) grouped[s.sale_date] = { revenue: 0, orders: 0, tax: 0, discounts: 0 }
      grouped[s.sale_date].revenue += Number(s.total_revenue || 0)
      grouped[s.sale_date].orders += Number(s.order_count || 0)
      grouped[s.sale_date].tax += Number(s.total_tax || 0)
      grouped[s.sale_date].discounts += Number(s.total_discounts || 0)
    })
    return Object.entries(grouped).map(([date, values]) => ({ date, ...values })).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
  }, [filteredSales])

  // Analytics: Trend Analysis
  const revenueTrend = useMemo(() => {
    if (chartData.length < 3) return null
    return analyzeTrend(chartData.map((d) => d.revenue))
  }, [chartData])

  // Analytics: Comparisons
  const revenueData = useMemo(() =>
    chartData.map((d) => ({ date: d.date, value: d.revenue })),
    [chartData]
  )

  const wow = useMemo(() => compareWoW(revenueData), [revenueData])
  const mom = useMemo(() => compareMoM(revenueData), [revenueData])
  const yoy = useMemo(() => compareYoY(revenueData), [revenueData])

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <DashboardLayout {...pageSetup}>
      <AnimatedPage>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Revenue</h1>
            <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>{dateRangeLabel}</p>
          </div>
          {!isLoading && revenueTrend && <TrendIndicator trend={revenueTrend} showDetails />}
        </div>

        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <AnimatedMetricCard index={0}>
            <MetricCardSimple label="Total Revenue" value={isLoading ? '—' : formatCurrency(metrics.totalRevenue)} subtitle={`${formatNumber(metrics.totalOrders)} orders`} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={1}>
            <MetricCardSimple label="Avg Order Value" value={isLoading ? '—' : formatCurrency(metrics.avgOrderValue)} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={2}>
            <MetricCardSimple label="Total Tax" value={isLoading ? '—' : formatCurrency(metrics.totalTax)} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={3}>
            <MetricCardSimple label="Discounts" value={isLoading ? '—' : formatCurrency(metrics.totalDiscounts)} subtitle={`${metrics.discountRate.toFixed(1)}% rate`} />
          </AnimatedMetricCard>
        </StaggerContainer>

        {/* Period Comparisons */}
        {!isLoading && (wow || mom || yoy) && (
          <FadeIn delay={0.2}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {wow && <ComparisonCard comparison={wow} />}
              {mom && <ComparisonCard comparison={mom} />}
              {yoy && <ComparisonCard comparison={yoy} />}
            </div>
          </FadeIn>
        )}

        <AnimatedChart>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Revenue Trend</h3>
            <div style={{ height: '300px' }}>
              <RevenueChart data={chartData} />
            </div>
          </div>
        </AnimatedChart>

        <FadeIn delay={0.4}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Recent Days</h3>
            <DataTable
              loading={isLoading}
              data={recentDays}
              columns={[
                { header: 'Date', key: 'date', render: (v) => formatDateDisplay(v) },
                { header: 'Revenue', key: 'revenue', align: 'right', render: (v) => <span style={{ fontWeight: 500, color: '#e5e5e5' }}>{formatCurrency(v)}</span> },
                { header: 'Orders', key: 'orders', align: 'right', render: (v) => formatNumber(v) },
                { header: 'Avg Order', key: 'avg_order', align: 'right', render: (v, row) => formatCurrency(row.orders > 0 ? row.revenue / row.orders : 0) },
                { header: 'Tax', key: 'tax', align: 'right', render: (v) => formatCurrency(v) },
                { header: 'Discounts', key: 'discounts', align: 'right', render: (v) => formatCurrency(v) },
              ]}
            />
          </div>
        </FadeIn>
      </AnimatedPage>
    </DashboardLayout>
  )
}
