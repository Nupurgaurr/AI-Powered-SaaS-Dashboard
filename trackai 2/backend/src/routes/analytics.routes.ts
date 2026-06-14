// routes/analytics.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AnalyticsService } from '../services/analytics.service';

const router = Router();
const analyticsService = new AnalyticsService();

router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getDashboardStats(req.user!.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/timeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await analyticsService.getApplicationTimeline(req.user!.id, days);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/funnel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getConversionFunnel(req.user!.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

export default router;
