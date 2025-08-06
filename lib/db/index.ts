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

console.log('[Database] Connecting to Neon PostgreSQL')

const pool = new Pool({ connectionString })
export const db = drizzle(pool, { schema })

// Export schema types
export * from './schema'