import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { RegisterInput, LoginInput } from './auth.schema';
import type { AuthResponseDto, UserResponseDto } from './auth.dto';

const SALT_ROUNDS = 10;

/**
 * Formats a user DB record into a safe UserResponseDto.
 * Ensures password is never exposed in responses.
 */
const toUserResponse = (user: {
  id: string;
  email: string;
  createdAt: Date;
}): UserResponseDto => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
});

// Store pour refresh tokens (à remplacer par Redis en production)
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

/**
 * Generates both access and refresh tokens for a user
 */
const generateTokens = (
  userId: string
): { accessToken: string; refreshToken: string } => {
  // Access token (short-lived)
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });

  // Refresh token (long-lived)
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  // Store refresh token
  refreshTokens.set(refreshToken, {
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

/**
 * Registers a new user with hashed password.
 * Checks for duplicate email before creating.
 */
export const register = async (
  input: RegisterInput
): Promise<AuthResponseDto> => {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      password: hashedPassword,
    })
    .returning();

  // Générer les deux tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  return {
    accessToken,
    refreshToken,
    user: toUserResponse(user),
  };
};

/**
 * Authenticates a user by verifying email and password.
 */
export const login = async (input: LoginInput): Promise<AuthResponseDto> => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(input.password, user.password);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Générer les deux tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  return {
    accessToken,
    refreshToken,
    user: toUserResponse(user),
  };
};

/**
 * Generate a new access token using a refresh token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  const tokenData = refreshTokens.get(refreshToken);

  if (!tokenData || tokenData.expiresAt < new Date()) {
    refreshTokens.delete(refreshToken);
    throw new Error('Invalid or expired refresh token');
  }

  const newAccessToken = jwt.sign(
    { userId: tokenData.userId },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  return { accessToken: newAccessToken };
};

/**
 * Revoke a refresh token (logout)
 */
export const revokeRefreshToken = (refreshToken: string) => {
  refreshTokens.delete(refreshToken);
};

// Optionnel: Nettoyage périodique des refresh tokens expirés
setInterval(
  () => {
    const now = new Date();
    for (const [token, data] of refreshTokens.entries()) {
      if (data.expiresAt < now) {
        refreshTokens.delete(token);
      }
    }
  },
  60 * 60 * 1000
); // Toutes les heures
