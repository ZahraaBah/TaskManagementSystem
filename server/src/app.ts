import express from 'express';
import authRouter from './modules/auth/auth.routes';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRouter);

// Tasks router will be mounted here in Phase 4
// app.use('/tasks', tasksRouter);

export default app;