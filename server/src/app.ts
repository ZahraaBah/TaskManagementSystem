import * as dotenv from 'dotenv';
// Load env vars first, before any other module reads process.env.
// In tests, vitest.config.ts has already set the correct vars — dotenv.config()
// will be a no-op if variables are already defined (it never overwrites existing values).
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });

import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/sanitize';
import { requestLogger } from './utils/logger';
import { validateEnv } from './utils/validateEnv';

validateEnv();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);
app.use(sanitizeInput);

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

app.use(errorHandler);

export default app;
