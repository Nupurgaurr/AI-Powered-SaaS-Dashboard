import { z } from 'zod';

// ── Auth ──────────────────────────────────────────
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'Password required'),
});

// ── Application ───────────────────────────────────
const statusEnum = z.enum(['APPLIED', 'OA', 'INTERVIEW', 'REJECTED', 'OFFER']);
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createApplicationSchema = z.object({
  companyName: z.string().min(1, 'Company name required').max(100),
  role: z.string().min(1, 'Role required').max(100),
  status: statusEnum.default('APPLIED'),
  appliedDate: z.string().datetime().optional(),
  location: z.string().max(100).optional(),
  jobLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
  salary: z.string().max(50).optional(),
  nextActionDate: z.string().datetime().optional(),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  source: z.string().max(50).optional(),
  priority: priorityEnum.default('MEDIUM'),
});

export const updateApplicationSchema = createApplicationSchema.partial();

// ── User Profile ──────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  targetRoles: z.array(z.string()).max(10).optional(),
  skills: z.array(z.string()).max(50).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

// ── AI Requests ───────────────────────────────────
export const resumeAnalysisSchema = z.object({
  resumeText: z.string().min(100, 'Resume text too short').max(20000),
  resumeId: z.string().optional(),
});

export const jobAnalysisSchema = z.object({
  jobDescription: z.string().min(50).max(10000),
  applicationId: z.string().optional(),
});

export const matchScoreSchema = z.object({
  resumeText: z.string().min(100).max(15000),
  jobDescription: z.string().min(50).max(10000),
  applicationId: z.string().optional(),
});

export const interviewQuestionsSchema = z.object({
  role: z.string().min(2).max(100),
  company: z.string().min(2).max(100),
  jobDescription: z.string().max(5000).optional(),
  applicationId: z.string().optional(),
});

export const coverLetterSchema = z.object({
  resumeText: z.string().min(100).max(15000),
  jobDescription: z.string().min(50).max(10000),
  companyName: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'formal']).default('professional'),
  applicationId: z.string().optional(),
});
