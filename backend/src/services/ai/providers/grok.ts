/**
 * Grok provider via xAI's OpenAI-compatible API
 * Base URL: https://api.x.ai/v1
 */
import OpenAI from 'openai';
import type { AIProvider, Message } from '../types';

export function createGrokProvider(apiKey: string): AIProvider {
  const client = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });

  const toMessages = (history: Message[], systemPrompt?: string): OpenAI.ChatCompletionMessageParam[] => {
    const msgs: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
    for (const m of history || []) {
      if (m.role === 'user') msgs.push({ role: 'user', content: m.content });
      else if (m.role === 'assistant') msgs.push({ role: 'assistant', content: m.content });
    }
    return msgs;
  };

  return {
    async generateResponse(prompt: string, history?: Message[], systemPrompt?: string): Promise<string> {
      const messages = toMessages(history || [], systemPrompt);
      messages.push({ role: 'user', content: prompt });

      const completion = await client.chat.completions.create({
        model: 'grok-2',
        messages,
      });
      return completion.choices[0]?.message?.content ?? '';
    },

    async generateContent(prompt: string, options?: { maxTokens?: number }): Promise<string> {
      const completion = await client.chat.completions.create({
        model: 'grok-2',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens,
      });
      return completion.choices[0]?.message?.content ?? '';
    },
  };
}
