import prisma from '../lib/prisma';
import { TaskFilterQuery, FieldChange, PaginationMeta } from '../types';
import { Prisma } from '@prisma/client';
import * as activityService from './activity.service';
import * as sseService from './sse.service';

/** Create a new task */
export async function create(
  userId: string,
  data: {
    title: string;
    description?: string | null;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string | null;
  }
) {
  const task = await prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    include: {
      _count: { select: { attachments: true } },
    },
  });

  // Log activity
  await activityService.logCreated(task.id, userId);

  // Broadcast SSE event
  sseService.broadcastToUser(userId, 'task:created', task);

  return task;
}

/** Get all tasks for a user with filtering, sorting, and pagination */
export async function getAll(userId: string, filters: TaskFilterQuery) {
  const { status, search, sortBy, sortOrder, page, limit } = filters;

  // Build where clause
  const where: Prisma.TaskWhereInput = { userId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.title = {
      contains: search,
      mode: 'insensitive',
    };
  }

  // Build orderBy — Prisma enum ordering: LOW < MEDIUM < HIGH (alphabetical happens to match)
  let orderBy: Prisma.TaskOrderByWithRelationInput;
  if (sortBy === 'dueDate') {
    orderBy = { dueDate: sortOrder };
  } else if (sortBy === 'priority') {
    orderBy = { priority: sortOrder };
  } else {
    orderBy = { createdAt: sortOrder };
  }

  // Execute query with count in parallel
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { attachments: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return { tasks, pagination };
}

/** Get all tasks for admin view (no ownership filter, includes user info) */
export async function getAllAdmin(filters: TaskFilterQuery) {
  const { status, search, sortBy, sortOrder, page, limit } = filters;

  const where: Prisma.TaskWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.title = {
      contains: search,
      mode: 'insensitive',
    };
  }

  let orderBy: Prisma.TaskOrderByWithRelationInput;
  if (sortBy === 'dueDate') {
    orderBy = { dueDate: sortOrder };
  } else if (sortBy === 'priority') {
    orderBy = { priority: sortOrder };
  } else {
    orderBy = { createdAt: sortOrder };
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { attachments: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return { tasks, pagination };
}

/** Get a single task by ID with ownership check */
export async function getById(taskId: string, userId: string, userRole: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      attachments: true,
      _count: { select: { attachments: true } },
    },
  });

  if (!task) {
    throw new Error('TASK_NOT_FOUND');
  }

  // Ownership check (admins can view any task)
  if (task.userId !== userId && userRole !== 'ADMIN') {
    throw new Error('TASK_FORBIDDEN');
  }

  return task;
}

/** Update a task with field-level change tracking */
export async function update(
  taskId: string,
  userId: string,
  userRole: string,
  data: {
    title?: string;
    description?: string | null;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string | null;
  }
) {
  // Get existing task (with ownership check)
  const existing = await getById(taskId, userId, userRole);

  // Build update data and track changes
  const changes: FieldChange[] = [];
  const updateData: Prisma.TaskUpdateInput = {};

  if (data.title !== undefined && data.title !== existing.title) {
    changes.push({ field: 'title', oldValue: existing.title, newValue: data.title });
    updateData.title = data.title;
  }

  if (data.description !== undefined && data.description !== existing.description) {
    changes.push({
      field: 'description',
      oldValue: existing.description,
      newValue: data.description,
    });
    updateData.description = data.description;
  }

  if (data.status !== undefined && data.status !== existing.status) {
    changes.push({ field: 'status', oldValue: existing.status, newValue: data.status });
    updateData.status = data.status;
  }

  if (data.priority !== undefined && data.priority !== existing.priority) {
    changes.push({
      field: 'priority',
      oldValue: existing.priority,
      newValue: data.priority,
    });
    updateData.priority = data.priority;
  }

  if (data.dueDate !== undefined) {
    const existingDate = existing.dueDate?.toISOString() || null;
    const newDate = data.dueDate || null;
    if (existingDate !== newDate) {
      changes.push({ field: 'dueDate', oldValue: existingDate, newValue: newDate });
      updateData.dueDate = newDate ? new Date(newDate) : null;
    }
  }

  // Only update if there are actual changes
  if (Object.keys(updateData).length === 0) {
    return existing;
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      _count: { select: { attachments: true } },
    },
  });

  // Log field-level changes
  await activityService.logUpdated(taskId, userId, changes);

  // Broadcast SSE event
  sseService.broadcastToUser(existing.userId, 'task:updated', updated);

  return updated;
}

/** Delete a task */
export async function remove(taskId: string, userId: string, userRole: string) {
  // Get existing task (with ownership check)
  const existing = await getById(taskId, userId, userRole);

  // Delete the task (cascades to attachments + activity logs via Prisma schema)
  await prisma.task.delete({
    where: { id: taskId },
  });

  // Broadcast SSE event
  sseService.broadcastToUser(existing.userId, 'task:deleted', { id: taskId });

  return { message: 'Task deleted successfully' };
}
