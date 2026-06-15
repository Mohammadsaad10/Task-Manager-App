'use client';

import { useEffect, useRef } from 'react';

type SSEEventHandler = (data: unknown) => void;

interface UseSSEOptions {
  enabled: boolean; // Whether the user is authenticated
  onTaskCreated?: SSEEventHandler;
  onTaskUpdated?: SSEEventHandler;
  onTaskDeleted?: SSEEventHandler;
}

/** Subscribe to Server-Sent Events for real-time task updates */
export function useSSE({ enabled, onTaskCreated, onTaskUpdated, onTaskDeleted }: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = `${baseUrl}/events`;

    // EventSource with credentials sends cookies automatically
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('task:created', (e) => {
      try {
        const data = JSON.parse(e.data);
        onTaskCreated?.(data);
      } catch { /* ignore parse errors */ }
    });

    eventSource.addEventListener('task:updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        onTaskUpdated?.(data);
      } catch { /* ignore */ }
    });

    eventSource.addEventListener('task:deleted', (e) => {
      try {
        const data = JSON.parse(e.data);
        onTaskDeleted?.(data);
      } catch { /* ignore */ }
    });

    eventSource.addEventListener('connected', () => {
      // SSE connected
    });

    eventSource.onerror = () => {
      // SSE connection error — browser will auto-reconnect
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [enabled, onTaskCreated, onTaskUpdated, onTaskDeleted]);
}
