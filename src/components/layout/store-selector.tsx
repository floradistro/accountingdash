'use client'

import { Building2, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import type { Store } from '@/lib/supabase'

interface StoreSelectorProps {
  stores: Store[]
  selectedStore: string
  onStoreChange: (storeId: string) => void
}

export function StoreSelector({ stores, selectedStore, onStoreChange }: StoreSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentStore = stores.find(s => s.id === selectedStore)
  const displayName = selectedStore === 'all' ? 'All Stores' : currentStore?.store_name || 'Select Store'
  const logoUrl = currentStore?.logo_url

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div style={{ padding: '16px', paddingBottom: '8px' }} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Select store"
        aria-expanded={dropdownOpen}
        aria-haspopup="listbox"
        type="button"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setDropdownOpen(!dropdownOpen)
          } else if (e.key === 'Escape' && dropdownOpen) {
            setDropdownOpen(false)
          }
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={displayName}
              width={32}
              height={32}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <Building2 style={{ width: 16, height: 16, color: '#525252' }} />
          )}
        </div>
        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#e5e5e5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </p>
        </div>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: '#525252',
            transition: 'transform 0.15s ease',
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '76px',
            left: '16px',
            right: '16px',
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '4px',
            zIndex: 100,
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}
        >
          <button
            onClick={() => { onStoreChange('all'); setDropdownOpen(false) }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              background: selectedStore === 'all' ? 'rgba(255,255,255,0.06)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Building2 style={{ width: 12, height: 12, color: '#525252' }} />
            </div>
            <span style={{ fontSize: '13px', color: selectedStore === 'all' ? '#e5e5e5' : '#737373' }}>
              All Stores
            </span>
          </button>
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => { onStoreChange(store.id); setDropdownOpen(false) }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                border: 'none',
                background: selectedStore === store.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.store_name}
                    width={24}
                    height={24}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#525252' }}>
                    {store.store_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '13px', color: selectedStore === store.id ? '#e5e5e5' : '#737373' }}>
                {store.store_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
