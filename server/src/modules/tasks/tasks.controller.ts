import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.middleware';
import * as tasksService from './tasks.service';
import { createTaskSchema, updateTaskSchema, filterTaskSchema } from './tasks.schema';

/**
 * GET /tasks
 * Returns all tasks for the authenticated user.
 * Optionally filters by completed status via query param.
 *
 * @param req - Authenticated request with optional ?completed=true/false
 * @param res - Express response
 */
export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const filter = filterTaskSchema.parse(req.query);
    const tasks = await tasksService.getTasksByUser(req.user.userId, filter);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /tasks
 * Creates a new task for the authenticated user.
 *
 * @param req - Authenticated request with task payload
 * @param res - Express response
 */
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const input = createTaskSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ errors: input.error.flatten().fieldErrors });
      return;
    }
    const task = await tasksService.createTask(input.data, req.user.userId);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PATCH /tasks/:id
 * Updates a task after verifying ownership.
 *
 * @param req - Authenticated request with task ID and update payload
 * @param res - Express response
 */
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const input = updateTaskSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ errors: input.error.flatten().fieldErrors });
      return;
    }
    const task = await tasksService.updateTask(req.params.id, input.data, req.user.userId);
    res.status(200).json(task);
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    if (error instanceof Error && error.message === 'Task not found') {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * DELETE /tasks/:id
 * Deletes a task after verifying ownership.
 *
 * @param req - Authenticated request with task ID
 * @param res - Express response
 */
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const task = await tasksService.deleteTask(req.params.id, req.user.userId);
    res.status(200).json(task);
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    if (error instanceof Error && error.message === 'Task not found') {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};