import OpenAI from 'openai';
import type { AIProvider, Message } from '../types';

export function createOpenAIProvider(apiKey: string): AIProvider {
  const client = new OpenAI({ apiKey });

  const toOpenAIMessages = (history: Message[], systemPrompt?: string): OpenAI.ChatCompletionMessageParam[] => {
    const msgs: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      msgs.push({ role: 'system', content: systemPrompt });
    }
    for (const m of history || []) {
      if (m.role === 'user') msgs.push({ role: 'user', content: m.content });
      else if (m.role === 'assistant') msgs.push({ role: 'assistant', content: m.content });
    }
    return msgs;
  };

  return {
    async generateResponse(prompt: string, history?: Message[], systemPrompt?: string): Promise<string> {
      const messages = toOpenAIMessages(history || [], systemPrompt);
      messages.push({ role: 'user', content: prompt });

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
      });
      return completion.choices[0]?.message?.content ?? '';
    },

    async generateContent(prompt: string, options?: { maxTokens?: number }): Promise<string> {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens,
      });
      return completion.choices[0]?.message?.content ?? '';
    },
  };
}
