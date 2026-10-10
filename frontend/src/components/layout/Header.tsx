import React, { useState, useEffect } from 'react';
import { Menu, Box, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useRecognitionStore } from '../../stores/recognitionStore';
import { recognitionService } from '../../services/recognition.service';

export const Header: React.FC = () => {
  const { toggleSidebar, is3DEnabled, toggle3D } = useUIStore();
  const { isDevMode, setDevMode } = useRecognitionStore();
  const [timeStr, setTimeStr] = useState('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll or check provider dev mode status
  useEffect(() => {
    recognitionService
      .getStatus()
      .then((status) => {
        setDevMode(status.is_development_mode, status.provider_name);
      })
      .catch(() => {});
  }, [setDevMode]);

  return (
    <header className="h-16 px-4 lg:px-8 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live system clock */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Development Mode Badge */}
        {isDevMode && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-pulse shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DEVELOPMENT MODE</span>
          </div>
        )}

        {/* 3D Visuals Toggle */}
        <button
          onClick={toggle3D}
          title={is3DEnabled ? 'Switch to 2D Mode (Low Power)' : 'Switch to 3D Experience'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            is3DEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{is3DEnabled ? '3D Active' : '2D Mode'}</span>
        </button>
      </div>
    </header>
  );
};
