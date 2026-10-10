import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleField } from '../components/ParticleField';
import { useThreePerformance } from '../hooks/useThreePerformance';

interface StudentAttendanceRingProps {
  percentage: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
}

const TorusArc: React.FC<{
  percentage: number;
}> = ({ percentage }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = percentage >= 85 ? '#10b981' : percentage >= 75 ? '#f59e0b' : '#ef4444';

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 4, 0, 0]}>
      <torusGeometry args={[1.6, 0.08, 16, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.2}
      />
    </mesh>
  );
};

const SatelliteBadge: React.FC<{
  position: [number, number, number];
  color: string;
  label: string;
  count: number;
}> = ({ position, color, label, count }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      <Html position={[0, -0.3, 0]} center pointerEvents="none">
        <div className="bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded text-[10px] whitespace-nowrap backdrop-blur-md shadow-md">
          <span className="font-semibold text-white">{count}</span>{' '}
          <span className="text-slate-400">{label}</span>
        </div>
      </Html>
    </group>
  );
};

export const StudentAttendanceRing: React.FC<StudentAttendanceRingProps> = ({
  percentage,
  presentDays,
  lateDays,
  absentDays,
}) => {
  const { is3DActive } = useThreePerformance();

  if (!is3DActive) {
    // 2D Accessible card
    return (
      <div className="w-full h-64 rounded-2xl glass-panel p-6 flex flex-col items-center justify-center relative">
        <div className="relative w-36 h-36 rounded-full border-4 border-slate-800 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-4 border-emerald-400"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${percentage}%, 0 ${percentage}%)`,
            }}
          />
          <div className="text-center">
            <span className="text-3xl font-extrabold text-white">{percentage}%</span>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Attendance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-5">
          <span className="text-xs text-emerald-400 font-medium">
            ● {presentDays} Present
          </span>
          <span className="text-xs text-amber-400 font-medium">
            ● {lateDays} Late
          </span>
          <span className="text-xs text-rose-400 font-medium">
            ● {absentDays} Absent
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-72 rounded-2xl glass-panel relative overflow-hidden border border-slate-800">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />

        {/* 3D Ring */}
        <TorusArc percentage={percentage} />

        {/* Center Percentage Display */}
        <Html position={[0, 0, 0]} center pointerEvents="none">
          <div className="flex flex-col items-center justify-center select-none text-center">
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
              {percentage}%
            </span>
            <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
              Attendance
            </span>
          </div>
        </Html>

        {/* Satellite Badges */}
        <SatelliteBadge
          position={[-2.0, 0.8, 0]}
          color="#10b981"
          label="Present"
          count={presentDays}
        />
        <SatelliteBadge
          position={[2.0, 0.8, 0]}
          color="#f59e0b"
          label="Late"
          count={lateDays}
        />
        <SatelliteBadge
          position={[0, -1.8, 0]}
          color="#ef4444"
          label="Absent"
          count={absentDays}
        />

        {/* Gentle Ambient Particles */}
        <ParticleField count={80} color="#10b981" radius={4} size={0.03} />
      </Canvas>
    </div>
  );
};
