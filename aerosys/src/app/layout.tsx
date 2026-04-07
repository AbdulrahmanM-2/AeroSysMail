import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AeroSys | Business Autopilot',
  description: 'Your AI-Powered Business Operator - Email, CRM, Invoicing & Analytics',
  keywords: ['email', 'crm', 'business', 'automation', 'AI'],
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="gradient-bg min-h-screen">{children}</body>
    </html>
  )
}
