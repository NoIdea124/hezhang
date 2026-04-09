import type { FastifyInstance } from 'fastify';
import { getCards, createCard, updateCard, deleteCard } from '../services/membershipCard.service.js';

export default async function membershipCardRoutes(fastify: FastifyInstance) {
  // Get all cards for the space
  fastify.get('/api/membership-cards', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }
    const cards = getCards(request.spaceId);
    return { cards };
  });

  // Create card
  fastify.post('/api/membership-cards', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const { store_name, balance, note } = request.body as { store_name: string; balance: number; note?: string };

    if (!store_name?.trim()) {
      return reply.code(400).send({ error: '请输入商家名称' });
    }
    if (balance === undefined || balance < 0) {
      return reply.code(400).send({ error: '请输入正确的余额' });
    }

    const card = createCard(request.spaceId, request.userId, {
      store_name: store_name.trim(),
      balance,
      note,
    });
    return { card };
  });

  // Update card
  fastify.put('/api/membership-cards/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as { store_name?: string; balance?: number; note?: string };

    const card = updateCard(id, data);
    if (!card) {
      return reply.code(404).send({ error: '会员卡不存在' });
    }
    return { card };
  });

  // Delete card
  fastify.delete('/api/membership-cards/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = deleteCard(id);
    if (!deleted) {
      return reply.code(404).send({ error: '会员卡不存在' });
    }
    return { success: true };
  });
}
