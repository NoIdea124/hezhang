import type { FastifyInstance } from 'fastify';
import { sendCode, verifyCode, upsertUser } from '../services/auth.service.js';
import { getUserSpace } from '../services/space.service.js';

export default async function authRoutes(fastify: FastifyInstance) {
  // Send verification code
  fastify.post('/api/auth/send-code', async (request, reply) => {
    const { phone } = request.body as { phone: string };

    if (!phone || phone.length < 11) {
      return reply.code(400).send({ error: '请输入正确的手机号' });
    }

    sendCode(phone);
    return { success: true, message: 'MVP模式: 验证码为 123456' };
  });

  // Login / Register
  fastify.post('/api/auth/login', async (request, reply) => {
    const { phone, code } = request.body as { phone: string; code: string };

    if (!phone || !code) {
      return reply.code(400).send({ error: '请输入手机号和验证码' });
    }

    if (!verifyCode(phone, code)) {
      return reply.code(401).send({ error: '验证码错误' });
    }

    const user = upsertUser(phone);
    const token = fastify.jwt.sign({ userId: user.id });
    const space = getUserSpace(user.id);

    return {
      token,
      user,
      space,
    };
  });

  // Get current user info
  fastify.get('/api/auth/me', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { getUserById } = await import('../services/auth.service.js');
    const user = getUserById(request.userId);
    const space = getUserSpace(request.userId);

    return { user, space };
  });

  // Update nickname
  fastify.put('/api/auth/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { nickname } = request.body as { nickname: string };
    const trimmed = (nickname || '').trim();
    if (!trimmed) {
      return reply.code(400).send({ error: '昵称不能为空' });
    }
    if (trimmed.length > 20) {
      return reply.code(400).send({ error: '昵称最长20个字符' });
    }
    const { updateNickname } = await import('../services/auth.service.js');
    const user = updateNickname(request.userId, trimmed);
    return { user };
  });
}
