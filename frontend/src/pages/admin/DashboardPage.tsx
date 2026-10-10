import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Percent,
  ScanFace,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { AttendanceControlCenter } from '../../three/scenes/AttendanceControlCenter';
import { analyticsService } from '../../services/analytics.service';
import { attendanceService } from '../../services/attendance.service';
import { OverviewKPIs, DailyTrendItem, DepartmentStat } from '../../types/analytics.types';
import { TodayAttendanceSummary } from '../../types/attendance.types';
import { formatDate, formatTime } from '../../utils/formatters';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [todaySummary, setTodaySummary] = useState<TodayAttendanceSummary | null>(null);
  const [dailyTrends, setDailyTrends] = useState<DailyTrendItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [kpiRes, todayRes, trendsRes, deptRes] = await Promise.all([
          analyticsService.getOverview(),
          attendanceService.getTodaySummary(),
          analyticsService.getDailyTrends(10),
          analyticsService.getDepartmentStats(),
        ]);
        setKpis(kpiRes);
        setTodaySummary(todayRes);
        setDailyTrends(trendsRes);
        setDepartments(deptRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time biometric attendance monitoring and campus analytics
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/live-recognition')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition group"
        >
          <ScanFace className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Launch Live Face Scanner</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={kpis?.total_students ?? '--'}
          subtitle={`${kpis?.registered_faces ?? 0} Faces Registered`}
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Present Today"
          value={kpis?.present_today ?? '--'}
          subtitle="Checked-in"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Late Arrivals"
          value={kpis?.late_today ?? '--'}
          subtitle="Past 9:30 AM"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Absent Today"
          value={kpis?.absent_today ?? '--'}
          subtitle="Not marked"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Attendance Rate"
          value={`${kpis?.today_attendance_percentage ?? 0}%`}
          subtitle={`30d Avg: ${kpis?.average_30_days_percentage ?? 0}%`}
          icon={Percent}
          color="indigo"
        />
        <StatCard
          title="Active Cameras"
          value={kpis?.active_cameras ?? 0}
          subtitle="Online Vision Nodes"
          icon={Camera}
          color="cyan"
        />
      </div>

      {/* Three.js 3D Attendance Control Center */}
      <div>
        <AttendanceControlCenter
          attendancePct={kpis?.today_attendance_percentage ?? 88.5}
          onlineCamerasCount={kpis?.active_cameras ?? 2}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Attendance Trend (Area Chart) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Attendance Trend</h3>
              <p className="text-xs text-slate-400">Daily present and late attendance records</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="lateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day_name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '0.75rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#presentGradient)"
                  name="Present"
                />
                <Area
                  type="monotone"
                  dataKey="late"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#lateGradient)"
                  name="Late"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Attendance Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Department Performance</h3>
            <p className="text-xs text-slate-400 mb-4">Overall attendance by discipline</p>

            <div className="space-y-3">
              {departments.map((dept, i) => (
                <div key={dept.id}>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>{dept.code}</span>
                    <span className="text-cyan-400">{dept.overall_rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dept.overall_rate}%`,
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="w-full mt-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            View In-Depth Analytics
          </button>
        </div>
      </div>

      {/* Today's Live Attendance Feed preview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Today's Recognition Feed</h3>
            <p className="text-xs text-slate-400">Most recent verified attendance events</p>
          </div>
          <button
            onClick={() => navigate('/admin/attendance')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            View All Records →
          </button>
        </div>

        {todaySummary && todaySummary.recent_feed.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Check-in</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todaySummary.recent_feed.slice(0, 6).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">
                      {rec.student_id}
                    </td>
                    <td className="py-3 px-3 font-medium text-white">{rec.student_name}</td>
                    <td className="py-3 px-3 text-slate-400">{rec.department_code}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatTime(rec.check_in_time)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : rec.status === 'LATE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {Math.round(rec.recognition_confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">No attendance marked yet today.</p>
        )}
      </div>
    </div>
  );
};
