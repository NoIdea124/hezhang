import type { FastifyInstance } from 'fastify';
import { getAllFeedback, createFeedback } from '../services/feedback.service.js';

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
}
