import { create } from 'zustand'
import { buildAPIUrl, handleStoreError } from '@/lib/store-helpers'
import type { StaffPerformance, StaffDailyPerformance, StaffLeaderboard } from '@/lib/supabase'

/**
 * Staff Analytics Store
 * Enterprise pattern: Centralized state management
 */

interface StaffState {
  // State
  staffPerformance: StaffPerformance[]
  staffDaily: StaffDailyPerformance[]
  staffLeaderboard: StaffLeaderboard[]
  staffLoading: boolean
  error: string | null

  // Actions
  fetchStaffPerformance: (storeId?: string, days?: number) => Promise<void>
  fetchStaffDaily: (storeId?: string, days?: number) => Promise<void>
  fetchStaffLeaderboard: (storeId?: string, days?: number, sortBy?: 'revenue' | 'orders' | 'profit' | 'aov') => Promise<void>
  fetchAllStaff: (storeId?: string, days?: number) => Promise<void>
}

export const useStaffStore = create<StaffState>((set, get) => ({
  // Initial State
  staffPerformance: [],
  staffDaily: [],
  staffLeaderboard: [],
  staffLoading: false,
  error: null,

  // Actions
  fetchStaffPerformance: async (storeId, days = 30) => {
    try {
      const url = buildAPIUrl('/api/staff', { view: 'summary', days, storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch staff performance')
      const data = await response.json()
      set({ staffPerformance: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchStaffPerformance') })
    }
  },

  fetchStaffDaily: async (storeId, days = 30) => {
    try {
      const url = buildAPIUrl('/api/staff', { view: 'daily', days, storeId })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch staff daily performance')
      const data = await response.json()
      set({ staffDaily: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchStaffDaily') })
    }
  },

  fetchStaffLeaderboard: async (storeId, days = 30, sortBy = 'revenue') => {
    try {
      const url = buildAPIUrl('/api/staff', { view: 'leaderboard', days, storeId, sortBy })
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch staff leaderboard')
      const data = await response.json()
      set({ staffLeaderboard: data })
    } catch (error) {
      set({ error: handleStoreError(error, 'fetchStaffLeaderboard') })
    }
  },

  fetchAllStaff: async (storeId, days = 30) => {
    set({ staffLoading: true, error: null })
    try {
      await Promise.all([
        get().fetchStaffPerformance(storeId, days),
        get().fetchStaffDaily(storeId, days),
        get().fetchStaffLeaderboard(storeId, days),
      ])
    } finally {
      set({ staffLoading: false })
    }
  },
}))
