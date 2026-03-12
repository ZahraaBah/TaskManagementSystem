import { beforeAll, afterAll, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

if (!process.env.DATABASE_URL?.includes('_test')) {
  throw new Error(
    '❌ DATABASE_URL must contain "_test" to run tests safely. Check your .env.test file.'
  );
}

import { db } from '../db';
export { db };

beforeAll(async () => {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

beforeEach(async () => {
  try {
    await db.execute(sql`TRUNCATE TABLE tasks, users CASCADE`);
  } catch (error) {
    console.warn('⚠️  Could not truncate tables:', error);
  }
});

afterAll(async () => {
  console.log('✅ Tests complete');
});

export const createTestUser = async (
  email = 'test@example.com',
  password = 'password123'
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(schema.users)
    .values({ email, password: hashedPassword })
    .returning();
  return user;
};

export const createTestTask = async (
  userId: string,
  overrides: Record<string, unknown> = {}
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
