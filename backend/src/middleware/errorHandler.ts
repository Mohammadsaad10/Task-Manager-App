import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import multer from 'multer';

/** Global error handler — catches all errors and returns consistent responses */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.message}`);

  // Zod validation errors
  if (err instanceof z.ZodError) {
    const details = err.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    });
    return;
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        let targetArray = err.meta?.target as string[];
        
        // Handle @prisma/adapter-pg nested error format
        if (!targetArray && err.meta?.driverAdapterError) {
          // Neon adapter-pg wraps errors differently
          const adapterError = err.meta.driverAdapterError as any;
          if (adapterError.cause?.constraint?.fields) {
            targetArray = adapterError.cause.constraint.fields;
          }
        }
        
        const target = targetArray?.join(', ') || 'field';
        
        let message = `A record with this ${target} already exists`;
        if (target.includes('email')) {
          message = 'An account with this email is already registered';
        }

        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message,
          },
        });
        return;
      }
      case 'P2025':
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found',
          },
        });
        return;
      default:
        break;
    }
  }

  // JWT errors
  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
    return;
  }

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the 5MB limit';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    res.status(400).json({
      success: false,
      error: {
        code: 'FILE_ERROR',
        message,
      },
    });
    return;
  }

  // Multer custom file filter errors
  if (err.message && err.message.includes('File type')) {
    res.status(400).json({
      success: false,
      error: {
        code: 'FILE_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Default: Internal server error
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'An unexpected error occurred' : err.message,
    },
  });
}
