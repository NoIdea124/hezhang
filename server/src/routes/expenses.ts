import type { FastifyInstance } from 'fastify';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../services/expense.service.js';
import { broadcast } from '../ws/index.js';
import type { ExpenseCreate, ExpenseUpdate, ExpenseFilter } from '@hezhang/shared';

export default async function expenseRoutes(fastify: FastifyInstance) {
  // Create expense
  fastify.post('/api/expenses', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const data = request.body as ExpenseCreate;

    if (!data.amount || data.amount <= 0) {
      return reply.code(400).send({ error: '请输入正确的金额' });
    }
    if (!data.category) {
      return reply.code(400).send({ error: '请选择分类' });
    }

    const expense = createExpense(request.spaceId, request.userId, data);
    broadcast(request.spaceId!, { type: 'expense:created', data: expense });
    return { expense };
  });

  // Get expenses list
  fastify.get('/api/expenses', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const query = request.query as Record<string, string>;
    const filter: ExpenseFilter = {
      month: query.month,
      category: query.category,
      ownership: query.ownership as any,
      user_id: query.user_id,
      special_budget_id: query.special_budget_id,
    };

    const expenses = getExpenses(request.spaceId, filter);
    return { expenses };
  });

  // Update expense
  fastify.put('/api/expenses/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as ExpenseUpdate;

    const existing = getExpenseById(id);
    if (!existing) {
      return reply.code(404).send({ error: '记录不存在' });
    }

    const expense = updateExpense(id, request.userId, data);
    if (expense && request.spaceId) {
      broadcast(request.spaceId, { type: 'expense:updated', data: expense });
    }
    return { expense };
  });

  // Delete expense
  fastify.delete('/api/expenses/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = getExpenseById(id);
    if (!existing) {
      return reply.code(404).send({ error: '记录不存在' });
    }

    deleteExpense(id);
    if (request.spaceId) {
      broadcast(request.spaceId, { type: 'expense:deleted', data: { id } });
    }
    return { success: true };
  });
}
