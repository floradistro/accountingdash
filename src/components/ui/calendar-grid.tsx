'use client'

interface CalendarGridProps {
  days: Date[]
  viewMonth: Date
  dateFrom: string | null
  dateTo: string | null
  onDayClick: (date: Date) => void
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function CalendarGrid({ days, viewMonth, dateFrom, dateTo, onDayClick }: CalendarGridProps) {
  return (
    <>
      {/* Day Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '4px',
      }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} style={{
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 500,
            color: '#404040',
            padding: '4px 0',
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
      }}>
        {days.map((day, idx) => {
          const dateStr = formatDate(day)
          const isCurrentMonth = day.getMonth() === viewMonth.getMonth()
          const isSelected = dateStr === dateFrom || dateStr === dateTo
          const isInRange = dateFrom && dateTo && dateStr > dateFrom && dateStr < dateTo
          const isToday = formatDate(new Date()) === dateStr

          return (
            <button
              key={idx}
              onClick={() => onDayClick(day)}
              style={{
                padding: '6px 4px',
                borderRadius: '4px',
                border: 'none',
                background: isSelected
                  ? '#404040'
                  : isInRange
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                color: isSelected
                  ? '#e5e5e5'
                  : isCurrentMonth
                    ? '#a3a3a3'
                    : '#2a2a2a',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                outline: isToday ? '1px solid #525252' : 'none',
              }}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </>
  )
}
