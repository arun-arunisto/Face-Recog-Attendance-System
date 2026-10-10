import React from 'react';
import { UserCheck, ShieldCheck, Mail, BookOpen, Layers, CheckCircle2, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const profile = user?.student_profile;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Student Identity Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Personal institutional details and biometric verification template status
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-cyan-500/40 flex items-center justify-center font-bold text-3xl text-cyan-400 overflow-hidden shadow-xl">
            {profile?.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={user?.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.full_name?.charAt(0).toUpperCase() || 'S'
            )}
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                STUDENT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{profile?.student_id}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
            <p className="text-sm font-semibold text-white mt-1">{user?.department || 'Engineering'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Class Batch</span>
            <p className="text-sm font-semibold text-white mt-1">{profile?.class_name || 'CS-4A'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Section</span>
            <p className="text-sm font-semibold text-white mt-1">{profile?.section || 'A'}</p>
          </div>
        </div>

        {/* Biometrics Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Biometric Facial Signature</h4>
              <p className="text-[11px] text-slate-400">
                128-dimensional mathematical facial vector stored in secure attendance registry
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified & Registered
          </span>
        </div>

        {/* Security / Immutability Note */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
          <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Security Notice:</strong> Student accounts have read-only access to their personal records. Attendance entries cannot be modified or forged, and are cryptographically verified by camera vision nodes.
          </p>
        </div>
      </div>
    </div>
  );
};
