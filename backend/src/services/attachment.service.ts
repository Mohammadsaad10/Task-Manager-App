import prisma from '../lib/prisma';
import { uploadFile, deleteFile } from '../utils/cloudinary';
import * as activityService from './activity.service';

/** Upload a file attachment to a task */
export async function upload(
  taskId: string,
  userId: string,
  userRole: string,
  file: Express.Multer.File
) {
  // Verify task exists and user has access
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new Error('TASK_NOT_FOUND');
  }

  if (task.userId !== userId && userRole !== 'ADMIN') {
    throw new Error('TASK_FORBIDDEN');
  }

  // Upload to Cloudinary
  const { url, publicId } = await uploadFile(file.buffer);

  // Save metadata in database
  const attachment = await prisma.attachment.create({
    data: {
      taskId,
      fileName: file.originalname,
      fileUrl: url,
      fileType: file.mimetype,
      fileSize: file.size,
      publicId,
    },
  });

  // Log activity
  await activityService.logAttachment(taskId, userId, 'added', file.originalname);

  return attachment;
}

/** Get all attachments for a task */
export async function getByTaskId(
  taskId: string,
  userId: string,
  userRole: string
) {
  // Verify task exists and user has access
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new Error('TASK_NOT_FOUND');
  }

  if (task.userId !== userId && userRole !== 'ADMIN') {
    throw new Error('TASK_FORBIDDEN');
  }

  return prisma.attachment.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' },
  });
}

/** Delete an attachment from Cloudinary and database */
export async function remove(
  taskId: string,
  attachmentId: string,
  userId: string,
  userRole: string
) {
  // Find attachment and verify ownership via task
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { task: true },
  });

  if (!attachment) {
    throw new Error('ATTACHMENT_NOT_FOUND');
  }

  if (attachment.task.userId !== userId && userRole !== 'ADMIN') {
    throw new Error('TASK_FORBIDDEN');
  }

  if (attachment.taskId !== taskId) {
    throw new Error('ATTACHMENT_NOT_FOUND');
  }

  // Delete from Cloudinary
  await deleteFile(attachment.publicId);

  // Delete from database
  await prisma.attachment.delete({ where: { id: attachmentId } });

  // Log activity
  await activityService.logAttachment(taskId, userId, 'removed', attachment.fileName);

  return { message: 'Attachment deleted successfully' };
}
