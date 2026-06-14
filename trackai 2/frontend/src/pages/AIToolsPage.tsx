import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useResumeAnalysis, useMatchScore, useInterviewQuestions,
  useCoverLetter, useJobAnalysis,
} from '../hooks/useApi';
import { Skeleton } from '../components/ui/Skeleton';

type Tool = 'resume' | 'match' | 'interview' | 'cover' | 'jd';

const TOOLS: { id: Tool; label: string; icon: string; desc: string }[] = [
  { id: 'resume',    label: 'Resume Analyzer',    icon: '📄', desc: 'Get AI feedback and score on your resume' },
  { id: 'jd',       label: 'JD Analyzer',         icon: '🔍', desc: 'Decode any job description instantly' },
  { id: 'match',    label: 'Match Score',          icon: '🎯', desc: 'See how well your resume fits a job' },
  { id: 'interview',label: 'Interview Prep',       icon: '💡', desc: 'Generate tailored interview questions' },
  { id: 'cover',    label: 'Cover Letter',         icon: '✉️', desc: 'Write a personalized cover letter' },
];

const textareaClass = "w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none transition-all";
const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all";
const btnClass = "flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-all";

// ── Resume Analyzer ──────────────────────────────
const ResumeAnalyzer = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ resumeText: string }>();
  const analyze = useResumeAnalysis();

  const onSubmit = async (data: { resumeText: string }) => {
    await analyze.mutateAsync(data);
  };

  const result = analyze.data?.result as Record<string, unknown> | undefined;

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Paste your resume text *
          </label>
          <textarea
            {...register('resumeText', { required: true })}
            rows={10}
            placeholder="Paste your full resume here (copy from PDF or Word doc)..."
            className={textareaClass}
          />
        </div>
        <button type="submit" disabled={isSubmitting || analyze.isPending} className={btnClass}>
          {analyze.isPending ? <><Spinner /> Analyzing...</> : '✨ Analyze Resume'}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Score */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Overall Score', value: result.overallScore as number, color: scoreColor(result.overallScore as number) },
              { label: 'ATS Score', value: result.atsScore as number, color: scoreColor(result.atsScore as number) },
              { label: 'Readability', value: result.readabilityScore as number, color: scoreColor(result.readabilityScore as number) },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{result.summary as string}</p>
          </div>

          {/* Strengths + Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-green-700 mb-3 uppercase tracking-wider">✅ Strengths</h3>
              <ul className="space-y-1.5">
                {(result.strengths as string[])?.map((s, i) => (
                  <li key={i} className="text-xs text-green-800 dark:text-green-300 flex gap-2">
                    <span className="text-green-400 flex-shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-red-700 mb-3 uppercase tracking-wider">⚠️ Improve</h3>
              <ul className="space-y-1.5">
                {(result.weaknesses as string[])?.map((w, i) => (
                  <li key={i} className="text-xs text-red-800 dark:text-red-300 flex gap-2">
                    <span className="text-red-400 flex-shrink-0">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          {(result.suggestions as { category: string; issue: string; fix: string }[])?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">💬 Suggestions</h3>
              <div className="space-y-3">
                {(result.suggestions as { category: string; issue: string; fix: string }[]).map((s, i) => (
                  <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-2 border-amber-400">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase mb-1">{s.category}</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-1"><strong>Issue:</strong> {s.issue}</p>
                    <p className="text-xs text-green-700 dark:text-green-400"><strong>Fix:</strong> {s.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {result.keywords && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">✅ Keywords Present</h3>
                <div className="flex flex-wrap gap-1.5">
                  {((result.keywords as Record<string, string[]>).present || []).map((k, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">{k}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">❌ Missing Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {((result.keywords as Record<string, string[]>).missing || []).map((k, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full font-medium">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ── JD Analyzer ──────────────────────────────────
const JDAnalyzer = () => {
  const { register, handleSubmit } = useForm<{ jobDescription: string }>();
  const analyze = useJobAnalysis();

  const result = analyze.data?.result as Record<string, unknown> | undefined;

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit((d) => analyze.mutateAsync(d))} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Job Description *</label>
          <textarea {...register('jobDescription', { required: true })} rows={10} placeholder="Paste the full job description here..." className={textareaClass} />
        </div>
        <button type="submit" disabled={analyze.isPending} className={btnClass}>
          {analyze.isPending ? <><Spinner /> Analyzing...</> : '🔍 Analyze JD'}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Level', value: result.roleLevel as string },
              { label: 'Difficulty', value: `${result.difficulty as number}/10` },
              { label: 'Remote', value: result.remotePolicy as string },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{s.value || '—'}</div>
                <div className="text-[10px] text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">🏢 Company Insight</h3>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{result.companyInsights as string}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">🔧 Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(result.requiredSkills as string[] || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-brand-100 text-brand-600 text-[10px] rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">⭐ Nice to Have</h3>
              <div className="flex flex-wrap gap-1.5">
                {(result.niceToHave as string[] || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {(result.redFlags as string[])?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wider">🚩 Red Flags</h3>
              <ul className="space-y-1">
                {(result.redFlags as string[]).map((f, i) => (
                  <li key={i} className="text-xs text-red-800 dark:text-red-300">• {f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wider">💡 Application Tips</h3>
            <ul className="space-y-1.5">
              {(result.applicationTips as string[] || []).map((t, i) => (
                <li key={i} className="text-xs text-green-800 dark:text-green-300 flex gap-2">
                  <span className="text-green-500 flex-shrink-0">{i + 1}.</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ── Match Score ──────────────────────────────────
const MatchScore = () => {
  const { register, handleSubmit } = useForm<{ resumeText: string; jobDescription: string }>();
  const match = useMatchScore();
  const result = match.data?.result as Record<string, unknown> | undefined;
  const score = match.data?.score;

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit((d) => match.mutateAsync(d))} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Your Resume *</label>
          <textarea {...register('resumeText', { required: true })} rows={6} placeholder="Paste your resume text..." className={textareaClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Job Description *</label>
          <textarea {...register('jobDescription', { required: true })} rows={6} placeholder="Paste the job description..." className={textareaClass} />
        </div>
        <button type="submit" disabled={match.isPending} className={btnClass}>
          {match.isPending ? <><Spinner /> Scoring...</> : '🎯 Calculate Match'}
        </button>
      </form>

      {result && score !== undefined && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Big Score */}
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className={`text-7xl font-bold ${scoreColor(score)}`}>{score}</div>
            <div className="text-gray-500 text-sm mt-1">/ 100 match score</div>
            <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold capitalize
              ${(result.recommendation as string) === 'strong_match' ? 'bg-green-100 text-green-700' :
                (result.recommendation as string) === 'should_apply' ? 'bg-blue-100 text-blue-700' :
                (result.recommendation as string) === 'weak_match' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'}`}>
              {(result.recommendation as string)?.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Technical', value: result.technicalMatch as number },
              { label: 'Experience', value: result.experienceMatch as number },
              { label: 'Education', value: result.educationMatch as number },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <div className={`text-2xl font-bold ${scoreColor(s.value)}`}>{s.value}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wider">✅ Matched Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(result.matchedSkills as string[] || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wider">❌ Missing Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(result.missingSkills as string[] || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wider">🛠 Improvement Steps</h3>
            <ul className="space-y-1.5">
              {(result.improvementSteps as string[] || []).map((s, i) => (
                <li key={i} className="text-xs text-amber-800 dark:text-amber-300 flex gap-2">
                  <span className="text-amber-500 flex-shrink-0">{i + 1}.</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ── Interview Prep ───────────────────────────────
const InterviewPrep = () => {
  const { register, handleSubmit } = useForm<{ role: string; company: string; jobDescription: string }>();
  const generate = useInterviewQuestions();
  const result = generate.data?.result as Record<string, unknown> | undefined;
  const [activeTab, setActiveTab] = useState<'behavioral' | 'technical' | 'systemDesign' | 'companySpecific'>('behavioral');

  const tabs = [
    { id: 'behavioral', label: '🧠 Behavioral' },
    { id: 'technical', label: '💻 Technical' },
    { id: 'systemDesign', label: '🏗 System Design' },
    { id: 'companySpecific', label: '🏢 Company' },
  ] as const;

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit((d) => generate.mutateAsync(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Role *</label>
            <input {...register('role', { required: true })} placeholder="Software Engineer Intern" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Company *</label>
            <input {...register('company', { required: true })} placeholder="Google, Meta, Stripe..." className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Job Description (optional)</label>
          <textarea {...register('jobDescription')} rows={4} placeholder="Paste job description for tailored questions..." className={textareaClass} />
        </div>
        <button type="submit" disabled={generate.isPending} className={btnClass}>
          {generate.isPending ? <><Spinner /> Generating...</> : '💡 Generate Questions'}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {activeTab === 'behavioral' && (result.behavioral as { question: string; tip: string; framework: string }[] || []).map((q, i) => (
              <QuestionCard key={i} index={i + 1} question={q.question}>
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400"><strong>Framework:</strong> {q.framework}</p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400"><strong>Tip:</strong> {q.tip}</p>
                </div>
              </QuestionCard>
            ))}

            {activeTab === 'technical' && (result.technical as { question: string; category: string; difficulty: string; hint: string }[] || []).map((q, i) => (
              <QuestionCard key={i} index={i + 1} question={q.question}>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-medium">{q.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    q.difficulty === 'Hard' ? 'bg-red-100 text-red-600' :
                    q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
                  }`}>{q.difficulty}</span>
                  <p className="w-full text-[11px] text-gray-500 mt-1"><strong>Hint:</strong> {q.hint}</p>
                </div>
              </QuestionCard>
            ))}

            {activeTab === 'systemDesign' && (result.systemDesign as { question: string; considerations: string[] }[] || []).map((q, i) => (
              <QuestionCard key={i} index={i + 1} question={q.question}>
                <div className="mt-2">
                  <p className="text-[11px] text-gray-500 mb-1 font-medium">Key considerations:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.considerations.map((c, j) => (
                      <span key={j} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              </QuestionCard>
            ))}

            {activeTab === 'companySpecific' && (result.companySpecific as { question: string; why: string }[] || []).map((q, i) => (
              <QuestionCard key={i} index={i + 1} question={q.question}>
                <p className="text-[11px] text-gray-500 mt-2"><strong>Why they ask:</strong> {q.why}</p>
              </QuestionCard>
            ))}
          </div>

          {result.questionsToAsk && (
            <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-brand-700 mb-2 uppercase tracking-wider">🙋 Questions to Ask Them</h3>
              <ul className="space-y-1.5">
                {(result.questionsToAsk as string[]).map((q, i) => (
                  <li key={i} className="text-xs text-brand-800 dark:text-brand-300 flex gap-2">
                    <span className="text-brand-400 flex-shrink-0">→</span>{q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ── Cover Letter ─────────────────────────────────
const CoverLetterGen = () => {
  const { register, handleSubmit } = useForm<{
    resumeText: string; jobDescription: string;
    companyName: string; role: string; tone: string;
  }>();
  const generate = useCoverLetter();
  const result = generate.data?.result as Record<string, unknown> | undefined;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result?.coverLetter) {
      navigator.clipboard.writeText(result.coverLetter as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit((d) => generate.mutateAsync(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Company *</label>
            <input {...register('companyName', { required: true })} placeholder="Google" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Role *</label>
            <input {...register('role', { required: true })} placeholder="Software Engineer Intern" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tone</label>
          <select {...register('tone')} className={inputClass}>
            <option value="professional">Professional</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Resume Text *</label>
          <textarea {...register('resumeText', { required: true })} rows={5} placeholder="Paste your resume..." className={textareaClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Job Description *</label>
          <textarea {...register('jobDescription', { required: true })} rows={5} placeholder="Paste the job description..." className={textareaClass} />
        </div>
        <button type="submit" disabled={generate.isPending} className={btnClass}>
          {generate.isPending ? <><Spinner /> Writing...</> : '✉️ Generate Cover Letter'}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {result.subject && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 uppercase mb-1">Email Subject</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{result.subject as string}</p>
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cover Letter</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 border border-brand-200 rounded-lg transition-all"
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {result.coverLetter as string}
            </div>
          </div>

          {(result.customizationTips as string[])?.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wider">💡 Customization Tips</h3>
              <ul className="space-y-1">
                {(result.customizationTips as string[]).map((t, i) => (
                  <li key={i} className="text-xs text-amber-800 dark:text-amber-300">• {t}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ── Helpers ──────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const scoreColor = (score: number) =>
  score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';

const QuestionCard = ({ index, question, children }: { index: number; question: string; children?: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
    <div className="flex gap-3">
      <span className="w-6 h-6 bg-brand-100 text-brand-600 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {index}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">{question}</p>
        {children}
      </div>
    </div>
  </div>
);

const TOOL_COMPONENTS: Record<Tool, React.ComponentType> = {
  resume: ResumeAnalyzer,
  jd: JDAnalyzer,
  match: MatchScore,
  interview: InterviewPrep,
  cover: CoverLetterGen,
};

// ── Main Page ────────────────────────────────────
export const AIToolsPage = () => {
  const { tool } = useParams<{ tool?: Tool }>();
  const [activeTool, setActiveTool] = useState<Tool>(
    (tool && TOOL_COMPONENTS[tool as Tool]) ? tool as Tool : 'resume'
  );

  const ActiveComponent = TOOL_COMPONENTS[activeTool];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">✨ AI Tools</h1>
        <p className="text-sm text-gray-500 mt-0.5">Powered by Groq · Llama 3.3 70B</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tool Selector */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-2 space-y-1">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  activeTool === t.id
                    ? 'bg-brand-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-400'
                }`}
              >
                <span className="text-lg flex-shrink-0">{t.icon}</span>
                <div>
                  <p className="text-xs font-medium">{t.label}</p>
                  <p className={`text-[10px] mt-0.5 leading-tight ${activeTool === t.id ? 'text-brand-100' : 'text-gray-400'}`}>
                    {t.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-3">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">⚡ Rate Limit</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">20 AI requests per hour on free plan</p>
          </div>
        </div>

        {/* Active Tool */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <span className="text-2xl">{TOOLS.find(t => t.id === activeTool)?.icon}</span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {TOOLS.find(t => t.id === activeTool)?.label}
                  </h2>
                  <p className="text-xs text-gray-500">{TOOLS.find(t => t.id === activeTool)?.desc}</p>
                </div>
              </div>
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
