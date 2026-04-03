import type { FastifyInstance } from 'fastify';
import { CATEGORIES } from '@hezhang/shared';
import {
  getCustomCategories,
  addCustomCategory,
  deleteCustomCategory,
} from '../services/category.service.js';

export default async function categoryRoutes(fastify: FastifyInstance) {
  // Get all categories (builtin + custom)
  fastify.get('/api/categories', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }
    const custom = getCustomCategories(request.spaceId);
    return { builtin: CATEGORIES, custom };
  });

  // Add custom category
  fastify.post('/api/categories', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }
    const { name, icon } = request.body as { name: string; icon: string };
    try {
      const category = addCustomCategory(request.spaceId, name, icon);
      return { category };
    } catch (e: any) {
      return reply.code(400).send({ error: e.message });
    }
  });

  // Delete custom category
  fastify.delete('/api/categories/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }
    const { id } = request.params as { id: string };
    const ok = deleteCustomCategory(id, request.spaceId);
    if (!ok) {
      return reply.code(404).send({ error: '分类不存在' });
    }
    return { success: true };
  });
}
