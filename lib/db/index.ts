import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'

// For Node.js environments, we need to configure WebSocket
if (typeof WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ws = require('ws')
  neonConfig.webSocketConstructor = ws
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create connection pool with optimized settings for serverless
const pool = new Pool({ 
  connectionString,
  // Connection pool configuration
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 10, // Maximum number of clients in the pool
})

export const db = drizzle(pool, { schema })

// Export schema types
export * from './schema'