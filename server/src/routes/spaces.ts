import type { FastifyInstance } from 'fastify';
import {
  createSpace,
  joinSpace,
  getUserSpace,
  getSpaceMembers,
  updateSpaceName,
} from '../services/space.service.js';

export default async function spaceRoutes(fastify: FastifyInstance) {
  // Create space
  fastify.post('/api/spaces', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    // Check if user already has a space
    const existing = getUserSpace(request.userId);
    if (existing) {
      return reply.code(400).send({ error: '你已经有一个共同空间了' });
    }

    const { name } = (request.body as { name?: string }) || {};
    const space = createSpace(request.userId, name);
    return { space };
  });

  // Join space by invite code
  fastify.post('/api/spaces/join', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const existing = getUserSpace(request.userId);
    if (existing) {
      return reply.code(400).send({ error: '你已经有一个共同空间了' });
    }

    const { invite_code } = request.body as { invite_code: string };
    if (!invite_code) {
      return reply.code(400).send({ error: '请输入邀请码' });
    }

    const space = joinSpace(request.userId, invite_code.toUpperCase());
    if (!space) {
      return reply.code(404).send({ error: '邀请码无效或空间已满' });
    }

    return { space };
  });

  // Get current space info
  fastify.get('/api/spaces/current', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const space = getUserSpace(request.userId);
    if (!space) {
      return reply.code(404).send({ error: '你还没有加入任何空间' });
    }

    const members = getSpaceMembers(space.id);
    return { space, members };
  });

  // Update space name
  fastify.put('/api/spaces/current', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '你还没有加入任何空间' });
    }
    const { name } = request.body as { name: string };
    const trimmed = (name || '').trim();
    if (!trimmed) {
      return reply.code(400).send({ error: '空间名称不能为空' });
    }
    if (trimmed.length > 20) {
      return reply.code(400).send({ error: '空间名称最长20个字符' });
    }
    const space = updateSpaceName(request.spaceId, request.userId, trimmed);
    if (!space) {
      return reply.code(403).send({ error: '只有创建者可以修改空间名称' });
    }
    return { space };
  });
}
