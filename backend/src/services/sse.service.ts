import { Response } from 'express';

type SSEClient = {
  id: string;
  userId: string;
  role: string;
  res: Response;
};

/** In-memory map of active SSE client connections */
// NOTE: For high-scale apps, consider Map<userId, Set<SSEClient>> for O(1) broadcasts
const clients: Map<string, SSEClient> = new Map();
let heartbeatInterval: NodeJS.Timeout | null = null;

/** Add a new SSE client connection */
export function addClient(
  clientId: string,
  userId: string,
  role: string,
  res: Response
): void {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Send initial connection event
  res.write(
    `event: connected\ndata: ${JSON.stringify({ message: 'Connected to event stream' })}\n\n`
  );

  // Store client
  clients.set(clientId, { id: clientId, userId, role, res });

  // Remove client on disconnect
  res.on('close', () => {
    clients.delete(clientId);
  });
}

/** Broadcast an event to a specific user's connections (and admins) */
export function broadcastToUser(userId: string, event: string, data: object): void {
  clients.forEach((client) => {
    if (client.userId === userId || client.role === 'ADMIN') {
      try {
        client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch {
        clients.delete(client.id);
      }
    }
  });
}

/** Start heartbeat to keep connections alive (call once on server start) */
export function startHeartbeat(): void {
  if (heartbeatInterval) return;

  heartbeatInterval = setInterval(() => {
    clients.forEach((client) => {
      try {
        client.res.write(`:heartbeat\n\n`);
      } catch {
        clients.delete(client.id);
      }
    });
  }, 30000); // Every 30 seconds
}

/** Stop heartbeat (for graceful shutdown) */
export function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

/** Get the number of active SSE connections */
export function getClientCount(): number {
  return clients.size;
}
