import { useEffect } from 'react'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useShallow } from 'zustand/react/shallow'

export function usePageSetup() {
  // Use shallow selector to prevent unnecessary re-renders
  const {
    stores,
    locations,
    selectedStore,
    selectedLocation,
    dateFrom,
    dateTo,
    isLoading,
    setSelectedStore,
    setSelectedLocation,
    setDateRange,
    fetchStores,
    fetchLocations,
  } = useDashboardStore(
    useShallow((state) => ({
      stores: state.stores,
      locations: state.locations,
      selectedStore: state.selectedStore,
      selectedLocation: state.selectedLocation,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      isLoading: state.isLoading,
      setSelectedStore: state.setSelectedStore,
      setSelectedLocation: state.setSelectedLocation,
      setDateRange: state.setDateRange,
      fetchStores: state.fetchStores,
      fetchLocations: state.fetchLocations,
    }))
  )

  // Only run once on mount - fetch functions are stable
  useEffect(() => {
    fetchStores()
    fetchLocations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    stores,
    locations,
    selectedStore,
    selectedLocation,
    dateFrom,
    dateTo,
    isLoading,
    onStoreChange: setSelectedStore,
    onLocationChange: setSelectedLocation,
    onDateRangeChange: setDateRange,
  }
}
