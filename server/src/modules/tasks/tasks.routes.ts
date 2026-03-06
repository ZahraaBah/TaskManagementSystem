import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { getTasks, createTask, updateTask, deleteTask } from './tasks.controller';

const router = Router();

router.use(authenticate);

router.get('/', getTasks as any);
router.post('/', createTask as any);
router.patch('/:id', updateTask as any);
router.delete('/:id', deleteTask as any);

export default router;