import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/errors';

export const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('Too many requests, please try again later.', 429));
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: Number(process.env.AI_RATE_LIMIT_MAX) || 20,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
  handler: (_req, _res, next) => {
    next(new AppError('AI request limit reached. Please wait before making more AI requests.', 429));
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (_req, _res, next) => {
    next(new AppError('Too many login attempts. Please wait 15 minutes.', 429));
  },
});
