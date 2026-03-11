import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Repository ──────────────────────────────────────────────────────────
vi.mock('./tasks.repository', () => ({
  findTasksByUserId: vi.fn(),
  findTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import * as tasksRepository from './tasks.repository';
import {
  getTasksByUser,
  createTask,
  updateTask,
  deleteTask,
} from './tasks.service';

// Simple fix - just disable the eslint warning for this line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRepo = tasksRepository as any;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const mockTask = {
  id: 'task-uuid-123',
  title: 'Test task',
  description: 'Test description',
  completed: false,
  userId: 'user-uuid-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── CREATE TASK ──────────────────────────────────────────────────────────────
describe('createTask', () => {
  it('should create a task and return TaskResponseDto', async () => {
    mockRepo.createTask.mockResolvedValueOnce(mockTask);

    const result = await createTask(
      { title: 'Test task', description: 'Test description' },
      'user-uuid-123'
    );

    expect(result.title).toBe('Test task');
    expect(result.userId).toBe('user-uuid-123');
    expect(result).not.toHaveProperty('__proto__');
  });
});

// ─── LIST TASKS ───────────────────────────────────────────────────────────────
describe('getTasksByUser', () => {
  it('should return only tasks belonging to the user', async () => {
    mockRepo.findTasksByUserId.mockResolvedValueOnce([mockTask]);

    const result = await getTasksByUser('user-uuid-123', {});

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('user-uuid-123');
  });

  it('should filter by completed status', async () => {
    mockRepo.findTasksByUserId.mockResolvedValueOnce([]);

    const result = await getTasksByUser('user-uuid-123', { completed: true });

    expect(mockRepo.findTasksByUserId).toHaveBeenCalledWith(
      'user-uuid-123',
      true
    );
    expect(result).toHaveLength(0);
  });
});

// ─── UPDATE TASK ──────────────────────────────────────────────────────────────
describe('updateTask', () => {
  it('should update task if user owns it', async () => {
    mockRepo.findTaskById.mockResolvedValueOnce(mockTask);
    mockRepo.updateTask.mockResolvedValueOnce({
      ...mockTask,
      title: 'Updated',
    });

    const result = await updateTask(
      'task-uuid-123',
      { title: 'Updated' },
      'user-uuid-123'
    );

    expect(result.title).toBe('Updated');
  });

  it('should throw Forbidden if user does not own the task', async () => {
    mockRepo.findTaskById.mockResolvedValueOnce({
      ...mockTask,
      userId: 'other-user',
    });

    await expect(
      updateTask('task-uuid-123', { title: 'Updated' }, 'user-uuid-123')
    ).rejects.toThrow('Forbidden');
  });

  it('should throw if task not found', async () => {
    mockRepo.findTaskById.mockResolvedValueOnce(undefined);

    await expect(
      updateTask('task-uuid-123', { title: 'Updated' }, 'user-uuid-123')
    ).rejects.toThrow('Task not found');
  });
});

// ─── DELETE TASK ──────────────────────────────────────────────────────────────
describe('deleteTask', () => {
  it('should delete task if user owns it', async () => {
    mockRepo.findTaskById.mockResolvedValueOnce(mockTask);
    mockRepo.deleteTask.mockResolvedValueOnce(mockTask);

    const result = await deleteTask('task-uuid-123', 'user-uuid-123');

    expect(result.id).toBe('task-uuid-123');
  });

  it('should throw Forbidden if user does not own the task', async () => {
    mockRepo.findTaskById.mockResolvedValueOnce({
      ...mockTask,
      userId: 'other-user',
    });

    await expect(deleteTask('task-uuid-123', 'user-uuid-123')).rejects.toThrow(
      'Forbidden'
    );
  });
});
