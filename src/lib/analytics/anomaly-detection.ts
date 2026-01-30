/**
 * Anomaly Detection System
 * Identifies unusual patterns and outliers in business metrics
 */

import { mean, standardDeviation, quantile } from 'simple-statistics'

export interface Anomaly {
  index: number
  value: number
  expected: number
  deviation: number
  severity: 'critical' | 'warning' | 'info'
  method: 'zscore' | 'iqr' | 'mad'
}

export interface AnomalyResult {
  anomalies: Anomaly[]
  totalPoints: number
  anomalyRate: number
  summary: string
}

/**
 * Z-Score Method
 * Detects anomalies based on standard deviations from mean
 */
export function detectAnomaliesZScore(
  data: number[],
  threshold: number = 2.5
): Anomaly[] {
  if (data.length < 3) return []

  const avg = mean(data)
  const stdDev = standardDeviation(data)

  const anomalies: Anomaly[] = []

  data.forEach((value, index) => {
    const zScore = Math.abs((value - avg) / stdDev)

    if (zScore > threshold) {
      let severity: 'critical' | 'warning' | 'info'
      if (zScore > 3.5) severity = 'critical'
      else if (zScore > 2.5) severity = 'warning'
      else severity = 'info'

      anomalies.push({
        index,
        value,
        expected: avg,
        deviation: zScore,
        severity,
        method: 'zscore',
      })
    }
  })

  return anomalies
}

/**
 * IQR (Interquartile Range) Method
 * More robust to extreme outliers than z-score
 */
export function detectAnomaliesIQR(data: number[]): Anomaly[] {
  if (data.length < 4) return []

  const sorted = [...data].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1

  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  const anomalies: Anomaly[] = []

  data.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      const median = quantile(sorted, 0.5)
      const deviation = Math.abs(value - median) / iqr

      let severity: 'critical' | 'warning' | 'info'
      if (value < q1 - 3 * iqr || value > q3 + 3 * iqr) severity = 'critical'
      else if (value < q1 - 2 * iqr || value > q3 + 2 * iqr) severity = 'warning'
      else severity = 'info'

      anomalies.push({
        index,
        value,
        expected: median,
        deviation,
        severity,
        method: 'iqr',
      })
    }
  })

  return anomalies
}

/**
 * MAD (Median Absolute Deviation) Method
 * Very robust to outliers
 */
export function detectAnomaliesMAD(
  data: number[],
  threshold: number = 3.5
): Anomaly[] {
  if (data.length < 3) return []

  const sorted = [...data].sort((a, b) => a - b)
  const median = quantile(sorted, 0.5)

  // Calculate absolute deviations from median
  const absoluteDeviations = data.map((value) => Math.abs(value - median))
  const mad = quantile(absoluteDeviations.sort((a, b) => a - b), 0.5)

  // Modified z-score
  const anomalies: Anomaly[] = []

  data.forEach((value, index) => {
    const modifiedZScore = mad === 0 ? 0 : (0.6745 * (value - median)) / mad

    if (Math.abs(modifiedZScore) > threshold) {
      let severity: 'critical' | 'warning' | 'info'
      if (Math.abs(modifiedZScore) > 5) severity = 'critical'
      else if (Math.abs(modifiedZScore) > 3.5) severity = 'warning'
      else severity = 'info'

      anomalies.push({
        index,
        value,
        expected: median,
        deviation: Math.abs(modifiedZScore),
        severity,
        method: 'mad',
      })
    }
  })

  return anomalies
}

/**
 * Combined Anomaly Detection
 * Uses multiple methods for higher confidence
 */
export function detectAnomalies(
  data: number[],
  method: 'zscore' | 'iqr' | 'mad' | 'ensemble' = 'ensemble'
): AnomalyResult {
  if (data.length < 3) {
    return {
      anomalies: [],
      totalPoints: data.length,
      anomalyRate: 0,
      summary: 'Insufficient data for anomaly detection',
    }
  }

  let anomalies: Anomaly[]

  if (method === 'ensemble') {
    // Use all methods and find consensus
    const zScoreAnomalies = detectAnomaliesZScore(data)
    const iqrAnomalies = detectAnomaliesIQR(data)
    const madAnomalies = detectAnomaliesMAD(data)

    // Find indices that appear in at least 2 methods
    const anomalyIndices = new Map<number, Anomaly[]>()

    ;[...zScoreAnomalies, ...iqrAnomalies, ...madAnomalies].forEach((anomaly) => {
      if (!anomalyIndices.has(anomaly.index)) {
        anomalyIndices.set(anomaly.index, [])
      }
      anomalyIndices.get(anomaly.index)!.push(anomaly)
    })

    // Keep only anomalies detected by 2+ methods
    anomalies = []
    anomalyIndices.forEach((detections, index) => {
      if (detections.length >= 2) {
        // Use the most severe detection
        const mostSevere = detections.sort((a, b) => {
          const severityOrder = { critical: 3, warning: 2, info: 1 }
          return severityOrder[b.severity] - severityOrder[a.severity]
        })[0]
        anomalies.push(mostSevere)
      }
    })
  } else if (method === 'zscore') {
    anomalies = detectAnomaliesZScore(data)
  } else if (method === 'iqr') {
    anomalies = detectAnomaliesIQR(data)
  } else {
    anomalies = detectAnomaliesMAD(data)
  }

  const anomalyRate = (anomalies.length / data.length) * 100

  let summary = ''
  if (anomalies.length === 0) {
    summary = 'No significant anomalies detected'
  } else if (anomalyRate < 5) {
    summary = `${anomalies.length} minor anomalies detected (${anomalyRate.toFixed(1)}% of data)`
  } else if (anomalyRate < 15) {
    summary = `${anomalies.length} anomalies detected - investigate unusual patterns`
  } else {
    summary = `High anomaly rate (${anomalyRate.toFixed(1)}%) - data quality issues or significant business changes`
  }

  return {
    anomalies: anomalies.sort((a, b) => a.index - b.index),
    totalPoints: data.length,
    anomalyRate,
    summary,
  }
}

/**
 * Time-based anomaly detection
 * Detects anomalies considering temporal context
 */
export function detectTimeBasedAnomalies(
  data: { date: string; value: number }[],
  windowSize: number = 7
): AnomalyResult {
  if (data.length < windowSize) {
    return detectAnomalies(data.map((d) => d.value))
  }

  const anomalies: Anomaly[] = []

  data.forEach((point, index) => {
    if (index < windowSize) return

    // Get rolling window
    const window = data.slice(index - windowSize, index).map((d) => d.value)
    const windowMean = mean(window)
    const windowStd = standardDeviation(window)

    // Check if current value is anomalous compared to recent window
    const zScore = Math.abs((point.value - windowMean) / windowStd)

    if (zScore > 2.5) {
      let severity: 'critical' | 'warning' | 'info'
      if (zScore > 4) severity = 'critical'
      else if (zScore > 3) severity = 'warning'
      else severity = 'info'

      anomalies.push({
        index,
        value: point.value,
        expected: windowMean,
        deviation: zScore,
        severity,
        method: 'zscore',
      })
    }
  })

  return {
    anomalies,
    totalPoints: data.length,
    anomalyRate: (anomalies.length / data.length) * 100,
    summary: `Rolling window anomaly detection (${windowSize}-day window)`,
  }
}
