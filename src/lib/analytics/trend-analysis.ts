/**
 * Trend Analysis & Pattern Detection
 * Identifies trends, momentum, and patterns in time series data
 */

import { linearRegression, standardDeviation, mean } from 'simple-statistics'

export interface TrendResult {
  direction: 'up' | 'down' | 'flat'
  strength: 'strong' | 'moderate' | 'weak'
  slope: number
  momentum: number
  confidence: number
}

export interface MovingAverageResult {
  date: string
  value: number
  sma: number // Simple Moving Average
  ema: number // Exponential Moving Average
}

/**
 * Calculate trend using linear regression
 */
export function analyzeTrend(data: number[]): TrendResult {
  if (data.length < 3) {
    return {
      direction: 'flat',
      strength: 'weak',
      slope: 0,
      momentum: 0,
      confidence: 0,
    }
  }

  // Prepare data for linear regression
  const points: [number, number][] = data.map((value, index) => [index, value])
  const regression = linearRegression(points)

  const slope = regression.m
  const stdDev = standardDeviation(data)
  const avg = mean(data)

  // Calculate normalized slope (as percentage of mean)
  const normalizedSlope = (slope / avg) * 100

  // Determine direction
  let direction: 'up' | 'down' | 'flat'
  if (Math.abs(normalizedSlope) < 1) {
    direction = 'flat'
  } else if (normalizedSlope > 0) {
    direction = 'up'
  } else {
    direction = 'down'
  }

  // Determine strength based on slope and variance
  const coefficientOfVariation = (stdDev / avg) * 100
  let strength: 'strong' | 'moderate' | 'weak'

  if (Math.abs(normalizedSlope) > 5 && coefficientOfVariation < 20) {
    strength = 'strong'
  } else if (Math.abs(normalizedSlope) > 2) {
    strength = 'moderate'
  } else {
    strength = 'weak'
  }

  // Calculate momentum (recent vs older data)
  const recentData = data.slice(-Math.floor(data.length / 3))
  const olderData = data.slice(0, Math.floor(data.length / 3))
  const momentum = mean(recentData) - mean(olderData)

  // Confidence based on R-squared
  const predicted = data.map((_, i) => regression.m * i + regression.b)
  const residuals = data.map((val, i) => val - predicted[i])
  const ssRes = residuals.reduce((sum, r) => sum + r * r, 0)
  const ssTot = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0)
  const rSquared = 1 - (ssRes / ssTot)
  const confidence = Math.max(0, Math.min(100, rSquared * 100))

  return {
    direction,
    strength,
    slope: normalizedSlope,
    momentum,
    confidence,
  }
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], window: number = 7): number[] {
  if (data.length < window) return data

  const sma: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      sma.push(data[i])
    } else {
      const slice = data.slice(i - window + 1, i + 1)
      sma.push(mean(slice))
    }
  }

  return sma
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], window: number = 7): number[] {
  if (data.length === 0) return []

  const alpha = 2 / (window + 1)
  const ema: number[] = [data[0]]

  for (let i = 1; i < data.length; i++) {
    ema.push(alpha * data[i] + (1 - alpha) * ema[i - 1])
  }

  return ema
}

/**
 * Calculate Rate of Change (ROC)
 */
export function calculateROC(data: number[], period: number = 7): number[] {
  const roc: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      roc.push(0)
    } else {
      const change = ((data[i] - data[i - period]) / data[i - period]) * 100
      roc.push(change)
    }
  }

  return roc
}

/**
 * Detect trend changes (reversals)
 */
export function detectTrendChanges(data: number[], sensitivity: number = 0.05): number[] {
  const changes: number[] = []

  for (let i = 2; i < data.length; i++) {
    const prev2 = data[i - 2]
    const prev1 = data[i - 1]
    const current = data[i]

    const change1 = (prev1 - prev2) / prev2
    const change2 = (current - prev1) / prev1

    // Detect reversal
    if (Math.abs(change1 - change2) > sensitivity) {
      if (change1 > 0 && change2 < 0) {
        changes.push(i) // Peak
      } else if (change1 < 0 && change2 > 0) {
        changes.push(i) // Trough
      }
    }
  }

  return changes
}
