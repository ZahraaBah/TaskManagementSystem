import { z } from 'zod';

// ─── CREATE TASK ─────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

// ─── UPDATE TASK ─────────────────────────────────────────────────────────────
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  completed: z.boolean().optional(),
});

// ─── FILTER TASKS ────────────────────────────────────────────────────────────
export const filterTaskSchema = z.object({
  completed: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

// ─── INFERRED TYPES ──────────────────────────────────────────────────────────
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type FilterTaskInput = z.infer<typeof filterTaskSchema>;