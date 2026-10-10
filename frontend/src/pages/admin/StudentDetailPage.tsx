import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Percent,
  Trash2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { studentService } from '../../services/student.service';
import { attendanceService } from '../../services/attendance.service';
import { StudentProfile } from '../../types/student.types';
import { StudentAttendanceHistoryResponse } from '../../types/attendance.types';
import { StatCard } from '../../components/common/StatCard';
import { FaceCaptureModal } from '../../components/students/FaceCaptureModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [history, setHistory] = useState<StudentAttendanceHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const studentData = await studentService.getStudentById(id);
      setStudent(studentData);
      const historyData = await attendanceService.getStudentAttendance(studentData.student_id);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDeleteFace = async () => {
    if (!student) return;
    if (window.confirm('Delete registered facial biometrics for this student?')) {
      try {
        await studentService.deleteFace(student.id);
        loadData();
      } catch {
        alert('Failed to delete face data.');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading student profile & attendance history..." />;
  }

  if (!student) {
    return (
      <div className="p-12 text-center text-slate-400">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Student Not Found</h3>
        <button
          onClick={() => navigate('/admin/students')}
          className="mt-4 px-4 py-2 bg-slate-800 text-xs text-white rounded-xl"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{student.full_name}</h1>
            <p className="text-xs text-slate-400 font-mono">
              {student.student_id} • {student.department_name} ({student.class_name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {student.face_registered ? (
            <button
              onClick={handleDeleteFace}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Face Data</span>
            </button>
          ) : null}

          <button
            onClick={() => setIsCaptureOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{student.face_registered ? 'Re-capture Face' : 'Register Face'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${history?.summary.attendance_percentage ?? 0}%`}
          subtitle="All classes attended"
          icon={Percent}
          color="cyan"
        />
        <StatCard
          title="Present Days"
          value={history?.summary.present_days ?? 0}
          subtitle="On time"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Late Days"
          value={history?.summary.late_days ?? 0}
          subtitle="Past 9:30 AM"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Absent Days"
          value={history?.summary.absent_days ?? 0}
          subtitle="No record"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Biometrics Status"
          value={student.face_registered ? 'Active' : 'Unregistered'}
          subtitle={student.face_registered ? '128-D Embedding Saved' : 'Webcam scan required'}
          icon={FileCheck}
          color={student.face_registered ? 'emerald' : 'amber'}
        />
      </div>

      {/* Attendance History Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-1">Attendance History Log</h3>
        <p className="text-xs text-slate-400 mb-4">
          All historical check-in and check-out logs for {student.full_name}
        </p>

        {history && history.attendances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Check-in</th>
                  <th className="py-2.5 px-3">Check-out</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Camera</th>
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.attendances.map((rec) => (
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
                      {Math.round(rec.recognition_confidence * 100)}%
                    </td>
                    <td className="py-3 px-3 text-slate-400">{rec.camera_name}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {rec.marked_manually ? 'Manual' : 'Automated Face AI'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-8 text-center">No attendance logs found.</p>
        )}
      </div>

      {/* Face Capture Modal */}
      {isCaptureOpen && (
        <FaceCaptureModal
          isOpen={isCaptureOpen}
          onClose={() => setIsCaptureOpen(false)}
          studentId={student.id}
          studentName={student.full_name}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
