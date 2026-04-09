import type { FastifyInstance } from 'fastify';
import {
  getSpecialBudgets,
  getSpecialBudgetById,
  createSpecialBudget,
  updateSpecialBudget,
  deleteSpecialBudget,
} from '../services/specialBudget.service.js';

export default async function specialBudgetRoutes(fastify: FastifyInstance) {
  // Get all special budgets for the space
  fastify.get('/api/special-budgets', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }
    const budgets = getSpecialBudgets(request.spaceId);
    return { budgets };
  });

  // Create special budget
  fastify.post('/api/special-budgets', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const { name, icon, total_amount } = request.body as { name: string; icon?: string; total_amount: number };

    if (!name?.trim()) {
      return reply.code(400).send({ error: '请输入项目名称' });
    }
    if (!total_amount || total_amount <= 0) {
      return reply.code(400).send({ error: '请输入正确的预算金额' });
    }

    const budget = createSpecialBudget(request.spaceId, {
      name: name.trim(),
      icon,
      total_amount,
    });
    return { budget };
  });

  // Update special budget
  fastify.put('/api/special-budgets/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { name?: string; icon?: string; total_amount?: number };

    const budget = updateSpecialBudget(id, data);
    if (!budget) {
      return reply.code(404).send({ error: '专项预算不存在' });
    }
    return { budget };
  });

  // Delete special budget
  fastify.delete('/api/special-budgets/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = deleteSpecialBudget(id);
    if (!deleted) {
      return reply.code(404).send({ error: '专项预算不存在' });
    }
    return { success: true };
  });
}
