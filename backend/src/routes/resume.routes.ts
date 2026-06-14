import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/resumes'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.user!.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new AppError('Only PDF and Word documents allowed', 400));
  },
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: resumes });
  } catch (e) { next(e); }
});

router.post('/upload', upload.single('resume'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    // Set previous resumes as non-default
    if (req.body.isDefault === 'true') {
      await prisma.resume.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.user!.id,
        fileName: req.file.originalname,
        fileUrl: `/uploads/resumes/${req.file.filename}`,
        fileSize: req.file.size,
        isDefault: req.body.isDefault === 'true',
      },
    });

    res.status(201).json({ success: true, data: resume });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!resume) throw new AppError('Resume not found', 404);
    await prisma.resume.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Resume deleted' });
  } catch (e) { next(e); }
});

export default router;
