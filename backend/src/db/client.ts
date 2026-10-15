import { Pool } from 'pg'
import { env } from '../config/env.js'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error)
})
