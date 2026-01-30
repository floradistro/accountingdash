'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { DataTable } from '@/components/ui/data-table'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useAccountingStore } from '@/stores/accounting.store'
import { formatCurrency } from '@/lib/utils'

export default function AccountsReceivablePage() {
  const pageSetup = usePageSetup()
  const { arSummary, arByCustomer, arDetail, arLoading, fetchAllAR } = useAccountingStore()

  useEffect(() => {
    fetchAllAR(pageSetup.selectedStore === 'all' ? undefined : pageSetup.selectedStore)
  }, [fetchAllAR, pageSetup.selectedStore])

  const totalOutstanding = arSummary?.total_outstanding || 0

  return (
    <DashboardLayout {...pageSetup}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Accounts Receivable</h1>
        <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>Customer balances and invoice aging</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <MetricCardSimple label="Total Outstanding" value={arLoading ? '—' : formatCurrency(totalOutstanding)} subtitle={`${arSummary?.open_invoice_count || 0} open invoices`} />
        <MetricCardSimple label="Total Billed" value={arLoading ? '—' : formatCurrency(arSummary?.total_billed || 0)} subtitle={`${formatCurrency(arSummary?.total_collected || 0)} collected`} />
        <MetricCardSimple label="Current (0-30)" value={arLoading ? '—' : formatCurrency(arSummary?.current_0_30 || 0)} subtitle={totalOutstanding > 0 ? `${((arSummary?.current_0_30 || 0) / totalOutstanding * 100).toFixed(0)}% of total` : '0% of total'} />
        <MetricCardSimple label="Overdue" value={arLoading ? '—' : formatCurrency(arSummary?.overdue_amount || 0)} subtitle={`${arSummary?.overdue_count || 0} overdue invoices`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Aging Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Current (0-30 days)', value: arSummary?.current_0_30 || 0 },
              { label: '31-60 days', value: arSummary?.aging_31_60 || 0 },
              { label: '61-90 days', value: arSummary?.aging_61_90 || 0 },
              { label: 'Over 90 days', value: arSummary?.aging_over_90 || 0 },
            ].map((item) => {
              const percentage = totalOutstanding > 0 ? (item.value / totalOutstanding) * 100 : 0
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(item.value)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: '#404040', borderRadius: '2px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Top Customers by Balance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {arByCustomer.slice(0, 5).map((customer, idx) => {
              const percentage = totalOutstanding > 0 ? (customer.balance_due / totalOutstanding) * 100 : 0
              return (
                <div key={customer.customer_id || `customer-${idx}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{customer.customer_name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(customer.balance_due)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: '#404040', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{customer.open_invoice_count} open invoices</span>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
            {arByCustomer.length === 0 && !arLoading && (
              <p style={{ fontSize: '13px', color: '#525252', textAlign: 'center', padding: '20px 0' }}>No outstanding balances</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Outstanding Invoices</h3>
        <DataTable
          loading={arLoading}
          data={arDetail.slice(0, 20)}
          columns={[
            { header: 'Invoice #', key: 'invoice_number', render: (v) => <span style={{ fontFamily: 'monospace', color: '#e5e5e5' }}>{v}</span> },
            { header: 'Customer', key: 'customer_name' },
            { header: 'Location', key: 'location_name' },
            { header: 'Total', key: 'total_amount', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Paid', key: 'paid_amount', align: 'right', render: (v) => formatCurrency(v) },
            { header: 'Balance', key: 'balance_due', align: 'right', render: (v) => <span style={{ fontWeight: 500, color: '#e5e5e5' }}>{formatCurrency(v)}</span> },
            { header: 'Age', key: 'days_outstanding', align: 'right', render: (v) => `${v}d` },
            { header: 'Status', key: 'aging_bucket', render: (v) => (
              <span style={{
                display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase',
                background: v === '0-30' ? 'rgba(255,255,255,0.06)' : v === '31-60' ? 'rgba(255,200,50,0.1)' : 'rgba(255,100,100,0.1)',
                color: v === '0-30' ? '#737373' : v === '31-60' ? '#c9a227' : '#b35555',
              }}>{v}</span>
            )},
          ]}
        />
        {arDetail.length > 20 && <p style={{ fontSize: '12px', color: '#525252', marginTop: '12px', textAlign: 'center' }}>Showing 20 of {arDetail.length} outstanding invoices</p>}
      </div>
    </DashboardLayout>
  )
}
