'use client'

import { Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SidebarFooter() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <Link
        href="/settings"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          textDecoration: 'none',
          background: pathname === '/settings' ? 'rgba(255,255,255,0.06)' : 'transparent',
          color: pathname === '/settings' ? '#e5e5e5' : '#525252',
        }}
      >
        <Settings style={{ width: 16, height: 16, color: '#404040' }} />
        Settings
      </Link>
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          background: 'transparent',
          color: '#525252',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <LogOut style={{ width: 16, height: 16, color: '#404040' }} />
        Sign out
      </button>
    </div>
  )
}
