import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { taskIdParam } from '../validators/task.schema';

const router = Router({ mergeParams: true });

// All activity routes are protected
// Express 5 type compatibility - safe cast
router.use(authenticate as any);

router.get('/', validate({ params: taskIdParam }), activityController.getByTaskId);

export default router;
