import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Terminal,
} from 'lucide-react';
import { auditService } from '../../services/audit.service';
import { AuditLog, AuditActionType } from '../../types/audit.types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditService.getAuditLogs({
        search: search || undefined,
        action: actionFilter || undefined,
        entity_type: entityFilter || undefined,
      });
      setLogs(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter, entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Security Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically recorded timeline of administrative actions, biometrics access, and exports ({totalCount} events)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search action, user, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="STUDENT_CREATE">STUDENT_CREATE</option>
            <option value="FACE_REGISTER">FACE_REGISTER</option>
            <option value="FACE_DELETE">FACE_DELETE</option>
            <option value="ATTENDANCE_MARK">ATTENDANCE_MARK</option>
            <option value="ATTENDANCE_UPDATE">ATTENDANCE_UPDATE</option>
            <option value="REPORT_EXPORT">REPORT_EXPORT</option>
            <option value="CAMERA_CREATE">CAMERA_CREATE</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Entities</option>
            <option value="STUDENT">STUDENT</option>
            <option value="STUDENT_FACE">STUDENT_FACE</option>
            <option value="ATTENDANCE">ATTENDANCE</option>
            <option value="REPORT_CSV">REPORT_CSV</option>
            <option value="CAMERA">CAMERA</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner label="Querying security audit ledger..." />
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-medium">No audit events match filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-white">
                      {log.user_email || 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{log.entity_type}</td>
                    <td className="py-3 px-4 text-slate-400">{log.entity_id || '--'}</td>
                    <td className="py-3 px-4 text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-3 px-4 font-sans text-[11px] text-slate-400 max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
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
