import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../../app';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

const request = supertest(app);

const testUser = {
  email: 'integration@test.com',
  password: 'password123',
};

// Clean up function
const cleanupUser = async () => {
  try {
    await db.delete(users).where(eq(users.email, testUser.email));
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

beforeAll(async () => {
  await cleanupUser();
});

afterAll(async () => {
  await cleanupUser();
});

// Remove the beforeEach that cleans up before each test
// We want to control cleanup manually for tests that need persistence

describe('POST /api/auth/register', () => {
  it('should return 201 and token on successful registration', async () => {
    // Clean up before this specific test
    await cleanupUser();

    const res = await request.post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 400 if email is invalid', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 if password is too short', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ email: testUser.email, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 409 if email already exists', async () => {
    // Clean up before this specific test
    await cleanupUser();

    // First registration
    const res1 = await request.post('/api/auth/register').send(testUser);
    expect(res1.status).toBe(201);

    // Verify user exists in database
    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.email, testUser.email));
    expect(usersList.length).toBe(1);

    // Second attempt with same email - should fail with 409
    const res2 = await request.post('/api/auth/register').send(testUser);
    expect(res2.status).toBe(409);
    expect(res2.body.message).toBe('Email already in use');
  });

  it('response should conform to AuthResponseDto', async () => {
    // Clean up before this specific test
    await cleanupUser();

    const res = await request.post('/api/auth/register').send(testUser);

    expect(res.body).toMatchObject({
      accessToken: expect.any(String),
      user: {
        id: expect.any(String),
        email: testUser.email,
        createdAt: expect.any(String),
      },
    });
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Clean up and create a fresh user for login tests
    await cleanupUser();

    const registerRes = await request.post('/api/auth/register').send(testUser);
    expect(registerRes.status).toBe(201);
  });

  it('should return 200 and token on valid credentials', async () => {
    const res = await request.post('/api/auth/login').send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 on invalid password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 401 if user does not exist', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'unknown@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if body is invalid', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('response should conform to AuthResponseDto', async () => {
    const res = await request.post('/api/auth/login').send(testUser);

    expect(res.body).toMatchObject({
      accessToken: expect.any(String),
      user: {
        id: expect.any(String),
        email: testUser.email,
        createdAt: expect.any(String),
      },
    });
  });
});
