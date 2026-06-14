import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useApplication, useDeleteApplication } from '../hooks/useApi';
import { StatusBadge } from '../components/applications/StatusBadge';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { Skeleton } from '../components/ui/Skeleton';
import { PRIORITY_CONFIG } from '../types';
import type { ApplicationStatus } from '../types';

export const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: app, isLoading } = useApplication(id!);
  const deleteApp = useDeleteApplication();
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete application for ${app?.companyName}?`)) return;
    await deleteApp.mutateAsync(id!);
    navigate('/applications');
  };

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 w-full" />
    </div>
  );

  if (!app) return (
    <div className="p-6 text-center py-20">
      <p className="text-gray-500">Application not found.</p>
      <button onClick={() => navigate('/applications')} className="mt-3 text-sm text-brand-500 hover:text-brand-600">← Back to applications</button>
    </div>
  );

  const priority = PRIORITY_CONFIG[app.priority];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/applications')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        ← Back to Applications
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-500 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {app.companyName[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{app.companyName}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-0.5">{app.role}</p>
              <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                <StatusBadge status={app.status as ApplicationStatus} />
                <span className={`text-xs font-medium ${priority.color}`}>
                  {priority.label} Priority
                </span>
                {app.location && (
                  <span className="text-xs text-gray-500">📍 {app.location}</span>
                )}
                {app.salary && (
                  <span className="text-xs text-gray-500">💰 {app.salary}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all"
            >
              ✏️ Edit
            </button>
            {app.jobLink && (
              <a
                href={app.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 border border-brand-200 rounded-lg transition-all"
              >
                🔗 Job Post
              </a>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-all"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Key Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Applied</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(app.appliedDate), 'MMM d, yyyy')}
                </p>
              </div>
              {app.nextActionDate && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <p className="text-[10px] text-amber-600 uppercase tracking-wider mb-1">Next Action</p>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {format(new Date(app.nextActionDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {app.notes && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Notes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                {app.notes}
              </p>
            </div>
          )}

          {/* AI Reports */}
          {app.aiReports && app.aiReports.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">AI Reports</h2>
              <div className="space-y-3">
                {app.aiReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">
                        {report.type === 'MATCH_SCORE' ? '🎯' :
                         report.type === 'RESUME_FEEDBACK' ? '📄' :
                         report.type === 'INTERVIEW_QUESTIONS' ? '💡' :
                         report.type === 'COVER_LETTER' ? '✉️' : '🔍'}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {report.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {format(new Date(report.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {report.score != null && (
                      <div className="text-right">
                        <span className={`text-sm font-bold ${
                          report.score >= 80 ? 'text-green-600' :
                          report.score >= 60 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {report.score}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-5">
          {/* Contact */}
          {(app.contactName || app.contactEmail) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Contact</h2>
              {app.contactName && (
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {app.contactName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{app.contactName}</p>
                    {app.contactEmail && (
                      <a href={`mailto:${app.contactEmail}`} className="text-xs text-brand-500 hover:text-brand-600">
                        {app.contactEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Details</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Source', value: app.source },
                { label: 'Added', value: format(new Date(app.createdAt), 'MMM d, yyyy') },
                { label: 'Last updated', value: format(new Date(app.updatedAt), 'MMM d') },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Quick AI Actions */}
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-3">✨ AI Tools</h2>
            <div className="space-y-2">
              {[
                { label: 'Generate Interview Qs', to: `/ai/interview?appId=${app.id}`, icon: '💡' },
                { label: 'Write Cover Letter', to: `/ai/cover?appId=${app.id}`, icon: '✉️' },
                { label: 'Analyze Job Description', to: `/ai/jd?appId=${app.id}`, icon: '🔍' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-800/30 rounded-lg transition-all"
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <ApplicationModal application={app} onClose={() => setEditing(false)} />
      )}
    </div>
  );
};
