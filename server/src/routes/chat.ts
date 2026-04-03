import type { FastifyInstance } from 'fastify';
import { processChat } from '../ai/index.js';
import { broadcast } from '../ws/index.js';
import { getExpenseById } from '../services/expense.service.js';
import { getUserById } from '../services/auth.service.js';

export default async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/api/chat', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const { message } = request.body as { message: string };

    if (!message || !message.trim()) {
      return reply.code(400).send({ error: '请输入内容' });
    }

    try {
      const result = await processChat(message.trim(), request.userId, request.spaceId);

      // Broadcast expense changes from AI chat
      if (result.expense && request.spaceId) {
        const full = getExpenseById(result.expense.id!);
        if (full) {
          if (result.intent === 'record') {
            broadcast(request.spaceId, { type: 'expense:created', data: full });
            const user = getUserById(request.userId);
            broadcast(request.spaceId, {
              type: 'notification',
              data: { message: `${user?.nickname || '伴侣'}记了一笔 ¥${full.amount} ${full.category}` },
            });
          }
        }
      }
      if (result.intent === 'delete' && request.spaceId) {
        broadcast(request.spaceId, { type: 'expense:deleted', data: { id: '' } });
      }
      if (result.intent === 'modify' && request.spaceId) {
        broadcast(request.spaceId, { type: 'expense:updated', data: {} as any });
      }

      return result;
    } catch (e: any) {
      console.error('Chat processing error:', e);
      return reply.code(500).send({ error: '处理失败，请稍后重试' });
    }
  });
}
