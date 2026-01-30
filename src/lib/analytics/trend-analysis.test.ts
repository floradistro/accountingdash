import { analyzeTrend } from './trend-analysis'

describe('analyzeTrend', () => {
  it('should detect upward trends', () => {
    const data = [100, 110, 120, 130, 140]
    const trend = analyzeTrend(data)

    expect(trend.direction).toBe('up')
    expect(trend.slope).toBeGreaterThan(0)
    expect(trend.strength).toBe('strong')
  })

  it('should detect downward trends', () => {
    const data = [140, 130, 120, 110, 100]
    const trend = analyzeTrend(data)

    expect(trend.direction).toBe('down')
    expect(trend.slope).toBeLessThan(0)
    expect(trend.strength).toBe('strong')
  })

  it('should detect flat trends', () => {
    const data = [100, 101, 100, 99, 100]
    const trend = analyzeTrend(data)

    expect(trend.direction).toBe('flat')
  })

  it('should handle insufficient data', () => {
    const data = [100, 110]
    const trend = analyzeTrend(data)

    expect(trend.direction).toBe('flat')
    expect(trend.strength).toBe('weak')
    expect(trend.confidence).toBe(0)
  })

  it('should categorize trend strength correctly', () => {
    // Weak trend (small changes)
    const weakData = [100, 101, 102, 103, 104]
    const weakTrend = analyzeTrend(weakData)
    expect(weakTrend.strength).toBe('weak')

    // Moderate trend
    const moderateData = [100, 104, 108, 112, 116]
    const moderateTrend = analyzeTrend(moderateData)
    expect(['moderate', 'strong']).toContain(moderateTrend.strength)

    // Strong trend (large consistent changes)
    const strongData = [100, 110, 120, 130, 140]
    const strongTrend = analyzeTrend(strongData)
    expect(strongTrend.strength).toBe('strong')
  })

  it('should calculate slope correctly', () => {
    const data = [100, 110, 120, 130, 140]
    const trend = analyzeTrend(data)

    // Slope should be positive for upward trend
    expect(trend.slope).toBeGreaterThan(0)
    expect(trend.direction).toBe('up')
  })
})
