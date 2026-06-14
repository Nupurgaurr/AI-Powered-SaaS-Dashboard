import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApplications, useDeleteApplication } from '../hooks/useApi';
import { StatusBadge } from '../components/applications/StatusBadge';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { Skeleton } from '../components/ui/Skeleton';
import { format } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';
import type { Application, ApplicationStatus } from '../types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'OA', value: 'OA' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Offer', value: 'OFFER' },
];

export const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(searchParams.get('add') === 'true');
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('appliedDate');

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useApplications({
    search: debouncedSearch,
    status: statusFilter,
    sortBy,
    sortOrder: 'desc',
  });
  const deleteApp = useDeleteApplication();

  const applications = data?.applications || [];

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDelete = async (app: Application) => {
    if (!confirm(`Delete application for ${app.companyName}?`)) return;
    await deleteApp.mutateAsync(app.id);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.pagination.total ?? 0} total applications
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors self-start sm:self-auto"
        >
          + Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies, roles, locations..."
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="appliedDate">Sort: Date Applied</option>
          <option value="companyName">Sort: Company</option>
          <option value="nextActionDate">Sort: Next Action</option>
        </select>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              statusFilter === f.value
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-brand-200 hover:text-brand-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-brand-500"
                    onChange={(e) => setSelectedIds(e.target.checked ? new Set(applications.map(a => a.id)) : new Set())}
                    checked={selectedIds.size === applications.length && applications.length > 0}
                  />
                </th>
                {['Company · Role', 'Status', 'Applied', 'Location', 'Next Action', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-sm text-gray-500">
                    {search || statusFilter ? 'No applications match your filters.' : 'No applications yet. Add your first one!'}
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5" onClick={(e) => { e.stopPropagation(); toggleSelect(app.id); }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="rounded border-gray-300 text-brand-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3.5" onClick={() => navigate(`/applications/${app.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {app.companyName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{app.companyName}</p>
                          <p className="text-xs text-gray-500">{app.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5" onClick={() => navigate(`/applications/${app.id}`)}>
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500" onClick={() => navigate(`/applications/${app.id}`)}>
                      {format(new Date(app.appliedDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500" onClick={() => navigate(`/applications/${app.id}`)}>
                      {app.location || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs" onClick={() => navigate(`/applications/${app.id}`)}>
                      {app.nextActionDate ? (
                        <span className="text-amber-600 font-medium">
                          {format(new Date(app.nextActionDate), 'MMM d')}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditApp(app); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(app); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1}–
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {(showModal || editApp) && (
        <ApplicationModal
          application={editApp || undefined}
          onClose={() => { setShowModal(false); setEditApp(null); }}
        />
      )}
    </div>
  );
};
