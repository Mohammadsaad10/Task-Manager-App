import { Request, Response, NextFunction } from 'express';
import * as activityService from '../services/activity.service';
import * as taskService from '../services/task.service';
import { sendSuccess, sendNotFound, sendForbidden } from '../utils/apiResponse';
import { AuthRequest } from '../types';

/** GET /api/tasks/:id/activity */
export async function getByTaskId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const taskId = req.params.id as string;

    // Verify task exists and user has access
    try {
      await taskService.getById(taskId, authReq.user.id, authReq.user.role);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TASK_NOT_FOUND') {
          sendNotFound(res, 'Task');
          return;
        }
        if (error.message === 'TASK_FORBIDDEN') {
          sendForbidden(res, 'You can only view activity for your own tasks');
          return;
        }
      }
      throw error;
    }

    const activities = await activityService.getByTaskId(taskId);
    sendSuccess(res, activities);
  } catch (error) {
    next(error);
  }
}
