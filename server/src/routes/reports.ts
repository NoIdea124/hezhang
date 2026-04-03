import type { FastifyInstance } from 'fastify';
import { getReportData } from '../services/report.service.js';

export default async function reportRoutes(fastify: FastifyInstance) {
  fastify.get('/api/reports', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (!request.spaceId) {
      return reply.code(400).send({ error: '请先加入一个共同空间' });
    }

    const query = request.query as Record<string, string>;
    const now = new Date();
    const month = query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const report = getReportData(request.spaceId, month);
    return { report };
  });
}
