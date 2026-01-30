'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { DataTable } from '@/components/ui/data-table'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useAccountingStore } from '@/stores/accounting.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

export default function CashManagementPage() {
  const pageSetup = usePageSetup()
  const { cashSummary, cashDaily, cashByLocation, cashByPaymentMethod, cashMonthly, cashLoading, fetchAllCash } = useAccountingStore()
  const { dateFrom, dateTo, getDateRangeDays } = useDashboardStore()

  const days = dateFrom && dateTo ? getDateRangeDays() : 30

  useEffect(() => {
    fetchAllCash(pageSetup.selectedStore === 'all' ? undefined : pageSetup.selectedStore, days)
  }, [fetchAllCash, pageSetup.selectedStore, days, dateFrom, dateTo])

  const dateRangeLabel = dateFrom && dateTo
    ? `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Last 30 days'

  const totalSales = cashSummary?.total_sales || 0
  const cashSales = cashSummary?.cash_sales || 0
  const cardSales = cashSummary?.card_sales || 0
  const otherSales = totalSales - cashSales - cardSales

  return (
    <DashboardLayout {...pageSetup}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Cash Management</h1>
        <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>{dateRangeLabel}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <MetricCardSimple label="Total Sales" value={cashLoading ? '—' : formatCurrency(totalSales)} />
        <MetricCardSimple label="Cash Sales" value={cashLoading ? '—' : formatCurrency(cashSales)} subtitle={totalSales > 0 ? `${((cashSales / totalSales) * 100).toFixed(1)}% of total` : '0%'} />
        <MetricCardSimple label="Card Sales" value={cashLoading ? '—' : formatCurrency(cardSales)} subtitle={totalSales > 0 ? `${((cardSales / totalSales) * 100).toFixed(1)}% of total` : '0%'} />
        <MetricCardSimple label="Other Methods" value={cashLoading ? '—' : formatCurrency(otherSales)} subtitle={totalSales > 0 ? `${((otherSales / totalSales) * 100).toFixed(1)}% of total` : '0%'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>By Payment Method</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cashByPaymentMethod.slice(0, 5).map((method, idx) => {
              const percentage = totalSales > 0 ? (method.total_amount / totalSales) * 100 : 0
              return (
                <div key={method.payment_method || `method-${idx}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{method.payment_method || 'Unknown'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(method.total_amount)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: '#404040', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{formatNumber(method.transaction_count)} transactions</span>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>By Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cashByLocation.slice(0, 5).map((loc, idx) => {
              const percentage = totalSales > 0 ? (loc.total_sales / totalSales) * 100 : 0
              return (
                <div key={loc.location_id || `loc-${idx}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{loc.location_name || 'Unknown'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(loc.total_sales)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: '#404040', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{formatNumber(loc.transaction_count)} transactions</span>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Daily Cash Flow</h3>
        <DataTable
          loading={cashLoading}
          data={cashDaily.slice(0, 20)}
          columns={[
            { header: 'Date', key: 'sale_date', render: (v) => formatDate(v) },
            { header: 'Total Sales', key: 'total_sales', align: 'right', render: (v) => <span style={{ fontWeight: 500, color: '#e5e5e5' }}>{formatCurrency(v)}</span> },
            { header: 'Cash', key: 'cash_sales', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Card', key: 'card_sales', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Other', key: 'other_sales', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Transactions', key: 'transaction_count', align: 'right', render: (v) => formatNumber(v) },
          ]}
        />
        {cashDaily.length > 20 && <p style={{ fontSize: '12px', color: '#525252', marginTop: '12px', textAlign: 'center' }}>Showing 20 of {cashDaily.length} days</p>}
      </div>
    </DashboardLayout>
  )
}
