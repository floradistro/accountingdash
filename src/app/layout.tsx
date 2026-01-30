import type { Metadata } from 'next'
import './globals.css'
import { ToastContainer } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: 'Accounting Dashboard',
  description: 'Flora Distribution Accounting Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
