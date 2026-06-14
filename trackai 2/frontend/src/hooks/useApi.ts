import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import type {
  Application, ApiResponse, AnalyticsDashboard, Resume,
} from '../types';

// ── Applications ──────────────────────────────────
interface ApplicationFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useApplications = (filters: ApplicationFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));

  return useQuery({
    queryKey: ['applications', filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ applications: Application[]; pagination: object }>>
        (`/applications?${params}`);
      return data.data;
    },
  });
};

export const useApplication = (id: string) =>
  useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Application>>(`/applications/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Application>) => {
      const { data } = await api.post<ApiResponse<Application>>('/applications', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Application added!');
    },
  });
};

export const useUpdateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Application> & { id: string }) => {
      const { data } = await api.patch<ApiResponse<Application>>(`/applications/${id}`, payload);
      return data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['applications', vars.id] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Application updated!');
    },
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Application deleted');
    },
  });
};

// ── Analytics ─────────────────────────────────────
export const useAnalytics = () =>
  useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AnalyticsDashboard>>('/analytics/dashboard');
      return data.data;
    },
    staleTime: 30_000,
  });

export const useFunnel = () =>
  useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/funnel');
      return data.data as { stage: string; count: number; percentage: number }[];
    },
  });

// ── Resumes ───────────────────────────────────────
export const useResumes = () =>
  useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Resume[]>>('/resumes');
      return data.data;
    },
  });

// ── AI ────────────────────────────────────────────
export const useResumeAnalysis = () =>
  useMutation({
    mutationFn: async (payload: { resumeText: string; resumeId?: string }) => {
      const { data } = await api.post('/ai/resume/analyze', payload);
      return data.data;
    },
    onSuccess: () => toast.success('Resume analyzed!'),
  });

export const useMatchScore = () =>
  useMutation({
    mutationFn: async (payload: { resumeText: string; jobDescription: string; applicationId?: string }) => {
      const { data } = await api.post('/ai/match-score', payload);
      return data.data;
    },
    onSuccess: () => toast.success('Match score calculated!'),
  });

export const useInterviewQuestions = () =>
  useMutation({
    mutationFn: async (payload: { role: string; company: string; jobDescription?: string }) => {
      const { data } = await api.post('/ai/interview-questions', payload);
      return data.data;
    },
  });

export const useCoverLetter = () =>
  useMutation({
    mutationFn: async (payload: {
      resumeText: string; jobDescription: string;
      companyName: string; role: string; tone?: string;
    }) => {
      const { data } = await api.post('/ai/cover-letter', payload);
      return data.data;
    },
    onSuccess: () => toast.success('Cover letter generated!'),
  });

export const useJobAnalysis = () =>
  useMutation({
    mutationFn: async (payload: { jobDescription: string; applicationId?: string }) => {
      const { data } = await api.post('/ai/job/analyze', payload);
      return data.data;
    },
  });
