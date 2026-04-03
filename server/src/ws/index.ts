import type { WebSocket } from 'ws';
import type { WsEvent } from '@hezhang/shared';

// Map of spaceId -> Set of WebSocket connections
const connections = new Map<string, Set<WebSocket>>();

export function addConnection(spaceId: string, ws: WebSocket) {
  if (!connections.has(spaceId)) {
    connections.set(spaceId, new Set());
  }
  connections.get(spaceId)!.add(ws);
}

export function removeConnection(spaceId: string, ws: WebSocket) {
  const set = connections.get(spaceId);
  if (set) {
    set.delete(ws);
    if (set.size === 0) {
      connections.delete(spaceId);
    }
  }
}

export function broadcast(spaceId: string, event: WsEvent, excludeWs?: WebSocket) {
  const set = connections.get(spaceId);
  if (!set) return;

  const message = JSON.stringify(event);
  for (const ws of set) {
    if (ws !== excludeWs && ws.readyState === 1) {
      ws.send(message);
    }
  }
}

export function getConnectionCount(spaceId: string): number {
  return connections.get(spaceId)?.size ?? 0;
}
