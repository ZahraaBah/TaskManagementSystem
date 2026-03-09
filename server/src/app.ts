import express from 'express';
import cors from 'cors';
import authRouter from './modules/auth/auth.routes';

const app = express();

// Allow requests from the frontend dev server
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRouter);

// app.use('/tasks', tasksRouter); // Phase 4

export default app;