import { formatCurrency, formatNumber, formatDate, formatPercent } from './utils'

describe('utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as currency (no decimals)', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235')
      expect(formatCurrency(0.99)).toBe('$1')
      expect(formatCurrency(1000000)).toBe('$1,000,000')
    })

    it('should format negative numbers as currency', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,235')
    })

    it('should format zero as currency', () => {
      expect(formatCurrency(0)).toBe('$0')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1234567)).toBe('1,234,567')
    })

    it('should handle decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
    })

    it('should handle string inputs', () => {
      expect(formatNumber('1234')).toBe('1,234')
    })
  })

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const formatted = formatDate(date)
      expect(formatted).toContain('Jan')
      // Date might be 14 or 15 depending on timezone
      expect(formatted.length).toBeGreaterThan(5)
    })

    it('should format date strings', () => {
      const formatted = formatDate('2024-01-15T00:00:00')
      expect(formatted).toContain('Jan')
      expect(formatted.length).toBeGreaterThan(5)
    })

    it('should handle null and undefined', () => {
      expect(formatDate(null)).toBe('—')
      expect(formatDate(undefined)).toBe('—')
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('—')
    })
  })

  describe('formatPercent', () => {
    it('should format percentages with default decimals', () => {
      expect(formatPercent(12.3)).toBe('+12.3%')
      expect(formatPercent(50.0)).toBe('+50.0%')
    })

    it('should format negative percentages', () => {
      expect(formatPercent(-12.3)).toBe('-12.3%')
    })

    it('should format percentages with custom decimals', () => {
      expect(formatPercent(12.34, 2)).toBe('+12.34%')
      expect(formatPercent(12.34, 0)).toBe('+12%')
    })
  })
})
