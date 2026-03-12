import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// dotenv.config() is intentionally removed here.
// In production, environment variables are loaded by the app entry point (src/index.ts or server.ts).
// In tests, they are loaded by vitest.config.ts via loadEnv() before any module is imported.
// Calling dotenv.config() here would overwrite test env vars with .env (prod) values.

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
