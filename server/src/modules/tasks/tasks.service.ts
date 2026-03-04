import * as tasksRepository from './tasks.repository';
import type { CreateTaskInput, UpdateTaskInput, FilterTaskInput } from './tasks.schema';
import type { TaskResponseDto } from './tasks.dto';

/**
 * Converts a Task DB record into a TaskResponseDto.
 *
 * @param task - Raw task record from DB
 * @returns TaskResponseDto
 */
const toTaskResponse = (task: {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponseDto => ({
  id: task.id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  userId: task.userId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

/**
 * Retrieves all tasks for the authenticated user.
 * Optionally filters by completed status.
 *
 * @param userId - The authenticated user's UUID
 * @param filter - Optional filter (completed status)
 * @returns Array of TaskResponseDto
 */
export const getTasksByUser = async (
  userId: string,
  filter: FilterTaskInput
): Promise<TaskResponseDto[]> => {
  const tasks = await tasksRepository.findTasksByUserId(userId, filter.completed);
  return tasks.map(toTaskResponse);
};

/**
 * Creates a new task for the authenticated user.
 *
 * @param input - Validated task creation payload
 * @param userId - The authenticated user's UUID
 * @returns Created TaskResponseDto
 */
export const createTask = async (
  input: CreateTaskInput,
  userId: string
): Promise<TaskResponseDto> => {
  const task = await tasksRepository.createTask(input, userId);
  return toTaskResponse(task);
};

/**
 * Updates a task after verifying ownership.
 *
 * @param id - Task UUID
 * @param input - Validated update payload
 * @param userId - The authenticated user's UUID
 * @returns Updated TaskResponseDto
 * @throws Error if task not found or user does not own the task (403)
 */
export const updateTask = async (
  id: string,
  input: UpdateTaskInput,
  userId: string
): Promise<TaskResponseDto> => {
  const existing = await tasksRepository.findTaskById(id);
  if (!existing) throw new Error('Task not found');
  if (existing.userId !== userId) throw new Error('Forbidden');
  const task = await tasksRepository.updateTask(id, input);
  if (!task) throw new Error('Task not found');
  return toTaskResponse(task);
};

/**
 * Deletes a task after verifying ownership.
 *
 * @param id - Task UUID
 * @param userId - The authenticated user's UUID
 * @returns Deleted TaskResponseDto
 * @throws Error if task not found or user does not own the task (403)
 */
export const deleteTask = async (
  id: string,
  userId: string
): Promise<TaskResponseDto> => {
  const existing = await tasksRepository.findTaskById(id);
  if (!existing) throw new Error('Task not found');
  if (existing.userId !== userId) throw new Error('Forbidden');
  const task = await tasksRepository.deleteTask(id);
  if (!task) throw new Error('Task not found');
  return toTaskResponse(task);
};