import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { RegisterInput, LoginInput } from './auth.schema';
import type { AuthResponseDto, UserResponseDto } from './auth.dto';

const SALT_ROUNDS = 10;

const toUserResponse = (user: {
  id: string;
  email: string;
  createdAt: Date;
}): UserResponseDto => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
});

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

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

  const token = generateToken(user.id);

  return {
    token,
    user: toUserResponse(user),
  };
};

export const login = async (
  input: LoginInput
): Promise<AuthResponseDto> => {
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

  const token = generateToken(user.id);

  return {
    token,
    user: toUserResponse(user),
  };
};