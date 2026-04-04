import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  },
  stt: {
    apiKey: process.env.STT_API_KEY || process.env.DEEPSEEK_API_KEY || '',
    baseUrl: process.env.STT_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.STT_MODEL || 'whisper-1',
  },
  dbPath: process.env.DB_PATH || './data/hezhang.db',
};
