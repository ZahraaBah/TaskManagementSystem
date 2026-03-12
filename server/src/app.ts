import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/sanitize';
import { requestLogger } from './utils/logger';
import { validateEnv } from './utils/validateEnv';

// Valider les variables d'env au démarrage
validateEnv();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);
app.use(sanitizeInput);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
