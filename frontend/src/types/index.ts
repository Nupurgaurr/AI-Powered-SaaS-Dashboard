export type ApplicationStatus = 'APPLIED' | 'OA' | 'INTERVIEW' | 'REJECTED' | 'OFFER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Application {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  location?: string;
  jobLink?: string;
  notes?: string;
  salary?: string;
  nextActionDate?: string;
  contactName?: string;
  contactEmail?: string;
  source?: string;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  aiReports?: AIReport[];
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isDefault: boolean;
  parsedText?: string;
  skills: string[];
  createdAt: string;
}

export interface AIReport {
  id: string;
  type: AIReportType;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  score?: number;
  createdAt: string;
}

export type AIReportType =
  | 'RESUME_FEEDBACK'
  | 'JOB_ANALYSIS'
  | 'MATCH_SCORE'
  | 'INTERVIEW_QUESTIONS'
  | 'COVER_LETTER';

export interface AnalyticsDashboard {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  rates: { interview: number; rejection: number; offer: number };
  monthly: { month: string; count: number }[];
  recentApplications: Pick<Application, 'id' | 'companyName' | 'role' | 'status' | 'appliedDate'>[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; dot: string }> = {
  APPLIED:   { label: 'Applied',   color: 'text-blue-700',  bg: 'bg-blue-50',   dot: 'bg-blue-400'   },
  OA:        { label: 'OA',        color: 'text-amber-700', bg: 'bg-amber-50',  dot: 'bg-amber-400'  },
  INTERVIEW: { label: 'Interview', color: 'text-brand-500', bg: 'bg-brand-50',  dot: 'bg-brand-500'  },
  REJECTED:  { label: 'Rejected',  color: 'text-red-700',   bg: 'bg-red-50',    dot: 'bg-red-400'    },
  OFFER:     { label: 'Offer',     color: 'text-green-700', bg: 'bg-green-50',  dot: 'bg-green-400'  },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  LOW:    { label: 'Low',    color: 'text-gray-500' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600' },
  HIGH:   { label: 'High',   color: 'text-red-600'  },
};
