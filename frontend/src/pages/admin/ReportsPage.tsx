import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Layers,
  FileCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { reportService } from '../../services/report.service';
import { authService } from '../../services/auth.service';
import { Department } from '../../types/auth.types';

export const ReportsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Filter Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [studentId, setStudentId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    authService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  const getParams = () => {
    const params: Record<string, any> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (departmentId) params.department = departmentId;
    if (className) params.class_name = className;
    if (section) params.section = section;
    if (studentId) params.student_id = studentId;
    if (statusFilter) params.status = statusFilter;
    return params;
  };

  const handleDownload = async (format: 'csv' | 'xlsx') => {
    setIsGenerating(true);
    setDownloadSuccess(null);
    try {
      if (format === 'csv') {
        await reportService.downloadCSV(getParams());
      } else {
        await reportService.downloadXLSX(getParams());
      }
      setDownloadSuccess(`Successfully exported attendance report as ${format.toUpperCase()}.`);
    } catch (err) {
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Report Generator</h1>
        <p className="text-xs text-slate-400 mt-1">
          Export verified attendance records into structured CSV or formatted Microsoft Excel (XLSX) workbooks
        </p>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Configure Report Parameters</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Specify date ranges and demographic criteria to filter output
        </p>

        {downloadSuccess && (
          <div className="p-3.5 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <FileCheck className="w-4 h-4 flex-shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Department and Class */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Class / Batch
              </label>
              <input
                type="text"
                placeholder="e.g. CS-4A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Section
              </label>
              <input
                type="text"
                placeholder="e.g. A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Student ID and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Specific Student ID
              </label>
              <input
                type="text"
                placeholder="Optional (e.g. STU-2026-001)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Attendance Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="">All Statuses (Present, Late, Absent)</option>
                <option value="PRESENT">Present Only</option>
                <option value="LATE">Late Arrivals Only</option>
                <option value="ABSENT">Absent Only</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleDownload('csv')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Download CSV</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleDownload('xlsx')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Download Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
