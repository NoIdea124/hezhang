import type { FastifyInstance } from 'fastify';
import { getAllFeedback, createFeedback, deleteFeedback } from '../services/feedback.service.js';

export default async function feedbackRoutes(fastify: FastifyInstance) {
  // Get all feedback (public)
  fastify.get('/api/feedback', {
    preHandler: [fastify.authenticate],
  }, async () => {
    const feedback = getAllFeedback();
    return { feedback };
  });

  // Submit feedback
  fastify.post('/api/feedback', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { content } = request.body as { content: string };

    if (!content?.trim()) {
      return reply.code(400).send({ error: '反馈内容不能为空' });
    }
    if (content.trim().length > 500) {
      return reply.code(400).send({ error: '反馈内容最多500字' });
    }

    const feedback = createFeedback(request.userId, content.trim());
    return { feedback };
  });

  // Delete feedback
  fastify.delete('/api/feedback/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = deleteFeedback(id);
    if (!deleted) {
      return reply.code(404).send({ error: '反馈不存在' });
    }
    return { success: true };
  });
}
