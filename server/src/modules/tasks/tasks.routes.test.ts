import { describe, it, expect, vi, beforeAll } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createTestUser } from '../../test/setup';
import {
  register,
  login,
  refreshAccessToken,
  revokeRefreshToken,
} from '../auth/auth.service';

// Don't mock the db - use the real test database

beforeAll(async () => {
  // Ensure JWT secret is set
  process.env.JWT_SECRET = 'test_secret';
});

// No beforeEach here — global setup in setup.ts already TRUNCATEs tables
// before each test, ensuring a clean slate without race conditions.

// ─── REGISTER ────────────────────────────────────────────────────────────────
describe('register', () => {
  it('should hash the password before saving', async () => {
    const hashSpy = vi.spyOn(bcrypt, 'hash');

    const result = await register({
      email: 'test@example.com',
      password: 'plainpassword',
    });

    // Verify bcrypt was called with the plain password
    expect(hashSpy).toHaveBeenCalledWith('plainpassword', 10);

    // Verify the returned user has no password field (integration-level check)
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should return accessToken, refreshToken and user without password', async () => {
    const result = await register({
      email: 'test@example.com',
      password: 'plainpassword',
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).not.toHaveProperty('token');

    expect(result.user.email).toBe('test@example.com');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.id).toBeDefined();
  });

  it('should throw if email already exists', async () => {
    // Insert user directly via helper — table is already clean from global beforeEach
    await createTestUser('existing@example.com', 'password123');

    await expect(
      register({ email: 'existing@example.com', password: 'plainpassword' })
    ).rejects.toThrow('Email already in use');
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────
describe('login', () => {
  it('should return accessToken, refreshToken and user without password on valid credentials', async () => {
    // Create a user with known password
    const password = 'plainpassword';
    await createTestUser('login@example.com', password);

    const result = await login({
      email: 'login@example.com',
      password: password,
    });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).not.toHaveProperty('token');

    expect(result.user.email).toBe('login@example.com');
    expect(result.user).not.toHaveProperty('password');
  });

  it('should throw if user is not found', async () => {
    await expect(
      login({ email: 'unknown@example.com', password: 'plainpassword' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw if password is incorrect', async () => {
    // Create a user
    await createTestUser('login@example.com', 'correctpassword');

    await expect(
      login({ email: 'login@example.com', password: 'wrongpassword' })
    ).rejects.toThrow('Invalid credentials');
  });
});

// ─── JWT GENERATION ──────────────────────────────────────────────────────────
describe('JWT generation', () => {
  it('should generate valid accessToken and refreshToken containing userId', async () => {
    const result = await register({
      email: 'jwt@example.com',
      password: 'plainpassword',
    });

    // Verify accessToken
    const decodedAccess = jwt.verify(result.accessToken, 'test_secret') as {
      userId: string;
    };
    expect(decodedAccess.userId).toBe(result.user.id);

    // Verify refreshToken
    const decodedRefresh = jwt.verify(result.refreshToken, 'test_secret') as {
      userId: string;
      type?: string;
    };
    expect(decodedRefresh.userId).toBe(result.user.id);
    expect(decodedRefresh.type).toBe('refresh');
  });
});

// ─── REFRESH TOKEN ───────────────────────────────────────────────────────────
describe('refresh token', () => {
  it('should generate new access token with valid refresh token', async () => {
    // Register a user to get a refresh token
    const { refreshToken, user } = await register({
      email: 'refresh@example.com',
      password: 'plainpassword',
    });

    // Test refresh
    const result = await refreshAccessToken(refreshToken);

    expect(result).toHaveProperty('accessToken');
    expect(result).not.toHaveProperty('refreshToken');

    const decoded = jwt.verify(result.accessToken, 'test_secret') as {
      userId: string;
    };
    expect(decoded.userId).toBe(user.id);
  });

  it('should throw with invalid refresh token', async () => {
    await expect(refreshAccessToken('invalid-token')).rejects.toThrow(
      'Invalid or expired refresh token'
    );
  });

  it('should throw with expired refresh token', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { userId: 'some-id', type: 'refresh' },
      'test_secret',
      { expiresIn: '0s' }
    );

    await expect(refreshAccessToken(expiredToken)).rejects.toThrow(
      'Invalid or expired refresh token'
    );
  });
});

// ─── LOGOUT / REVOKE ─────────────────────────────────────────────────────────
describe('logout', () => {
  it('should revoke refresh token', async () => {
    // Register a user to get a refresh token
    const { refreshToken } = await register({
      email: 'revoke@example.com',
      password: 'plainpassword',
    });

    // Revoke the token
    revokeRefreshToken(refreshToken);

    // Verify revoked token doesn't work
    await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
      'Invalid or expired refresh token'
    );
  });

  it('should handle revoking non-existent token gracefully', () => {
    expect(() => revokeRefreshToken('non-existent-token')).not.toThrow();
  });
});
