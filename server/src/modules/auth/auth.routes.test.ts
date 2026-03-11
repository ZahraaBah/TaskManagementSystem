import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../../app';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

const request = supertest(app);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const testUser = {
  email: 'integration@test.com',
  password: 'password123',
};

const cleanupUser = async () => {
  await db.delete(users).where(eq(users.email, testUser.email));
};

// ─── SETUP ───────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await cleanupUser();
});

afterAll(async () => {
  await cleanupUser();
});

beforeEach(async () => {
  await cleanupUser();
});

// ─── POST /auth/register ─────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('should return 201 and token on successful registration', async () => {
    const res = await request.post('/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 400 if email is invalid', async () => {
    const res = await request
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 if password is too short', async () => {
    const res = await request
      .post('/auth/register')
      .send({ email: testUser.email, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 409 if email already exists', async () => {
    await request.post('/auth/register').send(testUser);

    const res = await request.post('/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });

  it('response should conform to AuthResponseDto', async () => {
    const res = await request.post('/auth/register').send(testUser);

    expect(res.body).toMatchObject({
      token: expect.any(String),
      user: {
        id: expect.any(String),
        email: testUser.email,
        createdAt: expect.any(String),
      },
    });
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request.post('/auth/register').send(testUser);
  });

  it('should return 200 and token on valid credentials', async () => {
    const res = await request.post('/auth/login').send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 on invalid password', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 401 if user does not exist', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'unknown@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if body is invalid', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'not-an-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('response should conform to AuthResponseDto', async () => {
    const res = await request.post('/auth/login').send(testUser);

    expect(res.body).toMatchObject({
      token: expect.any(String),
      user: {
        id: expect.any(String),
        email: testUser.email,
        createdAt: expect.any(String),
      },
    });
  });
});
