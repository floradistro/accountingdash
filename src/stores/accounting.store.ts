import { create } from 'zustand'
import { buildAPIUrl, handleStoreError } from '@/lib/store-helpers'
import type {
  APSummary,
  APByVendor,
  APDetail,
  ARSummary,
  ARByCustomer,
  ARDetail,
  CashSummary,
  CashDaily,
  CashByLocation,
  CashByPaymentMethod,
  CashMonthly,
  InventorySummary,
  InventoryByLocation,
  InventoryByCategory,
  InventoryDetail,
  InventorySlowMoving,
} from '@/lib/supabase'

interface AccountingState {
  // AP State
  apSummary: APSummary | null
  apByVendor: APByVendor[]
  apDetail: APDetail[]
  apLoading: boolean

  // AR State
  arSummary: ARSummary | null
  arByCustomer: ARByCustomer[]
  arDetail: ARDetail[]
  arLoading: boolean

  // Cash State
  cashSummary: CashSummary | null
  cashDaily: CashDaily[]
  cashByLocation: CashByLocation[]
  cashByPaymentMethod: CashByPaymentMethod[]
  cashMonthly: CashMonthly[]
  cashLoading: boolean

  // Inventory State
  inventorySummary: InventorySummary | null
  inventoryByLocation: InventoryByLocation[]
  inventoryByCategory: InventoryByCategory[]
  inventoryDetail: InventoryDetail[]
  inventorySlowMoving: InventorySlowMoving[]
  inventoryLoading: boolean

  error: string | null

  // AP Actions
  fetchAPSummary: (storeId?: string) => Promise<void>
  fetchAPByVendor: (storeId?: string) => Promise<void>
  fetchAPDetail: (storeId?: string) => Promise<void>
  fetchAllAP: (storeId?: string) => Promise<void>

  // AR Actions
  fetchARSummary: (storeId?: string) => Promise<void>
  fetchARByCustomer: (storeId?: string) => Promise<void>
  fetchARDetail: (storeId?: string) => Promise<void>
  fetchAllAR: (storeId?: string) => Promise<void>

  // Cash Actions
  fetchCashSummary: (storeId?: string, days?: number) => Promise<void>
  fetchCashByLocation: (storeId?: string, days?: number) => Promise<void>
  fetchCashByPaymentMethod: (storeId?: string, days?: number) => Promise<void>
  fetchCashMonthly: (storeId?: string) => Promise<void>
  fetchAllCash: (storeId?: string, days?: number) => Promise<void>

  // Inventory Actions
  fetchInventorySummary: (storeId?: string) => Promise<void>
  fetchInventoryByLocation: (storeId?: string) => Promise<void>
  fetchInventoryByCategory: (storeId?: string) => Promise<void>
  fetchInventoryDetail: (storeId?: string, status?: string) => Promise<void>
  fetchInventorySlowMoving: (storeId?: string) => Promise<void>
  fetchAllInventory: (storeId?: string) => Promise<void>
}

