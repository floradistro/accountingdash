'use client'

import { useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { TrendIndicator } from '@/components/analytics/trend-indicator'
import { ComparisonCard } from '@/components/analytics/comparison-card'
import { AnimatedPage, AnimatedMetricCard, AnimatedChart, StaggerContainer, FadeIn } from '@/components/ui/animated'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useDashboardStore } from '@/stores/dashboard.store'
import { formatCurrency } from '@/lib/utils'
import { analyzeTrend } from '@/lib/analytics/trend-analysis'
import { compareWoW, compareMoM } from '@/lib/analytics/comparisons'

export default function PnLPage() {
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
    const totalCogs = filteredSales.reduce((sum, s) => sum + Number(s.total_cogs || 0), 0)
    const totalProfit = filteredSales.reduce((sum, s) => sum + Number(s.total_profit || 0), 0)
    const grossMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    return { totalRevenue, totalCogs, totalProfit, grossMargin }
  }, [filteredSales])

  const chartData = useMemo(() => {
    const grouped: Record<string, { revenue: number; profit: number }> = {}
    filteredSales.forEach(s => {
      if (!grouped[s.sale_date]) grouped[s.sale_date] = { revenue: 0, profit: 0 }
      grouped[s.sale_date].revenue += Number(s.total_revenue || 0)
      grouped[s.sale_date].profit += Number(s.total_profit || 0)
    })
    return Object.entries(grouped).map(([date, values]) => ({ date, revenue: values.revenue, profit: values.profit })).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSales])

  // Analytics: Trend Analysis
  const profitTrend = useMemo(() => {
    if (chartData.length < 3) return null
    return analyzeTrend(chartData.map((d) => d.profit))
  }, [chartData])

  // Analytics: Comparisons
  const profitData = useMemo(() =>
    chartData.map((d) => ({ date: d.date, value: d.profit })),
    [chartData]
  )

  const wow = useMemo(() => compareWoW(profitData), [profitData])
  const mom = useMemo(() => compareMoM(profitData), [profitData])

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <DashboardLayout {...pageSetup}>
      <AnimatedPage>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Profit & Loss</h1>
            <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>{dateRangeLabel}</p>
          </div>
          {!isLoading && profitTrend && <TrendIndicator trend={profitTrend} showDetails />}
        </div>

        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <AnimatedMetricCard index={0}>
            <MetricCardSimple label="Revenue" value={isLoading ? '—' : formatCurrency(metrics.totalRevenue)} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={1}>
            <MetricCardSimple label="Cost of Goods" value={isLoading ? '—' : formatCurrency(metrics.totalCogs)} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={2}>
            <MetricCardSimple label="Gross Profit" value={isLoading ? '—' : formatCurrency(metrics.totalProfit)} />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={3}>
            <MetricCardSimple label="Gross Margin" value={isLoading ? '—' : `${metrics.grossMargin.toFixed(1)}%`} />
          </AnimatedMetricCard>
        </StaggerContainer>

        {/* Period Comparisons */}
        {!isLoading && (wow || mom) && (
          <FadeIn delay={0.2}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {wow && <ComparisonCard comparison={wow} />}
              {mom && <ComparisonCard comparison={mom} />}
            </div>
          </FadeIn>
        )}

        <AnimatedChart>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Profit Trend</h3>
            <div style={{ height: '300px' }}>
              <RevenueChart data={chartData} />
            </div>
          </div>
        </AnimatedChart>

        <FadeIn delay={0.4}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Daily Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase' }}>Revenue</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase' }}>COGS</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase' }}>Profit</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase' }}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.slice(-10).reverse().map((day, i) => {
                    const cogs = day.revenue - day.profit
                    const margin = day.revenue > 0 ? (day.profit / day.revenue) * 100 : 0
                    return (
                      <tr key={day.date} style={{ borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#e5e5e5' }}>{formatDateDisplay(day.date)}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#e5e5e5', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(day.revenue)}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#737373', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(cogs)}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#a3a3a3', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(day.profit)}</td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#a3a3a3', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{margin.toFixed(1)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </AnimatedPage>
    </DashboardLayout>
  )
}
