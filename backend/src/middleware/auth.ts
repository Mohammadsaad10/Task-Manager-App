import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendUnauthorized } from '../utils/apiResponse';
import { AuthRequest } from '../types';
import { COOKIE_NAME } from '../utils/cookie';
import prisma from '../lib/prisma';

/**
 * Authenticate requests using JWT token.
 * Reads from HTTP-only cookie (primary) or Authorization header (fallback).
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // 1. Try HTTP-only cookie first
  let token = req.cookies?.[COOKIE_NAME];

  // 2. Fallback to Authorization header (for backwards compatibility / API clients)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    sendUnauthorized(res, 'No token provided');
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    sendUnauthorized(res, 'Invalid or expired token');
    return;
  }

  // Check if user actually still exists in the database
  const userExists = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true }
  });

  if (!userExists) {
    sendUnauthorized(res, 'User no longer exists');
    return;
  }

  req.user = payload;
  next();
}
