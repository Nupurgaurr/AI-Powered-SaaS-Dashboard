import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { signupSchema, loginSchema } from '../utils/validators';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = signupSchema.parse(req.body);
      const result = await authService.signup(validated);

      logger.info(`New user registered: ${validated.email}`);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      logger.info(`User logged in: ${validated.email}`);
      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new AppError('Refresh token required', 400);

      const tokens = await authService.refreshTokens(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await authService.logout(refreshToken);

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
