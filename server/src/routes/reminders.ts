import type { FastifyInstance } from 'fastify';
import { getUnreadReminders, createReminder, markAsRead } from '../services/reminder.service.js';
import { getSpaceMembers } from '../services/space.service.js';
import { getUserById } from '../services/auth.service.js';
import { broadcast } from '../ws/index.js';

export default async function reminderRoutes(fastify: FastifyInstance) {
  // Get my unread reminders
  fastify.get('/api/reminders', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const reminders = getUnreadReminders(request.userId);
    return { reminders };
  });

  // Create reminder (send to partner)
  fastify.post('/api/reminders', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const { content } = request.body as { content: string };
    if (!content?.trim()) {
      return reply.code(400).send({ error: '提醒内容不能为空' });
    }

    // Find partner
    const members = getSpaceMembers(request.spaceId);
    const partner = members.find((m) => m.user_id !== request.userId);
    if (!partner) {
      return reply.code(400).send({ error: '还没有伴侣加入空间' });
    }

    const reminder = createReminder(request.spaceId, request.userId, partner.user_id, content.trim());

    // Real-time push
    broadcast(request.spaceId, { type: 'reminder:created', data: reminder });
    const user = getUserById(request.userId);
    broadcast(request.spaceId, {
      type: 'notification',
      data: { message: `${user?.nickname || '伴侣'}给你发了一条提醒` },
    });

    return { reminder };
  });

  // Mark as read
  fastify.put('/api/reminders/:id/read', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const ok = markAsRead(id, request.userId);
    if (!ok) {
      return reply.code(404).send({ error: '提醒不存在' });
    }
    return { success: true };
  });
}
