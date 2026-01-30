'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCardSimple } from '@/components/ui/metric-card-simple'
import { DataTable } from '@/components/ui/data-table'
import { usePageSetup } from '@/hooks/use-page-setup'
import { useAccountingStore } from '@/stores/accounting.store'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function InventoryValuationPage() {
  const pageSetup = usePageSetup()
  const { inventorySummary, inventoryByLocation, inventoryByCategory, inventorySlowMoving, inventoryLoading, fetchAllInventory } = useAccountingStore()

  useEffect(() => {
    fetchAllInventory(pageSetup.selectedStore === 'all' ? undefined : pageSetup.selectedStore)
  }, [fetchAllInventory, pageSetup.selectedStore])

  const totalValue = inventorySummary?.total_value_at_cost || 0
  const totalUnits = inventorySummary?.total_units || 0
  const totalProducts = inventorySummary?.total_products || 0
  const lowStockCount = inventorySummary?.products_low_stock || 0

  return (
    <DashboardLayout {...pageSetup}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>Inventory Valuation</h1>
        <p style={{ fontSize: '13px', color: '#525252', marginTop: '4px' }}>Inventory values and slow-moving items</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <MetricCardSimple label="Total Value" value={inventoryLoading ? '—' : formatCurrency(totalValue)} subtitle="At cost" />
        <MetricCardSimple label="Total Units" value={inventoryLoading ? '—' : formatNumber(totalUnits)} />
        <MetricCardSimple label="Total Products" value={inventoryLoading ? '—' : formatNumber(totalProducts)} />
        <MetricCardSimple label="Low Stock Items" value={inventoryLoading ? '—' : formatNumber(lowStockCount)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>By Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {inventoryByLocation.slice(0, 5).map((loc, idx) => {
              const percentage = totalValue > 0 ? (loc.total_value / totalValue) * 100 : 0
              return (
                <div key={loc.location_id || `loc-${idx}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{loc.location_name || 'Unknown'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(loc.total_value)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: '#404040', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{formatNumber(loc.total_units)} units</span>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>By Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {inventoryByCategory.slice(0, 5).map((cat, idx) => {
              const percentage = totalValue > 0 ? (cat.total_value / totalValue) * 100 : 0
              return (
                <div key={cat.category_name || `cat-${idx}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#a3a3a3' }}>{cat.category_name || 'Unknown'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(cat.total_value)}</span>
                  </div>
                  <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: '#404040', borderRadius: '2px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{formatNumber(cat.total_units)} units</span>
                    <span style={{ fontSize: '11px', color: '#404040' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#737373', marginBottom: '16px' }}>Slow-Moving Inventory</h3>
        <DataTable
          loading={inventoryLoading}
          data={inventorySlowMoving.slice(0, 20)}
          columns={[
            { header: 'Product', key: 'product_name' },
            { header: 'Location', key: 'location_name' },
            { header: 'Units', key: 'quantity_on_hand', align: 'right', render: (v) => formatNumber(v) },
            { header: 'Value', key: 'total_value_at_cost', align: 'right', render: (v) => <span style={{ fontWeight: 500, color: '#e5e5e5' }}>{formatCurrency(v)}</span> },
            { header: 'Days No Sale', key: 'days_since_last_sale', align: 'right', render: (v) => `${v}d` },
            { header: 'Status', key: 'status', render: (v, row) => (
              <span style={{
                display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase',
                background: row.days_since_last_sale < 30 ? 'rgba(255,255,255,0.06)' : row.days_since_last_sale < 60 ? 'rgba(255,200,50,0.1)' : 'rgba(255,100,100,0.1)',
                color: row.days_since_last_sale < 30 ? '#737373' : row.days_since_last_sale < 60 ? '#c9a227' : '#b35555',
              }}>{row.days_since_last_sale < 30 ? 'Normal' : row.days_since_last_sale < 60 ? 'Slow' : 'Critical'}</span>
            )},
          ]}
        />
        {inventorySlowMoving.length > 20 && <p style={{ fontSize: '12px', color: '#525252', marginTop: '12px', textAlign: 'center' }}>Showing 20 of {inventorySlowMoving.length} items</p>}
      </div>
    </DashboardLayout>
  )
}
