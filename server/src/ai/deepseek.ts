import OpenAI from 'openai';
import { config } from '../config.js';

const client = new OpenAI({
  apiKey: config.deepseek.apiKey,
  baseURL: config.deepseek.baseUrl,
});

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: config.deepseek.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.1,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}
