import React, { useEffect, useState } from 'react';
import {
  ScanFace,
  Activity,
  CheckCircle,
  AlertTriangle,
  Radio,
  Clock,
  RefreshCw,
  Video,
} from 'lucide-react';
import { LiveCameraHUD } from '../../components/recognition/LiveCameraHUD';
import { RecognitionScanner } from '../../three/scenes/RecognitionScanner';
import { useRecognitionStore } from '../../stores/recognitionStore';
import { attendanceService } from '../../services/attendance.service';
import { cameraService } from '../../services/camera.service';
import { Camera } from '../../types/camera.types';
import { TodayAttendanceSummary } from '../../types/attendance.types';
import { formatTime } from '../../utils/formatters';

export const LiveRecognitionPage: React.FC = () => {
  const {
    activeCameraId,
    setActiveCameraId,
    latestResult,
    latestError,
    recentEvents,
    isStreaming,
    clearEvents,
  } = useRecognitionStore();

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodayAttendanceSummary | null>(null);

  useEffect(() => {
    cameraService.getCameras().then(setCameras).catch(() => {});
    loadTodayAttendance();
    const timer = setInterval(loadTodayAttendance, 6000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayAttendance = () => {
    attendanceService.getTodaySummary().then(setTodaySummary).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Live Biometric Recognition
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated neural face detection, vector matching, and instant attendance logging
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Camera Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Video className="w-4 h-4 text-cyan-400" />
            <select
              value={activeCameraId}
              onChange={(e) => setActiveCameraId(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-slate-900 text-white">Default Webcam</option>
              {cameras.map((c) => (
                <option key={c.id} value={String(c.id)} className="bg-slate-900 text-white">
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={clearEvents}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Clear Event Stream
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Grid: LEFT (Webcam), CENTER (3D Scanner), RIGHT (Events Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Live Webcam Feed with HUD */}
        <div className="lg:col-span-5">
          <LiveCameraHUD cameraId={activeCameraId} />
        </div>

        {/* CENTER: 3D Face Recognition Holographic Scanner */}
        <div className="lg:col-span-4">
          <RecognitionScanner
            latestResult={latestResult}
            latestError={latestError}
            isStreaming={isStreaming}
          />
        </div>

        {/* RIGHT: Live Recognition Event Feed */}
        <div className="lg:col-span-3 glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col h-[380px]">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Live Stream Logs
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {recentEvents.length} events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {recentEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Activity className="w-8 h-8 mb-2 opacity-50 text-cyan-500" />
                <p className="text-xs font-medium">Awaiting facial events...</p>
                <p className="text-[10px] mt-1">Stand in front of camera to begin</p>
              </div>
            ) : (
              recentEvents.map((event) => {
                if (event.eventType === 'result') {
                  const isMarked = event.attendance_marked;
                  return (
                    <div
                      key={event.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        isMarked
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-amber-500/10 border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate max-w-[130px]">
                          {event.student_name}
                        </span>
                        <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                          {Math.round(event.confidence * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className={isMarked ? 'text-emerald-300' : 'text-amber-300'}>
                          {isMarked ? '✓ Attendance Marked' : 'Already Marked Today'}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {formatTime(event.check_in_time)}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={event.id}
                      className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between"
                    >
                      <span className="truncate max-w-[160px]">{event.message}</span>
                      <span className="font-mono text-[9px] text-slate-500 uppercase">
                        {event.code}
                      </span>
                    </div>
                  );
                }
              })
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: Today's Full Verified Attendance Records Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Today's Verified Attendance Feed</h3>
            <p className="text-xs text-slate-400">
              {todaySummary ? `${todaySummary.total_marked} of ${todaySummary.total_students} students marked` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={loadTodayAttendance}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Feed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaySummary && todaySummary.recent_feed.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Check-in Time</th>
                  <th className="py-2.5 px-3">Check-out Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todaySummary.recent_feed.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">{rec.student_id}</td>
                    <td className="py-3 px-3 font-medium text-white">{rec.student_name}</td>
                    <td className="py-3 px-3 text-slate-400">{rec.department_code}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{formatTime(rec.check_in_time)}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{formatTime(rec.check_out_time)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {Math.round(rec.recognition_confidence * 100)}%
                    </td>
                    <td className="py-3 px-3 text-slate-400">{rec.camera_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">No students marked today yet.</p>
        )}
      </div>
    </div>
  );
};
