import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useThreePerformance } from '../hooks/useThreePerformance';
import { RecognitionResult, RecognitionError } from '../../types/recognition.types';

interface RecognitionScannerProps {
  latestResult: RecognitionResult | null;
  latestError: RecognitionError | null;
  isStreaming: boolean;
}

const ScannerRing: React.FC<{
  color: string;
  speed?: number;
  radius?: number;
}> = ({ color, speed = 1, radius = 1.6 }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * speed;
    }
  });

  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[radius - 0.05, radius, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
};

const LaserSweep: React.FC<{ color: string }> = ({ color }) => {
  const lineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lineRef.current) {
      // Sweeps up and down
      lineRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2.5) * 1.2;
    }
  });

  return (
    <mesh ref={lineRef}>
      <planeGeometry args={[3.2, 0.04]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
};

const CyberGrid: React.FC<{ color: string }> = ({ color }) => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[4, 12, color, '#0f172a']}
      position={[0, -1.8, 0]}
    />
  );
};

export const RecognitionScanner: React.FC<RecognitionScannerProps> = ({
  latestResult,
  latestError,
  isStreaming,
}) => {
  const { is3DActive } = useThreePerformance();

  // Dynamic state color
  const statusColor = useMemo(() => {
    if (!isStreaming) return '#64748b'; // Slate
    if (latestResult) {
      if (latestResult.attendance_marked) return '#10b981'; // Emerald
      if (latestResult.already_marked) return '#f59e0b'; // Amber
      return '#06b6d4'; // Cyan
    }
    if (latestError) {
      if (latestError.code === 'MULTIPLE_FACES' || latestError.code === 'UNKNOWN_FACE') {
        return '#ef4444'; // Red
      }
      return '#f97316'; // Orange
    }
    return '#06b6d4'; // Cyan default
  }, [isStreaming, latestResult, latestError]);

  if (!is3DActive) {
    // 2D Fallback scanning visualization
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center relative overflow-hidden rounded-2xl glass-panel p-6">
        <div className="relative flex items-center justify-center w-52 h-52">
          {/* Outer ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin ${
              latestResult?.attendance_marked ? 'border-emerald-500' : 'border-cyan-500/60'
            }`}
            style={{ animationDuration: '10s' }}
          />
          {/* Inner ring */}
          <div
            className={`w-36 h-36 rounded-full border-2 flex items-center justify-center ${
              latestResult?.attendance_marked
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-cyan-400/50 bg-cyan-500/5'
            }`}
          >
            {latestResult ? (
              <div className="text-center px-2">
                <span className="text-xs font-bold text-emerald-400 block truncate max-w-[120px]">
                  {latestResult.student_name}
                </span>
                <span className="text-[11px] text-cyan-300">
                  {Math.round(latestResult.confidence * 100)}% Match
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {isStreaming ? 'Scanning...' : 'Idle'}
              </span>
            )}
          </div>
          {/* Scan line */}
          {isStreaming && (
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] rounded-2xl glass-panel relative overflow-hidden border border-slate-800">
      {/* HUD readout overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Neural Scan Matrix
          </span>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 5]} intensity={1.5} color={statusColor} />

        {/* Outer Scanner Ring */}
        <ScannerRing color={statusColor} speed={0.8} radius={1.8} />

        {/* Inner Counter-Rotating Ring */}
        <ScannerRing color="#38bdf8" speed={-0.6} radius={1.4} />

        {/* Laser Sweep */}
        {isStreaming && <LaserSweep color={statusColor} />}

        {/* Cyber floor grid */}
        <CyberGrid color={statusColor} />

        {/* 3D Holographic Status Readout */}
        <Html position={[0, 0, 0]} center pointerEvents="none">
          <div className="flex flex-col items-center justify-center text-center select-none whitespace-nowrap">
            {latestResult ? (
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-emerald-500/40 backdrop-blur-md shadow-2xl">
                <p className="text-sm font-bold text-white tracking-wide">
                  {latestResult.student_name}
                </p>
                <p className="text-xs text-emerald-400 font-mono font-semibold">
                  {Math.round(latestResult.confidence * 100)}% MATCH
                </p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                  {latestResult.message}
                </span>
              </div>
            ) : latestError ? (
              <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-rose-500/40 backdrop-blur-md shadow-2xl">
                <p className="text-xs font-bold text-rose-400 tracking-wide uppercase">
                  {latestError.code}
                </p>
                <p className="text-[11px] text-slate-300 max-w-[180px] truncate">
                  {latestError.message}
                </p>
              </div>
            ) : (
              <div className="text-cyan-400/80 font-mono text-xs uppercase tracking-widest animate-pulse">
                {isStreaming ? 'Scanning Target...' : 'System Standby'}
              </div>
            )}
          </div>
        </Html>
      </Canvas>
    </div>
  );
};
