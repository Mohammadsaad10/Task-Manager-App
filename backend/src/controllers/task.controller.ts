import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendForbidden,
  sendPaginated,
} from '../utils/apiResponse';
import { AuthRequest, TaskFilterQuery } from '../types';

/** POST /api/tasks */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const task = await taskService.create(authReq.user.id, req.body);
    sendCreated(res, task);
  } catch (error) {
    next(error);
  }
}

/** GET /api/tasks */
export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const filters: TaskFilterQuery = {
      status: req.query.status as TaskFilterQuery['status'],
      search: req.query.search as string | undefined,
      sortBy: (req.query.sortBy as TaskFilterQuery['sortBy']) || 'createdAt',
      sortOrder: (req.query.sortOrder as TaskFilterQuery['sortOrder']) || 'desc',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const { tasks, pagination } = await taskService.getAll(authReq.user.id, filters);
    sendPaginated(res, tasks, pagination);
  } catch (error) {
    next(error);
  }
}

/** GET /api/tasks/:id */
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const taskId = req.params.id as string;
    const task = await taskService.getById(taskId, authReq.user.id, authReq.user.role);
    sendSuccess(res, task);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TASK_NOT_FOUND') {
        sendNotFound(res, 'Task');
        return;
      }
      if (error.message === 'TASK_FORBIDDEN') {
        sendForbidden(res, 'You can only access your own tasks');
        return;
      }
    }
    next(error);
  }
}

/** PATCH /api/tasks/:id */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const taskId = req.params.id as string;
    const task = await taskService.update(taskId, authReq.user.id, authReq.user.role, req.body);
    sendSuccess(res, task);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TASK_NOT_FOUND') {
        sendNotFound(res, 'Task');
        return;
      }
      if (error.message === 'TASK_FORBIDDEN') {
        sendForbidden(res, 'You can only modify your own tasks');
        return;
      }
    }
    next(error);
  }
}

/** DELETE /api/tasks/:id */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const taskId = req.params.id as string;
    const result = await taskService.remove(taskId, authReq.user.id, authReq.user.role);
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TASK_NOT_FOUND') {
        sendNotFound(res, 'Task');
        return;
      }
      if (error.message === 'TASK_FORBIDDEN') {
        sendForbidden(res, 'You can only delete your own tasks');
        return;
      }
    }
    next(error);
  }
}

/** GET /api/admin/tasks */
export async function getAllAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: TaskFilterQuery = {
      status: req.query.status as TaskFilterQuery['status'],
      search: req.query.search as string | undefined,
      sortBy: (req.query.sortBy as TaskFilterQuery['sortBy']) || 'createdAt',
      sortOrder: (req.query.sortOrder as TaskFilterQuery['sortOrder']) || 'desc',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const { tasks, pagination } = await taskService.getAllAdmin(filters);
    sendPaginated(res, tasks, pagination);
  } catch (error) {
    next(error);
  }
}
