/**
 * Factory function for creating standardized fetch methods in Zustand stores
 * Reduces boilerplate for API calls
 */

interface FetchOptions {
  endpoint: string
  view?: string
  stateKey: string
  errorPrefix: string
  additionalParams?: Record<string, string | number>
}

export function createFetchMethod(options: FetchOptions) {
  return async (storeId?: string, additionalArgs?: Record<string, any>) => {
    const params = new URLSearchParams()

    if (options.view) {
      params.append('view', options.view)
    }

    if (storeId) {
      params.append('storeId', storeId)
    }

    if (options.additionalParams) {
      Object.entries(options.additionalParams).forEach(([key, value]) => {
        params.append(key, String(value))
      })
    }

    if (additionalArgs) {
      Object.entries(additionalArgs).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value))
        }
      })
    }

    const url = `${options.endpoint}?${params.toString()}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`${options.errorPrefix}: ${response.statusText}`)
      }
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : options.errorPrefix
      }
    }
  }
}

/**
 * Creates a batch fetch method that runs multiple fetches in parallel
 */
export function createBatchFetch(
  fetchMethods: Array<(storeId?: string, ...args: any[]) => Promise<any>>,
  loadingStateKey: string
) {
  return async (set: any, get: any, storeId?: string, ...args: any[]) => {
    set({ [loadingStateKey]: true, error: null })
    try {
      await Promise.all(fetchMethods.map(fn => fn.call(get(), storeId, ...args)))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Batch fetch failed' })
    } finally {
      set({ [loadingStateKey]: false })
    }
  }
}

/**
 * Standard error handler for store methods
 */
export function handleStoreError(error: unknown, context: string): string {
  console.error(`Store error in ${context}:`, error)
  return error instanceof Error ? error.message : `${context} failed`
}

/**
 * Build URL with query parameters
 */
export function buildAPIUrl(
  endpoint: string,
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${endpoint}?${queryString}` : endpoint
}
