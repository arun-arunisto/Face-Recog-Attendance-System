import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera as CameraIcon,
  PlusCircle,
  Video,
  Radio,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  Settings2,
} from 'lucide-react';
import { cameraService } from '../../services/camera.service';
import { Camera, CameraStatusType, CameraTypeEnum } from '../../types/camera.types';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CamerasPage: React.FC = () => {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add camera modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [cameraType, setCameraType] = useState<CameraTypeEnum>('WEBCAM');
  const [status, setStatus] = useState<CameraStatusType>('ONLINE');
  const [streamId, setStreamId] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const data = await cameraService.getCameras();
      setCameras(data);
    } catch (err) {
      console.error('Failed to load cameras:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await cameraService.createCamera({
        name,
        location,
        camera_type: cameraType,
        status,
        stream_identifier: streamId,
      });
      setIsModalOpen(false);
      setName('');
      setLocation('');
      fetchCameras();
    } catch (err) {
      alert('Failed to register camera.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, camName: string) => {
    if (window.confirm(`Delete camera "${camName}"?`)) {
      try {
        await cameraService.deleteCamera(id);
        fetchCameras();
      } catch {
        alert('Failed to delete camera.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Camera Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Vision nodes, browser webcams, and RTSP stream endpoints ({cameras.length} registered)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Vision Node</span>
        </button>
      </div>

      {/* Camera Cards Grid */}
      {isLoading ? (
        <LoadingSpinner label="Loading camera nodes..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((cam) => {
            const isOnline = cam.status === 'ONLINE';
            return (
              <div
                key={cam.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOnline
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : cam.status === 'ERROR'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        {cam.status}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2">{cam.name}</h3>
                      <p className="text-xs text-slate-400">{cam.location}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                      <Video className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800/80">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                        Today's Passes
                      </span>
                      <span className="text-lg font-bold text-white font-mono">
                        {cam.today_attendance_count}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                        Protocol Type
                      </span>
                      <span className="text-xs font-semibold text-cyan-300">
                        {cam.camera_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => navigate('/admin/live-recognition')}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Open Live Stream</span>
                  </button>

                  <button
                    onClick={() => handleDelete(cam.id, cam.name)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                    title="Delete camera"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Camera Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Vision Node"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Camera Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science Block Lobby"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Gate 2 South Entrance"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={cameraType}
                  onChange={(e) => setCameraType(e.target.value as CameraTypeEnum)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="WEBCAM">Browser Webcam</option>
                  <option value="IP_CAMERA">IP Camera</option>
                  <option value="RTSP">RTSP Stream</option>
                  <option value="USB">USB External</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CameraStatusType)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stream Identifier / URL
              </label>
              <input
                type="text"
                placeholder="default / cam_gate2"
                value={streamId}
                onChange={(e) => setStreamId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs"
              >
                {isSubmitting ? 'Registering...' : 'Register Camera'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
