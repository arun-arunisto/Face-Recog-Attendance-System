import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { ParticleField } from '../components/ParticleField';
import { useThreePerformance } from '../hooks/useThreePerformance';
import { Sparkles, Eye, Camera as CameraIcon, CheckCircle } from 'lucide-react';

interface StudentNodeData {
  id: number;
  student_id: string;
  name: string;
  dept: string;
  percentage: number;
  todayStatus: string;
}

interface AttendanceControlCenterProps {
  attendancePct?: number;
  students?: StudentNodeData[];
  onlineCamerasCount?: number;
}

// Sub-component: Center Attendance Sphere
const CentralAttendanceCore: React.FC<{ percentage: number }> = ({ percentage }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const glowColor = useMemo(() => {
    if (percentage >= 85) return '#10b981'; // Emerald
    if (percentage >= 70) return '#f59e0b'; // Amber
    return '#06b6d4'; // Cyan
  }, [percentage]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
      ringRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group>
      {/* Central Pulsing Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.7}
          wireframe={false}
        />
      </mesh>

      {/* Orbiting Tech Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.7, 0.03, 16, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>

      {/* Center Label */}
      <Html position={[0, 0, 0]} center pointerEvents="none">
        <div className="flex flex-col items-center justify-center select-none text-center">
          <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {percentage}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-cyan-200 tracking-wider">
            Overall Rate
          </span>
        </div>
      </Html>
    </group>
  );
};

// Sub-component: Floating Student Node
const StudentNode: React.FC<{
  data: StudentNodeData;
  position: [number, number, number];
  onClick: (id: number) => void;
}> = ({ data, position, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const color = data.todayStatus === 'PRESENT' ? '#10b981' : data.todayStatus === 'LATE' ? '#f59e0b' : '#ef4444';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2 + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(data.id)}
      >
        <sphereGeometry args={[hovered ? 0.35 : 0.25, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.9 : 0.4}
          roughness={0.2}
        />
      </mesh>

      {hovered && (
        <Html position={[0, 0.45, 0]} center pointerEvents="none">
          <div className="bg-slate-900/95 border border-cyan-500/40 px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap backdrop-blur-md">
            <p className="font-semibold text-white">{data.name}</p>
            <p className="text-slate-400 text-[11px]">{data.student_id} • {data.dept}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-cyan-400 font-medium">{data.percentage}% attendance</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                data.todayStatus === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300' :
                data.todayStatus === 'LATE' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {data.todayStatus}
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80 mt-1 italic">Click to view profile</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Sub-component: Camera Node Satellite
const CameraNode: React.FC<{
  name: string;
  position: [number, number, number];
  onClick: () => void;
}> = ({ name, position, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <octahedronGeometry args={[hovered ? 0.4 : 0.3]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.8}
          wireframe={!hovered}
        />
      </mesh>

      {hovered && (
        <Html position={[0, 0.5, 0]} center pointerEvents="none">
          <div className="bg-slate-900/95 border border-sky-500/40 px-3 py-1.5 rounded-lg shadow-xl text-xs whitespace-nowrap backdrop-blur-md">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {name}
            </p>
            <p className="text-[10px] text-sky-300/80 mt-0.5">Click for Live Recognition</p>
          </div>
        </Html>
      )}
    </group>
  );
};

export const AttendanceControlCenter: React.FC<AttendanceControlCenterProps> = ({
  attendancePct = 88.5,
  students = [],
  onlineCamerasCount = 2,
}) => {
  const navigate = useNavigate();
  const { is3DActive } = useThreePerformance();

  // Fallback student nodes if none supplied
  const displayStudents: StudentNodeData[] = useMemo(() => {
    if (students.length > 0) return students.slice(0, 10);
    return [
      { id: 1, student_id: 'STU-2026-001', name: 'Arun Kumar', dept: 'CSE', percentage: 94.2, todayStatus: 'PRESENT' },
      { id: 2, student_id: 'STU-2026-002', name: 'Priya Sharma', dept: 'CSE', percentage: 91.0, todayStatus: 'PRESENT' },
      { id: 3, student_id: 'STU-2026-003', name: 'Rahul Verma', dept: 'IT', percentage: 84.5, todayStatus: 'LATE' },
      { id: 4, student_id: 'STU-2026-004', name: 'Sneha Patel', dept: 'ECE', percentage: 96.0, todayStatus: 'PRESENT' },
      { id: 5, student_id: 'STU-2026-005', name: 'Vikram Singh', dept: 'ME', percentage: 78.2, todayStatus: 'ABSENT' },
      { id: 6, student_id: 'STU-2026-006', name: 'Ananya Roy', dept: 'CSE', percentage: 89.4, todayStatus: 'PRESENT' },
    ];
  }, [students]);

  // Calculate orbital positions for student nodes
  const studentNodesWithPositions = useMemo(() => {
    const radius = 3.2;
    return displayStudents.map((s, idx) => {
      const angle = (idx / displayStudents.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(idx * 1.5) * 0.8;
      return { data: s, position: [x, y, z] as [number, number, number] };
    });
  }, [displayStudents]);

  if (!is3DActive) {
    // 2D Accessible Fallback
    return (
      <div className="w-full h-80 rounded-2xl glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Attendance Control Center (2D Mode)
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Campus Attendance Overview</h3>
          </div>
          <button
            onClick={() => navigate('/admin/live-recognition')}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <CameraIcon className="w-3.5 h-3.5" />
            Live Recognition
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-auto">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Today Rate</p>
            <p className="text-2xl font-bold text-emerald-400">{attendancePct}%</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Tracked Students</p>
            <p className="text-2xl font-bold text-white">{displayStudents.length}</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Cameras Online</p>
            <p className="text-2xl font-bold text-sky-400">{onlineCamerasCount}</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Status</p>
            <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Operational
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          {displayStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/admin/students/${s.id}`)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {s.name} ({s.percentage}%)
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-2xl glass-panel relative overflow-hidden group border border-slate-800">
      {/* HUD Header overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            3D Attendance Control Center
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Drag to rotate • Hover nodes for metrics • Click to open</p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => navigate('/admin/live-recognition')}
          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md"
        >
          <CameraIcon className="w-3.5 h-3.5" />
          Open Live Recognition
        </button>
      </div>

      <Canvas
        camera={{ position: [0, 2.5, 6], fov: 50 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -5, -5]} color="#0284c7" intensity={0.8} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* Central Sphere */}
          <CentralAttendanceCore percentage={attendancePct} />

          {/* Student Orbital Nodes */}
          {studentNodesWithPositions.map(({ data, position }) => (
            <StudentNode
              key={data.id}
              data={data}
              position={position}
              onClick={(id) => navigate(`/admin/students/${id}`)}
            />
          ))}

          {/* Camera Node Satellites */}
          <CameraNode
            name="Main Gate Cam"
            position={[3.8, 1.2, -1.5]}
            onClick={() => navigate('/admin/live-recognition')}
          />
          <CameraNode
            name="CS Lab Cam"
            position={[-3.8, -0.8, 1.2]}
            onClick={() => navigate('/admin/live-recognition')}
          />
        </Float>

        {/* Ambient Data Particles */}
        <ParticleField count={200} color="#0284c7" radius={7} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
};
