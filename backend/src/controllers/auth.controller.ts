import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendCreated, sendUnauthorized } from '../utils/apiResponse';
import { setTokenCookie, clearTokenCookie } from '../utils/cookie';
import { AuthRequest } from '../types';

/** POST /api/auth/signup */
export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);
    setTokenCookie(res, result.token);
    sendCreated(res, result);
  } catch (error) {
    next(error);
  }
}

/** POST /api/auth/login */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setTokenCookie(res, result.token);
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid credentials') {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }
    next(error);
  }
}

/** GET /api/auth/me */
export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const user = await authService.getProfile(authReq.user.id);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
}

/** POST /api/auth/logout */
export async function logout(
  _req: Request,
  res: Response,
): Promise<void> {
  clearTokenCookie(res);
  sendSuccess(res, { message: 'Logged out successfully' });
}
