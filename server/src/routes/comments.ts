import type { FastifyInstance } from 'fastify';
import { getComments, createComment } from '../services/comment.service.js';
import { getExpenseById } from '../services/expense.service.js';
import { broadcast } from '../ws/index.js';
import { getUserById } from '../services/auth.service.js';

export default async function commentRoutes(fastify: FastifyInstance) {
  // Get comments for an expense
  fastify.get('/api/expenses/:id/comments', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const expense = getExpenseById(id);
    if (!expense) {
      return reply.code(404).send({ error: '记录不存在' });
    }
    const comments = getComments(id);
    return { comments };
  });

  // Add comment to an expense
  fastify.post('/api/expenses/:id/comments', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { content } = request.body as { content: string };

    if (!content?.trim()) {
      return reply.code(400).send({ error: '评论不能为空' });
    }

    const expense = getExpenseById(id);
    if (!expense) {
      return reply.code(404).send({ error: '记录不存在' });
    }

    const comment = createComment(id, request.userId, content.trim());

    if (request.spaceId) {
      // Enrich comment with expense context for notifications
      const enriched = {
        ...comment,
        expense_note: expense.note || expense.category,
        expense_category: expense.category,
      };
      broadcast(request.spaceId, { type: 'comment:created', data: enriched });
    }

    return { comment };
  });
}
