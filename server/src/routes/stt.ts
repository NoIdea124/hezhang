import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';

export default async function sttRoutes(fastify: FastifyInstance) {
  // Accept raw audio upload and transcribe via OpenAI-compatible Whisper API
  fastify.post('/api/stt', {
    preHandler: [fastify.authenticate],
    config: {
      // Allow larger payloads for audio (up to 10 MB)
      rawBody: true,
    },
  }, async (request, reply) => {
    if (!config.stt.apiKey) {
      return reply.code(501).send({ error: '语音识别未配置' });
    }

    const contentType = request.headers['content-type'] || '';
    const body = request.body as Buffer;

    if (!body || !Buffer.isBuffer(body) && !ArrayBuffer.isView(body)) {
      return reply.code(400).send({ error: '请上传音频数据' });
    }

    // Determine file extension from content type
    let ext = 'webm';
    if (contentType.includes('mp4') || contentType.includes('m4a')) ext = 'm4a';
    else if (contentType.includes('wav')) ext = 'wav';
    else if (contentType.includes('ogg')) ext = 'ogg';
    else if (contentType.includes('mpeg')) ext = 'mp3';

    // Build multipart form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([body], { type: contentType || 'audio/webm' });
    formData.append('file', blob, `audio.${ext}`);
    formData.append('model', config.stt.model);
    formData.append('language', 'zh');

    try {
      const res = await fetch(`${config.stt.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.stt.apiKey}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.text();
        fastify.log.error(`STT API error: ${res.status} ${errBody}`);
        return reply.code(502).send({ error: '语音识别失败' });
      }

      const result = await res.json() as { text: string };
      return { text: result.text || '' };
    } catch (e: any) {
      fastify.log.error(`STT request failed: ${e.message}`);
      return reply.code(502).send({ error: '语音识别服务不可用' });
    }
  });
}
