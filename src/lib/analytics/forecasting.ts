/**
 * Revenue Forecasting & Prediction
 * Implements multiple forecasting methods for business metrics
 */

import { mean, standardDeviation } from 'simple-statistics'
import { addDays, format } from 'date-fns'

export interface ForecastPoint {
  date: string
  forecast: number
  confidenceLower: number
  confidenceUpper: number
  method: 'exponential' | 'linear' | 'seasonal'
}

export interface SeasonalPattern {
  dayOfWeek: number
  multiplier: number
}

/**
 * Exponential Smoothing Forecast
 * Good for data with trends but no strong seasonality
 */
export function exponentialSmoothing(
  historicalData: number[],
  alpha: number = 0.3,
  forecastPeriods: number = 30
): number[] {
  if (historicalData.length === 0) return []

  const forecast: number[] = [historicalData[0]]

  // Calculate smoothed values for historical data
  for (let i = 1; i < historicalData.length; i++) {
    const smoothed = alpha * historicalData[i] + (1 - alpha) * forecast[i - 1]
    forecast.push(smoothed)
  }

  // Extend forecast into future
  const lastValue = forecast[forecast.length - 1]
  for (let i = 0; i < forecastPeriods; i++) {
    forecast.push(lastValue)
  }

  return forecast.slice(historicalData.length)
}

/**
 * Double Exponential Smoothing (Holt's Method)
 * Accounts for both level and trend
 */
export function doubleExponentialSmoothing(
  historicalData: number[],
  alpha: number = 0.3,
  beta: number = 0.1,
  forecastPeriods: number = 30
): number[] {
  if (historicalData.length < 2) return Array(forecastPeriods).fill(historicalData[0] || 0)

  let level = historicalData[0]
  let trend = historicalData[1] - historicalData[0]

  const forecast: number[] = []

  // Calculate for historical data
  for (let i = 1; i < historicalData.length; i++) {
    const prevLevel = level
    level = alpha * historicalData[i] + (1 - alpha) * (level + trend)
    trend = beta * (level - prevLevel) + (1 - beta) * trend
  }

  // Generate future forecasts
  for (let i = 1; i <= forecastPeriods; i++) {
    forecast.push(level + i * trend)
  }

  return forecast
}

/**
 * Linear Regression Forecast
 * Simple trend-based prediction
 */
export function linearForecast(
  historicalData: number[],
  forecastPeriods: number = 30
): number[] {
  if (historicalData.length < 2) return Array(forecastPeriods).fill(historicalData[0] || 0)

  // Calculate slope and intercept
  const n = historicalData.length
  const xSum = (n * (n - 1)) / 2
  const ySum = historicalData.reduce((sum, val) => sum + val, 0)
  const xySum = historicalData.reduce((sum, val, i) => sum + val * i, 0)
  const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6

  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum)
  const intercept = (ySum - slope * xSum) / n

  // Generate forecasts
  const forecast: number[] = []
  for (let i = 0; i < forecastPeriods; i++) {
    const x = n + i
    forecast.push(slope * x + intercept)
  }

  return forecast
}

/**
 * Detect seasonal patterns (day of week)
 */
export function detectSeasonality(
  data: { date: string; value: number }[]
): SeasonalPattern[] {
  const dayPatterns: Record<number, number[]> = {}

  data.forEach((point) => {
    const dayOfWeek = new Date(point.date).getDay()
    if (!dayPatterns[dayOfWeek]) {
      dayPatterns[dayOfWeek] = []
    }
    dayPatterns[dayOfWeek].push(point.value)
  })

  const overallMean = mean(data.map((d) => d.value))

  return Object.entries(dayPatterns).map(([day, values]) => ({
    dayOfWeek: parseInt(day),
    multiplier: mean(values) / overallMean,
  }))
}

/**
 * Advanced Forecast with Confidence Intervals
 */
export function forecastWithConfidence(
  historicalData: { date: string; value: number }[],
  forecastDays: number = 30,
  confidenceLevel: number = 0.95
): ForecastPoint[] {
  if (historicalData.length < 7) {
    return []
  }

  const values = historicalData.map((d) => d.value)
  const lastDate = new Date(historicalData[historicalData.length - 1].date)

  // Use double exponential smoothing for base forecast
  const baseForecast = doubleExponentialSmoothing(values, 0.3, 0.1, forecastDays)

  // Calculate standard error
  const residuals: number[] = []
  const simpleMA = mean(values.slice(-7))
  values.slice(-7).forEach((val) => {
    residuals.push(val - simpleMA)
  })
  const stdError = standardDeviation(residuals)

  // Z-score for 95% confidence
  const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58

  // Detect seasonality
  const seasonalPatterns = detectSeasonality(historicalData)

  return baseForecast.map((forecastValue, index) => {
    const forecastDate = addDays(lastDate, index + 1)
    const dayOfWeek = forecastDate.getDay()

    // Apply seasonal adjustment
    const seasonalMultiplier = seasonalPatterns.find((p) => p.dayOfWeek === dayOfWeek)?.multiplier || 1
    const adjustedForecast = forecastValue * seasonalMultiplier

    // Confidence interval widens with distance
    const distanceFactor = 1 + index * 0.1
    const marginOfError = zScore * stdError * distanceFactor

    return {
      date: format(forecastDate, 'yyyy-MM-dd'),
      forecast: adjustedForecast,
      confidenceLower: Math.max(0, adjustedForecast - marginOfError),
      confidenceUpper: adjustedForecast + marginOfError,
      method: seasonalPatterns.length > 0 ? 'seasonal' : 'exponential',
    }
  })
}

/**
 * Calculate forecast accuracy metrics
 */
export function calculateForecastAccuracy(
  actual: number[],
  predicted: number[]
): {
  mae: number // Mean Absolute Error
  mape: number // Mean Absolute Percentage Error
  rmse: number // Root Mean Square Error
} {
  if (actual.length !== predicted.length || actual.length === 0) {
    return { mae: 0, mape: 0, rmse: 0 }
  }

  let sumAbsError = 0
  let sumAbsPercentError = 0
  let sumSquaredError = 0

  for (let i = 0; i < actual.length; i++) {
    const error = actual[i] - predicted[i]
    sumAbsError += Math.abs(error)
    sumAbsPercentError += Math.abs(error / actual[i]) * 100
    sumSquaredError += error * error
  }

  return {
    mae: sumAbsError / actual.length,
    mape: sumAbsPercentError / actual.length,
    rmse: Math.sqrt(sumSquaredError / actual.length),
  }
}
