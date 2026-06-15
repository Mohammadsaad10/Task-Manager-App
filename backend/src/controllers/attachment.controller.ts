import { Request, Response, NextFunction } from 'express';
import * as attachmentService from '../services/attachment.service';
import { sendSuccess, sendCreated, sendNotFound, sendForbidden } from '../utils/apiResponse';
import { AuthRequest } from '../types';

/** POST /api/tasks/:id/attachments */
export async function upload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const taskId = req.params.id as string;

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'FILE_ERROR', message: 'No file provided' },
      });
      return;
    }

    const attachment = await attachmentService.upload(
      taskId,
      authReq.user.id,
      authReq.user.role,
      req.file
    );
    sendCreated(res, attachment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TASK_NOT_FOUND') {
        sendNotFound(res, 'Task');
        return;
      }
      if (error.message === 'TASK_FORBIDDEN') {
        sendForbidden(res);
        return;
      }
    }
    next(error);
  }
}

/** GET /api/tasks/:id/attachments */
export async function getByTaskId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const taskId = req.params.id as string;
    const attachments = await attachmentService.getByTaskId(
      taskId,
      authReq.user.id,
      authReq.user.role
    );
    sendSuccess(res, attachments);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TASK_NOT_FOUND') {
        sendNotFound(res, 'Task');
        return;
      }
      if (error.message === 'TASK_FORBIDDEN') {
        sendForbidden(res);
        return;
      }
    }
    next(error);
  }
}

/** DELETE /api/tasks/:id/attachments/:attachmentId */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const taskId = req.params.id as string;
    const attachmentId = req.params.attachmentId as string;
    const result = await attachmentService.remove(
      taskId,
      attachmentId,
      authReq.user.id,
      authReq.user.role
    );
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TASK_NOT_FOUND' || error.message === 'ATTACHMENT_NOT_FOUND') {
        sendNotFound(res, error.message === 'TASK_NOT_FOUND' ? 'Task' : 'Attachment');
        return;
      }
      if (error.message === 'TASK_FORBIDDEN') {
        sendForbidden(res);
        return;
      }
    }
    next(error);
  }
}
