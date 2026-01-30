'use client'

import type { Store, Location } from '@/lib/supabase'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { StoreSelector } from './store-selector'
import { LocationSelector } from './location-selector'
import { NavigationMenu } from './navigation-menu'
import { SidebarFooter } from './sidebar-footer'

interface SidebarProps {
  stores: Store[]
  locations: Location[]
  selectedStore: string
  selectedLocation: string
  dateFrom: string | null
  dateTo: string | null
  onStoreChange: (storeId: string) => void
  onLocationChange: (locationId: string) => void
  onDateRangeChange: (from: string | null, to: string | null) => void
}

export function Sidebar({
  stores,
  locations,
  selectedStore,
  selectedLocation,
  dateFrom,
  dateTo,
  onStoreChange,
  onLocationChange,
  onDateRangeChange
}: SidebarProps) {
  // Filter locations for current store
  const filteredLocations = selectedStore === 'all'
    ? locations || []
    : (locations || []).filter(l => l.store_id === selectedStore)

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '240px',
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      <StoreSelector
        stores={stores}
        selectedStore={selectedStore}
        onStoreChange={onStoreChange}
      />

      <LocationSelector
        locations={filteredLocations}
        selectedLocation={selectedLocation}
        onLocationChange={onLocationChange}
      />

      <div style={{ padding: '0 16px 16px' }}>
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={onDateRangeChange}
        />
      </div>

      <NavigationMenu />

      <SidebarFooter />
    </aside>
  )
}
