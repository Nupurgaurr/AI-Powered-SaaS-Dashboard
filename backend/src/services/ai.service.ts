import Groq from 'groq-sdk';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

interface AIResponse {
  reportId: string;
  result: Record<string, unknown>;
  score?: number;
}

export class AIService {
  private async callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: MODEL,
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      });
      return completion.choices[0]?.message?.content || '{}';
    } catch (error: unknown) {
      logger.error('Groq API error:', error);
      throw new AppError('AI service temporarily unavailable', 503);
    }
  }

  async analyzeResume(userId: string, resumeText: string, resumeId?: string): Promise<AIResponse> {
    const systemPrompt = `You are an expert technical recruiter and career coach specializing in software engineering roles.
Analyze resumes and return ONLY valid JSON with no markdown.`;

    const userPrompt = `Analyze this resume and return a JSON object with these exact keys:
{
  "overallScore": number (0-100),
  "summary": string (2-3 sentences on overall quality),
  "strengths": string[] (3-5 specific strengths),
  "weaknesses": string[] (3-5 areas to improve),
  "suggestions": [{"category": string, "issue": string, "fix": string}],
  "keywords": {"present": string[], "missing": string[]},
  "atsScore": number (0-100),
  "readabilityScore": number (0-100),
  "sections": {"experience": number, "education": number, "skills": number, "projects": number}
}

Resume:
${resumeText.slice(0, 6000)}`;

    const raw = await this.callGroq(systemPrompt, userPrompt);
    const result = JSON.parse(raw);
    const score = result.overallScore || 0;

    const report = await prisma.aIReport.create({
      data: {
        userId,
        resumeId,
        type: 'RESUME_FEEDBACK',
        input: { resumeLength: resumeText.length },
        output: result,
        score,
      },
    });

    return { reportId: report.id, result, score };
  }

  async analyzeJobDescription(userId: string, jobDescription: string, applicationId?: string): Promise<AIResponse> {
    const systemPrompt = `You are a senior technical recruiter who decodes job descriptions for candidates.
Return ONLY valid JSON with no markdown or extra text.`;

    const userPrompt = `Analyze this job description and return:
{
  "roleLevel": string (intern/junior/mid/senior/staff),
  "requiredSkills": string[],
  "niceToHave": string[],
  "responsibilities": string[],
  "companyInsights": string,
  "redFlags": string[],
  "applicationTips": string[],
  "salaryRange": string or null,
  "remotePolicy": string,
  "difficulty": number (1-10),
  "keywordsToUse": string[]
}

Job Description:
${jobDescription.slice(0, 5000)}`;

    const raw = await this.callGroq(systemPrompt, userPrompt);
    const result = JSON.parse(raw);

    const report = await prisma.aIReport.create({
      data: {
        userId,
        applicationId,
        type: 'JOB_ANALYSIS',
        input: { jdLength: jobDescription.length },
        output: result,
      },
    });

    return { reportId: report.id, result };
  }

  async matchScore(userId: string, resumeText: string, jobDescription: string, applicationId?: string): Promise<AIResponse> {
    const systemPrompt = `You are an ATS (Applicant Tracking System) and technical recruiter hybrid.
Evaluate resume-job fit objectively. Return ONLY valid JSON.`;

    const userPrompt = `Score this resume against this job description and return:
{
  "matchScore": number (0-100),
  "technicalMatch": number (0-100),
  "experienceMatch": number (0-100),
  "educationMatch": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "recommendation": string (should_apply/weak_match/strong_match/overqualified),
  "improvementSteps": string[],
  "coverLetterFocus": string[]
}

RESUME:
${resumeText.slice(0, 4000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}`;

    const raw = await this.callGroq(systemPrompt, userPrompt);
    const result = JSON.parse(raw);
    const score = result.matchScore || 0;

    const report = await prisma.aIReport.create({
      data: {
        userId,
        applicationId,
        type: 'MATCH_SCORE',
        input: { resumeLength: resumeText.length, jdLength: jobDescription.length },
        output: result,
        score,
      },
    });

    return { reportId: report.id, result, score };
  }

  async generateInterviewQuestions(userId: string, role: string, company: string, jobDescription?: string, applicationId?: string): Promise<AIResponse> {
    const systemPrompt = `You are a senior engineering interviewer at top tech companies.
Generate realistic, targeted interview questions. Return ONLY valid JSON.`;

    const userPrompt = `Generate interview questions for:
Role: ${role}
Company: ${company}
${jobDescription ? `Job Description: ${jobDescription.slice(0, 2000)}` : ''}

Return:
{
  "behavioral": [{"question": string, "tip": string, "framework": string}],
  "technical": [{"question": string, "category": string, "difficulty": string, "hint": string}],
  "systemDesign": [{"question": string, "considerations": string[]}],
  "companySpecific": [{"question": string, "why": string}],
  "questionsToAsk": string[]
}

Include 4-5 questions per category.`;

    const raw = await this.callGroq(systemPrompt, userPrompt);
    const result = JSON.parse(raw);

    const report = await prisma.aIReport.create({
      data: {
        userId,
        applicationId,
        type: 'INTERVIEW_QUESTIONS',
        input: { role, company },
        output: result,
      },
    });

    return { reportId: report.id, result };
  }

  async generateCoverLetter(userId: string, params: {
    resumeText: string;
    jobDescription: string;
    companyName: string;
    role: string;
    tone?: string;
    applicationId?: string;
  }): Promise<AIResponse> {
    const systemPrompt = `You are an expert career coach who writes compelling, personalized cover letters.
Return ONLY valid JSON with no markdown.`;

    const userPrompt = `Write a professional cover letter for:
Company: ${params.companyName}
Role: ${params.role}
Tone: ${params.tone || 'professional-enthusiastic'}

Resume (excerpt):
${params.resumeText.slice(0, 3000)}

Job Description:
${params.jobDescription.slice(0, 2000)}

Return:
{
  "coverLetter": string (full cover letter text, 3-4 paragraphs),
  "subject": string (email subject line),
  "highlights": string[] (key selling points used),
  "customizationTips": string[]
}`;

    const raw = await this.callGroq(systemPrompt, userPrompt);
    const result = JSON.parse(raw);

    const report = await prisma.aIReport.create({
      data: {
        userId,
        applicationId: params.applicationId,
        type: 'COVER_LETTER',
        input: { companyName: params.companyName, role: params.role },
        output: result,
      },
    });

    return { reportId: report.id, result };
  }

  async getReports(userId: string, type?: string) {
    return prisma.aIReport.findMany({
      where: {
        userId,
        ...(type && { type: type as never }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
