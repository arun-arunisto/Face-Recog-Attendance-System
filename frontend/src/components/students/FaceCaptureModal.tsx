import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useCamera } from '../../hooks/useCamera';
import { studentService } from '../../services/student.service';

interface FaceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | string;
  studentName: string;
  onSuccess: () => void;
}

export const FaceCaptureModal: React.FC<FaceCaptureModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}) => {
  const { videoRef, startCamera, stopCamera, captureFrame, isActive, error: camError } = useCamera();

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [targetFramesCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [guideStatus, setGuideStatus] = useState<string>('CENTER YOUR FACE');

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedFrames([]);
      setSuccessMessage(null);
      setErrorMessage(null);
      setGuideStatus('CENTER YOUR FACE');
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  // Capture sequence
  const startMultiFrameCapture = async () => {
    setIsCapturing(true);
    setCapturedFrames([]);
    setErrorMessage(null);

    const frames: string[] = [];
    setGuideStatus('HOLD STILL: CAPTURING FACIAL TEMPLATES...');

    for (let i = 0; i < targetFramesCount; i++) {
      await new Promise((res) => setTimeout(res, 500));
      const frame = captureFrame();
      if (frame) {
        frames.push(frame);
        setCapturedFrames([...frames]);
        if (i === 1) setGuideStatus('GOOD QUALITY: PROCESSING...');
        if (i === 3) setGuideStatus('FINALIZING SAMPLES...');
      }
    }

    setIsCapturing(false);

    if (frames.length >= 3) {
      setGuideStatus('FACE DETECTED - 100% READY');
      await submitBiometrics(frames);
    } else {
      setErrorMessage('Could not capture enough valid frames. Please try again.');
    }
  };

  const submitBiometrics = async (frames: string[]) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await studentService.registerFace(studentId, {
        frames,
        profile_photo: frames[0], // First frame as avatar
      });
      setSuccessMessage(result.message || 'Face registration completed successfully.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Face registration failed.';
      setErrorMessage(msg);
      setGuideStatus('REGISTRATION FAILED - RETRY');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Register Face: ${studentName}`} maxWidth="lg">
      <div className="space-y-4">
        {camError ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{camError}</p>
          </div>
        ) : null}

        {/* Video Canvas Container with Face Oval Guide */}
        <div className="relative w-full h-72 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Holographic Face Oval Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Oval Cutout Guide */}
            <div
              className={`w-44 h-60 rounded-[50%] border-2 transition-colors duration-300 ${
                successMessage
                  ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                  : isCapturing
                  ? 'border-cyan-400 animate-pulse shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                  : 'border-cyan-500/50'
              }`}
            />

            {/* Corner Alignment Brackets */}
            <div className="absolute w-52 h-68 pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* Scanner bar when active */}
            {isCapturing && (
              <div className="absolute w-44 h-0.5 bg-cyan-400 animate-scan" />
            )}
          </div>

          {/* Floating Live Guide Feedback */}
          <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-lg ${
                successMessage
                  ? 'bg-emerald-500/90 text-white'
                  : isCapturing
                  ? 'bg-cyan-500/90 text-slate-950'
                  : 'bg-slate-900/80 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {guideStatus}
            </span>
          </div>

          {/* Capture Progress indicator */}
          {capturedFrames.length > 0 && (
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-300 font-mono">
                Samples Captured: {capturedFrames.length} / {targetFramesCount}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: targetFramesCount }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full ${
                      idx < capturedFrames.length ? 'bg-cyan-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCapturing || isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={startMultiFrameCapture}
            disabled={!isActive || isCapturing || isSubmitting || !!successMessage}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition"
          >
            {isCapturing || isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{isSubmitting ? 'Registering...' : 'Scanning Face...'}</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Capture & Register Face</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
