/**
 * Period Comparisons (YoY, MoM, WoW)
 * Comparative analysis across different time periods
 */

import { subDays, subMonths, subYears, format, differenceInDays } from 'date-fns'

export interface ComparisonResult {
  current: number
  previous: number
  change: number
  changePercent: number
  direction: 'up' | 'down' | 'flat'
  isSignificant: boolean
}

export interface PeriodComparison {
  metric: string
  current: {
    value: number
    period: string
  }
  previous: {
    value: number
    period: string
  }
  comparison: ComparisonResult
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Determine if change is significant (threshold: 5%)
 */
export function isSignificantChange(
  changePercent: number,
  threshold: number = 5
): boolean {
  return Math.abs(changePercent) >= threshold
}

/**
 * Create comparison result
 */
export function createComparison(
  current: number,
  previous: number
): ComparisonResult {
  const change = current - previous
  const changePercent = calculatePercentageChange(current, previous)

  let direction: 'up' | 'down' | 'flat'
  if (Math.abs(changePercent) < 1) {
    direction = 'flat'
  } else if (changePercent > 0) {
    direction = 'up'
  } else {
    direction = 'down'
  }

  return {
    current,
    previous,
    change,
    changePercent,
    direction,
    isSignificant: isSignificantChange(changePercent),
  }
}

/**
 * Year-over-Year Comparison
 */
export function compareYoY(
  data: { date: string; value: number }[]
): PeriodComparison | null {
  if (data.length === 0) return null

  const today = new Date()
  const oneYearAgo = subYears(today, 1)

  // Get data from this year
  const thisYearData = data.filter((d) => new Date(d.date) >= oneYearAgo)
  const thisYearTotal = thisYearData.reduce((sum, d) => sum + d.value, 0)

  // Get data from last year (same period)
  const twoYearsAgo = subYears(today, 2)
  const lastYearData = data.filter(
    (d) => new Date(d.date) >= twoYearsAgo && new Date(d.date) < oneYearAgo
  )
  const lastYearTotal = lastYearData.reduce((sum, d) => sum + d.value, 0)

  if (lastYearData.length === 0) return null

  return {
    metric: 'Year-over-Year',
    current: {
      value: thisYearTotal,
      period: `${format(oneYearAgo, 'MMM yyyy')} - ${format(today, 'MMM yyyy')}`,
    },
    previous: {
      value: lastYearTotal,
      period: `${format(twoYearsAgo, 'MMM yyyy')} - ${format(oneYearAgo, 'MMM yyyy')}`,
    },
    comparison: createComparison(thisYearTotal, lastYearTotal),
  }
}

/**
 * Month-over-Month Comparison
 */
export function compareMoM(
  data: { date: string; value: number }[]
): PeriodComparison | null {
  if (data.length === 0) return null

  const today = new Date()
  const oneMonthAgo = subMonths(today, 1)
  const twoMonthsAgo = subMonths(today, 2)

  // This month
  const thisMonthData = data.filter((d) => new Date(d.date) >= oneMonthAgo)
  const thisMonthTotal = thisMonthData.reduce((sum, d) => sum + d.value, 0)

  // Last month
  const lastMonthData = data.filter(
    (d) => new Date(d.date) >= twoMonthsAgo && new Date(d.date) < oneMonthAgo
  )
  const lastMonthTotal = lastMonthData.reduce((sum, d) => sum + d.value, 0)

  if (lastMonthData.length === 0) return null

  return {
    metric: 'Month-over-Month',
    current: {
      value: thisMonthTotal,
      period: format(oneMonthAgo, 'MMMM yyyy'),
    },
    previous: {
      value: lastMonthTotal,
      period: format(twoMonthsAgo, 'MMMM yyyy'),
    },
    comparison: createComparison(thisMonthTotal, lastMonthTotal),
  }
}

/**
 * Week-over-Week Comparison
 */
export function compareWoW(
  data: { date: string; value: number }[]
): PeriodComparison | null {
  if (data.length === 0) return null

  const today = new Date()
  const oneWeekAgo = subDays(today, 7)
  const twoWeeksAgo = subDays(today, 14)

  // This week
  const thisWeekData = data.filter((d) => new Date(d.date) >= oneWeekAgo)
  const thisWeekTotal = thisWeekData.reduce((sum, d) => sum + d.value, 0)

  // Last week
  const lastWeekData = data.filter(
    (d) => new Date(d.date) >= twoWeeksAgo && new Date(d.date) < oneWeekAgo
  )
  const lastWeekTotal = lastWeekData.reduce((sum, d) => sum + d.value, 0)

  if (lastWeekData.length === 0) return null

  return {
    metric: 'Week-over-Week',
    current: {
      value: thisWeekTotal,
      period: `${format(oneWeekAgo, 'MMM d')} - ${format(today, 'MMM d, yyyy')}`,
    },
    previous: {
      value: lastWeekTotal,
      period: `${format(twoWeeksAgo, 'MMM d')} - ${format(oneWeekAgo, 'MMM d, yyyy')}`,
    },
    comparison: createComparison(thisWeekTotal, lastWeekTotal),
  }
}

/**
 * Day-over-Day Comparison
 */
export function compareDoD(
  data: { date: string; value: number }[]
): PeriodComparison | null {
  if (data.length < 2) return null

  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))

  const today = sorted[0]
  const yesterday = sorted[1]

  return {
    metric: 'Day-over-Day',
    current: {
      value: today.value,
      period: format(new Date(today.date), 'MMM d, yyyy'),
    },
    previous: {
      value: yesterday.value,
      period: format(new Date(yesterday.date), 'MMM d, yyyy'),
    },
    comparison: createComparison(today.value, yesterday.value),
  }
}

/**
 * Get all comparisons for a metric
 */
export function getAllComparisons(
  data: { date: string; value: number }[]
): {
  yoy: PeriodComparison | null
  mom: PeriodComparison | null
  wow: PeriodComparison | null
  dod: PeriodComparison | null
} {
  return {
    yoy: compareYoY(data),
    mom: compareMoM(data),
    wow: compareWoW(data),
    dod: compareDoD(data),
  }
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 */
export function calculateCAGR(
  startValue: number,
  endValue: number,
  years: number
): number {
  if (startValue <= 0 || years <= 0) return 0
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

/**
 * Calculate growth rate for any period
 */
export function calculateGrowthRate(
  data: { date: string; value: number }[]
): {
  dailyGrowthRate: number
  weeklyGrowthRate: number
  monthlyGrowthRate: number
} {
  if (data.length < 2) {
    return { dailyGrowthRate: 0, weeklyGrowthRate: 0, monthlyGrowthRate: 0 }
  }

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
  const startValue = sorted[0].value
  const endValue = sorted[sorted.length - 1].value
  const days = differenceInDays(new Date(sorted[sorted.length - 1].date), new Date(sorted[0].date))

  if (days === 0 || startValue === 0) {
    return { dailyGrowthRate: 0, weeklyGrowthRate: 0, monthlyGrowthRate: 0 }
  }

  const totalGrowth = (endValue - startValue) / startValue
  const dailyRate = (Math.pow(1 + totalGrowth, 1 / days) - 1) * 100
  const weeklyRate = (Math.pow(1 + totalGrowth, 7 / days) - 1) * 100
  const monthlyRate = (Math.pow(1 + totalGrowth, 30 / days) - 1) * 100

  return {
    dailyGrowthRate: dailyRate,
    weeklyGrowthRate: weeklyRate,
    monthlyGrowthRate: monthlyRate,
  }
}
