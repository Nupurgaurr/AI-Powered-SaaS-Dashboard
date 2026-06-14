import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { notFound } from './middleware/notFound.middleware';

import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import resumeRoutes from './routes/resume.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';

import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ──────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── General middleware ───────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}
app.use(requestLogger);

// ── Rate limiting ────────────────────────────────
app.use('/api/', rateLimiter);

// ── Static files (resume uploads) ───────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Health check ─────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  } catch {
    res.status(503).json({ status: 'degraded', error: 'Database unreachable' });
  }
});

// ── API Routes ───────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ── Error handling ───────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ─────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`🚀 TrackAI API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});

export default app;
