import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import * as path from "path";

const envPath = path.resolve(__dirname, '../../../.env.server');
dotenv.config({ path: envPath });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });