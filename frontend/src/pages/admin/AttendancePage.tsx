import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';
import { authService } from '../../services/auth.service';
import { cameraService } from '../../services/camera.service';
import { reportService } from '../../services/report.service';
import { AttendanceRecord, AttendanceStatusType } from '../../types/attendance.types';
import { Department } from '../../types/auth.types';
import { Camera } from '../../types/camera.types';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusType | undefined>();
  const [cameraFilter, setCameraFilter] = useState<number | undefined>();

  // Manual Mark Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStatus, setManualStatus] = useState<AttendanceStatusType>('PRESENT');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await attendanceService.getAttendanceList({
        search: search || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        department: departmentFilter,
        status: statusFilter,
        camera: cameraFilter,
      });
      setRecords(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    authService.getDepartments().then(setDepartments).catch(() => {});
    cameraService.getCameras().then(setCameras).catch(() => {});
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [search, startDate, endDate, departmentFilter, statusFilter, cameraFilter]);

  const handleExportCSV = async () => {
    await reportService.downloadCSV({
      search: search || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      department: departmentFilter,
      status: statusFilter,
    });
  };

  const handleExportXLSX = async () => {
    await reportService.downloadXLSX({
      search: search || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      department: departmentFilter,
      status: statusFilter,
    });
  };

  const handleManualMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    try {
      await attendanceService.markManual({
        student_id: manualStudentId,
        date: manualDate,
        status: manualStatus,
        notes: manualNotes,
      });
      setIsManualModalOpen(false);
      setManualStudentId('');
      setManualNotes('');
      fetchRecords();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark attendance manually.');
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Attendance Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete database of biometric logs, manual corrections, and timestamps ({totalCount} records)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportXLSX}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (XLSX)</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mark Manually</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Student ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter || ''}
              onChange={(e) => setDepartmentFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter((e.target.value as AttendanceStatusType) || undefined)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner label="Loading attendance logs..." />
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-medium">No attendance logs found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-in</th>
                  <th className="py-3 px-4">Check-out</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {rec.student_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{rec.student_name}</td>
                    <td className="py-3 px-4 text-slate-400">{rec.department_code}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{formatDate(rec.date)}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatTime(rec.check_in_time)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {formatTime(rec.check_out_time)}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {Math.round(rec.recognition_confidence * 100)}%
                    </td>
                    <td className="py-3 px-4 text-slate-400">{rec.camera_name}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {rec.marked_manually ? 'Manual Override' : 'Biometric Face AI'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Mark Modal */}
      {isManualModalOpen && (
        <Modal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          title="Manual Attendance Entry"
        >
          <form onSubmit={handleManualMarkSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                placeholder="STU-2026-001"
                value={manualStudentId}
                onChange={(e) => setManualStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status *</label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as AttendanceStatusType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
              >
                <option value="PRESENT">PRESENT</option>
                <option value="LATE">LATE</option>
                <option value="ABSENT">ABSENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Reason for manual adjustment..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={manualSubmitting}
                className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs"
              >
                {manualSubmitting ? 'Saving...' : 'Submit Entry'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
