import { z } from 'zod';

const datePreprocess = (val: unknown) => {
  if (typeof val === 'string' && val !== '') {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }
  return val === '' ? null : val;
};

export const createTaskBody = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z
    .preprocess(
      datePreprocess,
      z.string().datetime({ message: 'Invalid date format. Use ISO 8601.' })
        .refine(
          (val) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(val) >= today;
          },
          { message: 'Due date cannot be in the past' }
        )
        .nullable()
    )
    .optional(),
});

export const updateTaskBody = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be 255 characters or less')
    .optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z
    .preprocess(
      datePreprocess,
      z.string().datetime({ message: 'Invalid date format. Use ISO 8601.' }).nullable()
    )
    .optional(),
});

export const taskQueryParams = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['dueDate', 'priority', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const taskIdParam = z.object({
  id: z.string().uuid('Invalid task ID format'),
});

export const attachmentIdParams = z.object({
  id: z.string().uuid('Invalid task ID format'),
  attachmentId: z.string().uuid('Invalid attachment ID format'),
});

export type CreateTaskInput = z.infer<typeof createTaskBody>;
export type UpdateTaskInput = z.infer<typeof updateTaskBody>;
export type TaskQueryInput = z.infer<typeof taskQueryParams>;
