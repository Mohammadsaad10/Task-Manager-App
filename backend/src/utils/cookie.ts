import { Response } from 'express';
import { env } from '../config/env';

const COOKIE_NAME = 'token';

/** Cookie options for JWT token */
function getCookieOptions() {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,                          // Not accessible via JavaScript
    secure: isProduction,                    // HTTPS only in production
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',  // Cross-site in production
    path: '/',                               // Available on all routes
    maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days in milliseconds (matches JWT_EXPIRES_IN)
  };
}

/** Set JWT token as HTTP-only cookie on the response */
export function setTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

/** Clear JWT token cookie */
export function clearTokenCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  });
}

export { COOKIE_NAME };
