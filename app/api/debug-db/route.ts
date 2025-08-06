import { NextResponse } from 'next/server'
import { db, documents, lines } from '@/lib/db'
import { sql } from 'drizzle-orm'

interface DebugResults {
  timestamp: string
  environment: string | undefined
  databaseUrl: string
  connectionTest?: string
  tables?: unknown[]
  documentCount?: number
  lineCount?: number
  sampleDocument?: unknown
  databaseSize?: unknown
  documentColumns?: unknown[]
  error?: {
    message: string
    stack?: string[]
    type?: string
  }
}

export async function GET() {
  const results: DebugResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not Set',
  }

  try {
    // Test 1: Basic connection
    await db.execute(sql`SELECT 1 as ping`)
    results.connectionTest = 'SUCCESS'
    
    // Test 2: Check if tables exist
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `)
    results.tables = tablesResult.rows
    
    // Test 3: Count documents (without selecting large fields)
    const docCount = await db.select({ count: sql<number>`count(*)` }).from(documents)
    results.documentCount = docCount[0]?.count || 0
    
    // Test 4: Count lines
    const lineCount = await db.select({ count: sql<number>`count(*)` }).from(lines)
    results.lineCount = lineCount[0]?.count || 0
    
    // Test 5: Sample document (without originalPdf)
    const sampleDoc = await db.select({
      id: documents.id,
      name: documents.name,
      createdAt: documents.createdAt,
    }).from(documents).limit(1)
    results.sampleDocument = sampleDoc[0] || null
    
    // Test 6: Database size check
    const sizeResult = await db.execute(sql`
      SELECT 
        pg_database_size(current_database()) as db_size,
        pg_size_pretty(pg_database_size(current_database())) as db_size_pretty
    `)
    results.databaseSize = sizeResult.rows[0]
    
    // Test 7: Check column existence
    const columnsResult = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'documents'
      ORDER BY ordinal_position
    `)
    results.documentColumns = columnsResult.rows
    
  } catch (error) {
    results.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      type: error?.constructor?.name,
    }
  }

  return NextResponse.json(results, { 
    status: results.error ? 500 : 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}