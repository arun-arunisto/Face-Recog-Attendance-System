import { useEffect, useRef, useCallback } from 'react';
import { useRecognitionStore } from '../stores/recognitionStore';
import { WebSocketMessage } from '../types/recognition.types';

interface UseWebSocketRecognitionProps {
  cameraId: string;
  captureFrame: () => string | null;
  intervalMs?: number;
}

export function useWebSocketRecognition({
  cameraId,
  captureFrame,
  intervalMs = 800,
}: UseWebSocketRecognitionProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const streamIntervalRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef<number | null>(null);
  const captureFrameRef = useRef(captureFrame);
  captureFrameRef.current = captureFrame;

  const {
    isStreaming,
    setConnectionState,
    setDevMode,
    handleRecognitionResult,
    handleRecognitionError,
    setFps,
  } = useRecognitionStore();

  const connect = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setConnectionState('CAMERA_CONNECTING');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // When using Vite dev proxy or local backend, connect to 127.0.0.1:8000
    const host = window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/recognition/${cameraId}/`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('CAMERA_CONNECTED');
    };

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data);

        if (msg.type === 'connection_status') {
          setConnectionState(msg.state);
          setDevMode(msg.is_development_mode, msg.provider);
        } else if (msg.type === 'recognition_result') {
          handleRecognitionResult(msg);
          if (msg.is_development_mode !== undefined) {
            setDevMode(msg.is_development_mode);
          }
        } else if (msg.type === 'recognition_error') {
          handleRecognitionError(msg);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onerror = () => {
      setConnectionState('CAMERA_ERROR');
    };

    ws.onclose = () => {
      setConnectionState('CAMERA_ERROR');
    };
  }, [cameraId, setConnectionState, setDevMode, handleRecognitionResult, handleRecognitionError]);

  const disconnect = useCallback(() => {
    if (streamIntervalRef.current) {
      window.clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    if (fpsTimerRef.current) {
      window.clearInterval(fpsTimerRef.current);
      fpsTimerRef.current = null;
    }
    if (wsRef.current) {
      const socket = wsRef.current;
      wsRef.current = null;
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      } else if (socket.readyState === WebSocket.CONNECTING) {
        // Defer close until open to prevent "closed before connection established" error
        socket.onopen = () => {
          socket.close();
        };
      }
    }
  }, []);

  // Frame streaming loop: sends captured frames when streaming is active
  useEffect(() => {
    if (!isStreaming) {
      if (streamIntervalRef.current) {
        window.clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      return;
    }

    // Interval to send captured frames
    streamIntervalRef.current = window.setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const frameData = captureFrameRef.current();
        if (frameData) {
          wsRef.current.send(
            JSON.stringify({
              type: 'frame',
              image: frameData,
            })
          );
          frameCountRef.current += 1;
        }
      }
    }, intervalMs);

    // FPS calculation timer
    fpsTimerRef.current = window.setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => {
      if (streamIntervalRef.current) {
        window.clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      if (fpsTimerRef.current) {
        window.clearInterval(fpsTimerRef.current);
        fpsTimerRef.current = null;
      }
    };
  }, [isStreaming, intervalMs, setFps]);

  // Connect on mount or cameraId change; disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    reconnect: connect,
    disconnect,
  };
}
