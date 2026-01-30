import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Store, StorePerformance, DailySales, DailyAuditSummary, SafeBalance, Location } from '@/lib/supabase'

export interface WoWMetrics {
  current: {
    startDate: string
    endDate: string
    orders: number
    revenue: number
    profit: number
  }
  previous: {
    startDate: string
    endDate: string
    orders: number
    revenue: number
    profit: number
  }
  comparison: {
    revenueChange: number
    revenueChangePercent: number
    ordersChange: number
  }
}

interface DashboardState {
  stores: Store[]
  locations: Location[]
  selectedStore: string
  selectedLocation: string
  dateFrom: string | null
  dateTo: string | null
  performance: StorePerformance[]
  dailySales: DailySales[]
  auditSummary: DailyAuditSummary[]
  safeBalances: SafeBalance[]
  wowMetrics: WoWMetrics | null
  isLoading: boolean
  error: string | null

  setSelectedStore: (storeId: string) => void
  setSelectedLocation: (locationId: string) => void
  setDateRange: (from: string | null, to: string | null) => void
  fetchStores: () => Promise<void>
  fetchLocations: () => Promise<void>
  fetchPerformance: (storeId?: string) => Promise<void>
  fetchDailySales: (storeId?: string, days?: number) => Promise<void>
  fetchAuditSummary: (storeId?: string, days?: number) => Promise<void>
  fetchSafeBalances: (storeId?: string) => Promise<void>
  fetchWoWMetrics: () => Promise<void>
  fetchAll: (storeId?: string) => Promise<void>
  getLocationName: (locationId: string) => string
  getFilteredDailySales: () => DailySales[]
  getFilteredLocations: () => Location[]
  getDateRangeDays: () => number
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
  stores: [],
  locations: [],
  selectedStore: 'all',
  selectedLocation: 'all',
  dateFrom: null,
  dateTo: null,
  performance: [],
  dailySales: [],
  auditSummary: [],
  safeBalances: [],
  wowMetrics: null,
  isLoading: false,
  error: null,

  setSelectedStore: (storeId) => {
    set({ selectedStore: storeId, selectedLocation: 'all' })
    get().fetchAll(storeId === 'all' ? undefined : storeId)
  },

  setSelectedLocation: (locationId) => {
    set({ selectedLocation: locationId })
  },

  setDateRange: (from, to) => {
    set({ dateFrom: from, dateTo: to })
    // Refetch data with new date range
    const { selectedStore } = get()
    get().fetchAll(selectedStore === 'all' ? undefined : selectedStore)
  },

  fetchStores: async () => {
    try {
      const response = await fetch('/api/stores')
      if (!response.ok) throw new Error('Failed to fetch stores')
      const data = await response.json()
      set({ stores: data })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchLocations: async () => {
    try {
      const response = await fetch('/api/locations')
      if (!response.ok) throw new Error('Failed to fetch locations')
      const data = await response.json()
      set({ locations: data })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchPerformance: async (storeId) => {
    try {
      const url = storeId ? `/api/accounting/performance?storeId=${storeId}` : '/api/accounting/performance'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch performance')
      const data = await response.json()
      set({ performance: data })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchDailySales: async (storeId) => {
    try {
      const { dateFrom, dateTo } = get()
      const days = dateFrom && dateTo ? get().getDateRangeDays() : 30

      let url = `/api/accounting/daily-sales?days=${days}`
      if (storeId) url += `&storeId=${storeId}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch daily sales')
      const data = await response.json()
      set({ dailySales: data })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchAuditSummary: async (storeId) => {
    try {
      const { dateFrom, dateTo } = get()
      const days = dateFrom && dateTo ? get().getDateRangeDays() : 30

      let url = `/api/accounting/audit?days=${days}`
      if (storeId) url += `&storeId=${storeId}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch audit summary')
      const data = await response.json()
      set({ auditSummary: data })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchSafeBalances: async (storeId) => {
    try {
      const url = storeId ? `/api/accounting/safe-balances?storeId=${storeId}` : '/api/accounting/safe-balances'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch safe balances')
      const data = await response.json()
      set({ safeBalances: data })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchWoWMetrics: async () => {
    try {
      const response = await fetch('/api/metrics/wow')
      if (!response.ok) throw new Error('Failed to fetch WoW metrics')
      const data = await response.json()
      set({ wowMetrics: data })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchAll: async (storeId) => {
    set({ isLoading: true, error: null })
    try {
      await Promise.all([
        get().fetchPerformance(storeId),
        get().fetchDailySales(storeId),
        get().fetchAuditSummary(storeId),
        get().fetchSafeBalances(storeId),
        get().fetchWoWMetrics(),
      ])
    } finally {
      set({ isLoading: false })
    }
  },

  getLocationName: (locationId: string) => {
    const location = get().locations.find(l => l.id === locationId)
    return location?.name || 'Unknown'
  },

  getFilteredDailySales: () => {
    const { dailySales, selectedLocation } = get()
    if (selectedLocation === 'all') return dailySales
    return dailySales.filter(s => s.location_id === selectedLocation)
  },

  getFilteredLocations: () => {
    const { locations, selectedStore, stores } = get()
    if (selectedStore === 'all') return locations
    return locations.filter(l => l.store_id === selectedStore)
  },

  getDateRangeDays: () => {
    const { dateFrom, dateTo } = get()
    if (!dateFrom || !dateTo) return 30 // Default to 30 days
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(diffDays, 1)
  },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        selectedStore: state.selectedStore,
        selectedLocation: state.selectedLocation,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
      }),
    }
  )
)
