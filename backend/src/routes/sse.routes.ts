import { Router, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { addClient } from '../services/sse.service';
import { sendUnauthorized } from '../utils/apiResponse';
import { COOKIE_NAME } from '../utils/cookie';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * GET /api/events
 * SSE endpoint. Authenticates via HTTP-only cookie (primary)
 * or ?token= query param (fallback for non-cookie clients).
 */
router.get('/', (req: Request, res: Response) => {
  // 1. Try HTTP-only cookie first
  let token = req.cookies?.[COOKIE_NAME];

  // 2. Fallback to query param
  if (!token) {
    token = req.query.token as string;
  }

  if (!token) {
    sendUnauthorized(res, 'Token is required for SSE connection');
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    sendUnauthorized(res, 'Invalid or expired token');
    return;
  }

  const clientId = uuidv4();
  addClient(clientId, payload.id, payload.role, res);
});

export default router;
