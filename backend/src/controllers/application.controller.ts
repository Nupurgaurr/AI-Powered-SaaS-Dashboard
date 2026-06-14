import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { createApplicationSchema, updateApplicationSchema } from '../utils/validators';
import { AppError } from '../utils/errors';

const applicationService = new ApplicationService();

export class ApplicationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, sortBy, sortOrder, page, limit } = req.query;

      const result = await applicationService.getAll(req.user!.id, {
        status: status as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await applicationService.getOne(req.params.id, req.user!.id);
      res.json({ success: true, data: app });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createApplicationSchema.parse(req.body);
      const app = await applicationService.create(req.user!.id, validated);
      res.status(201).json({ success: true, message: 'Application added', data: app });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateApplicationSchema.parse(req.body);
      const app = await applicationService.update(req.params.id, req.user!.id, validated);
      res.json({ success: true, message: 'Application updated', data: app });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await applicationService.delete(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Application deleted' });
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) throw new AppError('IDs array required', 400);
      const count = await applicationService.bulkDelete(ids, req.user!.id);
      res.json({ success: true, message: `${count} applications deleted` });
    } catch (error) {
      next(error);
    }
  }
}
