import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebSocketConnectionStatus } from './types';

export interface UseWebSocketOptions {
  /**
   * Target WebSocket URL. If omitted, defaults to telemetry endpoint or mock mode.
   */
  url?: string;
  /**
   * Whether the socket should connect automatically. Default: true.
   */
  enabled?: boolean;
  /**
   * Initial delay in ms before first reconnect attempt. Default: 1000ms.
   */
  initialDelayMs?: number;
  /**
   * Maximum delay in ms for exponential backoff. Default: 30000ms.
   */
  maxDelayMs?: number;
  /**
   * Exponential backoff multiplier. Default: 1.5.
   */
  backoffFactor?: number;
  /**
   * Max reconnect attempts before closing permanently. Default: Infinity.
   */
  maxRetries?: number;
  /**
   * Callback on receiving a message.
   */
  onMessage?: (data: unknown) => void;
  /**
   * Callback on connection status change.
   */
  onStatusChange?: (status: WebSocketConnectionStatus) => void;
}

export interface UseWebSocketReturn<T = unknown> {
  status: WebSocketConnectionStatus;
  lastMessage: T | null;
  error: Event | null;
  retryCount: number;
  send: (data: string | object) => boolean;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * useWebSocket hook with automatic reconnect, exponential backoff,
 * and connection state (connecting | open | closed).
 */
export function useWebSocket<T = unknown>(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn<T> {
  const {
    enabled = true,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffFactor = 1.5,
    maxRetries = Infinity,
    onMessage,
    onStatusChange,
  } = options;

  const [status, setStatus] = useState<WebSocketConnectionStatus>('closed');
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explicitCloseRef = useRef<boolean>(false);
  const retriesRef = useRef<number>(0);

  const updateStatus = useCallback(
    (newStatus: WebSocketConnectionStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {
        // no-op
      }
    }

    explicitCloseRef.current = false;
    updateStatus('connecting');

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        retriesRef.current = 0;
        setRetryCount(0);
        setError(null);
        updateStatus('open');
      };

      ws.onmessage = (event: MessageEvent) => {
        let parsed: unknown = event.data;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          // keep as raw string
        }
        setLastMessage(parsed as T);
        onMessage?.(parsed);
      };

      ws.onerror = (evt: Event) => {
        setError(evt);
      };

      ws.onclose = () => {
        updateStatus('closed');
        socketRef.current = null;

        // Auto-reconnect with exponential backoff if not closed manually
        if (!explicitCloseRef.current && enabled && retriesRef.current < maxRetries) {
          const delay = Math.min(
            initialDelayMs * Math.pow(backoffFactor, retriesRef.current),
            maxDelayMs
          );
          retriesRef.current += 1;
          setRetryCount(retriesRef.current);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      setError(err instanceof Event ? err : null);
      updateStatus('closed');
    }
  }, [enabled, url, initialDelayMs, maxDelayMs, backoffFactor, maxRetries, onMessage, updateStatus]);

  const disconnect = useCallback(() => {
    explicitCloseRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    updateStatus('closed');
  }, [updateStatus]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    setRetryCount(0);
    connect();
  }, [connect]);

  const send = useCallback((data: string | object): boolean => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      socketRef.current.send(payload);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (enabled && url) {
      connect();
    }
    return () => {
      explicitCloseRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [enabled, url, connect]);

  return {
    status,
    lastMessage,
    error,
    retryCount,
    send,
    reconnect,
    disconnect,
  };
}
