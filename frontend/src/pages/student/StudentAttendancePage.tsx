import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { attendanceService } from '../../services/attendance.service';
import { AttendanceRecord, AttendanceStatusType } from '../../types/attendance.types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';

export const StudentAttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const studentId = user?.student_profile?.student_id;

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusType | ''>('');

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    attendanceService
      .getAttendanceList({
        student_id: studentId,
        status: statusFilter ? (statusFilter as AttendanceStatusType) : undefined,
      })
      .then((data) => setRecords(data.results))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [studentId, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Attendance Log</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete verifiable check-in records for {user?.full_name} ({records.length} records)
          </p>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AttendanceStatusType | '')}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present Only</option>
            <option value="LATE">Late Only</option>
            <option value="ABSENT">Absent Only</option>
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner label="Loading attendance entries..." />
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-medium">No records found matching current criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-in Time</th>
                  <th className="py-3 px-4">Check-out Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Verification Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatTime(rec.check_in_time)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {formatTime(rec.check_out_time)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {Math.round(rec.recognition_confidence * 100)}% Match
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{rec.camera_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
