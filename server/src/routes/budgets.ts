import type { FastifyInstance } from 'fastify';
import {
  createBudget,
  getBudgetByMonth,
  getBudgetById,
  updateBudget,
  confirmBudget,
  deleteBudget,
} from '../services/budget.service.js';
import type { BudgetCreate } from '@hezhang/shared';
import { broadcast } from '../ws/index.js';

export default async function budgetRoutes(fastify: FastifyInstance) {
  // Create budget
  fastify.post('/api/budgets', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const data = request.body as BudgetCreate;

    if (!data.month) {
      return reply.code(400).send({ error: '请选择月份' });
    }
    if (!data.total_amount || data.total_amount <= 0) {
      return reply.code(400).send({ error: '请输入正确的预算金额' });
    }

    try {
      const budget = createBudget(request.spaceId, request.userId, data);
      broadcast(request.spaceId!, { type: 'budget:updated', data: budget });
      return { budget };
    } catch (e: any) {
      if (e.message?.includes('UNIQUE constraint')) {
        return reply.code(400).send({ error: '该月预算已存在' });
      }
      throw e;
    }
  });

  // Get budget with spending
  fastify.get('/api/budgets', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const query = request.query as Record<string, string>;
    const now = new Date();
    const month = query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budget = getBudgetByMonth(request.spaceId, month);
    return { budget };
  });

  // Update budget
  fastify.put('/api/budgets/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const { id } = request.params as { id: string };
    const existing = getBudgetById(id);
    if (!existing) {
      return reply.code(404).send({ error: '预算不存在' });
    }

    const data = request.body as { total_amount?: number; categories?: any[] };
    const budget = updateBudget(id, request.spaceId, data);
    if (budget) {
      broadcast(request.spaceId!, { type: 'budget:updated', data: budget });
    }
    return { budget };
  });

  // Confirm budget
  fastify.post('/api/budgets/:id/confirm', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const { id } = request.params as { id: string };
    const existing = getBudgetById(id);
    if (!existing) {
      return reply.code(404).send({ error: '预算不存在' });
    }

    const budget = confirmBudget(id, request.userId);
    if (budget) {
      broadcast(request.spaceId!, { type: 'budget:confirmed', data: budget });
    }
    return { budget };
  });

  // Delete budget
  fastify.delete('/api/budgets/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const { id } = request.params as { id: string };
    const existing = getBudgetById(id);
    if (!existing) {
      return reply.code(404).send({ error: '预算不存在' });
    }

    deleteBudget(id, request.spaceId);
    broadcast(request.spaceId!, { type: 'budget:updated', data: existing });
    return { success: true };
  });
}
