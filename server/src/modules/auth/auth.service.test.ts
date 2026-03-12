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
import {
  register,
  login,
  refreshAccessToken,
  revokeRefreshToken,
} from './auth.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  it('should return accessToken, refreshToken and user without password', async () => {
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);
    mockDb.insert().values().returning.mockResolvedValueOnce([mockUser]);

    const result = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    // Vérifier les nouveaux champs
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).not.toHaveProperty('token'); // ← L'ancien champ ne doit plus exister

    expect(result.user.email).toBe(mockUser.email);
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw if email already exists', async () => {
    mockDb.select().from().where().limit.mockResolvedValueOnce([mockUser]);

    await expect(
      register({ email: mockUser.email, password: 'plainpassword' })
    ).rejects.toThrow('Email already in use');
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
describe('login', () => {
  it('should return accessToken, refreshToken and user without password on valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('plainpassword', 10);
    const userWithHash = { ...mockUser, password: hashedPassword };

    mockDb.select().from().where().limit.mockResolvedValueOnce([userWithHash]);

    const result = await login({
      email: mockUser.email,
      password: 'plainpassword',
    });

    // Vérifier les nouveaux champs
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).not.toHaveProperty('token'); // ← L'ancien champ ne doit plus exister

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

// ─── JWT GENERATION ──────────────────────────────────────────────────────────
describe('JWT generation', () => {
  it('should generate valid accessToken and refreshToken containing userId', async () => {
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);
    mockDb.insert().values().returning.mockResolvedValueOnce([mockUser]);

    const result = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    // Vérifier l'accessToken
    const decodedAccess = jwt.verify(result.accessToken, 'test_secret') as {
      userId: string;
    };
    expect(decodedAccess.userId).toBe(mockUser.id);

    // Vérifier le refreshToken
    const decodedRefresh = jwt.verify(result.refreshToken, 'test_secret') as {
      userId: string;
      type?: string;
    };
    expect(decodedRefresh.userId).toBe(mockUser.id);
    expect(decodedRefresh.type).toBe('refresh');
  });
});

// ─── REFRESH TOKEN ───────────────────────────────────────────────────────────
describe('refresh token', () => {
  it('should generate new access token with valid refresh token', async () => {
    // D'abord, enregistrer un user pour avoir un refresh token
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);
    mockDb.insert().values().returning.mockResolvedValueOnce([mockUser]);

    const { refreshToken } = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    // Tester le refresh
    const result = await refreshAccessToken(refreshToken);

    expect(result).toHaveProperty('accessToken');
    expect(result).not.toHaveProperty('refreshToken'); // Nouveau refresh token n'est pas retourné

    const decoded = jwt.verify(result.accessToken, 'test_secret') as {
      userId: string;
    };
    expect(decoded.userId).toBe(mockUser.id);
  });

  it('should throw with invalid refresh token', async () => {
    await expect(refreshAccessToken('invalid-token')).rejects.toThrow(
      'Invalid or expired refresh token'
    );
  });
});

// ─── LOGOUT / REVOKE ─────────────────────────────────────────────────────────
describe('logout', () => {
  it('should revoke refresh token', async () => {
    // D'abord, enregistrer un user pour avoir un refresh token
    mockDb.select().from().where().limit.mockResolvedValueOnce([]);
    mockDb.insert().values().returning.mockResolvedValueOnce([mockUser]);

    const { refreshToken } = await register({
      email: mockUser.email,
      password: 'plainpassword',
    });

    // Révoquer le token
    revokeRefreshToken(refreshToken);

    // Vérifier que le token révoqué ne fonctionne plus
    await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
      'Invalid or expired refresh token'
    );
  });
});
