import express from 'express';
import authRouter from './modules/auth/auth.routes';
import tasksRouter from './modules/tasks/tasks.routes';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRouter);
app.use('/tasks', tasksRouter);

export default app;