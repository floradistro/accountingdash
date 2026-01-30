'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore, Toast as ToastType } from '@/stores/toast.store'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastColors = {
  success: { bg: 'rgba(89, 199, 111, 0.1)', border: 'rgba(89, 199, 111, 0.3)', icon: '#59C76F' },
  error: { bg: 'rgba(243, 99, 104, 0.1)', border: 'rgba(243, 99, 104, 0.3)', icon: '#F36368' },
  warning: { bg: 'rgba(242, 199, 73, 0.1)', border: 'rgba(242, 199, 73, 0.3)', icon: '#F2C749' },
  info: { bg: 'rgba(86, 173, 255, 0.1)', border: 'rgba(86, 173, 255, 0.3)', icon: '#56ADFF' },
}

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToastStore()
  const Icon = toastIcons[toast.type]
  const colors = toastColors[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '420px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <Icon size={20} style={{ color: colors.icon, flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#e5e5e5', marginBottom: toast.message ? '4px' : 0 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: '13px', color: '#a3a3a3', lineHeight: '1.5' }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: '#737373',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <X size={16} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} style={{ marginBottom: '12px' }}>
              <ToastItem toast={toast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Helper function for easy toast creation
export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'success', title, message, duration }),
  error: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'error', title, message, duration }),
  warning: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, duration }),
  info: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: 'info', title, message, duration }),
}
