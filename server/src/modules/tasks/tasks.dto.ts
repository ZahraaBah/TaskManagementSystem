// ─── REQUEST DTOs ─────────────────────────────────────────────────────────────
/**
 * Payload required to create a new task.
 * @property title - Task title (required)
 * @property description - Task description (optional)
 */
export interface CreateTaskRequestDto {
  title: string;
  description?: string;
}

/**
 * Payload required to update an existing task.
 * @property title - New title (optional)
 * @property description - New description (optional)
 * @property completed - Completion status (optional)
 */
export interface UpdateTaskRequestDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

// ─── RESPONSE DTOs ────────────────────────────────────────────────────────────
/**
 * Task object returned in responses.
 * @property id - Task UUID
 * @property title - Task title
 * @property description - Task description or null
 * @property completed - Whether task is completed
 * @property userId - Owner's UUID
 * @property createdAt - Creation date
 * @property updatedAt - Last update date
 */
export interface TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
