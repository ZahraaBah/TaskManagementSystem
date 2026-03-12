import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { tasks } from '../../db/schema';
import type { CreateTaskInput, UpdateTaskInput } from './tasks.schema';
import type { Task } from '../../db/schema';

/**
 * Retrieves all tasks belonging to a specific user.
 * Optionally filters by completed status.
 * Optimized with indexes on userId and completed.
 *
 * @param userId - The authenticated user's UUID
 * @param completed - Optional filter for completion status
 * @returns Array of Task records
 */
export const findTasksByUserId = async (
  userId: string,
  completed?: boolean
): Promise<Task[]> => {
  if (completed !== undefined) {
    return db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, completed)));
  }
  return db.select().from(tasks).where(eq(tasks.userId, userId));
};

/**
 * Retrieves a single task by ID.
 * Uses primary key index for fast lookup.
 *
 * @param id - Task UUID
 * @returns Task record or undefined if not found
 */
export const findTaskById = async (id: string): Promise<Task | undefined> => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);
  return task;
};

/**
 * Creates a new task for a given user.
 *
 * @param input - Validated task creation payload
 * @param userId - The authenticated user's UUID
 * @returns Created Task record
 */
export const createTask = async (
  input: CreateTaskInput,
  userId: string
): Promise<Task> => {
  const [task] = await db
    .insert(tasks)
    .values({
      title: input.title,
      description: input.description,
      userId,
    })
    .returning();
  return task;
};

/**
 * Updates an existing task by ID.
 * Uses primary key index for fast update.
 *
 * @param id - Task UUID
 * @param input - Validated update payload
 * @returns Updated Task record or undefined if not found
 */
export const updateTask = async (
  id: string,
  input: UpdateTaskInput
): Promise<Task | undefined> => {
  const [task] = await db
    .update(tasks)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return task;
};

/**
 * Deletes a task by ID.
 * Uses primary key index for fast deletion.
 *
 * @param id - Task UUID
 * @returns Deleted Task record or undefined if not found
 */
export const deleteTask = async (id: string): Promise<Task | undefined> => {
  const [task] = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning();
  return task;
};