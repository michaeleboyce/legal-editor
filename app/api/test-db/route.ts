import { NextResponse } from 'next/server'

interface TestResponse {
  timestamp: string
  hasDbUrl: boolean
  dbUrlLength: number
  nodeEnv: string | undefined
  urlCheck: {
    hasPostgresql: boolean
    hasNeon: boolean
    hasSslmode: boolean
  }
  dbImport?: string
  importError?: string
}

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL
    
    // Basic check
    const response: TestResponse = {
      timestamp: new Date().toISOString(),
      hasDbUrl: !!dbUrl,
      dbUrlLength: dbUrl?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      // Check if URL contains expected parts
      urlCheck: {
        hasPostgresql: dbUrl?.includes('postgresql://') || false,
        hasNeon: dbUrl?.includes('neon.tech') || false,
        hasSslmode: dbUrl?.includes('sslmode=') || false,
      }
    }
    
    // Try a simple import test
    try {
      await import('@/lib/db')
      response.dbImport = 'SUCCESS'
    } catch (e) {
      response.dbImport = 'FAILED'
      response.importError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({
      error: 'Endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}