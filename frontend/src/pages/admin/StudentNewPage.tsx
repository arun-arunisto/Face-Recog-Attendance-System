import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { studentService } from '../../services/student.service';
import { authService } from '../../services/auth.service';
import { Department } from '../../types/auth.types';
import { FaceCaptureModal } from '../../components/students/FaceCaptureModal';

export const StudentNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Student@123456');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [className, setClassName] = useState('CS-4A');
  const [section, setSection] = useState('A');

  // Trigger Face Capture Modal for created student
  const [createdStudent, setCreatedStudent] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    authService.getDepartments().then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) setDepartmentId(depts[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId) {
      setError('Please select a department.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const student = await studentService.createStudent({
        student_id: studentId,
        full_name: fullName,
        email,
        password,
        department_id: Number(departmentId),
        class_name: className,
        section,
      });

      // Automatically open Face Capture Modal for this newly created student!
      setCreatedStudent({ id: student.id, name: student.full_name });
    } catch (err: any) {
      const msg =
        err.response?.data?.student_id?.[0] ||
        err.response?.data?.email?.[0] ||
        err.message ||
        'Failed to create student account.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/students')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Register Student</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create user profile and configure biometric facial data
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student ID *
              </label>
              <input
                type="text"
                required
                placeholder="STU-2026-099"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="First Last"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
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
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="CS-4A"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Section
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="A"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isLoading ? 'Creating Student...' : 'Create & Capture Face'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Face Capture Modal triggered right after creation */}
      {createdStudent && (
        <FaceCaptureModal
          isOpen={!!createdStudent}
          onClose={() => {
            setCreatedStudent(null);
            navigate('/admin/students');
          }}
          studentId={createdStudent.id}
          studentName={createdStudent.name}
          onSuccess={() => {
            navigate('/admin/students');
          }}
        />
      )}
    </div>
  );
};
