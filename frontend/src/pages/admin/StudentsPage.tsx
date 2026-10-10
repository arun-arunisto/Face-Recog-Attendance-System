import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Filter,
  Camera,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { studentService } from '../../services/student.service';
import { authService } from '../../services/auth.service';
import { StudentProfile } from '../../types/student.types';
import { Department } from '../../types/auth.types';
import { FaceCaptureModal } from '../../components/students/FaceCaptureModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>();
  const [faceRegisteredFilter, setFaceRegisteredFilter] = useState<boolean | undefined>();

  // Face capture modal state
  const [captureModalStudent, setCaptureModalStudent] = useState<{ id: number; name: string } | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getStudents({
        search: search || undefined,
        department: departmentFilter,
        face_registered: faceRegisteredFilter,
      });
      setStudents(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    authService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, departmentFilter, faceRegisteredFilter]);

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"? This cannot be undone.`)) {
      try {
        await studentService.deleteStudent(id);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Student Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered students, facial biometric profiles, and attendance tracking ({totalCount} total)
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/students/new')}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={departmentFilter || ''}
            onChange={(e) => setDepartmentFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          {/* Biometrics Filter */}
          <select
            value={faceRegisteredFilter === undefined ? '' : String(faceRegisteredFilter)}
            onChange={(e) =>
              setFaceRegisteredFilter(
                e.target.value === '' ? undefined : e.target.value === 'true'
              )
            }
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Face Status</option>
            <option value="true">Face Registered</option>
            <option value="false">Pending Registration</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner label="Loading student directory..." />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-medium">No students match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Department & Class</th>
                  <th className="py-3 px-4">Face Biometrics</th>
                  <th className="py-3 px-4">Overall %</th>
                  <th className="py-3 px-4">Today</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 overflow-hidden flex-shrink-0">
                          {student.profile_photo ? (
                            <img
                              src={student.profile_photo}
                              alt={student.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            student.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{student.full_name}</p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-cyan-400">
                      {student.student_id}
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-200 font-medium">{student.department_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {student.class_name} • Sec {student.section}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      {student.face_registered ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Registered
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setCaptureModalStudent({ id: student.id, name: student.full_name })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition"
                        >
                          <Camera className="w-3 h-3" />
                          Capture Face
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {student.attendance_percentage}%
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.today_status.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : student.today_status.status === 'LATE'
                            ? 'bg-amber-500/20 text-amber-300'
                            : student.today_status.status === 'ABSENT'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {student.today_status.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            setCaptureModalStudent({ id: student.id, name: student.full_name })
                          }
                          className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 transition"
                          title="Re-capture Face"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(student.id, student.full_name)}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Face Capture Modal */}
      {captureModalStudent && (
        <FaceCaptureModal
          isOpen={!!captureModalStudent}
          onClose={() => setCaptureModalStudent(null)}
          studentId={captureModalStudent.id}
          studentName={captureModalStudent.name}
          onSuccess={fetchStudents}
        />
      )}
    </div>
  );
};
