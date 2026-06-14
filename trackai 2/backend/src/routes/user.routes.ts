// routes/user.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { updateProfileSchema } from '../utils/validators';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

const router = Router();
router.use(authenticate);

router.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true, name: true, email: true, avatar: true, bio: true,
        targetRoles: true, skills: true, linkedinUrl: true, githubUrl: true,
        portfolioUrl: true, plan: true, updatedAt: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

router.delete('/account', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.json({ success: true, message: 'Account deleted' });
  } catch (e) { next(e); }
});

export default router;
