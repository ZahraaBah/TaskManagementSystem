import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charge le fichier .env.server depuis la racine du projet
dotenv.config({ path: path.resolve(__dirname, '../.env.server') });

export default {
  schema: './src/db/schema.ts',
  out: './drizzle', // ← Changé pour être cohérent avec la structure
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
