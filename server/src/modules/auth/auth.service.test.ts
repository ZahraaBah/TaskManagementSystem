import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ─── Mock DB ─────────────────────────────────────────────────────────────────

// FIX: i had errors in tge first syntax (methods like .select().from().where()) and fixed it with this mock..

vi.mock('../../db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

import { db } from '../../db';
import { register, login } from './auth.service';

const mockDb = db as any;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'uuid-123',
  email: 'test@example.com',
  password: 'hashedpassword',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();

  process.env.JWT_SECRET = 'test_secret';
});

// ─── REGISTER ────────────────────────────────────────────────────────────────

describe('register', () => {
  it('should hash the password before saving', async () => {
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);
    mockDb.insert().values().returning.mockResolvedValueOnce([mockUser]);

    const hashSpy = vi.spyOn(bcrypt, 'hash');

    await register({ email: mockUser.email, password: 'plainpassword' });

    expect(hashSpy).toHaveBeenCalledWith('plainpassword', 10);
  });

  it('should return a token and user without password', async () => {
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);
    mockDb.insert().values().returning.mockResolvedValueOnce([mockUser]);

    const result = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(mockUser.email);
    // Ensures password is never exposed in the response — enforced by UserResponseDto
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw if email already exists', async () => {
    // Simulate a user already in the DB to trigger the duplicate email check
    mockDb.select().from().where().limit.mockResolvedValueOnce([mockUser]);

    await expect(
      register({ email: mockUser.email, password: 'plainpassword' })
    ).rejects.toThrow('Email already in use');
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────

describe('login', () => {
  it('should return a token and user without password on valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('plainpassword', 10);
    const userWithHash = { ...mockUser, password: hashedPassword };

    mockDb.select().from().where().limit.mockResolvedValueOnce([userWithHash]);

    const result = await login({
      email: mockUser.email,
      password: 'plainpassword',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(mockUser.email);
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw if user is not found', async () => {
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);

    await expect(
      login({ email: 'unknown@example.com', password: 'plainpassword' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw if password is incorrect', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    const userWithHash = { ...mockUser, password: hashedPassword };

    mockDb.select().from().where().limit.mockResolvedValueOnce([userWithHash]);

    await expect(
      login({ email: mockUser.email, password: 'wrongpassword' })
    ).rejects.toThrow('Invalid credentials');
  });
});

// ─── JWT ─────────────────────────────────────────────────────────────────────

describe('JWT generation', () => {
  it('should generate a valid JWT containing userId', async () => {
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);
    mockDb.insert().values().returning.mockResolvedValueOnce([mockUser]);

    const result = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    // Decode and verify the token to ensure it carries the correct userId payload
    const decoded = jwt.verify(result.token, 'test_secret') as {
      userId: string;
    };

    expect(decoded.userId).toBe(mockUser.id);
  });
});