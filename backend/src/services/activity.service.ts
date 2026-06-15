import prisma from '../lib/prisma';
import { FieldChange } from '../types';

/** Log a task creation event */
export async function logCreated(taskId: string, userId: string): Promise<void> {
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'created',
    },
  });
}

/** Log task field updates. Creates one log entry per changed field. */
export async function logUpdated(
  taskId: string,
  userId: string,
  changes: FieldChange[]
): Promise<void> {
  if (changes.length === 0) return;

  const logs = changes.map((change) => ({
    taskId,
    userId,
    action: change.field === 'status' ? 'status_changed' : 'updated',
    fieldChanged: change.field,
    oldValue: change.oldValue,
    newValue: change.newValue,
  }));

  await prisma.activityLog.createMany({ data: logs });
}

/** Log a task deletion event */
export async function logDeleted(
  taskId: string,
  userId: string,
  taskTitle: string
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'deleted',
      fieldChanged: 'task',
      oldValue: taskTitle,
    },
  });
}

/** Log an attachment-related event */
export async function logAttachment(
  taskId: string,
  userId: string,
  action: 'added' | 'removed',
  fileName: string
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      taskId,
      userId,
      action: 'updated',
      fieldChanged: action === 'added' ? 'attachment_added' : 'attachment_removed',
      newValue: action === 'added' ? fileName : undefined,
      oldValue: action === 'removed' ? fileName : undefined,
    },
  });
}

/** Get all activity logs for a task, ordered newest first */
export async function getByTaskId(taskId: string) {
  return prisma.activityLog.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true },
      },
    },
  });
}
