import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';
import { config } from '../config.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
    spaceId: string | null;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string };
    user: { userId: string };
  }
}

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(fjwt, {
    secret: config.jwtSecret,
  });

  fastify.decorateRequest('userId', '');
  fastify.decorateRequest('spaceId', null);

  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      request.userId = request.user.userId;

      // Look up user's space
      const db = (await import('../db/index.js')).default;
      const member = db.prepare(
        'SELECT space_id FROM space_members WHERE user_id = ? LIMIT 1'
      ).get(request.userId) as { space_id: string } | undefined;

      request.spaceId = member?.space_id ?? null;
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
