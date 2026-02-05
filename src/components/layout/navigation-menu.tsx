'use client'

import {
  FileBarChart,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Reports', href: '/reports', icon: FileBarChart },
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
    </nav>
  )
}
