import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { attendanceService } from '../../services/attendance.service';
import { CalendarDayRecord } from '../../types/attendance.types';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';

export const StudentCalendarPage: React.FC = () => {
  const { user } = useAuthStore();
  const studentId = user?.student_profile?.student_id;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarRecords, setCalendarRecords] = useState<CalendarDayRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CalendarDayRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    attendanceService
      .getCalendarData(monthStr, studentId)
      .then((data) => setCalendarRecords(data.records))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [studentId, monthStr]);

  // Calendar math: calculate days in month and starting day of week
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDayOfWeek = new Date(year, month - 1, 1).getDay();

  // Create record lookup map by 'YYYY-MM-DD'
  const recordMap = useMemo(() => {
    const map = new Map<string, CalendarDayRecord>();
    calendarRecords.forEach((r) => {
      map.set(r.date, r);
    });
    return map;
  }, [calendarRecords]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const monthTitle = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Attendance Calendar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual day-by-day attendance history and check-in timeline
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white min-w-[120px] text-center">
            {monthTitle}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        {isLoading ? (
          <LoadingSpinner label="Loading calendar days..." />
        ) : (
          <div>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Blank offset days */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} className="h-24 rounded-2xl bg-slate-950/20 border border-transparent" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const rec = recordMap.get(dateKey);

                const statusColor =
                  rec?.status === 'PRESENT'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : rec?.status === 'LATE'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : rec?.status === 'ABSENT'
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500';

                return (
                  <div
                    key={dateKey}
                    onClick={() => rec && setSelectedRecord(rec)}
                    className={`h-24 p-2.5 rounded-2xl border flex flex-col justify-between transition-all ${
                      rec ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
                    } ${statusColor}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold">{dayNum}</span>
                      {rec && (
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          {rec.status}
                        </span>
                      )}
                    </div>

                    {rec && rec.check_in && (
                      <div className="text-[10px] font-mono">
                        <span className="text-slate-300 block">{formatTime(rec.check_in)}</span>
                        <span className="text-slate-400">{Math.round(rec.confidence * 100)}% Match</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Date Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Attendance Details: ${formatDate(selectedRecord.date)}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Attendance Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    selectedRecord.status === 'PRESENT'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : selectedRecord.status === 'LATE'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {selectedRecord.status}
                </span>
              </div>

              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Check-in Time:</span>
                <span className="text-white font-semibold">
                  {formatTime(selectedRecord.check_in) || '--'}
                </span>
              </div>

              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Check-out Time:</span>
                <span className="text-white font-semibold">
                  {formatTime(selectedRecord.check_out) || '--'}
                </span>
              </div>

              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Facial Match Confidence:</span>
                <span className="text-cyan-400 font-semibold">
                  {Math.round(selectedRecord.confidence * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Camera / Vision Node:</span>
                <span className="text-slate-200">{selectedRecord.camera || 'Main Gate'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
