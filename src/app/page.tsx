'use client'

import { useEffect, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { TrendIndicator } from '@/components/analytics/trend-indicator'
import { ComparisonCard } from '@/components/analytics/comparison-card'
import { AnomalyAlert } from '@/components/analytics/anomaly-badge'
import { AnimatedPage, AnimatedMetricCard, AnimatedChart, StaggerContainer } from '@/components/ui/animated'
import { useDashboardStore } from '@/stores/dashboard.store'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { analyzeTrend } from '@/lib/analytics/trend-analysis'
import { detectAnomalies } from '@/lib/analytics/anomaly-detection'
import { forecastWithConfidence } from '@/lib/analytics/forecasting'

export default function Dashboard() {
  const {
    stores,
    locations,
    selectedStore,
    selectedLocation,
    dateFrom,
    dateTo,
    performance,
    dailySales,
    safeBalances,
    wowMetrics,
    isLoading,
    setSelectedStore,
    setSelectedLocation,
    setDateRange,
    fetchStores,
    fetchLocations,
    fetchAll,
    getLocationName,
    getFilteredDailySales,
  } = useDashboardStore()

  // Use filtered data based on location selection
  const filteredSales = getFilteredDailySales()

  useEffect(() => {
    fetchStores()
    fetchLocations()
    fetchAll()
  }, [fetchStores, fetchLocations, fetchAll])

  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total_revenue || 0), 0)
    const totalProfit = filteredSales.reduce((sum, s) => sum + Number(s.total_profit || 0), 0)
    const totalOrders = filteredSales.reduce((sum, s) => sum + Number(s.order_count || 0), 0)
    const totalCogs = filteredSales.reduce((sum, s) => sum + Number(s.total_cogs || 0), 0)

    const today = new Date().toISOString().split('T')[0]
    const todaySales = filteredSales.filter(s => s.sale_date === today)
    const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_revenue || 0), 0)

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      totalCogs,
      todayRevenue,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    }
  }, [filteredSales])

  const chartData = useMemo(() => {
    const grouped: Record<string, { revenue: number; profit: number }> = {}
    filteredSales.forEach(s => {
      if (!grouped[s.sale_date]) {
        grouped[s.sale_date] = { revenue: 0, profit: 0 }
      }
      grouped[s.sale_date].revenue += Number(s.total_revenue || 0)
      grouped[s.sale_date].profit += Number(s.total_profit || 0)
    })

    return Object.entries(grouped)
      .map(([date, values]) => ({ date, revenue: values.revenue, profit: values.profit }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSales])

  // Analytics: Trend Analysis
  const revenueTrend = useMemo(() => {
    if (chartData.length < 3) return null
    return analyzeTrend(chartData.map((d) => d.revenue))
  }, [chartData])

  // Analytics: Anomaly Detection
  const revenueAnomalies = useMemo(() => {
    if (chartData.length < 7) return { anomalies: [], totalPoints: 0, anomalyRate: 0, summary: '' }
    const revenueData = chartData.map((d) => ({ date: d.date, value: d.revenue }))
    return detectAnomalies(revenueData.map((d) => d.value), 'ensemble')
  }, [chartData])

  // Analytics: Period Comparisons - Use backend-calculated WoW metrics
  const revenueComparisons = useMemo(() => {
    if (!wowMetrics) return { yoy: null, mom: null, wow: null, dod: null }

    // Convert API data to ComparisonCard format
    const wow = {
      metric: 'Week-over-Week',
      current: {
        value: wowMetrics.current.revenue,
        period: `${new Date(wowMetrics.current.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(wowMetrics.current.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      },
      previous: {
        value: wowMetrics.previous.revenue,
        period: `${new Date(wowMetrics.previous.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(wowMetrics.previous.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      },
      comparison: {
        current: wowMetrics.current.revenue,
        previous: wowMetrics.previous.revenue,
        change: wowMetrics.comparison.revenueChange,
        changePercent: wowMetrics.comparison.revenueChangePercent,
        direction: wowMetrics.comparison.revenueChange > 0 ? 'up' as const : wowMetrics.comparison.revenueChange < 0 ? 'down' as const : 'flat' as const,
        isSignificant: Math.abs(wowMetrics.comparison.revenueChangePercent) >= 5,
      }
    }

    return { yoy: null, mom: null, wow, dod: null }
  }, [wowMetrics])

  // Analytics: Forecasting
  const revenueForecast = useMemo(() => {
    if (chartData.length < 14) return []
    const revenueData = chartData.map((d) => ({ date: d.date, value: d.revenue }))
    return forecastWithConfidence(revenueData, 7, 0.95) // 7-day forecast
  }, [chartData])

  // Group by location with names (use unfiltered dailySales to always show all locations)
  const locationData = useMemo(() => {
    const byLocation: Record<string, { revenue: number; orders: number; profit: number }> = {}
    dailySales.forEach(s => {
      const locId = s.location_id || 'unknown'
      if (!byLocation[locId]) {
        byLocation[locId] = { revenue: 0, orders: 0, profit: 0 }
      }
      byLocation[locId].revenue += Number(s.total_revenue || 0)
      byLocation[locId].orders += Number(s.order_count || 0)
      byLocation[locId].profit += Number(s.total_profit || 0)
    })
    return Object.entries(byLocation)
      .map(([id, data]) => ({ id, name: getLocationName(id), ...data }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [dailySales, getLocationName])

  const totalSafeBalance = useMemo(() => {
    return safeBalances.reduce((sum, s) => sum + Number(s.current_balance || 0), 0)
  }, [safeBalances])

  const currentStoreName = selectedStore === 'all'
    ? 'All Stores'
    : stores.find(s => s.id === selectedStore)?.store_name || 'Dashboard'

  const dateRangeLabel = dateFrom && dateTo
    ? `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Last 30 days'

  return (
    <DashboardLayout
      stores={stores}
      locations={locations}
      selectedStore={selectedStore}
      selectedLocation={selectedLocation}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onStoreChange={setSelectedStore}
      onLocationChange={setSelectedLocation}
      onDateRangeChange={setDateRange}
    >
      <AnimatedPage>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>
            {currentStoreName}
          </h1>
          <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>
            {dateRangeLabel}
          </p>
        </div>

        {/* Analytics: Anomaly Alerts */}
        {!isLoading && revenueAnomalies.anomalies.length > 0 && (
          <AnomalyAlert anomalies={revenueAnomalies.anomalies} dataValues={chartData.map((d) => d.revenue)} />
        )}

        {/* Primary Metrics with Trend Indicators */}
        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <AnimatedMetricCard index={0}>
            <div>
              <MetricCardSimple
                label="Revenue"
                value={isLoading ? '—' : formatCurrency(metrics.totalRevenue)}
                subtitle={`Today: ${formatCurrency(metrics.todayRevenue)}`}
              />
              {!isLoading && revenueTrend && (
                <div style={{ marginTop: '8px' }}>
                  <TrendIndicator trend={revenueTrend} showDetails />
                </div>
              )}
            </div>
          </AnimatedMetricCard>
          <AnimatedMetricCard index={1}>
            <MetricCardSimple
              label="Gross Profit"
              value={isLoading ? '—' : formatCurrency(metrics.totalProfit)}
              subtitle={`${metrics.profitMargin.toFixed(1)}% margin`}
            />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={2}>
            <MetricCardSimple
              label="Orders"
              value={isLoading ? '—' : formatNumber(metrics.totalOrders)}
              subtitle={`Avg: ${formatCurrency(metrics.avgOrderValue)}`}
            />
          </AnimatedMetricCard>
          <AnimatedMetricCard index={3}>
            <MetricCardSimple
              label="Safe Balance"
              value={isLoading ? '—' : formatCurrency(totalSafeBalance)}
              subtitle={`${safeBalances.length} location${safeBalances.length !== 1 ? 's' : ''}`}
            />
          </AnimatedMetricCard>
        </StaggerContainer>

        {/* Period Comparisons */}
        {!isLoading && (revenueComparisons.wow || revenueComparisons.mom) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {revenueComparisons.wow && <ComparisonCard comparison={revenueComparisons.wow} />}
            {revenueComparisons.mom && <ComparisonCard comparison={revenueComparisons.mom} />}
            {revenueComparisons.yoy && <ComparisonCard comparison={revenueComparisons.yoy} />}
          </div>
        )}

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {/* Revenue Chart */}
          <AnimatedChart>
            <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', minHeight: '320px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Revenue Trend</h3>
              <div style={{ height: '260px', minHeight: '260px' }}>
                <RevenueChart data={chartData} />
              </div>
            </div>
          </AnimatedChart>

        {/* Location Breakdown */}
        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>By Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {locationData.slice(0, 5).map((loc) => {
              const percentage = metrics.totalRevenue > 0 ? (loc.revenue / metrics.totalRevenue) * 100 : 0
              return (
                <div key={loc.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{loc.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(loc.revenue)}
                    </span>
                  </div>
                  <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: '#404040',
                      borderRadius: '2px',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{formatNumber(loc.orders)} orders</span>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Store Performance Table */}
      {performance.length > 0 && (
        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Store Performance (24h)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Store</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Revenue</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Orders</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>7d Revenue</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 500, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>7d Orders</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p, i) => (
                  <tr key={`${p.store_id}-${i}`} style={{ borderBottom: i < performance.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#e5e5e5' }}>{p.store_name}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#e5e5e5', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(Number(p.revenue_24h || 0))}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#737373', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(Number(p.orders_24h || 0))}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#e5e5e5', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(Number(p.revenue_7d || 0))}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#737373', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(Number(p.orders_7d || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </AnimatedPage>
    </DashboardLayout>
  )
}
