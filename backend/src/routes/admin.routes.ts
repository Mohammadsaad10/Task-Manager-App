import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { validate } from '../middleware/validate';
import { taskQueryParams } from '../validators/task.schema';

const router = Router();

// All admin routes require authentication + ADMIN role
// Express 5 type compatibility - safe cast
router.use(authenticate as any);
// Express 5 type compatibility - safe cast
router.use(requireRole('ADMIN') as any);

router.get('/tasks', validate({ query: taskQueryParams }), taskController.getAllAdmin);

export default router;
