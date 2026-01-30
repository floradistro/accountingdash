'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ReportBuilder } from '@/components/reports/report-builder'
import { ReportGenerator } from '@/components/reports/report-generator'
import { AnimatedPage } from '@/components/ui/animated'
import { usePageSetup } from '@/hooks/use-page-setup'
import { LayoutGrid, FileText } from 'lucide-react'

type ReportTab = 'builder' | 'templates'

export default function ReportsPage() {
  const pageSetup = usePageSetup()
  const [activeTab, setActiveTab] = useState<ReportTab>('builder')

  return (
    <DashboardLayout {...pageSetup}>
      <AnimatedPage>
        {/* Header with Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#e5e5e5', letterSpacing: '-0.01em' }}>
              Reports
            </h1>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px' }}>
              <button
                onClick={() => setActiveTab('builder')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: activeTab === 'builder' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: activeTab === 'builder' ? '#e5e5e5' : '#737373',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <LayoutGrid size={14} />
                Report Builder
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: activeTab === 'templates' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: activeTab === 'templates' ? '#e5e5e5' : '#737373',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FileText size={14} />
                Templates
              </button>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#525252' }}>
            {activeTab === 'builder'
              ? 'Build custom reports with any combination of dimensions and metrics'
              : 'Generate reports from pre-built templates'}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'builder' && <ReportBuilder />}
        {activeTab === 'templates' && <ReportGenerator />}
      </AnimatedPage>
    </DashboardLayout>
  )
}
