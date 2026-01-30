'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

interface ErrorToastProps {
  message: string | null
  onClose: () => void
  duration?: number
}

export function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [message, onClose, duration])

  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
        background: '#1a0a0a',
        border: '1px solid #b35555',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <AlertCircle size={20} style={{ color: '#b35555', flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#e5e5e5', marginBottom: '4px' }}>
          Error
        </p>
        <p style={{ fontSize: '13px', color: '#a3a3a3', lineHeight: '1.5' }}>{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        aria-label="Close error message"
        style={{
          background: 'none',
          border: 'none',
          color: '#737373',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        <X size={16} />
      </button>
    </div>
  )
}