export const useAccountingStore = create<AccountingState>((set, get) => ({
  // Initial State
  apSummary: null,
  apByVendor: [],
  apDetail: [],
  apLoading: false,

  arSummary: null,
  arByCustomer: [],
  arDetail: [],
  arLoading: false,

  cashSummary: null,
  cashDaily: [],
  cashByLocation: [],
  cashByPaymentMethod: [],
  cashMonthly: [],
  cashLoading: false,

  inventorySummary: null,
  inventoryByLocation: [],
  inventoryByCategory: [],
  inventoryDetail: [],
  inventorySlowMoving: [],
  inventoryLoading: false,

  error: null,

  // AP Actions - Optimized with helpers
  fetchAPSummary: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/ap', { view: 'summary', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch AP summary')
      const data = await response.json()
      set({ apSummary: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchAPSummary') })
    }
  },

  fetchAPByVendor: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/ap', { view: 'by-vendor', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch AP by vendor')
      const data = await response.json()
      set({ apByVendor: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchAPByVendor') })
    }
  },

  fetchAPDetail: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/ap', { view: 'detail', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch AP detail')
      const data = await response.json()
      set({ apDetail: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchAPDetail') })
    }
  },

  fetchAllAP: async (storeId) => {
    set({ apLoading: true, error: null })
    try {
      await Promise.all([
        get().fetchAPSummary(storeId),
        get().fetchAPByVendor(storeId),
        get().fetchAPDetail(storeId),
      ])
    } finally {
      set({ apLoading: false })
    }
  },

  // AR Actions - Optimized with helpers
  fetchARSummary: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/ar', { view: 'summary', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch AR summary')
      const data = await response.json()
      set({ arSummary: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchARSummary') })
    }
  },

  fetchARByCustomer: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/ar', { view: 'by-customer', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch AR by customer')
      const data = await response.json()
      set({ arByCustomer: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchARByCustomer') })
    }
  },

  fetchARDetail: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/ar', { view: 'detail', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch AR detail')
      const data = await response.json()
      set({ arDetail: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchARDetail') })
    }
  },

  fetchAllAR: async (storeId) => {
    set({ arLoading: true, error: null })
    try {
      await Promise.all([
        get().fetchARSummary(storeId),
        get().fetchARByCustomer(storeId),
        get().fetchARDetail(storeId),
      ])
    } finally {
      set({ arLoading: false })
    }
  },

  // Cash Actions - Optimized with helpers
  fetchCashSummary: async (storeId, days = 30) => {
    try {
      const url = buildAPIUrl('/api/accounting/cash', { view: 'summary', days, storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch cash summary')
      const data = await response.json()
      set({ cashSummary: data.summary, cashDaily: data.daily })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchCashSummary') })
    }
  },

  fetchCashByLocation: async (storeId, days = 30) => {
    try {
      const url = buildAPIUrl('/api/accounting/cash', { view: 'by-location', days, storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch cash by location')
      const data = await response.json()
      set({ cashByLocation: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchCashByLocation') })
    }
  },

  fetchCashByPaymentMethod: async (storeId, days = 30) => {
    try {
      const url = buildAPIUrl('/api/accounting/cash', { view: 'by-payment-method', days, storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch cash by payment method')
      const data = await response.json()
      set({ cashByPaymentMethod: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchCashByPaymentMethod') })
    }
  },

  fetchCashMonthly: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/cash', { view: 'monthly', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch monthly cash data')
      const data = await response.json()
      set({ cashMonthly: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchCashMonthly') })
    }
  },

  fetchAllCash: async (storeId, days = 30) => {
    set({ cashLoading: true, error: null })
    try {
      await Promise.all([
        get().fetchCashSummary(storeId, days),
        get().fetchCashByLocation(storeId, days),
        get().fetchCashByPaymentMethod(storeId, days),
        get().fetchCashMonthly(storeId),
      ])
    } finally {
      set({ cashLoading: false })
    }
  },

  // Inventory Actions - Optimized with helpers
  fetchInventorySummary: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/inventory', { view: 'summary', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch inventory summary')
      const data = await response.json()
      set({ inventorySummary: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchInventorySummary') })
    }
  },

  fetchInventoryByLocation: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/inventory', { view: 'by-location', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch inventory by location')
      const data = await response.json()
      set({ inventoryByLocation: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchInventoryByLocation') })
    }
  },

  fetchInventoryByCategory: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/inventory', { view: 'by-category', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch inventory by category')
      const data = await response.json()
      set({ inventoryByCategory: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchInventoryByCategory') })
    }
  },

  fetchInventoryDetail: async (storeId, status) => {
    try {
      const url = buildAPIUrl('/api/accounting/inventory', { view: 'detail', storeId, status })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch inventory detail')
      const data = await response.json()
      set({ inventoryDetail: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchInventoryDetail') })
    }
  },

  fetchInventorySlowMoving: async (storeId) => {
    try {
      const url = buildAPIUrl('/api/accounting/inventory', { view: 'slow-moving', storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch slow moving inventory')
      const data = await response.json()
      set({ inventorySlowMoving: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchInventorySlowMoving') })
    }
  },

  fetchAllInventory: async (storeId) => {
    set({ inventoryLoading: true, error: null })
    try {
      await Promise.all([
        get().fetchInventorySummary(storeId),
        get().fetchInventoryByLocation(storeId),
        get().fetchInventoryByCategory(storeId),
        get().fetchInventorySlowMoving(storeId),
      ])
    } finally {
      set({ inventoryLoading: false })
    }
  },
}))
