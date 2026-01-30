/**
 * Date utility functions for date range calculations and formatting
 */

export function getDateRangeFromDays(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function parseAPIDate(dateString: string): Date {
  return new Date(dateString)
}

export function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateForAPI(date)
}

export function getToday(): string {
  return formatDateForAPI(new Date())
}

export function getMonthsAgo(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return formatDateForAPI(date)
}
