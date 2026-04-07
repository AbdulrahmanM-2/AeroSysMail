import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: '2.0.0',
    platform: 'AeroSys Business Autopilot',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      auth: 'operational',
      email: 'operational',
      deals: 'operational',
      invoicing: 'operational',
      analytics: 'operational',
    }
  })
}
