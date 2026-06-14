import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAnalytics } from '../hooks/useApi';
import { useAuthStore } from '../store/auth.store';
import { StatusBadge } from '../components/applications/StatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { format } from 'date-fns';
import type { ApplicationStatus } from '../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED:   '#378ADD',
  OA:        '#EF9F27',
  INTERVIEW: '#534AB7',
  REJECTED:  '#E24B4A',
  OFFER:     '#1D9E75',
};

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data, isLoading } = useAnalytics();

  const statCards = [
    { label: 'Total Applied', value: data?.total ?? 0, icon: '💼', delta: '+4 this week', up: true },
    { label: 'Interview Rate', value: `${data?.rates.interview ?? 0}%`, icon: '🎤', delta: 'of applications', up: null },
    { label: 'Rejection Rate', value: `${data?.rates.rejection ?? 0}%`, icon: '❌', delta: 'of applications', up: null },
    { label: 'Offer Rate', value: `${data?.rates.offer ?? 0}%`, icon: '🏆', delta: 'of applications', up: data?.rates.offer && data.rates.offer > 0 },
  ];

  const pieData = data
    ? Object.entries(data.byStatus).map(([status, count]) => ({
        name: status, value: count, color: STATUS_COLORS[status as ApplicationStatus],
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')} · Here's your job search overview
          </p>
        </div>
        <button
          onClick={() => navigate('/applications?add=true')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          + Add Application
        </button>
      </div>

      {/* AI Insight Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-50 to-green-50 dark:from-brand-900/20 dark:to-green-900/20 border border-brand-100 dark:border-brand-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-lg">✨</div>
          <div>
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              AI Insight · Your resume score is 78/100
            </p>
            <p className="text-xs text-brand-500 mt-0.5">
              3 companies match your target roles · 2 applications need follow-up
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/ai/resume')}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-all"
        >
          Analyze Resume →
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{card.label}</span>
                  <span className="text-base">{card.icon}</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</div>
                <div className={`text-[11px] mt-1 ${card.up === true ? 'text-green-600' : card.up === false ? 'text-red-500' : 'text-gray-400'}`}>
                  {card.up === true && '↑ '}{card.delta}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Bar Chart */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Monthly Applications</h2>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data?.monthly || []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '0.5px solid #e5e7eb' }}
                  formatter={(v) => [v, 'Applications']}
                />
                <Bar dataKey="count" fill="#534AB7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie Chart */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Status Breakdown</h2>
            <span className="text-xs text-gray-400">{data?.total || 0} total</span>
          </div>
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => value.charAt(0) + value.slice(1).toLowerCase()} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">Recent Applications</h2>
          <button onClick={() => navigate('/applications')} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
            View all →
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5">
                <Skeleton className="h-5 w-full" />
              </div>
            ))
          ) : data?.recentApplications.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-gray-500">No applications yet.</p>
              <button
                onClick={() => navigate('/applications?add=true')}
                className="mt-2 text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                Add your first application →
              </button>
            </div>
          ) : (
            data?.recentApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-500 flex items-center justify-center text-xs font-bold">
                    {app.companyName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{app.companyName}</p>
                    <p className="text-xs text-gray-500">{app.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status as ApplicationStatus} />
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {format(new Date(app.appliedDate), 'MMM d')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
