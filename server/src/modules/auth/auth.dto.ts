// ─── REQUEST DTOs ─────────────────────────────────────────────────────────────

/**
 * Payload required to register a new user.
 * @property email - Valid email address
 * @property password - Minimum 8 characters
 */
export interface RegisterRequestDto {
  email: string;
  password: string;
}

/**
 * Payload required to login.
 * @property email - Registered email address
 * @property password - User's password
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

// ─── RESPONSE DTOs ────────────────────────────────────────────────────────────

/**
 * Safe user object returned in responses.
 * Password is intentionally excluded.
 * @property id - User UUID
 * @property email - User email
 * @property createdAt - Account creation date
 */
export interface UserResponseDto {
  id: string;
  email: string;
  createdAt: Date;
}

/**
 * Returned after successful register or login.
 * @property token - Signed JWT token (expires in 7 days)
 * @property user - Safe user object without password
 */
export interface AuthResponseDto {
  token: string;
  user: UserResponseDto;
}

// ─── ERROR DTO ────────────────────────────────────────────────────────────────

/**
 * Standard error response structure.
 * @property message - Human readable error message
 */
export interface ErrorResponseDto {
  message: string;
}

/**
 * Validation error response structure.
 * @property errors - Field-level validation errors from Zod
 */
export interface ValidationErrorDto {
  errors: Record<string, string[]>;
}
