'use client'

import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Location } from '@/lib/supabase'

interface LocationSelectorProps {
  locations: Location[]
  selectedLocation: string
  onLocationChange: (locationId: string) => void
}

export function LocationSelector({ locations, selectedLocation, onLocationChange }: LocationSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLocation = locations.find(l => l.id === selectedLocation)
  const displayName = selectedLocation === 'all' ? 'All Locations' : currentLocation?.name || 'Select Location'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (locations.length === 0) return null

  return (
    <div style={{ padding: '0 16px 16px' }} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.04)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#737373',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </p>
        </div>
        <ChevronDown
          style={{
            width: 12,
            height: 12,
            color: '#404040',
            transition: 'transform 0.15s ease',
            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '120px',
            left: '16px',
            right: '16px',
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '4px',
            zIndex: 100,
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <button
            onClick={() => { onLocationChange('all'); setDropdownOpen(false) }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              background: selectedLocation === 'all' ? 'rgba(255,255,255,0.06)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '12px', color: selectedLocation === 'all' ? '#e5e5e5' : '#737373' }}>
              All Locations
            </span>
          </button>
          {locations.map((location) => (
            <button
              key={location.id}
              onClick={() => { onLocationChange(location.id); setDropdownOpen(false) }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                border: 'none',
                background: selectedLocation === location.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '12px', color: selectedLocation === location.id ? '#e5e5e5' : '#737373' }}>
                {location.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
