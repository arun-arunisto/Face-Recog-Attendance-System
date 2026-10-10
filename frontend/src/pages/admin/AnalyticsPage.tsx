import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import {
  OverviewKPIs,
  DailyTrendItem,
  WeeklyTrendItem,
  DepartmentStat,
} from '../../types/analytics.types';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const DEPT_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export const AnalyticsPage: React.FC = () => {
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [dailyTrends, setDailyTrends] = useState<DailyTrendItem[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrendItem[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [daysRange, setDaysRange] = useState<number>(14);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [kpiRes, dailyRes, weeklyRes, monthlyRes, deptRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getDailyTrends(daysRange),
          analyticsService.getWeeklyTrends(),
          analyticsService.getMonthlyTrends(),
          analyticsService.getDepartmentStats(),
        ]);
        setKpis(kpiRes);
        setDailyTrends(dailyRes);
        setWeeklyTrends(weeklyRes);
        setMonthlyTrends(monthlyRes);
        setDepartments(deptRes);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [daysRange]);

  if (isLoading) {
    return <LoadingSpinner label="Compiling analytics intelligence..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Attendance Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Predictive biometric metrics, absenteeism patterns, and department analytics
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Timespan:</span>
          <select
            value={daysRange}
            onChange={(e) => setDaysRange(Number(e.target.value))}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value={7} className="bg-slate-900">Last 7 Days</option>
            <option value={14} className="bg-slate-900">Last 14 Days</option>
            <option value={30} className="bg-slate-900">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${kpis?.average_30_days_percentage ?? 0}%`}
          subtitle="Campus-wide 30-day rate"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Daily Average Present"
          value={kpis?.present_today ?? '--'}
          subtitle="Students on campus"
          icon={BarChart3}
          color="cyan"
        />
        <StatCard
          title="Late Arrivals Today"
          value={kpis?.late_today ?? '--'}
          subtitle="Check-in past threshold"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Absenteeism Rate"
          value={`${Math.max(0, 100 - (kpis?.average_30_days_percentage ?? 0)).toFixed(1)}%`}
          subtitle="Missed sessions"
          icon={Layers}
          color="rose"
        />
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Daily Trend */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Daily Attendance Percentage</h3>
              <p className="text-xs text-slate-400">Attendance trend over selected days</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrends}>
                <XAxis dataKey="day_name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '0.75rem',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Department Distribution */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Department Roster</h3>
            <p className="text-xs text-slate-400 mb-4">Students enrolled per discipline</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departments}
                    dataKey="student_count"
                    nameKey="code"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {departments.map((_, index) => (
                      <Cell key={index} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '0.75rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            {departments.map((dept, i) => (
              <div key={dept.id} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                />
                <span className="text-slate-300 font-medium truncate">
                  {dept.code} ({dept.student_count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Chart: Weekly Breakdown Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Weekly Performance Trend</h3>
            <p className="text-xs text-slate-400">Aggregated weekly volume of present vs late records</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrends}>
              <XAxis dataKey="week_label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
              <Bar dataKey="present" fill="#10b981" name="On-Time Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill="#f59e0b" name="Late Arrivals" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
