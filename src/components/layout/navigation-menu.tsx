'use client'

import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  ClipboardCheck,
  Vault,
  Receipt,
  FileText,
  Banknote,
  Package,
  Users,
  FileBarChart,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Revenue', href: '/revenue', icon: DollarSign },
  { name: 'P&L', href: '/pnl', icon: TrendingUp },
  { name: 'Audits', href: '/audits', icon: ClipboardCheck },
  { name: 'Safe', href: '/safe', icon: Vault },
  { name: 'Staff', href: '/staff', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileBarChart },
]

const accountingNav = [
  { name: 'Accounts Payable', href: '/ap', icon: Receipt },
  { name: 'Accounts Receivable', href: '/ar', icon: FileText },
  { name: 'Cash Management', href: '/cash', icon: Banknote },
  { name: 'Inventory Value', href: '/inventory', icon: Package },
]

export function NavigationMenu() {
  const pathname = usePathname()

  return (
    <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: isActive ? '#e5e5e5' : '#525252',
              }}
            >
              <item.icon style={{
                width: 16,
                height: 16,
                color: isActive ? '#a3a3a3' : '#404040',
              }} />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '10px', fontWeight: 600, color: '#404040', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: '8px' }}>
          Accounting
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {accountingNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: isActive ? '#e5e5e5' : '#525252',
                }}
              >
                <item.icon style={{
                  width: 16,
                  height: 16,
                  color: isActive ? '#a3a3a3' : '#404040',
                }} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
