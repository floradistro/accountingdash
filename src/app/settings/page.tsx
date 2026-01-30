'use client'

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useDashboardStore } from '@/stores/dashboard.store'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Database, RefreshCw, Moon } from 'lucide-react'

export default function SettingsPage() {
  const {
    stores,
    locations,
    selectedStore,
    selectedLocation,
    setSelectedStore,
    setSelectedLocation,
    fetchStores,
    fetchLocations,
  } = useDashboardStore()

  useEffect(() => {
    fetchStores()
    fetchLocations()
  }, [fetchStores, fetchLocations])

  return (
    <DashboardLayout
      stores={stores}
      locations={locations}
      selectedStore={selectedStore}
      selectedLocation={selectedLocation}
      onStoreChange={setSelectedStore}
      onLocationChange={setSelectedLocation}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#fafafa]">Settings</h1>
        <p className="text-sm text-[#71717a] mt-1">Configure your dashboard preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(86,173,255,0.1)]">
                <Database className="w-5 h-5 text-[#56ADFF]" />
              </div>
              <div>
                <CardTitle>Database Connection</CardTitle>
                <CardDescription>Connected to Supabase</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#a1a1aa]">Status</span>
                <span className="inline-flex items-center gap-2 text-sm text-[#59C76F]">
                  <span className="w-2 h-2 rounded-full bg-[#59C76F] animate-pulse"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#a1a1aa]">Host</span>
                <span className="text-sm text-[#fafafa] font-mono">db.uaednwpxursknmwdeejn.supabase.co</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(174,132,242,0.1)]">
                <Moon className="w-5 h-5 text-[#AE84F2]" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Visual preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#a1a1aa]">Theme</span>
                <span className="text-sm text-[#fafafa]">Dark Mode</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#a1a1aa]">Style</span>
                <span className="text-sm text-[#fafafa]">Glass Morphism</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(89,199,111,0.1)]">
                <RefreshCw className="w-5 h-5 text-[#59C76F]" />
              </div>
              <div>
                <CardTitle>Data Refresh</CardTitle>
                <CardDescription>Manage data sync</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#a1a1aa]">Auto-refresh</span>
                <span className="text-sm text-[#fafafa]">Every 5 minutes</span>
              </div>
              <Button variant="secondary" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgba(242,199,73,0.1)]">
                <Settings className="w-5 h-5 text-[#F2C749]" />
              </div>
              <div>
                <CardTitle>System Info</CardTitle>
                <CardDescription>Application details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#a1a1aa]">Version</span>
                <span className="text-sm text-[#fafafa]">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#a1a1aa]">Stack</span>
                <span className="text-sm text-[#fafafa]">Next.js + Supabase</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
