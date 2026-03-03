import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ─── Mock DB ─────────────────────────────────────────────────────────────────

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
    (db.select().from().where().limit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]);

    (db.insert().values().returning as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([mockUser]);

    const hashSpy = vi.spyOn(bcrypt, 'hash');

    await register({ email: mockUser.email, password: 'plainpassword' });

    expect(hashSpy).toHaveBeenCalledWith('plainpassword', 10);
  });

  it('should return a token and user without password', async () => {
    (db.select().from().where().limit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]);

    (db.insert().values().returning as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([mockUser]);

    const result = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(mockUser.email);
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw if email already exists', async () => {
    (db.select().from().where().limit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([mockUser]);

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

    (db.select().from().where().limit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([userWithHash]);

    const result = await login({
      email: mockUser.email,
      password: 'plainpassword',
    });

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(mockUser.email);
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw if user is not found', async () => {
    (db.select().from().where().limit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]);

    await expect(
      login({ email: 'unknown@example.com', password: 'plainpassword' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw if password is incorrect', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    const userWithHash = { ...mockUser, password: hashedPassword };

    (db.select().from().where().limit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([userWithHash]);

    await expect(
      login({ email: mockUser.email, password: 'wrongpassword' })
    ).rejects.toThrow('Invalid credentials');
  });
});

// ─── JWT ─────────────────────────────────────────────────────────────────────

describe('JWT generation', () => {
  it('should generate a valid JWT containing userId', async () => {
    (db.select().from().where().limit as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]);

    (db.insert().values().returning as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([mockUser]);

    const result = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    const decoded = jwt.verify(result.token, 'test_secret') as {
      userId: string;
    };

    expect(decoded.userId).toBe(mockUser.id);
  });
});