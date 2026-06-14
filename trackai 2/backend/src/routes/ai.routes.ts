import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { AIService } from '../services/ai.service';
import {
  resumeAnalysisSchema, jobAnalysisSchema, matchScoreSchema,
  interviewQuestionsSchema, coverLetterSchema,
} from '../utils/validators';

const router = Router();
const aiService = new AIService();

router.use(authenticate);
router.use(aiRateLimiter);

router.post('/resume/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeText, resumeId } = resumeAnalysisSchema.parse(req.body);
    const result = await aiService.analyzeResume(req.user!.id, resumeText, resumeId);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.post('/job/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobDescription, applicationId } = jobAnalysisSchema.parse(req.body);
    const result = await aiService.analyzeJobDescription(req.user!.id, jobDescription, applicationId);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.post('/match-score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobDescription, applicationId } = matchScoreSchema.parse(req.body);
    const result = await aiService.matchScore(req.user!.id, resumeText, jobDescription, applicationId);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.post('/interview-questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = interviewQuestionsSchema.parse(req.body);
    const result = await aiService.generateInterviewQuestions(
      req.user!.id, data.role, data.company, data.jobDescription, data.applicationId
    );
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.post('/cover-letter', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = coverLetterSchema.parse(req.body);
    const result = await aiService.generateCoverLetter(req.user!.id, data);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.get('/reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const reports = await aiService.getReports(req.user!.id, type as string);
    res.json({ success: true, data: reports });
  } catch (e) { next(e); }
});

export default router;
