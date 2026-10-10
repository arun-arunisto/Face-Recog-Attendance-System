import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Cpu,
  Shield,
  Box,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { recognitionService, RecognitionPipelineStatus } from '../../services/recognition.service';
import { useUIStore } from '../../stores/uiStore';

export const SettingsPage: React.FC = () => {
  const [pipelineStatus, setPipelineStatus] = useState<RecognitionPipelineStatus | null>(null);
  const [threshold, setThreshold] = useState(0.6);
  const [cooldown, setCooldown] = useState(30);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { is3DEnabled, toggle3D } = useUIStore();

  useEffect(() => {
    recognitionService.getStatus().then((status) => {
      setPipelineStatus(status);
      if (status.match_threshold) {
        setThreshold(status.match_threshold);
      }
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('Settings saved successfully in active memory.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Facial recognition thresholds, 3D graphics rendering, and operational parameters
        </p>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Recognition Engine Status */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Face Recognition Engine Status</h3>
            <p className="text-xs text-slate-400">
              Active recognition provider loaded in Django ASGI backend
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Active Provider:</span>
            <span className="text-cyan-300 font-semibold">
              {pipelineStatus?.provider_name || 'Loading...'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mode:</span>
            {pipelineStatus?.is_development_mode ? (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                DEVELOPMENT MODE (MOCK)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                PRODUCTION (REAL BIOMETRICS)
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Online Vision Nodes:</span>
            <span className="text-white">{pipelineStatus?.cameras_online ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Threshold and Sensitivity Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Biometric Matching Configuration</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Calibrate Euclidean vector distance tolerance and anti-flooding cooldowns
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <label className="text-slate-300">Face Match Distance Threshold</label>
              <span className="text-cyan-400 font-mono font-bold">{threshold}</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="0.8"
              step="0.02"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Lower tolerance values (0.4-0.5) are stricter; standard tolerance is 0.60.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <label className="text-slate-300">Duplicate Cooldown (Seconds)</label>
              <span className="text-cyan-400 font-mono font-bold">{cooldown}s</span>
            </div>
            <input
              type="number"
              min="5"
              max="300"
              value={cooldown}
              onChange={(e) => setCooldown(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum duration before repeated recognitions update check-out.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Update Parameters
            </button>
          </div>
        </form>
      </div>

      {/* Graphics and Rendering */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Three.js 3D Visualizations</h3>
            <p className="text-xs text-slate-400">
              Interactive WebGL 3D Attendance Control Center & Scanner HUD
            </p>
          </div>
        </div>

        <button
          onClick={toggle3D}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
            is3DEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {is3DEnabled ? '3D Enabled' : '2D Fallback Mode'}
        </button>
      </div>
    </div>
  );
};
