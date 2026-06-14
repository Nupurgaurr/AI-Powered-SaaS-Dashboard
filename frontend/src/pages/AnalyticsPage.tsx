import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { useAnalytics, useFunnel } from '../hooks/useApi';
import { Skeleton } from '../components/ui/Skeleton';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: '#378ADD', OA: '#EF9F27', INTERVIEW: '#534AB7', REJECTED: '#E24B4A', OFFER: '#1D9E75',
};

const FUNNEL_COLORS = ['#534AB7', '#7F77DD', '#AFA9EC', '#1D9E75'];

export const AnalyticsPage = () => {
  const { data, isLoading } = useAnalytics();
  const { data: funnel } = useFunnel();

  const pieData = data
    ? Object.entries(data.byStatus).map(([k, v]) => ({ name: k, value: v, color: STATUS_COLORS[k] }))
    : [];

  const rateCards = [
    { label: 'Total Applications', value: data?.total ?? 0, suffix: '', icon: '💼', color: 'bg-blue-50 border-blue-100' },
    { label: 'Interview Rate', value: data?.rates.interview ?? 0, suffix: '%', icon: '🎤', color: 'bg-purple-50 border-purple-100' },
    { label: 'Rejection Rate', value: data?.rates.rejection ?? 0, suffix: '%', icon: '❌', color: 'bg-red-50 border-red-100' },
    { label: 'Offer Rate', value: data?.rates.offer ?? 0, suffix: '%', icon: '🏆', color: 'bg-green-50 border-green-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Insights into your job search performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rateCards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-5 border ${card.color}`}>
            {isLoading ? <Skeleton className="h-12 w-full" /> : (
              <>
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{card.value}{card.suffix}</div>
                <div className="text-xs text-gray-500 mt-1">{card.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Application Volume</h2>
          <span className="text-xs text-gray-400">Last 6 months</span>
        </div>
        {isLoading ? <Skeleton className="h-52 w-full" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.monthly || []} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => {
                const [year, month] = v.split('-');
                return new Date(Number(year), Number(month) - 1).toLocaleDateString('en', { month: 'short' });
              }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '0.5px solid #e5e7eb' }}
                formatter={(v) => [v, 'Applications']}
                labelFormatter={(label) => {
                  const [year, month] = label.split('-');
                  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });
                }}
              />
              <Bar dataKey="count" fill="#534AB7" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Status Distribution</h2>
          {isLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend
                  iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => value.charAt(0) + value.slice(1).toLowerCase()}
                />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Status breakdown table */}
          {data && (
            <div className="mt-4 space-y-2">
              {Object.entries(data.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                    <span className="text-xs text-gray-600 capitalize">{status.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${data.total > 0 ? (count / data.total) * 100 : 0}%`,
                          background: STATUS_COLORS[status],
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Conversion Funnel</h2>
          {!funnel ? <Skeleton className="h-48 w-full" /> : (
            <>
              <div className="space-y-3 mt-2">
                {funnel.map((stage, i) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {stage.stage.toLowerCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{stage.count}</span>
                        <span className="text-[10px] text-gray-400">({stage.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stage.percentage}%`,
                          background: FUNNEL_COLORS[i] || '#888',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-[11px] text-gray-500 text-center">
                  {funnel[0]?.count > 0 && funnel[3]?.count > 0
                    ? `${((funnel[3].count / funnel[0].count) * 100).toFixed(1)}% offer conversion from applications`
                    : 'Apply to more jobs to see conversion data'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 border border-brand-100 dark:border-brand-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-brand-700 dark:text-brand-300 mb-4">✨ AI-Powered Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '📈',
              title: 'Apply More Consistently',
              desc: data?.monthly && data.monthly.length > 1
                ? `Your peak month had ${Math.max(...data.monthly.map(m => m.count))} applications. Aim for consistency.`
                : 'Start tracking applications to get trend insights.',
            },
            {
              icon: '🎯',
              title: 'Interview Conversion',
              desc: data?.rates.interview
                ? `You convert ${data.rates.interview}% to interviews. Industry avg is ~15%. ${data.rates.interview >= 15 ? '🎉 Above average!' : 'Work on tailoring applications.'}`
                : 'Add applications to see your interview rate.',
            },
            {
              icon: '💡',
              title: 'Resume Tip',
              desc: 'Upload your resume to the AI Analyzer to get a personalized score and improvement suggestions.',
            },
          ].map((insight) => (
            <div key={insight.title} className="bg-white/70 dark:bg-gray-900/50 rounded-xl p-4">
              <div className="text-xl mb-2">{insight.icon}</div>
              <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{insight.title}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">{insight.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
