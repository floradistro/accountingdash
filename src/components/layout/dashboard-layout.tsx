'use client'

import { Sidebar } from './sidebar'
import type { Store, Location } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
  stores: Store[]
  locations: Location[]
  selectedStore: string
  selectedLocation: string
  dateFrom?: string | null
  dateTo?: string | null
  onStoreChange: (storeId: string) => void
  onLocationChange: (locationId: string) => void
  onDateRangeChange?: (from: string | null, to: string | null) => void
}

export function DashboardLayout({ children, stores, locations, selectedStore, selectedLocation, dateFrom = null, dateTo = null, onStoreChange, onLocationChange, onDateRangeChange = () => {} }: DashboardLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#09090b' }}>
      <Sidebar
        stores={stores}
        locations={locations}
        selectedStore={selectedStore}
        selectedLocation={selectedLocation}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onStoreChange={onStoreChange}
        onLocationChange={onLocationChange}
        onDateRangeChange={onDateRangeChange}
      />
      <main style={{
        marginLeft: '240px',
        padding: '24px 32px',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        background: '#0a0a0a',
      }}>
        {children}
      </main>
    </div>
  )
}
