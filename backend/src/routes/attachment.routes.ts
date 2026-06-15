import { Router } from 'express';
import * as attachmentController from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { taskIdParam, attachmentIdParams } from '../validators/task.schema';
import { upload } from '../middleware/upload';

const router = Router({ mergeParams: true });

// All attachment routes are protected
// Express 5 type compatibility - safe cast
router.use(authenticate as any);

router.post(
  '/',
  validate({ params: taskIdParam }),
  upload.single('file'),
  attachmentController.upload
);

router.get(
  '/',
  validate({ params: taskIdParam }),
  attachmentController.getByTaskId
);

router.delete(
  '/:attachmentId',
  validate({ params: attachmentIdParams }),
  attachmentController.remove
);

export default router;
