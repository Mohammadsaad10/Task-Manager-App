import { Response } from 'express';
import { PaginationMeta } from '../types';

/** Send a standard success response */
export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

/** Send a 201 Created response */
export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

/** Send a paginated success response */
export function sendPaginated<T>(res: Response, data: T[], pagination: PaginationMeta): void {
  res.status(200).json({
    success: true,
    data,
    pagination,
  });
}

/** Send an error response with consistent shape */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  code: string = 'BAD_REQUEST',
  details?: Array<{ field: string; message: string }>
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}

/** Send a 404 Not Found response */
export function sendNotFound(res: Response, resource: string = 'Resource'): void {
  sendError(res, `${resource} not found`, 404, 'NOT_FOUND');
}

/** Send a 401 Unauthorized response */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): void {
  sendError(res, message, 401, 'UNAUTHORIZED');
}

/** Send a 403 Forbidden response */
export function sendForbidden(res: Response, message: string = 'Insufficient permissions'): void {
  sendError(res, message, 403, 'FORBIDDEN');
}
