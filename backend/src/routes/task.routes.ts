import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTaskBody,
  updateTaskBody,
  taskQueryParams,
  taskIdParam,
} from '../validators/task.schema';

const router = Router();

// All task routes are protected
// Express 5 type compatibility - safe cast
router.use(authenticate as any);

router.post('/', validate({ body: createTaskBody }), taskController.create);
router.get('/', validate({ query: taskQueryParams }), taskController.getAll);
router.get('/:id', validate({ params: taskIdParam }), taskController.getById);
router.patch(
  '/:id',
  validate({ params: taskIdParam, body: updateTaskBody }),
  taskController.update
);
router.delete('/:id', validate({ params: taskIdParam }), taskController.remove);

export default router;
