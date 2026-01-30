'use client'

import { useState } from 'react'
import { FileDown, FileSpreadsheet, FileText, FileJson, Calendar, X, ChevronDown } from 'lucide-react'
import { getAllTemplates, generateAndExport, ReportFormat, ReportRequest } from '@/lib/reports'
import { useDashboardStore } from '@/stores/dashboard.store'

export function ReportGenerator({ onClose }: { onClose?: () => void }) {
  const templates = getAllTemplates()
  const { dateFrom, dateTo } = useDashboardStore()
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || '')
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('excel')
  const [isGenerating, setIsGenerating] = useState(false)

  // Report options
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const [showOptions, setShowOptions] = useState(false)

  const template = templates.find((t) => t.id === selectedTemplate)

  const handleGenerate = async () => {
    if (!template) return

    setIsGenerating(true)

    const request: ReportRequest = {
      templateId: template.id,
      format: selectedFormat,
      filters: {
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
      },
      options: {
        includeCharts,
        includeRawData,
        includeSummary,
        orientation,
        pageSize: 'A4',
      },
    }

    await generateAndExport(request)
    setIsGenerating(false)

    if (onClose) {
      setTimeout(onClose, 1000)
    }
  }

  const formatIcons = {
    pdf: FileText,
    excel: FileSpreadsheet,
    csv: FileDown,
    json: FileJson,
  }

  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#e5e5e5',
            marginBottom: '4px',
          }}>
            Report Configuration
          </h2>
          <p style={{
            fontSize: '12px',
            color: '#525252',
          }}>
            Customize your report settings
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#737373',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div>
          {/* Template Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              color: '#737373',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Report Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {template && (
              <p style={{
                fontSize: '11px',
                color: '#525252',
                marginTop: '6px',
              }}>
                {template.description}
              </p>
            )}
          </div>

          {/* Format Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 500,
              color: '#737373',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}>
              Export Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {(['excel', 'pdf', 'csv', 'json'] as ReportFormat[]).map((format) => {
                if (template && !template.format.includes(format)) return null

                const Icon = formatIcons[format]
                const isSelected = selectedFormat === format

                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    style={{
                      padding: '12px',
                      background: isSelected ? 'rgba(255,255,255,0.06)' : '#0f0f0f',
                      border: `1px solid ${isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: isSelected ? '#e5e5e5' : '#737373' }}
                    />
                    <span style={{
                      fontSize: '12px',
                      color: isSelected ? '#e5e5e5' : '#737373',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                    }}>
                      {format}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date Range Info */}
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calendar size={12} style={{ color: '#525252' }} />
              <span style={{ fontSize: '10px', color: '#525252', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date Range
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#a3a3a3' }}>
              {dateFrom && dateTo
                ? `${new Date(dateFrom + 'T00:00:00').toLocaleDateString()} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString()}`
                : 'All available data'}
            </p>
          </div>
        </div>

        {/* Right Column - Options */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 500,
            color: '#737373',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            Report Options
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Include Summary */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px 12px',
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
            }}>
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#e5e5e5', marginBottom: '2px' }}>
                  Include Summary
                </div>
                <div style={{ fontSize: '10px', color: '#525252' }}>
                  Add totals and aggregates
                </div>
              </div>
            </label>

            {/* Include Charts */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px 12px',
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
            }}>
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#e5e5e5', marginBottom: '2px' }}>
                  Include Charts
                </div>
                <div style={{ fontSize: '10px', color: '#525252' }}>
                  Visual data representation
                </div>
              </div>
            </label>

            {/* Include Raw Data */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px 12px',
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
            }}>
              <input
                type="checkbox"
                checked={includeRawData}
                onChange={(e) => setIncludeRawData(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#e5e5e5', marginBottom: '2px' }}>
                  Include Raw Data
                </div>
                <div style={{ fontSize: '10px', color: '#525252' }}>
                  Detailed line-by-line data
                </div>
              </div>
            </label>

            {/* Orientation (PDF only) */}
            {selectedFormat === 'pdf' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 500,
                  color: '#525252',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  Page Orientation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setOrientation('portrait')}
                    style={{
                      padding: '8px',
                      background: orientation === 'portrait' ? 'rgba(255,255,255,0.06)' : '#0f0f0f',
                      border: `1px solid ${orientation === 'portrait' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '6px',
                      color: orientation === 'portrait' ? '#e5e5e5' : '#737373',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    style={{
                      padding: '8px',
                      background: orientation === 'landscape' ? 'rgba(255,255,255,0.06)' : '#0f0f0f',
                      border: `1px solid ${orientation === 'landscape' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '6px',
                      color: orientation === 'landscape' ? '#e5e5e5' : '#737373',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Landscape
                  </button>
                </div>
              </div>
            )}

            {/* Group By */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 500,
                color: '#525252',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                Group Data By
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#0f0f0f',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  color: '#e5e5e5',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            flex: 1,
            padding: '12px 20px',
            background: isGenerating ? '#404040' : '#e5e5e5',
            color: isGenerating ? '#737373' : '#0a0a0a',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <FileDown size={16} />
          {isGenerating ? 'Generating...' : 'Generate & Download'}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              color: '#737373',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
