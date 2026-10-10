import React, { useEffect, useRef } from 'react';
import { Camera as CameraIcon, Activity, Zap, CheckCircle, AlertTriangle, UserX } from 'lucide-react';
import { useRecognitionStore } from '../../stores/recognitionStore';
import { useCamera } from '../../hooks/useCamera';
import { useWebSocketRecognition } from '../../hooks/useWebSocketRecognition';

interface LiveCameraHUDProps {
  cameraId?: string;
}

export const LiveCameraHUD: React.FC<LiveCameraHUDProps> = ({ cameraId = 'default' }) => {
  const { videoRef, isActive, error: camError, startCamera, stopCamera, captureFrame } = useCamera();

  const {
    connectionState,
    isStreaming,
    latestResult,
    latestError,
    latencyMs,
    fps,
    isDevMode,
    setIsStreaming,
  } = useRecognitionStore();

  // Connect WebSocket and setup streaming interval
  useWebSocketRecognition({
    cameraId,
    captureFrame,
    intervalMs: 800,
  });

  // Start webcam on mount
  useEffect(() => {
    startCamera();
    setIsStreaming(true);
    return () => {
      stopCamera();
      setIsStreaming(false);
    };
  }, [startCamera, stopCamera, setIsStreaming]);

  // Compute status badge styling
  const statusConfig = (() => {
    if (latestResult) {
      if (latestResult.attendance_marked) {
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          title: 'ATTENDANCE MARKED',
          icon: CheckCircle,
        };
      }
      if (latestResult.already_marked) {
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          title: 'ALREADY MARKED TODAY',
          icon: Activity,
        };
      }
      return {
        bg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
        dot: 'bg-cyan-400',
        title: 'RECOGNIZED',
        icon: CheckCircle,
      };
    }
    if (latestError) {
      if (latestError.code === 'UNKNOWN_FACE') {
        return {
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400',
          title: 'UNKNOWN FACE',
          icon: UserX,
        };
      }
      if (latestError.code === 'MULTIPLE_FACES') {
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          title: 'MULTIPLE FACES DETECTED',
          icon: AlertTriangle,
        };
      }
      return {
        bg: 'bg-slate-800 border-slate-700 text-slate-300',
        dot: 'bg-slate-400',
        title: latestError.code || 'SCANNING',
        icon: Activity,
      };
    }
    return {
      bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      dot: 'bg-cyan-400',
      title: isStreaming ? 'SCANNING FACES...' : 'IDLE',
      icon: Activity,
    };
  })();

  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative w-full h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Camera Error Message */}
      {camError && (
        <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center">
          <CameraIcon className="w-12 h-12 text-rose-400 mb-3" />
          <h4 className="text-base font-bold text-white">Camera Access Denied or Disconnected</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">{camError}</p>
          <button
            onClick={startCamera}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950"
          >
            Retry Camera
          </button>
        </div>
      )}

      {/* HUD Holographic Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dynamic Bounding Box */}
        {latestResult?.bounding_boxes && latestResult.bounding_boxes.length > 0 && (
          <div
            className={`absolute border-2 transition-all duration-200 rounded-lg shadow-lg ${
              latestResult.attendance_marked
                ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                : latestResult.already_marked
                ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
            }`}
            style={{
              top: '20%',
              left: '25%',
              width: '50%',
              height: '58%',
            }}
          >
            {/* Box Header Label */}
            <div className="absolute -top-7 left-0 bg-slate-900/90 border border-current px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md">
              <span>{latestResult.student_name}</span>
              <span className="opacity-80">({Math.round(latestResult.confidence * 100)}%)</span>
            </div>
          </div>
        )}

        {/* Scan line effect when streaming */}
        {isStreaming && (
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan opacity-70" />
        )}
      </div>

      {/* Top HUD Bar */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-md ${statusConfig.bg}`}>
            <span className={`w-2 h-2 rounded-full animate-ping ${statusConfig.dot}`} />
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.title}</span>
          </div>

          {isDevMode && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              DEV MODE
            </span>
          )}
        </div>

        {/* Technical telemetry metrics */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800 backdrop-blur-md">
          <span>FPS: <strong className="text-cyan-400">{fps}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Latency: <strong className="text-emerald-400">{latencyMs}ms</strong></span>
        </div>
      </div>

      {/* Bottom HUD Bar: Recognized Banner or Error details */}
      <div className="relative z-10 p-4">
        {latestResult ? (
          <div className="p-3.5 rounded-xl bg-slate-950/85 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between shadow-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">{latestResult.student_name}</h4>
                <span className="text-xs text-slate-400 font-mono">({latestResult.student_id})</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                {latestResult.message} • {latestResult.department}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-300 block">
                {Math.round(latestResult.confidence * 100)}% Match
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {latestResult.check_in_time || 'Just now'}
              </span>
            </div>
          </div>
        ) : latestError ? (
          <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
            <span>{latestError.message}</span>
            {latestError.confidence !== undefined && (
              <span className="font-mono text-amber-400">
                Confidence: {Math.round(latestError.confidence * 100)}%
              </span>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md text-xs text-slate-400 flex items-center justify-between">
            <span>Stand directly facing camera for instant recognition</span>
            <span className="text-[10px] font-mono text-cyan-400">STATUS: READY</span>
          </div>
        )}
      </div>
    </div>
  );
};
