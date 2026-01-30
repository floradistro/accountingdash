'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          style={{
            background: '#0f0f0f',
            border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            margin: '20px 0',
          }}
        >
          <AlertTriangle size={48} style={{ color: '#b35555', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#e5e5e5', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '14px', color: '#737373', marginBottom: '16px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              padding: '8px 16px',
              color: '#e5e5e5',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#252525'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a1a1a'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Convenience wrapper for sections
export function ErrorBoundarySection({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div
          style={{
            background: '#0f0f0f',
            border: '1px solid rgba(255,100,100,0.2)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '13px', color: '#737373' }}>Failed to load this section</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
