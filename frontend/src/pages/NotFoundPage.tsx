import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-white">404 - Page Not Found</h1>
      <p className="text-xs text-slate-400 mt-2 max-w-sm">
        The requested resource does not exist or you do not have permission to view it.
      </p>
      <button
        onClick={() => navigate('/login')}
        className="mt-6 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Login / Home</span>
      </button>
    </div>
  );
};
