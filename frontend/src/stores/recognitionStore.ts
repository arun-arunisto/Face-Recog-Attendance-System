import { create } from 'zustand';
import {
  RecognitionState,
  RecognitionResult,
  RecognitionError,
} from '../types/recognition.types';

export type RecognitionEventItem =
  | (RecognitionResult & { id: string; eventType: 'result' })
  | (RecognitionError & { id: string; eventType: 'error'; timestamp: string });

interface RecognitionStoreState {
  activeCameraId: string;
  connectionState: RecognitionState;
  isStreaming: boolean;
  latestResult: RecognitionResult | null;
  latestError: RecognitionError | null;
  recentEvents: RecognitionEventItem[];
  isDevMode: boolean;
  providerName: string;
  latencyMs: number;
  fps: number;
  setActiveCameraId: (id: string) => void;
  setConnectionState: (state: RecognitionState) => void;
  setIsStreaming: (streaming: boolean) => void;
  setDevMode: (dev: boolean, provider?: string) => void;
  handleRecognitionResult: (res: RecognitionResult) => void;
  handleRecognitionError: (err: RecognitionError) => void;
  setFps: (fps: number) => void;
  clearEvents: () => void;
}

export const useRecognitionStore = create<RecognitionStoreState>((set) => ({
  activeCameraId: 'default',
  connectionState: 'CAMERA_CONNECTING',
  isStreaming: false,
  latestResult: null,
  latestError: null,
  recentEvents: [],
  isDevMode: false,
  providerName: '',
  latencyMs: 0,
  fps: 0,

  setActiveCameraId: (id) => set({ activeCameraId: id }),
  setConnectionState: (state) => set({ connectionState: state }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setDevMode: (dev, provider = '') => set({ isDevMode: dev, providerName: provider }),

  handleRecognitionResult: (res) => {
    const eventItem: RecognitionEventItem = {
      ...res,
      id: `${Date.now()}_${Math.random()}`,
      eventType: 'result',
    };
    set((prev) => ({
      latestResult: res,
      latestError: null,
      latencyMs: res.latency_ms || prev.latencyMs,
      recentEvents: [eventItem, ...prev.recentEvents.slice(0, 24)],
    }));
  },

  handleRecognitionError: (err) => {
    const eventItem: RecognitionEventItem = {
      ...err,
      id: `${Date.now()}_${Math.random()}`,
      eventType: 'error',
      timestamp: new Date().toISOString(),
    };
    set((prev) => ({
      latestError: err,
      latencyMs: err.latency_ms || prev.latencyMs,
      recentEvents: [eventItem, ...prev.recentEvents.slice(0, 24)],
    }));
  },

  setFps: (fps) => set({ fps }),
  clearEvents: () => set({ recentEvents: [], latestResult: null, latestError: null }),
}));
