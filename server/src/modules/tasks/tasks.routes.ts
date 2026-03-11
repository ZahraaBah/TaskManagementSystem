import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from './tasks.controller';

const router = Router();

// Helper to type the request properly
type TaskController = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Type assertion helper
const asTaskController = (fn: TaskController) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return fn(req as AuthenticatedRequest, res, next);
  };
};

router.use(authenticate);

router.get('/', asTaskController(getTasks));
router.post('/', asTaskController(createTask));
router.patch('/:id', asTaskController(updateTask));
router.delete('/:id', asTaskController(deleteTask));

export default router;
