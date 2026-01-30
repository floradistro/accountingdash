import { z } from 'zod'
import { baseAnalyticsQuerySchema, viewSchema, uuidSchema, sortOrderSchema } from './common.schemas'

/**
 * Staff Analytics validation schemas
 */

// Staff performance query
export const staffPerformanceQuerySchema = baseAnalyticsQuerySchema.extend({
  view: viewSchema(['summary', 'daily', 'leaderboard', 'employee']).default('summary'),
  employeeId: uuidSchema.optional(),
  minRevenue: z.number().min(0).optional(),
  minOrders: z.number().int().min(0).optional(),
  sortBy: z.enum(['revenue', 'orders', 'profit', 'aov']).default('revenue'),
  limit: z.number().int().min(1).max(100).default(20),
})

export type StaffPerformanceQuery = z.infer<typeof staffPerformanceQuerySchema>

// Employee detail query
export const employeeDetailQuerySchema = z.object({
  employeeId: uuidSchema,
  storeId: z.union([z.literal('all'), uuidSchema]).optional(),
  days: z.number().int().min(1).max(365).default(30),
})

export type EmployeeDetailQuery = z.infer<typeof employeeDetailQuerySchema>

// Staff leaderboard query
export const staffLeaderboardQuerySchema = z.object({
  storeId: z.union([z.literal('all'), uuidSchema]).optional(),
  days: z.number().int().min(1).max(365).default(30),
  sortBy: z.enum(['revenue', 'orders', 'profit', 'aov']).default('revenue'),
  limit: z.number().int().min(1).max(100).default(20),
})

export type StaffLeaderboardQuery = z.infer<typeof staffLeaderboardQuerySchema>
