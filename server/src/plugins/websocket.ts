import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';
import { addConnection, removeConnection } from '../ws/index.js';
import db from '../db/index.js';

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(websocket);

  fastify.get('/ws', { websocket: true }, (socket, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(4001, 'Missing token');
      return;
    }

    // Verify JWT
    let userId: string;
    try {
      const decoded = fastify.jwt.verify<{ userId: string }>(token);
      userId = decoded.userId;
    } catch {
      socket.close(4001, 'Invalid token');
      return;
    }

    // Look up space
    const member = db.prepare(
      'SELECT space_id FROM space_members WHERE user_id = ? LIMIT 1'
    ).get(userId) as { space_id: string } | undefined;

    if (!member) {
      socket.close(4002, 'No space');
      return;
    }

    const spaceId = member.space_id;
    addConnection(spaceId, socket);

    // Heartbeat ping every 30s
    const pingInterval = setInterval(() => {
      if (socket.readyState === 1) {
        socket.ping();
      }
    }, 30000);

    socket.on('close', () => {
      clearInterval(pingInterval);
      removeConnection(spaceId, socket);
    });

    socket.on('error', () => {
      clearInterval(pingInterval);
      removeConnection(spaceId, socket);
    });
  });
});
