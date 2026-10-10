import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Percent,
  UserCheck,
  CalendarDays,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { attendanceService } from '../../services/attendance.service';
import { StudentAttendanceHistoryResponse } from '../../types/attendance.types';
import { StatCard } from '../../components/common/StatCard';
import { StudentAttendanceRing } from '../../three/scenes/StudentAttendanceRing';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [history, setHistory] = useState<StudentAttendanceHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const studentId = user?.student_profile?.student_id;

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    attendanceService
      .getStudentAttendance(studentId)
      .then(setHistory)
      .catch((err) => console.error('Failed to load student attendance:', err))
      .finally(() => setIsLoading(false));
  }, [studentId]);

  if (isLoading) {
    return <LoadingSpinner label="Loading your personal attendance records..." />;
  }

  const summary = history?.summary;
  const recentAttendances = history?.attendances.slice(0, 6) || [];
  const todayRecord = history?.attendances[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-cyan-500/10 via-slate-900/40 to-blue-600/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Student Portal
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {user?.student_profile?.student_id} • {user?.department || 'Engineering'} (Class {user?.student_profile?.class_name})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/calendar')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition"
          >
            <CalendarDays className="w-4 h-4 text-cyan-400" />
            <span>View Attendance Calendar</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Attendance Rate"
          value={`${summary?.attendance_percentage ?? 0}%`}
          subtitle="Cumulative score"
          icon={Percent}
          color="emerald"
        />
        <StatCard
          title="Present Days"
          value={summary?.present_days ?? 0}
          subtitle="On-time classes"
          icon={CheckCircle}
          color="cyan"
        />
        <StatCard
          title="Late Arrivals"
          value={summary?.late_days ?? 0}
          subtitle="Check-in past 9:30 AM"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Absent Days"
          value={summary?.absent_days ?? 0}
          subtitle="Unrecorded"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* 3D Student Attendance Ring Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <StudentAttendanceRing
            percentage={summary?.attendance_percentage ?? 90}
            presentDays={summary?.present_days ?? 0}
            lateDays={summary?.late_days ?? 0}
            absentDays={summary?.absent_days ?? 0}
          />
        </div>

        {/* Today's Live Status Card */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Today's Attendance Status</h3>
                <p className="text-xs text-slate-400">Automated biometric check-in confirmation</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    todayRecord?.status === 'PRESENT'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : todayRecord?.status === 'LATE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {todayRecord?.status || 'NOT MARKED YET'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Check-in Time:</span>
                <span className="text-white font-semibold">
                  {formatTime(todayRecord?.check_in_time) || '--'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Check-out Time:</span>
                <span className="text-white font-semibold">
                  {formatTime(todayRecord?.check_out_time) || '--'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Facial Match Confidence:</span>
                <span className="text-cyan-400 font-semibold">
                  {todayRecord ? `${Math.round(todayRecord.recognition_confidence * 100)}%` : '--'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={() => navigate('/student/attendance')}
              className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <span>View Full History Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Attendance Records */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-1">Recent Attendance Sessions</h3>
        <p className="text-xs text-slate-400 mb-4">Your most recent attendance entries</p>

        {recentAttendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Check-in</th>
                  <th className="py-2.5 px-3">Check-out</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3">Vision Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAttendances.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono font-medium text-white">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatTime(rec.check_in_time)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {formatTime(rec.check_out_time)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {Math.round(rec.recognition_confidence * 100)}% Match
                    </td>
                    <td className="py-3 px-3 text-slate-400">{rec.camera_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">No attendance records found.</p>
        )}
      </div>
    </div>
  );
};
