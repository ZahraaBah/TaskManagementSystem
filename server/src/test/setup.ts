import { beforeAll, afterAll, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from '../db/schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Task } from '../db/schema'; // Import du type Task

dotenv.config({ path: '.env.test' });

let pool: Pool;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  console.log('🧪 Setting up test database...');

  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error('❌ Tests must use test database!');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  db = drizzle(pool, { schema });
  console.log('✅ Test database connected');
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  await db.execute(sql`TRUNCATE TABLE tasks CASCADE`);
});

afterAll(async () => {
  await pool?.end();
  console.log('✅ Test database closed');
});

// Helpers
export const createTestUser = async (
  email = 'test@example.com',
  password = 'password123'
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      password: hashedPassword,
    })
    .returning();

  return user;
};

// CORRIGÉ: Remplacer 'any' par un type partiel de Task
export const createTestTask = async (
  userId: string,
  overrides: Partial<
    Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  > = {}
) => {
  const [task] = await db
    .insert(schema.tasks)
    .values({
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      userId,
      ...overrides,
    })
    .returning();

  return task;
};

export const getAuthToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

export { db };
