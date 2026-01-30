'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { DatePresets, getPresetRange } from './date-presets'
import { CalendarGrid } from './calendar-grid'
import { formatDate, formatDisplayDate, getMonthDays } from './calendar-utils'

interface DateRangePickerProps {
  dateFrom: string | null
  dateTo: string | null
  onChange: (from: string | null, to: string | null) => void
}

export function DateRangePicker({ dateFrom, dateTo, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selecting, setSelecting] = useState<'from' | 'to'>('from')
  const [viewMonth, setViewMonth] = useState(new Date())
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetClick = (preset: Parameters<typeof getPresetRange>[0]) => {
    const range = getPresetRange(preset)
    onChange(range.from, range.to)
    setIsOpen(false)
  }

  const handleDayClick = (date: Date) => {
    const dateStr = formatDate(date)

    if (selecting === 'from') {
      onChange(dateStr, dateTo)
      setSelecting('to')
    } else {
      if (dateFrom && dateStr < dateFrom) {
        onChange(dateStr, dateFrom)
      } else {
        onChange(dateFrom, dateStr)
      }
      setSelecting('from')
    }
  }

  const handleClear = () => {
    onChange(null, null)
    setIsOpen(false)
  }

  const navigateMonth = (delta: number) => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1))
  }

  const days = getMonthDays(viewMonth.getFullYear(), viewMonth.getMonth())
  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const displayText = dateFrom && dateTo
    ? `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`
    : 'Select dates'

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.04)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Calendar style={{ width: 14, height: 14, color: '#404040' }} />
        <span style={{
          flex: 1,
          textAlign: 'left',
          fontSize: '12px',
          fontWeight: 500,
          color: dateFrom ? '#737373' : '#525252',
        }}>
          {displayText}
        </span>
        {dateFrom && (
          <div
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: 12, height: 12, color: '#525252' }} />
          </div>
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '12px',
            zIndex: 100,
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            minWidth: '280px',
          }}
        >
          <DatePresets onPresetClick={handlePresetClick} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft style={{ width: 16, height: 16, color: '#525252' }} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#a3a3a3' }}>
              {monthName}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight style={{ width: 16, height: 16, color: '#525252' }} />
            </button>
          </div>

          <CalendarGrid
            days={days}
            viewMonth={viewMonth}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDayClick={handleDayClick}
          />

          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '11px', color: '#525252' }}>
              {selecting === 'from' ? 'Select start date' : 'Select end date'}
            </span>
            {dateFrom && dateTo && (
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#a3a3a3',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
